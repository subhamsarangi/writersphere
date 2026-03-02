// app/layout.tsx
import "./globals.css";

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

import Navbar from "../components/Navbar";
import { Merriweather } from "next/font/google";

const merriweather = Merriweather({
  weight: ['300', '400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-merriweather',
});

export const metadata = {
  title: "Writersphere",
  description: "A small writing platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" className={merriweather.variable}>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
