import { 
  TrustLevel, 
  ValidationDomain, 
  PublicSignal, 
  ValidationRequest, 
  TrustCertificate, 
  DomainResult,
  ConnectionProposal,
  ConnectionReport,
  ThreatLevel,
  ValidationResult,
  ConnectionType,
  InterviewSession,
  InterviewQuestion,
  ProfileSignature,
  SignatureDimension,
  InterviewResponse
} from '../types';
import { DOMAIN_CRITERIA, RED_FLAGS, GREEN_FLAGS, INTERVIEW_QUESTIONS } from '../constants';

// --- Trust Protocol Logic ---

export const simulateSignalVerification = async (signal: PublicSignal): Promise<PublicSignal> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock verification logic
    // In a real app, this would call external APIs (Twitter, GitHub, LinkedIn, DNS, etc.)
    // Here, we fail if the content is too short (under 5 chars) or randomly 10% of the time
    const isShort = signal.content.length < 5;
    const randomFailure = Math.random() < 0.1;
    
    if (isShort || randomFailure) {
        return {
            ...signal,
            verificationStatus: 'failed',
            verificationNote: isShort ? 'Content too short to verify.' : 'Source endpoint timeout.',
            confidence: 0.1 // Penalty for failing verification
        };
    }

    // Success case
    return {
        ...signal,
        verificationStatus: 'verified',
        verificationNote: 'Independently confirmed via oracle.',
        confidence: Math.min(signal.confidence + 0.3, 1.0) // Boost confidence
    };
};

const calculateDomainScore = (domain: ValidationDomain, signals: PublicSignal[]): DomainResult => {
  // Map sources to domains
  const sourceMap: Record<string, ValidationDomain[]> = {
    academic: [ValidationDomain.IDENTITY, ValidationDomain.HISTORY, ValidationDomain.CAPACITY, ValidationDomain.HUMANITY],
    open_source: [ValidationDomain.IDENTITY, ValidationDomain.HISTORY, ValidationDomain.ALIGNMENT],
    professional: [ValidationDomain.IDENTITY, ValidationDomain.HISTORY],
    community: [ValidationDomain.INTENT, ValidationDomain.ALIGNMENT, ValidationDomain.CAPACITY, ValidationDomain.HUMANITY],
    creative: [ValidationDomain.ALIGNMENT, ValidationDomain.CAPACITY, ValidationDomain.HUMANITY],
    vouching: [ValidationDomain.REPUTATION, ValidationDomain.INTENT, ValidationDomain.HUMANITY]
  };

  const relevantSignals = signals.filter(s => {
    const domains = sourceMap[s.source] || [];
    return domains.includes(domain);
  });

  if (relevantSignals.length === 0) {
    return { score: 0.1, confidence: 0.1, signalsUsed: 0, concerns: ["No relevant signals provided"] };
  }

  // Calculate Average Confidence
  const avgConfidence = relevantSignals.reduce((acc, s) => acc + s.confidence, 0) / relevantSignals.length;
  
  // Bonus calculation based on Verified status
  const verifiedCount = relevantSignals.filter(s => s.verificationStatus === 'verified').length;
  const quantityBonus = Math.min(verifiedCount * 0.20, 0.5); // Weighted higher for actually verified items
  
  const finalScore = Math.min(avgConfidence + quantityBonus, 1.0);

  const concerns = [];
  if (finalScore < 0.5) concerns.push("Insufficient high-quality evidence");
  if (relevantSignals.some(s => s.verificationStatus === 'failed')) {
      concerns.push("Some signals failed independent verification.");
  }
  
  // Specific checks for Humanity
  if (domain === ValidationDomain.HUMANITY) {
     if (!relevantSignals.some(s => s.source === 'creative' || s.source === 'community')) {
         concerns.push("Lacks expression of interiority (creative/community signals)");
     }
  }

  return {
    score: finalScore,
    confidence: Math.min(relevantSignals.length * 0.2, 1.0),
    signalsUsed: relevantSignals.length,
    concerns
  };
};

