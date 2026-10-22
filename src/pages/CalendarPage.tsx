import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import { useAgencyData } from '../hooks/useAgencyData';
import { Task } from '../types/database';

interface CalendarPageProps {
  onSelectTask: (taskId: string) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ onSelectTask }) => {
  const { tasks, projects, clients } = useAgencyData();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calendar cells
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const getTasksForDay = (day: number) => {
    return tasks.filter((t) => {
      const d = new Date(t.due_date);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 pb-20">
      {/* Header and Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-[#0B1F3A]">Delivery Calendar</h1>
          <p className="text-xs text-[#667085]">
            Monthly overview of campaign milestones, ad creative reviews, and deliverables
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="h-8 px-3 rounded-lg bg-white border border-[#E5E7EB] text-xs font-semibold text-[#0B1F3A] hover:bg-[#F7F8FA]"
          >
            Today
          </button>
          <div className="flex items-center bg-white border border-[#E5E7EB] rounded-lg">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-[#F7F8FA] rounded-l text-[#667085]"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold px-3 text-[#0B1F3A] font-mono">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-[#F7F8FA] rounded-r text-[#667085]"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-[#E5E7EB] bg-[#F7F8FA] text-center py-2 text-xs font-bold text-[#667085]">
          {daysOfWeek.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[#F3F4F6]">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="h-28 bg-[#FAFAFC]/60"></div>;
            }

            const dayTasks = getTasksForDay(day);
            const currentDayHighlight = isToday(day);

            return (
              <div
                key={`day-${day}`}
                className={`h-28 p-1.5 flex flex-col justify-between transition-colors overflow-hidden ${
                  currentDayHighlight ? 'bg-[#F9FFF0]/80' : 'hover:bg-[#F7F8FA]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      currentDayHighlight
                        ? 'bg-[#9DD52C] text-[#0B1F3A]'
                        : 'text-[#182230]'
                    }`}
                  >
                    {day}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-mono text-[#9CA3AF]">
                      {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  )}
                </div>

                {/* Day Tasks Snippets */}
                <div className="space-y-1 overflow-y-auto max-h-20 custom-scrollbar">
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t.id)}
                      className={`text-[10px] p-1 rounded font-medium truncate cursor-pointer transition-colors ${
                        t.status === 'done'
                          ? 'bg-slate-100 text-slate-500 line-through'
                          : t.priority === 'urgent'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-[#EFF3FF] text-[#0B1F3A] hover:bg-[#DFE9FC]'
                      }`}
                      title={t.title}
                    >
                      {t.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
