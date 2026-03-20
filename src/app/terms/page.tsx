import Link from "next/link";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Terms of Service — Writersphere",
  description: "Terms and conditions for using Writersphere.",
};

const EFFECTIVE_DATE = "March 20, 2026";
const CONTACT_EMAIL = "contact@openworldregister.com";
const SITE_URL = "https://write.openworldregister.com";

export default function TermsPage() {
  return (
    <>
      <main className="page-shell">
        <div className="max-w-3xl mx-auto px-6 py-16 w-full">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-200 transition mb-8 inline-block">
            ← Back to Writersphere
          </Link>

          <h1 className="text-3xl font-bold text-slate-50 mb-2">Terms of Service</h1>
          <p className="text-sm text-slate-400 mb-10">Effective date: {EFFECTIVE_DATE}</p>

          <div className="prose prose-invert max-w-none space-y-8 text-slate-300 text-sm leading-relaxed">

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Writersphere at <a href={SITE_URL} className="text-slate-200 underline">{SITE_URL}</a> (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">2. Eligibility</h2>
              <p>
                You must be at least 13 years old to use the Service. By using the Service, you represent that you meet this requirement. If you are under 18, you represent that you have your parent or guardian&apos;s permission.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">3. Your Account</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You are responsible for all activity that occurs under your account.</li>
                <li>You must notify us immediately of any unauthorized use of your account.</li>
                <li>You may not create accounts for others without their permission.</li>
                <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">4. User Content</h2>
              <p className="mb-2">
                You retain ownership of all content you create and publish on Writersphere (&quot;User Content&quot;). By posting User Content, you grant us a non-exclusive, worldwide, royalty-free license to display, distribute, and store your content solely for the purpose of operating the Service.
              </p>
              <p className="mb-2">You agree not to post content that:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Infringes any third-party intellectual property rights</li>
                <li>Is defamatory, obscene, harassing, or hateful</li>
                <li>Contains malware, spam, or deceptive content</li>
                <li>Violates any applicable law or regulation</li>
                <li>Impersonates any person or entity</li>
              </ul>
              <p className="mt-3">
                We reserve the right to remove any content that violates these Terms without notice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">5. Intellectual Property</h2>
              <p>
                The Writersphere platform, including its design, code, and branding, is owned by Open World Register and protected by intellectual property laws. You may not copy, modify, distribute, or reverse-engineer any part of the platform without our written permission.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">6. Privacy</h2>
              <p>
                Your use of the Service is also governed by our{" "}
                <Link href="/privacy" className="text-slate-200 underline">Privacy Policy</Link>, which is incorporated into these Terms by reference.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">7. Third-Party Services</h2>
              <p>
                The Service integrates with third-party services including Google and GitHub for authentication. Your use of those services is governed by their respective terms and privacy policies. We are not responsible for the practices of third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">8. Disclaimers</h2>
              <p>
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">9. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, OPEN WORLD REGISTER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF DATA, PROFITS, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">10. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless Open World Register and its affiliates from any claims, damages, or expenses (including reasonable legal fees) arising from your use of the Service, your User Content, or your violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">11. Termination</h2>
              <p>
                We may suspend or terminate your access to the Service at any time, with or without cause, with or without notice. You may delete your account at any time. Upon termination, your right to use the Service ceases immediately.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">12. Governing Law</h2>
              <p>
                These Terms are governed by the laws of the United States. Any disputes arising from these Terms or your use of the Service shall be resolved in the courts of competent jurisdiction in the United States.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">13. Changes to Terms</h2>
              <p>
                We may update these Terms at any time. We will notify you by updating the effective date. Continued use of the Service after changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">14. Contact Us</h2>
              <p>
                For questions about these Terms, contact us at:{" "}
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
