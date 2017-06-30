import {Injectable} from "@angular/core";
import {Ng2BalloonMsgService} from "@synerty/ng2-balloon-msg";
import {DeviceUpdateTuple} from "./tuples/DeviceUpdateTuple";

import * as http from "http";
import {DeviceServerService} from "./device-server.service";


import * as fs from "file-system";
import {isIOS} from "platform";

// import * as BackgroundTask from "nativescript-background-task";
let BackgroundTask = require("nativescript-background-task");

// TODO, Code to download the update

// Download : `/peek_core_device/device_update/${deviceUpdate.filePath}
// Unzip
// Move
// Restart

let logPre = "peek_core_device.Update";

@Injectable()
export class DeviceUpdateServiceDelegate {
    private isUpdating = false;

    constructor(private serverService: DeviceServerService,
                private balloonMsg: Ng2BalloonMsgService) {
    }

    get updateInProgress(): boolean {
        return this.isUpdating;
    }

    updateTo(deviceUpdate: DeviceUpdateTuple): Promise<void> {
        this.isUpdating = true;

        // Generate a path like <documents.path>/myFiles/test.txt
        let destFilePath = fs.path.join(fs.knownFolders.temp().path, "update.zip");
        let extractToPath = fs.path.join(fs.knownFolders.documents().path, "CodePush", "pending");
        // let destFile = fs.knownFolders.documents().getFile("update.zip");

        // in case of a rollback 'newPackageFolderPath' could already exist, so check and remove
        if (fs.Folder.exists(destFilePath)) {
            fs.Folder.fromPath(destFilePath).removeSync();
        }

        return this.download(deviceUpdate, destFilePath)
            .then(() => {
                return this.unzip(deviceUpdate, destFilePath, extractToPath);
            });

    }

    private download(deviceUpdate: DeviceUpdateTuple, destFilePath: String): Promise<void> {

        let prot = this.serverService.serverUseSsl ? "https" : "http";
        let host = this.serverService.serverHost;
        let httpPort = this.serverService.serverHttpPort;
        let path = deviceUpdate.urlPath;
        let url = `${prot}://${host}:${httpPort}/peek_core_device/device_update/${path}`;


        return new Promise<void>((resolve, reject) => {
            BackgroundTask.getFile({
                url: url,
                toFile: destFilePath,
                identifier: 1,
                partBytesSize: 0, // use default 2MB
                checkPartialDownload: false,
                headers: [
                    {'CustonHeader': 'Custon Value'}
                ],
                doneCallback: (identifier) => {
                    console.log(`${logPre} Download complete`);
                    resolve();
                },
                errorCallback: (error) => {
                    let identifier = error[0];
                    let message = error[1];
                    // error
                    reject(message);
                },
            })


        });


    }


    private  unzip(deviceUpdate: DeviceUpdateTuple,
                   downloadedFilePath: string,
                   extractToPath: string): Promise<void> {


        if (fs.Folder.exists(extractToPath)) {
            console.log(`${logPre} Unzip destination exists, deleting`);
            fs.Folder.fromPath(extractToPath).removeSync();
        }

        if (!fs.File.exists(downloadedFilePath)) {
            console.log('Zip file does not exists...');
            this.balloonMsg.showError('Zip file does not exists.. do zip download.');
            return;
        }

        console.log(`${logPre} Unzipping to ${extractToPath}`);

        return new Promise<void>((resolve, reject) => {
            BackgroundTask.unzip({
                fromFile: downloadedFilePath,
                toFile: extractToPath,
                doneCallback: () => {
                    console.log(`${logPre} Unzip complete`);

                    fs.Folder.fromPath(extractToPath).getEntities()
                        .then((entities) => {
                            for (let e of entities) {
                                console.log(e.name);
                            }
                            console.log("Unzipped " + entities.length + " files to " + extractToPath);
                        })
                        .catch((error) => {
                            console.log('Error on list directory ' + extractToPath + ': ' + error);
                        });

                    resolve();

                },
                errorCallback: (error) => {
                    let msg = `Unzip failed: ${error}`;
                    console.log(`${logPre} ${msg}`);

                    this.balloonMsg.showError(msg);
                    reject(msg);

                },
            });
        });

    }
}