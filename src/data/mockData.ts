import {
  Doctor,
  Appointment,
  PatientProfile,
  DiagnosticReport,
  Prescription,
  PatientVitalsLog,
  DiseaseArticle,
  BrainAnatomyHotspot,
  SecureMessage,
  CaseStudy,
  StaffPayrollRecord,
  GoogleReview,
  PatientSuccessStory
} from '../types';

export const DOCTORS: Doctor[] = [
  {
    id: 'doc-sanjay-varade',
    name: 'Dr. Sanjay Sopan Varade',
    qualifications: 'MD, DM Neuro',
    designation: 'Director & Chief Consultant Neurologist',
    department: 'Comprehensive Stroke Center',
    experienceYears: 35,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    timeSlots: ['09:30 AM', '11:00 AM', '02:00 PM', '04:30 PM', '06:00 PM'],
    opdFee: 1500,
    rating: 4.96,
    reviewCount: 742,
    avatarUrl: '/DSC_0050.JPG',
    bio: 'Senior Chief Neurologist & Director heading Sopan Hospital and Neurology Institute, Nashik with over 35+ years of distinguished clinical mastery. Renowned Neurophysician with MBBS, MD (Internal Medicine), and DM (Neurology from Christian Medical College - CMC Vellore). Specialized in Hyper-Acute Ischemic Stroke Interventions, Intractable Epilepsy & Video EEG, Parkinson’s Disease & Movement Disorders, Refractory Migraine, Vertigo, and Neuro-Critical Care.',
    languages: ['English', 'Marathi', 'Hindi']
  }
];

export const INITIAL_PATIENT: PatientProfile = {
  id: 'pat-101',
  uhid: 'SOPAN-NEURO-2024-8842',
  fullName: 'Rajesh S. Kulkarni',
  age: 58,
  gender: 'Male',
  bloodGroup: 'B+ Positive',
  primaryDiagnosis: 'Subacute Left MCA Territory Ischemic Stroke (Post-Thrombectomy Day 28)',
  attendingDoctor: 'Dr. Sanjay Sopan Varade MD, DM Neuro',
  emergencyContact: '+91 98230 45678',
  emergencyRelation: 'Spouse (Sunita Kulkarni)',
  allergies: ['Penicillin', 'Sulfa drugs'],
  caregiverName: 'Sunita Kulkarni',
  caregiverPhone: '+91 98230 45678'
};

export const INITIAL_REPORTS: DiagnosticReport[] = [
  {
    id: 'rep-01',
    patientId: 'pat-101',
    testName: '32-Slice High-Resolution Brain CT Angiography & Perfusion',
    modality: '32-Slice CT Scanner',
    date: '14 Sep 2026',
    referringDoctor: 'Dr. Sanjay Sopan Varade MD, DM Neuro',
    impression: 'Whole-brain 32-slice helical CT scan with non-contrast volumetric imaging and CTA perfusion protocol. Sub-millimeter slice reconstruction confirms patent left MCA bifurcation following successful acute stroke recanalization.',
    findings: [
      'Volumetric 32-slice spiral CT demonstrates resolving hypodensity in left fronto-parietal region without mass effect.',
      '32-slice CT Angiography (CTA) confirms patent lumen of left M1 and M2 branches with brisk distal cortical filling.',
      'Zero intracranial hemorrhage, epidural/subdural hematoma, or midline displacement.',
      'Calvarium, skull base, and basal cisterns are completely preserved.'
    ],
    status: 'Final Verified'
  },
  {
    id: 'rep-02',
    patientId: 'pat-101',
    testName: 'Continuous 12-Channel Neuro-Telemetry & EEG',
    modality: '24-hr Video EEG',
    date: '10 Sep 2026',
    referringDoctor: 'Dr. Sanjay Sopan Varade MD, DM Neuro',
    impression: 'Mild left hemispheric polymorphic delta slowing over fronto-temporal regions concordant with structural ischemic focus. Zero electrographic seizure activity captured.',
    findings: [
      'Background rhythm shows symmetric 9 Hz alpha activity over occipital electrodes.',
      'Intermittent focal theta-delta waves over F3-C3 electrodes during wakefulness.',
      'No periodic lateralized epileptiform discharges (PLEDs) identified.'
    ],
    status: 'Final Verified'
  },
  {
    id: 'rep-03',
    patientId: 'pat-101',
    testName: 'Bilateral Carotid & Vertebral Duplex Doppler',
    modality: 'Carotid Doppler',
    date: '02 Sep 2026',
    referringDoctor: 'Dr. Sanjay Sopan Varade MD, DM Neuro',
    impression: 'Right Internal Carotid Artery (ICA) normal. Left ICA demonstrates 25% eccentric soft fibrolipid plaque at bifurcation with normal systolic velocities (PSV 88 cm/s).',
    findings: [
      'Vertebral arteries exhibit antegrade, low-resistance waveforms bilaterally.',
      'No hemodynamically significant stenosis exceeding 50% according to NASCET criteria.'
    ],
    status: 'Final Verified'
  }
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-2024',
    patientId: 'pat-101',
    date: '15 Sep 2026',
    doctorName: 'Dr. Sanjay Sopan Varade MD, DM Neuro',
    diagnosis: 'Ischemic Stroke Secondary Prevention & Neuro-protection',
    medicines: [
      {
        name: 'Aspirin + Clopidogrel (75mg / 75mg)',
        dosage: '1 Tablet',
        frequency: 'Once Daily (After Breakfast)',
        duration: '90 Days',
        instructions: 'Dual antiplatelet therapy; monitor for any unusual bruising.'
      },
      {
        name: 'Rosuvastatin (40mg)',
        dosage: '1 Tablet',
        frequency: 'At Bedtime',
        duration: 'Ongoing',
        instructions: 'Plaque stabilization target LDL < 55 mg/dL.'
      },
      {
        name: 'Citicoline + Piracetam (500mg / 800mg)',
        dosage: '1 Tablet',
        frequency: 'Twice Daily (Morning & Evening)',
        duration: '60 Days',
        instructions: 'Neuro-cognitive recovery support with meals.'
      },
      {
        name: 'Telmisartan (40mg)',
        dosage: '1 Tablet',
        frequency: 'Morning (08:00 AM)',
        duration: 'Ongoing',
        instructions: 'Target BP < 130/80 mmHg. Maintain daily log in portal.'
      }
    ],
    followUpDate: '15 Oct 2026'
  }
];

