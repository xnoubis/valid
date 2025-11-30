import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { TrustCertificate, ValidationDomain, TrustLevel, DomainResult } from '../../types';
import { AlertTriangle, CheckCircle, ShieldCheck, Heart } from 'lucide-react';

interface TrustDashboardProps {
  certificate: TrustCertificate;
  onReset: () => void;
}

export const TrustDashboard: React.FC<TrustDashboardProps> = ({ certificate, onReset }) => {
  const domainEntries = Object.entries(certificate.domainResults) as [string, DomainResult][];

  const data = domainEntries.map(([domain, result]) => ({
    subject: domain.charAt(0).toUpperCase() + domain.slice(1),
    A: result.score * 100,
    fullMark: 100,
  }));

  const getLevelColor = (level: TrustLevel) => {
    switch (level) {
      case TrustLevel.VOUCHED: return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case TrustLevel.VERIFIED: return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case TrustLevel.SUBSTANTIAL: return "bg-blue-100 text-blue-800 border-blue-300";
      case TrustLevel.PARTIAL: return "bg-amber-100 text-amber-800 border-amber-300";
      default: return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const isHumanity = (key: string) => key === ValidationDomain.HUMANITY;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Certificate Status */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-900">Certificate Status</h3>
            <ShieldCheck className="w-5 h-5 text-slate-400" />
          </div>
          
          <div className={`inline-flex items-center px-4 py-2 rounded-full border-2 text-sm font-bold uppercase tracking-wide mb-6 ${getLevelColor(certificate.trustLevel)}`}>
            {certificate.trustLevel}
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Certificate ID</span>
              <span className="font-mono text-slate-700">{certificate.id}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Issued</span>
              <span className="font-mono text-slate-700">{new Date(certificate.issuedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Expires</span>
              <span className="font-mono text-slate-700">{new Date(certificate.expiresAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-md font-medium text-slate-900 mb-3">Protective Recommendations</h3>
            <ul className="space-y-2">
                {certificate.protectiveRecommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start text-sm text-slate-600">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                        {rec}
                    </li>
                ))}
            </ul>
        </div>
        
        <button onClick={onReset} className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 underline">
            Start New Validation
        </button>
      </div>

      {/* Right Column: Visualization */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-96 flex flex-col">
          <h3 className="text-lg font-medium text-slate-900 mb-2">Domain Analysis</h3>
          <p className="text-sm text-slate-500 mb-4">Visual representation of validated trust domains.</p>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                    name="Trust Score"
                    dataKey="A"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fill="#6366f1"
                    fillOpacity={0.3}
                />
                </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {domainEntries.map(([key, result]) => (
                <div key={key} className={`bg-white p-4 rounded-lg border ${isHumanity(key) ? 'border-pink-200 bg-pink-50' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm font-semibold uppercase ${isHumanity(key) ? 'text-pink-600' : 'text-slate-500'}`}>
                            {key} {isHumanity(key) && <Heart className="w-3 h-3 inline ml-1" />}
                        </span>
                        {result.score > 0.6 ? (
                            <CheckCircle className={`w-4 h-4 ${isHumanity(key) ? 'text-pink-500' : 'text-emerald-500'}`} />
                        ) : (
                            <span className="text-xs text-amber-600 font-mono">LOW DATA</span>
                        )}
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                        <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                                result.score > 0.7 
                                    ? (isHumanity(key) ? 'bg-pink-500' : 'bg-indigo-500') 
                                    : result.score > 0.4 
                                        ? 'bg-amber-400' 
                                        : 'bg-slate-300'
                            }`} 
                            style={{ width: `${result.score * 100}%` }}
                        ></div>
                    </div>
                    {result.concerns.length > 0 && (
                        <p className="text-xs text-slate-400 mt-1 italic">{result.concerns[0]}</p>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};