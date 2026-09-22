export type DepartmentType = 
  | 'All'
  | 'Comprehensive Stroke Center'
  | 'Epilepsy & EEG Monitoring'
  | 'Movement Disorders & Parkinson’s'
  | 'Neuro-Oncology & Brain Tumors'
  | 'Spine & Peripheral Nerve'
  | 'Pediatric Neurology'
  | 'Neuro-Rehabilitation';

export interface Doctor {
  id: string;
  name: string;
  qualifications: string;
  designation: string;
  department: DepartmentType;
  experienceYears: number;
  availableDays: string[];
  timeSlots: string[];
  opdFee: number;
  rating: number;
  reviewCount: number;
  avatarUrl: string;
  bio: string;
  languages: string[];
}

export interface Appointment {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientPhone: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  department: DepartmentType;
  date: string;
  timeSlot: string;
  visitType: 'In-Person Hospital OPD' | 'Tele-Neurology Video Consultation';
  symptoms: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  tokenNumber: string;
  createdAt: string;
}

export interface DiagnosticReport {
  id: string;
  patientId: string;
  testName: string;
  modality: '32-Slice CT Scanner' | '24-hr Video EEG' | 'EMG / NCV' | 'Carotid Doppler' | 'Lumbar Puncture / CSF';
  date: string;
  referringDoctor: string;
  impression: string;
  findings: string[];
  status: 'Final Verified' | 'Preliminary';
  downloadUrl?: string;
  keyScanImage?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  date: string;
  doctorName: string;
  diagnosis: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  followUpDate: string;
}

export interface PatientVitalsLog {
  id: string;
  patientId: string;
  date: string;
  bloodPressureSys: number;
  bloodPressureDia: number;
  pulseRate: number;
  tremorScore: number; // 0-10
  seizureCountToday: number;
  mobilityScore: number; // 0-10
  cognitiveNotes: string;
  triageStatus: 'Stable' | 'Guarded' | 'Immediate Alert';
}

export interface PatientProfile {
  id: string;
  uhid: string; // Unique Health ID
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  primaryDiagnosis: string;
  attendingDoctor: string;
  emergencyContact: string;
  emergencyRelation: string;
  allergies: string[];
  caregiverName?: string;
  caregiverPhone?: string;
}

export interface DiseaseArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  iconName: string;
  readTime: string;
  overview: string;
  patientOverview: string;
  symptoms: string[];
  emergencySigns: string[];
  causes: string[];
  diagnosticApproaches: string[];
  treatments: {
    name: string;
    description: string;
    type: 'Medical' | 'Surgical' | 'Interventional' | 'Therapy';
  }[];
  caregiverGuidelines: string[];
  vrHotspotId: string;
  anatomicalFocus: string;
}

export interface BrainAnatomyHotspot {
  id: string;
  name: string;
  lobe: string;
  coordinates: { x: number; y: number; z: number };
  color: string;
  description: string;
  pathologies: string[];
  clinicalRole: string;
  imagingSign: string;
}

export interface SecureMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'Patient' | 'Caregiver' | 'Neurologist' | 'Neuro-Nurse';
  timestamp: string;
  text: string;
  isUrgent?: boolean;
  hasAttachment?: boolean;
  attachmentName?: string;
}

export interface CaseStudy {
  id: string;
  caseNumber: string;
  title: string;
  category: DepartmentType;
  patientDemographics: string;
  chiefComplaint: string;
  neurologicalExam: string;
  neuroimaging: string;
  differentialDiagnosis: string[];
  finalDiagnosis: string;
  interventionType: 'Endovascular Surgery' | 'Microsurgery' | 'Immunotherapy' | 'Neuromodulation' | 'Conservative ICU';
  procedureDetails: string;
  outcome30Day: string;
  outcome6Month: string;
  learningPearls: string[];
  authorDoctor: string;
  publicationDate: string;
  tags: string[];
}

export interface StaffPayrollRecord {
  id: string;
  employeeId: string;
  fullName: string;
  department: string;
  role: string;
  baseSalary: number;
  onCallEmergencyBonus: number;
  nightShiftAllowance: number;
  deductionsTDS: number;
  deductionsPF: number;
  netPayable: number;
  payPeriod: string;
  paymentStatus: 'Paid' | 'Processing' | 'On Hold';
  bankAccountMasked: string;
  paidOn?: string;
}

export interface GoogleReview {
  id: string;
  authorName: string;
  rating: number;
  relativeTime: string;
  departmentTreated: string;
  verifiedPatient: boolean;
  reviewText: string;
  doctorMentioned?: string;
  helpfulCount: number;
}

export interface PatientSuccessStory {
  id: string;
  patientIdentifier: string; // e.g., 'Rajesh K., 58 yrs, Nashik'
  conditionCategory: 'Stroke Recovery' | 'Epilepsy & Seizures' | 'Parkinson & Movement' | 'Migraine & Nerve Pain' | 'Neuro-Rehab';
  clinicalDiagnosis: string;
  procedureOrTreatment: string;
  attendingConsultant: string;
  rating: number;
  timeframe: string; // e.g. '6 Months Post-Treatment'
  milestoneBadge: string; // e.g. 'Full Functional Independence'
  initialPresentation: string;
  intervention: string;
  recoveryOutcome: string;
  quote: string;
  caregiverReflection?: string;
  metrics: {
    label: string;
    before: string;
    after: string;
  }[];
  datePublished: string;
  verifiedHospitalTreated: boolean;
  helpfulUpvotes: number;
}

export type SymptomCategory = 
  | 'Cranial & Headache'
  | 'Motor, Movement & Weakness'
  | 'Sensory & Numbness'
  | 'Balance, Dizziness & Vestibular'
  | 'Speech, Vision & Facial'
  | 'Cognitive, Memory & Seizure';

export type SymptomSeverity = 'Mild' | 'Moderate' | 'Severe';
export type SymptomOnset = 'Sudden (< 1 hour)' | 'Rapid (< 24 hours)' | 'Gradual (Days to Weeks)' | 'Chronic / Recurrent (> 3 Months)';
export type UrgencyTier = 'Emergency (Immediate)' | 'Urgent (Within 24-48h)' | 'Standard OPD Consultation';

export interface SymptomDefinition {
  id: string;
  name: string;
  category: SymptomCategory;
  description: string;
  isRedFlag?: boolean;
  commonIn: string[];
}

export interface NeurologicalConditionProfile {
  id: string;
  name: string;
  category: string;
  subtitle: string;
  overview: string;
  urgency: UrgencyTier;
  recommendedDepartment: DepartmentType;
  keyMatchingSymptoms: string[]; // symptom ids
  redFlagsTrigger?: string[];
  diagnosticInvestigations: string[];
  doctorAdvice: string;
  articleSlug?: string;
  vrHotspotId?: string;
}

export interface SymptomAssessmentResult {
  condition: NeurologicalConditionProfile;
  matchScore: number; // 0 - 100%
  matchedSymptoms: SymptomDefinition[];
  unmatchedKeySymptoms: string[];
  hasRedFlags: boolean;
}

