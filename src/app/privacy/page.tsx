import Link from "next/link";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Privacy Policy — Writersphere",
  description: "How Writersphere collects, uses, and protects your personal information.",
};

const EFFECTIVE_DATE = "March 20, 2026";
const CONTACT_EMAIL = "contact@openworldregister.com";
const SITE_URL = "https://write.openworldregister.com";

export default function PrivacyPage() {
  return (
    <>
      <main className="page-shell">
        <div className="max-w-3xl mx-auto px-6 py-16 w-full">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-200 transition mb-8 inline-block">
            ← Back to Writersphere
          </Link>

          <h1 className="text-3xl font-bold text-slate-50 mb-2">Privacy Policy</h1>
          <p className="text-sm text-slate-400 mb-10">Effective date: {EFFECTIVE_DATE}</p>

          <div className="prose prose-invert max-w-none space-y-8 text-slate-300 text-sm leading-relaxed">

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">1. Who We Are</h2>
              <p>
                Writersphere (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is operated by Open World Register and accessible at{" "}
                <a href={SITE_URL} className="text-slate-200 underline">{SITE_URL}</a>. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">2. Information We Collect</h2>
              <p className="mb-2"><strong className="text-slate-200">Information you provide directly:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Email address and password (for email/password sign-up)</li>
                <li>Display name</li>
                <li>Content you create: articles, categories, tags</li>
                <li>Profile information you choose to add</li>
              </ul>
              <p className="mt-3 mb-2"><strong className="text-slate-200">Information from third-party sign-in (Google, GitHub):</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Email address</li>
                <li>Name and profile picture (as provided by the OAuth provider)</li>
                <li>OAuth provider user ID</li>
              </ul>
              <p className="mt-3 mb-2"><strong className="text-slate-200">Information collected automatically:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Log data (IP address, browser type, pages visited, timestamps)</li>
                <li>Device information</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To provide, operate, and maintain the platform</li>
                <li>To authenticate your identity and manage your account</li>
                <li>To display your content to other users (if you publish it)</li>
                <li>To send transactional emails (e.g., email confirmation, password reset)</li>
                <li>To analyze usage and improve our service</li>
                <li>To comply with legal obligations</li>
              </ul>
              <p className="mt-3">We do <strong className="text-slate-200">not</strong> sell your personal data to third parties.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">4. Data Storage and Security</h2>
              <p>
                Your data is stored using <strong className="text-slate-200">Supabase</strong> (PostgreSQL database hosted on AWS) and <strong className="text-slate-200">Cloudflare R2</strong> for media files. We implement industry-standard security measures including encryption in transit (TLS) and at rest. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">5. Cookies</h2>
              <p>
                We use essential cookies to maintain your session and authentication state. We do not use advertising or tracking cookies. You can disable cookies in your browser settings, but this may affect platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">6. Third-Party Services</h2>
              <p className="mb-2">We use the following third-party services that may process your data:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-slate-200">Supabase</strong> — authentication and database (<a href="https://supabase.com/privacy" className="text-slate-200 underline" target="_blank" rel="noopener noreferrer">privacy policy</a>)</li>
                <li><strong className="text-slate-200">Google OAuth</strong> — optional sign-in (<a href="https://policies.google.com/privacy" className="text-slate-200 underline" target="_blank" rel="noopener noreferrer">privacy policy</a>)</li>
                <li><strong className="text-slate-200">GitHub OAuth</strong> — optional sign-in (<a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" className="text-slate-200 underline" target="_blank" rel="noopener noreferrer">privacy policy</a>)</li>
                <li><strong className="text-slate-200">Cloudflare R2</strong> — media storage (<a href="https://www.cloudflare.com/privacypolicy/" className="text-slate-200 underline" target="_blank" rel="noopener noreferrer">privacy policy</a>)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">7. Your Rights</h2>
              <p className="mb-2">Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and associated data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Data portability (receive your data in a machine-readable format)</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, contact us at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-slate-200 underline">{CONTACT_EMAIL}</a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">8. Data Retention</h2>
              <p>
                We retain your data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or compliance purposes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">9. Children&apos;s Privacy</h2>
              <p>
                Writersphere is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, contact us and we will delete it.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the effective date at the top of this page. Continued use of the platform after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">11. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, contact us at:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-slate-200 underline">{CONTACT_EMAIL}</a>
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
