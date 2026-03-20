// app/layout.tsx
import "./globals.css";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

import type { Metadata } from "next";
import { Merriweather } from "next/font/google";
import ClientLayout from "./ClientLayout";

const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-merriweather",
});

export const metadata: Metadata = {
  title: "Writersphere — A sanctuary for writers",
  description: "For those who think too much, and write too little.",
  openGraph: {
    type: "website",
    url: "https://write.openworldregister.com",
    title: "Writersphere — A sanctuary for writers",
    description: "For those who think too much, and write too little.",
    images: [
      {
        url: "https://cdn.openworldregister.com/opengraph-img.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Writersphere — A sanctuary for writers",
    description: "For those who think too much, and write too little.",
    images: ["https://cdn.openworldregister.com/opengraph-img.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={merriweather.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
