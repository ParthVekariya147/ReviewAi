'use client';

import Link from 'next/link';
import { MdChevronRight } from 'react-icons/md';

interface BreadcrumbsProps {
  items: string[];        // e.g. ['Admin', 'Businesses', 'Acme Corp']
  hrefs?: (string | null)[];
}

export default function Breadcrumbs({ items, hrefs }: BreadcrumbsProps) {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2 }}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const href = hrefs?.[i];
        return (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!isLast && href ? (
              <Link href={href} style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'none' }}>
                {item}
              </Link>
            ) : (
              <span style={{ fontSize: 11, color: isLast ? 'var(--ink-2)' : 'var(--muted)' }}>
                {item}
              </span>
            )}
            {!isLast && <MdChevronRight size={12} style={{ color: 'var(--muted-2)' }}/>}
          </span>
        );
      })}
    </nav>
  );
}
