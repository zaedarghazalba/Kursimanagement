'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export default function DataProvider() {
  const loadFromStorage = useAppStore((state) => state.loadFromStorage);

  useEffect(() => {
    // Load data from localStorage on mount
    loadFromStorage();
  }, [loadFromStorage]);

  return null;
}
