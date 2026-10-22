import {
  LayoutDashboard,
  CheckCircle2,
  ListTodo,
  FolderKanban,
  Building2,
  Users,
  Calendar,
  FileCheck2,
  Settings,
  Database,
  ArrowRightLeft,
  ShieldAlert,
  Radio,
  FileText,
  UploadCloud,
} from 'lucide-react';
import { useAgencyData } from '../../hooks/useAgencyData';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openDatabaseModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  openDatabaseModal,
}) => {
  const { currentUser, profiles, setCurrentUser, approvals } = useAgencyData();

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;

  const workspaceNavItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'my-tasks', label: 'My Tasks', icon: CheckCircle2 },
    { id: 'all-tasks', label: 'All Tasks', icon: ListTodo },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'clients', label: 'Clients', icon: Building2 },
    { id: 'team', label: 'Team (15+)', icon: Users },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: FileCheck2,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
  ];

  const marketingNavItems = [
    { id: 'integrations', label: 'Integrations Hub', icon: Radio },
    { id: 'reports', label: 'Agency Reports', icon: FileText },
    { id: 'data-imports', label: 'Data Imports', icon: UploadCloud },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 bg-[#0B1F3A] text-white flex-shrink-0 border-r border-[#1B3252] select-none h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-[#1A3355]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#9DD52C] flex items-center justify-center text-[#0B1F3A] font-bold shadow-sm">
            <span className="text-base font-extrabold tracking-tight">OS</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-white">Agency OS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#9DD52C]"></span>
            </div>
            <span className="text-[10px] text-[#8EA3C2] font-mono leading-none">Sprint W43 · Kinetic</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-2 pb-2 text-[10px] font-bold tracking-wider uppercase text-[#738BAE]">
          Agency Workspace
        </div>

        {workspaceNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#18345C] text-[#9DD52C] shadow-xs'
                  : 'text-[#C5D5EB] hover:bg-[#122744] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  size={16}
                  className={isActive ? 'text-[#9DD52C]' : 'text-[#8EA3C2]'}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#9DD52C] text-[#0B1F3A]">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-2 pb-1 text-[10px] font-bold tracking-wider uppercase text-[#738BAE]">
          Marketing & Data
        </div>

        {marketingNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#18345C] text-[#9DD52C] shadow-xs'
                  : 'text-[#C5D5EB] hover:bg-[#122744] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  size={16}
                  className={isActive ? 'text-[#9DD52C]' : 'text-[#8EA3C2]'}
                />
                <span className="truncate">{item.label}</span>
              </div>
            </button>
          );
        })}

        <div className="pt-4 px-2 pb-1 text-[10px] font-bold tracking-wider uppercase text-[#738BAE]">
          Configuration
        </div>

        <button
          onClick={() => setCurrentTab('settings')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
            currentTab === 'settings'
              ? 'bg-[#18345C] text-[#9DD52C] shadow-xs'
              : 'text-[#C5D5EB] hover:bg-[#122744] hover:text-white'
          }`}
        >
          <Settings size={16} className={currentTab === 'settings' ? 'text-[#9DD52C]' : 'text-[#8EA3C2]'} />
          <span>Agency Settings</span>
        </button>

        <button
          onClick={openDatabaseModal}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#C5D5EB] hover:bg-[#122744] hover:text-white transition-colors"
        >
          <Database size={16} className="text-[#9DD52C]" />
          <span>Database & Schema</span>
        </button>
      </nav>

      {/* User Session & Role Switcher */}
      <div className="p-3 border-t border-[#1A3355] bg-[#08172C]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-semibold text-[#8EA3C2] tracking-wider flex items-center gap-1">
            <ArrowRightLeft size={10} /> Active User Role
          </span>
          {currentUser.role === 'client' && (
            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold border border-amber-500/30">
              Client Portal
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#2B466D] bg-[#122744] flex-shrink-0">
            {currentUser.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[#9DD52C]">
                {currentUser.initials || currentUser.full_name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <select
              value={currentUser.id}
              onChange={(e) => setCurrentUser(e.target.value)}
              className="w-full bg-[#122744] text-white border border-[#2B466D] rounded text-[11px] py-1 px-1.5 focus:outline-none focus:border-[#9DD52C] truncate cursor-pointer"
            >
              <optgroup label="Agency Team Members">
                {profiles
                  .filter((p) => p.role !== 'client')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.title})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Client Portal Accounts">
                {profiles
                  .filter((p) => p.role === 'client')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} [Client - {p.department}]
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
        </div>

        {currentUser.role === 'client' && (
          <div className="mt-2 p-1.5 rounded bg-amber-950/40 border border-amber-600/30 text-[10px] text-amber-200 flex items-start gap-1.5 leading-tight">
            <ShieldAlert size={12} className="shrink-0 mt-0.5 text-amber-400" />
            <span>Viewing Client Portal. Internal agency tasks & comments are hidden.</span>
          </div>
        )}
      </div>
    </aside>
  );
};
