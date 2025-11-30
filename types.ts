export enum TrustLevel {
  UNVETTED = "unvetted",
  CONSENTED = "consented",
  PARTIAL = "partial",
  SUBSTANTIAL = "substantial",
  VERIFIED = "verified",
  VOUCHED = "vouched"
}

export enum ValidationDomain {
  IDENTITY = "identity",
  INTENT = "intent",
  HISTORY = "history",
  ALIGNMENT = "alignment",
  CAPACITY = "capacity",
  REPUTATION = "reputation",
  HUMANITY = "humanity"
}

export enum ThreatLevel {
  SAFE = "safe",
  CAUTION = "caution",
  WARNING = "warning",
  DANGER = "danger",
  UNKNOWN = "unknown"
}

export enum ConnectionType {
  INFORMATION = "information",
  INTRODUCTION = "introduction",
  PUBLICATION = "publication",
  COLLABORATION = "collaboration",
  COMMERCE = "commerce",
  EXPOSURE = "exposure"
}

export interface PublicSignal {
  id: string;
  source: string;
  signal_type: string;
  content: string;
  verifiable: boolean;
  confidence: number;
  timestamp: string;
}

export interface ValidationRequest {
  id: string;
  entityName: string;
  description: string;
  intent: string;
  consentGiven: boolean;
  boundariesAcknowledged: boolean;
  signals: PublicSignal[];
  status: 'pending' | 'validated';
}

export interface DomainResult {
  score: number;
  confidence: number;
  signalsUsed: number;
  concerns: string[];
}

export interface TrustCertificate {
  id: string;
  entityId: string;
  trustLevel: TrustLevel;
  domainResults: Record<ValidationDomain, DomainResult>;
  protectiveRecommendations: string[];
  issuedAt: string;
  expiresAt: string;
}

export interface ConnectionProposal {
  id: string;
  type: ConnectionType;
  target: string;
  content: string;
  context: string;
  proposedAt: string;
}

export interface ValidationResult {
  criterion: string;
  passed: boolean;
  confidence: number;
  evidence: string;
  concerns: string[];
}

export interface ConnectionReport {
  proposalId: string;
  threatLevel: ThreatLevel;
  overallScore: number;
  results: ValidationResult[];
  recommendation: string;
  protectiveMeasures: string[];
  validatedAt: string;
}

// --- Interviewed Types ---

export enum SignatureDimension {
  HUNGER = "hunger",
  GIFT = "gift",
  MOVEMENT = "movement",
  ENVIRONMENT = "environment",
  AFFINITY = "affinity",
  EDGE = "edge",
  WOUND = "wound",
  VISION = "vision"
}

export interface InterviewQuestion {
  id: string;
  text: string;
  dimension: SignatureDimension;
  whatItReveals: string;
  followUpTriggers?: Record<string, string>;
}

export interface InterviewResponse {
  questionId: string;
  response: string;
  recordedAt: string;
}

export interface ProfileSignature {
  id: string;
  createdAt: string;
  hungers: string[];
  gifts: string[];
  movementPattern: string;
  activationEnvironment: string;
  affinities: string[];
  growingEdge: string;
  integratedWounds: string[];
  vision: string;
  wouldBenefitFrom: string[];
  couldBenefit: string[];
  antiPatterns: string[];
  hash: string;
}

export interface InterviewSession {
  id: string;
  subjectName: string;
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  currentQuestionIndex: number;
  status: 'in_progress' | 'completed';
  signature?: ProfileSignature;
  lastFollowUp?: string;
}