import {Component, OnInit} from "@angular/core";
import {TitleService} from "@synerty/peek-util";
import {Ng2BalloonMsgService} from "@synerty/ng2-balloon-msg";

import {
    DeviceNavService,
    DeviceServerService,
    EnrolDeviceAction,
    ServerInfoTuple
} from "@peek/peek_core_device/_private";

import {DeviceInfoTuple} from "@peek/peek_core_device";
import {HardwareInfo} from "@peek/peek_core_device/_private/hardware-info/hardware-info.mweb";
import {DeviceTypeEnum} from "@peek/peek_core_device/_private/hardware-info/hardware-info.abstract";

import {
    ComponentLifecycleEventEmitter,
    TupleActionPushService,
    TupleDataObserverService,
    TupleOfflineStorageService
} from "@synerty/vortexjs";


@Component({
    selector: 'core-device-enroll',
    templateUrl: 'enroll.component.mweb.html',
    moduleId: module.id
})
export class EnrollComponent extends ComponentLifecycleEventEmitter implements OnInit {

    data: EnrolDeviceAction = new EnrolDeviceAction();
    server: ServerInfoTuple | null = null;
    private hardwareInfo: HardwareInfo;

    constructor(private balloonMsg: Ng2BalloonMsgService,
                private titleService: TitleService,
                private actionService: TupleActionPushService,
                private tupleDataObserver: TupleDataObserverService,
                private tupleStorage: TupleOfflineStorageService,
                private nav: DeviceNavService,
                private deviceServerService: DeviceServerService) {
        super();


    }

    ngOnInit() {

        this.hardwareInfo = new HardwareInfo(this.tupleStorage);

        let type = this.hardwareInfo.deviceType();

        // Use DeviceInfoTuple to convert it.
        let deviceInfo = new DeviceInfoTuple();
        deviceInfo.setDeviceType(type);
        this.data.deviceType = deviceInfo.deviceType;

        if (type != DeviceTypeEnum.MOBILE_WEB && type != DeviceTypeEnum.DESKTOP_WEB) {
            this.server = new ServerInfoTuple();
            this.server.serverPort = 8001;
        }

        this.hardwareInfo.uuid()
            .then(uuid => this.data.deviceId = uuid);

    }

    enrollClicked() {
        if (this.server != null) {
            this.deviceServerService.setServerAndPort(
                this.server.serverHost, this.server.serverPort
            );
        }

        this.actionService.pushAction(this.data)
            .then((tuples) => {
                this.nav.toEnrolling();
            })
            .catch((err) => {
                this.balloonMsg.showError(err);
            });
    }


}