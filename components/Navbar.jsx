import { useSite } from '../lib/siteContext';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { FaBriefcase, FaCode, FaEnvelope, FaFolderOpen, FaHome, FaUser, FaCogs } from 'react-icons/fa';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const { content } = useSite();
  const navigation = content.navigation;

  const links = [
    { href: '/', label: navigation.homeLabel, icon: FaHome },
    { href: '/about', label: navigation.aboutLabel, icon: FaUser },
    { href: '/services', label: navigation.servicesLabel, icon: FaCogs },
    { href: '/skills', label: navigation.skillsLabel, icon: FaCode },
    { href: '/experience', label: navigation.experienceLabel, icon: FaBriefcase },
    { href: '/projects', label: navigation.projectsLabel, icon: FaFolderOpen },
    { href: '/contact', label: navigation.contactLabel, icon: FaEnvelope },
  ];

  const isActive = (href) => router.pathname === href;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-800/40 bg-slate-950/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="font-display text-xl font-bold text-slate-50 hover:text-blue-400 transition-colors">
          {navigation.logoText}<span className="text-blue-400">{navigation.logoSuffix}</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                prefetch
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive(link.href)
                    ? 'bg-slate-800/60 text-slate-50'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-50'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Project CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-950/30 transition hover:from-blue-500 hover:to-blue-400"
          >
            {navigation.hireMeLabel}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/70 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div id="mobile-navigation" className="lg:hidden border-t border-slate-800/40 bg-slate-950/95 px-4 pb-4 backdrop-blur-md">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch
              onClick={() => setMobileOpen(false)}
              className={`flex items-center rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive(link.href) ? 'bg-slate-800/60 text-white' : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <link.icon aria-hidden="true" className="mr-3 h-4 w-4 shrink-0 text-blue-400" />
              {link.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2">
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-2 text-center text-sm font-medium text-white"
            >
              {navigation.hireMeLabel}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
