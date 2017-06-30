import {Component, OnInit} from "@angular/core";
import {TitleService} from "@synerty/peek-util";
import {Ng2BalloonMsgService} from "@synerty/ng2-balloon-msg";

import {
    DeviceNavService,
    DeviceServerService,
    DeviceTupleService,
    EnrolDeviceAction,
    ServerInfoTuple
} from "@peek/peek_core_device/_private";

import {DeviceInfoTuple} from "@peek/peek_core_device";
import {DeviceTypeEnum} from "@peek/peek_core_device/_private/hardware-info/hardware-info.abstract";

import {ComponentLifecycleEventEmitter} from "@synerty/vortexjs";


@Component({
    selector: 'core-device-enroll',
    templateUrl: 'enroll.component.mweb.html',
    moduleId: module.id
})
export class EnrollComponent extends ComponentLifecycleEventEmitter implements OnInit {

    data: EnrolDeviceAction = new EnrolDeviceAction();

    deviceType: DeviceTypeEnum;

    constructor(private balloonMsg: Ng2BalloonMsgService,
                private titleService: TitleService,
                private tupleService: DeviceTupleService,
                private nav: DeviceNavService,
                private deviceServerService: DeviceServerService) {
        super();

        this.deviceType = this.tupleService.hardwareInfo.deviceType();

    }

    ngOnInit() {

        let t = this.deviceType;

        // Use DeviceInfoTuple to convert it.
        let deviceInfo = new DeviceInfoTuple();
        deviceInfo.setDeviceType(t);
        this.data.deviceType = deviceInfo.deviceType;

        this.tupleService.hardwareInfo.uuid()
            .then(uuid => this.data.deviceId = uuid);

    }

    enrollEnabled(): boolean {
        if (this.data.description == null || !this.data.description.length)
            return false;


        return true;
    }

    enrollClicked() {


        this.tupleService.tupleOfflineAction.pushAction(this.data)
            .then((tuples: DeviceInfoTuple[]) => {
                // The service manages it from here
            })
            .catch((err) => {
                this.balloonMsg.showError(err);
            });
    }


}