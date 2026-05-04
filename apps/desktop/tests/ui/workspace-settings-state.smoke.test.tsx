import { act, renderHook } from '@testing-library/react';
import type { SetStateAction } from 'react';
import { describe, expect, it } from 'vitest';
import {
  areStringRecordEqual,
  buildPublicAssetUrl,
  initialSettings,
  normalizePublicBaseUrl,
  sanitizePublicBaseUrlInput,
  useWorkspaceSettingsState,
} from '../../src/features/settings/workspace-settings-state';
import type { AppSettings } from '../../src/shared/ipc';

describe('workspace settings state', () => {
  it('normalizes public base URLs without altering the editable input first', () => {
    expect(sanitizePublicBaseUrlInput('  https://cdn.example.com///  ')).toBe(
      'https://cdn.example.com///',
    );
    expect(normalizePublicBaseUrl('  https://cdn.example.com///  ')).toBe(
      'https://cdn.example.com',
    );
  });

  it('builds public asset URLs with path-segment encoding', () => {
    expect(buildPublicAssetUrl('https://cdn.example.com/', 'raw files/東京/image 1.png')).toBe(
      'https://cdn.example.com/raw%20files/%E6%9D%B1%E4%BA%AC/image%201.png',
    );
  });

  it('compares public URL maps by exact key/value pairs', () => {
    expect(areStringRecordEqual({ a: '1', b: '2' }, { b: '2', a: '1' })).toBe(true);
    expect(areStringRecordEqual({ a: '1' }, { a: '1', b: '' })).toBe(false);
    expect(areStringRecordEqual({ a: '1' }, { a: '2' })).toBe(false);
  });

  it('updates and clears the selected profile public URL without touching other profiles', () => {
    let currentSettings: AppSettings = {
      ...initialSettings,
      publicBaseUrls: {
        'profile-2': 'https://cdn.example.com/other',
      },
    };
    const setSettings = (next: SetStateAction<AppSettings>) => {
      currentSettings =
        typeof next === 'function'
          ? (next as (current: AppSettings) => AppSettings)(currentSettings)
          : next;
    };

    const { result } = renderHook(() =>
      useWorkspaceSettingsState({
        savedSettingsSnapshot: initialSettings,
        selectedProfileId: 'profile-1',
        setSettings,
        settings: currentSettings,
      }),
    );

    act(() => {
      result.current.handleSelectedPublicBaseUrlChange('  https://cdn.example.com///  ');
    });
    expect(currentSettings.publicBaseUrls).toEqual({
      'profile-1': 'https://cdn.example.com///',
      'profile-2': 'https://cdn.example.com/other',
    });

    act(() => {
      result.current.handleSelectedPublicBaseUrlChange('  ');
    });
    expect(currentSettings.publicBaseUrls).toEqual({
      'profile-2': 'https://cdn.example.com/other',
    });
  });

  it('exposes explicit commands for workspace defaults without leaking state shape to panels', () => {
    let currentSettings: AppSettings = initialSettings;
    const setSettings = (next: SetStateAction<AppSettings>) => {
      currentSettings =
        typeof next === 'function'
          ? (next as (current: AppSettings) => AppSettings)(currentSettings)
          : next;
    };

    const { result } = renderHook(() =>
      useWorkspaceSettingsState({
        savedSettingsSnapshot: initialSettings,
        selectedProfileId: 'profile-1',
        setSettings,
        settings: currentSettings,
      }),
    );

    act(() => {
      result.current.handleAppearanceChange('dark');
      result.current.handleDefaultConflictPolicyChange('overwrite');
      result.current.handlePresignedUrlTTLSecondsChange(1200);
      result.current.handleUploadOptimizeImagesBeforeUploadChange(true);
    });

    expect(currentSettings).toMatchObject({
      appearance: 'dark',
      defaultConflictPolicy: 'overwrite',
      presignedUrlTTLSeconds: 1200,
      uploadOptimizeImagesBeforeUpload: true,
    });
  });
});
