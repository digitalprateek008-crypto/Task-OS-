import React from 'react';
import { LayoutDashboard, CheckCircle2, FolderKanban, FileCheck2 } from 'lucide-react';
import { useAgencyData } from '../../hooks/useAgencyData';

interface MobileNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, setCurrentTab }) => {
  const { approvals } = useAgencyData();
  const pendingCount = approvals.filter((a) => a.status === 'pending').length;

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'my-tasks', label: 'My Tasks', icon: CheckCircle2 },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'approvals', label: 'Approvals', icon: FileCheck2, badge: pendingCount > 0 ? pendingCount : undefined },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 flex justify-around items-center h-14 px-2 bg-white border-t border-[#E5E7EB] shadow-[0_-2px_8px_rgba(11,31,58,0.04)] select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-transform duration-100 ease-out active:scale-95 relative ${
              isActive ? 'text-[#0B1F3A] font-semibold' : 'text-[#667085] hover:text-[#0B1F3A]'
            }`}
          >
            <div className="relative">
              <Icon size={20} className={isActive ? 'text-[#0B1F3A]' : 'text-[#667085]'} />
              {tab.badge !== undefined && (
                <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#9DD52C] text-[#0B1F3A] text-[9px] font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#9DD52C]"></span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
