import { PatientExperienceFeedback, GoogleReview, DepartmentType } from '../types';
import { INITIAL_REVIEWS } from '../data/mockData';

const FEEDBACK_STORAGE_KEY = 'sopan_hospital_patient_feedback';
const REVIEWS_STORAGE_KEY = 'sopan_hospital_google_reviews';

export const INITIAL_ANONYMOUS_FEEDBACK: PatientExperienceFeedback[] = [
  {
    id: 'fb-01',
    submittedAt: 'Yesterday',
    isAnonymous: true,
    authorAlias: 'Anonymous OPD Outpatient (Token STRK-18)',
    consultationType: 'In-Person Hospital OPD',
    department: 'Comprehensive Stroke Center',
    doctorConsulted: 'Dr. Sanjay Sopan Varade MD, DM Neuro',
    overallRating: 5,
    ratings: {
      doctorAttentiveness: 5,
      explanationClarity: 5,
      waitTimeExperience: 4,
      staffCourtesy: 5,
      facilityCleanliness: 5
    },
    whatWentWell: 'Dr. Sanjay Varade was exceptionally thorough. He did not rush us through the 32-slice CT report and explained my father’s carotid blood flow in Marathi and English with utmost patience. The nursing staff took vitals with genuine care.',
    suggestionsForImprovement: 'OPD waiting lounge could have one extra water dispenser near the counter.',
    wouldRecommend: true,
    tokenOrVisitRef: 'STRK-18',
    syndicateToPublicReviews: true
  },
  {
    id: 'fb-02',
    submittedAt: '3 days ago',
    isAnonymous: true,
    authorAlias: 'Anonymous Migraine Patient (Nashik Road)',
    consultationType: 'In-Person Hospital OPD',
    department: 'Movement Disorders & Parkinson’s',
    doctorConsulted: 'Dr. Sanjay Sopan Varade MD, DM Neuro',
    overallRating: 5,
    ratings: {
      doctorAttentiveness: 5,
      explanationClarity: 5,
      waitTimeExperience: 5,
      staffCourtesy: 5,
      facilityCleanliness: 5
    },
    whatWentWell: 'Prompt token entry; wait time was under 12 minutes. Dr. Varade listened to my 2-year headache diary without cutting me off. The new prophylactic regimen began showing relief within 48 hours.',
    suggestionsForImprovement: 'Digital PDF prescription sent directly via WhatsApp was wonderful.',
    wouldRecommend: true,
    tokenOrVisitRef: 'NEURO-22',
    syndicateToPublicReviews: true
  },
  {
    id: 'fb-03',
    submittedAt: '1 week ago',
    isAnonymous: true,
    authorAlias: 'Caregiver of Epilepsy Patient (Tele-Consult)',
    consultationType: 'Tele-Neurology Video Consultation',
    department: 'Epilepsy & EEG Monitoring',
    doctorConsulted: 'Dr. Sanjay Sopan Varade MD, DM Neuro',
    overallRating: 5,
    ratings: {
      doctorAttentiveness: 5,
      explanationClarity: 5,
      waitTimeExperience: 5,
      staffCourtesy: 4,
      facilityCleanliness: 5
    },
    whatWentWell: 'High definition video link was crystal clear. Dr. Varade reviewed our local EEG waveforms via screen-share and guided dosage titration for Levetiracetam with clinical precision.',
    suggestionsForImprovement: 'Provide an automatic calendar invite link (which is now available with Remind Me!).',
    wouldRecommend: true,
    tokenOrVisitRef: 'EPI-09',
    syndicateToPublicReviews: true
  }
];

export function mapFeedbackToReview(fb: PatientExperienceFeedback): GoogleReview {
  return {
    id: `rev-fb-${fb.id}`,
    authorName: fb.isAnonymous ? fb.authorAlias : 'Verified Outpatient',
    rating: fb.overallRating,
    relativeTime: fb.submittedAt,
    departmentTreated: fb.department,
    verifiedPatient: true,
    reviewText: fb.whatWentWell + (fb.suggestionsForImprovement ? ` (Suggestion: ${fb.suggestionsForImprovement})` : ''),
    doctorMentioned: fb.doctorConsulted,
    helpfulCount: 3,
    isAnonymousFeedback: true,
    feedbackDimensions: {
      doctorAttentiveness: fb.ratings.doctorAttentiveness,
      explanationClarity: fb.ratings.explanationClarity,
      waitTimeExperience: fb.ratings.waitTimeExperience,
      staffCourtesy: fb.ratings.staffCourtesy,
      facilityCleanliness: fb.ratings.facilityCleanliness
    },
    consultationType: fb.consultationType,
    wouldRecommend: fb.wouldRecommend,
    feedbackSuggestions: fb.suggestionsForImprovement
  };
}

