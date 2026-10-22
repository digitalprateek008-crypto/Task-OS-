import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  Database,
  Check,
  Clock,
  Sparkles,
  ExternalLink,
  Menu,
} from 'lucide-react';
import { useAgencyData } from '../../hooks/useAgencyData';
import { isSupabaseConfigured } from '../../lib/supabase';
import { dataService } from '../../services/dataService';

interface TopHeaderProps {
  currentTab: string;
  onOpenCreateTask: () => void;
  onOpenDatabaseModal: () => void;
  onSelectTask: (taskId: string) => void;
  onToggleMobileNav?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  onOpenCreateTask,
  onOpenDatabaseModal,
  onSelectTask,
  onToggleMobileNav,
}) => {
  const { currentUser, notifications } = useAgencyData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => !n.is_read);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tasks = dataService.getTasks();
  const searchResults = searchQuery.trim()
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.task_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const getSectionTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Operational Dashboard';
      case 'my-tasks':
        return 'My Tasks';
      case 'all-tasks':
        return 'All Agency Tasks';
      case 'projects':
        return 'Client Projects';
      case 'clients':
        return 'Client Directory';
      case 'team':
        return 'Agency Team Roster';
      case 'calendar':
        return 'Delivery Calendar';
      case 'approvals':
        return 'Client Portal & Approvals';
      case 'settings':
        return 'Settings & Organization';
      case 'integrations':
        return 'Integrations Hub';
      case 'reports':
        return 'Marketing Reports';
      case 'data-imports':
        return 'Data Imports & Files';
      case 'client-workspace':
        return 'Client Workspace & Analytics';
      default:
        return 'Workspace';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-[#E5E7EB] px-4 flex items-center justify-between sticky top-0 z-30 select-none shadow-[0_1px_2px_rgba(11,31,58,0.03)]">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleMobileNav}
          className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[#0B1F3A] hover:bg-[#F7F8FA] active:scale-95 transition-all"
          aria-label="Toggle Menu"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#9DD52C] ring-2 ring-[#0B1F3A]"></span>
            <span className="font-semibold text-sm tracking-tight text-[#0B1F3A]">Agency OS</span>
          </div>
          <span className="text-[#9CA3AF] font-light text-xs">/</span>
          <span className="text-xs font-medium text-[#667085] truncate max-w-[140px] sm:max-w-xs">
            {getSectionTitle()}
          </span>
        </div>
      </div>

      {/* Middle: Global Search */}
      <div className="relative hidden sm:block flex-1 max-w-xs md:max-w-sm mx-4" ref={searchRef}>
        <div className="relative">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search tasks, codes (e.g. AG-1048)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full h-8 pl-8 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#9DD52C]/30 text-[#182230] transition-all"
          />
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchQuery.trim() && (
          <div className="absolute top-10 left-0 w-full bg-white border border-[#E5E7EB] rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 max-h-80 overflow-y-auto custom-scrollbar">
            <div className="p-2 border-b border-[#E5E7EB] bg-[#F7F8FA] flex items-center justify-between text-[11px] text-[#667085] font-medium">
              <span>Matching Tasks ({searchResults.length})</span>
              <span className="text-[10px] font-mono">Press Esc to close</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#667085]">
                No tasks found matching "{searchQuery}"
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {searchResults.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => {
                      onSelectTask(task.id);
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2.5 hover:bg-[#F7F8FA] flex items-start gap-2.5 transition-colors group"
                  >
                    <span className="text-[10px] font-mono font-semibold bg-[#EFF3FF] text-[#0B1F3A] px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                      {task.task_number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[#182230] group-hover:text-[#0B1F3A] truncate">
                        {task.title}
                      </p>
                      <p className="text-[11px] text-[#667085] truncate">
                        Status: <span className="capitalize">{task.status.replace('_', ' ')}</span> · Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Supabase status badge */}
        <button
          onClick={onOpenDatabaseModal}
          title={isSupabaseConfigured ? 'Supabase Connected' : 'Local Storage Mode'}
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
            isSupabaseConfigured
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-[#EFF3FF] text-[#0B1F3A] border-[#D6E3FF] hover:bg-[#DFE9FC]'
          }`}
        >
          <Database size={12} className={isSupabaseConfigured ? 'text-emerald-600' : 'text-[#0B1F3A]'} />
          <span className="font-mono">{isSupabaseConfigured ? 'Supabase Live' : 'Database Setup'}</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#667085] hover:bg-[#F7F8FA] hover:text-[#182230] active:scale-95 transition-all relative"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#9DD52C] rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 bg-white border border-[#E5E7EB] rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in duration-150">
              <div className="p-3 border-b border-[#E5E7EB] bg-[#F7F8FA] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#182230]">Notifications</span>
                  {unreadNotifs.length > 0 && (
                    <span className="text-[10px] bg-[#9DD52C] text-[#0B1F3A] font-bold px-1.5 py-0.2 rounded-full">
                      {unreadNotifs.length} new
                    </span>
                  )}
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={() => dataService.markAllNotificationsRead()}
                    className="text-[11px] text-[#0B1F3A] hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#E5E7EB] custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#667085]">No notifications yet</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        dataService.markNotificationRead(notif.id);
                        if (notif.task_id) {
                          onSelectTask(notif.task_id);
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-3 text-left hover:bg-[#F7F8FA] cursor-pointer transition-colors ${
                        !notif.is_read ? 'bg-[#F9FBFF]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[#182230]">{notif.title}</span>
                        {!notif.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#9DD52C]"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#667085] leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-[#9CA3AF] font-mono">
                        <Clock size={10} />
                        <span>{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Create Task Button (Lime #9DD52C with dark navy text) */}
        {currentUser.role !== 'client' && (
          <button
            onClick={onOpenCreateTask}
            className="h-8 px-3 rounded-lg bg-[#9DD52C] hover:bg-[#8EC526] text-[#0B1F3A] text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all duration-100 ease-out shrink-0"
          >
            <Plus size={16} strokeWidth={2.8} />
            <span>Task</span>
          </button>
        )}
      </div>
    </header>
  );
};
