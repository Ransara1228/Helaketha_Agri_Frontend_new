import Link from 'next/link';
import Footer from '@/components/Footer';
import KeycloakSignInButton from '@/components/KeycloakSignInButton';

export default function MainHomePage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50">
      {/* Hero Section */}
      <section className="relative pb-16 pt-24">
        {/* inside nav row */}
        <div className="fixed inset-x-0 top-0 z-50 border-b border-white/30 bg-white/70 backdrop-blur-xl shadow-sm animate-fade-in">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-5">
            <div className="flex items-center gap-3 animate-slide-in-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow animate-float">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2 Q10 4 11 6 Q12 8 13 6 Q14 4 12 2" />
                </svg>
              </div>
              <div>
                <p className="font-heading text-xl font-extrabold text-slate-900">Helaketha Agri</p>
                <p className="text-xs text-slate-500">Agriculture Excellence</p>
              </div>
            </div>
            <div className="hidden items-center gap-6 lg:flex animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <Link href="/" className="text-sm font-semibold text-emerald-600">Home</Link>
              <Link href="/#about" className="text-sm font-medium text-slate-700 hover:text-emerald-600">About</Link>
              <Link href="/#solutions" className="text-sm font-medium text-slate-700 hover:text-emerald-600">Solutions</Link>
              <Link href="/#how-it-works" className="text-sm font-medium text-slate-700 hover:text-emerald-600">How It Works</Link>
              <Link href="/#insights" className="text-sm font-medium text-slate-700 hover:text-emerald-600">Insights</Link>
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3 animate-slide-in-right">
              <KeycloakSignInButton
                callbackUrl="/login"
                className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-600 sm:px-5 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* full-width hero visual */}
        <div
          className="relative min-h-[76vh] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&w=2000')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/85 via-emerald-900/70 to-emerald-900/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

          <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center px-6 py-20 sm:px-10 lg:px-14">
            <div className="max-w-xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100 animate-fade-in">
                Welcome to Agriculture Platform
              </p>
              <h1 className="font-heading text-5xl font-extrabold leading-tight text-white sm:text-6xl md:text-7xl animate-slide-up">
                Agriculture
                <br />
                & Eco Farming
              </h1>
              <p className="mt-6 text-base leading-relaxed text-emerald-50/95 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Connect with trusted tractor drivers, harvester operators, and fertilizer suppliers from one smart digital platform.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3 animate-slide-up" style={{ animationDelay: '0.35s' }}>
                <Link
                  href="/#discover"
                  className="inline-flex items-center rounded-lg bg-amber-400 px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-300 hover:-translate-y-0.5"
                >
                  Discover More
                </Link>
                <Link
                  href="/#how-it-works"
                  className="inline-flex items-center rounded-lg border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 hover:-translate-y-0.5"
                >
                  How It Works
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discover / Features */}
      <section id="discover" className="relative bg-white py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
          <div className="relative animate-slide-in-left">
            <div className="overflow-hidden rounded-[24px] border border-slate-200 shadow-xl">
              <img
                src="https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Fresh farm produce"
                className="h-[420px] w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="absolute -bottom-7 -right-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-xl sm:right-6 animate-float">
              <p className="text-xs uppercase tracking-wider text-slate-500">Support</p>
              <p className="mt-1 text-sm font-extrabold text-emerald-700">+94 71 000 0000</p>
            </div>
          </div>

          <div className="animate-slide-in-right">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600 animate-fade-in">Trusted Farming Platform</p>
            <h2 className="mt-4 font-heading text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl animate-slide-up">
              Be Healthy & Eat
              <br />
              Fresh From Farm
            </h2>
            <p className="mt-5 text-slate-600">
              We connect farmers with service providers through one easy platform for booking, supplier discovery, and farm management.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2"><span className="text-emerald-600">•</span>Verified tractors, harvesters, and fertilizer suppliers</li>
              <li className="flex items-start gap-2"><span className="text-emerald-600">•</span>Fast booking flow with clear status tracking</li>
              <li className="flex items-start gap-2"><span className="text-emerald-600">•</span>Transparent pricing and better planning support</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/#solutions" className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
                Discover More
              </Link>
              <Link href="/#how-it-works" className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Learn Process
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="relative py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-3">Our Solutions</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
              Everything You Need for Modern Farming
            </h2>
            <p className="text-slate-600 text-lg">
              From land preparation to harvest and fertilizer supply-we connect you with trusted service providers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                ),
                title: 'Tractor Services',
                desc: 'Book tractors for plowing, tilling, and land preparation.',
                iconClass: 'bg-emerald-100 text-emerald-600',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                ),
                title: 'Harvester Services',
                desc: 'Schedule combine harvesters for rice and grain harvest.',
                iconClass: 'bg-amber-100 text-amber-600',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                ),
                title: 'Fertilizer Supply',
                desc: 'Order quality fertilizers from verified suppliers.',
                iconClass: 'bg-teal-100 text-teal-600',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                ),
                title: 'Service Bookings',
                desc: 'Manage schedules and track all your bookings.',
                iconClass: 'bg-green-100 text-green-600',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group card-hover-effect bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300 hover:-translate-y-2 animate-scale-in"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ${item.iconClass}`}>
                  {item.icon}
                </div>
                <h3 className="font-heading font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-3">Simple Process</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-slate-600 text-lg">
              Get started in three simple steps-whether you&apos;re a farmer or a service provider.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Sign Up', desc: 'Create your account as a farmer, tractor driver, harvester operator, or fertilizer supplier.' },
              { step: '02', title: 'Book or Offer', desc: 'Farmers book services; providers manage their schedules and availability.' },
              { step: '03', title: 'Grow Together', desc: 'Complete transactions, build trust, and grow the agricultural community.' },
            ].map((item, i) => (
              <div key={i} className="relative text-center animate-fade-in" style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="font-heading text-6xl font-bold text-emerald-100 mb-4">{item.step}</div>
                <h3 className="font-heading font-bold text-slate-900 text-xl mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-emerald-200 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-3">Testimonials</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
              Trusted by Farmers & Providers
            </h2>
            <p className="text-slate-600 text-lg">
              See what our community says about Helaketha Agri.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: 'Booking tractors has never been easier. I get my land prepared on time, every season.', name: 'Sunil Perera', role: 'Rice Farmer, Kurunegala' },
              { quote: 'As a tractor driver, I manage my schedule and earnings through one dashboard. Highly recommend!', name: 'Nimal Silva', role: 'Tractor Operator' },
              { quote: 'Transparent pricing and verified suppliers. Helaketha Agri transformed how we source fertilizers.', name: 'Chamari Fernando', role: 'Farm Manager' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-emerald-100 transition-colors animate-slide-up" style={{ animationDelay: `${i * 0.12}s` }}>
                <svg className="w-10 h-10 text-emerald-200 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-slate-600 mb-6">&ldquo;{item.quote}&rdquo;</p>
                <div>
                  <p className="font-heading font-bold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insights / Vlogs */}
      <section id="insights" className="relative py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-3">Insights</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
              Farming Tips & Industry News
            </h2>
            <p className="text-slate-600 text-lg">
              Stay updated with best practices, seasonal advice, and platform updates.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Best Time for Paddy Harvest',
                tag: 'Seasonal',
                desc: 'Plan harvesting with weather and grain maturity for better yield and lower post-harvest loss.',
                img: 'https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=900',
              },
              {
                title: 'Choosing the Right Fertilizer',
                tag: 'Tips',
                desc: 'Compare crop stage, soil condition, and nutrient balance before selecting fertilizer inputs.',
                img: 'https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&w=900',
              },
              {
                title: 'Tractor Maintenance Guide',
                tag: 'Resources',
                desc: 'Follow a simple weekly checklist to improve machine life, safety, and field performance.',
                img: 'https://images.pexels.com/photos/219794/pexels-photo-219794.jpeg?auto=compress&cs=tinysrgb&w=900',
              },
            ].map((item, i) => (
              <Link
                key={i}
                href="#"
                className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300 hover:-translate-y-2 animate-scale-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">{item.tag}</span>
                  <h3 className="font-heading font-bold text-slate-900 mt-2 group-hover:text-emerald-600 transition-colors">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="relative py-24 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <h2 className="font-heading text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto">
            Join hundreds of farmers and service providers already using Helaketha Agri. Sign in to access your dashboard and start booking today.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-emerald-700 font-bold rounded-xl shadow-xl hover:bg-emerald-50 transition-all hover:-translate-y-0.5"
          >
            Sign In to Get Started
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
