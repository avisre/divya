import { Hero } from "../../components/content/Hero";
import { Section } from "../../components/content/Section";

const LAST_UPDATED = "June 7, 2026";
const CONTACT_EMAIL = "avinashsreekumar007@gmail.com";
const DEVELOPER_NAME = "FPS-77";
const APP_NAME = "Praarthana: Hindu Prayers";
const APP_PACKAGE = "com.praarthana.prayerapp.avinash";

export const metadata = {
  title: "Privacy Policy — Praarthana",
  description:
    "Privacy Policy for Praarthana: Hindu Prayers — what we collect, how we use it, who we share it with, and your rights.",
};

export default function PrivacyPage() {
  return (
    <div className="page-stack">
      <Hero
        eyebrow="Privacy Policy"
        title={`Privacy Policy for ${APP_NAME}`}
        subtitle={`This Privacy Policy describes how ${DEVELOPER_NAME} ("we", "us", "our") collects, uses, shares, and protects information when you use the ${APP_NAME} mobile application (package ${APP_PACKAGE}) and the web service at praarthana.com (together, the "Service"). Last updated ${LAST_UPDATED}.`}
      />

      <Section title="1. Who we are" subtitle="The entity responsible for your data">
        <div className="surface-card">
          <p>
            The Service is operated by <strong>{DEVELOPER_NAME}</strong>, the developer named on the Google Play Store listing for {APP_NAME}. For any privacy question, request, or complaint, contact <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We are the data controller for the personal data we process about you.
          </p>
        </div>
      </Section>

      <Section title="2. What we collect" subtitle="Personal and sensitive data the Service handles">
        <div className="content-grid">
          <div className="surface-card">
            <h3>Account information</h3>
            <p>When you create an account or sign in (with email + password, or through Google Sign-In), we collect your name, email address, timezone, country, and reminder preferences. If you sign in with Google, we receive your name, email, and Google account identifier — we do not receive your Google password or contacts.</p>
          </div>
          <div className="surface-card">
            <h3>Devotional activity</h3>
            <p>We store your prayer favorites, booking records (puja services you reserve), support requests you submit, and records of which sacred videos you have accessed. This data is linked to your account and used to deliver the Service.</p>
          </div>
          <div className="surface-card">
            <h3>Payment information</h3>
            <p>If you subscribe to the Vidya tier or any paid product, payment is processed by <strong>Stripe, Inc.</strong> We do not store your full card number, CVC, or banking details on our servers. We retain a Stripe customer identifier, subscription status, and the last four digits of your card to display in your profile and to manage your subscription.</p>
          </div>
          <div className="surface-card">
            <h3>Device and technical data</h3>
            <p>When you use the Service, we automatically receive: a Firebase Cloud Messaging device token (if you allow push notifications), your IP address, device model and OS version (from request headers), app version, language and locale, and crash diagnostics reported through Google Play. We do not collect contacts, calendar entries, photos, microphone audio, precise location, or messages.</p>
          </div>
          <div className="surface-card">
            <h3>Cookies and session storage</h3>
            <p>The web service uses secure, HttpOnly session cookies to keep you signed in. We do not use advertising cookies or third-party tracking pixels for advertising. We use a small number of strictly-necessary first-party cookies for authentication, CSRF protection, and load balancing.</p>
          </div>
          <div className="surface-card">
            <h3>What we do not collect</h3>
            <p>We do not access your contacts, calendar, photos, microphone, camera, SMS, call logs, files, or precise location. We do not use advertising SDKs, AdMob, Facebook Audience Network, or behavioural-tracking SDKs. We do not sell personal data.</p>
          </div>
        </div>
      </Section>

      <Section title="3. How we use your data" subtitle="The legal bases and purposes of processing">
        <div className="surface-card">
          <ul>
            <li><strong>Provide and personalize the Service</strong> — show prayers, mantras, chapters, and bookings tailored to your locale, language, and preferences. (Legal basis: contract performance.)</li>
            <li><strong>Account management</strong> — create your account, authenticate sign-ins, manage your subscription, respond to support requests. (Legal basis: contract.)</li>
            <li><strong>Send notifications</strong> — push reminders for prayer routines, panchang updates, booking confirmations, and important account or service messages. (Legal basis: consent for non-essential reminders; contract for booking and account messages.)</li>
            <li><strong>Process payments</strong> — manage subscription billing via Stripe. (Legal basis: contract.)</li>
            <li><strong>Security and fraud prevention</strong> — detect abuse, prevent unauthorized access, investigate violations of our terms. (Legal basis: legitimate interest.)</li>
            <li><strong>Comply with law</strong> — respond to lawful requests from courts, regulators, or law enforcement; meet tax, accounting, and consumer-protection obligations. (Legal basis: legal obligation.)</li>
            <li><strong>Improve the Service</strong> — analyse aggregated, de-identified usage patterns to fix bugs and prioritise features. We do not profile individual users for behavioural advertising. (Legal basis: legitimate interest.)</li>
          </ul>
        </div>
      </Section>

      <Section title="4. Who we share data with" subtitle="Sub-processors and third parties">
        <div className="content-grid">
          <div className="surface-card">
            <h3>Google LLC</h3>
            <p>For Google Sign-In authentication, Firebase Cloud Messaging push notifications, and Google Play Billing or Console diagnostics. Google processes the minimum data needed to deliver these services under its own privacy terms.</p>
          </div>
          <div className="surface-card">
            <h3>Stripe, Inc.</h3>
            <p>For all payment processing, subscription billing, and tax compliance. When you check out, your payment details go directly to Stripe under their <a href="https://stripe.com/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</p>
          </div>
          <div className="surface-card">
            <h3>MongoDB Atlas</h3>
            <p>For storing your account and activity records, hosted on MongoDB Atlas (operated by MongoDB, Inc.). Data is stored in encrypted form at rest and in transit.</p>
          </div>
          <div className="surface-card">
            <h3>Cloud and infrastructure providers</h3>
            <p>Our API, web service, and content delivery use commercial cloud hosting (server, CDN, DNS) under standard contractual data-processing agreements. They process the data only on our instructions and do not receive marketing access to your data.</p>
          </div>
          <div className="surface-card">
            <h3>When required by law</h3>
            <p>We may share data with courts, regulators, or law enforcement if required by a valid legal process, to protect our rights or property, or to prevent harm.</p>
          </div>
          <div className="surface-card">
            <h3>Business transfers</h3>
            <p>If the Service is acquired by or merged with another organisation, your data may be transferred to the successor entity. We will notify you and update this policy before any such change takes effect.</p>
          </div>
          <div className="surface-card">
            <h3>We do not sell or rent your data</h3>
            <p>We do not sell personal data, share it for cross-context behavioural advertising, or rent it. California residents have a right to direct us not to &quot;sell&quot; or &quot;share&quot; personal data under the CCPA / CPRA — we already do neither.</p>
          </div>
        </div>
      </Section>

      <Section title="5. Data retention and deletion" subtitle="How long we keep your data and how to delete it">
        <div className="surface-card">
          <ul>
            <li><strong>Account data</strong> is retained for as long as your account is active.</li>
            <li><strong>Booking records</strong> are retained for up to 24 months after the booking date, to support customer service, refunds, and dispute resolution.</li>
            <li><strong>Payment records</strong> are retained for as long as required by tax, accounting, and consumer-protection law in the applicable jurisdiction (typically 6–10 years), then deleted or anonymised.</li>
            <li><strong>Push tokens</strong> are deleted within 30 days of you disabling notifications or signing out.</li>
            <li><strong>Server logs and security data</strong> are retained for up to 90 days, except where a longer retention is required to investigate a security incident.</li>
            <li><strong>Deleted accounts</strong> — when you delete your account, we delete your account and devotional activity from our active systems within 30 days, and from encrypted backups within 90 days. Anonymised, aggregated statistics may be retained for analytics. Payment records required for legal compliance are retained as described above.</li>
          </ul>
          <p>
            <strong>How to delete your account.</strong> In the mobile app: <em>Profile → Account → Delete account</em>. From the web: sign in at praarthana.com and use the same path, or email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the address on your account. Deletion is irreversible. You may also submit a deletion request without using the app by emailing <a href={`mailto:${CONTACT_EMAIL}?subject=Account+deletion+request`}>{CONTACT_EMAIL}</a>; we verify your identity using the email tied to the account, then complete deletion within 30 days.
          </p>
        </div>
      </Section>

      <Section title="6. Your rights" subtitle="What you can ask us to do">
        <div className="surface-card">
          <p>
            Depending on where you live, you have some or all of the following rights regarding your personal data:
          </p>
          <ul>
            <li><strong>Access</strong> — request a copy of the personal data we hold about you.</li>
            <li><strong>Rectification</strong> — ask us to correct inaccurate or incomplete data.</li>
            <li><strong>Erasure</strong> — ask us to delete your data (sometimes called the &quot;right to be forgotten&quot;).</li>
            <li><strong>Restriction</strong> — ask us to limit how we process your data.</li>
            <li><strong>Portability</strong> — receive your data in a structured, machine-readable format and transmit it to another controller.</li>
            <li><strong>Objection</strong> — object to processing based on legitimate interest.</li>
            <li><strong>Withdraw consent</strong> — for any processing based on consent, you can withdraw it at any time.</li>
            <li><strong>Opt out of &quot;sale&quot; or &quot;sharing&quot;</strong> — under the CCPA / CPRA. (We do neither, but the right is preserved.)</li>
            <li><strong>Lodge a complaint</strong> — with a supervisory authority (in the EU/UK) or your state attorney general (in the US).</li>
          </ul>
          <p>
            To exercise any of these rights, email <a href={`mailto:${CONTACT_EMAIL}?subject=Privacy+rights+request`}>{CONTACT_EMAIL}</a>. We will respond within 30 days (or 45 days under the CCPA, with a notification if we need an extension). There is no charge for reasonable requests.
          </p>
        </div>
      </Section>

      <Section title="7. Security" subtitle="How we protect your data">
        <div className="surface-card">
          <ul>
            <li>All traffic between your device and our servers uses HTTPS / TLS encryption.</li>
            <li>Web sessions are kept in secure, <code>HttpOnly</code>, <code>SameSite=Lax</code> cookies that JavaScript cannot read.</li>
            <li>Passwords are hashed with a modern algorithm (bcrypt) before storage; we never store cleartext passwords.</li>
            <li>Payment processing is handled directly by Stripe; full card numbers never reach our servers.</li>
            <li>Data is stored encrypted at rest on managed cloud infrastructure (MongoDB Atlas with AES-256 encryption).</li>
            <li>Production secrets are stored outside of source control and rotated periodically.</li>
            <li>Access to the production database is limited to authorized maintainers and is logged.</li>
            <li>We have a documented process to notify affected users within 72 hours of becoming aware of a personal-data breach that is likely to affect their rights, in line with GDPR Article 33.</li>
          </ul>
          <p>
            No system is perfectly secure. If you believe your account has been compromised, contact <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> immediately.
          </p>
        </div>
      </Section>

      <Section title="8. Children's privacy" subtitle="Our policy on users under 13">
        <div className="surface-card">
          <p>
            The Service is intended for users aged 13 and above. We do not knowingly collect personal data from children under 13 (or under 16 where local law sets a higher age of digital consent). If you are a parent or guardian and believe your child has provided personal data without your consent, contact <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will delete the data promptly. The Service is not directed at children and we do not target advertising at any user.
          </p>
        </div>
      </Section>

      <Section title="9. International data transfers" subtitle="How your data moves across borders">
        <div className="surface-card">
          <p>
            We operate from India and serve a global audience. Your data may be processed in India, the United States (where Google, Stripe, and MongoDB Atlas operate datacentres), the European Union, or other locations where our sub-processors operate. Where data leaves your jurisdiction, we rely on appropriate safeguards — such as Standard Contractual Clauses (for transfers out of the EEA/UK), India&apos;s Digital Personal Data Protection Act 2023 transfer rules, or equivalent contractual protections — to ensure your data continues to be protected to the standard required by your local law.
          </p>
        </div>
      </Section>

      <Section title="10. Marketing communications" subtitle="Newsletters and promotional messages">
        <div className="surface-card">
          <p>
            We only send marketing emails or push notifications if you have explicitly opted in. You can opt out of marketing emails at any time using the unsubscribe link in the message; you can opt out of push notifications in your device settings or in the app&apos;s notification preferences. Transactional and security messages (booking confirmations, account alerts, password resets) are not marketing and will continue while your account is active.
          </p>
        </div>
      </Section>

      <Section title="11. Changes to this policy" subtitle="How we notify you of updates">
        <div className="surface-card">
          <p>
            We will update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the top of this page reflects the most recent revision. For material changes that affect how we collect, use, or share your personal data, we will notify you in the app and/or by email at least 14 days before the change takes effect. Continued use of the Service after a change indicates your acceptance of the updated policy.
          </p>
        </div>
      </Section>

      <Section title="12. Contact us" subtitle="Privacy point of contact">
        <div className="surface-card">
          <p>
            For privacy questions, requests, or complaints, contact:
          </p>
          <p>
            <strong>{DEVELOPER_NAME}</strong><br />
            Privacy inquiries: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><br />
            App listing: <a href={`https://play.google.com/store/apps/details?id=${APP_PACKAGE}`} target="_blank" rel="noreferrer">{APP_NAME} on Google Play</a><br />
            Web: <a href="https://www.praarthana.com" target="_blank" rel="noreferrer">www.praarthana.com</a>
          </p>
          <p>
            If you are located in the EU/UK, you have the right to lodge a complaint with your local data-protection authority. If you are located in California, you have the right to contact the California Attorney General. We invite you to come to us first so we can try to resolve the issue.
          </p>
        </div>
      </Section>
    </div>
  );
}
