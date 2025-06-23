import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { track } from '@vercel/analytics';

export const useAnalytics = () => {
  const [location] = useLocation();
  const prevLocationRef = useRef<string>(location);
  
  useEffect(() => {
    if (location !== prevLocationRef.current) {
      track('page_view', { page: location });
      prevLocationRef.current = location;
    }
  }, [location]);
};