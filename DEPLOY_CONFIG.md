# 部署配置说明

## 环境变量

部署到 Render 后，需要在前端代码中配置正确的 WebSocket 地址。

### 修改 WebSocket 地址

打开 `src/hooks/useWebSocket.js`，找到这一行：

```javascript
const wsUrl = import.meta.env.PROD 
    ? 'wss://websocket-chat-server.onrender.com' // 生产环境
    : 'ws://localhost:3001' // 开发环境
```

将 `websocket-chat-server.onrender.com` 替换为你在 Render 上实际的应用域名。

### 如何获取你的 Render 域名

1. 登录 Render Dashboard
2. 找到你的 Web Service
3. 复制顶部显示的 URL（例如：`https://your-app-name.onrender.com`）
4. 在代码中使用 `wss://your-app-name.onrender.com`（注意是 wss:// 不是 https://）

### 示例

如果你的 Render URL 是：`https://my-chat-app.onrender.com`

那么 WebSocket 地址应该是：`wss://my-chat-app.onrender.com`

```javascript
const wsUrl = import.meta.env.PROD 
    ? 'wss://my-chat-app.onrender.com' 
    : 'ws://localhost:3001'
```

## 重新部署

修改后，提交并推送代码：

```bash
git add .
git commit -m "更新生产环境WebSocket地址"
git push
```

Render 会自动检测到更改并重新部署。
