import {Component} from "@angular/core";
import {
    ComponentLifecycleEventEmitter,
    TupleActionPushService,
    TupleDataObserverService,
    TupleSelector
} from "@synerty/vortexjs";
import {DeviceUpdateTuple} from "@peek/peek_core_device/_private";


@Component({
    selector: 'pl-device-device-update',
    templateUrl: './device-update.component.html'
})
export class DeviceUpdateComponent extends ComponentLifecycleEventEmitter {

    items: DeviceUpdateTuple[] = [];

    constructor(private actionService: TupleActionPushService,
                private tupleDataObserver: TupleDataObserverService) {
        super();

        // Setup a subscription for the data
        let sup = tupleDataObserver.subscribeToTupleSelector(
            new TupleSelector(DeviceUpdateTuple.tupleName, {})
        ).subscribe((tuples: DeviceUpdateTuple[]) => {
            this.items = tuples;
        });

        this.onDestroyEvent.subscribe(() => sup.unsubscribe());
    }

    buildUpdateClicked() {
        if (confirm("Are you sure you'd like to delete this device?")) {
            // this.loader.del([item]);
        }
    }

    toggleUpdateEnabledClicked(item) {
        if (confirm("Are you sure you'd like to delete this device?")) {
            // this.loader.del([item]);
        }
    }

}