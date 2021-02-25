import { Injectable } from "@angular/core"
import { BehaviorSubject, combineLatest, Observable } from "rxjs"

import {
    DeviceGpsLocationService,
    DeviceGpsLocationTuple
} from "@peek/peek_core_device"
import { UserService } from "@peek/peek_core_user"

import { Plugins } from "@capacitor/core"
import { DeviceTupleService } from "../device-tuple.service"
import { GpsLocationUpdateTupleAction } from "./GpsLocationUpdateTupleAction"
import { DeviceEnrolmentService } from "../../device-enrolment.service"

const {Geolocation} = Plugins

@Injectable()
export class PrivateDeviceGpsLocationService extends DeviceGpsLocationService {
    private location$ = new BehaviorSubject<DeviceGpsLocationTuple | null>(null)
    private gpsWatchId: string
    private lastSeenPositionTupleAction: GpsLocationUpdateTupleAction
    private deviceId: string
    
    constructor(
        private tupleService: DeviceTupleService,
        private deviceService: DeviceEnrolmentService,
        private userService: UserService,
    ) {
        super()
        
        combineLatest(this.userService.loggedInStatus,
            this.deviceService.deviceInfoObservable())
            .subscribe(
                ([isLoggedIn, deviceInfo]) => {
                    if (isLoggedIn && deviceInfo.isEnrolled) {
                        this.deviceId = deviceInfo.deviceId
                        this.setupGeoLocationWatcher()
                    }
                }
            )
    }
    
    get location(): Observable<DeviceGpsLocationTuple | null> {
        return this.location$
    }
    
    private async getInitialGeoLocation() {
        const position = await Geolocation.getCurrentPosition()
        this.updateLocation(position)
    }
    
    private async setupGeoLocationWatcher() {
        await this.getInitialGeoLocation()
        this.gpsWatchId = Geolocation.watchPosition({"enableHighAccuracy": true},
            (
                position,
                err
            ) => {
                if (position != null) {
                    this.updateLocation(position)
                }
            })
    }
    
    private updateLocation(position) {
        if (!position?.coords) {
            return
        }
        const now = new Date() // in datetime with timezone
        // send to Peek Logic
        const action = new GpsLocationUpdateTupleAction()
        action.latitude = position.coords.latitude
        action.longitude = position.coords.longitude
        action.updateType = GpsLocationUpdateTupleAction.ACCURACY_FINE
        action.datetime = now
        action.deviceToken = this.deviceService.enrolmentToken()
        this.lastSeenPositionTupleAction = action
        this.sendPositionTupleAction(action)
        
        // update location observable
        const location = new DeviceGpsLocationTuple()
        location.latitude = position.coords.latitude
        location.longitude = position.coords.longitude
        location.datetime = now
        location.deviceToken = this.deviceService.enrolmentToken()
        this.location$.next(location)
    }
    
    private sendPositionTupleAction(action: GpsLocationUpdateTupleAction) {
        this.tupleService.tupleOfflineAction.pushAction(action)
    }
}