import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LoadingProvider } from "@/contexts/LoadingContext";
import StateMachineComponent from "@/components/StateMachine";
import NavBar from "@/components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "EmuRom",
  description: "BasicEmulatorJS wrapper for local game hosting",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}>
        <LoadingProvider>
        <NavBar />

          {/* Main Content */}
          <main className="flex-grow container mx-auto p-6">{children}</main>

          {/* Footer */}
          <footer className="bg-black text-gray-400 p-6 border-t-2 border-purple-500 text-center">
                <p className="mt-10 text-sm text-gray-400">
                  Built by <span className="text-neonPink">Tes1000</span>. Keep the classics alive!
                </p>
                <p className="text-sm">&copy; {new Date().getFullYear()} EmuRom. All Rights Reserved.</p>
                <div className="flex justify-center gap-4 mt-2">
                  <a href="https://github.com/tes1000" className="hover:text-blue-400 text-neonBlue">#GitHub</a>
                </div>
              </footer>
        <StateMachineComponent/>
        </LoadingProvider>
      </body>
    </html>
  );
}