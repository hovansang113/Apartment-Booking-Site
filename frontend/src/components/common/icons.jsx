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

export function ChevronRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MinusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LocationPinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path
        d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11Z"
        strokeLinejoin="round"
      />
      <circle cx={12} cy={10} r={2.3} />
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

export function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function BookIllustration(props) {
  return (
    <svg viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.08))">
        {/* Book spine & back cover */}
        <path d="M20 70 L80 40 L140 70 L80 100 Z" fill="#E5E7EB" stroke="#CBD5E1" strokeWidth="2" />
        
        {/* Stack of pages */}
        <path d="M22 64 L80 35 L138 64 L80 93 Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
        <path d="M24 58 L80 30 L136 58 L80 86 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
        
        {/* Top page lines */}
        <path d="M45 52 L75 37" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        <path d="M45 60 L75 45" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        <path d="M85 37 L115 52" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        <path d="M85 45 L115 60" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

        {/* Book thickness edges */}
        <path d="M20 70 L20 82 L80 112 L80 100 Z" fill="#94A3B8" />
        <path d="M140 70 L140 82 L80 112 L80 100 Z" fill="#CBD5E1" />

        {/* Pink bookmark ribbon */}
        <path d="M72 80 L72 120 L78 114 L84 120 L84 74 Z" fill="#F43F5E" />
      </g>
    </svg>
  );
}

export function CalculatorIcon(props) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 p-2.5 border border-neutral-200 shadow-sm shrink-0">
      <span className="text-2xl" role="img" aria-label="calculator">🧮</span>
    </div>
  );
}

export function BankIcon(props) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 p-2.5 border border-neutral-200 shadow-sm shrink-0">
      <span className="text-2xl" role="img" aria-label="bank">🏦</span>
    </div>
  );
}

export function GridViewIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function ListViewIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <line x1="8" y1="6" x2="21" y2="6" strokeLinecap="round" />
      <line x1="8" y1="12" x2="21" y2="12" strokeLinecap="round" />
      <line x1="8" y1="18" x2="21" y2="18" strokeLinecap="round" />
      <line x1="3" y1="6" x2="3.01" y2="6" strokeLinecap="round" strokeWidth={3} />
      <line x1="3" y1="12" x2="3.01" y2="12" strokeLinecap="round" strokeWidth={3} />
      <line x1="3" y1="18" x2="3.01" y2="18" strokeLinecap="round" strokeWidth={3} />
    </svg>
  );
}

export function HomeOutlineIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5z" />
      <polyline points="9 21 9 14 15 14 15 21" />
    </svg>
  );
}

export function HomePlusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5z" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  );
}

export function DuplicateIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}


