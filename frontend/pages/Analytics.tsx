
import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { analyticsApi } from '../features/analytics/api';
import { LinkClickLog } from '../features/analytics/types';
import { linksApi } from '../features/links/api';
import { ShortLink } from '../features/links/types';
import ErrorMessage from '../shared/components/ErrorMessage';
import { parseApiError } from '../shared/utils';

const Analytics: React.FC = () => {
  const [logs, setLogs] = useState<LinkClickLog[]>([]);
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [selectedLinkId, setSelectedLinkId] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  const totalClicks = selectedLinkId === 'all' 
    ? links.reduce((sum, link) => sum + link.click_count, 0)
    : links.find(l => l.id === selectedLinkId)?.click_count || 0;

  const fetchData = async () => {
    setLoading(true);
    setErrors([]);
    try {
      const [linksData, logsData] = await Promise.all([
        linksApi.getLinks(),
        selectedLinkId === 'all' 
          ? analyticsApi.getGlobalLogs() 
          : analyticsApi.getLinkLogs(selectedLinkId)
      ]);
      setLinks(linksData);
      setLogs(logsData);
    } catch (err) {
      setErrors(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedLinkId]);

  // Process data for chart: Group clicks by day
  const chartData = useMemo(() => {
    if (!logs.length) return [];

    const grouped: Record<string, number> = {};
    
    // Group logs by formatted date
    logs.forEach(log => {
      const date = new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
      grouped[date] = (grouped[date] || 0) + 1;
    });

    // Create sorted chart data. Since logs are usually -timestamp, we reverse the keys to get chronological order.
    return Object.entries(grouped)
      .map(([date, clicks]) => ({ date, clicks }))
      .reverse();
  }, [logs]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-2xl rounded-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-xl font-black text-indigo-600">{payload[0].value} <span className="text-xs text-slate-400">Visits</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Performance Insights</h1>
          <p className="text-slate-500 mt-1">Real-time engagement metrics for your shortened links.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest pl-4">Focus</span>
          <select 
            className="bg-slate-50 border-none px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold text-slate-700"
            value={selectedLinkId}
            onChange={(e) => setSelectedLinkId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">Overview: Global Traffic</option>
            {links.map(link => (
              <option key={link.id} value={link.id}>
                {link.short_code} • {link.original_url.substring(0, 20)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      <ErrorMessage messages={errors} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2">Total Engagement</div>
          <div className="text-4xl font-black text-slate-900">{totalClicks}</div>
          <div className="text-sm text-slate-400 mt-1 font-medium">Recorded Visits</div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mb-2">Unique Visitors</div>
          <div className="text-4xl font-black text-slate-900">{logs.length}</div>
          <div className="text-sm text-slate-400 mt-1 font-medium">Logged Sessions</div>
        </div>
        <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl shadow-indigo-100 text-white">
          <div className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-2">Tracking Status</div>
          <div className="text-4xl font-black flex items-center gap-2">
            Active
            <span className="flex h-3 w-3 relative">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-200 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          </div>
          <div className="text-sm text-indigo-100 mt-1 font-medium">Monitoring Link Traffic</div>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-10 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-black text-slate-800 flex items-center gap-3">
            <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}/></svg>
            </span>
            Traffic Distribution
          </h3>
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Growth Trend</div>
        </div>

        <div className="h-[300px] w-full">
          {loading ? (
             <div className="h-full w-full flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-4 border-slate-50 border-t-indigo-600 animate-spin"></div>
             </div>
          ) : logs.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem]">
               <p className="text-slate-400 font-bold text-sm">No traffic data yet to visualize.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#4f46e5" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorClicks)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Logs Section */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <h3 className="font-black text-slate-800 flex items-center gap-3">
            <span className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}/></svg>
            </span>
            Activity Timeline
          </h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-24 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Parsing traffic data...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-24 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/></svg>
              </div>
              <p className="text-slate-900 font-black text-xl mb-1">Waiting for visitors</p>
              <p className="text-slate-400 text-sm">Traffic data will populate automatically as users click your links.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Source IP</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Referrer Path</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/40 transition-colors group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm font-black text-slate-800">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-[10px] font-bold text-indigo-400 uppercase">{new Date(log.timestamp).toLocaleDateString()}</div>
                    </td>
                    <td className="px-8 py-6">
                      <code className="text-[11px] font-black bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600 font-mono border border-slate-200">{log.ip_address || 'Unmasked'}</code>
                    </td>
                    <td className="px-8 py-6">
                      {log.referrer ? (
                        <div className="flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                           <a href={log.referrer} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-slate-600 hover:text-indigo-600 truncate max-w-[200px]">{log.referrer}</a>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Direct Visit</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[10px] font-bold text-slate-400 leading-tight line-clamp-2 max-w-[250px] italic">
                        {log.user_agent}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