export const INITIAL_VITALS_LOGS: PatientVitalsLog[] = [
  {
    id: 'vit-1',
    patientId: 'pat-101',
    date: 'Today, 08:30 AM',
    bloodPressureSys: 124,
    bloodPressureDia: 78,
    pulseRate: 72,
    tremorScore: 1,
    seizureCountToday: 0,
    mobilityScore: 8,
    cognitiveNotes: 'Right arm grip strength improved; completed 45-min neuro-rehab walk without assistance.',
    triageStatus: 'Stable'
  },
  {
    id: 'vit-2',
    patientId: 'pat-101',
    date: 'Yesterday, 08:15 AM',
    bloodPressureSys: 128,
    bloodPressureDia: 82,
    pulseRate: 74,
    tremorScore: 2,
    seizureCountToday: 0,
    mobilityScore: 7,
    cognitiveNotes: 'Mild fatigue post speech therapy session. Speech articulation clear.',
    triageStatus: 'Stable'
  },
  {
    id: 'vit-3',
    patientId: 'pat-101',
    date: '18 Sep 2026',
    bloodPressureSys: 138,
    bloodPressureDia: 88,
    pulseRate: 80,
    tremorScore: 2,
    seizureCountToday: 0,
    mobilityScore: 7,
    cognitiveNotes: 'Slight morning stiffness in right fingers. Resolved after warm compress.',
    triageStatus: 'Guarded'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-901',
    patientName: 'Rajesh S. Kulkarni',
    patientAge: 58,
    patientGender: 'Male',
    patientPhone: '+91 98230 45678',
    patientEmail: 'rajesh.kulkarni@example.com',
    doctorId: 'doc-sanjay-varade',
    doctorName: 'Dr. Sanjay Sopan Varade MD, DM Neuro',
    department: 'Comprehensive Stroke Center',
    date: '2026-09-24',
    timeSlot: '11:00 AM',
    visitType: 'In-Person Hospital OPD',
    symptoms: '1-Month post mechanical thrombectomy routine Doppler & motor recovery assessment',
    status: 'Confirmed',
    tokenNumber: 'STRK-04',
    createdAt: '2026-09-18',
    reminderSettings: {
      whatsapp: true,
      email: true,
      leadTimeHours: 24,
      whatsappNumber: '+91 98230 45678',
      emailAddress: 'rajesh.kulkarni@example.com',
      status: 'Active',
      scheduledTimeText: '24 Hours Prior (2026-09-23 at 11:00 AM)',
      confirmedAt: '2026-09-18'
    }
  },
  {
    id: 'apt-902',
    patientName: 'Meera N. Patel',
    patientAge: 34,
    patientGender: 'Female',
    patientPhone: '+91 94220 11223',
    patientEmail: 'meera.patel@example.com',
    doctorId: 'doc-sanjay-varade',
    doctorName: 'Dr. Sanjay Sopan Varade MD, DM Neuro',
    department: 'Comprehensive Stroke Center',
    date: '2026-09-22',
    timeSlot: '02:00 PM',
    visitType: 'Tele-Neurology Video Consultation',
    symptoms: 'Breakthrough nocturnal myoclonic jerks and Levetiracetam dosage titration',
    status: 'Confirmed',
    tokenNumber: 'EPI-12',
    createdAt: '2026-09-19',
    reminderSettings: {
      whatsapp: true,
      email: false,
      leadTimeHours: 2,
      whatsappNumber: '+91 94220 11223',
      emailAddress: 'meera.patel@example.com',
      status: 'Scheduled',
      scheduledTimeText: '2 Hours Prior (Today at 12:00 PM)',
      confirmedAt: '2026-09-19'
    }
  }
];

export const BRAIN_HOTSPOTS: BrainAnatomyHotspot[] = [
  {
    id: 'hs-mca',
    name: 'Left Middle Cerebral Artery (MCA) Territory & Motor Strip',
    lobe: 'Frontal / Parietal Cortex',
    coordinates: { x: -0.55, y: 0.2, z: 0.1 },
    color: '#EF4444', // Red
    description: 'Supplies primary motor and somatosensory cortices for the contralateral face and upper extremity, as well as Broca’s expressive language center in the dominant hemisphere.',
    pathologies: ['Acute Ischemic Stroke (Thromboembolism)', 'Expressive Dysphasia', 'Contralateral Hemiparesis'],
    clinicalRole: 'Critical target for endovascular stent-retriever thrombectomy within the 4.5 to 24-hour therapeutic window.',
    imagingSign: 'Hyperdense MCA sign on NCCT & 32-Slice CT Angiography.'
  },
  {
    id: 'hs-temporal',
    name: 'Mesial Temporal Lobe & Hippocampus',
    lobe: 'Temporal Lobe',
    coordinates: { x: -0.65, y: -0.25, z: -0.3 },
    color: '#8B5CF6', // Purple
    description: 'Central seat of episodic memory consolidation and the most common epileptogenic anatomical zone in adults.',
    pathologies: ['Mesial Temporal Lobe Epilepsy (MTLE)', 'Hippocampal Sclerosis', 'Early Alzheimer’s Tau Aggregation'],
    clinicalRole: 'Mapped with intracranial stereo-EEG electrodes; remediable via anterior temporal lobectomy or Laser Interstitial Thermal Therapy (LITT).',
    imagingSign: 'High signal intensity on coronal FLAIR with hippocampal volume loss.'
  },
  {
    id: 'hs-basal',
    name: 'Subthalamic Nucleus (STN) & Substantia Nigra',
    lobe: 'Deep Brain / Basal Ganglia',
    coordinates: { x: 0.05, y: -0.1, z: -0.15 },
    color: '#F59E0B', // Amber
    description: 'Dopaminergic pacemaker complex coordinating voluntary motor initiation, smooth kinetic velocity, and postural tone balance.',
    pathologies: ['Parkinson’s Disease', 'Resting Tremor', 'Bradykinesia & Cogwheel Rigidity'],
    clinicalRole: 'Primary anatomical anatomical coordinate for stereotactic Deep Brain Stimulation (DBS) quadripolar leads.',
    imagingSign: 'Loss of normal "swallow-tail" sign in substantia nigra on high-resolution axial susceptibility-weighted imaging (SWI).'
  },
  {
    id: 'hs-cerebellum',
    name: 'Cerebellar Hemispheres & Vermis',
    lobe: 'Infratentorial Cerebellum',
    coordinates: { x: 0.0, y: -0.65, z: -0.4 },
    color: '#06B6D4', // Cyan
    description: 'Fine-tunes motor coordination, vestibular equilibrium, ocular saccades, and kinetic limb synergy.',
    pathologies: ['Spinocerebellar Ataxia', 'Posterior Fossa Stroke', 'Medulloblastoma'],
    clinicalRole: 'Critical surveillance zone for mass effect against the fourth ventricle to prevent obstructive hydrocephalus.',
    imagingSign: 'Compression of 4th ventricle; posterior inferior cerebellar artery (PICA) infarct.'
  },
  {
    id: 'hs-brainstem',
    name: 'Pons & Medulla Oblongata',
    lobe: 'Brainstem',
    coordinates: { x: 0.0, y: -0.4, z: -0.65 },
    color: '#10B981', // Emerald
    description: 'Contains ascending reticular activating system (consciousness), respiratory/cardiac centers, and cranial nerve nuclei III through XII.',
    pathologies: ['Basilar Artery Occlusion', 'Locked-In Syndrome', 'Wallenberg Lateral Medullary Syndrome'],
    clinicalRole: 'Emergent neurovascular intervention required to prevent catastrophic coma and brainstem infarction.',
    imagingSign: 'Basilar tip high-density sign; diffusion restriction in anterior pontine perforators.'
  }
];

