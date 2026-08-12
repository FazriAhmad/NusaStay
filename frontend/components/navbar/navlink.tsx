"use client";

import { IoClose, IoMenu } from "react-icons/io5";
import { IoNotificationsOutline, IoHelpCircleOutline } from "react-icons/io5";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const linkBase =
  "text-sm font-medium transition-colors hover:text-secondary px-1 py-2";

const Navlink = () => {
  const [open, setOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const linkClass = (href: string) =>
    clsx(
      linkBase,
      isActive(href) ? "text-secondary" : "text-on-surface-variant"
    );

  return (
    <>
      <div className="hidden md:flex items-center gap-8">
        <Link href="/" className={linkClass("/")}>
          Hotels
        </Link>
        <Link href="/myreservation" className={linkClass("/myreservation")}>
          My Bookings
        </Link>
        <Link href="/saved" className={linkClass("/saved")}>
          Saved
        </Link>
        <Link href="/contact" className={linkClass("/contact")}>
          Support
        </Link>
        {user?.role === "admin" && (
          <Link href="/admin/dashboard" className={linkClass("/admin/dashboard")}>
            Admin Panel
          </Link>
        )}
        <button
          type="button"
          aria-label="Notifications"
          className="p-2.5 rounded-full hover:bg-surface-container text-secondary transition"
        >
          <IoNotificationsOutline className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Help"
          className="p-2.5 rounded-full hover:bg-surface-container text-secondary transition"
        >
          <IoHelpCircleOutline className="size-5" />
        </button>
        {loading ? null : user ? (
          <button
            type="button"
            onClick={() => logout()}
            className="ml-1 py-2.5 px-5 bg-primary text-on-primary rounded-lg hover:opacity-90 cursor-pointer transition"
          >
            Sign Out
          </button>
        ) : (
          <Link
            href="/signin"
            className="ml-1 py-2.5 px-5 bg-primary text-on-primary rounded-lg hover:opacity-90 transition"
          >
            Sign In
          </Link>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center p-2 text-on-surface-variant md:hidden"
        aria-label="Toggle menu"
      >
        {!open ? <IoMenu className="size-7" /> : <IoClose className="size-7" />}
      </button>

      <div className={clsx("w-full md:hidden", { hidden: !open })}>
        <ul className="flex flex-col gap-sm p-md mt-sm bg-surface-container-lowest border border-outline-variant rounded-lg">
          <li>
            <Link href="/" onClick={() => setOpen(false)} className={linkClass("/")}>
              Hotels
            </Link>
          </li>
          <li>
            <Link href="/myreservation" onClick={() => setOpen(false)} className={linkClass("/myreservation")}>
              My Bookings
            </Link>
          </li>
          <li>
            <Link href="/contact" onClick={() => setOpen(false)} className={linkClass("/contact")}>
              Support
            </Link>
          </li>
          {loading ? null : user ? (
            <li>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="py-2 px-4 bg-error text-on-error rounded-lg w-full cursor-pointer"
              >
                Sign Out ({user.name})
              </button>
            </li>
          ) : (
            <>
              <li>
                <Link
                  href="/signin"
                  onClick={() => setOpen(false)}
                  className="block py-2 px-4 bg-secondary text-on-secondary rounded-lg text-center"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="block py-2 px-4 border border-secondary text-secondary rounded-lg text-center"
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </>
  );
};

export default Navlink;
