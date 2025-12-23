import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StackCounter - Stacks Counter App',
  description: 'A simple counter app on Stacks blockchain using Reown WalletKit',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
