"use client";

import { useEffect, useState } from "react";

export function ObfuscatedEmail({
  user,
  domain,
  className,
}: {
  user: string;
  domain: string;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className={className}>[enable JS to see email]</span>;
  }

  const email = `${user}@${domain}`;
  return (
    <a href={`mailto:${email}`} className={className}>
      {email}
    </a>
  );
}
