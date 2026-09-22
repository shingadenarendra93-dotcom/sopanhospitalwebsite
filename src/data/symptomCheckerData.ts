import { 
  SymptomDefinition, 
  NeurologicalConditionProfile, 
  SymptomAssessmentResult, 
  SymptomOnset, 
  SymptomSeverity 
} from '../types';

export const SYMPTOM_LIST: SymptomDefinition[] = [
  // 1. Cranial & Headache
  {
    id: 'sym-severe-throbbing-headache',
    name: 'Throbbing, Pulsating One-Sided Headache',
    category: 'Cranial & Headache',
    description: 'Moderate to severe pulsating pain, often aggravated by physical activity, sound, or light.',
    commonIn: ['Migraine', 'Cluster Headache', 'Vascular Headache']
  },
  {
    id: 'sym-thunderclap-headache',
    name: 'Sudden "Thunderclap" Headache (Worst of Life)',
    category: 'Cranial & Headache',
    description: 'Explosive, instantaneous onset peaking within 60 seconds; potentially indicates subarachnoid hemorrhage or arterial dissection.',
    isRedFlag: true,
    commonIn: ['Subarachnoid Hemorrhage', 'Arterial Dissection', 'Cerebral Venous Thrombosis']
  },
  {
    id: 'sym-band-headache',
    name: 'Tight Band-Like Headache / Neck Tension',
    category: 'Cranial & Headache',
    description: 'Dull, aching bilateral pressure wrapped around temples or base of skull without nausea.',
    commonIn: ['Tension Headache', 'Cervicogenic Headache']
  },
  {
    id: 'sym-nausea-photophobia',
    name: 'Nausea, Vomiting & Light/Sound Sensitivity',
    category: 'Cranial & Headache',
    description: 'Feeling sick to stomach accompanied by extreme discomfort from bright lights (photophobia) or noise.',
    commonIn: ['Migraine', 'Increased Intracranial Pressure', 'Meningitis']
  },
  {
    id: 'sym-facial-stabbing-pain',
    name: 'Sudden Electric Shock-Like Facial Pain',
    category: 'Cranial & Headache',
    description: 'Intense, shooting, knife-like pain triggered by touching the face, chewing, talking, or brushing teeth.',
    commonIn: ['Trigeminal Neuralgia', 'Cranial Neuropathy']
  },

  // 2. Motor, Movement & Weakness
  {
    id: 'sym-sudden-arm-face-weakness',
    name: 'Sudden One-Sided Face, Arm, or Leg Weakness',
    category: 'Motor, Movement & Weakness',
    description: 'Rapid inability to raise one arm, uneven facial smile, or leg giving way suddenly.',
    isRedFlag: true,
    commonIn: ['Acute Ischemic Stroke', 'Transient Ischemic Attack (TIA)', 'Intracerebral Hemorrhage']
  },
  {
    id: 'sym-resting-tremor',
    name: 'Tremor in Hand or Fingers at Rest ("Pill-Rolling")',
    category: 'Motor, Movement & Weakness',
    description: 'Involuntary rhythmic shaking when hands are resting on lap, which diminishes during voluntary movement.',
    commonIn: ['Parkinson’s Disease', 'Parkinsonism']
  },
  {
    id: 'sym-muscle-rigidity-slowness',
    name: 'Muscle Stiffness & Slow Movement (Bradykinesia)',
    category: 'Motor, Movement & Weakness',
    description: 'Resistance to limb movement, reduced arm swing when walking, small shuffling steps, and general sluggishness.',
    commonIn: ['Parkinson’s Disease', 'Extrapyramidal Syndromes']
  },
  {
    id: 'sym-muscle-convulsions',
    name: 'Rhythmic Muscle Shaking & Body Stiffening (Convulsions)',
    category: 'Motor, Movement & Weakness',
    description: 'Involuntary full-body jerking or stiffening lasting seconds to minutes, often accompanied by bite or tongue injury.',
    isRedFlag: true,
    commonIn: ['Epileptic Seizures', 'Status Epilepticus']
  },
  {
    id: 'sym-myoclonic-jerks',
    name: 'Sudden Morning Muscle Twitches / Shock Jerks',
    category: 'Motor, Movement & Weakness',
    description: 'Sudden lightning-fast muscle jerks (e.g., spilling morning tea, dropping objects abruptly).',
    commonIn: ['Juvenile Myoclonic Epilepsy (JME)', 'Metabolic Myoclonus']
  },
  {
    id: 'sym-foot-drop',
    name: 'Foot Dropping / Catching Toes While Walking',
    category: 'Motor, Movement & Weakness',
    description: 'Inability to dorsiflex foot upwards at the ankle, causing a high-stepping gait.',
    commonIn: ['Peroneal Neuropathy', 'L5 Radiculopathy']
  },

  // 3. Sensory & Numbness
  {
    id: 'sym-pins-needles-feet',
    name: 'Pins & Needles / Burning Pain in Both Feet (Glove & Stocking)',
    category: 'Sensory & Numbness',
    description: 'Distal tingling, burning, numbness, or hypersensitivity starting in toes and creeping up toward ankles.',
    commonIn: ['Diabetic Peripheral Neuropathy', 'B12 Deficiency Neuropathy']
  },
  {
    id: 'sym-sciatica-shooting-pain',
    name: 'Shooting Pain from Lower Back Down One Leg (Sciatica)',
    category: 'Sensory & Numbness',
    description: 'Sharp, radiating electric pain running down buttock, thigh, and calf, exacerbated by coughing or sitting.',
    commonIn: ['Lumbar Disc Herniation', 'Lumbar Radiculopathy']
  },
  {
    id: 'sym-neck-to-hand-numbness',
    name: 'Neck Pain Radiating to Arm & Fingers',
    category: 'Sensory & Numbness',
    description: 'Cervical ache traveling down shoulder, forearm, and specific fingertips with weakness or numbness.',
    commonIn: ['Cervical Spondylotic Radiculopathy']
  },
  {
    id: 'sym-sudden-hemi-numbness',
    name: 'Sudden Complete Numbness on One Half of Body',
    category: 'Sensory & Numbness',
    description: 'Abrupt loss of pinprick or light touch sensation on one side of face and body.',
    isRedFlag: true,
    commonIn: ['Acute Ischemic Stroke', 'Thalamic Infarct', 'TIA']
  },

  // 4. Balance, Dizziness & Vestibular
  {
    id: 'sym-rotational-vertigo',
    name: 'Room Spinning Sensation with Head Movement (Vertigo)',
    category: 'Balance, Dizziness & Vestibular',
    description: 'Violent illusion of spinning when turning in bed, looking upwards, or bending down.',
    commonIn: ['Benign Paroxysmal Positional Vertigo (BPPV)', 'Vestibular Neuritis', 'Ménière’s Disease']
  },
  {
    id: 'sym-gait-unsteadiness',
    name: 'Staggering, Drunken-like Gait & Balance Loss (Ataxia)',
    category: 'Balance, Dizziness & Vestibular',
    description: 'Wide-based walking, swaying side-to-side, or requiring wall support to remain upright.',
    commonIn: ['Cerebellar Stroke', 'Spinocerebellar Ataxia', 'Sensory Neuropathy']
  },
  {
    id: 'sym-ear-ringing-fullness',
    name: 'Ringing in Ear (Tinnitus) or Ear Fullness',
    category: 'Balance, Dizziness & Vestibular',
    description: 'Continuous buzzing or clicking in one or both ears, sometimes with fluctuating hearing impairment.',
    commonIn: ['Ménière’s Disease', 'Acoustic Neuroma', 'Vestibular Schwannoma']
  },

  // 5. Speech, Vision & Facial
  {
    id: 'sym-slurred-speech',
    name: 'Sudden Slurred or Scrambled Speech (Dysarthria / Dysphasia)',
    category: 'Speech, Vision & Facial',
    description: 'Inability to pronounce words clearly, gibberish speech, or inability to understand simple spoken instructions.',
    isRedFlag: true,
    commonIn: ['Acute Ischemic Stroke', 'TIA', 'Brainstem Lesion']
  },
  {
    id: 'sym-facial-droop-bells',
    name: 'One-Sided Facial Droop with Inability to Close Eye',
    category: 'Speech, Vision & Facial',
    description: 'Complete paralysis of forehead and mouth on one side, eye tearing, and drooling from mouth angle.',
    commonIn: ['Bell’s Palsy (Facial Nerve)', 'Stroke (spares forehead)']
  },
  {
    id: 'sym-visual-aura',
    name: 'Visual Aura: Flashing Lights, Zig-Zag Lines, Blind Spot',
    category: 'Speech, Vision & Facial',
    description: 'Scintillating scotoma or kaleidoscopic shimmering visual phenomena lasting 15 to 45 minutes.',
    commonIn: ['Migraine with Aura', 'Occipital Seizure']
  },
  {
    id: 'sym-double-vision',
    name: 'Double Vision (Diplopia) or Sudden Vision Loss',
    category: 'Speech, Vision & Facial',
    description: 'Seeing two images of single object, or sudden shutter-like darkening in one eye (amaurosis fugax).',
    isRedFlag: true,
    commonIn: ['Carotid Artery Stenosis', 'Acute Stroke', 'Cranial Nerve III/IV/VI Palsy', 'Multiple Sclerosis']
  },
  {
    id: 'sym-difficulty-swallowing',
    name: 'Difficulty Swallowing or Choking on Liquids (Dysphagia)',
    category: 'Speech, Vision & Facial',
    description: 'Coughing when drinking water, nasal regurgitation, or hoarse vocal quality.',
    commonIn: ['Bulbar Palsy', 'Brainstem Infarct', 'Myasthenia Gravis']
  },

  // 6. Cognitive, Memory & Seizure
  {
    id: 'sym-blank-staring-absence',
    name: 'Brief Blank Staring Spells / Unresponsive Episodes',
    category: 'Cognitive, Memory & Seizure',
    description: 'Sudden 5-15 second pause in conversation or activity with lip-smacking or no memory of the event.',
    commonIn: ['Temporal Lobe Epilepsy', 'Absence Seizures']
  },
  {
    id: 'sym-post-ictal-confusion',
    name: 'Prolonged Confusion & Exhaustion Following Episode',
    category: 'Cognitive, Memory & Seizure',
    description: 'Deep sleep, headache, disorientation, or temporary limb weakness after a shaking or collapse episode.',
    commonIn: ['Generalized Tonic-Clonic Seizure', 'Todd’s Paresis']
  },
  {
    id: 'sym-memory-loss-navigation',
    name: 'Progressive Memory Decline & Getting Lost in Familiar Places',
    category: 'Cognitive, Memory & Seizure',
    description: 'Forgetting recent conversations, repeating questions, disorientation in known neighborhoods, or financial confusion.',
    commonIn: ['Alzheimer’s Disease', 'Vascular Dementia', 'Normal Pressure Hydrocephalus (NPH)']
  },
  {
    id: 'sym-sudden-acute-confusion',
    name: 'Sudden Inability to Recognize Family or Fluctuating Agitation',
    category: 'Cognitive, Memory & Seizure',
    description: 'Acute delirium or altered mental sensorium over hours or days.',
    isRedFlag: true,
    commonIn: ['Encephalitis', 'Acute Sepsis / Toxic Encephalopathy', 'Subacute Subdural Hematoma']
  }
];

