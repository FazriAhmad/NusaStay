import Link from "next/link";
import Logo from "@/components/logo";

const Footer = () => {
  return (
    <footer className="bg-primary-container text-on-primary-container">
      <div
        className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop"
        style={{ paddingTop: "4rem", paddingBottom: "4rem" }}
      >
        <div className="grid md:grid-cols-12 gap-8">
          {/* Brand block */}
          <div className="md:col-span-4">
            <div className="mb-md [&_a]:text-on-primary [&_span]:text-on-primary">
              <Logo />
            </div>
            <p className="text-on-primary-container/80 text-sm leading-relaxed">
              © 2026 Harmoni Stay Hospitality Group. All rights reserved.
            </p>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-2" />

          {/* Company + Support (right side) */}
          <div className="md:col-span-6 grid grid-cols-2 gap-2xl">
            <div>
              <h4 className="font-semibold mb-md text-on-primary">Company</h4>
              <ul className="space-y-3 text-on-primary-container/70 text-sm">
                <li>
                  <Link href="#" className="hover:text-on-primary transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-on-primary transition">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-md text-on-primary">Support</h4>
              <ul className="space-y-3 text-on-primary-container/70 text-sm">
                <li>
                  <Link href="#" className="hover:text-on-primary transition">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-on-primary transition">
                    Career
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
