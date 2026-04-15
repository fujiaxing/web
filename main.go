package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	// 创建一个默认的路由引擎
	r := gin.Default()

	// 静态资源服务，指定路由路径和本地目录
	r.Static("/", "./html")

	// 启动服务器，默认监听 8080 端口
	r.Run(":8080")
}
