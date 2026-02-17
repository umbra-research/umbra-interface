import type { Metadata } from "next";
import { Providers } from "../components/Providers";
import "../styles.css";

export const metadata: Metadata = {
  title: "Umbra | The Forbidden Ledger",
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
            {children}
        </Providers>
      </body>
    </html>
  );
}
