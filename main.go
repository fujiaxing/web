package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"os"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// ConsultRequest 咨询请求结构
type ConsultRequest struct {
	Name    string `json:"name" binding:"required"`
	Phone   string `json:"phone" binding:"required"`
	Email   string `json:"email"`
	Content string `json:"content"`
	Time    string `json:"time"`
}

var (
	consultFile = "consultations.json"
	fileMutex   sync.Mutex
)

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

func main() {
	r := gin.Default()
	r.Use(CORSMiddleware())

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

	// 静态资源服务
	r.Static("/", "./html")

	fmt.Println("Server starting on :8080...")
	r.Run(":8080")
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
	// --- 配置区 ---
	from := "fjx@hbyonyou.cn"    // 发件人邮箱
	password := "E2SmFsS8suTcRgd4"    // 邮箱授权码/密码
	to := "service@hbyonyou.cn"    // 收件人邮箱 (指定邮箱)
	smtpHost := "smtp.exmail.qq.com"      // SMTP 服务器 (如 smtp.qq.com)
	smtpPort := "465"                   // SMTP 端口
	// --------------

	// 如果未配置，则跳过发送
	if from == "fjx@hbyonyou.cn" {
		log.Println("Email not sent: SMTP credentials not configured")
		return
	}

	subject := "Subject: 【立即咨询】来自客户的数智化需求\n"
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	body := fmt.Sprintf(`
		<h3>收到新的咨询信息</h3>
		<p><b>姓名：</b>%s</p>
		<p><b>电话：</b>%s</p>
		<p><b>邮箱：</b>%s</p>
		<p><b>内容：</b>%s</p>
		<p><b>提交时间：</b>%s</p>
	`, req.Name, req.Phone, req.Email, req.Content, req.Time)

	msg := []byte(subject + mime + body)
	auth := smtp.PlainAuth("", from, password, smtpHost)

	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, msg)
	if err != nil {
		log.Printf("Email send failed: %v", err)
		return
	}
	log.Println("Email sent successfully")
}
