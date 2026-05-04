import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QuickPreviewActionButton } from '../../src/features/preview/quick-preview-action-button';

describe('quick preview action button', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders accessible copy, badge, and busy state', () => {
    render(
      <QuickPreviewActionButton
        ariaLabel="Copy public URL"
        title="Public URL"
        description="Stable workspace URL"
        badge="Public"
        isBusy
        icon={<svg aria-hidden="true" />}
        onClick={vi.fn()}
      />,
    );

    const button = screen.getByRole('button', { name: 'Copy public URL' });
    expect(button.getAttribute('aria-description')).toBe('Stable workspace URL');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(screen.getByText('Public URL')).toBeTruthy();
    expect(screen.getByText('Public')).toBeTruthy();
  });

  it('uses title as the accessible name by default', () => {
    const onClick = vi.fn();
    render(
      <QuickPreviewActionButton
        title="Rename asset"
        description="Keep the current location"
        icon={<svg aria-hidden="true" />}
        onClick={onClick}
      />,
    );

    screen.getByRole('button', { name: 'Rename asset' }).click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
