import {Component, OnInit} from "@angular/core";
import {TitleService} from "@synerty/peek-util";
import {Ng2BalloonMsgService} from "@synerty/ng2-balloon-msg";

import {DeviceNavService, EnrolDeviceAction} from "@peek/peek_core_device/_private";
import {HardwareInfo} from "@peek/peek_core_device/_private/hardware-info/hardware-info.mweb";

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
    private hardwareInfo: HardwareInfo;

    constructor(private balloonMsg: Ng2BalloonMsgService,
                private titleService: TitleService,
                private actionService: TupleActionPushService,
                private tupleDataObserver: TupleDataObserverService,
                private tupleStorage: TupleOfflineStorageService,
                private nav: DeviceNavService) {
        super();
        titleService.setEnabled(false);
        titleService.setTitle('');


    }

    ngOnInit() {

        this.hardwareInfo = new HardwareInfo(this.tupleStorage);

        this.hardwareInfo.uuid()
            .then(uuid => this.data.deviceId = uuid);


        this.data.serverHost = location.host.split(':')[0];
        this.data.serverPort = 8001;
    }

    enrollClicked() {
        this.actionService.pushAction(this.data)
            .then((tuples) => {

                alert('success');

                this.titleService.setEnabled(true);

            })
            .catch((err) => {
                alert(err);
            });
        this.nav.toEnrolling();
    }


}