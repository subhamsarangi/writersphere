// app/layout.tsx
"use client";

import "./globals.css";

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

import React from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import SupabaseErrorModal from "../components/SupabaseErrorModal";
import { useSupabaseErrorDetection } from "../lib/useSupabaseErrorDetection";
import { Merriweather } from "next/font/google";

const merriweather = Merriweather({
  weight: ['300', '400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-merriweather',
});

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { showErrorModal, handleClose, handleRetry, triggerTestModal } = useSupabaseErrorDetection();

  // Test shortcut: Press Ctrl+Shift+E to trigger the modal
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        triggerTestModal();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [triggerTestModal]);

  return (
    <>
      <Head>
        <title>Writersphere</title>
        <meta name="description" content="A small writing platform" />
      </Head>
      <Navbar />
      {children}
      <SupabaseErrorModal 
        isOpen={showErrorModal} 
        onClose={handleClose}
        onRetry={handleRetry}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" className={merriweather.variable}>
      <head>
        <title>Writersphere</title>
        <meta name="description" content="A small writing platform" />
      </head>
      <body>
        <RootLayoutContent>{children}</RootLayoutContent>
      </body>
    </html>
  );
}
