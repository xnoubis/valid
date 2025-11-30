import React, { useState, useRef, useEffect } from 'react';
import { Layout } from './components/Layout';
import { TrustDashboard } from './components/TrustProtocol/TrustDashboard';
import { ValidationReportView } from './components/PawWithClaws/ValidationReport';
import { 
  ValidationRequest, 
  PublicSignal, 
  TrustCertificate, 
  ConnectionProposal, 
  ConnectionReport,
  ConnectionType,
  InterviewSession,
  SignatureDimension
} from './types';
import { generateCertificate, analyzeConnection, startInterview, submitResponse, generateSignature as genSig } from './services/protocolService';
import { SIGNAL_SOURCES } from './constants';
import { Plus, Trash2, ArrowRight, Shield, Send, Sparkles, Hash, UserSearch } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trust' | 'paw' | 'interviewed'>('trust');

  // Trust Protocol State
  const [request, setRequest] = useState<Partial<ValidationRequest>>({
    signals: [],
    consentGiven: false,
    boundariesAcknowledged: false
  });
  const [certificate, setCertificate] = useState<TrustCertificate | null>(null);
  const [newSignal, setNewSignal] = useState<Partial<PublicSignal>>({ confidence: 0.5, verifiable: false });

  // Paw With Claws State
  const [proposal, setProposal] = useState<Partial<ConnectionProposal>>({
    type: ConnectionType.INFORMATION,
  });
  const [report, setReport] = useState<ConnectionReport | null>(null);

  // Interviewed State
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null);
  const [interviewInput, setInterviewInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'interviewed' && interviewSession?.status === 'in_progress') {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [interviewSession?.responses, activeTab]);


  // --- Trust Protocol Handlers ---

  const handleAddSignal = () => {
    if (!newSignal.source || !newSignal.content) return;
    
    const signal: PublicSignal = {
      id: Math.random().toString(36).substr(2, 9),
      source: newSignal.source,
      signal_type: 'self-reported', 
      content: newSignal.content,
      verifiable: newSignal.verifiable || false,
      confidence: newSignal.confidence || 0.5,
      timestamp: new Date().toISOString()
    };

    setRequest(prev => ({ ...prev, signals: [...(prev.signals || []), signal] }));
    setNewSignal({ confidence: 0.5, verifiable: false, source: '', content: '' });
  };

  const handleRemoveSignal = (id: string) => {
    setRequest(prev => ({ ...prev, signals: prev.signals?.filter(s => s.id !== id) }));
  };

  const handleRequestValidation = () => {
    if (!request.consentGiven || !request.boundariesAcknowledged || !request.entityName) return;
    
    const fullRequest: ValidationRequest = {
      id: `REQ-${Date.now()}`,
      entityName: request.entityName,
      description: request.description || '',
      intent: request.intent || '',
      consentGiven: request.consentGiven,
      boundariesAcknowledged: request.boundariesAcknowledged,
      signals: request.signals || [],
      status: 'validated'
    };

    const cert = generateCertificate(fullRequest);
    setCertificate(cert);
  };

  // --- Paw Validator Handlers ---

  const handleValidateConnection = () => {
    if (!proposal.target || !proposal.content) return;

    const fullProposal: ConnectionProposal = {
        id: `PROP-${Date.now()}`,
        type: proposal.type || ConnectionType.INFORMATION,
        target: proposal.target,
        content: proposal.content,
        context: proposal.context || '',
        proposedAt: new Date().toISOString()
    };

    const rep = analyzeConnection(fullProposal);
    setReport(rep);
  };

  // --- Interview Handlers ---

  const handleStartInterview = () => {
    setInterviewSession(startInterview("User"));
  };

  const handleSubmitInterviewResponse = () => {
    if (!interviewSession || !interviewInput.trim()) return;
    
    const updatedSession = submitResponse(interviewSession, interviewInput);
    
    if (updatedSession.status === 'completed') {
        updatedSession.signature = genSig(updatedSession);
    }
    
    setInterviewSession(updatedSession);
    setInterviewInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmitInterviewResponse();
      }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      
      {/* TRUST PROTOCOL TAB */}
      {activeTab === 'trust' && (
        <div className="space-y-8">
          {!certificate ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Validation</h2>
                  <p className="text-slate-600">Entities must consent to be vetted using only public information.</p>
                </div>

                <div className="space-y-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Entity Name</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={request.entityName || ''}
                      onChange={e => setRequest({...request, entityName: e.target.value})}
                      placeholder="Name or Identifier"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Brief Description</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={request.description || ''}
                      onChange={e => setRequest({...request, description: e.target.value})}
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Connection Intent</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={request.intent || ''}
                      onChange={e => setRequest({...request, intent: e.target.value})}
                      placeholder="Why do you want to connect?"
                    />
                  </div>
                </div>

                <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 space-y-4">
                  <h3 className="font-semibold text-indigo-900">Mandatory Consent</h3>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      checked={request.consentGiven}
                      onChange={e => setRequest({...request, consentGiven: e.target.checked})}
                    />
                    <span className="text-sm text-indigo-800">I consent to validation using publicly available information.</span>
                  </label>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      checked={request.boundariesAcknowledged}
                      onChange={e => setRequest({...request, boundariesAcknowledged: e.target.checked})}
                    />
                    <span className="text-sm text-indigo-800">I acknowledge that boundaries may be maintained regardless of outcome.</span>
                  </label>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Public Signals</h2>
                  <p className="text-sm text-slate-500 mb-4">Add verifiable public data points to increase trust score.</p>
                </div>

                {/* Add Signal Form */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <select 
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                      value={newSignal.source || ''}
                      onChange={e => setNewSignal({...newSignal, source: e.target.value})}
                    >
                      <option value="">Select Source...</option>
                      {SIGNAL_SOURCES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                    <div className="flex items-center space-x-2">
                        <input 
                           type="range" min="0" max="1" step="0.1" 
                           value={newSignal.confidence}
                           onChange={e => setNewSignal({...newSignal, confidence: parseFloat(e.target.value)})}
                           className="flex-grow"
                        />
                        <span className="text-xs text-slate-500 w-12 text-right">{(newSignal.confidence! * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Content / URL / Reference"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                    value={newSignal.content || ''}
                    onChange={e => setNewSignal({...newSignal, content: e.target.value})}
                  />
                  <div className="flex items-center justify-between">
                     <label className="flex items-center space-x-2 text-sm text-slate-600">
                        <input 
                            type="checkbox" 
                            checked={newSignal.verifiable}
                            onChange={e => setNewSignal({...newSignal, verifiable: e.target.checked})}
                            className="rounded text-indigo-600"
                        />
                        <span>Independently Verifiable?</span>
                     </label>
                     <button 
                        onClick={handleAddSignal}
                        disabled={!newSignal.source || !newSignal.content}
                        className="px-3 py-1 bg-slate-800 text-white text-sm rounded hover:bg-slate-700 disabled:opacity-50"
                     >
                        <Plus className="w-4 h-4 inline mr-1" /> Add Signal
                     </button>
                  </div>
                </div>

                {/* Signal List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {request.signals?.map(s => (
                        <div key={s.id} className="flex items-start justify-between bg-slate-50 p-3 rounded border border-slate-200">
                            <div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs font-bold uppercase text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">{s.source}</span>
                                    {s.verifiable && <Shield className="w-3 h-3 text-emerald-500" />}
                                </div>
                                <p className="text-sm text-slate-800 mt-1">{s.content}</p>
                            </div>
                            <button onClick={() => handleRemoveSignal(s.id)} className="text-slate-400 hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {(!request.signals || request.signals.length === 0) && (
                        <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded">
                            No signals added yet.
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleRequestValidation}
                    disabled={!request.consentGiven || !request.boundariesAcknowledged || !request.entityName}
                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Initiate Validation Protocol
                </button>
              </div>
            </div>
          ) : (
            <TrustDashboard certificate={certificate} onReset={() => setCertificate(null)} />
          )}
        </div>
      )}

      {/* PAW WITH CLAWS TAB */}
      {activeTab === 'paw' && (
        <div className="max-w-3xl mx-auto">
          {!report ? (
            <div className="space-y-8">
               <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-900">Paw with Claws</h2>
                  <p className="text-slate-600 mt-2">"The lonely one offers his hand... but you should always desire that a paw has claws."</p>
                  <p className="text-sm text-amber-600 font-medium mt-1">Validate connection safety before engaging.</p>
               </div>

               <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-lg space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Connection Type</label>
                        <select 
                            className="w-full px-3 py-2 border border-slate-300 rounded-md"
                            value={proposal.type}
                            onChange={e => setProposal({...proposal, type: e.target.value as ConnectionType})}
                        >
                            {Object.values(ConnectionType).map(t => (
                                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Target Entity</label>
                        <input 
                            type="text"
                            placeholder="Who/What?"
                            className="w-full px-3 py-2 border border-slate-300 rounded-md"
                            value={proposal.target || ''}
                            onChange={e => setProposal({...proposal, target: e.target.value})}
                        />
                      </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Content / Value</label>
                    <input 
                        type="text"
                        placeholder="What is being shared or connected?"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        value={proposal.content || ''}
                        onChange={e => setProposal({...proposal, content: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Context</label>
                    <textarea 
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        placeholder="Why is this connection happening? (Add keywords like 'monetize', 'community', 'public' to test logic)"
                        rows={3}
                        value={proposal.context || ''}
                        onChange={e => setProposal({...proposal, context: e.target.value})}
                    />
                    <p className="text-xs text-slate-400 mt-1">System scans for keywords indicating extraction, commodification, or alignment.</p>
                  </div>

                  <button 
                    onClick={handleValidateConnection}
                    disabled={!proposal.target || !proposal.content}
                    className="w-full flex items-center justify-center py-4 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all"
                  >
                    Analyze Threat Level <ArrowRight className="ml-2 w-5 h-5" />
                  </button>
               </div>
            </div>
          ) : (
            <ValidationReportView report={report} onClose={() => setReport(null)} />
          )}
        </div>
      )}

      {/* INTERVIEWED TAB */}
      {activeTab === 'interviewed' && (
        <div className="max-w-2xl mx-auto h-[600px] flex flex-col">
            {!interviewSession ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                    <div className="bg-emerald-100 p-4 rounded-full">
                        <UserSearch className="w-12 h-12 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Discover Your Profile Signature</h2>
                        <p className="text-slate-600 mt-2 max-w-md mx-auto">Not a resume. A deep dive into your hungers, gifts, and movement patterns to find beneficial connections.</p>
                    </div>
                    <button 
                        onClick={handleStartInterview}
                        className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-md"
                    >
                        Start Interview
                    </button>
                </div>
            ) : interviewSession.status === 'completed' && interviewSession.signature ? (
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden h-full flex flex-col">
                    <div className="bg-emerald-600 px-6 py-4 text-white flex justify-between items-center">
                        <h3 className="font-bold text-lg flex items-center">
                            <Hash className="w-5 h-5 mr-2 opacity-75" />
                            Profile Signature
                        </h3>
                        <span className="font-mono text-xs opacity-75">{interviewSession.signature.hash}</span>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                             <div className="bg-emerald-50 p-4 rounded-lg">
                                <h4 className="text-xs uppercase font-bold text-emerald-800 mb-2">Core Hungers</h4>
                                <div className="flex flex-wrap gap-2">
                                    {interviewSession.signature.hungers.map(h => (
                                        <span key={h} className="bg-white px-2 py-1 rounded text-sm text-emerald-900 border border-emerald-100">{h}</span>
                                    ))}
                                </div>
                             </div>
                             <div className="bg-indigo-50 p-4 rounded-lg">
                                <h4 className="text-xs uppercase font-bold text-indigo-800 mb-2">Natural Gifts</h4>
                                <div className="flex flex-wrap gap-2">
                                    {interviewSession.signature.gifts.map(g => (
                                        <span key={g} className="bg-white px-2 py-1 rounded text-sm text-indigo-900 border border-indigo-100">{g}</span>
                                    ))}
                                </div>
                             </div>
                        </div>

                        <div className="space-y-3">
                             <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <span className="text-sm text-slate-500">Movement Pattern</span>
                                <span className="font-medium text-slate-800">{interviewSession.signature.movementPattern}</span>
                             </div>
                             <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <span className="text-sm text-slate-500">Environment</span>
                                <span className="font-medium text-slate-800">{interviewSession.signature.activationEnvironment}</span>
                             </div>
                             <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <span className="text-sm text-slate-500">Growing Edge</span>
                                <span className="font-medium text-slate-800">{interviewSession.signature.growingEdge}</span>
                             </div>
                        </div>

                        <div className="bg-slate-900 text-slate-300 p-4 rounded-lg text-sm">
                            <p className="mb-2 text-slate-400 text-xs uppercase font-bold">Resonance Connections</p>
                            <p className="mb-1"><span className="text-white">Seek:</span> {interviewSession.signature.wouldBenefitFrom.join(', ')}</p>
                            <p><span className="text-white">Offer to:</span> {interviewSession.signature.couldBenefit.join(', ')}</p>
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                        <button 
                            onClick={() => setInterviewSession(null)}
                            className="text-sm text-slate-600 hover:text-emerald-600 font-medium"
                        >
                            Reset & Start Over
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {interviewSession.responses.map((resp, i) => (
                            <div key={i}>
                                <div className="flex justify-start mb-4">
                                    <div className="bg-slate-100 text-slate-800 px-4 py-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm">
                                        <p className="text-sm">{interviewSession.questions.find(q => q.id === resp.questionId)?.text}</p>
                                    </div>
                                </div>
                                <div className="flex justify-end mb-4">
                                    <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm">
                                        <p className="text-sm">{resp.response}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {/* Current Question */}
                        <div className="flex justify-start">
                             <div className="bg-slate-100 text-slate-800 px-4 py-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm animate-pulse-once">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        {interviewSession.questions[interviewSession.currentQuestionIndex].dimension}
                                    </span>
                                </div>
                                <p className="text-sm font-medium">
                                    {interviewSession.questions[interviewSession.currentQuestionIndex].text}
                                </p>
                             </div>
                        </div>
                        
                        {interviewSession.lastFollowUp && (
                            <div className="flex justify-start">
                                <div className="bg-indigo-50 text-indigo-900 px-4 py-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm border border-indigo-100">
                                    <div className="flex items-center space-x-1 mb-1">
                                        <Sparkles className="w-3 h-3 text-indigo-400" />
                                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Follow Up</span>
                                    </div>
                                    <p className="text-sm italic">"{interviewSession.lastFollowUp}"</p>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-slate-200">
                        <div className="relative">
                            <textarea
                                value={interviewInput}
                                onChange={e => setInterviewInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your response..."
                                className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none max-h-32 min-h-[50px]"
                                rows={1}
                            />
                            <button 
                                onClick={handleSubmitInterviewResponse}
                                disabled={!interviewInput.trim()}
                                className="absolute right-2 bottom-2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-center text-xs text-slate-400 mt-2">Press Enter to send. Be honest, there are no right answers.</p>
                    </div>
                </div>
            )}
        </div>
      )}

    </Layout>
  );
};

export default App;