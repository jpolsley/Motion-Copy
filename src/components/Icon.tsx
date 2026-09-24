import React from 'react';

const ICONS: Record<string, string> = {
  chat: 'M20 11.5a8 8 0 0 1-8 8H4l1.3-4A8 8 0 1 1 20 11.5Z',
  memory: 'M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3M9 9h6v6H9z',
  tune: 'M4 7h6m4 0h6M4 17h10m4 0h2M7 4v6m10 4v6',
  branch: 'M7 5c0 1.1 0 2 0 2m0 10c0 1.1 0 2 0 2M18 7c0 1.1 0 2 0 2M7 7v10m0-3h5a6 6 0 0 0 6-5',
  plus: 'M12 5v14M5 12h14',
  arrow: 'm6 11 6-6 6 6M12 5v14',
  close: 'm6 6 12 12M6 18 18 6',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4',
  upload: 'M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4',
  copy: 'M15 8V4H4v11h4M10 8h10v12H10z',
  trash: 'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7',
  edit: 'm4 16 12-12 4 4L8 20H4z',
  shield: 'm12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  retry: 'M4 10a8 8 0 1 1 1 7M4 4v6h6',
  spark: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z',
  book: 'M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15',
  info: 'M12 16v-4m0-4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
  check: 'M20 6 9 17l-5-5',
  calendar: 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18',
  folder: 'M4 4h5l2 2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  search: 'm21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0z',
  zap: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  cpu: 'M4 4h16v16H4zM9 9h6v6H9zM9 1v3m6-3v3M9 20v3m6-3v3M1 9h3m-3 6h3m16-6h3m-3 6h3',
  pin: 'M12 17v5M9 2h6l-1 7 4 3v2H6v-2l4-3-1-7z',
};

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  className?: string;
}

export default function Icon({ name, className = '', ...props }: IconProps) {
  const d = ICONS[name] || ICONS.spark;

  return (
    <svg
      className={`ico ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={d} />
    </svg>
  );
}