export function loadStoredFeedback(): PatientExperienceFeedback[] {
  if (typeof window === 'undefined') return INITIAL_ANONYMOUS_FEEDBACK;
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(INITIAL_ANONYMOUS_FEEDBACK));
      return INITIAL_ANONYMOUS_FEEDBACK;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ANONYMOUS_FEEDBACK;
  } catch {
    return INITIAL_ANONYMOUS_FEEDBACK;
  }
}

export function saveStoredFeedback(list: PatientExperienceFeedback[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('sopan_patient_feedback_updated', { detail: { list } }));
  } catch (err) {
    console.error('Failed to save feedback to localStorage:', err);
  }
}

export function loadStoredReviews(): GoogleReview[] {
  if (typeof window === 'undefined') {
    const syndicated = INITIAL_ANONYMOUS_FEEDBACK.filter(f => f.syndicateToPublicReviews).map(mapFeedbackToReview);
    return [...INITIAL_REVIEWS, ...syndicated];
  }
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      // combine initial reviews with initial syndicated feedback
      const syndicated = INITIAL_ANONYMOUS_FEEDBACK.filter(f => f.syndicateToPublicReviews).map(mapFeedbackToReview);
      const combined = [...INITIAL_REVIEWS, ...syndicated];
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(combined));
      return combined;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_REVIEWS;
  } catch {
    return INITIAL_REVIEWS;
  }
}

export function saveStoredReviews(reviews: GoogleReview[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new CustomEvent('sopan_reviews_updated', { detail: { reviews } }));
  } catch (err) {
    console.error('Failed to save reviews to localStorage:', err);
  }
}

export function submitPatientExperienceFeedback(feedback: PatientExperienceFeedback): {
  feedbackList: PatientExperienceFeedback[];
  reviewsList: GoogleReview[];
} {
  const currentFeedbacks = loadStoredFeedback();
  const updatedFeedbacks = [feedback, ...currentFeedbacks];
  saveStoredFeedback(updatedFeedbacks);

  const currentReviews = loadStoredReviews();
  let updatedReviews = currentReviews;
  if (feedback.syndicateToPublicReviews) {
    const syndicatedReview = mapFeedbackToReview(feedback);
    updatedReviews = [syndicatedReview, ...currentReviews];
    saveStoredReviews(updatedReviews);
  }

  return {
    feedbackList: updatedFeedbacks,
    reviewsList: updatedReviews
  };
}

export interface FeedbackAverages {
  overall: number;
  doctorAttentiveness: number;
  explanationClarity: number;
  waitTimeExperience: number;
  staffCourtesy: number;
  facilityCleanliness: number;
  totalSubmissions: number;
  recommendPercentage: number;
}

export function calculateFeedbackAverages(feedbackList: PatientExperienceFeedback[]): FeedbackAverages {
  if (!feedbackList || feedbackList.length === 0) {
    return {
      overall: 4.9,
      doctorAttentiveness: 4.95,
      explanationClarity: 4.92,
      waitTimeExperience: 4.75,
      staffCourtesy: 4.88,
      facilityCleanliness: 4.95,
      totalSubmissions: 0,
      recommendPercentage: 99
    };
  }

  const count = feedbackList.length;
  const sumOverall = feedbackList.reduce((acc, f) => acc + f.overallRating, 0);
  const sumDoc = feedbackList.reduce((acc, f) => acc + f.ratings.doctorAttentiveness, 0);
  const sumClarity = feedbackList.reduce((acc, f) => acc + f.ratings.explanationClarity, 0);
  const sumWait = feedbackList.reduce((acc, f) => acc + f.ratings.waitTimeExperience, 0);
  const sumStaff = feedbackList.reduce((acc, f) => acc + f.ratings.staffCourtesy, 0);
  const sumFacility = feedbackList.reduce((acc, f) => acc + f.ratings.facilityCleanliness, 0);
  const recommendCount = feedbackList.filter(f => f.wouldRecommend).length;

  return {
    overall: Number((sumOverall / count).toFixed(2)),
    doctorAttentiveness: Number((sumDoc / count).toFixed(2)),
    explanationClarity: Number((sumClarity / count).toFixed(2)),
    waitTimeExperience: Number((sumWait / count).toFixed(2)),
    staffCourtesy: Number((sumStaff / count).toFixed(2)),
    facilityCleanliness: Number((sumFacility / count).toFixed(2)),
    totalSubmissions: count,
    recommendPercentage: Math.round((recommendCount / count) * 100)
  };
}
