# DATABASE_URL 配置完整指南

## 📋 什么是 DATABASE_URL？

`DATABASE_URL` 是 PostgreSQL 数据库的连接字符串，用于让应用连接到数据库。

### 格式说明

```
postgresql://[用户名]:[密码]@[主机地址]:[端口]/[数据库名]
```

### 示例

```
postgresql://postgres.mypostgresdb:Abc123456@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**分解说明：**
- `postgresql://` - 协议（必须是 postgresql）
- `postgres.mypostgresdb` - 数据库用户名
- `Abc123456` - 数据库密码
- `aws-0-ap-southeast-1.pooler.supabase.com` - 数据库主机地址
- `6543` - 端口号（PostgreSQL 默认是 5432）
- `postgres` - 数据库名称

---

## 🚀 免费创建 PostgreSQL 数据库

以下是几个推荐的免费 PostgreSQL 数据库提供商：

### 1. Supabase（推荐 ⭐⭐⭐⭐⭐）

**优点：**
- ✅ 完全免费，永久免费
- ✅ 500MB 存储空间
- ✅ 无限连接数
- ✅ 提供实时功能
- ✅ 提供认证功能
- ✅ 界面友好

**创建步骤：**

#### 步骤 1：注册 Supabase

1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 **"Start your project"**
3. 使用 GitHub 账号登录（或邮箱注册）

#### 步骤 2：创建项目

1. 登录后点击 **"New Project"** 按钮
2. 填写项目信息：
   - **Name**: `football-team-stats`（或自定义名称）
   - **Database Password**: 设置一个强密码（记住这个密码！）
   - **Region**: 选择 `Southeast Asia (Singapore)` 或 `East Asia (Tokyo)`
   - 确认密码后点击 **"Create new project"**

#### 步骤 3：等待项目创建

等待 1-2 分钟，项目创建完成。

#### 步骤 4：获取连接字符串

1. 点击左侧菜单的 **"Settings"**
2. 点击 **"Database"**
3. 向下滚动找到 **"Connection String"**
4. 点击 **"URI"** 标签
5. 找到 **"Connection string"** 文本框
6. 点击右侧的复制图标 📋

**复制的连接字符串格式：**
```
postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

#### 步骤 5：替换密码

将连接字符串中的 `[YOUR-PASSWORD]` 替换为你刚才设置的数据库密码。

**最终格式：**
```
postgresql://postgres.xxxxxx:YourPassword123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

---

### 2. Neon（推荐 ⭐⭐⭐⭐）

**优点：**
- ✅ Serverless PostgreSQL
- ✅ 完全免费
- ✅ 0.5GB 存储
- ✅ 自动休眠（节省成本）
- ✅ 快速启动

**创建步骤：**

#### 步骤 1：注册 Neon

