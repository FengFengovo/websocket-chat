import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// 提供静态文件（生产环境）
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')));

    // 所有路由都返回 index.html（支持前端路由）
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
}

// 存储房间信息
const rooms = new Map();

// 存储文件块缓存
const fileChunks = new Map();

// 生成随机房间码
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// 验证房间号格式（英文数字混合，3-12位）
function isValidRoomCode(code) {
    return /^[A-Z0-9]{3,12}$/.test(code);
}

// 广播消息到房间内所有用户
function broadcastToRoom(roomCode, message, excludeWs = null) {
    const room = rooms.get(roomCode);
    if (room) {
        room.clients.forEach(client => {
            if (client !== excludeWs && client.readyState === 1) {
                client.send(JSON.stringify(message));
            }
        });
    }
}

wss.on('connection', (ws) => {
    console.log('新客户端连接');

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());

            switch (message.type) {
                case 'create_room':
                    // 创建房间
                    let roomCode;

                    // 如果提供了自定义房间号
                    if (message.customRoomCode) {
                        const customCode = message.customRoomCode.toUpperCase();

                        // 验证格式
                        if (!isValidRoomCode(customCode)) {
                            ws.send(JSON.stringify({
                                type: 'error',
                                message: '房间号格式不正确，请使用3-12位英文字母或数字'
                            }));
                            break;
                        }

                        // 检查是否已存在
                        if (rooms.has(customCode)) {
                            ws.send(JSON.stringify({
                                type: 'error',
                                message: '该房间号已被使用，请换一个'
                            }));
                            break;
                        }

                        roomCode = customCode;
                    } else {
                        // 生成随机房间号
                        roomCode = generateRoomCode();
                        // 确保不重复
                        while (rooms.has(roomCode)) {
                            roomCode = generateRoomCode();
                        }
                    }

                    rooms.set(roomCode, {
                        code: roomCode,
                        password: message.password || null, // 存储密码
                        persistent: true, // 标记为持久化房间
                        clients: new Set([ws]),
                        users: [{ id: message.userId, name: message.userName, avatar: message.userAvatar }]
                    });
                    ws.roomCode = roomCode;
                    ws.userId = message.userId;
                    ws.userName = message.userName;
                    ws.userAvatar = message.userAvatar;

                    ws.send(JSON.stringify({
                        type: 'room_created',
                        roomCode: roomCode,
                        users: [{ id: message.userId, name: message.userName, avatar: message.userAvatar }]
                    }));
                    console.log(`房间 ${roomCode} 已创建${message.password ? '（有密码）' : ''}`);
                    break;

                case 'join_room':
                    // 加入房间
                    const room = rooms.get(message.roomCode);
                    if (room) {
                        // 验证密码
                        if (room.password) {
                            if (!message.password || message.password !== room.password) {
                                ws.send(JSON.stringify({
                                    type: 'error',
                                    message: '密码错误'
                                }));
                                break;
                            }
                        }

                        room.clients.add(ws);
                        room.users.push({ id: message.userId, name: message.userName, avatar: message.userAvatar });
                        ws.roomCode = message.roomCode;
                        ws.userId = message.userId;
                        ws.userName = message.userName;
                        ws.userAvatar = message.userAvatar;

                        // 通知新用户加入成功
                        ws.send(JSON.stringify({
                            type: 'room_joined',
                            roomCode: message.roomCode,
                            users: room.users
                        }));

                        // 通知房间内其他用户
                        broadcastToRoom(message.roomCode, {
                            type: 'user_joined',
                            user: { id: message.userId, name: message.userName, avatar: message.userAvatar },
                            users: room.users
                        }, ws);

                        console.log(`用户 ${message.userName} 加入房间 ${message.roomCode}`);
                    } else {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: '房间不存在'
                        }));
                    }
                    break;

                case 'file_chunk':
                    // 接收文件块
                    if (ws.roomCode) {
                        const { fileId, chunkIndex, totalChunks, chunk, fileName, fileType, fileSize } = message;
                        const key = `${ws.roomCode}_${fileId}`;

                        if (!fileChunks.has(key)) {
                            fileChunks.set(key, {
                                chunks: new Array(totalChunks),
                                received: 0,
                                fileName,
                                fileType,
                                fileSize
                            });
                        }

                        const fileData = fileChunks.get(key);
                        fileData.chunks[chunkIndex] = chunk;
                        fileData.received++;

                        // 通知发送者进度
                        ws.send(JSON.stringify({
                            type: 'chunk_received',
                            fileId,
                            chunkIndex,
                            totalChunks
                        }));

                        // 如果所有块都收到了，重组文件
                        if (fileData.received === totalChunks) {
                            const completeFile = fileData.chunks.join('');

                            const chatMessage = {
                                type: 'chat_message',
                                userId: ws.userId,
                                userName: ws.userName,
                                userAvatar: ws.userAvatar,
                                message: '',
                                file: {
                                    fileId: fileId, // 添加fileId用于前端确认
                                    name: fileName,
                                    type: fileType,
                                    size: fileSize,
                                    data: completeFile
                                },
                                timestamp: Date.now()
                            };

                            // 广播给房间内其他用户
                            broadcastToRoom(ws.roomCode, chatMessage, ws);

                            // 发送给自己
                            ws.send(JSON.stringify(chatMessage));

                            // 清理缓存
                            fileChunks.delete(key);
                        }
                    }
                    break;

                case 'chat_message':
                    // 发送聊天消息
                    if (ws.roomCode) {
                        const chatMessage = {
                            type: 'chat_message',
                            userId: ws.userId,
                            userName: ws.userName,
                            userAvatar: ws.userAvatar,
                            message: message.message,
                            file: message.file, // 添加文件数据支持
                            timestamp: Date.now()
                        };

                        // 广播给房间内其他用户
                        broadcastToRoom(ws.roomCode, chatMessage, ws);

                        // 发送给自己
                        ws.send(JSON.stringify(chatMessage));
                    }
                    break;
            }
        } catch (error) {
            console.error('消息处理错误:', error);
        }
    });

    ws.on('close', () => {
        // 用户断开连接
        if (ws.roomCode) {
            const room = rooms.get(ws.roomCode);
            if (room) {
                room.clients.delete(ws);
                room.users = room.users.filter(u => u.id !== ws.userId);

                if (room.clients.size === 0) {
                    // 如果是持久化房间，保留房间但清空用户列表
                    if (room.persistent) {
                        console.log(`房间 ${ws.roomCode} 无人但保持存在（持久化房间）`);
                    } else {
                        // 非持久化房间，删除
                        rooms.delete(ws.roomCode);
                        console.log(`房间 ${ws.roomCode} 已删除`);
                    }
                } else {
                    // 通知其他用户
                    broadcastToRoom(ws.roomCode, {
                        type: 'user_left',
                        userId: ws.userId,
                        userName: ws.userName,
                        users: room.users
                    });
                }
            }
        }
        console.log('客户端断开连接');
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`WebSocket 服务器运行在端口 ${PORT}`);
});