export const DISEASE_ARTICLES: DiseaseArticle[] = [
  {
    id: 'dis-stroke',
    slug: 'acute-stroke-care',
    title: 'Acute Stroke & Brain Vascular Emergencies',
    subtitle: 'Comprehensive Golden-Hour Intervention: IV Thrombolysis & Mechanical Thrombectomy',
    category: 'Vascular Neurology',
    iconName: 'Zap',
    readTime: '6 min read',
    overview: 'A stroke occurs when blood flow to a region of the brain is abruptly compromised by an arterial clot (Ischemic Stroke ~85%) or a vessel rupture (Hemorrhagic Stroke ~15%). With roughly 1.9 million neurons dying each minute in an untreated ischemic penumbra, rapid protocolized revascularization at Sopan Hospital achieves over 88% successful recanalization.',
    patientOverview: 'Brain stroke is a medical emergency that happens when a blood clot blocks a brain artery. "Time is Brain" — every minute saved helps keep brain cells alive and prevents permanent paralysis. Our hospital has a dedicated 24/7 Stroke Rapid Response Team with round-the-clock CT and Cath Lab readiness.',
    symptoms: [
      'Sudden numbness or weakness in face, arm, or leg, especially on one side',
      'Sudden confusion, trouble speaking or slurred speech (Dysphasia)',
      'Sudden trouble seeing in one or both eyes (Hemianopia)',
      'Sudden difficulty walking, loss of balance or coordination',
      'Sudden, severe thunderclap headache with no known cause'
    ],
    emergencySigns: [
      'F - Facial Drooping: Ask the person to smile; is one side uneven?',
      'A - Arm Weakness: Ask them to raise both arms; does one drift downward?',
      'S - Speech Slurred: Can they repeat a simple phrase without distortion?',
      'T - Time to Call 24/7 Stroke Unit: Immediate transport within 4.5 hours'
    ],
    causes: [
      'Atherosclerotic plaque rupture in carotid or cerebral arteries',
      'Cardioembolism due to Atrial Fibrillation (AFib)',
      'Uncontrolled arterial hypertension causing small-vessel lipohyalinosis',
      'Diabetes mellitus, high cholesterol, and tobacco smoking'
    ],
    diagnosticApproaches: [
      'Immediate Non-Contrast 32-Slice CT Brain (<15 min door-to-CT)',
      '32-Slice CT Angiography (CTA) & Perfusion Imaging to quantify ischemic penumbra',
      'Advanced 32-Slice Helical Helical Reconstruction for rapid hyper-acute triage',
      'Transthoracic & Transesophageal Echocardiography with 24-hr Holter'
    ],
    treatments: [
      {
        name: 'Intravenous Thrombolysis (Tenecteplase / Alteplase)',
        description: 'Enzymatic clot-busting medication administered intravenously within 4.5 hours of symptom onset.',
        type: 'Medical'
      },
      {
        name: 'Endovascular Mechanical Thrombectomy',
        description: 'Minimally invasive neuro-interventional procedure using micro-catheters and aspiration stent-retrievers to extract large vessel clots up to 24 hours post-onset.',
        type: 'Interventional'
      },
      {
        name: 'Comprehensive Neuro-ICU Critical Monitoring',
        description: 'Targeted blood pressure optimization, euglycemia control, fever avoidance, and intracranial pressure monitoring.',
        type: 'Medical'
      },
      {
        name: 'Robot-Assisted Neuro-Rehabilitation',
        description: 'Early physical, occupational, and swallowing/speech therapy to re-educate neuroplastic pathways.',
        type: 'Therapy'
      }
    ],
    caregiverGuidelines: [
      'Note the EXACT time the patient was last seen completely normal.',
      'Do NOT give any food, water, or aspirin until swallowing safety is evaluated.',
      'Keep the patient lying flat; do not raise their head too high if blood pressure is fluctuating.',
      'Bring all existing prescription bottles and medical records to the emergency room.'
    ],
    vrHotspotId: 'hs-mca',
    anatomicalFocus: 'Left Middle Cerebral Artery & Motor Cortex'
  },
  {
    id: 'dis-epilepsy',
    slug: 'epilepsy-seizure-disorders',
    title: 'Epilepsy, Intractable Seizures & EEG Monitoring',
    subtitle: 'Advanced Video-EEG Mapping, Anti-Seizure Pharmacology & Surgical Neuromodulation',
    category: 'Epileptology',
    iconName: 'Activity',
    readTime: '7 min read',
    overview: 'Epilepsy is characterized by enduring predisposition to recurrent unprovoked seizures arising from abnormal, hypersynchronous neuronal electrical discharges. In our 6-bed Comprehensive Epilepsy Monitoring Unit (EMU), patients undergo continuous video-electroencephalography to pinpoint exact epileptogenic zones for curative resection or neuromodulation.',
    patientOverview: 'A seizure occurs when there is a sudden temporary burst of electrical signals in the brain, causing involuntary shaking, blank staring, or loss of awareness. Having seizures does not mean a person cannot lead a full, vibrant life — modern medical and surgical treatments at Sopan Hospital control seizures in over 80% of patients.',
    symptoms: [
      'Generalized tonic-clonic convulsions (stiffening followed by rhythmic jerking)',
      'Focal onset seizures with impaired awareness (lip smacking, repeating movements)',
      'Absence seizures (sudden momentary blank staring for a few seconds)',
      'Myoclonic jerks (sudden shock-like muscle twitches usually in early morning)',
      'Post-ictal confusion, profound exhaustion, or temporary speech difficulty'
    ],
    emergencySigns: [
      'A seizure lasting longer than 5 minutes continuously (Status Epilepticus)',
      'A second seizure occurring immediately without regaining consciousness',
      'Seizure occurring in water (bath/swimming) or resulting in severe head injury',
      'Persistent breathing difficulty or cyanosis (blue lips) post-seizure'
    ],
    causes: [
      'Genetic channelopathies and familial epilepsy genes',
      'Structural lesions: Mesial temporal sclerosis, focal cortical dysplasia',
      'Post-traumatic brain injury gliosis or post-stroke scar tissue',
      'CNS infections: Encephalitis, neurocysticercosis, or meningitis'
    ],
    diagnosticApproaches: [
      '24 to 72-Hour Continuous Video-EEG in dedicated EMU suites',
      'High-resolution 32-Slice CT Volume Scan (Bone & Soft-tissue algorithms)',
      'Intraoperative Stereotactic Navigation for language and motor mapping prior to surgery',
      'PET-CT and Ictal SPECT subtraction (SISCOM) for occult focal lesions'
    ],
    treatments: [
      {
        name: 'Precision Antiseizure Medications (ASMs)',
        description: 'Tailored monotherapy or rational polytherapy balancing sodium channel blockers, GABAergic agonists, and SV2A modulators.',
        type: 'Medical'
      },
      {
        name: 'Surgical Resection (Selective Amygdalohippocampectomy / Lesionectomy)',
        description: 'Micro-neurosurgical excision of the confirmed epileptic focus, providing seizure freedom in 70-80% of candidate cases.',
        type: 'Surgical'
      },
      {
        name: 'Vagus Nerve Stimulation (VNS) & Responsive Neurostimulation (RNS)',
        description: 'Implanted neuro-stimulator that sends calibrated electrical pulses to interrupt abnormal seizure rhythms before they generalize.',
        type: 'Interventional'
      },
      {
        name: 'Ketogenic Diet Therapy',
        description: 'High-fat, low-carbohydrate medical nutritional therapy supervised by clinical neuro-dietitians for drug-resistant pediatric epilepsies.',
        type: 'Therapy'
      }
    ],
    caregiverGuidelines: [
      'Stay calm. Gently roll the person onto one side (recovery position) to keep the airway clear.',
      'Place something soft under their head and loosen tight neckwear.',
      'NEVER put any spoon, water, or object into their mouth; do not forcefully hold them down.',
      'Time the seizure duration using a watch or mobile phone timer.'
    ],
    vrHotspotId: 'hs-temporal',
    anatomicalFocus: 'Mesial Temporal Lobe & Hippocampus'
  },
  {
    id: 'dis-parkinsons',
    slug: 'parkinsons-movement-disorders',
    title: 'Parkinson’s Disease & Movement Disorders',
    subtitle: 'Dopaminergic Therapeutics, Deep Brain Stimulation (DBS) & Motor Restoration',
    category: 'Movement Disorders',
    iconName: 'Gauge',
    readTime: '8 min read',
    overview: 'Parkinson’s Disease is a progressive neurodegenerative disorder caused by the loss of neuromelanin-containing dopaminergic neurons in the substantia nigra pars compacta. Sopan Hospital’s Movement Disorder Center provides comprehensive care ranging from levodopa-carbidopa optimization to frameless 3D robotic Deep Brain Stimulation (DBS).',
    patientOverview: 'Parkinson’s disease affects muscle movement, causing tremors, slowed actions, and walking difficulties. While it is a long-term condition, groundbreaking therapies including Deep Brain Stimulation (DBS) allow our patients to regain independence, write, walk smoothly, and enjoy active hobbies.',
    symptoms: [
      'Rest tremor (pill-rolling tremor in hands when resting)',
      'Bradykinesia (general slowness of movement and delayed motor reaction)',
      'Cogwheel rigidity (stiffness and resistance when bending limbs)',
      'Postural instability and shuffling gait with reduced arm swing',
      'Non-motor symptoms: sleep disturbances (RBD), anosmia, constipation'
    ],
    emergencySigns: [
      'Sudden severe motor freezing resulting in dangerous falls',
      'Parkinsonism-Hyperpyrexia Syndrome due to abrupt medication cessation',
      'Severe medication-induced dyskinesias or orthostatic syncope'
    ],
    causes: [
      'Accumulation and toxic misfolding of alpha-synuclein proteins (Lewy bodies)',
      'Mitochondrial dysfunction and oxidative stress in substantia nigra',
      'Genetic variants (LRRK2, Parkin, GBA mutations) and environmental factors'
    ],
    diagnosticApproaches: [
      'Clinical examination using the UPDRS (Unified Parkinson’s Disease Rating Scale)',
      'Levodopa challenge test to assess dopaminergic responsiveness',
      'DaTscan (Ioflupane SPECT) imaging dopamine transporter density',
      'High-resolution 32-Slice CT scan to rule out structural intracranial pathology and atypical syndromes'
    ],
    treatments: [
      {
        name: 'Levodopa / Carbidopa & Dopamine Agonist Optimization',
        description: 'Mainstay pharmacological replenishment formulated in controlled-release capsules to smooth out "on-off" motor fluctuations.',
        type: 'Medical'
      },
      {
        name: 'Deep Brain Stimulation (DBS)',
        description: 'Stereotactic placement of bilateral electrodes into the Subthalamic Nucleus (STN) or Globus Pallidus (GPi) connected to a subcutaneous pulse generator.',
        type: 'Surgical'
      },
      {
        name: 'Levodopa-Carbidopa Intestinal Gel (LCIG) Pump',
        description: 'Continuous intrajejunal infusion via a discreet portable pump providing uniform plasma levodopa levels without gastrointestinal delays.',
        type: 'Interventional'
      },
      {
        name: 'LSVT BIG & Specialized Neuro-Physiotherapy',
        description: 'Evidence-based exercise programs recalibrating amplitude of movement, balance, and vocal resonance.',
        type: 'Therapy'
      }
    ],
    caregiverGuidelines: [
      'Establish a strict medication timetable; taking levodopa exactly on time prevents debilitating "off" periods.',
      'Remove loose rugs, clutter, and install grab bars in bathrooms to eliminate fall risks.',
      'Encourage regular hydration and high-fiber foods to manage autonomic bowel slowdown.',
      'Be patient with communication and encourage deliberate, large-step walking rhythms.'
    ],
    vrHotspotId: 'hs-basal',
    anatomicalFocus: 'Subthalamic Nucleus & Substantia Nigra'
  },
  {
    id: 'dis-tumor',
    slug: 'brain-tumors-neuro-oncology',
    title: 'Brain Tumors & Neuro-Oncology',
    subtitle: 'Awake Craniotomy, Fluorescence-Guided Resection & Radiosurgery',
    category: 'Neuro-Surgical Oncology',
    iconName: 'Target',
    readTime: '7 min read',
    overview: 'Intracranial neoplasms include primary brain tumors (Gliomas, Meningiomas, Acoustic Neuromas) and secondary metastatic lesions. Sopan Hospital’s Neuro-Surgical Oncology team utilizes high-resolution 32-Slice CT Angiography & 3D Stereotactic Navigation, intraoperative neuro-monitoring, and 5-ALA fluorescence guidance for maximum safe tumor cytoreduction while protecting eloquent speech and motor pathways.',
    patientOverview: 'Finding out you or a loved one has a brain tumor can feel overwhelming, but neurosurgical oncology has achieved extraordinary breakthroughs. At Sopan Hospital, our surgeons use state-of-the-art awake brain mapping and robotic navigation to remove tumors safely while preserving speech, memory, and physical mobility.',
    symptoms: [
      'Progressive morning headaches accompanied by vomiting or nausea',
      'New-onset seizures in an adult with no prior seizure history',
      'Gradual weakness or sensory numbness on one side of the body',
      'Personality alterations, cognitive slowing, or uncharacteristic behavior',
      'Visual field deficits or ringing in the ears with hearing loss'
    ],
    emergencySigns: [
      'Rapidly decreasing level of consciousness or unresponsiveness',
      'Unequal pupil sizes or sudden double vision with intractable vomiting',
      'Status epilepticus unresponsive to emergency medication'
    ],
    causes: [
      'Genetic oncogene activation and loss of tumor suppressor genes (e.g., TP53, IDH1/2)',
      'Prior exposure to high-dose therapeutic ionizing radiation',
      'Metastasis from systemic primary carcinomas (Lung, Breast, Melanoma)'
    ],
    diagnosticApproaches: [
      'Multi-detector 32-Slice CT Angiography with Perfusion mapping',
      'Helical 32-Slice CT thin-section 3D bone and soft tissue stereotactic reconstruction',
      'Stereotactic neuro-navigation protocol for motor and language cortex preservation',
      'Histopathological molecular profiling: IDH mutation, 1p/19q codeletion, MGMT promoter'
    ],
    treatments: [
      {
        name: 'Awake Craniotomy with Direct Cortical Stimulation',
        description: 'Surgeon interacts with the awake patient during tumor resection, testing language and movement in real time to prevent neurological deficits.',
        type: 'Surgical'
      },
      {
        name: '5-ALA Fluorescence-Guided Microsurgery',
        description: 'Oral contrast causes malignant glioma cells to glow bright red under special blue operating microscope light, revealing hidden tumor borders.',
        type: 'Surgical'
      },
      {
        name: 'Stereotactic Radiosurgery (CyberKnife / Gamma Knife)',
        description: 'Sub-millimeter focused ionizing radiation beams destroying small tumors and acoustic neuromas without surgical incisions.',
        type: 'Interventional'
      },
      {
        name: 'Precision Adjuvant Chemotherapy & Targeted Inhibitors',
        description: 'Temozolomide protocol combined with tumor-treating fields (TTFields) and personalized molecular kinase inhibitors.',
        type: 'Medical'
      }
    ],
    caregiverGuidelines: [
      'Keep a detailed log of headache severity, seizure events, and changes in mood.',
      'Ensure someone stays with the patient during high-risk times if they experience focal seizures.',
      'Take advantage of the hospital’s psycho-oncology counseling and caregiver peer groups.'
    ],
    vrHotspotId: 'hs-mca',
    anatomicalFocus: 'Frontal-Temporal Eloquent Cortex'
  }
];