1. 访问 [https://neon.tech](https://neon.tech)
2. 点击 **"Sign up"**
3. 使用 GitHub 或 Google 账号登录

#### 步骤 2：创建项目

1. 登录后点击 **"New Project"**
2. 填写项目信息：
   - **Name**: `football-team-stats`
   - 选择区域（推荐 Southeast Asia）
3. 点击 **"Create Project"**

#### 步骤 3：获取连接字符串

1. 项目创建后，会显示连接字符串
2. 复制 **"Connection string"**
3. 格式类似：
```
postgresql://username:password@ep-xyz.aws-0.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

---

### 3. Railway（推荐 ⭐⭐⭐）

**优点：**
- ✅ 支持多种数据库
- ✅ $5 免费额度
- ✅ 界面简洁
- ✅ 一键部署

**创建步骤：**

#### 步骤 1：注册 Railway

1. 访问 [https://railway.app](https://railway.app)
2. 点击 **"Login"**
3. 使用 GitHub 账号登录

#### 步骤 2：创建数据库

1. 点击 **"New Project"** → **"Provision PostgreSQL"**
2. 等待数据库创建完成

#### 步骤 3：获取连接字符串

1. 点击数据库项目
2. 在 **"Variables"** 标签页中找到 `DATABASE_URL`
3. 复制这个值

---

### 4. PlanetScale（推荐 ⭐⭐⭐）

**优点：**
- ✅ Serverless MySQL（不是 PostgreSQL，但有兼容层）
- ✅ 免费额度充足
- ✅ 性能优秀

**注意：** PlanetScale 主要支持 MySQL，不是 PostgreSQL。

---

## 🎯 推荐选择

### 对于本项目的用户

**强烈推荐：Supabase** ⭐⭐⭐⭐⭐

**原因：**
- ✅ 完全免费，永久免费
- ✅ 专为 PostgreSQL 设计
- ✅ 提供丰富的功能
- ✅ 界面友好，操作简单
- ✅ 社区活跃，文档完善
- ✅ 500MB 存储空间足够足球队数据使用

---

## 📝 在 Vercel 中配置 DATABASE_URL

### 创建好数据库后，在 Vercel 中配置：

1. **回到 Vercel 项目配置页面**
   - 在浏览器中，返回到 Vercel 的项目配置页面

2. **找到 Environment Variables 部分**
   - 滚动到 "Environment Variables"

3. **添加 DATABASE_URL**
   - 点击 **"New Variable"**
   - **Key**: 输入 `DATABASE_URL`
   - **Value**: 粘贴你刚才获取的连接字符串
   - **Environment**: 勾选 `Production` 和 `Preview`
   - 点击 **"Save"**

---

## ⚠️ 重要提示

### 1. 保管好数据库密码
- ⚠️ 不要分享给他人
- ⚠️ 不要提交到 Git 仓库
- ✅ 只在 Vercel 环境变量中配置

### 2. 连接字符串格式
- ✅ 必须以 `postgresql://` 开头（不是 `postgres://`）
- ✅ 密码中如果包含特殊字符，需要进行 URL 编码
- ✅ 确认主机地址、端口、数据库名都正确

### 3. 安全性
- ✅ Vercel 的环境变量是加密存储的
- ✅ 不会在前端暴露
- ✅ 只有后端可以访问

---

## 🔍 验证连接字符串

### 如何确认连接字符串正确？

#### 方法 1：检查格式

```
postgresql://[username]:[password]@[host]:[port]/[database]
```

#### 方法 2：在本地测试

创建一个测试文件：

```bash
# 创建测试文件
cat > test-db.js << 'EOF'
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://username:password@host:port/database'
});

client.connect()
  .then(() => {
    console.log('✅ 数据库连接成功！');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('当前时间:', res.rows[0]);
    client.end();
  })
  .catch(err => {
    console.error('❌ 连接失败:', err.message);
    client.end();
  });
EOF

# 安装 pg
npm install pg

# 运行测试
node test-db.js
```

---

## 🆘 常见问题

### Q1: 连接字符串中的密码有特殊字符怎么办？

**A:** 需要进行 URL 编码：

```
密码: abc@123
编码后: abc%40123
```

### Q2: 为什么连接不上数据库？

**A:** 检查以下几点：
1. 连接字符串格式是否正确
2. 数据库是否允许外部连接
3. 密码是否正确
4. 主机地址是否正确

### Q3: 如何修改数据库密码？

**A:**
1. 登录数据库提供商的 Dashboard
2. 找到数据库设置
3. 修改密码
4. 更新 Vercel 中的 DATABASE_URL

### Q4: 数据库存储空间不够怎么办？

**A:**
- Supabase 免费版：500MB（够用）
- 如果不够用，可以升级付费计划
- 或定期清理旧数据

---

## 📚 相关资源

- [Supabase 官方文档](https://supabase.com/docs)
- [Neon 官方文档](https://neon.tech/docs)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)

---

## 💡 下一步

1. **选择数据库提供商**（推荐 Supabase）
2. **创建数据库项目**
3. **获取连接字符串**
4. **在 Vercel 中配置 DATABASE_URL**
5. **继续部署**

---

**准备好创建数据库了吗？推荐使用 Supabase，5 分钟即可完成！** 🚀
