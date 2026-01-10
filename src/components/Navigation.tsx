'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="glass-effect sticky top-0 z-50 shadow-xl border-b border-green-200/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative p-3 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-green-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl opacity-75 blur-xl group-hover:opacity-100 transition-opacity"></div>
                <svg className="relative w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent group-hover:from-green-500 group-hover:via-emerald-500 group-hover:to-teal-500 transition-all duration-300">
                  Helaketha Agri
                </span>
                <p className="text-xs text-gray-500 font-medium">Agricultural Excellence</p>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-xl p-1.5 border border-green-100">
              <Link
                href="/"
                className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 relative overflow-hidden ${
                  isActive('/')
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                {isActive('/') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                )}
                <span className="relative">Home</span>
              </Link>
              <Link
                href="/farmers"
                className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 relative overflow-hidden ${
                  isActive('/farmers')
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                {isActive('/farmers') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                )}
                <span className="relative">Farmers</span>
              </Link>
              <Link
                href="/tractor-drivers"
                className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 relative overflow-hidden ${
                  isActive('/tractor-drivers')
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                {isActive('/tractor-drivers') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                )}
                <span className="relative">Tractor Drivers</span>
              </Link>
              <Link
                href="/harvester-drivers"
                className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 relative overflow-hidden ${
                  isActive('/harvester-drivers')
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                {isActive('/harvester-drivers') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                )}
                <span className="relative">Harvester Drivers</span>
              </Link>
              <Link
                href="/fertilizer-suppliers"
                className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 relative overflow-hidden ${
                  isActive('/fertilizer-suppliers')
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                {isActive('/fertilizer-suppliers') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                )}
                <span className="relative">Fertilizer Suppliers</span>
              </Link>
              <Link
                href="/provider-schedules"
                className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 relative overflow-hidden ${
                  isActive('/provider-schedules')
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                {isActive('/provider-schedules') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                )}
                <span className="relative">Schedules</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="p-1.5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-700">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

