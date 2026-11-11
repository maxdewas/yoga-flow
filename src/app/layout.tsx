import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Nav } from "@/components/Nav";
import { HtmlLang } from "@/lib/i18n";
import "./globals.css";

const sans = Plus_Jakarta_Sans({ variable: "--font-sans-app", subsets: ["latin"] });
const display = Fraunces({ variable: "--font-display-app", subsets: ["latin"], axes: ["opsz", "SOFT"] });

export const metadata: Metadata = {
  title: "Flow Creator",
  description: "Préparer ses cours de yoga : postures, séquences, analyse, lecture guidée et fiches imprimables. · Plan yoga classes · Prepara tus clases de yoga.",
  appleWebApp: { capable: true, title: "Flow Creator", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#171614" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <HtmlLang />
        <Nav />
        <main className="flex w-full flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
