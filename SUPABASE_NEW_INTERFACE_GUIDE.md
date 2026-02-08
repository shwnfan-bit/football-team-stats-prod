# Supabase 新界面 - 获取连接字符串 🆕

## 🎯 问题说明

Supabase 的界面最近更新了，"Database" 选项不在 Settings 子菜单中了。

---

## ✅ 新方法 1：从项目首页获取（最简单 ⭐⭐⭐⭐⭐）

### 步骤 1：回到项目首页

1. **点击项目名称**（页面左上角）
2. 或者点击左侧菜单的 **"Project Home"**

### 步骤 2：查找连接信息

在项目首页，向下滚动，寻找 **"Connection info"** 或 **"Connection string"**

通常会显示类似这样的框：

```
Connection string (URI)
[postgresql://postgres.xxxxxx:[YOUR-PASSWORD]@aws-0-xxx...pooler.supabase.com:6543/postgres]
📋
```

### 步骤 3：复制并替换密码

1. 点击复制按钮 📋
2. 将 `[YOUR-PASSWORD]` 替换为你设置的数据库密码

---

## ✅ 新方法 2：通过 API Keys 获取

### 步骤 1：在 Settings 中找到 API Keys

根据你提供的菜单：

```
Settings
  ↓
PROJECT SETTINGS
  ↓
API Keys
```

点击 **"API Keys"**

### 步骤 2：查找数据库连接信息

在 API Keys 页面中，寻找以下内容：

- **Project URL**
- **anon public key**
- **service_role key**

注意：这些不是完整的连接字符串，但我们可以使用它们构建。

---

## ✅ 新方法 3：使用 SQL Editor 获取（推荐 ⭐⭐⭐⭐）

### 步骤 1：打开 SQL Editor

在左侧主菜单中，点击 **"SQL Editor"**

### 步骤 2：创建新查询

1. 点击 **"New Query"**
2. 输入以下 SQL 查询：

```sql
SELECT current_database(), current_user;
```

### 步骤 3：运行查询

1. 点击 **"Run"**
2. 查看结果

这个方法可以确认数据库名称，但不会显示连接字符串。

---

## ✅ 新方法 4：构建连接字符串（最可靠）

### 使用 API Keys 页面的信息构建

根据 Supabase 的新架构，连接字符串的格式通常是：

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[HOST]:[PORT]/postgres
```

### 获取各个部分：

#### 1. 获取 Project REF

- 查看浏览器地址栏
- URL 格式：`https://supabase.com/dashboard/project/[PROJECT-REF]/...`
- `[PROJECT-REF]` 就是一串字符，如 `abc123xyz456`

#### 2. 获取主机地址

主机地址通常是：
```
aws-0-[REGION]-1.pooler.supabase.com
```

如果不确定，可以尝试以下格式（根据你选择的数据中心）：

- **Southeast Asia (Singapore)**: `aws-0-ap-southeast-1.pooler.supabase.com`
- **East Asia (Tokyo)**: `aws-0-ap-northeast-1.pooler.supabase.com`
- **US East (Northern Virginia)**: `aws-0-us-east-1.pooler.supabase.com`

#### 3. 构建连接字符串

**格式：**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[HOST]:6543/postgres
```

**示例：**
```
postgresql://postgres.abc123xyz456:MyPassword123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

---

## ✅ 新方法 5：查看 Integrations（可能）

根据你提供的菜单，试试这个：

```
Settings
  ↓
PROJECT SETTINGS
  ↓
Integrations
```

点击 **"Integrations"**，查看是否有数据库连接相关的信息。

---

## 🎯 推荐操作顺序

### 优先尝试方法 1（项目首页）

1. 点击项目名称（左上角）回到首页
2. 向下滚动寻找 "Connection string"
3. 如果找到，复制并替换密码

### 如果方法 1 不行，使用方法 4（构建连接字符串）

1. 从浏览器地址栏获取 Project REF
2. 根据你创建项目时选择的数据中心确定主机地址
3. 使用你设置的密码构建连接字符串

**连接字符串格式：**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[HOST]:6543/postgres
```

---

## 📝 帮助构建连接字符串

如果你告诉我以下信息，我可以帮你构建正确的连接字符串：

1. **Project REF**（从浏览器地址栏获取）
   - 例如：`abc123xyz456`

2. **数据库密码**（你创建项目时设置的）
   - 例如：`MyPassword123`

3. **数据中心**（你创建项目时选择的区域）
   - 例如：`Southeast Asia (Singapore)`

我会帮你组合成完整的连接字符串！

---

## 💡 快速测试方法

构建好连接字符串后，可以先验证格式是否正确：

```
postgresql://username:password@host:port/database
```

确认每个部分都有：
- ✅ `postgresql://` - 协议
- ✅ `postgres.[PROJECT-REF]` - 用户名
- ✅ `[PASSWORD]` - 密码
- ✅ `[HOST]` - 主机地址
- ✅ `6543` - 端口
- ✅ `postgres` - 数据库名

---

## 🚀 下一步

拿到连接字符串后：

1. **复制连接字符串**
2. **回到 Vercel 项目配置页面**
3. **添加环境变量**：
   - Key: `DATABASE_URL`
   - Value: 粘贴你的连接字符串
   - Environment: Production + Preview
4. **保存并继续部署**

---

**试试方法 1（项目首页），如果找不到，告诉我你的 Project REF 和数据中心，我帮你构建连接字符串！** 🎯