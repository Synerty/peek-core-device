import { Component, OnInit } from "@angular/core"
import { NgLifeCycleEvents, HeaderService } from "@synerty/peek-plugin-base-js"

@Component({
    selector: "core-device-loading",
    templateUrl: "loading.component.web.html"
})
export class LoadingComponent extends NgLifeCycleEvents implements OnInit {
    
    constructor(private headerService: HeaderService) {
        super()
    }
    
    ngOnInit() {
        this.headerService.setEnabled(false)
        this.headerService.setTitle("")
    }
}
