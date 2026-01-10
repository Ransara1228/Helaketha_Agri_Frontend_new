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
            <svg className="w-24 h-24 text-white animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
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
        
        <p className="text-lg md:text-xl text-gray-600 mb-16 max-w-3xl mx-auto font-medium leading-relaxed">
          Your modern Next.js + TypeScript + React application is ready! 
          <br />
          Manage your farming community with precision, efficiency, and style.
        </p>
        
        <div className="flex justify-center gap-6">
          <Link
            href="/farmers"
            className="group relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white px-10 py-5 rounded-2xl shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 font-extrabold text-xl flex items-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <svg className="relative z-10 w-6 h-6 transform group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="relative z-10">Manage Farmers</span>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          </Link>
        </div>
      </div>
    </main>
  );
}

