import {Injectable} from "@angular/core";
import {TupleSelector, VortexStatusService} from "@synerty/vortexjs";
import {Ng2BalloonMsgService} from "@synerty/ng2-balloon-msg";

import {DeviceEnrolmentService} from "../device-enrolment.service";
import {DeviceTupleService} from "./device-tuple.service";
import {DeviceInfoTuple} from "../DeviceInfoTuple";
import {DeviceUpdateTuple} from "./tuples/DeviceUpdateTuple";
import {DeviceUpdateLocalValuesTuple} from "./tuples/DeviceUpdateLocalValuesTuple";


@Injectable()
export class DeviceUpdateService {

    private lastSubscripton: any = null;


    private localUpdateValues: DeviceUpdateLocalValuesTuple | null = null;


    constructor(private balloonMsg: Ng2BalloonMsgService,
                private tupleService: DeviceTupleService,
                private enrolmentService: DeviceEnrolmentService,
                private vortexStatusService: VortexStatusService) {


        // First, initialise the current state of our data

        this.tupleService.offlineStorage
            .loadTuples(new TupleSelector(DeviceUpdateLocalValuesTuple.tupleName, {}))
            .then((tuples: DeviceUpdateLocalValuesTuple[]) => {
                if (tuples.length == 0)
                    this.localUpdateValues = new DeviceUpdateLocalValuesTuple();
                else
                    this.localUpdateValues = tuples[0];

                // Why should we care if we're enrolled or not to check for updates?
                // Devices that are not enrolled should not be able to access any thing on
                // the servers.
                this.enrolmentService.deviceInfoObservable
                    .subscribe((deviceInfo: DeviceInfoTuple) => {
                        this.resubscribeToUpdates(deviceInfo);
                    });
            })
            .catch(e => {
                this.balloonMsg.showError(`Failed to load local device update info ${e}`);
            });


    }

    private resubscribeToUpdates(deviceInfo: DeviceInfoTuple) {
        if (this.lastSubscripton != null) {
            this.lastSubscripton.unsubscribe();
            this.lastSubscripton = null;
        }

        if (deviceInfo == null || deviceInfo.isEnrolled == false)
            return;

        this.lastSubscripton = this.tupleService.observer
            .subscribeToTupleSelector(new TupleSelector(
                DeviceUpdateTuple.tupleName, {deviceId: deviceInfo.deviceId}
            ))
            .subscribe((tuples: DeviceUpdateTuple[]) => {
                if (tuples.length == 0)
                    return;

                this.checkUpdate(tuples[0])
            });
    }

    private checkUpdate(deviceUpdate: DeviceUpdateTuple) {
        if (deviceUpdate.updateVersion != this.localUpdateValues.updateVersion) {
            this.balloonMsg.showError(`Time to update to ${deviceUpdate.updateVersion}`);
            console.log(`Time to update to ${deviceUpdate.updateVersion}`)
        }

        // TODO, Code to download the update

        // Download : `/peek_core_device/device_update/${deviceUpdate.filePath}
        // Unzip
        // Move
        // Restart

    }

    private storeLocalValues() {

        this.tupleService.offlineStorage
            .saveTuples(
                new TupleSelector(DeviceUpdateLocalValuesTuple.tupleName, {}),
                [this.localUpdateValues]
            )
            .catch(e => {
                this.balloonMsg.showError(`Failed to load local device update info ${e}`);
            });
    }

}