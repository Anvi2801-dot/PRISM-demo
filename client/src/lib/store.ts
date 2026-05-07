import { useState, useCallback } from 'react';

export type Jurisdiction = 'IN' | 'UK' | 'US' | 'SG' | 'DE';

export interface JurisdictionConfig {
  code: Jurisdiction;
  name: string;
  flag: string;
  kycType: 'nbfc' | 'minimal';
  steps: string[];
  requiredDocs: string[];
}

export const JURISDICTIONS: Record<Jurisdiction, JurisdictionConfig> = {
  IN: {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    kycType: 'nbfc',
    steps: ['Personal Details', 'Address Verification', 'PAN & Aadhaar', 'Bank Details', 'Video KYC'],
    requiredDocs: ['PAN Card', 'Aadhaar Card', 'Bank Statement', 'Address Proof']
  },
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    flag: '🇬🇧',
    kycType: 'minimal',
    steps: ['Basic Details', 'ID Verification'],
    requiredDocs: ['Passport or Driving License']
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    kycType: 'minimal',
    steps: ['Basic Details', 'SSN Verification'],
    requiredDocs: ['SSN Card or Government ID']
  },
  SG: {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    kycType: 'minimal',
    steps: ['Basic Details', 'NRIC/FIN Verification'],
    requiredDocs: ['NRIC or FIN Card']
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    kycType: 'minimal',
    steps: ['Basic Details', 'ID Verification'],
    requiredDocs: ['Personalausweis or Passport']
  }
};

export type ApplicationStatus = 'pending' | 'in_review' | 'approved' | 'rejected';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface Document {
  id: string;
  name: string;
  type: string;
  extractedText: string;
  uploadedAt: Date;
}

export interface RiskAssessment {
  score: number;
  level: RiskLevel;
  factors: { factor: string; impact: 'positive' | 'negative' | 'neutral'; weight: number }[];
  explanation: string;
}

