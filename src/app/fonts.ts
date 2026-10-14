import localFont from "next/font/local";

export const bodyFont = localFont({
  src: [
    { path: "./fonts/worksans-var.woff2", weight: "400 700", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});
