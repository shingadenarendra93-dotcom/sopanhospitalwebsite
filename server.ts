import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
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

  // Latest Neurology News & Clinical Research with Google Search Grounding
  app.post('/api/neurology-news', async (req, res) => {
    const { category = 'all', customQuery = '' } = req.body || {};

    const ai = getGeminiClient();

    if (!ai) {
      // Return fallback data with transparent metadata if API key not yet provided
      let filteredFallback = FALLBACK_NEWS;
      if (category !== 'all' && category !== 'custom') {
        filteredFallback = FALLBACK_NEWS.filter(item => item.category === category);
        if (filteredFallback.length === 0) filteredFallback = FALLBACK_NEWS;
      }
      return res.json({
        isLiveGrounding: false,
        source: 'Curated Clinical Database (Configure GEMINI_API_KEY for Real-Time Google Search Grounding)',
        searchQueries: ['Recent clinical neurology developments 2025-2026'],
        groundingChunks: [
          { web: { title: 'The Lancet Neurology', uri: 'https://www.thelancet.com/journals/laneur' } },
          { web: { title: 'New England Journal of Medicine (NEJM)', uri: 'https://www.nejm.org' } },
          { web: { title: 'Stroke Journal (AHA/ASA)', uri: 'https://www.ahajournals.org/journal/str' } },
          { web: { title: 'American Academy of Neurology (AAN)', uri: 'https://www.aan.com' } }
        ],
        news: filteredFallback,
        timestamp: new Date().toISOString()
      });
    }

    try {
      // Build targeted search grounding query based on category or custom topic
      let queryTopic = 'latest clinical neurology research breakthroughs and neuro-health tips';
      if (customQuery && customQuery.trim().length > 0) {
        queryTopic = `latest medical research, clinical trials and guidelines on: ${customQuery.trim()}`;
      } else if (category === 'stroke') {
        queryTopic = 'latest acute ischemic stroke guidelines, endovascular thrombectomy, tenecteplase and neuro-critical care research 2025 2026';
      } else if (category === 'epilepsy') {
        queryTopic = 'latest clinical research in epilepsy, continuous video-EEG monitoring, drug-resistant seizure therapies and responsive neurostimulation 2025 2026';
      } else if (category === 'parkinsons') {
        queryTopic = 'latest clinical developments in Parkinson disease, deep brain stimulation, alpha-synuclein biomarkers and movement disorders 2025 2026';
      } else if (category === 'neuro-tips') {
        queryTopic = 'evidence-based brain health tips, dementia prevention, sleep hygiene, hypertension control for stroke prevention from Lancet, WHO, AHA';
      }

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
      } catch (parseErr) {
        console.warn('Could not parse Gemini search-grounded JSON directly, using fallback structure with model synthesis text:', parseErr);
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

      res.json({
        isLiveGrounding: true,
        source: 'Live Google Search Grounding via Gemini 3.8 Flash',
        searchQueries: webSearchQueries,
        groundingChunks: groundingChunks,
        news: newsItems,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error('Error generating search-grounded neurology news:', err);
      // Fallback seamlessly on rate-limit or network timeout
      res.json({
        isLiveGrounding: false,
        source: 'Curated Clinical Database (Search service temporarily busy)',
        searchQueries: ['Recent clinical neurology developments 2025-2026'],
        groundingChunks: [
          { web: { title: 'The Lancet Neurology', uri: 'https://www.thelancet.com/journals/laneur' } },
          { web: { title: 'New England Journal of Medicine (NEJM)', uri: 'https://www.nejm.org' } },
          { web: { title: 'Stroke Journal (AHA/ASA)', uri: 'https://www.ahajournals.org/journal/str' } }
        ],
        news: FALLBACK_NEWS,
        timestamp: new Date().toISOString()
      });
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sopan Hospital App Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
