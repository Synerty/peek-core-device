import {Injectable} from "@angular/core";
import {Ng2BalloonMsgService} from "@synerty/ng2-balloon-msg";
import {DeviceUpdateTuple} from "./tuples/DeviceUpdateTuple";

import * as http from "http";
import * as fs from "file-system";
import {DeviceServerService} from "./device-server.service";

// TODO, Code to download the update

// Download : `/peek_core_device/device_update/${deviceUpdate.filePath}
// Unzip
// Move
// Restart

@Injectable()
export class DeviceUpdateServiceDelegate {
    private isUpdating = false;

    constructor(private serverService:DeviceServerService,
                private balloonMsg: Ng2BalloonMsgService) {
    }

    get updateInProgress(): boolean {
        return this.isUpdating;
    }

    updateTo(deviceUpdate: DeviceUpdateTuple) {
        let host = this.serverService.serverHost();
        let httpPort = this.serverService.serverHttpPort();
        let path = deviceUpdate.urlPath;
        let url = `http://${host}:${httpPort}/peek_core_device/device_update/${path}`;
        /*
        http.getFile(this.downloadUrl)
            .then((file: fs.File) => {
                let tnsLocalPackage: ILocalPackage = new TNSLocalPackage();
                tnsLocalPackage.localPath = file.path;
                tnsLocalPackage.deploymentKey = this.deploymentKey;
                tnsLocalPackage.description = this.description;
                tnsLocalPackage.label = this.label;
                tnsLocalPackage.appVersion = this.appVersion;
                tnsLocalPackage.isMandatory = this.isMandatory;
                tnsLocalPackage.packageHash = this.packageHash;
                tnsLocalPackage.isFirstRun = false;

                return tnsLocalPackage;
            })
            .catch((e: any) => {
                downloadProgressEvent.emit(null);
                throw new Error("Could not access local package. " + e);
            });
        */
    }
}