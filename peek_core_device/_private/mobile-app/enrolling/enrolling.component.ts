import {Component} from "@angular/core";
/*
import {Router} from "@angular/router";
import {TitleService} from "@synerty/peek-util";
import {Ng2BalloonMsgService} from "@synerty/ng2-balloon-msg";

import {
    ComponentLifecycleEventEmitter,
    TupleActionPushService,
    TupleDataObserverService,
    TupleOfflineStorageService
} from "@synerty/vortexjs";

import {EnrolDeviceAction, HardwareInfo} from "@peek/peek_core_device/_private";
*/
import {
    ComponentLifecycleEventEmitter,
} from "@synerty/vortexjs";

@Component({
    selector: 'core-device-enrolling',
    templateUrl: 'enrolling.component.mweb.html',
    moduleId: module.id
})
export class EnrollingComponent extends ComponentLifecycleEventEmitter {
/*
    data: EnrolDeviceAction = new EnrolDeviceAction();
    private hardwareInfo: HardwareInfo;

    constructor(private balloonMsg: Ng2BalloonMsgService,
                private titleService: TitleService,
                private actionService: TupleActionPushService,
                private tupleDataObserver: TupleDataObserverService,
                private tupleStorage: TupleOfflineStorageService,
                private router: Router) {
        super();
        titleService.setEnabled(false);

        this.hardwareInfo = new HardwareInfo(tupleStorage);

        this.hardwareInfo.uuid()
            .then(uuid => this.data.deviceId = uuid);


        this.data.serverHost = location.host.split(':')[0];
        this.data.serverPort = 8001;

        // Set the deviceId, Check for an existing value first

    }

    enrolCicked() {
        this.actionService.pushAction(this.data)
            .then((tuples) => {

                alert('success');

                this.titleService.setEnabled(true);

            })
            .catch((err) => {
                alert(err);
            });
    }
*/

}