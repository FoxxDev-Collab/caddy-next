import Logo from "../components/Logo";
import LoginForm from "./components/LoginForm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  // If user is already logged in, redirect to main page
  const session = await getServerSession();
  if (session) {
    redirect("/main");
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Logo and Details */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-500 to-blue-600 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="w-48 h-48 mb-12">
            <Logo />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Caddy Proxy Manager
          </h1>
          <p className="text-xl text-blue-100 max-w-md">
            Simple and efficient proxy management with modern interface and powerful features.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-sm text-blue-100">
            © 2024 Caddy Proxy Manager. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo - only shown on small screens */}
          <div className="lg:hidden flex flex-col items-center space-y-4 mb-8">
            <div className="w-24 h-24">
              <Logo />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
              Caddy Proxy Manager
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Sign in to your admin account
              </p>
            </div>

            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
