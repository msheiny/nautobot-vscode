import * as docker from "dockerode";
import * as vscode from "vscode";

export var dockerClient = new docker.default();

interface openNautobotAppProps {
  privatePort: number;
  containerName: string;
  uriPrefix: string;
}

export function openNautobotApp(props: openNautobotAppProps) {
  /*
	Open system default handler for a URI pointed to a filttered Nautobot container.
	*/
  dockerClient.listContainers(function (err, containers) {
    if (err) {
      vscode.window.showErrorMessage("Error listing Docker containers");
      return;
    } else if (containers === undefined) {
      vscode.window.showErrorMessage(
        `No nautobot containers running on ${props.privatePort}`,
      );
    }

    const nautobotContainers = containers!.filter(
      (container) =>
        container.Names.some((name) => name.includes(props.containerName)) &&
        container.Ports.some(
          (port) => port.PrivatePort === props.privatePort,
        ) &&
        container.Ports.some((port) => port.PublicPort !== undefined),
    );

    var nautobotPort: number | undefined;

    switch (nautobotContainers.length) {
      case 0:
        vscode.window.showInformationMessage("No Nautobot containers found");
        return;
      case 1:
        nautobotPort = nautobotContainers[0].Ports.find(
          (port) => port.PrivatePort === props.privatePort,
        )?.PublicPort;
        break;
      default:
        // Present user a list of those containers
        const containerOptions = nautobotContainers.map((container) => ({
          label: container.Names[0].replace(/^\//, ""),
          publicPort: container.Ports.find(
            (port) => port.PrivatePort === props.privatePort,
          )?.PublicPort,
        }));
        vscode.window
          .showQuickPick(containerOptions, {
            placeHolder: "Select a Nautobot instance to open in the browser",
          })
          .then((selected) => {
            if (selected) {
              nautobotPort = selected.publicPort;
            }
          });
        break;
    }
    vscode.env.openExternal(
      vscode.Uri.parse(`${props.uriPrefix}127.0.0.1:${nautobotPort}`),
    );
  });
}
