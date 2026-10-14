import type { Metadata } from "next";
import { bodyFont } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amore Cost — recipe costing & pricing for PH food businesses",
  description:
    "A free recipe costing and pricing calculator for Philippine food businesses.",
};

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('calcost:theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
