import type { Metadata } from 'next';
import { ChatAgent } from '@/components/chat-agent';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SneakerLab | Modern sneaker commerce',
    template: '%s | SneakerLab',
  },
  description: 'A portfolio-grade sneaker commerce experience for web and mobile.',
  openGraph: {
    title: 'SneakerLab | Modern sneaker commerce',
    description:
      'Discover active sneaker styles with thoughtful product detail and responsive filters.',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className="bg-background" lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <ChatAgent />
      </body>
    </html>
  );
}

