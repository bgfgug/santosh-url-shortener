
import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeModalProps {
  url: string;
  shortCode: string;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ url, shortCode, onClose }) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `qr-${shortCode}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this link',
          text: `Scan this QR code to visit: ${url}`,
          url: url,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard! (Web Share API not supported on this browser)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-800">QR Code</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}/></svg>
            </button>
          </div>

          <div ref={canvasRef} className="bg-slate-50 p-6 rounded-3xl inline-block mb-8 border border-slate-100">
            <QRCodeCanvas 
              value={url} 
              size={200}
              level="H"
              includeMargin={false}
              className="mx-auto rounded-lg"
            />
          </div>

          <p className="text-slate-500 text-sm font-medium mb-8">
            Scan with your camera to access <br/> 
            <span className="text-indigo-600 font-bold">{shortCode}</span>
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5m0 0l5-5m-5 5V3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}/></svg>
              Save
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684m0 2.684l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}/></svg>
              Share
            </button>
          </div>
        </div>
        <div className="bg-slate-50 px-8 py-4 text-center">
            <button onClick={onClose} className="text-slate-400 text-sm font-bold hover:text-slate-600">Dismiss</button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
