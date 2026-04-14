package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	// 创建一个默认的路由引擎
	r := gin.Default()

	// 定义一个 GET 请求路由
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Hello from Gin Web Framework!",
			"status":  "success",
		})
	})

	// 定义另一个路由示例
	r.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})

	// 启动服务器，默认监听 8080 端口
	r.Run(":8080")
}
