import Link from "next/link";
import { OmMark } from "../ui/OmMark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <p className="eyebrow">
            <span className="footer-mark" aria-hidden="true">
              <OmMark />
            </span>
            Prarthana web
          </p>
          <h2>Secure temple connection for everyday devotion.</h2>
          <p>
            Prayer guidance, panchang, puja waitlists, and sacred video delivery are all routed through the same protected account.
          </p>
        </div>
        <div className="site-footer__links">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/contact-us">Contact</Link>
          <Link href="/sitemap">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}
