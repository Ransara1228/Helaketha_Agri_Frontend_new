import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2 Q10 4 11 6 Q12 8 13 6 Q14 4 12 2 M12 4 L12 7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M12 2 Q10 4 11 6 Q12 8 13 6 Q14 4 12 2" fill="currentColor" opacity="0.9"/>
                </svg>
              </div>
              <span className="text-xl font-heading font-bold text-white">Helaketha Agri</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-xs">
              Connecting farmers, drivers, and suppliers for a thriving agricultural community.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/#about" className="hover:text-emerald-400 transition-colors">About</Link></li>
              <li><Link href="/#solutions" className="hover:text-emerald-400 transition-colors">Solutions</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</Link></li>
              <li><Link href="/#testimonials" className="hover:text-emerald-400 transition-colors">Testimonials</Link></li>
              <li><Link href="/#insights" className="hover:text-emerald-400 transition-colors">Insights</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2">
              <li><Link href="/#solutions" className="hover:text-emerald-400 transition-colors">Farmer Portal</Link></li>
              <li><Link href="/#solutions" className="hover:text-emerald-400 transition-colors">Tractor Services</Link></li>
              <li><Link href="/#solutions" className="hover:text-emerald-400 transition-colors">Harvester Services</Link></li>
              <li><Link href="/#solutions" className="hover:text-emerald-400 transition-colors">Fertilizer Supply</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +94 11 234 5678
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                helakethaagri@gmail.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Helaketha Agri. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-gray-500 hover:text-emerald-400 transition-colors text-sm">Privacy</Link>
            <Link href="#" className="text-gray-500 hover:text-emerald-400 transition-colors text-sm">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
