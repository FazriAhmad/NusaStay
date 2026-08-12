import Image from "next/image";

const HeaderSection = ({
  title,
  subTitle,
}: {
  title: string;
  subTitle: string;
}) => {
  return (
    <header className="relative h-80 text-on-primary overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/hero.jpg"
          alt="Header"
          fill
          className="object-cover object-center w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/50 to-primary/75" />
      </div>
      <div className="relative flex flex-col justify-center items-center h-80 text-center pt-16 px-margin-mobile">
        <p className="text-secondary-container text-xs font-semibold uppercase tracking-[0.25em] mb-md">
          Harmoni Stay
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight capitalize mb-2">
          {title}
        </h1>
        <p className="text-lg text-on-primary/90 max-w-[36rem]">{subTitle}</p>
      </div>
    </header>
  );
};

export default HeaderSection;
