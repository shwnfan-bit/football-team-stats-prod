# 使用 Node.js 18 官方镜像作为基础
FROM node:18-slim AS base

# 安装 pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# 第一阶段：安装依赖
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 第二阶段：构建项目
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 注入构建时需要的环境变量（如果有）
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm build

# 第三阶段：运行环境
FROM base AS runner
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 创建非 root 用户以增强安全性
RUN groupadd --gid 1001 nodejs
RUN useradd --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/scripts ./scripts

USER nextjs

# 暴露 5000 端口（与您的项目配置一致）
EXPOSE 5000

# 启动命令
CMD ["pnpm", "start"]
