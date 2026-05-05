#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import {
  validateReleaseEvidence,
  validateReleaseEvidenceArtifact,
} from './release-evidence-policy.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');

const evidencePath = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.join(projectRoot, 'out', 'make', 'release-evidence.json');

const evidence = JSON.parse(readFileSync(evidencePath, 'utf8'));
validateReleaseEvidence(evidence);
validateReleaseEvidenceArtifact({ evidence, projectRoot });

console.log(`Release evidence validation passed: ${evidencePath}`);
