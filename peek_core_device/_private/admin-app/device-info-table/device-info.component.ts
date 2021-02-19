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
import { takeUntil } from "rxjs/operators"

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
        tupleDataObserver.subscribeToTupleSelector(
            new TupleSelector(DeviceInfoTuple.tupleName, {})
        )
            .pipe(takeUntil(this.onDestroyEvent))
            .subscribe((tuples: DeviceInfoTuple[]) => {
                this.items = tuples
            })
    
        // Setup a subscription for the device location data
        // tupleDataObserver.subscribeToTupleSelector(
        //     new TupleSelector(GpsLocationTuple.tupleName, {})
        // )
        //     .pipe(takeUntil(this.onDestroyEvent))
        //     .subscribe((tuples: GpsLocationTuple[]) => {
        //         tuples.forEach(tuple => {
        //             tuple["googleMapLink"] =
        //                 this.locations.set(tuple.deviceId, tuple)
        //         })
        //     })
    
    }
    
    // makeMapsLink(gpsLocationTuple: GpsLocationTuple) {
    //     return "https://www.google.com/maps/search/?api=1&query="
    //         + `${gpsLocationTuple.latitude},${gpsLocationTuple.longitude}`
    // }
    
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
