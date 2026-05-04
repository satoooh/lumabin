import { useEffect } from 'react';
import type { Appearance } from '../../shared/ipc';

interface UseWorkspaceDocumentEffectsOptions {
  appearance: Appearance;
  selectedProfileId: string;
  selectedProfileName?: string;
}

const resolveColorScheme = (appearance: Appearance): 'light' | 'dark' => {
  if (appearance !== 'system') {
    return appearance;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useWorkspaceDocumentEffects = ({
  appearance,
  selectedProfileId,
  selectedProfileName,
}: UseWorkspaceDocumentEffectsOptions): void => {
  useEffect(() => {
    const contextLabel = selectedProfileName ?? (selectedProfileId ? 'Gallery' : 'Setup');
    document.title = `LumaBin — ${contextLabel}`;
  }, [selectedProfileId, selectedProfileName]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.colorScheme = resolveColorScheme(appearance);
    return () => {
      root.style.removeProperty('color-scheme');
    };
  }, [appearance]);
};
