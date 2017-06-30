import {Component} from "@angular/core";

import {
    ComponentLifecycleEventEmitter,
} from "@synerty/vortexjs";

import { DeviceNavService } from "@peek/peek_core_device/_private";

@Component({
    selector: 'core-device-enrolling',
    templateUrl: 'connecting.component.mweb.html',
    moduleId: module.id
})
export class ConnectingComponent extends ComponentLifecycleEventEmitter {

    constructor(private nav: DeviceNavService) {
        super();

    }

    reconnectClicked() {
        this.nav.toConnect();
    }

}