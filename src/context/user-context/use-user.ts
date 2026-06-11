"use client";
import { useContext } from 'react';
import { userContext } from './user-context';

export const useUser = () => useContext(userContext);
