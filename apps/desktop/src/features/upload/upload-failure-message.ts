export const toUploadFailureMessage = (message?: string): string => {
  if (!message) {
    return '';
  }
  if (/ENOENT|Source file not found/i.test(message)) {
    return 'Source file is missing on disk. Confirm the file still exists, then retry failed files.';
  }
  if (/EACCES|EPERM|permission/i.test(message)) {
    return 'Cannot read source file due to permissions. Check access rights, then retry.';
  }
  return message;
};
