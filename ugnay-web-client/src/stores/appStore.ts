import { create } from 'zustand';

interface AppState {
  // These are now used only as client-side caches, initially empty
  manufacturers: never[];
  products: never[];
  vendorRequests: never[];
  manufacturerRequests: never[];
  shipments: never[];
}

const useAppStore = create<AppState>(() => ({
  manufacturers: [],
  products: [],
  vendorRequests: [],
  manufacturerRequests: [],
  shipments: [],
}));

export default useAppStore;
