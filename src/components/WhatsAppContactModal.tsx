import React, { useState } from 'react';
import { 
  MessageCircle, 
  Send, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  Video, 
  Pill, 
  X,
  ExternalLink
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

interface WhatsAppContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTemplate?: string;
}

export const WhatsAppContactModal: React.FC<WhatsAppContactModalProps> = ({
  isOpen,
  onClose,
  defaultTemplate
}) => {
  const { language } = useLanguage();
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>(defaultTemplate || 'stroke-emergency');
  const [customNotes, setCustomNotes] = useState<string>('');

  const hospitalWhatsAppNumber = '919405545521'; // Sopan Neuro 24/7 Desk: 9405545521

  const isMr = language === 'mr';

  const templates = [
    {
      key: 'stroke-emergency',
      title: isMr ? '🚨 तातडीची पक्षाघात (स्ट्रोक) मदत' : '🚨 Emergency Stroke Rapid Response',
      priority: isMr ? 'अति-तातडीचे' : 'CRITICAL',
      icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
      body: isMr
        ? `🚨 *तातडीचे: सोपान हॉस्पिटल नाशिक स्ट्रोक रॅपिड रिस्पॉन्स*
रुग्णाचे नाव: {{NAME}}
संपर्क: {{PHONE}}
लक्षणे सुरू होण्याची वेळ: मागील ४.५ तासांच्या आत (गोल्डन अवर)
लक्षणे: अचानक चेहऱ्यावर वाक / एका हातापायात अशक्तपणा / बोलण्यात अडखळणे
पत्ता: सोपान हॉस्पिटल आणि न्यूरोलॉजी इन्स्टिट्यूट, मुंबई नाका, नाशिक कडे निघालो आहोत. हेल्पलाईन: ०२५३ २३१७३६४. कृपया स्ट्रोक टीम व आयसीयू सज्ज ठेवावे!`
        : `🚨 *URGENT: STROKE RAPID RESPONSE AT SOPAN HOSPITAL*
Patient Name: {{NAME}}
Contact: {{PHONE}}
Symptom Onset Time: Within last 4.5 hours (Golden Hour)
Symptoms: Sudden facial drooping / arm weakness / slurred speech
Location: En route to Sopan Hospital & Neurology Institute, Shrihari Kute Marg, Near Sandip Hotel, Mumbai Naka, Nashik - 422001. Hotline: 0253 2317364. Please keep Acute Stroke Team & ICU ready!`
    },
    {
      key: 'book-appointment',
      title: isMr ? '📅 डॉक्टर ओपीडी अपॉइंटमेंट नोंदणी' : '📅 Book Specialist Doctor Appointment',
      priority: isMr ? 'नियमित' : 'Standard',
      icon: <Calendar className="w-4 h-4 text-cyan-600" />,
      body: isMr
        ? `नमस्कार सोपान हॉस्पिटल आणि न्यूरोलॉजी इन्स्टिट्यूट,
मला डॉ. संजय सोपान वराडे (MD, DM Neuro) यांच्यासोबत ओपीडी अपॉइंटमेंट नोंदवायची आहे.
रुग्णाचे नाव: {{NAME}}
संपर्क: {{PHONE}}
विभाग: न्यूरोलॉजी / स्ट्रोक / मिरगी / पार्किन्सन्स
तारीख: उद्या / उपलब्ध असणारा सर्वात जवळचा ओपीडी स्लॉट
हॉस्पिटल पत्ता: श्रीहरी कुटे मार्ग, मुंबई नाका, नाशिक
तपशील: {{NOTES}}`
        : `Hello Sopan Hospital & Neurology Institute Desk,
I would like to schedule an Outpatient Appointment with Dr. Sanjay Sopan Varade (MD, DM Neuro).
Patient Name: {{NAME}}
Contact: {{PHONE}}
Department: Neurology / Stroke / Epilepsy / Parkinson's
Preferred Date: Tomorrow / Next Available OPD Slot
Hospital Location: Shrihari Kute Marg, Mumbai Naka, Nashik
Additional Info: {{NOTES}}`
    },
    {
      key: 'mri-second-opinion',
      title: isMr ? '📄 ३२-स्लाईस सीटी / न्यूरो स्कॅन सेकंड ओपिनियन' : '📄 Share 32-Slice CT / Neuro Scan for Second Opinion',
      priority: isMr ? 'प्राधान्य' : 'Priority',
      icon: <FileText className="w-4 h-4 text-purple-600" />,
      body: isMr
        ? `नमस्कार डॉ. संजय सोपान वराडे (MD, DM Neuro, ३५+ वर्षे अनुभव),
मला सोपान हॉस्पिटल नाशिक येथे न्यूरोलॉजिकल सेकंड ओपिनियन घ्यायचे आहे.
रुग्णाचे नाव: {{NAME}}
संपर्क: {{PHONE}}
निदान / स्कॅन: ३२-स्लाईस सीटी ब्रेन / न्यूरो स्कॅन रिपोर्ट सोबत जोडला आहे.
विचारणा: स्ट्रोक प्रतिबंध, मिरगी (फिट्स) नियंत्रण किंवा न्यूरोलॉजी उपचारांसाठी मार्गदर्शन.`
        : `Hello Dr. Sanjay Sopan Varade (MD, DM Neuro, 35+ Yrs Exp),
I would like to request a Neurological Second Opinion at Sopan Hospital Nashik.
Patient Name: {{NAME}}
Phone: {{PHONE}}
Diagnosis / Scan: 32-Slice CT Brain / Neuro scan attached.
Query: Evaluation for stroke prevention, seizure control or neurological management.`
    },
    {
      key: 'tele-consult',
      title: isMr ? '📹 टेलि-न्यूरोलॉजी व्हिडिओ पाठपुरावा' : '📹 Tele-Neurology Video Follow-up',
      priority: isMr ? 'नियमित' : 'Standard',
      icon: <Video className="w-4 h-4 text-blue-600" />,
      body: isMr
        ? `नमस्कार सोपान टेलि-न्यूरोलॉजी डेस्क,
व्हिडिओ कन्सल्टेशन फॉलो-अप लिंक हवी आहे.
रुग्णाचे नाव: {{NAME}}
यूएचआयडी (उपलब्ध असल्यास): SOPAN-NEURO
तपशील: {{NOTES}}`
        : `Hi Sopan Tele-Neurology,
Requesting video consultation follow-up link.
Patient Name: {{NAME}}
UHID (if existing): SOPAN-NEURO
Notes: {{NOTES}}`
    },
    {
      key: 'pharmacy-refill',
      title: isMr ? '💊 औषध पुरवठा आणि होम केअर' : '💊 Prescription Refill & Home Care',
      priority: isMr ? 'नियमित' : 'Standard',
      icon: <Pill className="w-4 h-4 text-emerald-600" />,
      body: isMr
        ? `नमस्कार सोपान हॉस्पिटल फार्मसी,
मला न्यूरोलॉजी औषधांची पुन्हा नोंदणी (रिफिल) करायची आहे.
रुग्णाचे नाव: {{NAME}}
संपर्क: {{PHONE}}
औषधांची यादी / माहिती: {{NOTES}}`
        : `Hello Sopan Hospital Pharmacy,
I need to refill neurology medications.
Patient Name: {{NAME}}
Phone: {{PHONE}}
Prescription items: {{NOTES}}`
    }
  ];

  const currentTemplate = templates.find(t => t.key === selectedTemplateKey) || templates[0];

  const formattedMessage = currentTemplate.body
    .replace('{{NAME}}', patientName.trim() || (isMr ? '[रुग्णाचे नाव]' : '[Patient Name]'))
    .replace('{{PHONE}}', patientPhone.trim() || (isMr ? '[संपर्क नंबर]' : '[Contact Phone]'))
    .replace('{{NOTES}}', customNotes.trim() || (isMr ? 'काही नाही' : 'None specified'));

  const waUrl = `https://wa.me/${hospitalWhatsAppNumber}?text=${encodeURIComponent(formattedMessage)}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-slate-900">
                  {isMr ? 'सोपान न्यूरो २४/७ व्हॉट्सअ‍ॅप डेस्क' : 'Sopan Neuro 24/7 WhatsApp Desk'}
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {isMr ? 'सक्रिय' : 'ONLINE NOW'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                WhatsApp: <span className="font-semibold text-emerald-700">+91 94055 45521</span> • {isMr ? 'तातडीचा स्ट्रोक प्रतिसाद, ओपीडी नोंदणी आणि मार्गदर्शन' : 'Instant triage, stroke emergency alert & consultation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Selector Pills */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            {isMr ? 'चौकशी / आपत्कालीन टेम्पलेट निवडा' : 'Select Inquiry / Emergency Template'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {templates.map(tpl => {
              const isSelected = tpl.key === selectedTemplateKey;
              return (
                <button
                  key={tpl.key}
                  type="button"
                  onClick={() => setSelectedTemplateKey(tpl.key)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500/30'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="shrink-0">{tpl.icon}</span>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold truncate">{tpl.title}</div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {isMr ? 'प्राधान्य' : 'Priority'}: {tpl.priority}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Fields */}
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {isMr ? 'रुग्णाचे पूर्ण नाव' : 'Patient Full Name'}
              </label>
              <input
                type="text"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                placeholder={isMr ? 'उदा. राजेश कुलकर्णी' : 'e.g. Rajesh Kulkarni'}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {isMr ? 'संपर्क फोन नंबर' : 'Contact Phone Number'}
              </label>
              <input
                type="tel"
                value={patientPhone}
                onChange={e => setPatientPhone(e.target.value)}
                placeholder="+91 98230 45678"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              {isMr ? 'अतिरिक्त लक्षणे / नोंदी' : 'Additional Symptoms / Notes'}
            </label>
            <input
              type="text"
              value={customNotes}
              onChange={e => setCustomNotes(e.target.value)}
              placeholder={isMr ? 'उदा. कालपासून तीव्र डोकेदुखी, सीटी स्कॅन रिपोर्ट आहे...' : 'e.g. Headache since yesterday, 32-slice CT scan ready to share...'}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>
        </div>

        {/* Live Message Simulator Preview */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
            <span>{isMr ? 'व्हॉट्सअ‍ॅप संदेश पूर्वावलोकन' : 'WhatsApp Message Preview'}</span>
            <span className="text-emerald-700 font-mono font-semibold">Direct to +91 94055 45521</span>
          </div>
          <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-[#D1D7DB] text-xs font-sans text-slate-900 whitespace-pre-line leading-relaxed shadow-inner">
            <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm max-w-md border border-slate-100">
              {formattedMessage}
              <div className="text-[10px] text-slate-400 text-right mt-1 font-mono">
                {isMr ? 'आत्ताच ✓✓' : 'Just now ✓✓'}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Launch WhatsApp */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{isMr ? 'समर्पित न्यूरो-आयसीयू टीम २ मिनिटांत प्रतिसाद देते' : 'Dedicated Neuro-ICU nurse responds in < 2 minutes'}</span>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isMr ? 'व्हॉट्सअ‍ॅपवर आत्ताच पाठवा' : 'Send via WhatsApp Now'}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
