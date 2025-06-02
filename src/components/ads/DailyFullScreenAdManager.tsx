
"use client";

import { useState, useEffect } from 'react';
import { FullScreenAdPlaceholder } from './FullScreenAdPlaceholder';

const AD_STORAGE_KEY = 'ekoAdLastShownTimestamp';
const AD_COOLDOWN_PERIOD = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function DailyFullScreenAdManager() {
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastShownTimestamp = localStorage.getItem(AD_STORAGE_KEY);
      const now = Date.now();

      if (!lastShownTimestamp || (now - parseInt(lastShownTimestamp, 10)) > AD_COOLDOWN_PERIOD) {
        setShowAd(true);
      }
    }
  }, []);

  const handleAdClose = () => {
    setShowAd(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(AD_STORAGE_KEY, Date.now().toString());
    }
  };

  return <FullScreenAdPlaceholder isOpen={showAd} onClose={handleAdClose} />;
}
