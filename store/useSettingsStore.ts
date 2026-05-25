import { create } from "zustand";

interface SettingsState {
  mapProvider: "osm" | "google";
  toggleMapProvider: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  mapProvider: "osm",
  toggleMapProvider: () => set((state) => ({
    mapProvider: state.mapProvider === "osm" ? "google" : "osm"
  })),
}));
