# Nautobot Dev Helper

Visual Studio Code extension to assist in performing common tasks for Nautobot developers.

## Features

Commands:
* `openWeb` - Pop open a web-browser to a locally running nautobot admin.
* `openSeleniumVNC` - Will pop open default VNC viewer to a locally running selenium container.
* `start` - Start a local nautobot instance, depending on the open nautobot apps open in your workspace.
* `invoke` - Will run any invoke task in one of the nautobot folders in your workspace.

Snippets:
* Prefixed with `nautobot-*` hope to continually add useful usable Nautobot snippets. See the `snipppets/nautobot.json` file.

CodeLens:
* Adds side-bar links above certain code-patterns. Example: Link to the Jobs developer documentation above a Job class definition.

## Local Development

* Hit `F5` to kick off the `Run Extension` launch task, this will open up a new window.
* In the new window, open the nautobot core repository or any of the nautobot apps that have an invoke `tasks.py` sitting at the root.
* You can set breakpoints in the original window. Any changes you make to the code, you must refresh the new window.
* Quick Open (ctrl+p) and run whatever command you are troubleshooting.
