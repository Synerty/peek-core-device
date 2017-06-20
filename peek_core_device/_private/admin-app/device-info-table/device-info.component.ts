import {Component} from "@angular/core";
import {
    ComponentLifecycleEventEmitter,
    TupleActionPushService,
    TupleDataObserverService,
    TupleSelector
} from "@synerty/vortexjs";
import {DeviceInfoTuple} from "@peek/peek_core_device";

@Component({
    selector: 'pl-device-device-info',
    templateUrl: './device-info.component.html'
})
export class DeviceInfoComponent extends ComponentLifecycleEventEmitter {

    items: DeviceInfoTuple[] = [];

    constructor(private actionService: TupleActionPushService,
                private tupleDataObserver: TupleDataObserverService) {
        super();

        // Setup a subscription for the data
        let sup = tupleDataObserver.subscribeToTupleSelector(
            new TupleSelector(DeviceInfoTuple.tupleName, {})
        ).subscribe((tuples: DeviceInfoTuple[]) => {
            this.items = tuples;
        });

        this.onDestroyEvent.subscribe(() => sup.unsubscribe());
    }

    authoriseDeviceClicked() {
        if (confirm("Are you sure you'd like to delete this device?")) {
            // this.loader.del([item]);
        }
    }

    deleteDeviceClicked(item) {
        if (confirm("Are you sure you'd like to delete this device?")) {
            // this.loader.del([item]);
        }
    }

}