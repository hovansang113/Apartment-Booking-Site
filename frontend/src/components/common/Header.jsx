import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import { GlobeIcon, MenuIcon, UserCircleIcon } from './icons';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0 text-2xl font-bold text-brand-600">
          stayhub
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="w-full max-w-xl">
            <SearchBar />
          </div>
        </div>

        <nav aria-label="Tài khoản" className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            to="/host"
            className="hidden rounded-full px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 lg:inline-block"
          >
            Cho thuê chỗ ở của bạn
          </Link>
          <button
            type="button"
            aria-label="Ngôn ngữ"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 sm:flex"
          >
            <GlobeIcon className="h-5 w-5" />
          </button>
          <Link
            to="/auth/login"
            className="flex items-center gap-3 rounded-full border border-neutral-300 py-2 pl-3 pr-2 hover:shadow-md transition-shadow"
          >
            <MenuIcon className="h-4 w-4 text-neutral-700" />
            <UserCircleIcon className="h-7 w-7 text-neutral-500" />
          </Link>
        </nav>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
