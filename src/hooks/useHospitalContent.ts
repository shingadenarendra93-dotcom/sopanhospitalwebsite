import { useState, useEffect } from 'react';
import { 
  HospitalContentSettings, 
  DEFAULT_HOSPITAL_CONTENT, 
  subscribeToHospitalSettings, 
  saveHospitalSettingsToFirestore 
} from '../lib/firebase';

/**
 * React hook to reactively subscribe to the active hospital settings and home page content.
 * Synchronizes in real-time across all connected devices via Firestore onSnapshot.
 */
export function useHospitalContent() {
  const [content, setContent] = useState<HospitalContentSettings>(DEFAULT_HOSPITAL_CONTENT);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToHospitalSettings((updatedSettings) => {
      setContent(updatedSettings);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const updateContent = async (newContent: Partial<HospitalContentSettings>, adminUser?: { username?: string; email?: string }) => {
    return await saveHospitalSettingsToFirestore({
      ...newContent,
      updatedBy: adminUser?.username || 'Hospital Administrator'
    });
  };

  return {
    content,
    loading,
    updateContent
  };
}

export default useHospitalContent;
