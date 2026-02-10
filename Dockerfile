# 使用 Node.js 20 官方镜像作为基础
FROM node:20-slim AS base

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
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm build

# 第三阶段：运行环境
FROM base AS runner
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 5000

# 创建非 root 用户
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

# 暴露 5000 端口
EXPOSE 5000

# 使用 node 直接运行 next 核心文件，这是最稳妥的方式
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "5000"]
