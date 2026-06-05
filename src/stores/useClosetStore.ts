'use client';

import { create } from 'zustand';
import type { Category, Season, Style } from '@/types';

interface ClosetState {
  selectedCategory: Category | 'ALL';
  selectedSeason: Season | 'ALL';
  selectedStyle: Style | 'ALL';
  searchQuery: string;
  showUploadModal: boolean;
  showBatchUpload: boolean;
  editingItem: string | null; // item ID

  setSelectedCategory: (category: Category | 'ALL') => void;
  setSelectedSeason: (season: Season | 'ALL') => void;
  setSelectedStyle: (style: Style | 'ALL') => void;
  setSearchQuery: (query: string) => void;
  setShowUploadModal: (show: boolean) => void;
  setShowBatchUpload: (show: boolean) => void;
  setEditingItem: (id: string | null) => void;
  resetFilters: () => void;
}

export const useClosetStore = create<ClosetState>((set) => ({
  selectedCategory: 'ALL',
  selectedSeason: 'ALL',
  selectedStyle: 'ALL',
  searchQuery: '',
  showUploadModal: false,
  showBatchUpload: false,
  editingItem: null,

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedSeason: (season) => set({ selectedSeason: season }),
  setSelectedStyle: (style) => set({ selectedStyle: style }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setShowUploadModal: (show) => set({ showUploadModal: show }),
  setShowBatchUpload: (show) => set({ showBatchUpload: show }),
  setEditingItem: (id) => set({ editingItem: id }),
  resetFilters: () =>
    set({
      selectedCategory: 'ALL',
      selectedSeason: 'ALL',
      selectedStyle: 'ALL',
      searchQuery: '',
    }),
}));
