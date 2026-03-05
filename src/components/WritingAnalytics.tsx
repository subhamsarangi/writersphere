"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../lib/supabaseClient";

type TimeRange = "day" | "week" | "month" | "year";

type Stats = {
  total_active_time: number;
  total_typing_time: number;
  total_editing_time: number;
  total_characters_added: number;
  total_characters_deleted: number;
  total_paste_count: number;
  session_count: number;
  days_active: number;
};

type DailyStats = {
  session_date: string;
  active_time: number;
  typing_time: number;
  characters_added: number;
  characters_deleted: number;
};

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function getDateRange(range: TimeRange): { start: Date; end: Date; previousStart: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  const start = new Date();
  const previousStart = new Date();
  
  switch (range) {
    case "day":
      start.setHours(0, 0, 0, 0);
      previousStart.setDate(start.getDate() - 1);
      previousStart.setHours(0, 0, 0, 0);
      break;
    case "week":
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      previousStart.setDate(start.getDate() - 7);
      previousStart.setHours(0, 0, 0, 0);
      break;
    case "month":
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      previousStart.setDate(start.getDate() - 30);
      previousStart.setHours(0, 0, 0, 0);
      break;
    case "year":
      start.setDate(start.getDate() - 365);
      start.setHours(0, 0, 0, 0);
      previousStart.setDate(start.getDate() - 365);
      previousStart.setHours(0, 0, 0, 0);
      break;
  }
  
  return { start, end, previousStart };
}

