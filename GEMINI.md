# Gemini CLI 指导手册 - 数智化企业展示平台 (Go + Gin)

这个项目是一个现代化的企业数智化转型展示平台，后端基于 Go 语言和 Gin 框架开发。

## 项目概述
该项目提供了一个具有多个功能页面的 Web 界面（如产品、解决方案、平台介绍等），并集成了一个在线咨询系统。

### 核心技术栈
- **后端**: Go 1.26+, Gin 框架
- **前端**: 原生 HTML/CSS/JS, [Lucide](https://lucide.dev/) 图标库
- **静态资源**: 使用 `go:embed` 嵌入 HTML 静态资源和模板
- **功能**:
  - 响应式网页布局
  - 在线咨询表单提交
  - 自动发送 SMTP 邮件通知
  - 咨询信息持久化存储 (JSON 格式)

## 快速开始

### 运行环境
- 已安装 Go 1.26 或更高版本。
- 项目依赖项已在 `go.mod` 中列出。

### 运行命令
在项目根目录下执行以下命令：

```bash
# 整理依赖
go mod tidy

# 启动服务
go run main.go
```
服务启动后默认监听在 `http://localhost:9000`。

### 关键配置
- **`config.json`**: 包含 SMTP 邮件发送配置（服务器、端口、账号、密码）。
- **`consultations.json`**: 存储用户提交的咨询信息。

## 目录结构
- `/main.go`: 服务器入口文件，包含路由定义、邮件发送和文件持久化逻辑。
- `/templates/`: 存放页面模板 (.tmpl 文件)。
  - `/partials/`: 存放公共组件，如 header 和 footer。
- `/html/`: 静态资源文件。
  - `/css/`: 样式表。
  - `/js/`: 客户端脚本，包含表单提交和 UI 交互逻辑。
  - `/images/`: 图片资源。

## 开发与扩展规范

### 增加新页面
1. 在 `templates/` 目录下创建对应的 `.tmpl` 文件。
2. 在 `main.go` 的 `main()` 函数中添加相应的路由处理。
3. 如果需要侧边栏或其他静态交互，在 `html/js/main.js` 中添加相应逻辑。

### 咨询系统
- 所有的咨询按钮应包含 `consult-btn` 类，以便 JS 自动绑定弹窗逻辑。
- 提交的数据会发送到 `POST /api/consult`。
- 修改邮件模板可定位到 `main.go` 中的 `sendEmail` 函数。

## 注意事项
- 生产环境下请务必配置正确的 `config.json` SMTP 信息。
- 确保 `consultations.json` 具有写权限。
- 项目使用了 `InsecureSkipVerify: true` 的 TLS 配置，在特定安全场景下请根据需求调整。
