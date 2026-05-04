export const basenameFromKey = (key: string): string => {
  const segments = key.split('/').filter((segment) => segment.length > 0);
  return segments.at(-1) ?? key;
};

export const parentPrefixFromKey = (key: string): string => {
  const separatorIndex = key.lastIndexOf('/');
  if (separatorIndex < 0) {
    return '';
  }
  return key.slice(0, separatorIndex + 1);
};

export const commonParentPrefixFromKeys = (keys: string[]): string => {
  if (keys.length === 0) {
    return '';
  }

  const parentSegments = keys.map((key) =>
    parentPrefixFromKey(key).split('/').filter((segment) => segment.length > 0),
  );
  const first = parentSegments[0] ?? [];
  const common: string[] = [];

  for (let index = 0; index < first.length; index += 1) {
    const value = first[index];
    if (parentSegments.every((segments) => segments[index] === value)) {
      common.push(value);
      continue;
    }
    break;
  }

  if (common.length === 0) {
    return '';
  }
  return `${common.join('/')}/`;
};
