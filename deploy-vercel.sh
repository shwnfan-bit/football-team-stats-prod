#!/bin/bash

# Vercel 快速部署脚本
# 使用方法: ./deploy-vercel.sh

set -e

echo "🚀 开始 Vercel 部署流程..."
echo ""

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装 Vercel CLI..."
    pnpm add -g vercel
fi

# 检查是否已登录
echo "🔐 检查登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "请先登录 Vercel..."
    vercel login
fi

# 检查环境变量
echo ""
echo "🔍 检查环境变量配置..."
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件"
    echo "💡 提示：请在 Vercel 网站或通过 CLI 添加 DATABASE_URL 环境变量"
    echo "   - 网站方式：项目设置 → Environment Variables → 添加 DATABASE_URL"
    echo "   - CLI 方式：vercel env add DATABASE_URL"
    echo ""
    read -p "是否继续部署？(y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 已取消部署"
        exit 1
    fi
fi

# 部署到预览环境
echo ""
echo "📋 部署到预览环境..."
vercel

echo ""
echo "✅ 预览环境部署完成！"
echo ""
echo "🌐 查看部署："
echo "   vercel list"
echo ""
echo "📝 如需部署到生产环境，请执行："
echo "   vercel --prod"
echo ""
echo "🔑 配置环境变量："
echo "   vercel env add DATABASE_URL"
