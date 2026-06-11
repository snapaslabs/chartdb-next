"use client";
import { useContext } from 'react';
import { realtimeContext } from './realtime-context';

export const useRealtime = () => useContext(realtimeContext);
