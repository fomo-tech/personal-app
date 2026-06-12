import type { Metadata, Viewport } from "next";
import "./globals.css";
import LayoutContainer from "@/components/layout/LayoutContainer";

export const metadata: Metadata = {
  title: "Personal Manager - Quản lý Chi tiêu, Vàng, Tài khoản & Công việc",
  description: "Hệ thống quản lý tài chính cá nhân, tài sản vàng và công việc hiệu quả và bảo mật.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Personal Manager",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <LayoutContainer>{children}</LayoutContainer>
      </body>
    </html>
  );
}
