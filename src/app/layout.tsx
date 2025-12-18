import type { Metadata } from "next";
import { Providers } from "../components/Providers";
import { AppShell } from "../components/AppShell";
import "../styles.css";

export const metadata: Metadata = {
  title: "Umbra Interface",
  description: "Anonymous Solana Transfers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
