import React from 'react';

interface CertificateProps {
  recipientName: string;
  achievementTitle: string;
  achievementDetail: string;
  date: string;
  signature?: string;
}

export const CertificatePreview: React.FC<CertificateProps> = ({
  recipientName,
  achievementTitle,
  achievementDetail,
  date,
  signature = "Director, MCA Dept"
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-2 shadow-2xl relative overflow-hidden">
        {/* Outer Border */}
        <div className="border-8 border-mca-900 h-full p-2">
            <div className="border-4 border-mca-500 h-full p-8 relative flex flex-col items-center text-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-50 via-slate-100 to-slate-200">
                
                {/* Watermark / Decoration */}
                <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-yellow-500 rounded-tl-3xl opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-yellow-500 rounded-br-3xl opacity-50"></div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-mca-900 tracking-wider uppercase mb-2">
                        Certificate
                    </h1>
                    <span className="text-xl md:text-2xl font-serif text-mca-600 uppercase tracking-widest">
                        of Achievement
                    </span>
                </div>

                {/* Body */}
                <div className="space-y-6 max-w-2xl z-10">
                    <p className="text-gray-500 font-serif italic text-lg">This certificate is proudly presented to</p>
                    
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2 px-8 inline-block font-serif">
                        {recipientName}
                    </h2>

                    <p className="text-gray-600 font-medium mt-4">
                        For outstanding performance and achievement in:
                    </p>
                    
                    <div className="my-4">
                         <h3 className="text-2xl font-serif font-bold text-mca-800">{achievementTitle}</h3>
                         <p className="text-gray-500 mt-2">{achievementDetail}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 w-full flex justify-between items-end px-10 md:px-20 z-10">
                    <div className="text-center">
                        <p className="font-bold text-gray-800 border-t border-gray-400 pt-2 px-8">{date}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Date</p>
                    </div>

                    <div className="text-center">
                        <div className="font-cursive text-2xl text-mca-700 mb-1" style={{fontFamily: 'serif', fontStyle: 'italic'}}>
                             {/* Signature simulation */}
                             Dr. Alan Turing
                        </div>
                        <p className="font-bold text-gray-800 border-t border-gray-400 pt-2 px-8">{signature}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Signature</p>
                    </div>
                </div>

                {/* Badge/Seal */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 opacity-20 md:opacity-100">
                    <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg border-4 border-yellow-600">
                        <div className="text-white text-xs font-bold text-center leading-tight">
                            MCA<br/>DEPT<br/>EXCELLENCE
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
