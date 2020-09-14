import { Component, OnInit } from "@angular/core"
import { NgLifeCycleEvents, TitleService } from "@synerty/peek-plugin-base-js"

@Component({
    selector: "core-device-loading",
    templateUrl: "loading.component.web.html",
    moduleId: module.id
})
export class LoadingComponent extends NgLifeCycleEvents implements OnInit {
    
    constructor(private titleService: TitleService) {
        super()
    }
    
    ngOnInit() {
        this.titleService.setEnabled(false)
        this.titleService.setTitle("")
    }
}