export interface Application {
  id: string;
  jurisdiction: Jurisdiction;
  status: ApplicationStatus;
  currentStep: number;
  formData: Record<string, string>;
  documents: Document[];
  riskAssessment?: RiskAssessment;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLogEntry {
  id: string;
  applicationId: string;
  action: string;
  details: string;
  actor: 'user' | 'system' | 'admin';
  timestamp: Date;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const extractTextFromDocument = (docName: string): string => {
  const templates: Record<string, string> = {
    'pan': 'PERMANENT ACCOUNT NUMBER\nName: John Doe\nPAN: ABCDE1234F\nDate of Birth: 01/01/1990',
    'aadhaar': 'GOVERNMENT OF INDIA\nName: John Doe\nUID: 1234 5678 9012\nAddress: 123 Main Street, Mumbai',
    'passport': 'PASSPORT\nSurname: DOE\nGiven Names: JOHN\nNationality: BRITISH\nDate of Birth: 01 JAN 1990',
    'license': 'DRIVING LICENSE\nName: John Doe\nLicense No: DL-1234567890\nValid Until: 2030',
    'ssn': 'SOCIAL SECURITY\nName: John Doe\nSSN: XXX-XX-1234',
    'bank': 'BANK STATEMENT\nAccount Holder: John Doe\nAccount No: XXXX1234\nBalance: $50,000',
    'default': 'Document verified. Identity confirmed.'
  };
  
  const key = Object.keys(templates).find(k => docName.toLowerCase().includes(k)) || 'default';
  return templates[key];
};

const assessRisk = (application: Application): RiskAssessment => {
  const factors: RiskAssessment['factors'] = [];
  let score = 50;
  
  if (application.jurisdiction === 'IN') {
    factors.push({ factor: 'NBFC-compliant jurisdiction', impact: 'positive', weight: 10 });
    score -= 5;
  }
  
  if (application.documents.length >= 2) {
    factors.push({ factor: 'Multiple documents verified', impact: 'positive', weight: 15 });
    score -= 10;
  } else if (application.documents.length === 0) {
    factors.push({ factor: 'No documents uploaded', impact: 'negative', weight: 20 });
    score += 25;
  }
  
  const hasIdDoc = application.documents.some(d => 
    ['pan', 'aadhaar', 'passport', 'license', 'ssn'].some(t => d.name.toLowerCase().includes(t))
  );
  if (hasIdDoc) {
    factors.push({ factor: 'Government ID verified', impact: 'positive', weight: 20 });
    score -= 15;
  }
  
  const name = application.formData.fullName || '';
  if (name.length > 3) {
    factors.push({ factor: 'Complete personal information', impact: 'positive', weight: 10 });
    score -= 5;
  }
  
  if (application.currentStep >= JURISDICTIONS[application.jurisdiction].steps.length) {
    factors.push({ factor: 'All KYC steps completed', impact: 'positive', weight: 15 });
    score -= 10;
  }
  
  const randomVariance = Math.floor(Math.random() * 10) - 5;
  score = Math.max(5, Math.min(95, score + randomVariance));
  
  const level: RiskLevel = score <= 30 ? 'low' : score <= 60 ? 'medium' : 'high';
  
  const explanations = {
    low: `Low risk profile. Strong identity verification with ${application.documents.length} document(s) submitted. All compliance checks passed for ${JURISDICTIONS[application.jurisdiction].name} jurisdiction.`,
    medium: `Moderate risk profile. Additional verification may be required. ${factors.filter(f => f.impact === 'negative').length > 0 ? 'Some risk factors identified.' : 'Standard review recommended.'}`,
    high: `Elevated risk profile. Manual review strongly recommended. ${factors.filter(f => f.impact === 'negative').map(f => f.factor).join('. ')}.`
  };
  
  return { score, level, factors, explanation: explanations[level] };
};

let applications: Application[] = [];
let auditLog: AuditLogEntry[] = [];
let listeners: (() => void)[] = [];

const notify = () => listeners.forEach(l => l());

export const addAuditEntry = (applicationId: string, action: string, details: string, actor: AuditLogEntry['actor']) => {
  auditLog.unshift({
    id: generateId(),
    applicationId,
    action,
    details,
    actor,
    timestamp: new Date()
  });
  notify();
};

export const createApplication = (jurisdiction: Jurisdiction): Application => {
  const app: Application = {
    id: generateId(),
    jurisdiction,
    status: 'pending',
    currentStep: 0,
    formData: {},
    documents: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  applications.push(app);
  addAuditEntry(app.id, 'APPLICATION_CREATED', `New ${JURISDICTIONS[jurisdiction].name} application initiated`, 'user');
  return app;
};

export const updateApplication = (id: string, updates: Partial<Application>): Application | null => {
  const idx = applications.findIndex(a => a.id === id);
  if (idx === -1) return null;
  
  applications[idx] = { ...applications[idx], ...updates, updatedAt: new Date() };
  notify();
  return applications[idx];
};

export const uploadDocument = (applicationId: string, fileName: string, fileType: string): Document | null => {
  const app = applications.find(a => a.id === applicationId);
  if (!app) return null;
  
  const doc: Document = {
    id: generateId(),
    name: fileName,
    type: fileType,
    extractedText: extractTextFromDocument(fileName),
    uploadedAt: new Date()
  };
  
  app.documents.push(doc);
  app.updatedAt = new Date();
  addAuditEntry(applicationId, 'DOCUMENT_UPLOADED', `Document "${fileName}" uploaded and text extracted`, 'user');
  
  app.riskAssessment = assessRisk(app);
  addAuditEntry(applicationId, 'RISK_ASSESSED', `AI risk assessment: ${app.riskAssessment.level.toUpperCase()} (${app.riskAssessment.score}/100)`, 'system');
  
  notify();
  return doc;
};

export const submitForReview = (applicationId: string): boolean => {
  const app = applications.find(a => a.id === applicationId);
  if (!app) return false;
  
  app.status = 'in_review';
  app.updatedAt = new Date();
  app.riskAssessment = assessRisk(app);
  addAuditEntry(applicationId, 'SUBMITTED_FOR_REVIEW', 'Application submitted for admin review', 'user');
  notify();
  return true;
};

export const approveApplication = (applicationId: string): boolean => {
  const app = applications.find(a => a.id === applicationId);
  if (!app) return false;
  
  app.status = 'approved';
  app.updatedAt = new Date();
  addAuditEntry(applicationId, 'APPLICATION_APPROVED', 'Application approved by administrator', 'admin');
  notify();
  return true;
};

export const rejectApplication = (applicationId: string, reason: string): boolean => {
  const app = applications.find(a => a.id === applicationId);
  if (!app) return false;
  
  app.status = 'rejected';
  app.updatedAt = new Date();
  addAuditEntry(applicationId, 'APPLICATION_REJECTED', `Application rejected: ${reason}`, 'admin');
  notify();
  return true;
};

export const getApplications = () => [...applications];
export const getApplication = (id: string) => applications.find(a => a.id === id);
export const getAuditLog = (applicationId?: string) => 
  applicationId ? auditLog.filter(e => e.applicationId === applicationId) : [...auditLog];

export const useStore = () => {
  const [, setTick] = useState(0);
  
  const subscribe = useCallback(() => {
    const listener = () => setTick(t => t + 1);
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  }, []);
  
  useState(() => { const unsub = subscribe(); return unsub; });
  
  return {
    applications: getApplications(),
    auditLog: getAuditLog(),
    createApplication,
    updateApplication,
    uploadDocument,
    submitForReview,
    approveApplication,
    rejectApplication,
    getApplication,
    getAuditLog
  };
};