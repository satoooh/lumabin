import { app, BrowserWindow, screen } from 'electron';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { e2eRunId, isE2EMode } from './main/e2e-runtime';
import {
  registerApplicationComposition,
  type ApplicationCompositionRuntime,
} from './main/application-composition';

let applicationRuntime: ApplicationCompositionRuntime | null = null;

const toProcessErrorLog = (error: unknown): string => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

process.on('unhandledRejection', (reason) => {
  // Keep this lightweight and secret-safe: a concise reason only.
  console.error(`[main] unhandledRejection: ${toProcessErrorLog(reason)}`);
});

process.on('uncaughtExceptionMonitor', (error, origin) => {
  // Monitor only: do not swallow crash behavior from Node/Electron defaults.
  console.error(
    `[main] uncaughtExceptionMonitor (${origin}): ${toProcessErrorLog(error)}`,
  );
});

const resolveAppIconPath = (): string | null => {
  const candidates = app.isPackaged
    ? [path.join(process.resourcesPath, 'lumabin-logo.png')]
    : [
        path.resolve(__dirname, '../../build/lumabin-logo.png'),
        path.resolve(process.cwd(), 'build/lumabin-logo.png'),
      ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
};

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

if (isE2EMode) {
  const e2eUserDataPath = path.join(app.getPath('userData'), 'e2e', e2eRunId);
  mkdirSync(e2eUserDataPath, { recursive: true });
  app.setPath('userData', e2eUserDataPath);
}

const createWindow = () => {
  const appIconPath = resolveAppIconPath();
  const primaryDisplay = screen.getPrimaryDisplay();
  const workArea = primaryDisplay.workAreaSize;
  const defaultWidth = Math.floor(workArea.width * 0.9);
  const defaultHeight = Math.floor(workArea.height * 0.9);
  const windowWidth = Math.min(workArea.width, Math.min(1440, Math.max(1040, defaultWidth)));
  const windowHeight = Math.min(workArea.height, Math.min(960, Math.max(740, defaultHeight)));

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: Math.min(960, workArea.width),
    minHeight: Math.min(680, workArea.height),
    show: false,
    backgroundColor: '#eef2f7',
    icon: appIconPath ?? undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open DevTools only in development mode.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL && !isE2EMode) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
};

// Register handlers once and then create browser windows.
app.whenReady().then(() => {
  const appIconPath = resolveAppIconPath();
  if (process.platform === 'darwin' && appIconPath) {
    app.dock.setIcon(appIconPath);
  }
  applicationRuntime = registerApplicationComposition();
  createWindow();
});

app.once('before-quit', () => {
  applicationRuntime?.dispose();
  applicationRuntime = null;
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
