
import React, { useState, useEffect, useRef } from 'react';

interface DateTimePickerProps {
  value: string;
  onChange: (isoString: string) => void;
  onClose: () => void;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange, onClose }) => {
  const [date, setDate] = useState(value ? value.split('T')[0] : new Date().toISOString().split('T')[0]);
  const [hour, setHour] = useState(value ? new Date(value).getHours() : 12);
  const [minute, setMinute] = useState(value ? new Date(value).getMinutes() : 0);
  
  const minuteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedDate = new Date(date);
    selectedDate.setHours(hour);
    selectedDate.setMinutes(minute);
    onChange(selectedDate.toISOString());
  }, [date, hour, minute]);

  const quickMinutes = [0, 15, 30, 45];
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="absolute top-full right-0 mt-2 z-50 bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 w-72 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Expiry</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}/></svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* Date Section */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date</label>
          <input 
            type="date" 
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Time Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Hour</label>
            <select 
              value={hour}
              onChange={(e) => setHour(parseInt(e.target.value))}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Minute</label>
            <div className="relative group">
              <div 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 h-9 overflow-y-auto no-scrollbar scroll-smooth"
                ref={minuteRef}
              >
                {minutes.map(m => (
                  <div 
                    key={m} 
                    onClick={() => setMinute(m)}
                    className={`cursor-pointer py-0.5 hover:text-indigo-600 transition-colors ${minute === m ? 'text-indigo-600' : ''}`}
                  >
                    {m.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Intervals */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Quick Min</label>
          <div className="flex gap-2">
            {quickMinutes.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMinute(m)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${minute === m ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                :{m.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={onClose}
        className="w-full mt-6 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition-all"
      >
        Set Expiration
      </button>
    </div>
  );
};

export default DateTimePicker;
