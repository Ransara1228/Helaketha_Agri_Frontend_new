import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-8 overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 via-teal-50 to-cyan-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="relative z-10 w-full max-w-6xl items-center justify-center text-center animate-slide-up">
        <div className="mb-10 relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 blur-3xl opacity-50 rounded-full animate-pulse-glow"></div>
          <div className="relative inline-flex p-8 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 rounded-3xl shadow-2xl transform hover:scale-110 transition-all duration-500 hover:rotate-6">
            <svg className="w-24 h-24 text-white animate-float" fill="currentColor" viewBox="0 0 24 24">
              {/* Three Leaves at top */}
              <path d="M12 2 Q10 4 11 6 Q12 8 13 6 Q14 4 12 2" fill="currentColor" opacity="0.9"/>
              <path d="M8 5 Q7 6 7.5 7.5 Q8 9 9 8 Q9.5 7 8 5" fill="currentColor" opacity="0.7"/>
              <path d="M16 5 Q17 6 16.5 7.5 Q16 9 15 8 Q14.5 7 16 5" fill="currentColor" opacity="0.7"/>
              {/* Signal Tower */}
              <rect x="11" y="9" width="2" height="5" fill="currentColor"/>
              <rect x="9.5" y="14" width="5" height="1.5" fill="currentColor"/>
              {/* Signal waves */}
              <path d="M6 11 Q12 9.5 18 11" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.7"/>
              <path d="M5 13 Q12 11.5 19 13" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5"/>
              <path d="M4 15 Q12 13.5 20 15" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.3"/>
            </svg>
          </div>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-extrabold mb-6 relative">
          <span className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 blur-2xl opacity-50"></span>
          <span className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Welcome to Helaketha Agri
          </span>
        </h1>
        
        <p className="text-2xl md:text-3xl text-gray-700 mb-3 font-bold">
          Agricultural Excellence Platform
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Link
            href="/farmers"
            className="group relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white px-6 py-6 rounded-2xl shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 font-extrabold text-base flex flex-col items-center justify-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <svg className="relative z-10 w-8 h-8 transform group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="relative z-10 text-center">Manage Farmers</span>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          </Link>
          <Link
            href="/tractor-drivers"
            className="group relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-6 py-6 rounded-2xl shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 font-extrabold text-base flex flex-col items-center justify-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <svg className="relative z-10 w-8 h-8 transform group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="relative z-10 text-center">Manage Tractor Drivers</span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          </Link>
          <Link
            href="/harvester-drivers"
            className="group relative bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white px-6 py-6 rounded-2xl shadow-2xl hover:shadow-teal-500/50 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 font-extrabold text-base flex flex-col items-center justify-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <svg className="relative z-10 w-8 h-8 transform group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="relative z-10 text-center">Manage Harvester Drivers</span>
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          </Link>
          <Link
            href="/fertilizer-suppliers"
            className="group relative bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white px-6 py-6 rounded-2xl shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 font-extrabold text-base flex flex-col items-center justify-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <svg className="relative z-10 w-8 h-8 transform group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="relative z-10 text-center">Manage Fertilizer Suppliers</span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          </Link>
          <Link
            href="/provider-schedules"
            className="group relative bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 text-white px-6 py-6 rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 font-extrabold text-base flex flex-col items-center justify-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <svg className="relative z-10 w-8 h-8 transform group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="relative z-10 text-center">Manage Provider Schedules</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          </Link>
          <Link
            href="/services"
            className="group relative bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 text-white px-6 py-6 rounded-2xl shadow-2xl hover:shadow-rose-500/50 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 font-extrabold text-base flex flex-col items-center justify-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <svg className="relative z-10 w-8 h-8 transform group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="relative z-10 text-center">Service Bookings</span>
            <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          </Link>
        </div>
      </div>
    </main>
  );
}

