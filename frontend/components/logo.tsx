import Link from "next/link";

type Props = {
  href?: string;
  variant?: "default" | "sidebar";
  className?: string;
};

const Logo = ({ href = "/", variant = "default", className = "" }: Props) => {
  const textColor = variant === "sidebar" ? "text-on-surface" : "text-on-surface";
  const circleBg = variant === "sidebar" ? "bg-secondary" : "bg-primary";

  return (
    <Link href={href} className={`flex items-center gap-2 ${className}`}>
      <span
        className={`w-8 h-8 rounded-full ${circleBg} text-on-primary flex items-center justify-center font-bold text-lg`}
      >
        H
      </span>
      <span className={`font-display font-bold text-xl ${textColor}`}>Harmoni Stay</span>
    </Link>
  );
};

export default Logo;
