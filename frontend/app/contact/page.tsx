import HeaderSection from "@/components/header-section";
import Contactform from "@/components/contact-form";

const Contactpage = () => {
  return (
    <div>
      <HeaderSection title="Contact Us" subTitle="We'd love to hear from you" />
      <div className="max-w-container mx-auto py-3xl px-margin-mobile md:px-margin-desktop">
        <div className="grid md:grid-cols-2 gap-2xl">
          <div>
            <p className="text-secondary text-xs font-semibold uppercase tracking-[0.2em] mb-md">
              Get in Touch
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface mb-6">
              Hubungi Kami Hari Ini
            </h1>
            <p className="text-on-surface-variant leading-relaxed mb-xl">
              Ada pertanyaan atau butuh bantuan terkait pemesanan? Tim customer support kami
              siap melayani 24/7 untuk membantu Anda.
            </p>
            <ul className="space-y-lg pt-2">
              <li className="flex gap-4">
                <div className="flex-none w-12 h-12 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-on-surface mb-1">Email</h4>
                  <p className="text-on-surface-variant text-sm">support@luxestay.com</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-none w-12 h-12 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined">call</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-on-surface mb-1">Phone</h4>
                  <p className="text-on-surface-variant text-sm">
                    +62 812 3456 7890, +62 811 2222 3333
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-none w-12 h-12 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-on-surface mb-1">Address</h4>
                  <p className="text-on-surface-variant text-sm">
                    Jl. Sudirman No. 1, Bojong, Serang, Banten
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <Contactform />
        </div>
      </div>
    </div>
  );
};

export default Contactpage;
