'use client';

import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export default function HomeClient() {
  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <ScrollReveal delay={0}>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] bg-gradient-to-br from-emerald-100 to-teal-200">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <img
              src="https://images.pexels.com/photos/213217/pexels-photo-213217.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Farm"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-sm font-semibold">+94 11 234 5678</span>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div>
            <p className="text-emerald-600 font-bold text-sm mb-2">5+ Years Experience</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              Healthy Farms, Fresh Harvests, Happy Farmers
            </h2>
            <p className="text-slate-600 mb-4">
              Helaketha Agri brings together farmers, tractor drivers, harvester operators, and fertilizer suppliers in one integrated platform.
            </p>
            <p className="text-slate-600 mb-4">
              Book services, manage schedules, and grow your agricultural business with confidence. Our platform ensures transparency, timely delivery, and fair pricing.
            </p>
            <ul className="space-y-3 mb-8 text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1 font-bold">✓</span>
                <span>Verified service providers across Sri Lanka</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1 font-bold">✓</span>
                <span>Real-time booking and schedule management</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1 font-bold">✓</span>
                <span>Transparent pricing and secure transactions</span>
              </li>
            </ul>
            <Link
              href="/#solutions"
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xl transition-all hover:-translate-y-0.5"
            >
              Discover Solutions
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
