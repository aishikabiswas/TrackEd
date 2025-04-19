import { Button } from "@/components/ui/button";
import { FilePlus, Search, Heart } from "lucide-react";
import Link from "next/link";

// Add these components right below your imports
const BlobBackground = () => (
  <div className="fixed -z-10 inset-0 overflow-hidden">
    <div className="absolute top-20 -left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
    <div className="absolute top-40 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
);

const BlobGrid = () => (
  <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden">
    <div className="absolute top-0 left-1/4 w-24 h-24 bg-indigo-100 rounded-full filter blur-3xl opacity-20"></div>
    <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-emerald-100 rounded-full filter blur-3xl opacity-20"></div>
    <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-purple-100 rounded-full filter blur-3xl opacity-20"></div>
  </div>
);
 
export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BlobBackground />
      {/* Main Content */}
      <div className="pb-20"> {/* Add padding bottom to prevent footer overlap */}
        <div className="flex items-center mt-48 flex-col gap-5">
          <h2  className='text-5xl text-center font-bold'>
            TrackEd: Your AI-Powered Learning Companion
          </h2>
          <h2 className='text-3xl text-center font-bold mt-6'>
            Discover Courses Tailored Just for You! 🚀
          </h2>
          <h3>✅ Personalized recommendations – AI helps you learn what you love</h3>
          <h3>✅ Save time – Skip the guesswork, dive into learning</h3>
          <h3>✅ Adapts as you grow – Smarter suggestions over time</h3>
          
          <div className="flex mt-4 gap-4">
          <Link href="/create" >
          <button
              className="px-5 py-2.5 bg-pink-500 hover:bg-pink-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
            >
              <FilePlus className="w-5 h-5" />
              Create New Plan
            </button>
          </Link>
          <Link href="/gallery" >
          <button
              className="px-5 py-2.5 bg-violet-100 hover:bg-violet-200 text-gray-800 font-medium rounded-lg transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:bg-violet-700 dark:hover:bg-violet-600 dark:text-amber-100"
            >
              <Search className="w-5 h-5" />
              Browse Gallery
            </button>
          </Link>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <footer className="absolute bottom-0 left-0 right-0 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <div className="flex items-center justify-center gap-1">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>@ENIGMA</span>
          </div>
        </div>
      </footer>
    </div>
  )
}