import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable, combineLatest } from "rxjs"

import { filter } from "rxjs/operators"

import {
    DeviceGpsLocationService,
    DeviceGpsLocationTuple
} from "@peek/peek_core_device"
import { UserService } from "@peek/peek_core_user"
import { VortexStatusService } from "@synerty/vortexjs"

import { Plugins } from "@capacitor/core"
import { DeviceTupleService } from "../device-tuple.service"
import { GpsLocationUpdateTupleAction } from "./GpsLocationUpdateTupleAction"
import { DeviceEnrolmentService } from "../../device-enrolment.service"

const {Geolocation} = Plugins

@Injectable()
export class PrivateDeviceGpsLocationService extends DeviceGpsLocationService {
    private location$ = new BehaviorSubject<DeviceGpsLocationTuple | null>(null)
    private gpsWatchId: string
    private lastSeenPositionTuple: DeviceGpsLocationTuple
    private lastSeenPositionTupleAction: GpsLocationUpdateTupleAction
    private deviceId: string


    constructor(
        private tupleService: DeviceTupleService,
        private deviceService: DeviceEnrolmentService,
        private userService: UserService,
    ) {
        super()

        combineLatest(this.userService.loggedInStatus,
            this.deviceService.deviceInfoObservable()).subscribe(
            ([isLoggedIn, deviceInfo]) => {
                // console.warn(isLoggedIn)
                // console.warn(deviceInfo)
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
        this.lastSeenPositionTuple = new GpsLocationUpdateTupleAction()
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
        const now = Date.now() // in milliseconds, UTC
        // send to Peek Logic
        const action = new GpsLocationUpdateTupleAction()
        action.latitude = position.coords.latitude
        action.longitude = position.coords.longitude
        action.updateType = GpsLocationUpdateTupleAction.ACCURACY_FINE
        action.timestamp = now
        action.deviceToken = this.deviceService.enrolmentToken()
        this.lastSeenPositionTupleAction = action
        this.sendLiveLocation()
    
        // update location observable
        const location = new DeviceGpsLocationTuple()
        location.latitude = position.coords.latitude
        location.longitude = position.coords.longitude
        location.timestamp = now
        location.deviceToken = this.deviceService.enrolmentToken()
        this.location$.next(location)
    }
    
    private sendPositionTupleAction(action: GpsLocationUpdateTupleAction) {
        console.table(action)
        this.tupleService.tupleOfflineAction.pushAction(action)
    }
    
    private sendLiveLocation() {
        this.sendPositionTupleAction(this.lastSeenPositionTupleAction)
    }
}