export const INITIAL_MESSAGES: SecureMessage[] = [
  {
    id: 'msg-1',
    senderId: 'pat-101',
    senderName: 'Rajesh Kulkarni (Patient)',
    senderRole: 'Patient',
    timestamp: 'Today, 08:35 AM',
    text: 'Good morning Dr. Varade. I logged today’s blood pressure (124/78 mmHg) and walked 45 minutes in the garden. My right arm dexterity feels noticeably smoother when gripping coffee mugs.',
    isUrgent: false
  },
  {
    id: 'msg-2',
    senderId: 'doc-sanjay-varade',
    senderName: 'Dr. Sanjay Sopan Varade (Chief Neurologist, MD, DM Neuro)',
    senderRole: 'Neurologist',
    timestamp: 'Today, 09:15 AM',
    text: 'Excellent news, Rajesh. Your motor recovery trajectory is following the ideal neuroplastic curve post-thrombectomy. Keep taking the dual antiplatelet therapy consistently. Let’s do our follow-up Doppler next Thursday at Mumbai Naka.',
    isUrgent: false
  },
  {
    id: 'msg-3',
    senderId: 'care-101',
    senderName: 'Sunita Kulkarni (Caregiver)',
    senderRole: 'Caregiver',
    timestamp: 'Today, 09:40 AM',
    text: 'Thank you doctor. Also, should we continue the evening Citicoline tablet for another month? We have 4 tablets remaining in this blister pack.',
    isUrgent: false
  },
  {
    id: 'msg-4',
    senderId: 'nurse-1',
    senderName: 'Sister Maria (Neuro-ICU Clinical Coordinator)',
    senderRole: 'Neuro-Nurse',
    timestamp: 'Today, 09:48 AM',
    text: 'Hello Mrs. Kulkarni, yes! Dr. Sanjay Varade has renewed the Citicoline + Piracetam prescription for 60 more days. You can view the digital prescription in your Patient Portal and order directly from the Sopan Hospital pharmacy.',
    isUrgent: false
  }
];

