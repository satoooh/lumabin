import './index.css';
import lumabinLogoMark from './assets/lumabin-logo-mark.svg';
import { useMemo } from 'react';
import { AppOverlays } from './features/layout/app-overlays';
import { AppTopbar } from './features/layout/app-topbar';
import { StatusStrip } from './features/layout/status-strip';
import { WorkspaceCenterPane } from './features/layout/workspace-center-pane';
import { createDesktopApiGateway } from './features/shared/desktop-api-gateway';
import { useDesktopWorkbench } from './features/workbench/use-desktop-workbench';

export const App = () => {
  const desktopApi = useMemo(() => createDesktopApiGateway(window.lumabin), []);
  const workbench = useDesktopWorkbench({
    desktopApi,
    isDevEnv: import.meta.env.DEV,
    logoSrc: lumabinLogoMark,
  });

  return (
    <main
      ref={workbench.appShellRef}
      className={workbench.appShellClassName}
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <AppTopbar {...workbench.appTopbarProps} />

      <StatusStrip {...workbench.statusStripProps} />

      <section
        id="main-content"
        className={`workspace ${workbench.isWorkspaceFocused ? 'workspace--focus' : ''}`}
        inert={workbench.isWorkspaceInert}
        tabIndex={-1}
      >
        <WorkspaceCenterPane {...workbench.workspaceCenterPaneProps} />
      </section>

      <AppOverlays {...workbench.appOverlaysProps} />
    </main>
  );
};
