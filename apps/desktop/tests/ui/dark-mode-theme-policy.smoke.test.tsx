import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('dark mode theme policy', () => {
  it('keeps settings selection, preview action icons, and detail previews legible in the photo shell', () => {
    const styles = readFileSync(join(process.cwd(), 'src/index.css'), 'utf8');

    expect(styles).toContain(".app-shell--photos .workspace-settings-nav-button[aria-selected='true']");
    expect(styles).toContain('.app-shell--photos .workspace-settings-nav-button > .pill');
    expect(styles).toContain('.quick-preview-action-tile__icon .action-icon');
    expect(styles).toContain('.app-shell--photos .quick-preview-action-tile__icon .action-icon');
    expect(styles).toContain('.app-shell--photos .asset-image-preview');
    expect(styles).toContain('.app-shell--photos .asset-csv-preview');
    expect(styles).toContain('.app-shell--photos .destructive-inline-confirmation');
    expect(styles).toContain('.app-shell--photos .asset-kind-badge');
    expect(styles).toContain('.app-shell--photos .kv-list span');
    expect(styles).toContain('background: #0f141b;');
    expect(styles).toContain(
      'background: color-mix(in srgb, var(--surface-3) 74%, transparent);',
    );
  });
});
