import type { IServersInfo } from '@jupyterhub/jupyter-server-proxy/lib/tokens';
import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ServerConnection } from '@jupyterlab/services';
import { PageConfig, URLExt } from '@jupyterlab/coreutils';
import { Widget } from '@lumino/widgets';
import { CommandRegistry } from '@lumino/commands';
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

namespace CommandIDs {
  /**
   * Opens a process proxied by jupyter-server-proxy (such as VSCode).
   */
  export const openProxy = 'nebari:open-proxy';
  /**
   * Run first enabled command, similar to `apputils:run-first-enabled`,
   * but assumes all properties of the first enabled command.
   */
  export const runFirstEnabled = 'nebari:run-first-enabled';
}

interface IOpenProxyArgs {
  /**
   * Name of the server process to open.
   */
  name?: string;
}

interface ICommandDescription
  extends Omit<CommandRegistry.ICommandOptions, 'execute'> {
  /**
   * The identifier of the command.
   */
  id: string;
  /**
   * The arguments for the command.
   */
  args: any;
}

interface IRunFirstEnabledArgs {
  /**
   * Name of the server process to open.
   */
  commands?: ICommandDescription[];
}

const commandsPlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-nebari-mode:commands',
  description: 'Adds additional commands used by nebari.',
  autoStart: true,
  requires: [],
  activate: async (app: JupyterFrontEnd) => {
    const serverSettings = ServerConnection.makeSettings();
    const baseUrl = PageConfig.getBaseUrl();
    const url = URLExt.join(baseUrl, 'server-proxy/servers-info');
    const response = await ServerConnection.makeRequest(
      url,
      {},
      serverSettings
    );
    if (!response.ok) {
      console.warn('Server proxy info not available');
      return;
    }
    const data = (await response.json()) as IServersInfo;

    const findProcess = (name?: string) => {
      if (!name) {
        return null;
      }
      const matches = data.server_processes.filter(
        process => process.name === name
      );
      if (matches.length === 0) {
        return null;
      }
      return matches[0];
    };

    app.commands.addCommand(CommandIDs.openProxy, {
      execute: (args: IOpenProxyArgs) => {
        const processs = findProcess(args.name);
        if (!processs) {
          throw Error(`Process for ${args.name} not found`);
        }

        const url = `${baseUrl}${processs.launcher_entry.path_info}`;

        if (processs.new_browser_tab) {
          window.open(url, '_blank', 'noopener,noreferrer');
        } else {
          window.location.href = url;
        }
      },
      isEnabled: (args: IOpenProxyArgs) => {
        const processs = findProcess(args.name);
        return !!processs;
      },
      label: (args: IOpenProxyArgs) => {
        const processs = findProcess(args.name);
        return processs
          ? `Open ${processs.launcher_entry.title}`
          : 'Open Proxied Process';
      }
    });

    const returnFirstEnabled = (
      args: IRunFirstEnabledArgs,
      method: 'label' | 'iconClass' | 'caption' | 'usage' | 'className'
    ): string | undefined => {
      const commands = args.commands ?? [];
      for (const command of commands) {
        if (
          app.commands.hasCommand(command.id) &&
          app.commands.isEnabled(command.id, command.args)
        ) {
          return (
            (command[method] as string | undefined) ??
            app.commands[method](command.id, command.args)
          );
        }
      }
    };

    app.commands.addCommand(CommandIDs.runFirstEnabled, {
      execute: (args: IRunFirstEnabledArgs) => {
        const commands = args.commands ?? [];
        for (const command of commands) {
          if (
            app.commands.hasCommand(command.id) &&
            app.commands.isEnabled(command.id, command.args)
          ) {
            return app.commands.execute(command.id, command.args);
          }
        }
      },
      label: (args: IRunFirstEnabledArgs) => {
        return returnFirstEnabled(args, 'label') ?? 'Run First Enabled';
      },
      iconClass: (args: IRunFirstEnabledArgs) => {
        return returnFirstEnabled(args, 'iconClass') ?? '';
      },
      caption: (args: IRunFirstEnabledArgs) => {
        return returnFirstEnabled(args, 'caption') ?? '';
      },
      usage: (args: IRunFirstEnabledArgs) => {
        return returnFirstEnabled(args, 'usage') ?? '';
      },
      className: (args: IRunFirstEnabledArgs) => {
        return returnFirstEnabled(args, 'className') ?? '';
      }
    });
  }
};

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

const plugins = [commandsPlugin, logoPlugin];

export default plugins;
