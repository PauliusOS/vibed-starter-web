import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import ClientBody from "@/components/ClientBody";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Import Zalando Sans Expanded for headers
const zalandoSansExpanded = {
  variable: "--font-zalando-sans-expanded",
};

export const metadata: Metadata = {
  title: "VIBED",
  description: "1000's of Code Agents - The Directory",
  icons: {
    icon: "/convex.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ClientBody className={`${geistMono.variable} ${zalandoSansExpanded.variable} antialiased font-mona-regular`}>
          <ClerkProvider
            appearance={{
              baseTheme: dark,
              variables: {
                fontFamily: "system-ui, sans-serif"
              }
            }}
          >
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ClerkProvider>
        </ClientBody>
      </body>
    </html>
  );
}
