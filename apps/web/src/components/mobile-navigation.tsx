'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const links = [
  { href: '/products', label: 'Products' },
  { href: '/favorites', label: 'Favorites' },
  { href: '/account', label: 'Account' },
];

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        onClick={() => setIsOpen((value) => !value)}
        size="icon"
        variant="ghost"
      >
        {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </Button>
      {isOpen ? (
        <nav
          aria-label="Mobile navigation"
          className="absolute inset-x-0 top-16 z-50 border-y border-border bg-background p-4 shadow-lg"
        >
          <ul className="mx-auto grid max-w-7xl gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  className="block rounded-md px-3 py-3 font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                className="block rounded-md bg-primary px-3 py-3 text-center font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href="/register"
                onClick={() => setIsOpen(false)}
              >
                Create account
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
