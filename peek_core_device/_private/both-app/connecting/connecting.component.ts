import { Component, OnInit } from "@angular/core"
import { NgLifeCycleEvents, HeaderService } from "@synerty/peek-plugin-base-js"
import { DeviceNavService, DeviceServerService } from "@peek/peek_core_device/_private"

@Component({
    selector: "core-device-enrolling",
    templateUrl: "connecting.component.web.html"
})
export class ConnectingComponent extends NgLifeCycleEvents implements OnInit {
    
    constructor(
        private headerService: HeaderService,
        private nav: DeviceNavService,
        private deviceServerService: DeviceServerService
    ) {
        super()
        
        // Make sure we're not on this page when things are fine.
        let sub = this.doCheckEvent
            .takeUntil(this.onDestroyEvent)
            .subscribe(() => {
                if (this.deviceServerService.isConnected) {
                    this.nav.toEnroll()
                    sub.unsubscribe()
                }
                else if (!this.deviceServerService.isSetup) {
                    this.nav.toConnect()
                    sub.unsubscribe()
                }
            })
        
    }
    
    ngOnInit() {
        this.headerService.setEnabled(false)
        this.headerService.setTitle("")
    }
    
    reconnectClicked() {
        this.nav.toConnect()
    }
    
    workOfflineClicked() {
        this.deviceServerService.setWorkOffline()
    }
    
}
