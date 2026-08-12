import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { headers } from "next/headers";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Harmoni Stay — Find Your Perfect Stay",
  description: "Premium hotel booking experience",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isAdminRoute = pathname.startsWith("/admin");
  const isBareRoute = isAdminRoute || pathname === "/signin" || pathname === "/register";

  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${inter.variable} font-body antialiased bg-surface text-on-surface`}
      >
        <AuthProvider>
          {isBareRoute ? (
            children
          ) : (
            <>
              <Navbar />
              <main className="min-h-screen">{children}</main>
              <Footer />
            </>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
