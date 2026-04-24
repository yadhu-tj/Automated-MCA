import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download, ArrowLeft, FileImage, FileText } from 'lucide-react';
import { Achievement } from '../types';
import { api, getMediaUrl } from '../services/api';

export const CertificatePage: React.FC = () => {
  const { achievementId } = useParams();
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievement = async () => {
      if (!achievementId) {
        setError('Missing achievement id.');
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.getAchievement(achievementId);
        setAchievement(data);
      } catch (err: any) {
        setError(err.message || 'Unable to load certificate.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievement();
  }, [achievementId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
        <div className="text-gray-600">Loading certificate...</div>
      </div>
    );
  }

  if (error || !achievement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-lg w-full p-8 text-center space-y-4">
          <div className="text-red-600 font-semibold">{error || 'Certificate not found.'}</div>
          <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-mca-600 text-white">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const certificateUrl = getMediaUrl(achievement.certificateFilePath);
  const isPdf = achievement.certificateMimeType === 'application/pdf';
  const isImage = achievement.certificateMimeType?.startsWith('image/');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.18),_transparent_35%),linear-gradient(135deg,_#0f172a,_#1e293b)] px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 text-white">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="text-sm text-white/70">MCA Dept. Certificate Center</div>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl overflow-hidden border border-white/30">
          <div className="border-b border-gray-200 px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-yellow-600 font-semibold">Achievement Certificate</p>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">{achievement.title}</h1>
              <p className="text-gray-500 text-sm mt-1">{achievement.date}</p>
            </div>
            <a
              href={certificateUrl}
              download={achievement.certificateFileName || `${achievement.title}.pdf`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-mca-600 text-white hover:bg-mca-700"
            >
              <Download className="w-4 h-4" />
              Download Certificate
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-0">
            <div className="bg-slate-100 p-4 sm:p-6 min-h-[60vh] flex items-center justify-center">
              {isImage ? (
                <img
                  src={certificateUrl}
                  alt={achievement.title}
                  className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-lg bg-white"
                />
              ) : isPdf ? (
                <iframe
                  src={certificateUrl}
                  title={achievement.title}
                  className="w-full h-[75vh] rounded-xl shadow-lg bg-white"
                />
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-700 font-medium">Certificate preview unavailable.</p>
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8 bg-white border-l border-gray-100">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{achievement.title}</h2>
                  <p className="text-gray-500 mt-1">{achievement.description}</p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    {isImage ? <FileImage className="w-5 h-5 text-mca-600" /> : <FileText className="w-5 h-5 text-mca-600" />}
                    <div>
                      <p className="font-medium text-gray-900">File Details</p>
                      <p className="text-sm text-gray-600">{achievement.certificateFileName || 'Certificate file'}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium text-gray-800">Recipient ID:</span> {achievement.memberId}</p>
                    <p><span className="font-medium text-gray-800">Status:</span> {achievement.status}</p>
                    <p><span className="font-medium text-gray-800">Format:</span> {achievement.certificateMimeType || 'Unknown'}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a
                    href={certificateUrl}
                    download={achievement.certificateFileName || `${achievement.title}.pdf`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-mca-600 text-white hover:bg-mca-700"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                  <Link
                    to="/"
                    className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Home
                  </Link>
                </div>

                <div className="text-xs text-gray-500 leading-6">
                  Use the download button to save the certificate locally. Images open directly in the browser, while PDFs are embedded for quick viewing.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
