import Image from "next/image";
import HeaderSection from "@/components/header-section";

const AboutPage = () => {
  return (
    <div>
      <HeaderSection
        title="About Us"
        subTitle="Get to know Harmoni Stay Hospitality Group"
      />
      <div className="max-w-container mx-auto py-3xl px-margin-mobile md:px-margin-desktop">
        <div className="grid md:grid-cols-2 gap-2xl items-center">
          <div className="relative w-full h-[480px] rounded-2xl overflow-hidden">
            <Image
              src="/about-image.jpg"
              alt="About Harmoni Stay"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-secondary text-xs font-semibold uppercase tracking-[0.2em] mb-md">
              Our Story
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-on-surface mb-6">
              Who We Are
            </h2>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              Harmoni Stay Hospitality Group adalah platform booking hotel premium yang
              menghubungkan Anda dengan penginapan terbaik di seluruh Indonesia dan Asia
              Tenggara. Kami percaya setiap perjalanan layak mendapatkan pengalaman menginap
              yang berkesan.
            </p>
            <p className="text-on-surface-variant leading-relaxed mb-xl">
              Dengan standar layanan hospitality kelas dunia, kami berkomitmen untuk
              memberikan pengalaman menginap yang melebihi ekspektasi.
            </p>
            <ul className="space-y-md">
              <li className="flex gap-4">
                <div className="flex-none w-12 h-12 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined">visibility</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-on-surface mb-1">Vision</h4>
                  <p className="text-on-surface-variant text-sm">
                    Menjadi platform booking hotel paling terpercaya di Asia Tenggara,
                    dengan standar layanan premium di setiap penginapan.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-none w-12 h-12 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined">flag</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-on-surface mb-1">Mission</h4>
                  <p className="text-on-surface-variant text-sm">
                    Menyediakan pengalaman booking yang mudah, transparan, dan aman dengan
                    jaringan hotel pilihan yang telah kami kurasi khusus.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-none w-12 h-12 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined">favorite</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-on-surface mb-1">Values</h4>
                  <p className="text-on-surface-variant text-sm">
                    Kepercayaan, transparansi, dan pelayanan pelanggan yang responsif adalah
                    fondasi kami.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
