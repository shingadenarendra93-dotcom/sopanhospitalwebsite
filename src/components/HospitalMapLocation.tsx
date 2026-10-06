import React, { useState } from 'react';
import { useConsultationFee } from '../hooks/useConsultationFee';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow 
} from '@vis.gl/react-google-maps';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Phone, 
  Clock, 
  Car, 
  Train, 
  Bus, 
  ShieldCheck, 
  Star, 
  Award, 
  CheckCircle2, 
  Copy, 
  Check, 
  MessageCircle,
  Share2
} from 'lucide-react';

export const SOPAN_HOSPITAL_GOOGLE_MAPS_URL = "https://www.google.com/maps/place/Sopan+Hospital+%26+Neurology+Institute/@19.9646787,73.7887735,13z/data=!4m12!1m5!8m4!1e1!2s115713967598752789730!3m1!1e1!3m5!1s0x3bddeb0e58e88ee5:0x6032c7fcae4624f7!8m2!3d19.9913591!4d73.779113!16s%2Fg%2F1hdzjf1tn?entry=ttu&g_ep=EgoyMDI2MDkzMC4wIKXMDSoASAFQAw%3D%3D";

export const SOPAN_HOSPITAL_DIRECTIONS_URL = "https://www.google.com/maps/dir/?api=1&destination=19.9913591,73.779113";

export const SOPAN_HOSPITAL_REVIEWS_URL = "https://www.google.com/maps/place/Sopan+Hospital+%26+Neurology+Institute/@19.9913591,73.779113,17z/data=!4m8!3m7!1s0x3bddeb0e58e88ee5:0x6032c7fcae4624f7!8m2!3d19.9913591!4d73.779113!9m1!1b1!16s%2Fg%2F1hdzjf1tn";

export const SOPAN_HOSPITAL_COORDINATES = {
  lat: 19.9913591,
  lng: 73.779113
};

interface HospitalMapLocationProps {
  onBookConsultation?: () => void;
  onOpenWhatsApp?: () => void;
}

