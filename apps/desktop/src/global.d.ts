import type { LumabinAPI } from './shared/ipc';

declare global {
  interface Window {
    lumabin: LumabinAPI;
  }
}

export {};
