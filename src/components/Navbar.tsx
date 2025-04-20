import Link from "next/link";
import React from "react";
import SignInButton from "./SignInButton";
import { getAuthSession } from "@/lib/auth";
import UserAccountNav from "./UserAccountNav";
import { ThemeToggle } from "./ThemeToggle";

type Props = {};

const Navbar = async (props: Props) => {
  const session = await getAuthSession();
  return (
    <nav className="fixed inset-x-0 top-0 bg-white dark:bg-gray-950 z-[10] h-fit border-b border-zinc-300 py-2">
      <div className="flex items-center justify-center h-full gap-2 px-8 mx-auto sm:justify-between max-w-7xl">
      <Link href="/" className="inline-block">
  <div className="
    p-2 
    rounded-lg
    bg-white dark:bg-gray-900 
     border-gray-200 dark:border-gray-700 
    hover:border-pink-300 dark:hover:border-pink-500 
    hover:bg-pink-50 dark:hover:bg-pink-900/20 
    transition-all duration-200 
    shadow-xs 
  ">
    <img 
      src="/logo.jpg" 
      alt="TrackEd Logo"
      className="h-8 w-auto object-contain" // Logo sizing
    />
  </div>
</Link>
        <div className="flex items-center">
          <Link href="/gallery" className="mr-6">  {/* Increased from mr-3 to mr-6 */}
            Gallery
          </Link>
          {session?.user && (
            <>
              <Link href="/create" className="mr-6">  {/* Increased from mr-3 to mr-6 */}
                Create Course
              </Link>
              <Link href="/settings" className="mr-6">  {/* Increased from mr-3 to mr-6 */}
                Settings
              </Link>
            </>
          )}
          <ThemeToggle className="ml-6 mr-3" />  {/* Added ml-6 for left margin */}
          <div className="flex items-center">
            {session?.user ? (
              <UserAccountNav user={session.user} />
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