export const INITIAL_CASE_STUDIES: CaseStudy[] = [
  {
    id: 'cs-01',
    caseNumber: 'CS-NEURO-2026-089',
    title: 'Successful Endovascular Mechanical Thrombectomy in Acute Basilar Artery Occlusion 14 Hours Post-Onset',
    category: 'Comprehensive Stroke Center',
    patientDemographics: '54-Year-old Male, Executive with sudden onset dysarthria, quadriplegia and somnolence',
    chiefComplaint: 'Acute onset "locked-in" state, bilateral horizontal gaze palsy, and fluctuating consciousness.',
    neurologicalExam: 'NIHSS Score 26. Comatose with extensor posturing, pin-point reactive pupils, bilateral Babinski sign positive.',
    neuroimaging: 'NCCT: Hyperdense basilar artery sign. CTA & CT Perfusion: Complete occlusion of the mid-to-distal basilar trunk; pc-ASPECTS score 8 with large salvageable brainstem penumbra.',
    differentialDiagnosis: ['Basilar Artery Thromboembolism', 'Pontine Intracerebral Hemorrhage', 'Brainstem Encephalitis'],
    finalDiagnosis: 'Hyper-acute Basilar Artery Atherosclerotic Thrombosis with impending brainstem infarction.',
    interventionType: 'Endovascular Surgery',
    procedureDetails: 'Under local anesthesia with neuro-monitoring, biplane angiographic access via right femoral artery. Sofia 6F aspiration catheter paired with Solitaire 4x40mm stent-retriever deployed. Successful TICI 3 recanalization achieved within 28 minutes of femoral puncture.',
    outcome30Day: 'Patient extubated on Day 2. NIHSS reduced from 26 to 2 at 30 days. Ambulatory with single cane, fully lucid speech.',
    outcome6Month: 'Modified Rankin Scale (mRS) 1. Returned to part-time desk work with normal cognitive scores.',
    learningPearls: [
      'Extended therapeutic window up to 24 hours is robustly supported in posterior circulation strokes when perfusion mismatch is preserved.',
      'Rapid door-to-groin puncture time (<35 min) directly correlates with avoidance of devastating pontine necrosis.'
    ],
    authorDoctor: 'Dr. Sanjay Sopan Varade MD, DM Neuro',
    publicationDate: 'August 2026',
    tags: ['Mechanical Thrombectomy', 'Basilar Artery', 'Stroke Intervention', 'TICI 3']
  },
  {
    id: 'cs-02',
    caseNumber: 'CS-NEURO-2026-074',
    title: 'Awake Craniotomy with Real-Time Cortical Mapping for Left Insular High-Grade Glioma',
    category: 'Neuro-Oncology & Brain Tumors',
    patientDemographics: '42-Year-old Professional Violinist & Sound Engineer',
    chiefComplaint: 'Secondary generalized nocturnal seizure preceded by an auditory aura of musical disharmony.',
    neurologicalExam: 'Neurologically intact. MMSE 30/30. Normal visual fields and fine motor agility.',
    neuroimaging: '32-Slice CT Brain with Angiography: 4.8 cm expansile mass in left insular-temporal operculum abutting arcuate fasciculus and MCA M2 branches with surrounding vasogenic edema.',
    differentialDiagnosis: ['Low-Grade Oligodendroglioma', 'Anaplastic Astrocytoma', 'Focal Encephalomalacia'],
    finalDiagnosis: 'IDH-Mutant Grade 3 Astrocytoma in eloquent speech and auditory association cortex.',
    interventionType: 'Microsurgery',
    procedureDetails: 'Asleep-Awake-Asleep protocol. Neuro-navigation combined with 5-ALA fluorescence. Intraoperative cortical electrical stimulation mapped Wernicke speech area and pitch discrimination tasks while the patient played a custom acoustic violin simulator in the OR.',
    outcome30Day: 'Supratotal surgical resection achieved (>98% cytoreduction) without any postoperative phonemic paraphasia or motor weakness.',
    outcome6Month: 'KPS 100. Completed adjuvant concurrent temozolomide radiotherapy. Patient performed full concert season.',
    learningPearls: [
      'Awake surgery in musicians requires tailored intraoperative cognitive and auditory task design beyond standard counting/naming tests.',
      '5-ALA fluorescence combined with DTI fiber tracking prevents accidental injury to deep subcortical projection pathways.'
    ],
    authorDoctor: 'Dr. Sanjay Sopan Varade MD, DM Neuro',
    publicationDate: 'July 2026',
    tags: ['Awake Craniotomy', 'Brain Tumor', 'Cortical Stimulation', 'Neuro-Oncology']
  },
  {
    id: 'cs-03',
    caseNumber: 'CS-NEURO-2026-061',
    title: 'Subthalamic Nucleus Deep Brain Stimulation (STN-DBS) in Young-Onset Parkinson’s Disease',
    category: 'Movement Disorders & Parkinson’s',
    patientDemographics: '47-Year-old Mechanical Engineer with 8-year history of Levodopa-induced motor fluctuations',
    chiefComplaint: 'Severe "off" dystonia causing painful foot cramping and disabling peak-dose peak dyskinesias limiting work.',
    neurologicalExam: 'UPDRS Motor Score: "Off" state 52, "On" state 18 (65% improvement with levodopa test, confirming candidate eligibility).',
    neuroimaging: 'High-resolution 32-Slice CT Volumetric Scan: Normal ventricles; clear visualization of bilateral deep basal ganglia structures.',
    differentialDiagnosis: ['Young-Onset Idiopathic Parkinson’s Disease', 'Multiple System Atrophy - Parkinsonian', 'DYT-1 Dystonia'],
    finalDiagnosis: 'Young-Onset Idiopathic Parkinson’s Disease with intractable motor fluctuations.',
    interventionType: 'Neuromodulation',
    procedureDetails: 'Microelectrode recording (MER) confirmed characteristic hyperactive bursting STN cell discharge patterns. Bilateral directional octapolar DBS leads implanted into sensorimotor dorsolateral STN connected to rechargeable dual-channel IPG.',
    outcome30Day: 'DBS programming commenced. Levodopa equivalent daily dose (LEDD) reduced by 58% (from 1200mg to 500mg). Dyskinesias completely eliminated.',
    outcome6Month: 'UPDRS motor score improved to 12. Tremor score 0/10. Able to swim, hike, and resume heavy machinery assembly.',
    learningPearls: [
      'Directional steerable DBS leads allow precise current steering away from internal capsule, preventing unwanted speech slurring.',
      'Early surgical referral in young-onset PD before contractures or axial symptoms emerge maximizes long-term vocational survival.'
    ],
    authorDoctor: 'Dr. Sanjay Sopan Varade MD, DM Neuro',
    publicationDate: 'June 2026',
    tags: ['Deep Brain Stimulation', 'Parkinson’s', 'STN-DBS', 'Neuromodulation']
  }
];

