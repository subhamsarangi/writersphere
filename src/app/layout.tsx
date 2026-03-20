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
        <meta name="description" content="For those who think too much, and write too little." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Open Graph / Social Media */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://write.openworldregister.com" />
        <meta property="og:title" content="Writersphere — A sanctuary for writers" />
        <meta property="og:description" content="For those who think too much, and write too little." />
        <meta property="og:image" content="https://cdn.openworldregister.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Writersphere — A sanctuary for writers" />
        <meta name="twitter:description" content="For those who think too much, and write too little." />
        <meta name="twitter:image" content="https://cdn.openworldregister.com/og-image.png" />
      </head>
      <body>
        <RootLayoutContent>{children}</RootLayoutContent>
      </body>
    </html>
  );
}
