import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-slate-50 mb-2">Writersphere</h3>
            <p className="text-sm text-slate-400">
              For quiet thinkers, burned-out professionals, and engineers who want to express. Writing becomes exploration when you have structure.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/feed" className="text-sm text-slate-400 hover:text-slate-200 transition">
                  Feed
                </Link>
              </li>
              <li>
                <Link href="/?auth=true" className="text-sm text-slate-400 hover:text-slate-200 transition">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">About</h4>
            <p className="text-sm text-slate-400">
              Built to help you start writing without freezing. Perfectionism, procrastination, and imposter syndrome don&apos;t stand a chance against structured reflection.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            © {currentYear} Writersphere. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
