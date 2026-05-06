import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import path from 'node:path';

const buildBundleId = process.env.LUMABIN_APP_BUNDLE_ID ?? 'com.satoooh.lumabin';
const enableMacSign = process.env.LUMABIN_ENABLE_MAC_SIGN === '1';
const appleId = process.env.LUMABIN_APPLE_ID;
const appleIdPassword = process.env.LUMABIN_APPLE_ID_PASSWORD;
const appleTeamId = process.env.LUMABIN_APPLE_TEAM_ID;
const appleSignIdentity = process.env.LUMABIN_APPLE_SIGN_IDENTITY;
const darwinEntitlementsPath = path.resolve(__dirname, 'build/entitlements.darwin.plist');

const vitePackageRuntimeAllowlist = (filePath: string): boolean => {
  if (!filePath) {
    return false;
  }

  return !(
    filePath.startsWith('/.vite') ||
    filePath === '/package.json' ||
    filePath.startsWith('/node_modules')
  );
};

const notarizeCredentials =
  enableMacSign && appleId && appleIdPassword && appleTeamId
    ? {
        appleId,
        appleIdPassword,
        teamId: appleTeamId,
      }
    : undefined;

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    appBundleId: buildBundleId,
    icon: path.resolve(__dirname, 'build/icon'),
    ignore: vitePackageRuntimeAllowlist,
    extraResource: [path.resolve(__dirname, 'build/lumabin-logo.png')],
    osxSign: enableMacSign
      ? {
          identity: appleSignIdentity,
          optionsForFile: () => ({
            entitlements: darwinEntitlementsPath,
            hardenedRuntime: true,
          }),
        }
      : undefined,
    osxNotarize: notarizeCredentials,
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
