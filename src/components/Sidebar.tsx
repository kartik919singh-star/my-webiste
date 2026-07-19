import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Package, 
  History, 
  Settings, 
  Layers,
  Sparkles,
  User,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function Sidebar({ activeTab = 'new-invoice', setActiveTab }: SidebarProps) {
  const [currentTab, setCurrentTab] = useState(activeTab);

  const handleTabClick = (id: string) => {
    setCurrentTab(id);
    if (setActiveTab) setActiveTab(id);
  };

  const navItems = [
    { id: 'new-invoice', label: 'New Invoice', icon: FileText },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'recent-bills', label: 'Recent Bills', icon: History },
  ];

  return (
    <div className="w-full xl:w-72 h-full flex flex-col justify-between bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-[0_0_40px_rgba(139,92,246,0.03)] text-neutral-200">
      {/* Upper Section */}
      <div className="flex flex-col gap-8">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-violet-600/30 to-fuchsia-600/30 border border-violet-500/30 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <Layers className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <div className="font-bold text-white tracking-wide text-lg flex items-center gap-1.5">
              Hanumant
            </div>
            <div className="text-[10px] text-violet-400 font-medium tracking-widest uppercase">
              Marble
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
                className="w-full relative text-left group cursor-pointer"
              >
                {/* Active Background Glow */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-white/5 border-l-2 border-violet-500 rounded-lg"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                
                {/* Content */}
                <div
                  className={`relative z-10 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive 
                      ? 'text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.02]'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-violet-400' : 'text-neutral-500 group-hover:text-neutral-300'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <Sparkles className="w-3 h-3 text-violet-400 ml-auto animate-pulse" />
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Lower Section (Profile & Settings) */}
      <div className="flex flex-col gap-4 pt-6 border-t border-white/5">
        <button 
          onClick={() => handleTabClick('settings')}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
            currentTab === 'settings' 
              ? 'text-white bg-white/5' 
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.02]'
          }`}
        >
          <Settings className="w-4 h-4 text-neutral-500" />
          <span>Settings</span>
        </button>

        {/* User Card */}
        <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-500/20 to-amber-500/20 border border-white/10 flex items-center justify-center text-violet-300">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Kartikey Singh</p>
            <p className="text-[10px] text-neutral-500 truncate">Premium Partner</p>
          </div>
          <ExternalLink className="w-3 h-3 text-neutral-600 hover:text-neutral-400 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
