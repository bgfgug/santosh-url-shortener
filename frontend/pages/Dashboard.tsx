
import React, { useState, useEffect } from 'react';
import { linksApi, CreateLinkData } from '../features/links/api';
import { ShortLink } from '../features/links/types';
import ErrorMessage from '../shared/components/ErrorMessage';
import { parseApiError, getFieldErrors } from '../shared/utils';
import QRCodeModal from '../features/qr/QRCodeModal';
import DateTimePicker from '../shared/components/DateTimePicker';

const Dashboard: React.FC = () => {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [url, setUrl] = useState('');
  
  // Customization fields
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [expirationMode, setExpirationMode] = useState<'quick' | 'custom'>('quick');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // QR Modal state
  const [activeQRLink, setActiveQRLink] = useState<ShortLink | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [copyingId, setCopyingId] = useState<number | null>(null);

  const fetchLinks = async () => {
    try {
      const data = await linksApi.getLinks();
      setLinks(data);
    } catch (err) {
      setErrors(parseApiError(err));
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleQuickExpiry = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setExpiresAt(date.toISOString());
  };

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setErrors([]);
    setFieldErrors({});
    
    try {
      const payload: CreateLinkData = { original_url: url };
      
      const cleanAlias = customAlias.trim();
      if (cleanAlias) {
        // Strict frontend regex check
        if (!/^[a-zA-Z0-9_-]+$/.test(cleanAlias)) {
           setFieldErrors({ short_code: "Only letters, numbers, hyphens, and underscores allowed." });
           setLoading(false);
           return;
        }
        payload.short_code = cleanAlias;
      }
      
      if (expiresAt) {
        payload.expires_at = expiresAt;
      }

      const response = await linksApi.createLink(payload); 
      setLinks([response, ...links]);
      
      // Reset Form State
      setUrl('');
      setCustomAlias('');
      setExpiresAt('');
      setShowAdvanced(false);
    } catch (err: any) {
      setErrors(parseApiError(err));
      // Map DRF field errors (like 'short_code' uniqueness) to the UI
      setFieldErrors(getFieldErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently delete this link?')) return;
    try {
      await linksApi.deleteLink(id);
      setLinks(links.filter(l => l.id !== id));
    } catch (err) {
      alert('Failed to delete link');
    }
  };

  const copyToClipboard = (link: ShortLink) => {
    navigator.clipboard.writeText(link.short_url);
    setCopyingId(link.id);
    setTimeout(() => setCopyingId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="relative mb-12 rounded-[3.5rem] bg-indigo-600 p-8 sm:p-14 overflow-hidden shadow-2xl shadow-indigo-100 border border-white/10">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tight leading-tight">Better links. Faster growth.</h1>
          <p className="text-indigo-100 mb-10 text-lg sm:text-xl font-medium opacity-90 max-w-2xl mx-auto">Branded short links with built-in analytics and automated expiration rules.</p>
          
          <form onSubmit={handleShorten} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 bg-white/15 backdrop-blur-xl p-3 rounded-[2.5rem] border border-white/20 shadow-2xl">
              <input 
                type="url" 
                required 
                placeholder="Paste your long link here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-white px-8 py-5 rounded-[1.8rem] outline-none text-slate-800 font-bold placeholder:text-slate-400 shadow-sm text-lg focus:ring-4 focus:ring-indigo-300/30 transition-all"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="bg-slate-900 text-white px-12 py-5 rounded-[1.8rem] font-black text-lg hover:bg-black transition-all disabled:opacity-50 active:scale-95 shadow-2xl flex items-center justify-center gap-3 group"
              >
                {loading ? 'Shortening...' : (
                  <>
                    <span>Shorten</span>
                    <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}/></svg>
                  </>
                )}
              </button>
            </div>

            <button 
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-indigo-50 text-xs font-black flex items-center gap-2 mx-auto hover:text-white transition-all bg-white/10 px-6 py-2.5 rounded-full hover:bg-white/20 border border-white/5"
            >
              {showAdvanced ? 'Hide Advanced' : 'Custom Alias & Expiration'}
              <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}/></svg>
            </button>

            {showAdvanced && (
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.8rem] p-10 mt-6 grid grid-cols-1 md:grid-cols-2 gap-10 text-left animate-in slide-in-from-top-6 fade-in duration-500">
                
                {/* Custom Alias Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between ml-2">
                    <label className="text-[11px] font-black text-indigo-100 uppercase tracking-[0.2em]">Custom Alias</label>
                    {fieldErrors.short_code && <span className="text-red-300 text-[10px] font-black uppercase">Taken</span>}
                  </div>
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 font-black select-none text-lg">/</span>
                    <input 
                      type="text"
                      placeholder="my-alias"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))}
                      className={`w-full bg-white/10 border ${fieldErrors.short_code ? 'border-red-400 ring-4 ring-red-400/20' : 'border-white/20'} rounded-3xl pl-10 pr-6 py-5 text-white font-black placeholder:text-indigo-300/40 outline-none focus:bg-white/20 focus:border-white/40 transition-all text-lg`}
                    />
                  </div>
                  {fieldErrors.short_code && <p className="text-red-200 text-[10px] font-bold ml-2 italic">{fieldErrors.short_code}</p>}
                </div>

                {/* Expiration Section */}
                <div className="space-y-3">
                   <div className="flex items-center justify-between ml-2">
                      <label className="text-[11px] font-black text-indigo-100 uppercase tracking-[0.2em]">Expiration</label>
                      <div className="flex gap-1.5 bg-white/10 p-1 rounded-xl">
                        <button 
                          type="button"
                          onClick={() => setExpirationMode('quick')}
                          className={`text-[9px] font-black px-3 py-1.5 rounded-lg transition-all ${expirationMode === 'quick' ? 'bg-white text-indigo-600' : 'text-indigo-200 hover:text-white'}`}
                        >PRESETS</button>
                        <button 
                          type="button"
                          onClick={() => setExpirationMode('custom')}
                          className={`text-[9px] font-black px-3 py-1.5 rounded-lg transition-all ${expirationMode === 'custom' ? 'bg-white text-indigo-600' : 'text-indigo-200 hover:text-white'}`}
                        >DATE PICKER</button>
                      </div>
                   </div>

                   {expirationMode === 'quick' ? (
                     <div className="grid grid-cols-3 gap-3">
                        {[
                          { l: '1 Day', v: 1 },
                          { l: '7 Days', v: 7 },
                          { l: '30 Days', v: 30 }
                        ].map(opt => (
                          <button
                            key={opt.v}
                            type="button"
                            onClick={() => handleQuickExpiry(opt.v)}
                            className={`py-5 rounded-3xl text-xs font-black transition-all border ${expiresAt && new Date(expiresAt).getDate() === new Date(Date.now() + opt.v * 86400000).getDate() ? 'bg-white text-indigo-600 border-white shadow-xl' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}
                          >
                            +{opt.l}
                          </button>
                        ))}
                     </div>
                   ) : (
                     <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowTimePicker(!showTimePicker)}
                          className="w-full bg-white/10 border border-white/20 rounded-3xl px-6 py-5 text-white font-black text-sm text-left flex items-center justify-between hover:bg-white/20 transition-all shadow-inner"
                        >
                          {expiresAt ? new Date(expiresAt).toLocaleString() : 'Set specific expiry...'}
                          <svg className="w-5 h-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}/></svg>
                        </button>
                        {showTimePicker && (
                          <DateTimePicker 
                            value={expiresAt} 
                            onChange={(val) => setExpiresAt(val)} 
                            onClose={() => setShowTimePicker(false)} 
                          />
                        )}
                     </div>
                   )}
                   {expiresAt && (
                      <button 
                        type="button" 
                        onClick={() => setExpiresAt('')}
                        className="text-[9px] font-black text-red-300 uppercase hover:text-white ml-2 flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}/></svg>
                        Remove Expiration
                      </button>
                   )}
                </div>
              </div>
            )}
          </form>
          <ErrorMessage messages={errors} />
        </div>
      </div>

      {/* Stats List */}
      <div className="flex items-center justify-between mb-10 px-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Portfolio</h2>
          <p className="text-slate-500 text-sm font-semibold opacity-70">Monitor real-time engagement and link status.</p>
        </div>
      </div>

      <div className="space-y-6">
        {fetching ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="relative">
               <div className="w-16 h-16 rounded-full border-8 border-slate-50 border-t-indigo-600 animate-spin"></div>
            </div>
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mt-8">Fetching link history...</p>
          </div>
        ) : links.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-sm">
             <div className="w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-slate-100">
               <svg className="w-14 h-14 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}/></svg>
             </div>
             <p className="text-slate-900 font-black text-3xl mb-2">No links yet</p>
             <p className="text-slate-400 font-medium">Create your first branded short link to see analytics.</p>
          </div>
        ) : (
          links.map(link => {
            const expired = link.expires_at ? new Date(link.expires_at).getTime() < Date.now() : false;
            
            return (
              <div 
                key={link.id} 
                className={`bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 group relative overflow-hidden ${expired ? 'opacity-50 grayscale-[0.8]' : ''}`}
              >
                {expired && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-10 py-2 rotate-45 translate-x-10 translate-y-5 z-20">Expired</div>}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-3 mb-3">
                    <span className="text-indigo-600 font-black text-2xl lg:text-3xl select-all tracking-tighter leading-none">{link.short_url}</span>
                    <button 
                      onClick={() => copyToClipboard(link)}
                      disabled={expired}
                      className={`p-2.5 rounded-xl transition-all ${copyingId === link.id ? 'bg-green-100 text-green-700 scale-110' : 'text-slate-300 hover:text-indigo-600 hover:bg-indigo-50'} disabled:cursor-not-allowed`}
                    >
                      {copyingId === link.id ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}/></svg>
                      )}
                    </button>
                    {link.expires_at && (
                      <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-sm ${expired ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                        {expired ? 'Link Inactive' : `Auto-Expires: ${new Date(link.expires_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 text-sm truncate font-bold max-w-2xl opacity-60" title={link.original_url}>{link.original_url}</div>
                </div>

                <div className="flex items-center gap-10 w-full xl:w-auto justify-between xl:justify-end border-t xl:border-t-0 pt-8 xl:pt-0 border-slate-50">
                  <div className="flex flex-col items-center xl:items-end px-4 border-r xl:border-r-0 border-slate-50 pr-10 xl:pr-0">
                     <div className="text-4xl font-black text-slate-900 leading-none tracking-tighter">{link.click_count.toLocaleString()}</div>
                     <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">Visits</div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setActiveQRLink(link)}
                      className="p-5 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-[1.5rem] transition-all group shadow-sm hover:shadow-indigo-100"
                      title="Generate QR Code"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}/></svg>
                    </button>
                    <a 
                      href={`#/analytics`} 
                      className="p-5 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-[1.5rem] transition-all shadow-sm hover:shadow-indigo-100"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}/></svg>
                    </a>
                    <button 
                      onClick={() => handleDelete(link.id)}
                      className="p-5 bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white rounded-[1.5rem] transition-all shadow-sm hover:shadow-red-100"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}/></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {activeQRLink && (
        <QRCodeModal 
          url={activeQRLink.short_url} 
          shortCode={activeQRLink.short_code} 
          onClose={() => setActiveQRLink(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