export const HospitalMapLocation: React.FC<HospitalMapLocationProps> = ({
  onBookConsultation,
  onOpenWhatsApp
}) => {
  const consultationFee = useConsultationFee();
  const [infoWindowOpen, setInfoWindowOpen] = useState<boolean>(true);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const hospitalAddress = "Sopan Hospital & Neurology Institute, Shrihari Kute Marg, Near Sandip Hotel, Mumbai Naka, Nashik, Maharashtra 422001";

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(hospitalAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 3000);
  };

  const handleShareLocation = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sopan Hospital & Neurology Institute, Nashik',
          text: 'Location of Sopan Hospital & Neurology Institute (Dr. Sanjay Sopan Varade) at Mumbai Naka, Nashik',
          url: SOPAN_HOSPITAL_GOOGLE_MAPS_URL
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopyAddress();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-[#2c221a] text-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-[#8E5B3E]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-amber-200 text-xs font-semibold backdrop-blur-xs">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Official Google Maps Location & Navigation</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight text-white">
              Locate Sopan Hospital & Neurology Institute
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Conveniently located at <strong>Mumbai Naka, Nashik</strong> adjacent to Sandip Hotel along the Mumbai-Agra Highway. 
              Equipped with a barrier-free 24/7 emergency stroke ambulance port, dedicated neuro-critical care bays, and verified on Google Maps with a <strong>4.9 ★ rating</strong>.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
            <a
              href={SOPAN_HOSPITAL_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-[#8E5B3E] hover:from-amber-500 hover:to-[#7A4B30] text-white font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Turn-by-Turn Directions</span>
            </a>

            <a
              href={SOPAN_HOSPITAL_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Review on Google Maps (4.9★)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Map & Location Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Google Map */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E6E0D4] overflow-hidden shadow-md flex flex-col">
          
          {/* Map Top Bar */}
          <div className="p-4 sm:p-5 bg-[#FAF7F2] border-b border-[#E6E0D4] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white border border-[#E6E0D4] flex items-center justify-center text-rose-600 shadow-2xs shrink-0">
                <MapPin className="w-5 h-5 fill-rose-500 text-white" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-sm sm:text-base text-[#27231E] flex items-center gap-2">
                  <span>Interactive Google Map</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    GPS Verified
                  </span>
                </h2>
                <p className="text-xs text-[#7A746B]">
                  Coordinates: 19.9913591° N, 73.7791130° E • Mumbai Naka, Nashik
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShareLocation}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F3EFE6] border border-[#DDD5C7] text-xs font-semibold text-[#5C5346] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Share hospital location link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
              <a
                href={SOPAN_HOSPITAL_GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                title="Open in full Google Maps"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Interactive Map Canvas */}
          <div className="relative w-full h-[420px] sm:h-[480px] lg:h-[540px] bg-slate-100">
            {mapsApiKey ? (
              <APIProvider apiKey={mapsApiKey}>
                <Map
                  defaultCenter={SOPAN_HOSPITAL_COORDINATES}
                  defaultZoom={16}
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                  gestureHandling="cooperative"
                  className="w-full h-full"
                >
                  <AdvancedMarker
                    position={SOPAN_HOSPITAL_COORDINATES}
                    onClick={() => setInfoWindowOpen(true)}
                    title="Sopan Hospital & Neurology Institute"
                  >
                    <Pin
                      background="#8E5B3E"
                      borderColor="#ffffff"
                      glyphColor="#ffffff"
                      scale={1.25}
                    />
                  </AdvancedMarker>

                  {infoWindowOpen && (
                    <InfoWindow
                      position={SOPAN_HOSPITAL_COORDINATES}
                      onCloseClick={() => setInfoWindowOpen(false)}
                    >
                      <div className="p-2 max-w-xs text-xs text-slate-800 space-y-2">
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
                          <span>★ 4.9</span>
                          <span className="text-slate-400">(1,420+ Reviews on Google)</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">
                          Sopan Hospital & Neurology Institute
                        </h4>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          Shrihari Kute Marg, Near Sandip Hotel, Mumbai Naka, Nashik 422001
                        </p>
                        <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between gap-2">
                          <a
                            href={SOPAN_HOSPITAL_DIRECTIONS_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                          >
                            <Navigation className="w-3 h-3" />
                            Directions
                          </a>
                          <a
                            href={SOPAN_HOSPITAL_REVIEWS_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
                          >
                            <Star className="w-3 h-3 fill-amber-500" />
                            Reviews
                          </a>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            ) : (
              /* Fallback Interactive Embed if key is loading or offline */
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-50">
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
                  <MapPin className="w-8 h-8 fill-rose-500 text-white" />
                </div>
                <div className="max-w-md">
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    Sopan Hospital & Neurology Institute
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Shrihari Kute Marg, Near Sandip Hotel, Mumbai Naka, Nashik, Maharashtra 422001
                  </p>
                </div>
                <div className="flex gap-3">
                  <a
                    href={SOPAN_HOSPITAL_GOOGLE_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-[#8E5B3E] text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <span>View Location on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Map Footer Toolbar with quick address copy */}
          <div className="p-4 sm:p-5 bg-white border-t border-[#E6E0D4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#5C5346]">
            <div className="flex items-start sm:items-center gap-2">
              <MapPin className="w-4 h-4 text-[#8E5B3E] shrink-0 mt-0.5 sm:mt-0" />
              <span className="font-medium text-[#27231E]">
                {hospitalAddress}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyAddress}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[#7A5338] border border-[#E6E0D4] font-semibold shrink-0 cursor-pointer transition-colors"
            >
              {copiedAddress ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Address Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#8E5B3E]" />
                  <span>Copy Address</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Google Verified Profile & Transit Guide */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Google Verified Review & Rating Card */}
          <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E6E0D4] shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#E6E0D4] flex items-center justify-center p-1.5 shadow-2xs">
                  <svg viewBox="0 0 24 24" className="w-6 h-6">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#27231E]">
                    Google Business Profile
                  </h3>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Verified Medical Center
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 text-amber-500 font-black text-lg">
                  <Star className="w-5 h-5 fill-current" />
                  <span>4.9</span>
                </div>
                <div className="text-[10px] text-[#7A746B] font-semibold">
                  1,420+ Reviews
                </div>
              </div>
            </div>

            <p className="text-xs text-[#635E56] leading-relaxed">
              Rated 4.9 stars by patients across Maharashtra for Dr. Sanjay Sopan Varade's rapid acute stroke intervention, unhurried consultations, and patient-first medical ethics.
            </p>

            <div className="space-y-2.5 pt-1">
              <a
                href={SOPAN_HOSPITAL_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-3 rounded-2xl bg-[#8E5B3E] hover:bg-[#784A31] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Star className="w-4 h-4 fill-white" />
                <span>Write a Google Review</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-200" />
              </a>

              <a
                href={SOPAN_HOSPITAL_GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2.5 rounded-2xl bg-white hover:bg-[#F5EFE6] border border-[#E6E0D4] text-[#27231E] font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Read Verified Google Reviews</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Transportation & Transit Guide */}
          <div className="bg-white rounded-3xl p-6 border border-[#E6E0D4] shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#27231E] flex items-center gap-2">
              <Car className="w-4 h-4 text-[#8E5B3E]" />
              <span>How to Reach Sopan Hospital</span>
            </h3>

            <div className="space-y-3.5 text-xs text-[#5C5346]">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
                <Car className="w-4 h-4 text-[#8E5B3E] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#27231E]">By Road (Highway Access)</div>
                  <p className="text-[11px] text-[#6E6557] mt-0.5">
                    Located right off Mumbai-Agra National Highway (NH-3) at Mumbai Naka junction, adjacent to Sandip Hotel. Seamless vehicular access from Nashik city and outer bypass.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
                <Train className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#27231E]">By Train (Nashik Road Station)</div>
                  <p className="text-[11px] text-[#6E6557] mt-0.5">
                    Approximately 4.5 km from Nashik Road Railway Station (NK). 10 to 12 minutes drive by taxi, auto-rickshaw, or city bus.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
                <Bus className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#27231E]">By Bus (CBS Central Stand)</div>
                  <p className="text-[11px] text-[#6E6557] mt-0.5">
                    Just 1.5 km from Central Bus Stand (CBS) Nashik. Regular local city transport and autos connect in under 5 minutes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900">
                <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-950">24/7 Emergency Stroke Ramp</div>
                  <p className="text-[11px] text-rose-800 mt-0.5">
                    Dedicated zero-delay ambulance bay with direct stretcher elevator leading directly to the 32-slice CT scan and neuro-intervention suite.
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Hotline quick buttons */}
            <div className="pt-2 border-t border-[#EAE3D6] space-y-2">
              <a
                href="tel:02532317364"
                className="w-full px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Emergency Stroke Hotline: 0253 2317364</span>
              </a>

              {onBookConsultation && (
                <button
                  type="button"
                  onClick={onBookConsultation}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[#7A5338] border border-[#E6E0D4] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-[#8E5B3E]" />
                  <span>Book OPD Consultation (₹{consultationFee.toLocaleString('en-IN')})</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
