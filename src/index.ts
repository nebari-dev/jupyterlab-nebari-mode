import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { URLExt } from '@jupyterlab/coreutils';
import { Widget } from '@lumino/widgets';
import { nebariIcon } from './icons';

class NebariLogo extends Widget {
  constructor(options: { paths: JupyterFrontEnd.IPaths }) {
    super();
    const paths = options.paths;
    const link = document.createElement('a');
    const hubHost = paths.urls.hubHost || '';
    const hubPrefix = paths.urls.hubPrefix || '';

    link.href = hubHost + URLExt.join(hubPrefix, 'home');
    link.target = '_blank';
    link.className = 'nebariLogo-link';
    this.node.appendChild(link);

    nebariIcon.element({
      container: link,
      elementPosition: 'center',
      margin: '2px 2px 2px 7px',
      height: 'auto',
      width: '22px',
      title: 'Nebari Home'
    });
    this.id = 'jp-MainLogo';
    this.node.addEventListener('pointerover', this);
  }

  handleEvent(event: Event) {
    switch (event.type) {
      case 'pointerover': {
        const mainMenu = document.querySelector('#jp-MainMenu');
        if (!(mainMenu instanceof HTMLElement)) {
          return;
        }
        // Ensure main menu gets blurred to avoid confusing
        // highlight on both the icon AND on the "File" menu entry.
        mainMenu.dispatchEvent(new FocusEvent('focusout'));
      }
    }
  }
}

/**
 * Initialization data for the jupyterlab-nebari-mode extension.
 */
const logoPlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-nebari-mode:logo',
  description: 'Sets the application logo.',
  autoStart: true,
  requires: [ILabShell, JupyterFrontEnd.IPaths],
  activate: (
    app: JupyterFrontEnd,
    shell: ILabShell,
    paths: JupyterFrontEnd.IPaths
  ) => {
    const logo = new NebariLogo({ paths });
    shell.add(logo, 'top', { rank: 0 });
  }
};

export default logoPlugin;
