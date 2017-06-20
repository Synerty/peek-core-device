import {Component} from "@angular/core";
import {Ng2BalloonMsgService} from "@synerty/ng2-balloon-msg";
import {
    ComponentLifecycleEventEmitter,
    TupleActionPushService,
    TupleDataObserverService,
    TupleSelector
} from "@synerty/vortexjs";
import {DeviceInfoTuple} from "@peek/peek_core_device";
import {UpdateEnrollmentAction} from "@peek/peek_core_device/_private";

@Component({
    selector: 'pl-device-device-info',
    templateUrl: './device-info.component.html'
})
export class DeviceInfoComponent extends ComponentLifecycleEventEmitter {

    items: DeviceInfoTuple[] = [];

    constructor(private balloonMsg: Ng2BalloonMsgService,
                private actionService: TupleActionPushService,
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

    deleteDeviceClicked(item) {
        let action = new UpdateEnrollmentAction();
        action.deviceInfoId = item.id;
        action.remove = true;

        if (confirm("Are you sure you'd like to delete this device?")) {
            this.actionService.pushAction(action)
                .then(() => this.balloonMsg.showSuccess("Success"))
                .catch(e => this.balloonMsg.showError(e));
        }
    }

    toggleEnrollClicked(item) {
        let action = new UpdateEnrollmentAction();
        action.deviceInfoId = item.id;
        action.unenroll = item.isEnrolled;

        if (!action.unenroll
            || confirm("Are you sure you'd like to unenroll this device?")) {
            this.actionService.pushAction(action)
                .then(() => this.balloonMsg.showSuccess("Success"))
                .catch(e => this.balloonMsg.showError(e));
        }
    }

}