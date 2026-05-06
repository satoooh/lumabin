import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('dark mode theme policy', () => {
  it('keeps settings selection and preview action icons legible in the photo shell', () => {
    const styles = readFileSync(join(process.cwd(), 'src/index.css'), 'utf8');

    expect(styles).toContain(".app-shell--photos .workspace-settings-nav-button[aria-selected='true']");
    expect(styles).toContain('.app-shell--photos .workspace-settings-nav-button > .pill');
    expect(styles).toContain('.quick-preview-action-tile__icon .action-icon');
    expect(styles).toContain('.app-shell--photos .quick-preview-action-tile__icon .action-icon');
  });
});
