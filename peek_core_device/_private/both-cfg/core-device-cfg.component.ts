import { Component } from "@angular/core"
import { NgLifeCycleEvents, HeaderService } from "@synerty/peek-plugin-base-js"

@Component({
    selector: "peek-core-device-cfg",
    templateUrl: "core-device-cfg.component.web.html",
    moduleId: module.id
})
export class CoreDeviceCfgComponent extends NgLifeCycleEvents {
    
    constructor(private headerService: HeaderService) {
        super()
        
        this.headerService.setTitle("Core Device Config")
    }
}
