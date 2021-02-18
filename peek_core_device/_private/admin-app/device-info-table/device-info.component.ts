import { Component } from "@angular/core"
import {
    BalloonMsgLevel,
    BalloonMsgService,
    BalloonMsgType,
} from "@synerty/peek-plugin-base-js"
import {
    NgLifeCycleEvents,
    TupleActionPushService,
    TupleDataObserverService,
    TupleSelector
} from "@synerty/vortexjs"
import { DeviceInfoTuple, GpsLocationTuple } from "@peek/peek_core_device"
import { UpdateEnrollmentAction } from "@peek/peek_core_device/_private"

@Component({
    selector: "core-device-device-info",
    templateUrl: "./device-info.component.html"
})
export class DeviceInfoComponent extends NgLifeCycleEvents {
    items: DeviceInfoTuple[] = []
    locations: Map<string, GpsLocationTuple> = new Map()
    
    constructor(
        private balloonMsg: BalloonMsgService,
        private actionService: TupleActionPushService,
        private tupleDataObserver: TupleDataObserverService
    ) {
        super()
        
        // Setup a subscription for the device info data
        let deviceInfoSubscriber = tupleDataObserver.subscribeToTupleSelector(
            new TupleSelector(DeviceInfoTuple.tupleName, {})
        )
            .subscribe((tuples: DeviceInfoTuple[]) => {
                this.items = tuples
            })
        
        // Setup a subscription for the device location data
        let gpsLocationSubscriber = tupleDataObserver.subscribeToTupleSelector(
            new TupleSelector(GpsLocationTuple.tupleName, {})
        )
            .subscribe((tuples: GpsLocationTuple[]) => {
                tuples.forEach(tuple => {
                    tuple["googleMapLink"] = `https://www.google.com/maps/search/?api=1&query=${tuple.latitude},${tuple.longitude}`
                    this.locations.set(tuple.deviceId, tuple)
                })
            })
        
        this.onDestroyEvent.subscribe(() => deviceInfoSubscriber.unsubscribe())
        this.onDestroyEvent.subscribe(() => gpsLocationSubscriber.unsubscribe())
    }
    
    deleteDeviceClicked(item) {
        let action = new UpdateEnrollmentAction()
        action.deviceInfoId = item.id
        action.remove = true
        
        this.balloonMsg.showMessage(
            "Are you sure you'd like to delete this device?",
            BalloonMsgLevel.Warning,
            BalloonMsgType.ConfirmCancel,
            {confirmText: "Yes", cancelText: "No"}
        )
            .then(() => this.sendAction(action))
        
    }
    
    toggleEnrollClicked(item) {
        let action = new UpdateEnrollmentAction()
        action.deviceInfoId = item.id
        action.unenroll = item.isEnrolled
        
        if (!action.unenroll) {
            this.sendAction(action)
            return
        }
        
        this.balloonMsg.showMessage(
            "Are you sure you'd like to unenroll this device?",
            BalloonMsgLevel.Warning,
            BalloonMsgType.ConfirmCancel,
            {confirmText: "Yes", cancelText: "No"}
        )
            .then(() => this.sendAction(action))
    }
    
    private sendAction(action: UpdateEnrollmentAction) {
        this.actionService.pushAction(action)
            .then(() => this.balloonMsg.showSuccess("Success"))
            .catch(e => this.balloonMsg.showError(e))
    }
    
}
