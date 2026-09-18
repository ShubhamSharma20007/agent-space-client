import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import {  FiSun, FiMoon, FiClock } from "react-icons/fi";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../utils/firebase";
import AuthService from "../services/auth.service";
import { useTheme } from "../context/ThemeContext";
import { Button } from "@/components/ui/button";
import { useUser } from "@/redux/hooks/useUser";
import { Navigate } from "react-router-dom";
import { RiRobot2Line } from "react-icons/ri";
const Login = () => {
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userRedux = useUser();

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await signInWithPopup(auth, googleProvider);
      const idToken = await response.user.getIdToken();
      const user = await AuthService.login(idToken);
      if(user){
        userRedux.setUser(user?.user)
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (userRedux.user.email && userRedux.user.name) {
      return <Navigate to="/chat" replace />;
    }


  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-[#05070d] font-sans transition-colors duration-300">
      {/* Theme toggle */}
      <Button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 z-20 w-10 h-10 rounded-full border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 text-gray-700 dark:text-gray-200 backdrop-blur hover:bg-gray-100 dark:hover:bg-white/10"
      >
        {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
      </Button>

      {/* Left hero panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-black"
          style={{
            backgroundImage:
              "radial-gradient(120% 120% at 20% 100%, #ff8a4c 0%, #d9598a 25%, #4c6fd9 55%, #000000 80%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/60" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-10 text-center">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-black font-semibold text-lg mb-8">
             <RiRobot2Line size={25}/>
          </div>
          <h2 className="text-3xl xl:text-4xl font-semibold text-white leading-tight max-w-md">
            Welcome Back to Your Agent Space
          </h2>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-semibold text-base mb-6">
            <RiRobot2Line size={24}/>
            </div>
            <p>You'r Personal Multi Agent</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Login to your account now
            </p>
          </div>

           {/* line */}
          <div className="h-px w-full bg-gray-200 dark:bg-white/10 mb-8" />

          {error && (
            <div className="mb-4 text-sm text-center text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-md px-3 py-2">
              {error}
            </div>
          )}  

          {/* Social buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              variant="outline"
              className="flex-1 gap-2 cursor-pointer border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 h-auto text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FcGoogle size={18} />
              {loading ? "Signing in…" : "Sign in with Google"}
            </Button>

            <div className="relative flex-1 group">
              <Button
                type="button"
                disabled
                aria-disabled="true"
                tabIndex={-1}
                variant="outline"
                className="w-full gap-2 border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 h-auto text-sm font-medium text-gray-800 dark:text-gray-100 cursor-not-allowed select-none opacity-60"
              >
                <FaGithub size={18} />
                Sign in with Github
              </Button>

              {/* Coming soon - visible on hover */}
              <div
                className="
                  absolute inset-0 flex items-center justify-center gap-1.5
                  rounded-md bg-gray-900/90 dark:bg-black/70 backdrop-blur-xs
                  text-white text-xs font-medium
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-200
                  pointer-events-none
                "
              >
                <FiClock size={14} />
                Coming soon
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;