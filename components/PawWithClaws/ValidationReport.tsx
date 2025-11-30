import React from 'react';
import { ConnectionReport, ThreatLevel } from '../../types';
import { AlertOctagon, Check, ShieldAlert, FileText, Info } from 'lucide-react';

interface ValidationReportProps {
  report: ConnectionReport;
  onClose: () => void;
}

export const ValidationReportView: React.FC<ValidationReportProps> = ({ report, onClose }) => {
  
  const getThreatColor = (level: ThreatLevel) => {
    switch (level) {
      case ThreatLevel.SAFE: return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case ThreatLevel.CAUTION: return "bg-amber-50 border-amber-200 text-amber-800";
      case ThreatLevel.WARNING: return "bg-orange-50 border-orange-200 text-orange-800";
      case ThreatLevel.DANGER: return "bg-red-50 border-red-200 text-red-800";
      default: return "bg-slate-50 border-slate-200 text-slate-800";
    }
  };

  const getThreatIcon = (level: ThreatLevel) => {
    switch (level) {
      case ThreatLevel.SAFE: return <Check className="w-8 h-8 text-emerald-600" />;
      case ThreatLevel.DANGER: return <AlertOctagon className="w-8 h-8 text-red-600" />;
      default: return <ShieldAlert className={`w-8 h-8 ${level === ThreatLevel.WARNING ? 'text-orange-600' : 'text-amber-600'}`} />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Card */}
      <div className={`p-6 rounded-xl border-2 ${getThreatColor(report.threatLevel)} shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {getThreatIcon(report.threatLevel)}
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider">{report.recommendation}</h2>
              <p className="text-sm font-mono opacity-80">THREAT LEVEL: {report.threatLevel.toUpperCase()}</p>
            </div>
          </div>
          <div className="text-right">
             <div className="text-3xl font-bold">{Math.round(report.overallScore * 100)}/100</div>
             <div className="text-xs uppercase opacity-70">Safety Score</div>
          </div>
        </div>
      </div>

      {/* Criteria Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-900 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Validation Criteria
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {report.results.map((result, idx) => (
            <div key={idx} className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-900">{result.criterion}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${result.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {result.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-2">{result.evidence}</p>
              {result.concerns.length > 0 && (
                <div className="mt-2 bg-red-50 p-3 rounded text-xs text-red-800 font-mono">
                  {result.concerns.map((c, i) => <div key={i}>⚠ {c}</div>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Protective Measures */}
      <div className="bg-slate-900 text-slate-100 rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-800">
          <h3 className="font-semibold text-white flex items-center">
            <ShieldAlert className="w-4 h-4 mr-2" />
            Required Protective Measures
          </h3>
        </div>
        <div className="p-6">
            <ul className="space-y-3">
                {report.protectiveMeasures.map((measure, idx) => (
                    <li key={idx} className="flex items-start">
                        <span className="text-amber-400 mr-3 mt-1">•</span>
                        <span className="text-slate-300 text-sm leading-relaxed">{measure}</span>
                    </li>
                ))}
            </ul>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button 
          onClick={onClose}
          className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
        >
          Evaluate Another Connection
        </button>
      </div>
    </div>
  );
};
