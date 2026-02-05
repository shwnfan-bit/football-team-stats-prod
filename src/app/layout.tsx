import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { Navigation } from '@/components/navigation';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '足球队管理',
    template: '%s | 足球队管理',
  },
  description: '专业的足球队数据统计与分析应用',
  keywords: [
    '足球队管理',
    '足球数据统计',
    '球员管理',
    '比赛分析',
  ],
  authors: [{ name: 'Football Stats Team' }],
  generator: 'Coze Code',
  openGraph: {
    title: '足球队管理 | 数据统计与分析',
    description: '专业的足球队数据统计与分析应用',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        <Navigation />
        {children}
      </body>
    </html>
  );
}
