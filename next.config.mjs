/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // 忽略构建过程中的 TypeScript 错误，避免因环境不一致导致中断
    ignoreBuildErrors: true,
  },
  eslint: {
    // 忽略构建过程中的 Lint 检查错误
    ignoreDuringBuilds: true,
  },
  /* 允许的开发源配置 */
  allowedDevOrigins: ['*.dev.coze.site'],
  productionBrowserSourceMaps: false,
  webpack: (config, { isServer }) => {
    // 针对客户端构建，禁用一些不需要的 Node.js 原生模块
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        path: false,
        stream: false,
        crypto: false,
      };
    }
    return config;
  },
  images: {
    // 配置允许加载图片的外部域名
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'coze-coding-dev.tos.coze.site',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
