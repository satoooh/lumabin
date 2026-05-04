export interface UploadCandidate {
  file: File;
  relativePath?: string;
}

const toUploadCandidate = (file: File): UploadCandidate => {
  const fileWithRelativePath = file as File & { webkitRelativePath?: string };
  const relativePath = sanitizeUploadRelativePath(fileWithRelativePath.webkitRelativePath);
  return {
    file,
    relativePath: relativePath || undefined,
  };
};

export const sanitizeUploadRelativePath = (value?: string): string => {
  if (!value) {
    return '';
  }
  return value
    .trim()
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean)
    .join('/');
};

const readFileFromEntry = async (entry: FileSystemFileEntry): Promise<File> => {
  return new Promise<File>((resolve, reject) => {
    entry.file(resolve, reject);
  });
};

const readAllDirectoryEntries = async (
  directory: FileSystemDirectoryEntry,
): Promise<FileSystemEntry[]> => {
  const reader = directory.createReader();
  const entries: FileSystemEntry[] = [];
  let hasMoreEntries = true;
  while (hasMoreEntries) {
    // readEntries returns chunked results; we must keep reading until empty.
    // See: https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryReader/readEntries
    // eslint-disable-next-line no-await-in-loop
    const chunk = await new Promise<FileSystemEntry[]>((resolve, reject) => {
      reader.readEntries(resolve, reject);
    });
    if (chunk.length === 0) {
      hasMoreEntries = false;
      continue;
    }
    entries.push(...chunk);
  }

  return entries;
};

const collectEntryUploadCandidates = async (
  entry: FileSystemEntry,
  parentPath: string,
): Promise<UploadCandidate[]> => {
  if (entry.isFile) {
    const file = await readFileFromEntry(entry as FileSystemFileEntry);
    const relativePath = sanitizeUploadRelativePath(`${parentPath}/${entry.name}`);
    return [{ file, relativePath: relativePath || undefined }];
  }

  if (!entry.isDirectory) {
    return [];
  }

  const directoryPath = sanitizeUploadRelativePath(`${parentPath}/${entry.name}`);
  const entries = await readAllDirectoryEntries(entry as FileSystemDirectoryEntry);
  const children = await Promise.all(
    entries.map((child) => collectEntryUploadCandidates(child, directoryPath)),
  );
  return children.flat();
};

export const collectDroppedUploadCandidates = async (
  dataTransfer: DataTransfer | null,
): Promise<UploadCandidate[]> => {
  if (!dataTransfer) {
    return [];
  }

  const items = Array.from(dataTransfer.items ?? []);
  const entryTasks: Array<Promise<UploadCandidate[]>> = [];
  for (const item of items) {
    const entry = item.webkitGetAsEntry();
    if (!entry) {
      continue;
    }
    entryTasks.push(collectEntryUploadCandidates(entry, ''));
  }

  if (entryTasks.length > 0) {
    const collected = (await Promise.all(entryTasks)).flat();
    if (collected.length > 0) {
      return collected;
    }
  }

  return Array.from(dataTransfer.files ?? []).map(toUploadCandidate);
};

export const collectClipboardUploadCandidates = (
  dataTransfer: DataTransfer | null,
): UploadCandidate[] => {
  if (!dataTransfer) {
    return [];
  }

  const fileItems = Array.from(dataTransfer.items ?? [])
    .filter((item) => item.kind === 'file')
    .map((item) => item.getAsFile())
    .filter((file): file is File => Boolean(file));

  if (fileItems.length > 0) {
    return fileItems.map(toUploadCandidate);
  }

  return Array.from(dataTransfer.files ?? []).map(toUploadCandidate);
};