export default function WritingAnalytics({ userId }: { userId: string }) {
  const supabase = getSupabaseBrowserClient();
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [stats, setStats] = useState<Stats | null>(null);
  const [previousStats, setPreviousStats] = useState<Stats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      // Only show full loading on initial load
      if (stats === null) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const { start, end, previousStart } = getDateRange(timeRange);
      
      // Fetch current period stats
      const { data: currentData } = await supabase.rpc('get_writing_stats', {
        p_writer_id: userId,
        p_start_date: start.toISOString().split('T')[0],
        p_end_date: end.toISOString().split('T')[0],
      });
      
      // Fetch previous period stats for comparison
      const { data: prevData } = await supabase.rpc('get_writing_stats', {
        p_writer_id: userId,
        p_start_date: previousStart.toISOString().split('T')[0],
        p_end_date: start.toISOString().split('T')[0],
      });
      
      // Fetch daily stats for chart
      const { data: daily } = await supabase.rpc('get_daily_writing_stats', {
        p_writer_id: userId,
        p_start_date: start.toISOString().split('T')[0],
        p_end_date: end.toISOString().split('T')[0],
      });
      
      if (currentData && currentData.length > 0) {
        setStats(currentData[0]);
      }
      
      if (prevData && prevData.length > 0) {
        setPreviousStats(prevData[0]);
      }
      
      if (daily) {
        setDailyStats(daily);
      }
      
      setLoading(false);
      setIsRefreshing(false);
    }
    
    fetchStats();
  }, [userId, timeRange, supabase]);

  const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  if (loading) {
    return (
      <div className="card-dashboard">
        <div className="skeleton-card h-64" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card-dashboard">
        <p className="text-slate-400">No writing data yet. Start writing to see your analytics!</p>
      </div>
    );
  }

  const activeTimeGrowth = previousStats ? calculateGrowth(stats.total_active_time, previousStats.total_active_time) : 0;
  const charsGrowth = previousStats ? calculateGrowth(stats.total_characters_added, previousStats.total_characters_added) : 0;

  const minutesSatWithDiscomfort = Math.floor(stats.total_active_time / 60);

  return (
    <div className="space-y-6 relative">
      {/* Subtle loading overlay when refreshing */}
      {isRefreshing && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
          <div className="flex items-center gap-3 bg-slate-800 px-6 py-3 rounded-lg border border-slate-700">
            <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-r-transparent" />
            <span className="text-slate-200 font-medium">Updating...</span>
          </div>
        </div>
      )}

      {/* Hero Metrics - The Two Most Important Things */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-dashboard bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border-emerald-700/50 p-6 md:p-8">
          <p className="text-sm md:text-base text-emerald-300 mb-3 font-medium">Days you showed up</p>
          <p className="text-5xl md:text-6xl font-bold text-emerald-100 mb-3">{stats.days_active}</p>
          <p className="text-sm md:text-base text-emerald-300/80 mb-3">
            {stats.days_active === 1 ? 'day' : 'days'} this {timeRange}
          </p>
          <p className="text-xs md:text-sm text-emerald-300/60 leading-relaxed hidden md:block">
            Perfectionism wants you to wait for the perfect moment. You showed up anyway.
          </p>
        </div>

        <div className="card-dashboard bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-700/50 p-6 md:p-8">
          <p className="text-sm md:text-base text-purple-300 mb-3 font-medium">Minutes you sat with discomfort</p>
          <p className="text-5xl md:text-6xl font-bold text-purple-100 mb-3">{minutesSatWithDiscomfort}</p>
          <p className="text-sm md:text-base text-purple-300/80 mb-3">
            minutes this {timeRange}
          </p>
          <p className="text-xs md:text-sm text-purple-300/60 leading-relaxed hidden md:block">
            Writing is uncomfortable. The blank page is terrifying. But you sat with it anyway. That&apos;s courage.
          </p>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['day', 'week', 'month', 'year'] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            disabled={isRefreshing}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              timeRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-dashboard">
          <p className="text-sm text-slate-400 mb-1">Active Time</p>
          <p className="text-2xl font-semibold text-slate-100">{formatTime(stats.total_active_time)}</p>
          {activeTimeGrowth > 0 && (
            <p className="text-sm text-emerald-400 mt-1">
              ↑ {activeTimeGrowth}% from last {timeRange}
            </p>
          )}
        </div>

        <div className="card-dashboard">
          <p className="text-sm text-slate-400 mb-1">Characters Written</p>
          <p className="text-2xl font-semibold text-slate-100">{stats.total_characters_added.toLocaleString()}</p>
          {charsGrowth > 0 && (
            <p className="text-sm text-emerald-400 mt-1">
              ↑ {charsGrowth}% from last {timeRange}
            </p>
          )}
        </div>

        <div className="card-dashboard">
          <p className="text-sm text-slate-400 mb-1">Days Active</p>
          <p className="text-2xl font-semibold text-slate-100">{stats.days_active}</p>
          <p className="text-sm text-slate-400 mt-1">Writing sessions</p>
        </div>

        <div className="card-dashboard">
          <p className="text-sm text-slate-400 mb-1">Typing Time</p>
          <p className="text-2xl font-semibold text-slate-100">{formatTime(stats.total_typing_time)}</p>
          <p className="text-sm text-slate-400 mt-1">Pure writing</p>
        </div>
      </div>

      {/* Simple Bar Chart */}
      {dailyStats.length > 0 && (
        <div className="card-dashboard">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Daily Activity</h3>
          <div className="space-y-2">
            {dailyStats.slice(-7).map((day) => {
              const maxTime = Math.max(...dailyStats.map(d => d.active_time));
              const percentage = maxTime > 0 ? (day.active_time / maxTime) * 100 : 0;
              const date = new Date(day.session_date);
              
              return (
                <div key={day.session_date} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-16">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex-1 bg-slate-800 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${percentage}%` }}
                    >
                      {day.active_time > 0 && (
                        <span className="text-xs text-white font-medium">
                          {formatTime(day.active_time)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Positive Insights */}
      <div className="card-dashboard bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-700/50">
        <h3 className="text-lg font-semibold text-blue-200 mb-3">✨ Your Progress</h3>
        <div className="space-y-2 text-sm text-slate-300">
          {activeTimeGrowth > 0 && (
            <p>🎉 You spent {activeTimeGrowth}% more time writing this {timeRange}!</p>
          )}
          {charsGrowth > 0 && (
            <p>📝 You wrote {charsGrowth}% more characters than last {timeRange}!</p>
          )}
          {stats.days_active > 0 && (
            <p>🔥 You wrote on {stats.days_active} {stats.days_active === 1 ? 'day' : 'days'} this {timeRange}!</p>
          )}
          {stats.total_active_time > 3600 && (
            <p>⏰ You dedicated over an hour to your craft this {timeRange}!</p>
          )}
          {activeTimeGrowth <= 0 && charsGrowth <= 0 && stats.days_active === 0 && (
            <p>💪 Every word counts. Keep writing and watch your progress grow!</p>
          )}
        </div>
      </div>
    </div>
  );
}