export const INITIAL_STAFF_PAYROLL: StaffPayrollRecord[] = [
  {
    id: 'pay-01',
    employeeId: 'EMP-DOC-001',
    fullName: 'Dr. Sanjay Sopan Varade',
    department: 'Comprehensive Stroke Center',
    role: 'Director & Chief Consultant Neurologist (MD, DM Neuro)',
    baseSalary: 450000,
    onCallEmergencyBonus: 75000,
    nightShiftAllowance: 25000,
    deductionsTDS: 110000,
    deductionsPF: 18000,
    netPayable: 422000,
    payPeriod: 'September 2026',
    paymentStatus: 'Paid',
    bankAccountMasked: 'HDFC •••• 9821',
    paidOn: '2026-09-18'
  },
  {
    id: 'pay-02',
    employeeId: 'EMP-RES-002',
    fullName: 'Dr. Pranav Joshi',
    department: 'Neuro-Trauma & Emergency Care',
    role: 'Resident Medical Officer (DNB)',
    baseSalary: 140000,
    onCallEmergencyBonus: 30000,
    nightShiftAllowance: 20000,
    deductionsTDS: 18000,
    deductionsPF: 12000,
    netPayable: 160000,
    payPeriod: 'September 2026',
    paymentStatus: 'Paid',
    bankAccountMasked: 'ICICI •••• 4410',
    paidOn: '2026-09-18'
  },
  {
    id: 'pay-03',
    employeeId: 'EMP-RES-003',
    fullName: 'Dr. Neha Salunkhe',
    department: 'Epilepsy & EEG Unit',
    role: 'Clinical Neuro-Fellow',
    baseSalary: 120000,
    onCallEmergencyBonus: 25000,
    nightShiftAllowance: 15000,
    deductionsTDS: 15000,
    deductionsPF: 10000,
    netPayable: 135000,
    payPeriod: 'September 2026',
    paymentStatus: 'Processing',
    bankAccountMasked: 'SBI •••• 1209'
  },
  {
    id: 'pay-04',
    employeeId: 'EMP-NRS-014',
    fullName: 'Sister Maria Fernandez',
    department: 'Neuro-Intensive Care Unit (ICU)',
    role: 'Neuro-ICU Nurse Incharge',
    baseSalary: 85000,
    onCallEmergencyBonus: 15000,
    nightShiftAllowance: 18000,
    deductionsTDS: 9500,
    deductionsPF: 8500,
    netPayable: 100000,
    payPeriod: 'September 2026',
    paymentStatus: 'Paid',
    bankAccountMasked: 'AXIS •••• 6712',
    paidOn: '2026-09-18'
  },
  {
    id: 'pay-05',
    employeeId: 'EMP-TEC-008',
    fullName: 'Rameshwar Shinde',
    department: 'Neuro-Diagnostics & EEG/EMG Lab',
    role: 'EEG Senior Technologist',
    baseSalary: 68000,
    onCallEmergencyBonus: 12000,
    nightShiftAllowance: 10000,
    deductionsTDS: 6000,
    deductionsPF: 6800,
    netPayable: 77200,
    payPeriod: 'September 2026',
    paymentStatus: 'Paid',
    bankAccountMasked: 'BOB •••• 5590',
    paidOn: '2026-09-18'
  },
  {
    id: 'pay-06',
    employeeId: 'EMP-PTH-005',
    fullName: 'Priya Sundaram',
    department: 'Neuro-Rehabilitation & Physio',
    role: 'Neuro-Physiotherapist',
    baseSalary: 72000,
    onCallEmergencyBonus: 8000,
    nightShiftAllowance: 0,
    deductionsTDS: 6500,
    deductionsPF: 7200,
    netPayable: 66300,
    payPeriod: 'September 2026',
    paymentStatus: 'Processing',
    bankAccountMasked: 'KOTAK •••• 3014'
  }
];

