#!/bin/bash

echo "🚀 开始部署准备..."

# 检查是否已初始化 Git
if [ ! -d ".git" ]; then
    echo "📦 初始化 Git 仓库..."
    git init
fi

# 添加所有文件
echo "📝 添加文件到 Git..."
git add .

# 提交
echo "💾 提交更改..."
git commit -m "准备部署到Render"

echo "✅ 部署准备完成！"
echo ""
echo "📋 下一步操作："
echo "1. 在 GitHub 创建新仓库"
echo "2. 运行以下命令关联远程仓库："
echo "   git remote add origin https://github.com/你的用户名/仓库名.git"
echo "3. 推送代码："
echo "   git push -u origin main"
echo ""
echo "4. 访问 https://render.com 创建 Web Service"
echo "5. 连接你的 GitHub 仓库并部署"
echo ""
echo "📖 详细步骤请查看 DEPLOYMENT.md 文件"
