import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Package, 
  History, 
  Layers,
  Sparkles,
  User,
  LogOut,
  TrendingUp,
  Users
} from 'lucide-react';
import { useRole } from '../context/RoleContext';

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onLogout?: () => void;
  user?: { name: string; email: string; role: string } | null;
}

export default function Sidebar({ activeTab = 'new-invoice', setActiveTab, onLogout, user }: SidebarProps) {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const { role } = useRole();

  // Sync tab with external state
  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  const handleTabClick = (id: string) => {
    setCurrentTab(id);
    if (setActiveTab) setActiveTab(id);
  };

  // Define nav items according to Role Access requirements
  const allNavItems = [
    { id: 'new-invoice', label: 'New Invoice', icon: FileText, roles: ['Employee', 'Admin'] },
    { id: 'recent-bills', label: 'Recent Bills', icon: History, roles: ['Employee', 'Admin'] },
    { id: 'inventory', label: 'Inventory Management', icon: Package, roles: ['Admin'] },
    { id: 'sales-reports', label: 'Sales Reports', icon: TrendingUp, roles: ['Admin'] },
    { id: 'staff-management', label: 'Staff Management', icon: Users, roles: ['Admin'] },
  ];

  // Filter items based on current active role
  const navItems = allNavItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-full xl:w-72 h-full flex flex-col justify-between bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl dark:shadow-[0_0_40px_rgba(139,92,246,0.03)] text-neutral-800 dark:text-neutral-200 transition-colors duration-350">
      {/* Upper Section */}
      <div className="flex flex-col gap-8">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-violet-600/30 to-fuchsia-600/30 border border-violet-500/30 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <Layers className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <div className="font-bold text-neutral-900 dark:text-white tracking-wide text-lg flex items-center gap-1.5">
              Hanumant
            </div>
            <div className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold tracking-widest uppercase">
              Marble Terminal
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className="w-full relative text-left group cursor-pointer border-none bg-transparent p-0"
              >
                {/* Active Background Glow */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-violet-500/10 dark:bg-white/5 border-l-2 border-violet-600 dark:border-violet-500 rounded-lg"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                
                {/* Content */}
                <div
                  className={`relative z-10 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive 
                      ? 'text-violet-900 dark:text-white font-semibold shadow-sm dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-neutral-500 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'}`} />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <Sparkles className="w-3 h-3 text-violet-600 dark:text-violet-400 ml-auto animate-pulse" />
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Lower Section (Profile & Settings) */}
      <div className="flex flex-col gap-4 pt-6 border-t border-black/5 dark:border-white/5">
        {/* User Card */}
        <div className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-500/20 to-amber-500/20 border border-black/10 dark:border-white/10 flex items-center justify-center text-violet-600 dark:text-violet-300">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{user ? user.name : 'Operator User'}</p>
            <p className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold uppercase tracking-wider">{role}</p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Log out of Terminal"
              className="p-1.5 bg-transparent hover:bg-black/10 dark:hover:bg-white/10 rounded-lg border-none cursor-pointer transition-colors text-neutral-500 hover:text-red-500 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
