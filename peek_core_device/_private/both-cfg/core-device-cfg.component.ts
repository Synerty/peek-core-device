import { Component } from "@angular/core"
import { NgLifeCycleEvents, TitleService } from "@synerty/peek-plugin-base-js"

@Component({
    selector: "peek-core-device-cfg",
    templateUrl: "core-device-cfg.component.web.html",
    moduleId: module.id
})
export class CoreDeviceCfgComponent extends NgLifeCycleEvents {
    
    constructor(private titleService: TitleService) {
        super()
        
        this.titleService.setTitle("Core Device Config")
    }
}