export const INITIAL_REVIEWS: GoogleReview[] = [
  {
    id: 'rev-01',
    authorName: 'Vikramaditya Shastry',
    rating: 5,
    relativeTime: '2 days ago',
    departmentTreated: 'Comprehensive Stroke Center',
    verifiedPatient: true,
    reviewText: 'My 62-year-old father suffered a massive ischemic stroke with right-side paralysis. The rapid action of Dr. Sanjay Sopan Varade and his acute stroke team at Mumbai Naka Nashik was miraculous. Within 35 minutes of reaching Sopan Hospital, IV thrombolysis was administered. Today my father is walking and talking normally. The 24/7 stroke hotline (0253 2317364) answered immediately.',
    doctorMentioned: 'Dr. Sanjay Sopan Varade MD, DM Neuro',
    helpfulCount: 42
  },
  {
    id: 'rev-02',
    authorName: 'Pooja Hegde-Desai',
    rating: 5,
    relativeTime: '1 week ago',
    departmentTreated: 'Movement Disorders & Parkinson’s',
    verifiedPatient: true,
    reviewText: 'Dr. Sanjay Sopan Varade is one of the most knowledgeable and compassionate neurologists in Maharashtra. His clinical acumen, detailed neurological evaluation, and patient counseling for my mother’s Parkinson’s and tremors transformed her life. The hospital near Sandip Hotel is clean, modern, and very well managed.',
    doctorMentioned: 'Dr. Sanjay Sopan Varade MD, DM Neuro',
    helpfulCount: 29
  },
  {
    id: 'rev-03',
    authorName: 'Nitin Ganapathy',
    rating: 5,
    relativeTime: '2 weeks ago',
    departmentTreated: 'Epilepsy & EEG Monitoring',
    verifiedPatient: true,
    reviewText: 'Visited Dr. Sanjay Varade at Sopan Hospital on Shrihari Kute Marg, Mumbai Naka. For 3 years our son had uncontrolled seizures; Dr. Varade adjusted his anti-epileptic medications with precision after 24-hr video EEG analysis. Seizure-free for 8 months now! Highly recommended.',
    doctorMentioned: 'Dr. Sanjay Sopan Varade MD, DM Neuro',
    helpfulCount: 35
  },
  {
    id: 'rev-04',
    authorName: 'Shalini Mahajan',
    rating: 5,
    relativeTime: '3 weeks ago',
    departmentTreated: 'Comprehensive Stroke Center',
    verifiedPatient: true,
    reviewText: 'Best neurology care in Nashik! Dr. Sanjay Sopan Varade took 40 minutes during our consultation to explain the 32-slice CT findings and stroke prevention protocol. The patient portal and direct stroke hotline (0253 2317364) provide immense peace of mind to caregivers.',
    doctorMentioned: 'Dr. Sanjay Sopan Varade MD, DM Neuro',
    helpfulCount: 24
  }
];

