package main

import (
	"crypto/tls"
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"io/fs"
	"log"
	"net/http"
	"net/smtp"
	"os"
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
)

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
	// 添加图片目录的静态服务
	if sub, err := fs.Sub(staticFS, "images"); err == nil {
		r.StaticFS("/images", http.FS(sub))
	}

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
