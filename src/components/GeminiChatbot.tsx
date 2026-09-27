import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Search, 
  MapPin, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  User, 
  Phone, 
  ChevronDown,
  Layers,
  Zap,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { saveChatMessageToFirestore } from '../lib/firebase';
import { SopanLogo } from './SopanLogo';

interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  model?: string;
  timestamp: string;
  sources?: Array<{ title: string; uri: string }>;
  places?: Array<{ title: string; uri: string }>;
  searchQueries?: string[];
  isAudioTranscribed?: boolean;
}

export const GeminiChatbot: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'model',
      content: language === 'mr'
        ? `नमस्कार! मी सोपान हॉस्पिटल न्यूरोलॉजी इन्स्टिट्यूटचा अधिकृत एआय सहाय्यक आहे. डॉ. संजय सोपान वराडे (MD, DM Neuro) यांच्या मार्गदर्शनाखाली मी रुग्णांना मेंदू व मज्जारज्जूच्या आजारांविषयी, ओपीडी वेळ व उपचारांबद्दल माहिती देतो.\n\nमी तुम्हाला कशी मदत करू शकेन?\n- पक्षाघात (स्ट्रोक), डोकेदुखी, फिट्स (मिरगी), चक्कर येणे यांसारखी लक्षणे\n- ओपीडी वेळ आणि अपॉइंटमेंट बुकिंग प्रक्रिया (फी: ₹१,५००)\n- मुंबई नाका नाशिक येथील पत्ता आणि मार्ग (गुगल मॅप्स)\n- नवीनतम वैद्यकीय संशोधन (गुगल सर्च)\n- किंवा मायक्रोफोन बटण दाबून थेट बोलून विचारू शकता!`
        : `Hello! I am the **Sopan Hospital AI Neurology & Patient Navigator**, specialized in clinical guidance for Dr. Sanjay Sopan Varade (MD, DM Neuro) at Mumbai Naka, Nashik.\n\nHow may I assist you today? You can ask about:\n- Common symptoms (headaches, seizures, dizziness, nerve pain)\n- OPD timings & scheduling guidelines\n- Directions & hospital amenities via **Google Maps**\n- Latest neurological breakthroughs via **Google Search**\n- Or click the **Microphone** to speak your symptoms, or switch to **Live Voice Mode**!`,
      model: 'gemini-3.5-flash',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [groundingMode, setGroundingMode] = useState<'standard' | 'search' | 'maps'>('standard');
  
  // Audio Recording & Transcription State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Live Voice Mode State (gemini-3.8-live)
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [liveStatus, setLiveStatus] = useState<string>('disconnected');
  const liveWsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || loading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Persist to user Firestore if signed in
    if (user?.uid) {
      saveChatMessageToFirestore(user.uid, {
        role: 'user',
        content: promptText,
        model: selectedModel
      });
    }

    try {
      if (groundingMode === 'search') {
        // Google Search Grounding with gemini-3.5-flash
        const res = await fetch('/api/gemini/search-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptText, language })
        });
        const data = await res.json();

        const modelMsg: ChatMessage = {
          id: 'model-' + Date.now(),
          role: 'model',
          content: data.text || 'No response returned from search grounding.',
          model: 'gemini-3.5-flash (Google Search Grounded)',
          sources: data.sources || [],
          searchQueries: data.searchQueries || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, modelMsg]);

        if (user?.uid) {
          saveChatMessageToFirestore(user.uid, {
            role: 'model',
            content: modelMsg.content,
            model: 'gemini-3.5-flash (Search)',
            groundingType: 'search',
            sources: data.sources
          });
        }
      } else if (groundingMode === 'maps') {
        // Google Maps Grounding with gemini-3.5-flash
        let userLocation = { latitude: 19.9975, longitude: 73.7898 };
        if (navigator.geolocation) {
          try {
            await new Promise<void>((resolve) => {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  userLocation = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                  };
                  resolve();
                },
                () => resolve(),
                { timeout: 3000 }
              );
            });
          } catch (e) {
            // fallback to default
          }
        }

        const res = await fetch('/api/gemini/maps-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptText, userLocation, language })
        });
        const data = await res.json();

        const modelMsg: ChatMessage = {
          id: 'model-' + Date.now(),
          role: 'model',
          content: data.text || 'No location details returned.',
          model: 'gemini-3.5-flash (Google Maps Grounded)',
          places: data.places || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, modelMsg]);

        if (user?.uid) {
          saveChatMessageToFirestore(user.uid, {
            role: 'model',
            content: modelMsg.content,
            model: 'gemini-3.5-flash (Maps)',
            groundingType: 'maps',
            sources: data.places
          });
        }
      } else {
        // Multi-turn conversation with chosen model (gemini-3.5-flash, gemini-3.1-pro-preview, gemini-3.1-flash-lite)
        const chatHistory = [...messages, userMsg].map(m => ({
          role: m.role,
          content: m.content
        }));

        const res = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: chatHistory,
            model: selectedModel,
            language
          })
        });
        const data = await res.json();

        const modelMsg: ChatMessage = {
          id: 'model-' + Date.now(),
          role: 'model',
          content: data.text || 'Thank you for your inquiry. Please consult with our neuro reception desk at 0253 2317364 for immediate assistance.',
          model: data.model || selectedModel,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, modelMsg]);

        if (user?.uid) {
          saveChatMessageToFirestore(user.uid, {
            role: 'model',
            content: modelMsg.content,
            model: modelMsg.model || selectedModel
          });
        }
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'system',
          content: `⚠️ Note: An error occurred while communicating with the AI service. If this persists, please contact Sopan Hospital Directly at 0253 2317364. (${err.message})`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // --- AUDIO RECORDING & TRANSCRIPTION (gemini-3.5-transcribe) ---
  const handleToggleRecord = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
        const recorder = new MediaRecorder(stream, { mimeType });

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = async () => {
          stream.getTracks().forEach(t => t.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          await transcribeAudioBlob(audioBlob, mimeType);
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Microphone access denied or error:', err);
        alert('Microphone permission required for audio transcription.');
      }
    }
  };

  const transcribeAudioBlob = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const res = await fetch('/api/gemini/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioBase64: base64data, mimeType })
        });
        const data = await res.json();
        if (data.text) {
          setInput(data.text);
        }
        setIsTranscribing(false);
      };
    } catch (err) {
      console.error('Failed to transcribe audio:', err);
      setIsTranscribing(false);
    }
  };

  // --- LIVE API (gemini-3.8-live) WEBSOCKET ---
  const handleToggleLiveMode = async () => {
    if (isLiveActive) {
      // Close WebSocket
      if (liveWsRef.current) {
        liveWsRef.current.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      setIsLiveActive(false);
      setLiveStatus('disconnected');
    } else {
      setIsLiveActive(true);
      setLiveStatus('connecting');

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      liveWsRef.current = ws;

      try {
        const audioCtx = new AudioContext({ sampleRate: 24000 });
        audioContextRef.current = audioCtx;

        ws.onopen = () => {
          setLiveStatus('connected');
        };

        ws.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'info') {
              alert(data.message);
            } else if (data.audio) {
              // Playback 24kHz raw PCM or audio
              playRawPcm(audioCtx, data.audio);
            }
          } catch (e) {
            console.error('Error handling live message:', e);
          }
        };

        ws.onerror = (err) => {
          console.warn('Live WebSocket warning/error:', err);
          setLiveStatus('error');
        };

        ws.onclose = () => {
          setIsLiveActive(false);
          setLiveStatus('disconnected');
        };
      } catch (err) {
        console.error('Error initializing live audio context:', err);
        setIsLiveActive(false);
      }
    }
  };

  const playRawPcm = (audioCtx: AudioContext, base64Pcm: string) => {
    try {
      const binaryString = atob(base64Pcm);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }
      const buffer = audioCtx.createBuffer(1, float32.length, 24000);
      buffer.copyToChannel(float32, 0);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start();
    } catch (e) {
      console.error('Failed to play raw PCM chunk:', e);
    }
  };

  return (
    <div className="bg-[#FAF7F2] border border-[#E6E0D4] rounded-3xl shadow-sm overflow-hidden flex flex-col h-[750px] max-h-[85vh]">
      {/* Top Header */}
      <div className="bg-white border-b border-[#E6E0D4] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-2xl bg-[#FAF7F2] border border-[#E6E0D4] shadow-2xs shrink-0">
            <SopanLogo size="sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#27231E]">
                {t('chat.title')}
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                ● {t('chat.online')}
              </span>
            </div>
            <p className="text-[11px] text-[#635E56] line-clamp-1">
              {t('chat.subtitle')}
            </p>
          </div>
        </div>

        {/* Right Header Controls: Model Selector & Live Voice */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as any)}
            className="h-9 bg-[#FAF7F2] border border-[#D8CFC2] text-[#27231E] rounded-xl px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#8E5B3E]"
            title="Select Gemini Intelligence Engine"
          >
            <option value="gemini-3.5-flash">Gemini 3.5 Flash (Balanced)</option>
            <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Complex Reasoning)</option>
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Ultra-fast)</option>
          </select>

          {/* Live Voice API Button */}
          <button
            onClick={handleToggleLiveMode}
            className={`h-9 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs shrink-0 ${
              isLiveActive
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {isLiveActive ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                {t('chat.end_voice')}
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                {t('chat.live_voice')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub-toolbar: Grounding Tabs */}
      <div className="bg-[#FAF7F2] border-b border-[#E6E0D4] px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none shrink-0 text-xs">
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-[#E6E0D4] shrink-0 shadow-2xs">
          <button
            onClick={() => setGroundingMode('standard')}
            className={`h-7 px-3 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              groundingMode === 'standard'
                ? 'bg-[#342E28] text-white shadow-2xs'
                : 'text-[#635E56] hover:text-[#27231E]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            {t('chat.general_triage')}
          </button>
          <button
            onClick={() => setGroundingMode('search')}
            className={`h-7 px-3 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              groundingMode === 'search'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-[#635E56] hover:text-[#27231E]'
            }`}
            title="Ground response with live Google Search"
          >
            <Globe className="w-3 h-3" />
            {t('chat.search_grounding')}
          </button>
          <button
            onClick={() => setGroundingMode('maps')}
            className={`h-7 px-3 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              groundingMode === 'maps'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-[#635E56] hover:text-[#27231E]'
            }`}
            title="Ground response with live Google Maps"
          >
            <MapPin className="w-3 h-3" />
            {t('chat.maps_grounding')}
          </button>
        </div>

        <div className="text-[11px] text-[#7A746B] hidden sm:flex items-center gap-1.5 shrink-0">
          <span>Dr. Sanjay Sopan Varade Clinic</span>
          <span>•</span>
          <span className="text-[#8E5B3E] font-medium">OPD Fee ₹1,500</span>
        </div>
      </div>

      {/* Live Voice Banner (Active Mode) */}
      {isLiveActive && (
        <div className="bg-emerald-900 text-white px-4 py-2 text-xs flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold">
              Live Voice Conversation Active (gemini-3.8-live)
            </span>
            <span className="text-emerald-200">
              — Status: {liveStatus}
            </span>
          </div>
          <span className="text-[11px] text-emerald-200">
            Real-time low-latency bidirectional voice stream
          </span>
        </div>
      )}

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role !== 'user' && (
              <div className="w-8 h-8 rounded-full bg-white border border-[#D8CFC2] flex items-center justify-center shrink-0 shadow-2xs mt-1">
                <SopanLogo size="xs" />
              </div>
            )}

            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-2xs text-xs ${
              msg.role === 'user'
                ? 'bg-[#342E28] text-white rounded-tr-xs'
                : msg.role === 'system'
                ? 'bg-amber-50 border border-amber-200 text-amber-950 rounded-tl-xs'
                : 'bg-white border border-[#E6E0D4] text-[#27231E] rounded-tl-xs'
            }`}>
              {/* Header badge if model */}
              {msg.role === 'model' && (
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-2 text-[10px] text-[#8E5B3E] font-medium">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {msg.model || selectedModel}
                  </span>
                  <span className="text-slate-400">{msg.timestamp}</span>
                </div>
              )}

              {/* Message text with formatting */}
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>

              {/* Search Grounding Sources Links */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Verified Google Search Citations:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-[11px] transition-colors border border-blue-100"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">{src.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Maps Grounding Places Links */}
              {msg.places && msg.places.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Google Maps Locations & Directions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.places.map((place, i) => (
                      <a
                        key={i}
                        href={place.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-medium text-[11px] transition-colors border border-emerald-100"
                      >
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span className="truncate max-w-[220px]">{place.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {msg.role === 'user' && (
                <div className="text-right text-[10px] text-slate-300 mt-1">
                  {msg.timestamp}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-[#8E5B3E] text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-white border border-[#D8CFC2] flex items-center justify-center shrink-0 shadow-2xs">
              <SopanLogo size="xs" />
            </div>
            <div className="bg-white border border-[#E6E0D4] rounded-2xl rounded-tl-xs p-3.5 shadow-2xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8E5B3E] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#8E5B3E] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#8E5B3E] animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-[#635E56] font-medium ml-1">
                {groundingMode === 'search'
                  ? 'Searching Google research sources...'
                  : groundingMode === 'maps'
                  ? 'Consulting Google Maps routing...'
                  : `Thinking with ${selectedModel}...`}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="bg-white/60 px-4 py-2 border-t border-[#E6E0D4] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
        <span className="text-[#8E5B3E] font-bold shrink-0">{t('chat.quick_ask')}</span>
        {(language === 'mr' ? [
          'पक्षाघाताची (स्ट्रोक) प्राथमिक धोक्याची लक्षणे कोणती?',
          'मुंबई नाका येथून सोपान हॉस्पिटल कसे पोहोचावे?',
          'डॉ. संजय वराडे यांच्या ओपीडीच्या वेळा आणि फी काय आहे?',
          'पार्किन्सन्स आजारावरील प्रगत उपचार आणि डीबीएस (DBS)',
          'मेंदूची ईईजी (EEG) आणि सीटी स्कॅनसाठी काय तयारी करावी?'
        ] : [
          'What are acute stroke emergency signs?',
          'How do I reach Sopan Hospital from Mumbai Naka?',
          'What are Dr. Sanjay Varade OPD hours and fees?',
          'Latest research on Parkinson DBS therapy',
          'Preparation required for Brain EEG and CT Angiography'
        ]).map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#EFE9DF] border border-[#E6E0D4] text-[#4E443A] whitespace-nowrap transition-colors shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Input Bar with Audio Transcription & Send */}
      <div className="p-3 bg-white border-t border-[#E6E0D4]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Audio Microphone Transcription Button (gemini-3.5-transcribe) */}
          <button
            type="button"
            onClick={handleToggleRecord}
            disabled={isTranscribing}
            className={`h-10 w-10 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
              isRecording
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : isTranscribing
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-[#FAF7F2] hover:bg-[#EFE9DF] border-[#D8CFC2] text-[#4E443A]'
            }`}
            title={
              isRecording
                ? (language === 'mr' ? 'रेकॉर्डिंग थांबवण्यासाठी क्लिक करा' : 'Click to stop recording and transcribe')
                : (language === 'mr' ? 'मायक्रोफोन द्वारे बोला आणि शब्द रूपांतरित करा (gemini-3.5-transcribe)' : 'Click to record microphone audio and transcribe via gemini-3.5-transcribe')
            }
          >
            {isRecording ? (
              <MicOff className="w-4 h-4" />
            ) : isTranscribing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isRecording
                ? (language === 'mr' ? 'आवाज ऐकत आहे... रूपांतरणासाठी पुन्हा मायक्रोफोनवर क्लिक करा' : 'Listening to microphone... click mic again to transcribe')
                : isTranscribing
                ? (language === 'mr' ? 'gemini-3.5-transcribe द्वारे आवाज मजकुरात बदलत आहे...' : 'Transcribing audio with gemini-3.5-transcribe...')
                : t('chat.input_placeholder')
            }
            disabled={loading || isTranscribing}
            className="flex-1 h-10 bg-[#FAF7F2] border border-[#D8CFC2] rounded-xl px-4 text-xs text-[#27231E] focus:outline-none focus:ring-1 focus:ring-[#8E5B3E] placeholder-[#8E867A]"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-10 px-4 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t('chat.send')}</span>
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-[#8E867A]">
          <span>
            {user ? (
              <span className="text-emerald-700 font-medium">
                ✓ Signed in as {user.displayName || user.email} (Chat synced to Firestore)
              </span>
            ) : (
              <span>Sign in with Google to persist your AI consultation history</span>
            )}
          </span>
          <span className="flex items-center gap-1 font-semibold text-rose-700">
            <Phone className="w-3 h-3" />
            Acute Stroke Hotline: 0253 2317364
          </span>
        </div>
      </div>
    </div>
  );
};
