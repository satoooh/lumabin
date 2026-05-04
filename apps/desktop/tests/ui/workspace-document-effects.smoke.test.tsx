import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useWorkspaceDocumentEffects } from '../../src/features/layout/use-workspace-document-effects';

const Probe = ({
  appearance,
  selectedProfileId = '',
  selectedProfileName,
}: {
  appearance: 'system' | 'light' | 'dark';
  selectedProfileId?: string;
  selectedProfileName?: string;
}) => {
  useWorkspaceDocumentEffects({
    appearance,
    selectedProfileId,
    selectedProfileName,
  });
  return null;
};

describe('workspace document effects', () => {
  afterEach(() => {
    cleanup();
    document.title = '';
    document.documentElement.style.removeProperty('color-scheme');
  });

  it('sets the window title from the selected profile context', () => {
    const { rerender } = render(<Probe appearance="light" />);

    expect(document.title).toBe('LumaBin — Setup');

    rerender(<Probe appearance="light" selectedProfileId="profile-1" />);
    expect(document.title).toBe('LumaBin — Gallery');

    rerender(
      <Probe
        appearance="light"
        selectedProfileId="profile-1"
        selectedProfileName="Production Assets"
      />,
    );
    expect(document.title).toBe('LumaBin — Production Assets');
  });

  it('applies and cleans up the resolved color scheme', () => {
    const { rerender, unmount } = render(<Probe appearance="dark" />);

    expect(document.documentElement.style.colorScheme).toBe('dark');

    rerender(<Probe appearance="light" selectedProfileId="profile-1" />);
    expect(document.documentElement.style.colorScheme).toBe('light');

    unmount();
    expect(document.documentElement.style.colorScheme).toBe('');
  });
});
