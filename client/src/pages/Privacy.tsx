{/* <!--
  ⚠️ IMPORTANT: This is a template privacy policy. 
  Review with legal counsel before launch.
  Last template update: 2024
--> */}
export default function Privacy() {
  const lastUpdated = '2024';
  const companyName = 'MadeWayHomes';
  const contactEmail = 'hello@madewayhomes.com';

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────── */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-brand-black mb-2">Privacy Policy</h1>
          <p className="text-brand-gray-dark text-sm">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* ── Content ────────────────────────────────────────────── */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-sm max-w-none text-brand-gray-dark leading-relaxed space-y-8">
            <p>
              This Privacy Policy describes how {companyName} ("we," "our," or "us") collects, uses, 
              and shares information when you use our website and services (the "Platform").
            </p>

            {/* ── Information We Collect ──────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">1. Information We Collect</h2>
              <p className="mb-3"><strong>Information you provide directly:</strong></p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Contact information: name, email address, phone number, and mailing address when you create an account, submit a service request, or contact us.</li>
                <li>Service request details: description of the work needed, project photos, budget preferences, and preferred timeline.</li>
                <li>Provider application information: business name, contact details, service offerings, and proof of business credentials.</li>
                <li>Communications: messages sent through our contact form or to our email address.</li>
              </ul>
              <p className="mt-3"><strong>Information collected automatically:</strong></p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Usage data: pages visited, time spent, links clicked, and referring URLs.</li>
                <li>Device information: browser type, operating system, IP address, and device identifiers.</li>
                <li>Cookies and similar technologies (see Section 4).</li>
              </ul>
            </div>

            {/* ── How We Use Information ──────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>To operate the Platform: matching service requests with providers, managing user accounts, and facilitating communications.</li>
                <li>To communicate with you: sending confirmations, updates, responses to inquiries, and administrative messages.</li>
                <li>To improve our services: analyzing usage patterns to enhance the Platform experience.</li>
                <li>To comply with legal obligations: responding to lawful requests and enforcing our Terms of Service.</li>
              </ul>
              <p className="mt-3">
                We do <strong>not</strong> sell your personal information to third parties.
              </p>
            </div>

            {/* ── Sharing ────────────────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">3. How We Share Information</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>With service providers:</strong> When you submit a service request, we share the details (including your contact information) with matched providers so they can reach out to you about your project.</li>
                <li><strong>With service partners:</strong> We may use trusted third-party services for hosting, analytics, and email delivery, who process data on our behalf.</li>
                <li><strong>As required by law:</strong> We may disclose information if required to do so by law or in response to valid legal requests.</li>
                <li><strong>Business transfers:</strong> In the event of a merger or acquisition, user information may be transferred as part of the transaction.</li>
              </ul>
            </div>

            {/* ── Cookies ────────────────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">4. Cookies</h2>
              <p>
                We use cookies and similar technologies to provide and improve the Platform. Cookies are small 
                text files stored on your device. We use them for:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Essential cookies:</strong> Required for the Platform to function (e.g., authentication, security).</li>
                <li><strong>Analytics cookies:</strong> Help us understand how the Platform is used and improve it.</li>
              </ul>
              <p className="mt-3">
                You can control cookies through your browser settings. Disabling cookies may affect Platform functionality.
              </p>
            </div>

            {/* ── Data Retention ─────────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">5. Data Retention</h2>
              <p>
                We retain your information for as long as your account is active or as needed to provide services. 
                We may retain certain information for longer periods as required by law or for legitimate business 
                purposes (such as resolving disputes and enforcing our Terms). When we no longer need your 
                information, we securely delete or anonymize it.
              </p>
            </div>

            {/* ── Your Rights ────────────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">6. Your Rights</h2>
              <p>Depending on your jurisdiction, you may have rights to:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Access the personal information we hold about you.</li>
                <li>Correct inaccurate or incomplete information.</li>
                <li>Request deletion of your information (subject to legal and operational requirements).</li>
                <li>Opt out of marketing communications (you can unsubscribe at any time).</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, contact us at the email below.
              </p>
            </div>

            {/* ── Security ───────────────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">7. Security</h2>
              <p>
                We implement reasonable security measures to protect your information, including encryption in 
                transit, secure authentication, and access controls. However, no method of electronic storage 
                is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>

            {/* ── Children ───────────────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">8. Children's Privacy</h2>
              <p>
                The Platform is not intended for individuals under 18. We do not knowingly collect personal 
                information from children. If you believe a child has provided us with information, please 
                contact us immediately.
              </p>
            </div>

            {/* ── Changes ────────────────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will post the updated version on this 
                page with a revised "Last updated" date. Continued use of the Platform after changes constitutes 
                acceptance of the updated policy.
              </p>
            </div>

            {/* ── Contact ────────────────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">10. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or wish to exercise your rights, contact us at:
              </p>
              <p className="mt-2">
                <a href={`mailto:${contactEmail}`} className="text-brand-red hover:underline font-medium">
                  {contactEmail}
                </a>
              </p>
              <p className="text-sm mt-2">MadeWayHomes — Lenoir, Caldwell County, North Carolina</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
