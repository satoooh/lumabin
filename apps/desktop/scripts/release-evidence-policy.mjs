import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const REQUIRED_TRUE_VERIFICATION_KEYS = [
  'zipIncludesAppAsar',
  'zipIncludesIcon',
  'extractedAppBundle',
  'extractedAppAsar',
  'extractedIcon',
  'extractedExecutable',
  'extractedInfoPlist',
  'bundleMetadata',
  'codesign',
];

const SIGNED_ONLY_VERIFICATION_KEYS = [
  'developerIdAuthority',
  'hardenedRuntime',
  'teamIdentifier',
  'spctlAssess',
  'staplerValidate',
];

const assertCondition = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const assertNonEmptyString = (value, fieldName) => {
  assertCondition(typeof value === 'string' && value.length > 0, `${fieldName} must be a non-empty string`);
};

const assertObject = (value, fieldName) => {
  assertCondition(value !== null && typeof value === 'object' && !Array.isArray(value), `${fieldName} must be an object`);
};

export const validateReleaseEvidence = (evidence) => {
  assertObject(evidence, 'release evidence');
  assertCondition(evidence.schemaVersion === 1, 'schemaVersion must be 1');
  assertNonEmptyString(evidence.generatedAt, 'generatedAt');
  assertCondition(!Number.isNaN(Date.parse(evidence.generatedAt)), 'generatedAt must be a valid timestamp');

  assertObject(evidence.app, 'app');
  assertNonEmptyString(evidence.app.name, 'app.name');
  assertNonEmptyString(evidence.app.packageName, 'app.packageName');
  assertNonEmptyString(evidence.app.version, 'app.version');

  assertObject(evidence.target, 'target');
  assertCondition(evidence.target.platform === 'darwin', 'target.platform must be darwin');
  assertCondition(evidence.target.arch === 'arm64', 'target.arch must be arm64');

  assertObject(evidence.signing, 'signing');
  assertCondition(
    evidence.signing.mode === 'signed' || evidence.signing.mode === 'unsigned-ad-hoc',
    'signing.mode must be signed or unsigned-ad-hoc',
  );
  assertNonEmptyString(evidence.signing.bundleId, 'signing.bundleId');

  assertObject(evidence.artifact, 'artifact');
  assertNonEmptyString(evidence.artifact.path, 'artifact.path');
  assertNonEmptyString(evidence.artifact.fileName, 'artifact.fileName');
  assertCondition(evidence.artifact.fileName.endsWith('.zip'), 'artifact.fileName must end with .zip');
  assertCondition(
    /^[a-f0-9]{64}$/.test(evidence.artifact.sha256),
    'artifact.sha256 must be a lowercase SHA-256 digest',
  );

  assertObject(evidence.bundle, 'bundle');
  assertNonEmptyString(evidence.bundle.bundleId, 'bundle.bundleId');
  assertNonEmptyString(evidence.bundle.bundleName, 'bundle.bundleName');
  assertNonEmptyString(evidence.bundle.shortVersion, 'bundle.shortVersion');
  assertCondition(evidence.bundle.bundleId === evidence.signing.bundleId, 'bundle.bundleId must match signing.bundleId');
  assertCondition(evidence.bundle.bundleName === evidence.app.name, 'bundle.bundleName must match app.name');
  assertCondition(evidence.bundle.shortVersion === evidence.app.version, 'bundle.shortVersion must match app.version');

  assertObject(evidence.verification, 'verification');
  for (const key of REQUIRED_TRUE_VERIFICATION_KEYS) {
    assertCondition(evidence.verification[key] === true, `verification.${key} must be true`);
  }

  if (evidence.signing.mode === 'signed') {
    assertNonEmptyString(evidence.signing.authority, 'signing.authority');
    assertCondition(
      evidence.signing.authority.startsWith('Developer ID Application:'),
      'signing.authority must be a Developer ID Application authority',
    );
    assertNonEmptyString(evidence.signing.teamIdentifier, 'signing.teamIdentifier');
    assertCondition(evidence.signing.hardenedRuntime === true, 'signing.hardenedRuntime must be true');
    for (const key of SIGNED_ONLY_VERIFICATION_KEYS) {
      assertCondition(evidence.verification[key] === true, `verification.${key} must be true for signed releases`);
    }
  } else {
    assertCondition(evidence.signing.authority === null, 'signing.authority must be null for unsigned releases');
    assertCondition(evidence.signing.teamIdentifier === null, 'signing.teamIdentifier must be null for unsigned releases');
    assertCondition(evidence.signing.hardenedRuntime === null, 'signing.hardenedRuntime must be null for unsigned releases');
    for (const key of SIGNED_ONLY_VERIFICATION_KEYS) {
      assertCondition(
        evidence.verification[key] === 'not-required',
        `verification.${key} must be not-required for unsigned releases`,
      );
    }
  }

  assertObject(evidence.github, 'github');
};

export const validateReleaseEvidenceArtifact = ({ evidence, projectRoot }) => {
  assertNonEmptyString(projectRoot, 'projectRoot');
  const artifactPath = path.resolve(projectRoot, evidence.artifact.path);
  assertCondition(existsSync(artifactPath), `artifact referenced by release evidence does not exist: ${artifactPath}`);
  assertCondition(
    path.basename(artifactPath) === evidence.artifact.fileName,
    'artifact.fileName must match the artifact.path basename',
  );

  const digest = createHash('sha256').update(readFileSync(artifactPath)).digest('hex');
  assertCondition(digest === evidence.artifact.sha256, 'artifact.sha256 does not match the referenced zip');
};
