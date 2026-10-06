import { useState, useEffect } from 'react';
import { getConsultationFee } from '../utils/opdSlotUtils';

/**
 * React hook to reactively subscribe to the active doctor consultation fee.
 * Automatically synchronizes when an administrator updates the fee in the Admin Panel.
 */
export function useConsultationFee(): number {
  const [fee, setFee] = useState<number>(() => getConsultationFee());

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ fee?: number }>;
      setFee(customEvent.detail?.fee ?? getConsultationFee());
    };
    window.addEventListener('sopan_consultation_fee_updated', handleUpdate);
    return () => window.removeEventListener('sopan_consultation_fee_updated', handleUpdate);
  }, []);

  return fee;
}
