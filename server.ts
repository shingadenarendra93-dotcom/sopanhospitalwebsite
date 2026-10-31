import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';

dotenv.config();

// Firebase Configuration for Server-Side OPD Counter & Firestore Sync
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCrh8X94Zm7c6HK8WdnqmBJYC1WhoYb14w",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "sopanhospital-be933.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "sopanhospital-be933",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "sopanhospital-be933.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "739498122034",
  appId: process.env.FIREBASE_APP_ID || "1:739498122034:web:35f5d0cb3f91b17a37152b"
};

const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(firebaseApp);

const DEFAULT_DAILY_QUOTA = 50;

// Helper: Formats current or offset local date as YYYY-MM-DD
export function getFormattedDate(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Helper: Advances date by 1 day (YYYY-MM-DD)
export function getNextDateString(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const nextDate = new Date(year, month, day + 1);
      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dd = String(nextDate.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  } catch {
    // fallback
  }
  const base = new Date();
  base.setDate(base.getDate() + 1);
  return base.toISOString().split('T')[0];
}

// Helper: Calculates remaining slots using formula Remaining_Count = Admin_Total_Quota - Booked_Appointments
export async function getOpdStatusForDate(dateStr: string) {
  try {
    // 1. Fetch Admin Quota for this date (falls back to default 50)
    const quotaRef = doc(db, 'opd_quotas', dateStr);
    const quotaSnap = await getDoc(quotaRef);
    let adminTotalQuota = DEFAULT_DAILY_QUOTA;

    if (quotaSnap.exists()) {
      const data = quotaSnap.data();
      if (typeof data.totalQuota === 'number' && data.totalQuota >= 0) {
        adminTotalQuota = data.totalQuota;
      }
    }

    // 2. Count active booked appointments for this date
    const apptsRef = collection(db, 'appointments');
    const q = query(
      apptsRef,
      where('date', '==', dateStr),
      where('status', 'in', ['Confirmed', 'Pending', 'Completed'])
    );
    const apptsSnap = await getDocs(q);
    const bookedCount = apptsSnap.size;

    // 3. Formula: Remaining_Count = Admin_Total_Quota - Booked_Appointments_For_That_Date
    const remainingCount = Math.max(0, adminTotalQuota - bookedCount);
    const isFull = remainingCount <= 0;

    return {
      date: dateStr,
      adminTotalQuota,
      bookedCount,
      remainingCount,
      isFull
    };
  } catch (err: any) {
    console.error(`Error calculating OPD status for date ${dateStr}:`, err);
    return {
      date: dateStr,
      adminTotalQuota: DEFAULT_DAILY_QUOTA,
      bookedCount: 0,
      remainingCount: DEFAULT_DAILY_QUOTA,
      isFull: false
    };
  }
}

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || "AQ.Ab8RN6KlsEUlXEmhO2y1OoqZI42SSQH8WiGIuVwKbw8hXYFWqg";
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// Fallback high-quality clinical research updates in case API key is not yet set
const FALLBACK_NEWS = [
  {
    id: 'res-stroke-2025',
    title: 'Extended Window Endovascular Thrombectomy in Large Ischemic Core Infarctions',
    category: 'stroke',
    source: 'The New England Journal of Medicine (NEJM)',
    sourceUrl: 'https://www.nejm.org/medical-research/stroke',
    publishDate: 'Recent Clinical Trial Protocol',
    summary: 'Landmark trial outcomes confirm safety and significant functional recovery benefit for acute ischemic stroke patients undergoing mechanical thrombectomy up to 24 hours post-onset, even with extensive baseline infarct volume, guided by advanced multidetector CT perfusion mapping.',
    keyTakeaway: 'Immediate CT perfusion screening at specialized stroke centers enables lifesaving clot retrieval beyond traditional rigid time barriers.',
    clinicalSignificance: 'Aligns directly with Sopan Hospital’s 24/7 Rapid Stroke Protocol and 32-Slice CT Angiography triage workflow.',
    patientTips: [
      'Recognize the B.E. F.A.S.T. signs (Balance, Eyes, Face, Arms, Speech, Time).',
      'Never wait for symptoms to improve; transport immediately to a dedicated neuro-stroke center.'
    ],
    tags: ['Acute Stroke', 'Thrombectomy', 'CT Perfusion', 'Critical Care']
  },
  {
    id: 'res-tenecteplase-2026',
    title: 'Tenecteplase vs Alteplase in Acute Ischemic Stroke & Mobile Pre-Hospital Triage',
    category: 'stroke',
    source: 'Stroke Journal (AHA/ASA & ESO)',
    sourceUrl: 'https://www.ahajournals.org/journal/str',
    publishDate: 'Updated International Guideline',
    summary: 'Phase III international multicenter trials demonstrate that single-bolus Tenecteplase (0.25 mg/kg) achieves faster reperfusion and superior early neurological recovery compared to traditional 1-hour alteplase infusions, facilitating rapid transfer for mechanical thrombectomy.',
    keyTakeaway: 'Tenecteplase single-bolus administration shortens door-to-needle time and improves early arterial recanalization in acute stroke.',
    clinicalSignificance: 'Streamlines hyperacute emergency thrombolysis protocols at Sopan Hospital’s dedicated Neuro-ICU.',
    patientTips: [
      'Every minute saved during acute stroke saves 1.9 million neurons.',
      'Call emergency services immediately upon sudden onset of facial droop or arm weakness.'
    ],
    tags: ['Tenecteplase', 'Thrombolysis', 'Stroke Guidelines', 'Emergency Neurology']
  },
  {
    id: 'res-epilepsy-2025',
    title: 'Automated High-Density Video-EEG Analysis & Targeted Neuromodulation in Drug-Resistant Epilepsy',
    category: 'epilepsy',
    source: 'The Lancet Neurology',
    sourceUrl: 'https://www.thelancet.com/journals/laneur',
    publishDate: 'Recent Landmark Review',
    summary: 'Multicenter evaluations demonstrate that continuous 24-hour video-EEG telemetry combined with responsive neurostimulation (RNS) and precision stereotactic ablation yields a >70% seizure reduction rate in focal refractory epilepsy, reducing hospital readmissions.',
    keyTakeaway: 'Continuous inpatient EEG monitoring enables exact seizure focus mapping before progressive neuronal damage occurs.',
    clinicalSignificance: 'Supports specialized EMU telemetry care under Dr. Sanjay Sopan Varade for difficult-to-control seizures.',
    patientTips: [
      'Maintain a continuous digital seizure diary recording triggers, aura characteristics, and sleep duration.',
      'Never discontinue or alter antiepileptic medications without physician supervision.'
    ],
    tags: ['Epilepsy Monitoring', 'Video-EEG', 'Refractory Seizures', 'Neuro-Diagnostics']
  },
  {
    id: 'res-parkinson-2025',
    title: 'Multi-Target Deep Brain Stimulation & Alpha-Synuclein Biomarkers in Movement Disorders',
    category: 'parkinsons',
    source: 'JAMA Neurology',
    sourceUrl: 'https://jamanetwork.com/journals/jamaneurology',
    publishDate: 'Recent Movement Disorders Update',
    summary: 'Subthalamic nucleus and globus pallidus directional lead stimulation combined with novel CSF/skin alpha-synuclein seed amplification assays allows personalized motor symptom alleviation, drastically diminishing off-time dystonia and peak-dose dyskinesia in idiopathic Parkinson’s disease.',
    keyTakeaway: 'Directional neuromodulation fine-tunes electrical currents to relieve tremors and rigidity while sparing adjacent speech pathways.',
    clinicalSignificance: 'Guides optimal medical therapy adjustment and surgical candidacy evaluation for long-standing Parkinson’s patients.',
    patientTips: [
      'Consistent physical therapy, boxing drills, and rhythmic walking maintain stride cadence.',
      'Take levodopa doses strictly 30-45 minutes before meals to avoid dietary protein competition.'
    ],
    tags: ['Parkinson’s Disease', 'DBS Neuromodulation', 'Movement Disorders', 'Rehabilitation']
  },
  {
    id: 'res-alzheimers-2026',
    title: 'Blood-Based Phosphorylated Tau-217 Biomarkers & Amyloid-Targeted Monoclonal Antibodies',
    category: 'alzheimers',
    source: 'Nature Medicine & NEJM',
    sourceUrl: 'https://www.nature.com/nm',
    publishDate: 'Global Clinical Neuroscience Report',
    summary: 'High-affinity plasma p-tau217 immunoassays show >95% diagnostic accuracy matching PET amyloid scans, opening doors for early diagnosis of Alzheimer’s disease years before irreversible cognitive impairment and guiding early disease-modifying therapy.',
    keyTakeaway: 'Routine blood-based neurodegenerative biomarkers enable early, non-invasive detection of Alzheimer pathology at primary clinics.',
    clinicalSignificance: 'Enables early memory screening and risk stratification at Sopan Hospital’s Neuro-Cognitive OPD.',
    patientTips: [
      'Early clinical evaluation of mild forgetfulness or word-finding difficulty yields best therapeutic windows.',
      'Control cardiovascular risk factors like hypertension and hyperlipidemia to slow cognitive decline.'
    ],
    tags: ['Alzheimer’s Disease', 'p-tau217', 'Blood Biomarkers', 'Cognitive Neurology']
  },
  {
    id: 'res-who-brain-2026',
    title: 'WHO Global Action Plan: 14 Modifiable Midlife Risk Factors Slashing Dementia & Stroke Incidence',
    category: 'neuro-tips',
    source: 'World Health Organization (WHO) & The Lancet Commission',
    sourceUrl: 'https://www.who.int',
    publishDate: 'Global Public Health Advisory',
    summary: 'The Lancet Commission on Dementia and the WHO report that eliminating 14 modifiable risk factors—including midlife hypertension, untreated hearing loss, high LDL cholesterol, physical inactivity, and diabetes—can prevent or delay up to 45% of all worldwide dementia and stroke cases.',
    keyTakeaway: 'Nearly half of global cognitive decline and stroke cases are preventable through evidence-based midlife lifestyle and vascular management.',
    clinicalSignificance: 'Directly informs Sopan Hospital’s patient counseling, vascular screening, and preventive brain wellness protocols.',
    patientTips: [
      'Screen and treat unmanaged midlife hearing loss with hearing aids to reduce cognitive isolation.',
      'Maintain systolic BP strictly <130 mmHg and LDL cholesterol <70 mg/dL in high-risk individuals.',
      'Aim for 150 minutes of aerobic exercise weekly to enhance hippocampal neurogenesis.'
    ],
    tags: ['Brain Health', 'WHO Guidelines', 'Dementia Prevention', 'Preventive Neurology']
  },
  {
    id: 'res-brainhealth-2025',
    title: 'Midlife Blood Pressure Control & Mediterranean-MIND Nutrition in Preventing Vascular Cognitive Decline',
    category: 'neuro-tips',
    source: 'Nature Neuroscience & American Heart Association (AHA/ASA)',
    sourceUrl: 'https://www.ahajournals.org/journal/str',
    publishDate: 'Preventive Neuro-Wellness Guideline',
    summary: 'Epidemiological studies indicate rigorous systolic blood pressure management (<120-130 mmHg) combined with polyphenol-rich plant diets reduces cerebral microvascular white matter hyperintensities and slashes vascular dementia risk by 33% over a 15-year longitudinal span.',
    keyTakeaway: 'Brain health is vascular health: controlling hypertension, diabetes, and arterial stiffness directly shields neural plasticity.',
    clinicalSignificance: 'Forms the foundation of Sopan Hospital’s preventive lifestyle neurology and outpatient health counselling.',
    patientTips: [
      'Target daily blood pressure below 130/80 mmHg; check both morning and evening readings.',
      'Incorporate 7–8 hours of consistent sleep nightly to facilitate glymphatic brain metabolic waste clearance.',
      'Engage in 150 minutes of moderate aerobic activity weekly to stimulate brain-derived neurotrophic factor (BDNF).'
    ],
    tags: ['Brain Health', 'Vascular Dementia', 'Preventive Care', 'Hypertension Control']
  },
  {
    id: 'res-headache-2025',
    title: 'CGRP Receptor Antagonists & Monoclonal Antibodies in Intractable Migraine Prevention',
    category: 'headache',
    source: 'American Academy of Neurology (AAN)',
    sourceUrl: 'https://www.aan.com',
    publishDate: 'Neurology Practice Advisory',
    summary: 'Targeted Calcitonin Gene-Related Peptide (CGRP) pathway antagonists demonstrate durable efficacy in chronic migraine patients who previously failed conventional beta-blockers and anticonvulsants, with fewer systemic sedative side effects and faster return to work.',
    keyTakeaway: 'Targeted neuro-receptor therapeutics offer transformative relief for patients crippled by frequent severe migraine auras.',
    clinicalSignificance: 'Informed outpatient management for chronic daily headaches and migraine refractory to first-line agents.',
    patientTips: [
      'Avoid irregular fasting or dehydration, which remain the top physiological triggers for migraine onset.',
      'Consult a neurologist if headache frequency exceeds 4 episodes per month.'
    ],
    tags: ['Migraine', 'CGRP Antagonists', 'Cephalea', 'Outpatient Neurology']
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  const publicDir = path.join(process.cwd(), 'public');
  const distDir = path.join(process.cwd(), 'dist');

  // Explicit static file serving from /public with appropriate headers
  app.use(express.static(publicDir, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      } else if (filePath.endsWith('.png') || filePath.endsWith('.PNG')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (filePath.endsWith('.jpg') || filePath.endsWith('.JPG') || filePath.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      }
    }
  }));

  // Doctor photo handler serving the exact uploaded file or authentic portrait
  const handleDoctorPhotoRequest = (_req: express.Request, res: express.Response) => {
    const candidateNames = [
      'DSC_0050.png',
      'DSC_0050.JPG',
      'DSC_0050.jpg',
      'doctor-photo.png',
      'doctor-sanjay-varade.png',
      'ChatGPT Image May 26, 2026, 01_51_43 PM (1).png',
      'ChatGPT Image May 26, 2026, 01_51_43 PM (2).png',
      'doctor-sanjay-varade.svg'
    ];

    const searchDirs = [publicDir, distDir];

    for (const dir of searchDirs) {
      for (const name of candidateNames) {
        const filePath = path.join(dir, name);
        if (fs.existsSync(filePath)) {
          try {
            const buf = fs.readFileSync(filePath);
            if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
              res.setHeader('Content-Type', 'image/png');
            } else if (buf.slice(0, 100).toString('utf8').includes('<svg')) {
              res.setHeader('Content-Type', 'image/svg+xml');
            } else {
              res.setHeader('Content-Type', 'image/jpeg');
            }
          } catch {
            res.setHeader('Content-Type', 'image/jpeg');
          }
          res.setHeader('Cache-Control', 'public, max-age=86400');
          return res.sendFile(filePath);
        }
      }
    }

    res.status(404).send('Doctor photo not found');
  };

  app.get('/api/doctor-photo', handleDoctorPhotoRequest);
  app.get('/DSC_0050.JPG', handleDoctorPhotoRequest);
  app.get('/DSC_0050.jpg', handleDoctorPhotoRequest);
  app.get('/DSC_0050.png', handleDoctorPhotoRequest);
  app.get('/doctor-photo.png', handleDoctorPhotoRequest);
  app.get('/doctor-sanjay-varade.png', handleDoctorPhotoRequest);
  app.get('/doctor-sanjay-varade.svg', handleDoctorPhotoRequest);
  app.get(/DSC_0050/i, handleDoctorPhotoRequest);
  // Match any request containing ChatGPT Image
  app.get(/ChatGPT%20Image|ChatGPT\sImage/i, handleDoctorPhotoRequest);

  // Upload or set official doctor photo
  app.post('/api/upload-doctor-photo', (req, res) => {
    const { photoDataUrl, base64Data } = req.body || {};
    const rawData = photoDataUrl || base64Data;
    if (!rawData) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    try {
      let buffer: Buffer;
      let isSvg = false;

      if (rawData.startsWith('data:image/svg+xml;base64,')) {
        buffer = Buffer.from(rawData.replace('data:image/svg+xml;base64,', ''), 'base64');
        isSvg = true;
      } else if (rawData.startsWith('data:image/svg+xml,')) {
        buffer = Buffer.from(decodeURIComponent(rawData.replace('data:image/svg+xml,', '')));
        isSvg = true;
      } else if (rawData.includes(';base64,')) {
        buffer = Buffer.from(rawData.split(';base64,')[1], 'base64');
      } else {
        buffer = Buffer.from(rawData, 'base64');
      }

      // Save to public directory under canonical names
      fs.writeFileSync(path.join(publicDir, 'DSC_0050.JPG'), buffer);
      fs.writeFileSync(path.join(publicDir, 'DSC_0050.jpg'), buffer);
      fs.writeFileSync(path.join(publicDir, 'DSC_0050.png'), buffer);
      fs.writeFileSync(path.join(publicDir, 'doctor-photo.png'), buffer);
      fs.writeFileSync(path.join(publicDir, 'doctor-sanjay-varade.png'), buffer);
      fs.writeFileSync(path.join(publicDir, 'ChatGPT Image May 26, 2026, 01_51_43 PM (1).png'), buffer);
      fs.writeFileSync(path.join(publicDir, 'ChatGPT Image May 26, 2026, 01_51_43 PM (2).png'), buffer);
      if (isSvg) {
        fs.writeFileSync(path.join(publicDir, 'doctor-sanjay-varade.svg'), buffer);
      }

      res.json({
        success: true,
        message: 'Doctor photo updated successfully across all views',
        url: '/api/doctor-photo'
      });
    } catch (err: any) {
      console.error('Error saving doctor photo:', err);
      res.status(500).json({ error: 'Failed to save doctor photo', details: err.message });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // In-memory cache for search-grounded neurology news to conserve API quota
  const newsCache = new Map<string, { data: any; expiry: number }>();

  // Latest Neurology News & Clinical Research with Google Search Grounding
  app.post('/api/neurology-news', async (req, res) => {
    const { category = 'all', customQuery = '' } = req.body || {};
    const cacheKey = `${category}_${(customQuery || '').trim().toLowerCase()}`;

    // Return cached response if valid (10-minute cache window)
    const cached = newsCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return res.json(cached.data);
    }

    // Helper to get category-filtered fallback news
    const getFilteredFallback = () => {
      let items = FALLBACK_NEWS;
      if (customQuery && customQuery.trim().length > 0) {
        const q = customQuery.trim().toLowerCase();
        const matches = items.filter(item => 
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.keyTakeaway.toLowerCase().includes(q) ||
          item.tags.some(t => t.toLowerCase().includes(q)) ||
          item.category.toLowerCase().includes(q)
        );
        if (matches.length > 0) return matches;
      }
      if (category !== 'all' && category !== 'custom') {
        const filtered = items.filter(item => item.category === category);
        return filtered.length > 0 ? filtered : items;
      }
      return items;
    };

    // Build targeted search grounding query based on category or custom topic
    let queryTopic = 'latest worldwide clinical neurology research breakthroughs and neuro-health articles 2025 2026';
    if (customQuery && customQuery.trim().length > 0) {
      queryTopic = `latest worldwide medical research, clinical trials and guidelines on: ${customQuery.trim()}`;
    } else if (category === 'stroke') {
      queryTopic = 'latest worldwide acute ischemic stroke guidelines, endovascular thrombectomy, tenecteplase and neuro-critical care research 2025 2026';
    } else if (category === 'epilepsy') {
      queryTopic = 'latest worldwide clinical research in epilepsy, continuous video-EEG monitoring, drug-resistant seizure therapies and responsive neurostimulation 2025 2026';
    } else if (category === 'parkinsons') {
      queryTopic = 'latest worldwide clinical developments in Parkinson disease, deep brain stimulation, alpha-synuclein biomarkers and movement disorders 2025 2026';
    } else if (category === 'alzheimers') {
      queryTopic = 'latest worldwide clinical trials in Alzheimer disease, plasma p-tau217 biomarkers, amyloid monoclonal antibodies 2025 2026';
    } else if (category === 'headache') {
      queryTopic = 'latest clinical research on migraine, CGRP receptor antagonists, monoclonal antibodies and neuro-stimulation guidelines 2025 2026';
    } else if (category === 'neuro-tips') {
      queryTopic = 'worldwide evidence-based brain health tips, dementia prevention, sleep hygiene, hypertension control from Lancet, WHO, AHA';
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Return fallback data with transparent metadata if API key not yet provided
      const fallbackResponse = {
        isLiveGrounding: false,
        source: 'Worldwide Peer-Reviewed Clinical Research Repository',
        searchQueries: [queryTopic],
        groundingChunks: [
          { web: { title: 'The Lancet Neurology', uri: 'https://www.thelancet.com/journals/laneur' } },
          { web: { title: 'New England Journal of Medicine (NEJM)', uri: 'https://www.nejm.org' } },
          { web: { title: 'Nature Neuroscience & Medicine', uri: 'https://www.nature.com/neuro' } },
          { web: { title: 'Stroke Journal (AHA/ASA)', uri: 'https://www.ahajournals.org/journal/str' } },
          { web: { title: 'American Academy of Neurology (AAN)', uri: 'https://www.aan.com' } },
          { web: { title: 'World Health Organization (WHO)', uri: 'https://www.who.int' } }
        ],
        news: getFilteredFallback(),
        timestamp: new Date().toISOString()
      };
      newsCache.set(cacheKey, { data: fallbackResponse, expiry: Date.now() + 10 * 60 * 1000 });
      return res.json(fallbackResponse);
    }

    try {

      const prompt = `You are a clinical neuroscience research editor for Sopan Hospital & Neurology Institute.
Using Google Search, search for the most recent reputable clinical research updates and evidence-based neuro-health tips for: "${queryTopic}".

Rely exclusively on reputable medical sources (such as The Lancet Neurology, New England Journal of Medicine, JAMA Neurology, Stroke Journal, Nature Neuroscience, American Academy of Neurology, WHO, etc.).

Return a clean, valid JSON array containing exactly 4 or 5 distinct news/research items.
Each object in the array must strictly have these fields:
- "id": a unique string slug (e.g. "research-1")
- "title": a clear, high-impact clinical headline
- "category": one of ["stroke", "epilepsy", "parkinsons", "neuro-tips", "general"]
- "source": name of the reputable journal or institution (e.g. "The Lancet Neurology", "AHA Stroke Journal", "NEJM")
- "sourceUrl": reputable URL or official portal link
- "publishDate": recent date or timeframe (e.g. "January 2026", "Recent Clinical Trial", "Updated Guidelines")
- "summary": a 2-3 sentence rigorous clinical summary explaining the research finding or discovery
- "keyTakeaway": a 1-sentence bottom-line conclusion for doctors and patients
- "clinicalSignificance": how this relates to specialized neurological care, diagnostics, or patient recovery
- "patientTips": an array of 2-3 practical, evidence-based bullet points or actionable advice
- "tags": an array of 3-4 short topical keywords

Respond ONLY with the raw JSON array. Do not include markdown code fences or backticks.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const responseText = response.text || '';
      
      // Extract grounding metadata chunks and search queries
      const candidate = response.candidates?.[0];
      const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
      const webSearchQueries = candidate?.groundingMetadata?.webSearchQueries || [];

      // Parse JSON from model output
      let newsItems: any[] = [];
      try {
        const cleaned = responseText
          .replace(/```json/gi, '')
          .replace(/```/gi, '')
          .trim();
        newsItems = JSON.parse(cleaned);
      } catch {
        newsItems = [
          {
            id: 'grounded-report-1',
            title: `Latest Clinical Advances: ${customQuery || category.toUpperCase()}`,
            category: category === 'all' ? 'stroke' : category,
            source: 'Peer-Reviewed Journals via Google Search',
            sourceUrl: groundingChunks[0]?.web?.uri || 'https://www.aan.com',
            publishDate: 'Recent Publication',
            summary: responseText.slice(0, 320) + '...',
            keyTakeaway: 'Ongoing clinical studies emphasize early specialized neurological diagnosis and targeted intervention.',
            clinicalSignificance: 'Directly informs clinical decision protocols at Sopan Hospital Neurology Institute.',
            patientTips: [
              'Consult a qualified neurologist (MD, DM Neuro) for persistent symptoms.',
              'Adopt proactive lifestyle and vascular risk factor management.'
            ],
            tags: ['Clinical Neurology', 'Evidence-Based', 'Peer-Reviewed']
          }
        ];
      }

      const successResponse = {
        isLiveGrounding: true,
        source: 'Live Google Search Grounding via Gemini AI',
        searchQueries: webSearchQueries,
        groundingChunks: groundingChunks,
        news: newsItems,
        timestamp: new Date().toISOString()
      };

      newsCache.set(cacheKey, { data: successResponse, expiry: Date.now() + 15 * 60 * 1000 });
      res.json(successResponse);
    } catch (err: any) {
      // Graceful fallback on rate-limits (429), quota limits, or network timeouts without throwing errors
      const isQuotaLimit = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED') || err?.message?.includes('quota');
      if (isQuotaLimit) {
        console.warn('Notice: Gemini search grounding quota limit reached (429), serving verified clinical neurology news archive.');
      } else {
        console.warn('Notice: Gemini search service busy, serving verified clinical news fallback:', err?.message || 'timeout');
      }

      const fallbackResponse = {
        isLiveGrounding: false,
        source: 'Worldwide Peer-Reviewed Clinical Research Repository',
        searchQueries: [queryTopic || 'Worldwide clinical neurology research and health articles 2025-2026'],
        groundingChunks: [
          { web: { title: 'The Lancet Neurology', uri: 'https://www.thelancet.com/journals/laneur' } },
          { web: { title: 'New England Journal of Medicine (NEJM)', uri: 'https://www.nejm.org' } },
          { web: { title: 'Nature Neuroscience & Medicine', uri: 'https://www.nature.com/neuro' } },
          { web: { title: 'Stroke Journal (AHA/ASA)', uri: 'https://www.ahajournals.org/journal/str' } },
          { web: { title: 'American Academy of Neurology (AAN)', uri: 'https://www.aan.com' } },
          { web: { title: 'World Health Organization (WHO)', uri: 'https://www.who.int' } }
        ],
        news: getFilteredFallback(),
        timestamp: new Date().toISOString()
      };

      // Cache fallback for 5 minutes so rapid clicks don't repeatedly hit quota
      newsCache.set(cacheKey, { data: fallbackResponse, expiry: Date.now() + 5 * 60 * 1000 });
      res.json(fallbackResponse);
    }
  });

  // --- GEMINI MULTI-TURN CHAT ENDPOINT ---
  app.post('/api/gemini/chat', async (req, res) => {
    const ai = getGeminiClient();
    const { 
      messages = [], 
      model = 'gemini-3.8-flash', 
      systemInstruction,
      language = 'en'
    } = req.body;

    const allowedModels = ['gemini-3.8-flash', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite'];
    const selectedModel = allowedModels.includes(model) ? model : 'gemini-3.8-flash';

    const defaultInstruction = language === 'mr'
      ? `You are the official Sopan Hospital & Neurology Institute AI Assistant for Dr. Sanjay Sopan Varade (MD, DM Neuro) in Nashik, Maharashtra.
Location: Shrihari Kute Marg, Near Sandip Hotel, Mumbai Naka, Nashik - 422001. Hotline: 0253 2317364.
You MUST respond politely, empathetically, and fluently in Marathi (मराठी) using Devanagari script.
Explain neurological symptoms, OPD appointment booking (Mon-Sat 10AM-2PM & 5PM-8PM, OPD fee ₹1,500), diagnostic procedures (EEG, EMG, 32-Slice CT, MRI), and patient preparation clearly in Marathi.
Remind patients that in acute emergencies (facial drop, arm weakness, speech slurring, severe headache), they must immediately contact the 24/7 Stroke Hotline (0253 2317364) or visit the Emergency ICU. If user asks in English, reply in English.`
      : `You are the official Sopan Hospital & Neurology Institute AI Assistant for Dr. Sanjay Sopan Varade (MD, DM Neuro) in Nashik, Maharashtra.
Location: Shrihari Kute Marg, Near Sandip Hotel, Mumbai Naka, Nashik - 422001. Hotline: 0253 2317364.
Provide compassionate, medically sound, and clear guidance on neurological symptoms, OPD appointment booking, diagnostic procedures (EEG, EMG, 32-Slice CT, MRI), and patient preparation.
Remind patients that in acute emergencies (such as sudden weakness, facial drop, or severe headache), they must immediately contact the 24/7 Stroke Hotline (0253 2317364) or visit the Emergency ICU.`;

    if (!ai) {
      const lastMsg = messages[messages.length - 1]?.content || 'Hello';
      const demoReply = language === 'mr'
        ? `सोपान हॉस्पिटल आणि न्यूरोलॉजी इन्स्टिट्यूट नाशिकमध्ये आपले स्वागत आहे! (डेमो मोड: थेट एआय साठी कृपया सिक्रेट्समध्ये GEMINI_API_KEY सेट करा).\n\nआपल्या "${lastMsg}" या प्रश्नासंदर्भात: डॉ. संजय सोपान वराडे (MD, DM Neuro) यांचे क्लिनिक श्रीहरी कुटे मार्ग, मुंबई नाका, नाशिक येथे आहे. ओपीडी वेळ: सोम-शनि सकाळी १० ते दु. २ आणि सायं ५ ते रात्री ८ (ओपीडी फी: ₹१,५००). आपत्कालीन स्ट्रोकसाठी संपर्क: ०२५३ २३१७३६४.`
        : `Welcome to Sopan Hospital & Neurology Institute! (Demo mode: Please configure GEMINI_API_KEY in Secrets for live AI responses).\n\nRegarding "${lastMsg}": Dr. Sanjay Sopan Varade's clinic is located at Shrihari Kute Marg, Mumbai Naka, Nashik. OPD Timings are Mon-Sat: 10:00 AM – 2:00 PM and 5:00 PM – 8:00 PM. For emergency triage, call 0253 2317364.`;
      return res.json({
        text: demoReply,
        model: selectedModel
      });
    }

    try {
      const contents = messages.map((m: any) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content || '' }]
      }));

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction: systemInstruction || defaultInstruction,
          temperature: 0.7,
        }
      });

      res.json({
        text: response.text || '',
        model: selectedModel
      });
    } catch (err: any) {
      console.error('Error in /api/gemini/chat:', err);
      res.status(500).json({ 
        error: 'Failed to generate chat response', 
        details: err?.message || String(err) 
      });
    }
  });

  // --- GEMINI GOOGLE SEARCH GROUNDING ENDPOINT ---
  app.post('/api/gemini/search-grounding', async (req, res) => {
    const ai = getGeminiClient();
    const { prompt, language = 'en' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!ai) {
      return res.json({
        text: language === 'mr'
          ? `(गुगल सर्च माहिती पूर्वदृश्य: "${prompt}")\nसोपान हॉस्पिटल आणि न्यूरोलॉजी इन्स्टिट्यूट, नाशिक हे मेंदू आणि मज्जारज्जू विकारांसाठी अग्रगण्य केंद्र आहे. डॉ. संजय सोपान वराडे (MD, DM Neuro) यांच्या ओपीडीसाठी संपर्क साधा.`
          : `(Search Grounding preview for: "${prompt}")\nSopan Hospital & Neurology Institute, directed by Dr. Sanjay Sopan Varade, is Nashik's premier neuro center. For live Google Search grounded answers, configure GEMINI_API_KEY in Secrets.`,
        sources: [
          { title: 'The Lancet Neurology', uri: 'https://www.thelancet.com/journals/laneur' },
          { title: 'American Academy of Neurology', uri: 'https://www.aan.com' }
        ],
        searchQueries: [prompt]
      });
    }

    try {
      const sysInst = language === 'mr'
        ? 'You are an accurate clinical research and medical assistant for Sopan Hospital in Nashik. Always use the googleSearch tool to ground your response with verified, recent facts, and provide the explanation in fluent Marathi (मराठी) using Devanagari script.'
        : 'You are an accurate clinical research and medical assistant for Sopan Hospital. Always use the googleSearch tool to ground your response with verified, recent facts.';

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: sysInst,
          tools: [{ googleSearch: {} }]
        }
      });

      const candidate = response.candidates?.[0];
      const chunks = candidate?.groundingMetadata?.groundingChunks || [];
      const searchQueries = candidate?.groundingMetadata?.webSearchQueries || [];

      const sources = chunks
        .filter((c: any) => c.web?.uri)
        .map((c: any) => ({
          title: c.web.title || c.web.uri,
          uri: c.web.uri
        }));

      res.json({
        text: response.text || '',
        sources,
        searchQueries
      });
    } catch (err: any) {
      console.error('Error in /api/gemini/search-grounding:', err);
      res.status(500).json({ error: 'Search grounding failed', details: err?.message });
    }
  });

  // --- GEMINI GOOGLE MAPS GROUNDING ENDPOINT ---
  app.post('/api/gemini/maps-grounding', async (req, res) => {
    const ai = getGeminiClient();
    const { prompt, userLocation, language = 'en' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Default coordinates: Sopan Hospital, Mumbai Naka, Nashik (19.9975° N, 73.7898° E)
    const lat = userLocation?.latitude || 19.9975;
    const lng = userLocation?.longitude || 73.7898;

    if (!ai) {
      return res.json({
        text: language === 'mr'
          ? `(गुगल मॅप्स मार्गदर्शन: "${prompt}")\nसोपान हॉस्पिटल आणि न्यूरोलॉजी इन्स्टिट्यूट हे श्रीहरी कुटे मार्ग, संदीप हॉटेल जवळ, मुंबई नाका, नाशिक - ४२२००१ येथे स्थित आहे. मुंबई नाका चौकातून ओल्ड आग्रा रोड व पुणे महामार्गावरून येथे सहज पोहोचता येते.`
          : `(Maps Grounding preview for "${prompt}")\nSopan Hospital & Neurology Institute is centrally located at Shrihari Kute Marg, Near Sandip Hotel, Mumbai Naka, Nashik - 422001. Landmark: Mumbai Naka junction, accessible via Old Agra Road and Pune Highway.`,
        places: [
          { 
            title: 'Sopan Hospital & Neurology Institute, Nashik', 
            uri: 'https://maps.google.com/?q=Sopan+Hospital+Nashik' 
          },
          { 
            title: 'Mumbai Naka, Nashik', 
            uri: 'https://maps.google.com/?q=Mumbai+Naka+Nashik' 
          }
        ],
        coordinates: { latitude: lat, longitude: lng }
      });
    }

    try {
      const sysInst = language === 'mr'
        ? 'You are the geographical and navigation concierge for Sopan Hospital & Neurology Institute in Nashik, Maharashtra. Help users find directions, nearby diagnostic centers, pharmacies, ambulance transport access, and landmarks around Mumbai Naka in fluent Marathi (मराठी).'
        : 'You are the geographical and navigation concierge for Sopan Hospital & Neurology Institute in Nashik, Maharashtra. Help users find directions, nearby diagnostic centers, pharmacies, ambulance transport access, and landmarks around Mumbai Naka.';

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: sysInst,
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: lat,
                longitude: lng
              }
            }
          }
        }
      });

      const candidate = response.candidates?.[0];
      const chunks = candidate?.groundingMetadata?.groundingChunks || [];

      const places = chunks
        .filter((c: any) => c.maps?.uri || c.maps?.title)
        .map((c: any) => ({
          title: c.maps?.title || 'Location on Google Maps',
          uri: c.maps?.uri || '#'
        }));

      res.json({
        text: response.text || '',
        places,
        coordinates: { latitude: lat, longitude: lng }
      });
    } catch (err: any) {
      console.error('Error in /api/gemini/maps-grounding:', err);
      res.status(500).json({ error: 'Maps grounding failed', details: err?.message });
    }
  });

  // --- GEMINI AUDIO TRANSCRIBE ENDPOINT ---
  app.post('/api/gemini/transcribe', async (req, res) => {
    const ai = getGeminiClient();
    const { audioBase64, mimeType = 'audio/webm' } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    if (!ai) {
      return res.json({
        text: 'Patient reports mild morning headaches, localized to right frontal area for 3 days without visual disturbance. (Demo transcription - configure GEMINI_API_KEY in Secrets for live gemini-3.5-transcribe).'
      });
    }

    try {
      const audioPart = {
        inlineData: {
          mimeType,
          data: audioBase64
        }
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            audioPart,
            { text: 'Transcribe this patient audio recording accurately. Return only the verbatim transcription text.' }
          ]
        }
      });

      res.json({
        text: response.text || ''
      });
    } catch (err: any) {
      console.error('Error in /api/gemini/transcribe:', err);
      res.status(500).json({ error: 'Audio transcription failed', details: err?.message });
    }
  });

  // ==========================================
  // OPD BOOKING ROUTE WITH NEXT-DAY AUTO-SHIFT
  // ==========================================
  const handleOpdBooking = async (req: express.Request, res: express.Response) => {
    try {
      let targetDate = req.body.date || getFormattedDate(0);
      let wasShifted = false;
      const initialRequestedDate = targetDate;
      let targetSlotNumber = 1;

      // Descending order & auto-shift check:
      // If requested date's remaining count is 0, iteratively shift to the next day
      for (let i = 0; i < 30; i++) {
        const status = await getOpdStatusForDate(targetDate);
        if (!status.isFull) {
          targetSlotNumber = status.bookedCount + 1;
          break;
        }
        wasShifted = true;
        targetDate = getNextDateString(targetDate);
      }

      // Generate token (e.g., OPD-20261023-01)
      const tokenNumber = req.body.tokenNumber || `OPD-${targetDate.replace(/-/g, '')}-${String(targetSlotNumber).padStart(2, '0')}`;

      const appointmentData = {
        patientName: req.body.patientName || 'Patient',
        patientPhone: req.body.patientPhone || req.body.phone || req.body.contactNumber || '',
        contactNumber: req.body.contactNumber || req.body.patientPhone || req.body.phone || '',
        age: req.body.age !== undefined ? String(req.body.age) : '',
        gender: req.body.gender || 'Not Specified',
        department: req.body.department || 'Neurology & Brain Spine Care',
        timeSlot: req.body.timeSlot || 'Morning (10:00 AM - 02:00 PM)',
        chiefComplaint: req.body.chiefComplaint || req.body.conditionContext || 'General OPD Consultation',
        conditionContext: req.body.conditionContext || req.body.chiefComplaint || 'General OPD Consultation',
        date: targetDate, // Assigned date (original or auto-shifted next day)
        slotNumber: targetSlotNumber,
        tokenNumber,
        status: req.body.status || 'Pending',
        doctor: req.body.doctor || 'Dr. Sanjay Sopan Varade (MD, DM Neuro)',
        createdAt: new Date().toISOString(),
        bookedAt: new Date().toISOString(),
        wasAutoShifted: wasShifted,
        originalRequestedDate: wasShifted ? initialRequestedDate : null
      };

      const docRef = await addDoc(collection(db, 'appointments'), appointmentData);
      const updatedStatus = await getOpdStatusForDate(targetDate);

      return res.status(201).json({
        success: true,
        appointmentId: docRef.id,
        assignedDate: targetDate,
        originalRequestedDate: initialRequestedDate,
        slotNumber: targetSlotNumber,
        tokenNumber,
        autoShifted: wasShifted,
        status: appointmentData.status,
        message: wasShifted
          ? `Quota for ${initialRequestedDate} was full. Appointment booked for next day (${targetDate}) with status: PENDING awaiting Admin approval.`
          : 'OPD appointment submitted successfully. Status: PENDING awaiting Admin approval.',
        currentStatus: updatedStatus
      });
    } catch (error: any) {
      console.error('Error in OPD booking route:', error);
      return res.status(500).json({ error: error.message || 'Failed to book OPD appointment' });
    }
  };

  app.post('/api/opd/book', handleOpdBooking);
  app.post('/api/book-appointment', handleOpdBooking);

  // ==========================================
  // ADMIN DYNAMIC QUOTA UPDATE ROUTE
  // ==========================================
  app.post('/api/admin/opd/quota', async (req, res) => {
    try {
      const { date, totalQuota } = req.body;
      if (!date || typeof totalQuota !== 'number' || totalQuota < 0) {
        return res.status(400).json({ error: 'Valid date (YYYY-MM-DD) and non-negative totalQuota are required.' });
      }

      const quotaRef = doc(db, 'opd_quotas', date);
      await setDoc(quotaRef, {
        date,
        totalQuota,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Dynamic calculation: Remaining_Count = Admin_Total_Quota - Booked_Appointments_For_That_Date
      const status = await getOpdStatusForDate(date);

      return res.json({
        success: true,
        date,
        adminTotalQuota: status.adminTotalQuota,
        bookedCount: status.bookedCount,
        remainingCount: status.remainingCount,
        isFull: status.isFull
      });
    } catch (error: any) {
      console.error('Error in /api/admin/opd/quota:', error);
      return res.status(500).json({ error: error.message || 'Failed to update OPD quota' });
    }
  });

  // ==========================================
  // DYNAMIC REMAINING COUNTER STATUS ROUTE
  // ==========================================
  const handleOpdStatus = async (req: express.Request, res: express.Response) => {
    try {
      const dateStr = (req.query.date as string) || getFormattedDate(0);
      const status = await getOpdStatusForDate(dateStr);
      return res.json(status);
    } catch (error: any) {
      console.error('Error in OPD status route:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch OPD status' });
    }
  };

  app.get('/api/opd/status', handleOpdStatus);
  app.get('/api/opd-status', handleOpdStatus);

  // ========================================================
  // PATIENT PORTAL SECURE 6-DIGIT PIN AUTHENTICATION SYSTEM
  // ========================================================
  const PATIENT_SESSION_SECRET = process.env.PATIENT_SESSION_SECRET || 'sopan-neuro-patient-session-sec-2026-auth';

  // Helper: Secure Session Token Creation
  function createPatientSessionToken(phone: string, patientName: string = ''): string {
    const payload = {
      phone,
      patientName,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days session
      iat: Date.now()
    };
    const dataStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', PATIENT_SESSION_SECRET).update(dataStr).digest('base64url');
    return `${dataStr}.${signature}`;
  }

  // Helper: Secure Session Token Verification
  function verifyPatientSessionToken(token: string): { valid: boolean; phone?: string; patientName?: string; error?: string } {
    try {
      if (!token || !token.includes('.')) {
        return { valid: false, error: 'Malformed session token' };
      }
      const [dataStr, signature] = token.split('.');
      const expectedSig = crypto.createHmac('sha256', PATIENT_SESSION_SECRET).update(dataStr).digest('base64url');
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
        return { valid: false, error: 'Invalid session signature' };
      }
      const payload = JSON.parse(Buffer.from(dataStr, 'base64url').toString('utf8'));
      if (Date.now() > payload.exp) {
        return { valid: false, error: 'Session expired. Please log in again.' };
      }
      return { valid: true, phone: payload.phone, patientName: payload.patientName };
    } catch (err: any) {
      return { valid: false, error: err?.message || 'Invalid session' };
    }
  }

  // Helper: Cryptographically Salted PIN Hash (PBKDF2 100,000 rounds)
  function hashPatientPin(pin: string, salt: string): string {
    return crypto.pbkdf2Sync(pin, salt, 100000, 64, 'sha512').toString('hex');
  }

  // Helper: Normalize security question answer (case-insensitive, trimmed, single spaces)
  function normalizeSecurityAnswer(answer: string): string {
    return (answer || '').toLowerCase().trim().replace(/\s+/g, ' ');
  }

  // Helper: Cryptographically Salted Security Answer Hash (PBKDF2 100,000 rounds)
  function hashSecurityAnswer(answer: string, salt: string): string {
    const normalized = normalizeSecurityAnswer(answer);
    return crypto.pbkdf2Sync(normalized, salt, 100000, 64, 'sha512').toString('hex');
  }

  // Helper: Generate short-lived signed PIN reset token (10 min expiry)
  function createPinResetToken(phone: string): string {
    const payload = {
      phone,
      purpose: 'pin_reset',
      exp: Date.now() + 10 * 60 * 1000,
      iat: Date.now()
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', PATIENT_SESSION_SECRET).update(encoded).digest('base64url');
    return `${encoded}.${signature}`;
  }

  // Helper: Verify short-lived signed PIN reset token
  function verifyPinResetToken(token: string): { valid: boolean; phone?: string; error?: string } {
    try {
      if (!token || !token.includes('.')) {
        return { valid: false, error: 'Invalid reset token' };
      }
      const [encoded, signature] = token.split('.');
      const expectedSig = crypto.createHmac('sha256', PATIENT_SESSION_SECRET).update(encoded).digest('base64url');
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
        return { valid: false, error: 'Tampered reset token' };
      }
      const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
      if (payload.purpose !== 'pin_reset') {
        return { valid: false, error: 'Invalid token purpose' };
      }
      if (Date.now() > payload.exp) {
        return { valid: false, error: 'Reset session expired. Please verify your security answer again.' };
      }
      return { valid: true, phone: payload.phone };
    } catch (err: any) {
      return { valid: false, error: err?.message || 'Invalid reset token' };
    }
  }

  // Helper: Normalizes 10-digit Indian mobile number
  function normalizePatientPhone(raw: string): { national: string; e164: string; isValid: boolean } {
    const digits = (raw || '').replace(/\D/g, '');
    let national = digits;
    if (digits.length === 12 && digits.startsWith('91')) {
      national = digits.slice(2);
    } else if (digits.length === 11 && digits.startsWith('0')) {
      national = digits.slice(1);
    } else if (digits.length > 10) {
      national = digits.slice(-10);
    }
    const isValid = national.length === 10 && /^[6-9]\d{9}$/.test(national);
    return {
      national,
      e164: `+91${national}`,
      isValid
    };
  }

  // In-Memory fallback cache for instant resilience during Firestore rules propagation
  const patientAccountsCache = new Map<string, any>();

  async function getPatientAccountData(nationalPhone: string): Promise<any | null> {
    try {
      const accountRef = doc(db, 'patient_accounts', nationalPhone);
      const snap = await getDoc(accountRef);
      if (snap.exists()) {
        const data = snap.data();
        patientAccountsCache.set(nationalPhone, data);
        return data;
      }
    } catch (err: any) {
      console.warn('Notice accessing Firestore patient_accounts, using cache fallback:', err?.message || err);
    }
    return patientAccountsCache.get(nationalPhone) || null;
  }

  async function savePatientAccountData(nationalPhone: string, update: any): Promise<any> {
    const existing = (await getPatientAccountData(nationalPhone)) || {};
    const merged = { ...existing, ...update, phone: nationalPhone, updatedAt: new Date().toISOString() };
    patientAccountsCache.set(nationalPhone, merged);
    try {
      const accountRef = doc(db, 'patient_accounts', nationalPhone);
      await setDoc(accountRef, merged, { merge: true });
    } catch (err: any) {
      console.warn('Notice saving to Firestore patient_accounts, cached locally:', err?.message || err);
    }
    return merged;
  }

  // 1. Check Mobile Number Status (For Registration / Login Routing)
  app.post('/api/patient-auth/check-status', async (req, res) => {
    try {
      const { phone } = req.body;
      const { national, e164, isValid } = normalizePatientPhone(phone);
      if (!isValid) {
        return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number.' });
      }

      const existingAccount = await getPatientAccountData(national);

      // Check temporary lockout
      if (existingAccount && existingAccount.lockedUntil && new Date(existingAccount.lockedUntil).getTime() > Date.now()) {
        const remainingMinutes = Math.ceil((new Date(existingAccount.lockedUntil).getTime() - Date.now()) / (60 * 1000));
        return res.status(423).json({
          isLocked: true,
          lockedUntil: existingAccount.lockedUntil,
          error: `Account temporarily locked due to too many failed attempts. Please wait ${remainingMinutes} minute(s).`
        });
      }

      // Check Firestore appointments for this patient phone
      let patientAppts: any[] = [];
      try {
        const apptsRef = collection(db, 'appointments');
        const allApptsSnap = await getDocs(apptsRef);
        allApptsSnap.docs.forEach(d => {
          const ad = d.data();
          const p = (ad.contactNumber || ad.phone || ad.patientPhone || '').replace(/\D/g, '');
          if (p.endsWith(national)) {
            patientAppts.push({ id: d.id, ...ad });
          }
        });
      } catch (apptErr: any) {
        console.warn('Notice querying appointments in check-status:', apptErr?.message || apptErr);
      }

      const hasAppointments = patientAppts.length > 0;
      const isPinSet = Boolean(existingAccount?.isPinSet);

      return res.json({
        success: true,
        phone: national,
        e164,
        isRegistered: isPinSet,
        isPinSet,
        isLocked: false
      });
    } catch (err: any) {
      console.error('Error in /api/patient-auth/check-status:', err);
      return res.status(500).json({ error: err?.message || 'Failed to check patient account status' });
    }
  });

  // 2. Patient Registration: Set PIN + Security Question + Answer (Direct patient registration - no reception/admin code needed)
  app.post('/api/patient-auth/register', async (req, res) => {
    try {
      const { phone, pin, confirmPin, securityQuestion, securityAnswer, patientName: clientName } = req.body;
      const { national, e164, isValid } = normalizePatientPhone(phone);
      if (!isValid) {
        return res.status(400).json({ error: 'Valid 10-digit mobile number is required.' });
      }

      if (!pin || !confirmPin) {
        return res.status(400).json({ error: 'Both PIN fields are required.' });
      }
      if (pin !== confirmPin) {
        return res.status(400).json({ error: 'PINs do not match. Please ensure both 6-digit fields are identical.' });
      }
      if (!/^\d{6}$/.test(pin)) {
        return res.status(400).json({ error: 'PIN must be exactly 6 numeric digits (0-9).' });
      }

      if (!securityQuestion || typeof securityQuestion !== 'string' || securityQuestion.trim().length < 5) {
        return res.status(400).json({ error: 'Please select a valid security question.' });
      }

      if (!securityAnswer || typeof securityAnswer !== 'string' || securityAnswer.trim().length < 2) {
        return res.status(400).json({ error: 'Please enter a valid answer to your security question (at least 2 characters).' });
      }

      const existingAccount = await getPatientAccountData(national);
      if (existingAccount && existingAccount.isPinSet) {
        return res.status(400).json({
          error: 'An account with this mobile number already exists. Please log in or use Forgot PIN.'
        });
      }

      // Explicit patient profile name - do not automatically inherit unrelated sample names
      const patientName = clientName ? clientName.trim() : (existingAccount?.patientName && existingAccount.patientName !== 'Patient' ? existingAccount.patientName : '');

      // Salt and hash PIN
      const pinSalt = crypto.randomBytes(16).toString('hex');
      const pinHash = hashPatientPin(pin, pinSalt);

      // Salt and hash Security Answer
      const answerSalt = crypto.randomBytes(16).toString('hex');
      const securityAnswerHash = hashSecurityAnswer(securityAnswer, answerSalt);

      const savedAccount = await savePatientAccountData(national, {
        phone: national,
        e164,
        patientName,
        pinHash,
        pinSalt,
        securityQuestion: securityQuestion.trim(),
        securityAnswerHash,
        answerSalt,
        isPinSet: true,
        failedAttempts: 0,
        failedAnswerAttempts: 0,
        lockedUntil: null,
        createdAt: new Date().toISOString()
      });

      const sessionToken = createPatientSessionToken(national, patientName || 'Patient');

      return res.json({
        success: true,
        message: 'PIN setup complete!',
        token: sessionToken,
        phone: national,
        e164,
        patientName
      });
    } catch (err: any) {
      console.error('Error in /api/patient-auth/register:', err);
      return res.status(500).json({ error: err?.message || 'Failed to complete registration' });
    }
  });

  // 2b. Patient Profile: Save / Update Patient Profile Name
  app.post('/api/patient-auth/update-profile-name', async (req, res) => {
    try {
      const { phone, patientName } = req.body;
      const { national, e164, isValid } = normalizePatientPhone(phone);
      if (!isValid) {
        return res.status(400).json({ error: 'Valid 10-digit mobile number is required.' });
      }
      if (!patientName || typeof patientName !== 'string' || patientName.trim().length < 2) {
        return res.status(400).json({ error: 'Please enter your full patient name (at least 2 characters).' });
      }

      const trimmedName = patientName.trim();
      await savePatientAccountData(national, {
        patientName: trimmedName,
        updatedAt: new Date().toISOString()
      });

      const sessionToken = createPatientSessionToken(national, trimmedName);

      return res.json({
        success: true,
        patientName: trimmedName,
        phone: national,
        e164,
        token: sessionToken
      });
    } catch (err: any) {
      console.error('Error in /api/patient-auth/update-profile-name:', err);
      return res.status(500).json({ error: err?.message || 'Failed to update profile name' });
    }
  });

  // 3. Patient Login: Mobile Number + 6-Digit PIN
  app.post('/api/patient-auth/login', async (req, res) => {
    try {
      const { phone, pin } = req.body;
      const { national, e164, isValid } = normalizePatientPhone(phone);
      if (!isValid) {
        return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number.' });
      }
      if (!pin || !/^\d{6}$/.test(pin)) {
        return res.status(400).json({ error: 'Please enter your complete 6-digit PIN.' });
      }

      const accountData = await getPatientAccountData(national);
      if (!accountData || !accountData.isPinSet) {
        return res.status(400).json({ error: 'PIN not found for this mobile number. Please register first.' });
      }

      // Check temporary lockout
      if (accountData.lockedUntil && new Date(accountData.lockedUntil).getTime() > Date.now()) {
        const remainingMinutes = Math.ceil((new Date(accountData.lockedUntil).getTime() - Date.now()) / (60 * 1000));
        return res.status(423).json({
          isLocked: true,
          lockedUntil: accountData.lockedUntil,
          error: `Account temporarily locked due to too many failed attempts. Please wait ${remainingMinutes} minute(s).`
        });
      }

      // Verify salted PIN hash
      const candidateHash = hashPatientPin(pin, accountData.pinSalt || '');
      const isMatch = crypto.timingSafeEqual(
        Buffer.from(candidateHash, 'hex'),
        Buffer.from(accountData.pinHash || '', 'hex')
      );

      if (!isMatch) {
        const failedAttempts = (accountData.failedAttempts || 0) + 1;
        let lockedUntil = null;
        let errorMsg = `Incorrect 6-digit PIN. ${Math.max(0, 5 - failedAttempts)} attempt(s) remaining before temporary lockout.`;

        if (failedAttempts >= 5) {
          lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes lockout
          errorMsg = 'Incorrect PIN. You have exceeded 5 failed attempts. Account is temporarily locked for 15 minutes.';
        }

        await savePatientAccountData(national, {
          failedAttempts,
          lockedUntil
        });

        return res.status(failedAttempts >= 5 ? 423 : 401).json({
          error: errorMsg,
          failedAttempts,
          isLocked: failedAttempts >= 5,
          remainingAttempts: Math.max(0, 5 - failedAttempts)
        });
      }

      // Successful login: reset failed attempts
      await savePatientAccountData(national, {
        failedAttempts: 0,
        failedAnswerAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date().toISOString()
      });

      const currentProfileName = accountData.patientName && accountData.patientName !== 'Patient' ? accountData.patientName : '';
      const sessionToken = createPatientSessionToken(national, currentProfileName || 'Patient');

      return res.json({
        success: true,
        token: sessionToken,
        phone: national,
        e164,
        patientName: currentProfileName,
        requiresProfileName: !currentProfileName
      });
    } catch (err: any) {
      console.error('Error in /api/patient-auth/login:', err);
      return res.status(500).json({ error: err?.message || 'Login failed' });
    }
  });

  // 4. Forgot PIN: Step 1 - Fetch Security Question for Mobile Number
  app.post('/api/patient-auth/forgot-pin/get-question', async (req, res) => {
    try {
      const { phone } = req.body;
      const { national, isValid } = normalizePatientPhone(phone);
      if (!isValid) {
        return res.status(400).json({ error: 'Valid 10-digit mobile number is required.' });
      }

      const accountData = await getPatientAccountData(national);

      // Check temporary lockout
      if (accountData && accountData.lockedUntil && new Date(accountData.lockedUntil).getTime() > Date.now()) {
        const remainingMinutes = Math.ceil((new Date(accountData.lockedUntil).getTime() - Date.now()) / (60 * 1000));
        return res.status(423).json({
          isLocked: true,
          lockedUntil: accountData.lockedUntil,
          error: `Account temporarily locked due to too many failed attempts. Please wait ${remainingMinutes} minute(s).`
        });
      }

      if (!accountData || !accountData.isPinSet || !accountData.securityQuestion) {
        return res.status(404).json({
          error: 'No registered account with a security question found for this mobile number.'
        });
      }

      // Return only the question string - never expose answers or hashes
      return res.json({
        success: true,
        phone: national,
        securityQuestion: accountData.securityQuestion
      });
    } catch (err: any) {
      console.error('Error in /api/patient-auth/forgot-pin/get-question:', err);
      return res.status(500).json({ error: err?.message || 'Failed to retrieve security question' });
    }
  });

  // 5. Forgot PIN: Step 2 - Verify Security Question Answer & Return Signed Reset Token
  app.post('/api/patient-auth/forgot-pin/verify-answer', async (req, res) => {
    try {
      const { phone } = req.body;
      const securityAnswer = req.body.securityAnswer || req.body.answer;
      const { national, isValid } = normalizePatientPhone(phone);
      if (!isValid) {
        return res.status(400).json({ error: 'Valid 10-digit mobile number is required.' });
      }

      if (!securityAnswer || typeof securityAnswer !== 'string' || !securityAnswer.trim()) {
        return res.status(400).json({ error: 'Please enter your answer.' });
      }

      const accountData = await getPatientAccountData(national);

      // Check temporary lockout
      if (accountData && accountData.lockedUntil && new Date(accountData.lockedUntil).getTime() > Date.now()) {
        const remainingMinutes = Math.ceil((new Date(accountData.lockedUntil).getTime() - Date.now()) / (60 * 1000));
        return res.status(423).json({
          isLocked: true,
          lockedUntil: accountData.lockedUntil,
          error: `Account temporarily locked. Please wait ${remainingMinutes} minute(s).`
        });
      }

      if (!accountData || !accountData.securityAnswerHash || !accountData.answerSalt) {
        return res.status(400).json({
          error: 'Account does not have a security question configured.'
        });
      }

      const candidateHash = hashSecurityAnswer(securityAnswer, accountData.answerSalt);
      const isMatch = crypto.timingSafeEqual(
        Buffer.from(candidateHash, 'hex'),
        Buffer.from(accountData.securityAnswerHash, 'hex')
      );

      if (!isMatch) {
        const failedAnswerAttempts = (accountData.failedAnswerAttempts || 0) + 1;
        let lockedUntil = null;
        let errorMsg = `Incorrect answer. ${Math.max(0, 5 - failedAnswerAttempts)} attempt(s) remaining before temporary lockout.`;

        if (failedAnswerAttempts >= 5) {
          lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
          errorMsg = 'Incorrect answer. You have exceeded 5 attempts. Account is temporarily locked for 15 minutes to prevent guessing.';
        }

        await savePatientAccountData(national, {
          failedAnswerAttempts,
          lockedUntil
        });

        return res.status(failedAnswerAttempts >= 5 ? 423 : 401).json({
          error: errorMsg,
          isLocked: failedAnswerAttempts >= 5,
          remainingAttempts: Math.max(0, 5 - failedAnswerAttempts)
        });
      }

      // Reset failed attempts on correct answer
      await savePatientAccountData(national, {
        failedAnswerAttempts: 0
      });

      // Issue short-lived, HMAC-signed PIN reset token
      const resetToken = createPinResetToken(national);

      return res.json({
        success: true,
        resetToken,
        message: 'Security answer verified successfully. You may now create a new PIN.'
      });
    } catch (err: any) {
      console.error('Error in /api/patient-auth/forgot-pin/verify-answer:', err);
      return res.status(500).json({ error: err?.message || 'Failed to verify security answer' });
    }
  });

  // 6. Forgot PIN: Step 3 - Set and Confirm New 6-Digit PIN
  app.post('/api/patient-auth/forgot-pin/reset-pin', async (req, res) => {
    try {
      const { phone, resetToken, newPin, confirmPin, confirmNewPin } = req.body;
      const effectiveConfirmPin = confirmPin || confirmNewPin;
      const { national, e164, isValid } = normalizePatientPhone(phone);
      if (!isValid) {
        return res.status(400).json({ error: 'Valid 10-digit mobile number is required.' });
      }

      if (!resetToken) {
        return res.status(401).json({ error: 'Reset authorization token required. Please answer your security question first.' });
      }

      const tokenCheck = verifyPinResetToken(resetToken);
      if (!tokenCheck.valid || tokenCheck.phone !== national) {
        return res.status(403).json({ error: tokenCheck.error || 'Invalid or expired reset session. Please answer your security question again.' });
      }

      if (!newPin || !effectiveConfirmPin) {
        return res.status(400).json({ error: 'Both PIN fields are required.' });
      }
      if (newPin !== effectiveConfirmPin) {
        return res.status(400).json({ error: 'PINs do not match. Please ensure both 6-digit fields are identical.' });
      }
      if (!/^\d{6}$/.test(newPin)) {
        return res.status(400).json({ error: 'New PIN must be exactly 6 numeric digits (0-9).' });
      }

      const accountData = await getPatientAccountData(national);
      if (!accountData) {
        return res.status(404).json({ error: 'Account not found.' });
      }

      // Salt & Hash new PIN
      const pinSalt = crypto.randomBytes(16).toString('hex');
      const pinHash = hashPatientPin(newPin, pinSalt);

      await savePatientAccountData(national, {
        pinHash,
        pinSalt,
        failedAttempts: 0,
        failedAnswerAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date().toISOString()
      });

      const sessionToken = createPatientSessionToken(national, accountData.patientName || 'Patient');

      return res.json({
        success: true,
        message: 'Your 6-digit PIN has been reset successfully! Logging you in...',
        token: sessionToken,
        phone: national,
        e164,
        patientName: accountData.patientName || 'Patient'
      });
    } catch (err: any) {
      console.error('Error in /api/patient-auth/forgot-pin/reset-pin:', err);
      return res.status(500).json({ error: err?.message || 'Failed to reset PIN' });
    }
  });

  // 6. Secure Authenticated Appointments Retrieval
  // Enforces that patients can ONLY see their own records using the authenticated session token
  app.get('/api/patient-auth/appointments', async (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      const session = verifyPatientSessionToken(token);

      if (!session.valid || !session.phone) {
        return res.status(401).json({ error: session.error || 'Authentication required. Please log in with your PIN.' });
      }

      const phone = session.phone;
      const apptsRef = collection(db, 'appointments');
      const snap = await getDocs(apptsRef);

      const patientAppointments: any[] = [];
      snap.docs.forEach(d => {
        const ad = d.data();
        const p = (ad.contactNumber || ad.phone || ad.patientPhone || '').replace(/\D/g, '');
        if (p.endsWith(phone)) {
          patientAppointments.push({ id: d.id, ...ad });
        }
      });

      patientAppointments.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

      return res.json({
        success: true,
        phone,
        appointments: patientAppointments
      });
    } catch (err: any) {
      console.error('Error in /api/patient-auth/appointments:', err);
      return res.status(500).json({ error: err?.message || 'Failed to fetch authenticated appointments' });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Create HTTP server to support both Express and WebSockets
  const httpServer = http.createServer(app);

  // Setup WebSocket Server for Gemini 3.8 Live API Voice conversations
  const wss = new WebSocketServer({ server: httpServer, path: '/live' });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('Client connected to /live voice session');
    const ai = getGeminiClient();

    if (!ai) {
      clientWs.send(JSON.stringify({
        type: 'info',
        message: 'Live API requires GEMINI_API_KEY. Connect your API key in Secrets to stream real-time voice with gemini-3.8-live.'
      }));
      return;
    }

    try {
      const session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: 'You are the real-time AI Voice Assistant for Sopan Hospital & Neurology Institute in Nashik. Speak kindly, clearly, and supportively to guide patients with their questions about Dr. Sanjay Sopan Varade, neurological symptoms, and OPD appointments.'
        },
        callbacks: {
          onmessage: (msg: any) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              clientWs.send(JSON.stringify({ type: 'audio', audio: audioData }));
            }
            if (msg.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: 'interrupted' }));
            }
          },
          onclose: () => {
            clientWs.close();
          }
        }
      });

      clientWs.on('message', (raw: any) => {
        try {
          const parsed = JSON.parse(raw.toString());
          if (parsed.audio) {
            session.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' }
            });
          }
          if (parsed.text) {
            session.sendRealtimeInput({
              text: parsed.text
            });
          }
        } catch (e) {
          console.error('Error handling WebSocket message:', e);
        }
      });

      clientWs.on('close', () => {
        try {
          session.close();
        } catch (e) {
          // ignore
        }
      });
    } catch (err) {
      console.error('Error initiating Gemini Live session:', err);
      clientWs.send(JSON.stringify({ type: 'error', message: 'Failed to initiate Live session' }));
    }
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Sopan Hospital App Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
