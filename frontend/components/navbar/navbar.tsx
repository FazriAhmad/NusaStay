import Logo from "@/components/logo";
import Navlink from "@/components/navbar/navlink";

const Navbar = () => {
  return (
    <header className="sticky top-0 left-0 w-full bg-surface-container-lowest/95 backdrop-blur-sm border-b border-outline-variant z-20">
      <div className="max-w-container mx-auto flex items-center justify-between px-margin-mobile md:px-margin-desktop py-4">
        <Logo />
        <Navlink />
      </div>
    </header>
  );
};

export default Navbar;
