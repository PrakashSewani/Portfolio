import type { ReactNode } from 'react';

/** Inline line icons: one stroke weight, square ends, no icon package. Always decorative. */
function Icon({ children, size = 16, className }: { children: ReactNode; size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

type P = { size?: number };

export const ArrowUpRight = (p: P) => (
  <Icon {...p} className="arrow-up-right">
    <path d="M7 17 17 7M9 7h8v8" />
  </Icon>
);

export const ArrowRight = (p: P) => (
  <Icon {...p} className="arrow-right">
    <path d="M4 12h15M13 6l6 6-6 6" />
  </Icon>
);

export const ArrowLeft = (p: P) => (
  <Icon {...p} className="arrow-left">
    <path d="M20 12H5M11 6l-6 6 6 6" />
  </Icon>
);

export const ArrowDown = (p: P) => (
  <Icon {...p} className="arrow-down">
    <path d="M12 4v15M6 13l6 6 6-6" />
  </Icon>
);

export const Copy = (p: P) => (
  <Icon {...p}>
    <path d="M9 9h11v11H9z" />
    <path d="M5 15H4V4h11v1" />
  </Icon>
);

export const Check = (p: P) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);

export const Search = (p: P) => (
  <Icon {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  </Icon>
);

export const Menu = (p: P) => (
  <Icon {...p}>
    <path d="M3 7h18M3 12h18M3 17h18" />
  </Icon>
);

export const Close = (p: P) => (
  <Icon {...p}>
    <path d="M5 5l14 14M19 5 5 19" />
  </Icon>
);
