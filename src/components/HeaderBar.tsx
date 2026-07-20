import { useTheme } from '../context/ThemeContext';
import { useRole } from '../context/RoleContext';
import { Sun, Moon, Shield, UserCheck, Layers, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderBarProps {
  user?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
}

export default function HeaderBar({ user, onLogout }: HeaderBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { role } = useRole();

  return (
    <header className="w-full mb-6 px-6 py-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-lg dark:shadow-[0_0_30px_rgba(0,0,0,0.4)] transition-all duration-350 flex flex-wrap items-center justify-between gap-4">
      {/* Brand Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-tr from-violet-600/30 to-fuchsia-600/30 border border-violet-500/30 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.2)]">
          <Layers className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <div className="font-bold text-neutral-900 dark:text-white tracking-wide text-lg flex items-center gap-1.5">
            Hanumant Marble
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30">
              Terminal
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Showroom Invoicing & Billing Dashboard
          </p>
        </div>
      </div>

      {/* Controls & Authenticated User Info */}
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
        {/* Verified Role Display Badge (No manual dropdown) */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-black/5 dark:border-white/10 transition-colors">
          {role === 'Admin' ? (
            <Shield className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          ) : (
            <UserCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          )}
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 hidden sm:inline">
            Role:
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
            role === 'Admin'
              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
              : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
          }`}>
            {role === 'Admin' ? 'Admin' : 'Employee'}
          </span>
        </div>

        {/* User Profile Name Indicator */}
        {user && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-black/5 dark:border-white/10">
            <User className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[120px]">
              {user.name}
            </span>
          </div>
        )}

        {/* Dark / Light Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme mode"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-violet-500/50 text-neutral-700 dark:text-neutral-200 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow"
        >
          <motion.div
            initial={false}
            animate={{ rotate: theme === 'dark' ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-violet-600 group-hover:text-violet-500" />
            )}
          </motion.div>
          <span className="text-xs font-semibold capitalize hidden sm:inline">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </span>
        </button>

        {/* Header Logout Action Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Log out of Terminal"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-600 dark:text-red-400 font-semibold text-xs transition-all cursor-pointer shadow-sm hover:shadow"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </header>
  );
}
