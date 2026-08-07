export function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} {...props}>
      <circle cx={11} cy={11} r={7} strokeLinecap="round" strokeLinejoin="round" />
      <line x1={21} y1={21} x2={16.65} y2={16.65} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MenuIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <line x1={3} y1={6} x2={21} y2={6} strokeLinecap="round" />
      <line x1={3} y1={12} x2={21} y2={12} strokeLinecap="round" />
      <line x1={3} y1={18} x2={21} y2={18} strokeLinecap="round" />
    </svg>
  );
}

export function UserCircleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12Zm0 2.5c-3.3 0-9.8 1.6-9.8 4.9v2.4h19.6v-2.4c0-3.3-6.5-4.9-9.8-4.9Z" />
    </svg>
  );
}

export function GlobeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <circle cx={12} cy={12} r={9.5} />
      <path d="M2.5 12h19M12 2.5c2.5 2.6 3.8 6 3.8 9.5s-1.3 6.9-3.8 9.5c-2.5-2.6-3.8-6-3.8-9.5S9.5 5.1 12 2.5Z" />
    </svg>
  );
}

export function HeartIcon({ filled, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'rgba(0,0,0,0.5)'}
      stroke={filled ? 'none' : 'white'}
      strokeWidth={1.5}
      {...props}
    >
      <path d="M12 21s-7.5-4.6-10.2-9.1C.3 9.1 1 5.6 4 4.2c2.3-1.1 4.8-.2 6.3 1.7l1.7 2 1.7-2c1.5-1.9 4-2.8 6.3-1.7 3 1.4 3.7 4.9 2.2 7.7C19.5 16.4 12 21 12 21Z" />
    </svg>
  );
}

export function StarIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9L12 2.5Z" />
    </svg>
  );
}

export function AmenityIcon({ name, ...props }) {
  const paths = {
    wifi: 'M2 8.5a15 15 0 0 1 20 0M5.5 12a10 10 0 0 1 13 0M9 15.5a5 5 0 0 1 6 0M12 19h.01',
    kitchen: 'M4 3v8a3 3 0 0 0 3 3v9M7 3v6M10 3v6M14 3s-2 2-2 6 2 6 2 6v6',
    washer: 'M4 3h16v18H4V3Zm3 3h.01M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
    air_conditioning: 'M3 8h18M3 8v10h18V8M7 12v4M12 12v4M17 12v4',
    free_parking: 'M12 2 2 8v13h20V8L12 2ZM9 17V9h3.5a2.5 2.5 0 0 1 0 5H9',
    pool: 'M2 17c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0M6 13V5a2 2 0 0 1 4 0v8M14 13V9a2 2 0 0 1 4 0v4',
    tv: 'M3 5h18v12H3zM8 21h8M12 17v4',
    workspace: 'M4 4h16v12H4zM9 20h6M12 16v4M2 16h20',
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" {...props}>
      <path d={paths[name] || paths.wifi} strokeLinecap="round" />
    </svg>
  );
}

export function ChevronLeftIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CategoryIcon({ name, ...props }) {
  const paths = {
    apartment: 'M4 21V9l8-5 8 5v12h-5v-7H9v7H4Z',
    house: 'M4 21V10l8-6 8 6v11h-6v-6H10v6H4Z',
    villa: 'M3 21V11l4-3 5 3.5L17 8l4 3v10H3Zm4-2h3v-4H7v4Zm7 0h3v-6h-3v6Z',
    homestay: 'M12 3 2 10h3v10h5v-6h4v6h5V10h3L12 3Z',
    hotel_room: 'M3 21V4h4v13h4V9h6a4 4 0 0 1 4 4v8h-4v-6H11v6H3Z',
    all: 'M4 6h16M4 12h16M4 18h16',
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" {...props}>
      <path d={paths[name] || paths.all} strokeLinecap="round" />
    </svg>
  );
}
