import React from 'react';
import { getMediaUrl } from '../services/api';

interface CertificateProps {
  recipientName: string;
  achievementTitle: string;
  achievementDetail: string;
  date: string;
  signature?: string;
  backgroundImage?: string;
}

export const CertificatePreview: React.FC<CertificateProps> = ({
  recipientName,
  achievementTitle,
  achievementDetail,
  date,
  signature = "Director, MCA Dept",
  backgroundImage
}) => {
  const hasBg = !!backgroundImage;
  const isGradient = backgroundImage?.startsWith('linear-gradient') || backgroundImage?.startsWith('radial-gradient');
  
  const bgStyle: React.CSSProperties = {};
  if (hasBg) {
    if (isGradient) {
      bgStyle.background = backgroundImage;
    } else {
      bgStyle.backgroundImage = `url(${getMediaUrl(backgroundImage)})`;
      bgStyle.backgroundSize = 'cover';
      bgStyle.backgroundPosition = 'center';
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-2 shadow-2xl relative overflow-hidden">
        {/* Outer Border */}
        <div className={`border-8 h-full p-2 ${hasBg ? 'border-amber-500/50' : 'border-mca-900'}`}>
            <div 
              style={bgStyle}
              className={`border-4 h-full p-8 relative flex flex-col items-center text-center justify-center min-h-[460px] ${
                hasBg 
                  ? 'border-white/30 text-white' 
                  : 'border-mca-500 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-50 via-slate-100 to-slate-200 text-slate-800'
              }`}
            >
                {/* Dark overlay for contrast in uploaded backgrounds */}
                {hasBg && !isGradient && (
                  <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[0.5px] z-0" />
                )}
                
                {/* Watermark / Decoration */}
                <div className={`absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 rounded-tl-3xl opacity-50 z-10 ${
                  hasBg ? 'border-amber-400/40' : 'border-yellow-500'
                }`}></div>
                <div className={`absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 rounded-br-3xl opacity-50 z-10 ${
                  hasBg ? 'border-amber-400/40' : 'border-yellow-500'
                }`}></div>

                {/* Header */}
                <div className="mb-8 relative z-10">
                    <h1 className={`text-4xl md:text-5xl font-serif font-bold tracking-wider uppercase mb-2 ${
                      hasBg ? 'text-amber-400 drop-shadow-md' : 'text-mca-900'
                    }`}>
                        Certificate
                    </h1>
                    <span className={`text-xl md:text-2xl font-serif uppercase tracking-widest ${
                      hasBg ? 'text-white/80' : 'text-mca-600'
                    }`}>
                        of Achievement
                    </span>
                </div>

                {/* Body */}
                <div className="space-y-6 max-w-2xl z-10 relative">
                    <p className={`font-serif italic text-lg ${hasBg ? 'text-slate-200' : 'text-gray-500'}`}>
                      This certificate is proudly presented to
                    </p>
                    
                    <h2 className={`text-3xl md:text-4xl font-bold border-b-2 pb-2 px-8 inline-block font-serif ${
                      hasBg ? 'text-white border-white/20' : 'text-gray-900 border-gray-300'
                    }`}>
                        {recipientName}
                    </h2>

                    <p className={`font-medium mt-4 ${hasBg ? 'text-slate-200' : 'text-gray-600'}`}>
                        For outstanding performance and achievement in:
                    </p>
                    
                    <div className="my-4">
                         <h3 className={`text-2xl font-serif font-bold ${hasBg ? 'text-amber-300' : 'text-mca-800'}`}>
                           {achievementTitle}
                         </h3>
                         <p className={`mt-2 ${hasBg ? 'text-slate-350' : 'text-gray-500'}`}>
                           {achievementDetail}
                         </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 w-full flex justify-between items-end px-10 md:px-20 z-10 relative">
                    <div className="text-center">
                        <p className={`font-bold border-t pt-2 px-8 ${
                          hasBg ? 'text-white border-white/20' : 'text-gray-800 border-gray-400'
                        }`}>{date}</p>
                        <p className={`text-xs uppercase tracking-wide mt-1 ${hasBg ? 'text-slate-300' : 'text-gray-500'}`}>Date</p>
                    </div>

                    <div className="text-center">
                        <div className={`font-cursive text-2xl mb-1 ${hasBg ? 'text-amber-200' : 'text-mca-700'}`} style={{fontFamily: 'serif', fontStyle: 'italic'}}>
                             Dr. Alan Turing
                        </div>
                        <p className={`font-bold border-t pt-2 px-8 ${
                          hasBg ? 'text-white border-white/20' : 'text-gray-800 border-gray-400'
                        }`}>{signature}</p>
                        <p className={`text-xs uppercase tracking-wide mt-1 ${hasBg ? 'text-slate-300' : 'text-gray-500'}`}>Signature</p>
                    </div>
                </div>

                {/* Badge/Seal */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 opacity-20 md:opacity-100 z-10">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg border-4 ${
                      hasBg ? 'bg-amber-500 border-amber-400 text-slate-950' : 'bg-yellow-500 border-yellow-600 text-white'
                    }`}>
                        <div className="text-center text-xs font-bold leading-tight">
                            MCA<br/>DEPT<br/>EXCELLENCE
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