export const NEUROLOGICAL_CONDITIONS: NeurologicalConditionProfile[] = [
  {
    id: 'cond-stroke-tia',
    name: 'Acute Ischemic Stroke / Transient Ischemic Attack (TIA)',
    category: 'Vascular Neurology',
    subtitle: 'Arterial Thrombosis or Thromboembolism compromised brain perfusion',
    overview: 'A medical emergency occurring when cerebral arterial blood supply is obstructed by a blood clot, resulting in the death of ~1.9 million neurons every minute. Urgent protocolized thrombolysis or mechanical thrombectomy is required within the Golden Hour.',
    urgency: 'Emergency (Immediate)',
    recommendedDepartment: 'Comprehensive Stroke Center',
    keyMatchingSymptoms: [
      'sym-sudden-arm-face-weakness',
      'sym-slurred-speech',
      'sym-sudden-hemi-numbness',
      'sym-double-vision',
      'sym-gait-unsteadiness'
    ],
    redFlagsTrigger: [
      'sym-sudden-arm-face-weakness',
      'sym-slurred-speech',
      'sym-sudden-hemi-numbness'
    ],
    diagnosticInvestigations: [
      'Stat Non-Contrast 32-Slice CT Brain (< 15 min door-to-scan)',
      '32-Slice CT Angiography (CTA) of Brain & Carotids',
      'Continuous Telemetry & 12-lead ECG for Atrial Fibrillation',
      'Bilateral Carotid & Vertebral Duplex Doppler'
    ],
    doctorAdvice: 'Every single minute counts. If F.A.S.T. signs (Facial droop, Arm weakness, Slurred speech) are present, do NOT give water or aspirin. Call the 24/7 Stroke Unit (0253 2317364) immediately for priority emergency room triage.',
    articleSlug: 'acute-stroke-care',
    vrHotspotId: 'hs-mca'
  },
  {
    id: 'cond-migraine',
    name: 'Migraine with or without Aura',
    category: 'Headache Disorders',
    subtitle: 'Neuro-vascular sensory processing and trigeminovascular sensitization',
    overview: 'A primary neurological headache disorder characterized by recurrent attacks of throbbing unilateral headache accompanied by autonomic symptoms (nausea, photophobia, phonophobia) and in ~30% of cases, reversible visual or sensory auras.',
    urgency: 'Standard OPD Consultation',
    recommendedDepartment: 'Comprehensive Stroke Center',
    keyMatchingSymptoms: [
      'sym-severe-throbbing-headache',
      'sym-nausea-photophobia',
      'sym-visual-aura',
      'sym-band-headache'
    ],
    diagnosticInvestigations: [
      'Neurovascular Clinical Examination by Chief Neurologist',
      '32-Slice CT Brain (to rule out intracranial secondary pathology)',
      'Refractive and Fundoscopic Retinal Assessment',
      'Headache Calendar & Trigger Mapping Protocol'
    ],
    doctorAdvice: 'Migraine is a treatable biological condition, not just routine stress. Modern CGRP antagonists, triptan abortive strategies, and lifestyle titration under Dr. Sanjay Sopan Varade achieve over 85% reduction in monthly headache frequency.',
    articleSlug: 'acute-stroke-care',
    vrHotspotId: 'hs-mca'
  },
  {
    id: 'cond-epilepsy',
    name: 'Epilepsy & Seizure Disorder',
    category: 'Epileptology',
    subtitle: 'Hypersynchronous cerebral neuronal discharges and network hyperexcitability',
    overview: 'A chronic neurological condition marked by recurrent unprovoked seizures, ranging from subtle momentary blank stares (absence) or sudden early-morning arm jerks (myoclonus) to full-body generalized convulsions.',
    urgency: 'Urgent (Within 24-48h)',
    recommendedDepartment: 'Epilepsy & EEG Monitoring',
    keyMatchingSymptoms: [
      'sym-muscle-convulsions',
      'sym-myoclonic-jerks',
      'sym-blank-staring-absence',
      'sym-post-ictal-confusion'
    ],
    redFlagsTrigger: [
      'sym-muscle-convulsions'
    ],
    diagnosticInvestigations: [
      'Digital 24-hr Video-EEG with sleep deprivation protocol',
      '32-Slice CT Volume Helical Scan (Fine Bone & Soft Tissue slices)',
      'Serum Electrolytes, Calcium, and Antiseizure Drug (AED) Levels',
      'High-Resolution Epilepsy Protocol MRI Referral'
    ],
    doctorAdvice: 'Over 80% of seizure patients achieve complete seizure freedom with precise molecular anti-seizure monotherapy. Never place spoons or keys in a convulsing patient’s mouth; turn them gently to their side and time the episode.',
    articleSlug: 'epilepsy-seizure-disorders',
    vrHotspotId: 'hs-temporal'
  },
  {
    id: 'cond-parkinsons',
    name: 'Parkinson’s Disease & Movement Disorders',
    category: 'Movement Disorders',
    subtitle: 'Degeneration of dopaminergic neurons in the substantia nigra pars compacta',
    overview: 'A progressive neurodegenerative disorder affecting kinetic motor circuits, characterized by asymmetric resting tremor, cogwheel rigidity, bradykinesia (slowed initiation of movements), and loss of postural reflexes.',
    urgency: 'Standard OPD Consultation',
    recommendedDepartment: 'Movement Disorders & Parkinson’s',
    keyMatchingSymptoms: [
      'sym-resting-tremor',
      'sym-muscle-rigidity-slowness',
      'sym-gait-unsteadiness',
      'sym-difficulty-swallowing'
    ],
    diagnosticInvestigations: [
      'Unified Parkinson’s Disease Rating Scale (MDS-UPDRS) Assessment',
      'Levodopa Challenge Test (Acute motor responsiveness test)',
      '32-Slice CT Scan (Exclude normal pressure hydrocephalus or lacunar infarcts)',
      'Autonomic Nervous System & Postural Tilt Table Evaluation'
    ],
    doctorAdvice: 'Early intervention with customized dopamine-replacement therapy, neuroprotective physical rehab, and gait synchronization drastically preserves independence and quality of life for decades.',
    articleSlug: 'parkinsons-movement-disorders',
    vrHotspotId: 'hs-basal'
  },
  {
    id: 'cond-peripheral-neuropathy',
    name: 'Peripheral Neuropathy & Diabetic Nerve Damage',
    category: 'Neuromuscular',
    subtitle: 'Distal axonal degeneration and demyelination of peripheral sensory-motor nerves',
    overview: 'Damage to the peripheral nervous system, most commonly arising from chronic diabetes mellitus, vitamin B12 deficiency, or neurotoxic agents. Presents with symmetrical glove-and-stocking burning sensation, hyperalgesia, and sensory ataxia.',
    urgency: 'Standard OPD Consultation',
    recommendedDepartment: 'Spine & Peripheral Nerve',
    keyMatchingSymptoms: [
      'sym-pins-needles-feet',
      'sym-foot-drop',
      'sym-gait-unsteadiness'
    ],
    diagnosticInvestigations: [
      'Nerve Conduction Velocity (NCV) & Electromyography (EMG)',
      'HbA1c, Fasting Blood Glucose, & Advanced Lipid Panel',
      'Serum Vitamin B12, Holo-Transcobalamin, and Folate Levels',
      'Quantitative Sensory Testing & Ankle Reflex Mapping'
    ],
    doctorAdvice: 'Tingling and burning in the feet are critical early warning signs of peripheral nerve stress. Timely glycemic stabilization, neurotropic vitamin therapy, and neuropathic pain modulation can halt axonal loss.',
    articleSlug: 'peripheral-neuropathy',
    vrHotspotId: 'hs-mca'
  },
  {
    id: 'cond-vertigo-bppv',
    name: 'Benign Paroxysmal Positional Vertigo (BPPV) & Vestibular Disorder',
    category: 'Neuro-Otology',
    subtitle: 'Canalithiasis / otolith displacement in the semicircular canals of the inner ear',
    overview: 'A mechanical disorder of the vestibular labyrinth where detached calcium carbonate otoconia float into one of the semicircular canals, provoking transient violent spinning sensations when moving the head.',
    urgency: 'Urgent (Within 24-48h)',
    recommendedDepartment: 'Comprehensive Stroke Center',
    keyMatchingSymptoms: [
      'sym-rotational-vertigo',
      'sym-nausea-photophobia',
      'sym-gait-unsteadiness',
      'sym-ear-ringing-fullness'
    ],
    diagnosticInvestigations: [
      'Dix-Hallpike & Pagnini-McClure Diagnostic Maneuvers',
      'Video-Nystagmography (VNG) / Frenzel Goggle Examination',
      '32-Slice CT Brain (to rule out cerebellar or posterior fossa stroke)',
      'Audiometric Hearing Evaluation'
    ],
    doctorAdvice: 'Most cases of BPPV can be permanently cured in a single consultation using precise canalith repositioning maneuvers (Epley / Semont). Dr. Varade ensures fast relief without the need for prolonged sedatives.',
    articleSlug: 'acute-stroke-care',
    vrHotspotId: 'hs-cerebellum'
  },
  {
    id: 'cond-radiculopathy-sciatica',
    name: 'Cervical / Lumbar Radiculopathy (Sciatica / Pinched Nerve)',
    category: 'Spine & Peripheral Nerve',
    subtitle: 'Nerve root compression or inflammation due to disc protrusion or spondylosis',
    overview: 'Mechanical compression or chemical irritation of a spinal nerve root in the neck or lower back, generating radiating electric pain, dermatomal numbness, and motor weakness down the arm or leg.',
    urgency: 'Standard OPD Consultation',
    recommendedDepartment: 'Spine & Peripheral Nerve',
    keyMatchingSymptoms: [
      'sym-sciatica-shooting-pain',
      'sym-neck-to-hand-numbness',
      'sym-foot-drop',
      'sym-pins-needles-feet'
    ],
    diagnosticInvestigations: [
      'Clinical Straight Leg Raise (Lasegue’s) & Spurling’s Maneuver',
      'Spinal 32-Slice High-Resolution CT with Bone Window Slices',
      'Needle EMG & Dermatomal Sensory Nerve Conduction Studies',
      'Lumbar / Cervical Spine MRI'
    ],
    doctorAdvice: 'Over 90% of radiculopathies resolve successfully with targeted anti-inflammatory medical protocols, posture mechanics, and specialized neuro-physiotherapy without requiring open spinal surgery.',
    articleSlug: 'peripheral-neuropathy',
    vrHotspotId: 'hs-mca'
  },
  {
    id: 'cond-bells-palsy',
    name: 'Bell’s Palsy (Idiopathic Facial Nerve Paresis)',
    category: 'Cranial Neuropathy',
    subtitle: 'Acute inflammation and edema of Cranial Nerve VII within the fallopian canal',
    overview: 'An acute, isolated peripheral paralysis of the facial nerve, causing weakness of all facial muscles on one side (including inability to furrow forehead or close the eyelid tightly), often preceded by mild retroauricular ache.',
    urgency: 'Urgent (Within 24-48h)',
    recommendedDepartment: 'Comprehensive Stroke Center',
    keyMatchingSymptoms: [
      'sym-facial-droop-bells',
      'sym-slurred-speech',
      'sym-difficulty-swallowing'
    ],
    diagnosticInvestigations: [
      'House-Brackmann Facial Nerve Function Staging',
      '32-Slice CT Scan (Exclude posterior circulation infarct or temporal bone lesion)',
      'Facial Nerve Electroneuronography (ENoG) & Blink Reflex Study',
      'Corneal Fluorescein Stain to ensure eye lubrication safety'
    ],
    doctorAdvice: 'Early initiation of high-dose corticosteroids within 72 hours of onset dramatically improves full recovery rates above 90%. Crucial eye care (artificial tears & overnight taping) is vital to protect the cornea.',
    articleSlug: 'acute-stroke-care',
    vrHotspotId: 'hs-brainstem'
  },
  {
    id: 'cond-trigeminal-neuralgia',
    name: 'Trigeminal Neuralgia (Tic Douloureux)',
    category: 'Cranial Nerve Pain',
    subtitle: 'Neurovascular cross-compression of Cranial Nerve V at the root entry zone',
    overview: 'One of the most severe neuropathic pain conditions known, causing lancinating, electric shock-like spasms across the jaw, cheek, or forehead triggered by mild sensory stimuli such as talking, shaving, or wind.',
    urgency: 'Standard OPD Consultation',
    recommendedDepartment: 'Comprehensive Stroke Center',
    keyMatchingSymptoms: [
      'sym-facial-stabbing-pain',
      'sym-severe-throbbing-headache'
    ],
    diagnosticInvestigations: [
      'Dedicated 32-Slice Helical CT Scan of Skull Base & Foramina',
      'High-Resolution CISS / FIESTA sequence MRI referral',
      'Quantitative Trigeminal Sensory Threshold Assessment',
      'Dental vs Neurological Differential Diagnostic Examination'
    ],
    doctorAdvice: 'Trigeminal neuralgia is frequently misdiagnosed as routine dental toothache. Dr. Varade prescribes targeted membrane-stabilizing medications (Carbamazepine/Oxcarbazepine) and coordinates microvascular decompression when indicated.',
    articleSlug: 'acute-stroke-care',
    vrHotspotId: 'hs-brainstem'
  },
  {
    id: 'cond-cognitive-decline',
    name: 'Mild Cognitive Impairment (MCI) / Early Dementia',
    category: 'Cognitive Neurology',
    subtitle: 'Progressive neuro-degenerative tau/amyloid pathology or multi-infarct microvascular damage',
    overview: 'A syndrome characterized by progressive cognitive decline greater than expected for normal age, interfering with complex tasks, spatial navigation, short-term recall, and executive decision-making.',
    urgency: 'Standard OPD Consultation',
    recommendedDepartment: 'Comprehensive Stroke Center',
    keyMatchingSymptoms: [
      'sym-memory-loss-navigation',
      'sym-sudden-acute-confusion',
      'sym-gait-unsteadiness'
    ],
    diagnosticInvestigations: [
      'Montreal Cognitive Assessment (MoCA) & Mini-Mental State Exam (MMSE)',
      'Volumetric 32-Slice CT Brain (evaluating hippocampal atrophy and leukoaraiosis)',
      'Thyroid Profile (TSH), Serum B12, and Serum Homocysteine',
      'Carotid Duplex Doppler (rule out chronic microvascular hypoperfusion)'
    ],
    doctorAdvice: 'Distinguishing treatable causes of memory loss (such as Normal Pressure Hydrocephalus, thyroid dysfunction, or B12 deficiency) from Alzheimer’s is paramount. Comprehensive cognitive profiling enables timely memory-stabilizing therapies.',
    articleSlug: 'acute-stroke-care',
    vrHotspotId: 'hs-temporal'
  }
];

