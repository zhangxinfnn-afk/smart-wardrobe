'use client';

import { create } from 'zustand';
import type { User, Style, PoseStyle, WeatherData, City } from '@/types';
import { CITIES, getDefaultCity } from '@/lib/cities';

interface AppState {
  // Current selections
  currentUser: User | null;
  currentCity: City;
  currentStyle: Style;
  currentPoseStyle: PoseStyle;
  weather: WeatherData | null;

  // Users list
  users: User[];

  // Actions
  setCurrentUser: (user: User | null) => void;
  setCurrentCity: (city: City) => void;
  setCurrentStyle: (style: Style) => void;
  setCurrentPoseStyle: (style: PoseStyle) => void;
  setWeather: (weather: WeatherData | null) => void;
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  currentCity: getDefaultCity(),
  currentStyle: 'CASUAL',
  currentPoseStyle: 'NATURAL',
  weather: null,
  users: [],

  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentCity: (city) => set({ currentCity: city, weather: null }),
  setCurrentStyle: (style) => set({ currentStyle: style }),
  setCurrentPoseStyle: (style) => set({ currentPoseStyle: style }),
  setWeather: (weather) => set({ weather }),
  setUsers: (users) => set({ users }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
}));
