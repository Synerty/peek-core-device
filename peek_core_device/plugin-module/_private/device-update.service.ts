import {Injectable} from "@angular/core";
import {TupleSelector, VortexStatusService} from "@synerty/vortexjs";
import {Ng2BalloonMsgService} from "@synerty/ng2-balloon-msg";

import {DeviceEnrolmentService} from "../device-enrolment.service";
import {DeviceTupleService} from "./device-tuple.service";
import {DeviceInfoTuple} from "../DeviceInfoTuple";
import {DeviceUpdateTuple} from "./tuples/DeviceUpdateTuple";
import {DeviceUpdateLocalValuesTuple} from "./tuples/DeviceUpdateLocalValuesTuple";
import {DeviceTypeEnum} from "./hardware-info/hardware-info.abstract";
import {DeviceUpdateServiceDelegate} from "./device-update.service.web";
import {DeviceServerService} from "./device-server.service";


@Injectable()
export class DeviceUpdateService {

    private lastSubscripton: any = null;
    private localUpdateValues: DeviceUpdateLocalValuesTuple | null = null;

    private delegate: DeviceUpdateServiceDelegate;

    constructor(private balloonMsg: Ng2BalloonMsgService,
                private serverService: DeviceServerService,
                private tupleService: DeviceTupleService,
                private enrolmentService: DeviceEnrolmentService,
                private vortexStatusService: VortexStatusService) {

        this.delegate = new DeviceUpdateServiceDelegate(serverService, balloonMsg);

        let dt = this.tupleService.hardwareInfo.deviceType();
        if (dt != DeviceTypeEnum.MOBILE_ANDROID && dt != DeviceTypeEnum.MOBILE_IOS)
            return;

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
        if (this.delegate.updateInProgress)
            return;

        if (deviceUpdate.updateVersion == this.localUpdateValues.updateVersion)
            return;

        console.log(`Time to update to ${deviceUpdate.updateVersion}`);
        this.delegate.updateTo(deviceUpdate);

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