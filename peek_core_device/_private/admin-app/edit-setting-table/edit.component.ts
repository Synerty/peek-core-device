import {Component} from "@angular/core";
import {
    ComponentLifecycleEventEmitter,
    extend,
    TupleLoader,
    VortexService
} from "@synerty/vortexjs";
//noinspection TypeScriptCheckImport
import {SettingPropertyTuple, deviceFilt} from "@peek/peek_core_device/_private";


@Component({
    selector: 'pl-device-edit-setting',
    templateUrl: './edit.component.html'
})
export class EditSettingComponent extends ComponentLifecycleEventEmitter {
    // This must match the dict defined in the admin_backend handler
    private readonly filt = {
        "key": "admin.Edit.SettingProperty"
    };

    items: SettingPropertyTuple[] = [];

    loader: TupleLoader;

    constructor(vortexService: VortexService) {
        super();

        this.loader = vortexService.createTupleLoader(this,
            () => extend({}, this.filt, deviceFilt));

        this.loader.observable
            .subscribe((tuples:SettingPropertyTuple[]) => this.items = tuples);
    }

}