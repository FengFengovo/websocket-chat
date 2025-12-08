# WebSocket 实时聊天室

一个基于 React + Vite + WebSocket 的实时聊天应用。

## 功能特性

- ✨ 无需登录，输入昵称即可使用
- 🏠 创建房间并生成唯一房间码
- 🚪 通过房间码加入已有房间
- 💬 实时聊天功能
- 👥 显示在线用户列表
- 📱 响应式设计，支持移动端

## 技术栈

- **前端**: React 18 + Vite
- **后端**: Node.js + Express + WebSocket (ws)
- **样式**: CSS3

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动 WebSocket 服务器

```bash
npm run server
```

服务器将运行在 `http://localhost:3001`

### 3. 启动前端开发服务器

打开新的终端窗口，运行：

```bash
npm run dev
```

前端将运行在 `http://localhost:3000`

### 4. 使用应用

1. 在浏览器中打开 `http://localhost:3000`
2. 输入你的昵称
3. 选择"创建新房间"或输入房间码"加入房间"
4. 开始聊天！

## 项目结构

```
websocket-chat/
├── server/
│   └── index.js          # WebSocket 服务器
├── src/
│   ├── App.jsx           # 主应用组件
│   ├── App.css           # 应用样式
│   ├── main.jsx          # React 入口
│   └── index.css         # 全局样式
├── index.html            # HTML 模板
├── vite.config.js        # Vite 配置
└── package.json          # 项目配置
```

## 使用说明

### 创建房间
1. 输入昵称
2. 点击"创建新房间"
3. 系统会生成一个 6 位房间码
4. 分享房间码给其他人

### 加入房间
1. 输入昵称
2. 输入房间码
3. 点击"加入房间"
4. 进入聊天室

### 聊天
- 在输入框中输入消息
- 按回车或点击"发送"按钮发送消息
- 可以看到所有在线用户
- 实时接收其他用户的消息

## 注意事项

- 确保同时运行 WebSocket 服务器和前端开发服务器
- 房间在所有用户离开后会自动删除
- 刷新页面会断开连接，需要重新加入房间

## 开发

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## License

MIT
