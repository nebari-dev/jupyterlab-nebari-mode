import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the jupyterlab-nebari-mode extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-nebari-mode:plugin',
  description: 'Nebari customizations for JupyterLab.',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlab-nebari-mode is activated!');
  }
};

export default plugin;
