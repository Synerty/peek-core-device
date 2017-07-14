import {Component} from "@angular/core";

import {ComponentLifecycleEventEmitter} from "@synerty/vortexjs";

import {DeviceNavService, DeviceServerService} from "@peek/peek_core_device/_private";

@Component({
    selector: 'core-device-enrolling',
    templateUrl: 'connecting.component.web.html',
    moduleId: module.id
})
export class ConnectingComponent extends ComponentLifecycleEventEmitter {

    constructor(private nav: DeviceNavService,
                private deviceServerService: DeviceServerService) {
        super();

        // Make sure we're not on this page when things are fine.
        this.doCheckEvent
            .takeUntil(this.onDestroyEvent)
            .subscribe(() => {
                if (this.deviceServerService.isConnected)
                    this.nav.toHome();
                else if (!this.deviceServerService.isSetup)
                    this.nav.toConnect();
            });

    }

    reconnectClicked() {
        this.nav.toConnect();
    }

}