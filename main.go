package main

import (
	"crypto/tls"
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"image"
	_ "image/gif"
	"image/jpeg"
	_ "image/png"
	"io/fs"
	"log"
	"net/http"
	"net/smtp"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

//go:embed html templates
var embeddedFiles embed.FS

// ConsultRequest 咨询请求结构
type ConsultRequest struct {
	Name    string `json:"name" binding:"required"`
	Phone   string `json:"phone" binding:"required"`
	Email   string `json:"email"`
	Company string `json:"company"`
	Needs   string `json:"needs"`
	Content string `json:"content"`
	Time    string `json:"time"`
}

// Config 配置结构体
type Config struct {
	SMTP struct {
		From     string `json:"from"`
		Password string `json:"password"`
		To       string `json:"to"`
		Host     string `json:"host"`
		Port     string `json:"port"`
	} `json:"smtp"`
}

var (
	consultFile  = "consultations.json"
	configFile   = "config.json"
	fileMutex    sync.Mutex
	globalConfig Config
	// 信号量：限制同时处理图片的并发数，防止大图解压撑爆内存
	imageSemaphore = make(chan struct{}, 2)
)

const maxCompressSize = 5 * 1024 * 1024 // 超过 5MB 的图片不执行动态压缩，直接透传

// loadConfig 从文件加载配置
func loadConfig() error {
	data, err := os.ReadFile(configFile)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, &globalConfig)
}

// CORS 中间件
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

// CacheControlMiddleware 缓存控制中间件
func CacheControlMiddleware(maxAge int) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 根据文件类型设置不同的缓存策略
		switch {
		case hasExt(c.Request.URL.Path, ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"):
			// 图片文件设置较长的缓存时间
			c.Header("Cache-Control", fmt.Sprintf("public, max-age=%d", maxAge)) // 默认缓存7天
			c.Header("Expires", time.Now().Add(time.Duration(maxAge)*time.Second).Format(http.TimeFormat))
		case hasExt(c.Request.URL.Path, ".css", ".js"):
			// CSS和JS文件也设置缓存
			c.Header("Cache-Control", fmt.Sprintf("public, max-age=%d", maxAge))
		case hasExt(c.Request.URL.Path, ".ico", ".woff", ".woff2", ".ttf"):
			// 字体和图标文件也设置缓存
			c.Header("Cache-Control", fmt.Sprintf("public, max-age=%d", maxAge))
		default:
			// 其他文件不缓存
			c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
		}
		c.Next()
	}
}

// hasExt 检查文件是否有指定扩展名
func hasExt(path string, exts ...string) bool {
	lowerPath := strings.ToLower(path)
	for _, ext := range exts {
		if strings.HasSuffix(lowerPath, strings.ToLower(ext)) {
			return true
		}
	}
	return false
}

func main() {
	// 启动时加载配置
	if err := loadConfig(); err != nil {
		log.Printf("Warning: failed to load config: %v", err)
	}

	r := gin.Default()

	// 从嵌入的文件系统加载模板
	tmpl := template.Must(template.ParseFS(embeddedFiles, "templates/*.tmpl", "templates/partials/*.tmpl"))
	r.SetHTMLTemplate(tmpl)

	r.Use(CORSMiddleware())

	// 添加缓存控制中间件，设置图片等资源缓存7天 (7*24*3600秒)
	r.Use(CacheControlMiddleware(7 * 24 * 3600))

	// 从嵌入的文件系统提供静态资源
	staticFS, _ := fs.Sub(embeddedFiles, "html")

	// 分别挂载子目录，确保 Gin 处理路径时不会出现双斜杠或找不到文件的问题
	if sub, err := fs.Sub(staticFS, "js"); err == nil {
		r.StaticFS("/js", http.FS(sub))
	}
	if sub, err := fs.Sub(staticFS, "css"); err == nil {
		r.StaticFS("/css", http.FS(sub))
	}
	// 动态图像处理路由，支持 q (quality) 参数
	r.GET("/images/*filepath", func(c *gin.Context) {
		path := c.Param("filepath")
		qStr := c.Query("q")

		// 移除开头的斜杠
		cleanPath := strings.TrimPrefix(path, "/")
		fullPath := filepath.Join("html/images", cleanPath)

		// 1. 基础检查：获取文件信息
		f, err := embeddedFiles.Open(fullPath)
		if err != nil {
			c.AbortWithStatus(http.StatusNotFound)
			return
		}
		defer f.Close()

		fi, err := f.Stat()
		if err != nil {
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		// 2. 如果没有质量参数，或者文件太大(>5MB)，直接提供原始文件流
		if qStr == "" || fi.Size() > maxCompressSize {
			c.DataFromReader(http.StatusOK, fi.Size(), http.DetectContentType([]byte(cleanPath)), f, nil)
			return
		}

		quality, err := strconv.Atoi(qStr)
		if err != nil || quality <= 0 || quality > 100 {
			quality = 80
		}

		// 3. 仅对 .jpg 或 .jpeg 执行压缩逻辑
		ext := strings.ToLower(filepath.Ext(cleanPath))
		if ext == ".jpg" || ext == ".jpeg" {
			// 尺寸预检：先读取元数据，不解码全图
			config, _, err := image.DecodeConfig(f)
			if err == nil {
				// 如果分辨率超过 3000 像素，为了内存安全，不进行动态处理
				if config.Width > 3000 || config.Height > 3000 {
					// 重新读取原图数据返回
					data, _ := embeddedFiles.ReadFile(fullPath)
					c.Data(http.StatusOK, "image/jpeg", data)
					return
				}
			}
			
			// 重置文件指针位置（由于 DecodeConfig 已经读了头部数据）
			// embed.FS 的文件流不支持 Seek，所以我们需要重新打开文件
			f.Close()
			f, err = embeddedFiles.Open(fullPath)
			if err != nil {
				data, _ := embeddedFiles.ReadFile(fullPath)
				c.Data(http.StatusOK, "image/jpeg", data)
				return
			}
			defer f.Close()

			// 获取信号量：如果已有2个任务在处理，则在此阻塞，直到其他任务完成
			imageSemaphore <- struct{}{}
			defer func() { <-imageSemaphore }()

			img, _, err := image.Decode(f)
			if err != nil {
				// 解码失败，回退到原始输出
				data, _ := embeddedFiles.ReadFile(fullPath)
				c.Data(http.StatusOK, http.DetectContentType(data), data)
				return
			}

			// 动态压缩并输出
			c.Header("Content-Type", "image/jpeg")
			err = jpeg.Encode(c.Writer, img, &jpeg.Options{Quality: quality})
			if err != nil {
				log.Printf("JPEG compression failed: %v", err)
			}
			return
		}

		// 其他格式直接返回
		c.DataFromReader(http.StatusOK, fi.Size(), http.DetectContentType([]byte(cleanPath)), f, nil)
	})

	// 页面路由
	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.tmpl", gin.H{
			"Title": "首页",
		})
	})

	r.GET("/products", func(c *gin.Context) {
		c.HTML(http.StatusOK, "products.tmpl", gin.H{
			"Title": "产品与服务",
		})
	})

	r.GET("/solutions", func(c *gin.Context) {
		c.HTML(http.StatusOK, "solutions.tmpl", gin.H{
			"Title": "行业解决方案",
		})
	})

	r.GET("/platform", func(c *gin.Context) {
		c.HTML(http.StatusOK, "platform.tmpl", gin.H{
			"Title": "数智平台",
		})
	})

	r.GET("/about", func(c *gin.Context) {
		c.HTML(http.StatusOK, "about.tmpl", gin.H{
			"Title": "关于我们",
		})
	})

	// 1. 存储并发送咨询信息的 API
	r.POST("/api/consult", func(c *gin.Context) {
		var req ConsultRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
			return
		}

		req.Time = time.Now().Format("2006-01-02 15:04:05")

		// A. 存储相关信息到本地 JSON
		if err := saveConsultation(req); err != nil {
			log.Printf("Save error: %v", err)
		}

		// B. 发送到指定邮箱 (异步执行)
		go sendEmail(req)

		c.JSON(http.StatusOK, gin.H{
			"message": "咨询信息已提交，我们会尽快与您联系！",
		})
	})

	fmt.Println("Server starting on :9000...")
	r.Run(":9000")
}

