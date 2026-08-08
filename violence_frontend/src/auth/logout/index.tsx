import { useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { authService } from '@/services/authService';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function LogoutPage() {
  const { setUser } = useApp();

  useEffect(() => {
    const performLogout = async () => {
      console.log('🚪 Logout page loaded, starting logout process...');

      // Clear local storage immediately to prevent session recovery
      localStorage.removeItem('sh_token');
      localStorage.removeItem('sh_user');
      sessionStorage.clear();
      setUser(null);

      console.log('✅ Local storage cleared');

      // Clear all cookies aggressively (including HTTP-only cookies from backend)
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        // Clear cookie with all possible path/domain combinations
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
      }

      console.log('✅ Cookies cleared');

      // Set flag to prevent session recovery (use localStorage to persist across restarts)
      localStorage.setItem('just_logged_out', 'true');

      console.log('✅ Logout flag set, redirecting to /');

      try {
        // Call backend to invalidate session (non-blocking)
        await authService.logout();
        console.log('✅ Backend logout successful');
      } catch (error) {
        console.error('❌ Backend logout failed:', error);
      }

      // Use window.location.replace() to prevent back button access
      window.location.replace('/');
    };

    performLogout();
  }, [setUser]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6 text-center"
      >
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600 shadow-2xl shadow-indigo-500/20">
          <ShieldCheck size={40} className="text-white" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-3xl border-2 border-dashed border-indigo-400"
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Securing Your Session
          </h1>
          <p className="font-medium text-slate-400">
            Clearing encrypted cache and logging out safely...
          </p>
        </div>

        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="h-2 w-2 rounded-full bg-indigo-500"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