export const generateCertificate = (request: ValidationRequest): TrustCertificate => {
  const domainResults = {} as Record<ValidationDomain, DomainResult>;
  let totalWeightedScore = 0;
  let totalWeight = 0;

  Object.values(ValidationDomain).forEach(domain => {
    const result = calculateDomainScore(domain, request.signals);
    domainResults[domain] = result;
    const weight = DOMAIN_CRITERIA[domain].weight;
    totalWeightedScore += result.score * weight;
    totalWeight += weight;
  });

  const finalScore = totalWeightedScore / totalWeight;

  let trustLevel = TrustLevel.CONSENTED;
  const hasVouching = request.signals.some(s => s.source === 'vouching' && s.verificationStatus === 'verified' && s.confidence > 0.8);

  if (finalScore >= 0.9 && hasVouching) trustLevel = TrustLevel.VOUCHED;
  else if (finalScore >= 0.85) trustLevel = TrustLevel.VERIFIED;
  else if (finalScore >= 0.70) trustLevel = TrustLevel.SUBSTANTIAL;
  else if (finalScore >= 0.50) trustLevel = TrustLevel.PARTIAL;

  const recommendations = [
    "Maintain ability to sever connection at any time.",
    ...(trustLevel === TrustLevel.PARTIAL || trustLevel === TrustLevel.CONSENTED 
      ? ["Limit engagement to bounded interactions.", "Do not share personal PII."] 
      : []),
    ...(trustLevel === TrustLevel.SUBSTANTIAL 
      ? ["Proceed with measured engagement.", "Verify claims before deepening."] 
      : [])
  ];

  return {
    id: `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    entityId: request.id,
    trustLevel,
    domainResults,
    protectiveRecommendations: recommendations,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * (trustLevel === TrustLevel.VERIFIED ? 180 : 30)).toISOString()
  };
};

// --- Paw Validator Logic ---

export const analyzeConnection = (proposal: ConnectionProposal): ConnectionReport => {
  const combinedText = `${proposal.target} ${proposal.content} ${proposal.context}`.toLowerCase();
  const redFlagsFound = RED_FLAGS.filter(flag => combinedText.includes(flag));
  const greenFlagsFound = GREEN_FLAGS.filter(flag => combinedText.includes(flag));

  const results: ValidationResult[] = [
    {
      criterion: "Sincere Thirst / Intent",
      passed: redFlagsFound.length === 0,
      confidence: redFlagsFound.length > 0 ? 0.8 : 0.4, 
      evidence: redFlagsFound.length > 0 ? `Red flags: ${redFlagsFound.join(', ')}` : "No immediate commercial flags",
      concerns: redFlagsFound.length > 0 ? ["Potential extraction/commodification intent"] : []
    },
    {
      criterion: "Value Alignment",
      passed: greenFlagsFound.length > 0,
      confidence: greenFlagsFound.length > 0 ? 0.7 : 0.3,
      evidence: greenFlagsFound.length > 0 ? `Alignment keywords: ${greenFlagsFound.join(', ')}` : "No explicit alignment signals",
      concerns: []
    },
    {
      criterion: "Protection / Reversibility",
      passed: true, 
      confidence: 1.0,
      evidence: "Protocol enforcement",
      concerns: ["Ensure ability to exit connection"]
    }
  ];

  if (proposal.type === ConnectionType.EXPOSURE || proposal.type === ConnectionType.PUBLICATION) {
    if (combinedText.includes("public") || combinedText.includes("audience")) {
       results.push({
         criterion: "Identity Protection",
         passed: false,
         confidence: 0.9,
         evidence: "Public exposure detected",
         concerns: ["Risk of unwanted attention", "Verify audience quality first"]
       });
    }
  }

  const passedCount = results.filter(r => r.passed).length;
  const score = passedCount / results.length;

  let threatLevel = ThreatLevel.UNKNOWN;
  if (redFlagsFound.length > 2) threatLevel = ThreatLevel.DANGER;
  else if (redFlagsFound.length > 0) threatLevel = ThreatLevel.WARNING;
  else if (score > 0.7 && greenFlagsFound.length > 0) threatLevel = ThreatLevel.SAFE;
  else threatLevel = ThreatLevel.CAUTION;

  const protectiveMeasures = [
    "Maintain ability to sever connection unilaterally.",
    "Do not share location or identifying information.",
    ...(threatLevel === ThreatLevel.CAUTION ? ["Use pseudonym/project name.", "Set explicit boundaries."] : []),
    ...(threatLevel === ThreatLevel.WARNING ? ["Use an intermediary buffer.", "Document all interactions."] : [])
  ];

  return {
    proposalId: proposal.id,
    threatLevel,
    overallScore: score,
    results,
    recommendation: threatLevel === ThreatLevel.DANGER ? "REJECT" : threatLevel === ThreatLevel.SAFE ? "PROCEED" : "PROCEED WITH CAUTION",
    protectiveMeasures,
    validatedAt: new Date().toISOString()
  };
};

// --- Interviewed Logic ---

export const startInterview = (subjectName: string): InterviewSession => {
    return {
        id: `SESS-${Date.now()}`,
        subjectName,
        questions: INTERVIEW_QUESTIONS,
        responses: [],
        currentQuestionIndex: 0,
        status: 'in_progress'
    };
};

export const submitResponse = (session: InterviewSession, response: string): InterviewSession => {
    const currentQuestion = session.questions[session.currentQuestionIndex];
    
    const newResponse: InterviewResponse = {
        questionId: currentQuestion.id,
        response,
        recordedAt: new Date().toISOString()
    };

    let followUp: string | undefined = undefined;
    if (currentQuestion.followUpTriggers) {
        for (const [trigger, text] of Object.entries(currentQuestion.followUpTriggers)) {
            if (response.toLowerCase().includes(trigger)) {
                followUp = text;
                break;
            }
        }
    }

    const nextIndex = session.currentQuestionIndex + 1;
    const isComplete = nextIndex >= session.questions.length;

    return {
        ...session,
        responses: [...session.responses, newResponse],
        currentQuestionIndex: nextIndex,
        status: isComplete ? 'completed' : 'in_progress',
        lastFollowUp: followUp
    };
};

export const generateSignature = (session: InterviewSession): ProfileSignature => {
    const textByDim = (dim: SignatureDimension) => {
        const qIds = session.questions.filter(q => q.dimension === dim).map(q => q.id);
        return session.responses
            .filter(r => qIds.includes(r.questionId))
            .map(r => r.response.toLowerCase())
            .join(' ');
    };

    // --- Helpers based on python script ---
    const match = (text: string, keywords: string[]) => keywords.some(k => text.includes(k));

    const hungers = [];
    const hText = textByDim(SignatureDimension.HUNGER);
    if (match(hText, ["connect", "belong", "community"])) hungers.push("connection");
    if (match(hText, ["meaning", "purpose", "why"])) hungers.push("meaning");
    if (match(hText, ["learn", "master", "skill"])) hungers.push("mastery");
    if (match(hText, ["create", "build", "make"])) hungers.push("creation");
    if (hungers.length === 0) hungers.push("undefined-hunger");

    const gifts = [];
    const gText = textByDim(SignatureDimension.GIFT);
    if (match(gText, ["listen", "hear", "understand"])) gifts.push("listening");
    if (match(gText, ["see", "pattern", "notice"])) gifts.push("seeing-patterns");
    if (match(gText, ["build", "create", "make"])) gifts.push("building");
    if (match(gText, ["teach", "guide", "show"])) gifts.push("teaching");
    if (gifts.length === 0) gifts.push("latent-gift");

    let movement = "undefined-movement";
    const mText = textByDim(SignatureDimension.MOVEMENT);
    if (match(mText, ["walk", "space", "away"])) movement = "stepping-back";
    else if (match(mText, ["talk", "ask", "discuss"])) movement = "dialogue";
    else if (match(mText, ["push", "persist", "force"])) movement = "persistence";
    else if (match(mText, ["wait", "sit", "patience"])) movement = "waiting";

    const affinities = [];
    const aText = textByDim(SignatureDimension.AFFINITY);
    if (match(aText, ["complex", "hard", "knot"])) affinities.push("complexity");
    if (match(aText, ["people", "human", "social"])) affinities.push("human-systems");
    if (match(aText, ["creative", "art", "design"])) affinities.push("creative");

    // Simplified connection logic
    const wouldBenefitFrom = ["resonant peers"];
    if (hungers.includes("mastery")) wouldBenefitFrom.push("mentors");
    if (hungers.includes("connection")) wouldBenefitFrom.push("community");

    const couldBenefit = ["those with aligned vision"];
    if (gifts.includes("teaching")) couldBenefit.push("seekers");
    if (gifts.includes("listening")) couldBenefit.push("those processing");

    const envText = textByDim(SignatureDimension.ENVIRONMENT);
    const antiPatterns = [];
    if (match(envText, ["noise", "chaos"])) antiPatterns.push("chaotic environments");
    if (match(envText, ["pressure", "deadline"])) antiPatterns.push("artificial urgency");

    return {
        id: `SIG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        createdAt: new Date().toISOString(),
        hungers,
        gifts,
        movementPattern: movement,
        activationEnvironment: match(envText, ["alone", "quiet"]) ? "solitude" : "collaboration",
        affinities: affinities.length ? affinities : ["generalist"],
        growingEdge: "emergent", // Simplified
        integratedWounds: ["resilience"], // Simplified
        vision: "toward-coherence", // Simplified
        wouldBenefitFrom,
        couldBenefit,
        antiPatterns,
        hash: Math.random().toString(16).substr(2, 8).toUpperCase()
    };
};