export interface PresetScenario {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  symptomIds: string[];
  onset: SymptomOnset;
  severity: SymptomSeverity;
  age: number;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'preset-stroke',
    title: 'Emergency: Sudden Arm Drift & Slurred Speech',
    badge: 'Acute Stroke Alert',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'Patient suddenly cannot raise their right arm, has slurred speech, and one side of the face looks uneven.',
    symptomIds: ['sym-sudden-arm-face-weakness', 'sym-slurred-speech', 'sym-sudden-hemi-numbness'],
    onset: 'Sudden (< 1 hour)',
    severity: 'Severe',
    age: 62
  },
  {
    id: 'preset-migraine',
    title: 'Pulsating Headache with Flashing Lights & Nausea',
    badge: 'Migraine with Aura',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Recurrent throbbing pain on one side of temple with nausea, sensitive to light, preceded by shimmering zig-zag lines.',
    symptomIds: ['sym-severe-throbbing-headache', 'sym-nausea-photophobia', 'sym-visual-aura'],
    onset: 'Rapid (< 24 hours)',
    severity: 'Moderate',
    age: 34
  },
  {
    id: 'preset-parkinsons',
    title: 'Hand Tremor at Rest & Slowed Shuffling Walking',
    badge: 'Movement Disorder',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Rhythmic resting shake in left hand, arm feels heavy and stiff, walking has become noticeably slower over 6 months.',
    symptomIds: ['sym-resting-tremor', 'sym-muscle-rigidity-slowness', 'sym-gait-unsteadiness'],
    onset: 'Chronic / Recurrent (> 3 Months)',
    severity: 'Moderate',
    age: 68
  },
  {
    id: 'preset-vertigo',
    title: 'Room Spinning When Rolling in Bed or Looking Up',
    badge: 'Vestibular Vertigo',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    description: 'Violent 30-second spinning illusion when changing head positions, feeling off-balance and mildly nauseated.',
    symptomIds: ['sym-rotational-vertigo', 'sym-nausea-photophobia', 'sym-gait-unsteadiness'],
    onset: 'Sudden (< 1 hour)',
    severity: 'Moderate',
    age: 48
  },
  {
    id: 'preset-neuropathy',
    title: 'Burning & Pins-and-Needles in Both Feet',
    badge: 'Peripheral Neuropathy',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Nighttime burning sensation in soles and toes with numbness, tingling, and hypersensitivity to bedsheets.',
    symptomIds: ['sym-pins-needles-feet', 'sym-gait-unsteadiness'],
    onset: 'Gradual (Days to Weeks)',
    severity: 'Moderate',
    age: 56
  },
  {
    id: 'preset-seizure',
    title: 'Sudden Muscle Jerking & Brief Unresponsive Spells',
    badge: 'Seizure Screening',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Morning muscle jerks dropping coffee cup, followed by an episode of blank staring and post-episode disorientation.',
    symptomIds: ['sym-myoclonic-jerks', 'sym-blank-staring-absence', 'sym-post-ictal-confusion'],
    onset: 'Rapid (< 24 hours)',
    severity: 'Moderate',
    age: 26
  }
];

