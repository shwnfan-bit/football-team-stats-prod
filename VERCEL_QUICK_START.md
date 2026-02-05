# Vercel 部署快速开始

## 🚀 最简单的部署方法（3 步完成）

### 前提条件
- ✅ 拥有 GitHub 账号
- ✅ 项目代码已推送到 GitHub
- ✅ 拥有 PostgreSQL 数据库连接信息

---

## 方法 1：通过 Vercel 网站（最简单 ⭐⭐⭐⭐⭐）

### 第 1 步：登录 Vercel
1. 访问 [https://vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录

### 第 2 步：创建项目
1. 点击 "Add New" → "Project"
2. 选择你的 GitHub 仓库
3. 如果没看到仓库，先推送代码到 GitHub

### 第 3 步：配置环境变量
在 "Environment Variables" 部分添加：
```
Name: DATABASE_URL
Value: postgresql://username:password@host:port/database
```

### 第 4 步：部署
点击 "Deploy" 按钮，等待 2-3 分钟完成。

**完成！** 🎉 访问：`https://your-project-name.vercel.app`

---

## 方法 2：使用命令行（适合开发者 ⭐⭐⭐⭐）

### 第 1 步：安装并登录
```bash
# 安装 Vercel CLI
pnpm add -g vercel

# 登录
vercel login
```

### 第 2 步：部署
```bash
# 在项目根目录执行
vercel
```

按提示操作，选择默认配置。

### 第 3 步：配置环境变量
```bash
# 添加数据库连接字符串
vercel env add DATABASE_URL

# 粘贴你的数据库连接字符串
# 选择环境：Production
```

### 第 4 步：部署到生产环境
```bash
vercel --prod
```

**完成！** 🎉

---

## 📝 获取 DATABASE_URL

### 方式 1：查看项目的 .env 文件
```bash
cat .env
# 复制 DATABASE_URL 的值
```

### 方式 2：联系数据库提供商
- Supabase: Project Settings → Database → Connection string
- Neon: Dashboard → Connection Details
- Railway: Variables → DATABASE_URL

**格式示例：**
```
postgresql://postgres:your_password@db.example.com:5432/football_stats
```

---

## 🌍 推荐部署区域

**选择香港区域**，对中国用户访问更快：

**通过网站：**
1. 进入项目设置 → General → Regions
2. 选择 `Hong Kong (hkg1)`

**通过命令行：**
```bash
vercel regions set hkg1
```

---

## 🔧 常见问题

### Q: 部署后无法连接数据库？
**A:**
1. 检查 `DATABASE_URL` 环境变量是否正确
2. 确认数据库允许 Vercel IP 访问
3. 查看部署日志：`vercel logs`

### Q: 部署后页面显示错误？
**A:**
1. 查看构建日志
2. 检查是否有语法错误
3. 确认所有依赖都已安装

### Q: 如何更新部署？
**A:**
- **方式 1（推荐）**：推送代码到 GitHub，自动部署
- **方式 2**：执行 `vercel --prod`

---

## 📚 详细文档

需要更多帮助？查看完整文档：
- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - 完整部署指南
- [README.md](./README.md) - 项目说明

---

## 🆘 需要帮助？

遇到问题？
1. 查看 [Vercel 文档](https://vercel.com/docs)
2. 检查部署日志：`vercel logs`
3. 查看错误详情：Vercel Dashboard → Deployments

---

**准备好了吗？开始部署吧！** 🚀
