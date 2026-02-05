# Vercel 部署完整指南

## 🎯 为什么选择 Vercel？

- ✅ **Next.js 官方推荐**：Vercel 是 Next.js 的开发团队创建的
- ✅ **零配置部署**：自动识别 Next.js 项目，无需复杂配置
- ✅ **全球 CDN**：静态资源全球分发，访问速度极快
- ✅ **自动 HTTPS**：免费 SSL 证书
- ✅ **免费额度充足**：100GB 带宽/月，无限项目数
- ✅ **Git 集成**：自动部署，Git push 即可更新

---

## 📋 前置条件

- ✅ 拥有 GitHub / GitLab / Bitbucket 账号
- ✅ 拥有 Vercel 账号（免费注册）
- ✅ 项目代码已推送到 Git 仓库
- ✅ 拥有 PostgreSQL 数据库连接信息

---

## 🚀 部署方式选择

### 方式一：通过 Vercel 网站部署（推荐，最简单）

#### 步骤 1：注册/登录 Vercel

1. 访问 [https://vercel.com](https://vercel.com)
2. 点击 "Sign Up" 注册或 "Login" 登录
3. 使用 GitHub / GitLab / Bitbucket 账号登录（推荐 GitHub）

#### 步骤 2：创建新项目

1. 登录后点击 "Add New" → "Project"
2. 选择你的 Git 仓库（需要先推送到 GitHub）
3. 如果没看到仓库，点击 "Import Project via URL" 或先推送到 GitHub

#### 步骤 3：配置项目

Vercel 会自动检测到这是一个 Next.js 项目，显示配置：

```
Framework Preset: Next.js
Root Directory: ./
Build Command: pnpm run build
Output Directory: .next
Install Command: pnpm install
```

**重要配置：**

1. **Project Name**：填写项目名称（如 `football-team-stats`）
2. **Environment Variables**：添加环境变量（后面详细说明）

#### 步骤 4：配置环境变量

在 "Environment Variables" 部分添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://...` | PostgreSQL 连接字符串 |

**获取 DATABASE_URL：**
- 查看项目的 `.env` 文件
- 或联系数据库提供商获取

**点击 "Add" 添加环境变量**

#### 步骤 5：部署

点击 "Deploy" 按钮，等待 2-3 分钟，部署完成后会显示：

```
✅ Production: https://your-project-name.vercel.app
```

---

### 方式二：使用 Vercel CLI 部署（推荐，更灵活）

#### 步骤 1：安装 Vercel CLI

```bash
# 全局安装 Vercel CLI
pnpm add -g vercel
```

#### 步骤 2：登录 Vercel

```bash
# 登录到 Vercel
vercel login
```

按照提示：
1. 选择登录方式（GitHub / Email）
2. 在浏览器中授权登录

#### 步骤 3：验证项目配置

确保项目根目录有 `package.json` 和 `.coze` 文件。

```bash
# 查看项目结构
ls -la
```

应该看到：
```
.coze
package.json
.next
src/
...
```

#### 步骤 4：首次部署

```bash
# 在项目根目录执行
vercel
```

按照提示操作：

```
? Set up and deploy "~/your-project"? [Y/n] Y
? Which scope do you want to deploy to? Your Name
? Link to existing project? [y/N] N
? What's your project's name? football-team-stats
? In which directory is your code located? ./
? Want to modify these settings? [y/N] N
```

Vercel 会自动检测并配置：
```
 detected Next.js!
 detected: package.json, tsconfig.json
```

#### 步骤 5：配置环境变量

部署过程中或部署后，添加环境变量：

```bash
# 添加数据库 URL
vercel env add DATABASE_URL

# 输入值（从 .env 文件复制）
# 选择环境：Production / Preview / Development
```

或通过 Vercel 网站添加：
1. 访问 https://vercel.com/dashboard
2. 进入你的项目 → Settings → Environment Variables
3. 添加 `DATABASE_URL`

#### 步骤 6：生产环境部署

首次部署是预览环境，需要正式部署：

```bash
# 部署到生产环境
vercel --prod
```

#### 步骤 7：查看部署信息

```bash
# 查看部署列表
vercel list

# 查看项目详情
vercel inspect
```

输出示例：
```
football-team-stats - production [2m ago]
  https://football-team-stats.vercel.app
```

---

## 🔧 配置文件（可选）

如果需要自定义配置，可以创建 `vercel.json`：

```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": ".next",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["hkg1"],
  "env": {
    "DATABASE_URL": "@database-url"
  }
}
```

**说明：**
- `regions`: 选择部署区域（`hkg1` = 香港区域，适合中国用户访问）
- `env`: 环境变量引用（需要在 Vercel 中先创建）

---

## 🌍 推荐部署区域（对中国用户友好）

Vercel 支持多个区域，选择离用户最近的区域：

| 区域代码 | 位置 | 适合用户 |
|----------|------|----------|
| `hkg1` | 香港 | 中国大陆用户（推荐 ⭐） |
| `sin1` | 新加坡 | 东南亚用户 |
| `nrt1` | 东京 | 日本用户 |
| `iad1` | 美国东部 | 北美用户 |
| `sfo1` | 美国西部 | 北美西海岸用户 |

**设置方式：**

**方法 1：通过 Vercel 网站**
1. 项目设置 → General → Regions
2. 选择 `Hong Kong (hkg1)`

**方法 2：通过 CLI**
```bash
vercel regions set hkg1
```

---

## 🔄 自动部署（Git 集成）

配置 Git 集成后，每次推送代码会自动部署：

### 设置方法

1. 访问 Vercel 项目 → Settings → Git
2. 确保 "Git Integration" 已启用
3. 配置部署规则：
   - **Production 分支**：通常是 `main` 或 `master`
   - **Preview 分支**：其他分支会自动部署为预览版本

### 工作流程

```bash
# 1. 修改代码
git add .
git commit -m "feat: 添加新功能"

# 2. 推送到主分支（自动部署到生产环境）
git push origin main

# 3. 推送到其他分支（自动部署为预览环境）
git checkout -b feature/new-feature
git push origin feature/new-feature
```

---

## 🐛 常见问题解决

### 问题 1：部署失败 - 缺少依赖

**错误信息：**
```
Error: Cannot find module 'xxx'
```

**解决方案：**
确保 `package.json` 中包含所有依赖：
```bash
# 重新安装依赖
pnpm install

# 提交 package.json 和 pnpm-lock.yaml
git add package.json pnpm-lock.yaml
git commit -m "fix: update dependencies"
git push
```

### 问题 2：数据库连接失败

**错误信息：**
```
Error: connection refused
```

**解决方案：**
1. 检查环境变量是否正确配置：
```bash
# 查看 Vercel 环境变量
vercel env ls
```

2. 确保 `DATABASE_URL` 格式正确：
```
postgresql://username:password@host:port/database
```

3. 检查数据库是否允许 Vercel IP 访问（需要联系数据库提供商）

### 问题 3：构建超时

**错误信息：**
```
Build failed: timeout
```

**解决方案：**
1. 优化构建时间（减少依赖）
2. 升级 Vercel 计划（付费计划有更长的超时时间）

### 问题 4：页面显示 404

**原因：**
- 路由配置错误
- 构建未成功完成

**解决方案：**
1. 检查构建日志：
```bash
vercel logs
```

2. 确保所有页面都在 `src/app/` 目录下

### 问题 5：环境变量在部署后丢失

**解决方案：**
确保环境变量添加到了正确的环境：
- `Production`: 生产环境（`vercel --prod`）
- `Preview`: 预览环境（所有非生产分支）
- `Development`: 开发环境（本地）

---

## 📊 监控与日志

### 查看部署日志

**方法 1：通过 CLI**
```bash
# 查看实时日志
vercel logs

# 查看特定部署的日志
vercel logs <deployment-id>
```

**方法 2：通过网站**
1. 访问 Vercel Dashboard
2. 进入项目 → Deployments
3. 点击具体部署 → Logs

### 查看性能

```bash
# 查看项目性能数据
vercel inspect
```

---

## 🎯 部署后检查清单

- [ ] 应用可以正常访问
- [ ] 所有页面都能正常加载
- [ ] 数据库连接正常（可以查询数据）
- [ ] 管理员登录功能正常
- [ ] 添加/编辑/删除功能正常
- [ ] 响应式设计在移动端正常
- [ ] 没有控制台错误
- [ ] 加载速度可接受（< 2 秒）

---

## 💡 优化建议

### 1. 启用缓存

```typescript
// Next.js 自动缓存静态资源
// 动态数据使用 revalidate 验证
export const revalidate = 300; // 5 分钟
```

### 2. 图片优化

使用 Next.js Image 组件自动优化：
```tsx
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={200}
/>
```

### 3. 启用 Edge Functions（可选）

对于需要更低延迟的功能：
```typescript
// app/api/example/route.ts
export const runtime = 'edge';
```

---

## 📚 相关资源

- [Vercel 官方文档](https://vercel.com/docs)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Vercel 免费额度说明](https://vercel.com/docs/accounts/plans/overview)
- [Vercel 区域列表](https://vercel.com/docs/edge-network/regions)

---

## 🆘 获取帮助

遇到问题？
1. 查看 [Vercel 文档](https://vercel.com/docs)
2. 搜索 [Vercel GitHub Issues](https://github.com/vercel/vercel/issues)
3. 访问 [Vercel 社区论坛](https://github.com/orgs/vercel/discussions)

---

## 🎉 部署成功后

恭喜！你的应用已经部署到 Vercel 了。

**下一步：**
1. 测试所有功能
2. 分享链接给团队
3. 设置域名（可选）
4. 配置 Git 自动部署

**链接格式：**
```
https://your-project-name.vercel.app
```

---

**需要帮助？** 随时问我！
