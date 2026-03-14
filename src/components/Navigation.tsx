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
                <svg className="relative w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  {/* Central larger leaf pointing up */}
                  <path d="M12 2 Q10 4 11 6 Q12 8 13 6 Q14 4 12 2 M12 4 L12 7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M12 2 Q10 4 11 6 Q12 8 13 6 Q14 4 12 2" fill="currentColor" opacity="0.9"/>
                  {/* Left smaller leaf */}
                  <path d="M8 5 Q7 6 7.5 7.5 Q8 9 9 8 Q9.5 7 8 5" fill="currentColor" opacity="0.7"/>
                  {/* Right smaller leaf */}
                  <path d="M16 5 Q17 6 16.5 7.5 Q16 9 15 8 Q14.5 7 16 5" fill="currentColor" opacity="0.7"/>
                  {/* Signal Tower - vertical structure with base */}
                  <rect x="11" y="9" width="2" height="5" fill="currentColor"/>
                  <rect x="9.5" y="14" width="5" height="1.5" fill="currentColor"/>
                  {/* Signal waves - three curved lines on each side radiating from tower top */}
                  <path d="M6 11 Q12 9.5 18 11" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.7"/>
                  <path d="M5 13 Q12 11.5 19 13" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5"/>
                  <path d="M4 15 Q12 13.5 20 15" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.3"/>
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
                <span className="relative">Provider Schedule</span>
              </Link>
              <Link
                href="/services"
                className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 relative overflow-hidden ${
                  isActive('/services')
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                {isActive('/services') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                )}
                <span className="relative">Service Bookings</span>
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

