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
import { DeviceInfoTuple } from "@peek/peek_core_device"
import { UpdateEnrollmentAction } from "@peek/peek_core_device/_private"
import { takeUntil } from "rxjs/operators"
import { DatePipe } from "@angular/common"

@Component({
    selector: "core-device-device-info",
    templateUrl: "./device-info.component.html"
})
export class DeviceInfoComponent extends NgLifeCycleEvents {
    items: DeviceInfoTuple[] = []
    
    constructor(
        private balloonMsg: BalloonMsgService,
        private actionService: TupleActionPushService,
        private tupleDataObserver: TupleDataObserverService,
        private datePipe: DatePipe,
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
    }
    
    deviceStatus(device: DeviceInfoTuple): string {
        if (
            device.deviceStatus & device.DEVICE_ONLINE
            && !(device.deviceStatus & device.DEVICE_BACKGROUND)
        ) {
            return "Online, App Visible"
        }
        if (device.deviceStatus & device.DEVICE_BACKGROUND) {
            return "Online, App Backgrounded"
        }
        if (device.lastOnline) {
            return this.datePipe.transform(device.lastOnline)
        }
        return "Never Connected"
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