export function assessSymptoms(
  selectedSymptomIds: string[],
  onset: SymptomOnset,
  severity: SymptomSeverity
): SymptomAssessmentResult[] {
  if (selectedSymptomIds.length === 0) {
    return [];
  }

  const selectedSymptoms = SYMPTOM_LIST.filter(s => selectedSymptomIds.includes(s.id));
  const hasAnyRedFlag = selectedSymptoms.some(s => s.isRedFlag);

  const results: SymptomAssessmentResult[] = NEUROLOGICAL_CONDITIONS.map(condition => {
    // Calculate matching symptoms
    const matched = selectedSymptoms.filter(s => condition.keyMatchingSymptoms.includes(s.id));
    const matchedCount = matched.length;
    const totalKeySymptoms = condition.keyMatchingSymptoms.length;

    // Base score based on overlap percentage
    let matchRatio = matchedCount / Math.max(totalKeySymptoms, 1);
    
    // Additional weight for symptom density:
    let score = matchRatio * 80;

    // Red flag bonus if condition triggers red flags that patient has
    if (condition.redFlagsTrigger && condition.redFlagsTrigger.some(id => selectedSymptomIds.includes(id))) {
      score += 15;
    }

    // Onset and severity alignment
    if (condition.urgency === 'Emergency (Immediate)' && onset.includes('Sudden')) {
      score += 10;
    }
    if (condition.id === 'cond-migraine' && severity === 'Severe') {
      score += 5;
    }
    if (condition.id === 'cond-parkinsons' && onset.includes('Chronic')) {
      score += 10;
    }
    if (condition.id === 'cond-vertigo-bppv' && onset.includes('Sudden')) {
      score += 8;
    }

    // Normalize score to max 98% (never 100% to reflect that clinical diagnosis requires examination)
    const normalizedScore = Math.min(Math.round(score), 96);

    const unmatchedKey = condition.keyMatchingSymptoms
      .filter(id => !selectedSymptomIds.includes(id))
      .map(id => SYMPTOM_LIST.find(s => s.id === id)?.name || id);

    return {
      condition,
      matchScore: normalizedScore,
      matchedSymptoms: matched,
      unmatchedKeySymptoms: unmatchedKey,
      hasRedFlags: Boolean(condition.redFlagsTrigger && condition.redFlagsTrigger.some(id => selectedSymptomIds.includes(id)))
    };
  });

  // Filter conditions that have at least 1 matching symptom, sorted by matchScore descending
  return results
    .filter(r => r.matchedSymptoms.length > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}
