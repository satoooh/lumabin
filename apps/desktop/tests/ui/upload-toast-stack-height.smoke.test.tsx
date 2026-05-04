import {
  cleanup,
  render,
  screen,
} from '@testing-library/react';
import {
  useRef,
} from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { useUploadToastStackHeight } from '../../src/features/upload/use-upload-toast-stack-height';

const Probe = ({ progress = 0 }: { progress?: number }) => {
  const appShellRef = useRef<HTMLElement | null>(null);
  const uploadToastRef = useRef<HTMLElement | null>(null);

  useUploadToastStackHeight({
    appShellRef,
    isUploadToastExpanded: true,
    showUploadToast: true,
    uploadSummaryProgress: progress,
    uploadSummaryStatus: 'running',
    uploadToastRef,
  });

  const setUploadToastRef = (node: HTMLElement | null) => {
    if (node) {
      Object.defineProperty(node, 'offsetHeight', {
        configurable: true,
        value: 42.4,
      });
    }
    uploadToastRef.current = node;
  };

  return (
    <main ref={appShellRef} data-testid="app-shell">
      <section ref={setUploadToastRef}>Upload toast</section>
    </main>
  );
};

describe('upload toast stack height hook', () => {
  afterEach(() => {
    cleanup();
  });

  it('syncs the upload toast height into the app shell CSS variable', () => {
    render(<Probe />);

    expect(screen.getByTestId('app-shell').style.getPropertyValue('--upload-toast-stack-height')).toBe(
      '42px',
    );
  });

  it('removes the CSS variable on cleanup', () => {
    const { unmount } = render(<Probe progress={10} />);
    const appShell = screen.getByTestId('app-shell');

    unmount();

    expect(appShell.style.getPropertyValue('--upload-toast-stack-height')).toBe('');
  });
});
