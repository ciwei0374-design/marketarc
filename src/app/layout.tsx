import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "资见 AI",
  description: "看懂市场，建立自己的投资判断。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
