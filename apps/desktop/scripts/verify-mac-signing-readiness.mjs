#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const entitlementsPath = path.join(projectRoot, 'build', 'entitlements.darwin.plist');
const enableMacSign = process.env.LUMABIN_ENABLE_MAC_SIGN === '1';
const requiredEntitlements = [
  'com.apple.security.cs.allow-jit',
  'com.apple.security.cs.allow-unsigned-executable-memory',
  'com.apple.security.cs.disable-library-validation',
];
const requiredSigningSecrets = [
  'LUMABIN_APPLE_ID',
  'LUMABIN_APPLE_ID_PASSWORD',
  'LUMABIN_APPLE_TEAM_ID',
];

const fail = (message) => {
  console.error(`[verify-mac-signing-readiness] ${message}`);
  process.exit(1);
};

if (!existsSync(entitlementsPath)) {
  fail(`missing entitlements file: ${entitlementsPath}`);
}

let entitlements;
try {
  entitlements = JSON.parse(execFileSync('/usr/bin/plutil', ['-convert', 'json', '-o', '-', entitlementsPath], { encoding: 'utf8' }));
} catch {
  fail(`invalid entitlements plist: ${entitlementsPath}`);
}

for (const entitlement of requiredEntitlements) {
  if (entitlements[entitlement] !== true) {
    fail(`missing required Electron entitlement: ${entitlement}`);
  }
}

if (!enableMacSign) {
  console.log('[verify-mac-signing-readiness] unsigned release mode');
  console.log('[verify-mac-signing-readiness] Electron entitlements file is present');
  process.exit(0);
}

const missingSecrets = requiredSigningSecrets.filter((key) => !process.env[key]);
if (missingSecrets.length > 0) {
  fail(`missing signing environment variables: ${missingSecrets.join(', ')}`);
}

console.log('[verify-mac-signing-readiness] signed release mode');
console.log('[verify-mac-signing-readiness] notarization credentials are configured');
console.log('[verify-mac-signing-readiness] Electron entitlements file is present');