export const INITIAL_SUCCESS_STORIES: PatientSuccessStory[] = [
  {
    id: 'story-01',
    patientIdentifier: 'Rajesh Kulkarni, 58 yrs, Nashik',
    conditionCategory: 'Stroke Recovery',
    clinicalDiagnosis: 'Acute Left Middle Cerebral Artery (MCA) Ischemic Stroke',
    procedureOrTreatment: 'Emergency IV rtPA Thrombolysis & Neuro-Critical Care Protocol',
    attendingConsultant: 'Dr. Sanjay Sopan Varade (MD, DM Neuro)',
    rating: 5.0,
    timeframe: '6 Months Post-Event',
    milestoneBadge: 'Full Motor Independence Restored',
    initialPresentation: 'Sudden right hemiplegia, facial droop, and expressive aphasia at 6:45 AM. Reached Sopan Hospital within 45 minutes.',
    intervention: 'Immediate CT-Angio triage and rapid IV thrombolysis initiated in 24 minutes door-to-needle time by Dr. Sanjay Sopan Varade.',
    recoveryOutcome: 'Discharged on Day 5 with minimal deficit. At 6-month evaluation: independent walking, fluent speech, mRS score 0.',
    quote: 'When my speech suddenly failed and my right arm collapsed, my family called Sopan Hospital. Dr. Varade and his team acted within seconds. Today I am back to working at my desk and walking without any cane. Dr. Varade gave me a second life.',
    caregiverReflection: 'Sunita Kulkarni (Wife): "The kindness and promptness Dr. Varade showed during those terrifying first 30 minutes saved my husband from lifelong paralysis. We will forever be grateful."',
    metrics: [
      { label: 'Door-to-Needle', before: 'Critical (<60m standard)', after: '24 mins achieved' },
      { label: 'NIHSS Stroke Scale', before: '17 (Severe Deficit)', after: '1 (Normal Function)' },
      { label: 'Modified Rankin Scale (mRS)', before: '5 (Bedridden)', after: '0 (No Symptoms)' }
    ],
    datePublished: 'September 2026',
    verifiedHospitalTreated: true,
    helpfulUpvotes: 89
  },
  {
    id: 'story-02',
    patientIdentifier: 'Pooja Mandlik, 27 yrs, Sinnar',
    conditionCategory: 'Epilepsy & Seizures',
    clinicalDiagnosis: 'Drug-Resistant Mesial Temporal Lobe Epilepsy with Complex Partial Seizures',
    procedureOrTreatment: '24-Hour Continuous Video-EEG Localization & Precision Dual Anti-Epileptic Polytherapy Optimization',
    attendingConsultant: 'Dr. Sanjay Sopan Varade (MD, DM Neuro)',
    rating: 5.0,
    timeframe: '18 Months Seizure-Free',
    milestoneBadge: '18 Months Zero Seizure Landmark',
    initialPresentation: 'Experiencing 4 to 6 debilitating complex focal seizures monthly with post-ictal confusion, preventing employment and driving.',
    intervention: 'Admitted to Sopan Hospital for 24-hr continuous Video-EEG telemetric capture. Dr. Varade identified right temporal focus and restructured drug regimen with therapeutic drug monitoring.',
    recoveryOutcome: 'Zero seizure recurrence over 18 months, normal EEG background, successfully cleared to resume software engineering career.',
    quote: 'For five agonizing years I lived in constant fear of collapsing in public. Other clinics just added more pills that made me drowsy. Dr. Sanjay Varade accurately mapped my brainwaves on Video-EEG and customized my medicine. I celebrated 550 days without a single seizure last week!',
    caregiverReflection: 'Ashok Mandlik (Father): "Our daughter got her smile and her confidence back. Dr. Varade is the godsend our family prayed for."',
    metrics: [
      { label: 'Monthly Seizures', before: '4–6 episodes/month', after: '0 episodes (18 months)' },
      { label: 'Cognitive Alertness', before: 'Severe Drowsiness', after: 'Optimal Sharp Focus' },
      { label: 'Video-EEG Baseline', before: 'Frequent Spikes', after: 'Stable & Controlled' }
    ],
    datePublished: 'August 2026',
    verifiedHospitalTreated: true,
    helpfulUpvotes: 67
  },
  {
    id: 'story-03',
    patientIdentifier: 'Dattatray Patil, 66 yrs, Dhule',
    conditionCategory: 'Parkinson & Movement',
    clinicalDiagnosis: 'Idiopathic Parkinson’s Disease with Disabling Resting Tremor & Postural Instability',
    procedureOrTreatment: 'Advanced Dopaminergic Titration, Gait Rehabilitation & Neuromuscular Coordination Protocol',
    attendingConsultant: 'Dr. Sanjay Sopan Varade (MD, DM Neuro)',
    rating: 5.0,
    timeframe: '1 Year Under Care',
    milestoneBadge: 'Independent Ambulation & Tremor Control',
    initialPresentation: 'Severe right-hand resting tremor, shuffling gait with frequent freezing episodes, unable to button shirts or sign bank checks.',
    intervention: 'Multi-tiered evaluation by Dr. Sanjay Sopan Varade at Sopan Hospital Nashik, including specialized pharmacotherapy and targeted neuro-physiotherapy.',
    recoveryOutcome: 'Tremor amplitude reduced by 80%, freezing episodes eliminated, regained ability to write, eat, and walk independently.',
    quote: 'I could not hold a cup of tea without spilling it all over. My hands trembled incessantly. Dr. Varade listened to me with unmatched patience for 45 minutes and carefully tuned my dosages. Now I write letters to my grandchildren with my own hand.',
    caregiverReflection: 'Kiran Patil (Son): "Traveling from Dhule to Mumbai Naka Nashik was the best health decision we ever made for my father."',
    metrics: [
      { label: 'UPDRS Motor Score', before: '38 (Significant Disability)', after: '12 (Mild & Controlled)' },
      { label: 'Freezing Episodes', before: '5–8 daily', after: '0 recorded this month' },
      { label: 'Independent Daily Living', before: 'Needed Assistance', after: '100% Self-Reliant' }
    ],
    datePublished: 'July 2026',
    verifiedHospitalTreated: true,
    helpfulUpvotes: 54
  },
  {
    id: 'story-04',
    patientIdentifier: 'Kavita Shinde, 41 yrs, Jalgaon',
    conditionCategory: 'Migraine & Nerve Pain',
    clinicalDiagnosis: 'Intractable Chronic Migraine with Allodynia & Medication Overuse Headache (MOH)',
    procedureOrTreatment: 'Greater Occipital Nerve (GON) Block & Preventive CGRP Targeted Therapy',
    attendingConsultant: 'Dr. Sanjay Sopan Varade (MD, DM Neuro)',
    rating: 5.0,
    timeframe: '9 Months Post-Intervention',
    milestoneBadge: 'Chronic Pain Free (Headache Days: 22 → 1/mo)',
    initialPresentation: 'Suffering 20 to 25 severe headache days monthly with photophobia, nausea, and vomiting, taking daily painkillers without relief.',
    intervention: 'Comprehensive headache assessment, detoxification from analgesics, and bilateral ultrasound-guided occipital nerve blockade by Dr. Varade.',
    recoveryOutcome: 'Headache days plummeted to less than 1 mild episode per month, complete cessation of daily emergency analgesics.',
    quote: 'Chronic migraine destroyed my social and professional life for four years. Doctors told me I had to live with it. Dr. Sanjay Varade performed an occipital nerve block right in the outpatient clinic. The blinding pressure lifted within 48 hours. I feel reborn.',
    caregiverReflection: 'Mahesh Shinde (Husband): "Our home was dark with curtains drawn for years. Now she is thriving and energetic again."',
    metrics: [
      { label: 'Monthly Headache Days', before: '22–25 Days', after: '< 1 Mild Day/Month' },
      { label: 'Emergency Painkiller Use', before: 'Daily (Analgesic Overuse)', after: 'Zero rescue injections' },
      { label: 'Quality of Life (MIDAS)', before: 'Grade IV (Severe)', after: 'Grade I (Minimal)' }
    ],
    datePublished: 'June 2026',
    verifiedHospitalTreated: true,
    helpfulUpvotes: 72
  },
  {
    id: 'story-05',
    patientIdentifier: 'Master Aarav Navale, 12 yrs, Nashik',
    conditionCategory: 'Epilepsy & Seizures',
    clinicalDiagnosis: 'Childhood Absence Epilepsy & Atypical Spike-Wave Paroxysms',
    procedureOrTreatment: 'Pediatric Neuro-Electrophysiology & Ethosuximide Targeted Regimen',
    attendingConsultant: 'Dr. Sanjay Sopan Varade (MD, DM Neuro)',
    rating: 5.0,
    timeframe: '14 Months Seizure-Free',
    milestoneBadge: 'Academic Excellence Restored',
    initialPresentation: 'Brief 10-second staring spells occurring 30+ times daily, misdiagnosed as ADHD or lack of attention in school.',
    intervention: 'Hyperventilation challenge during 32-channel digital EEG captured 3 Hz generalized spike-and-wave discharges. Dr. Varade immediately initiated targeted therapy.',
    recoveryOutcome: 'Absence spells vanished completely within 10 days of medication. Child is now at the top of his 7th-grade class.',
    quote: 'My son was getting reprimanded in school because teachers thought he was daydreaming. Dr. Varade identified the exact electrical wave in his brain. Within two weeks Aarav was completely normal and scored 94% in his final examinations.',
    caregiverReflection: 'Rohit & Shweta Navale (Parents): "Dr. Varade has a gentle touch with children. He explained everything on the computer screen so simply."',
    metrics: [
      { label: 'Absence Spells / Day', before: '30–40 staring spells', after: '0 recorded' },
      { label: '3Hz Spike-Wave Runs', before: 'Continuous on EEG', after: 'Completely Resolved' },
      { label: 'Academic Standing', before: 'Falling behind', after: 'Top 5% of class' }
    ],
    datePublished: 'May 2026',
    verifiedHospitalTreated: true,
    helpfulUpvotes: 48
  },
  {
    id: 'story-06',
    patientIdentifier: 'Ganesh Thombare, 63 yrs, Malegaon',
    conditionCategory: 'Neuro-Rehab',
    clinicalDiagnosis: 'Right Hemisphere Embolic Stroke with Left-Sided Neglect & Mobility Loss',
    procedureOrTreatment: 'Inpatient Intensive Neuro-Rehabilitation & Anti-Platelet Secondary Prevention',
    attendingConsultant: 'Dr. Sanjay Sopan Varade (MD, DM Neuro)',
    rating: 5.0,
    timeframe: '8 Months Follow-Up',
    milestoneBadge: 'Returned to Active Farming & Driving',
    initialPresentation: 'Inability to move left arm and leg, sensory neglect, severe balance impairment following stroke.',
    intervention: 'Acute stabilization followed by structured inpatient neuro-rehabilitation supervised by Dr. Varade at Sopan Hospital Nashik.',
    recoveryOutcome: 'Regained 90% limb strength, full spatial awareness, now drives tractor and manages farm in Malegaon.',
    quote: 'I was told by local doctors that at 63 I would spend the rest of my years in a wheelchair. Dr. Sanjay Sopan Varade gave me confidence. His guidance and team worked with me every day. Today I inspect my fields on foot every single morning.',
    caregiverReflection: 'Sachin Thombare (Son): "Sopan Hospital at Mumbai Naka is a blessing for rural patients across North Maharashtra."',
    metrics: [
      { label: 'Limb Strength (MRC)', before: '1/5 (Paralyzed)', after: '4+/5 (Near Normal)' },
      { label: 'Mobility Independence', before: 'Wheelchair bound', after: 'Independent walking' },
      { label: 'Secondary Stroke Risk', before: 'High (Untreated)', after: 'Optimal & Guarded' }
    ],
    datePublished: 'April 2026',
    verifiedHospitalTreated: true,
    helpfulUpvotes: 61
  }
];

