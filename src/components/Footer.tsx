import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-slate-50 mb-2">Writersphere</h3>
            <p className="text-sm text-slate-400">
              For quiet thinkers who want to beat perfectionism by embracing structured reflection.
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
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {currentYear} Writersphere. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-slate-500 hover:text-slate-300 transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-slate-500 hover:text-slate-300 transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