// saveConsultation 将咨询信息保存到 JSON 文件
func saveConsultation(req ConsultRequest) error {
	fileMutex.Lock()
	defer fileMutex.Unlock()

	var consultations []ConsultRequest
	data, err := os.ReadFile(consultFile)
	if err == nil {
		json.Unmarshal(data, &consultations)
	}

	consultations = append(consultations, req)
	newData, err := json.MarshalIndent(consultations, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(consultFile, newData, 0644)
}

// sendEmail 发送邮件 (需要配置真实的 SMTP 信息)
func sendEmail(req ConsultRequest) {
	// 从全局配置读取
	from := globalConfig.SMTP.From
	password := globalConfig.SMTP.Password
	to := globalConfig.SMTP.To
	smtpHost := globalConfig.SMTP.Host
	smtpPort := globalConfig.SMTP.Port

	// 如果未配置，则跳过发送
	if from == "" || password == "" {
		log.Println("Email not sent: SMTP credentials not configured")
		return
	}

	header := make(map[string]string)
	header["From"] = from
	header["To"] = to
	header["Subject"] = "【立即咨询】来自客户的数智化需求"
	header["MIME-Version"] = "1.0"
	header["Content-Type"] = "text/html; charset=\"UTF-8\""

	message := ""
	for k, v := range header {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}

	body := fmt.Sprintf(`
		<h3>收到新的咨询信息</h3>
		<p><b>姓名：</b>%s</p>
		<p><b>电话：</b>%s</p>
		<p><b>公司：</b>%s</p>
		<p><b>需求：</b>%s</p>
		<p><b>提交时间：</b>%s</p>
	`, req.Name, req.Phone, req.Company, req.Needs, req.Time)

	message += "\r\n" + body

	auth := smtp.PlainAuth("", from, password, smtpHost)

	// TLS config
	tlsconfig := &tls.Config{
		InsecureSkipVerify: true,
		ServerName:         smtpHost,
	}

	// Connect to the SMTP Server
	conn, err := tls.Dial("tcp", smtpHost+":"+smtpPort, tlsconfig)
	if err != nil {
		log.Printf("Email TLS dial failed: %v", err)
		return
	}

	client, err := smtp.NewClient(conn, smtpHost)
	if err != nil {
		log.Printf("Email new client failed: %v", err)
		return
	}

	// Auth
	if err = client.Auth(auth); err != nil {
		log.Printf("Email auth failed: %v", err)
		return
	}

	// To && From
	if err = client.Mail(from); err != nil {
		log.Printf("Email mail from failed: %v", err)
		return
	}

	if err = client.Rcpt(to); err != nil {
		log.Printf("Email rcpt to failed: %v", err)
		return
	}

	// Data
	w, err := client.Data()
	if err != nil {
		log.Printf("Email data failed: %v", err)
		return
	}

	_, err = w.Write([]byte(message))
	if err != nil {
		log.Printf("Email write failed: %v", err)
		return
	}

	err = w.Close()
	if err != nil {
		log.Printf("Email close failed: %v", err)
		return
	}

	client.Quit()
	log.Println("Email sent successfully")
}
