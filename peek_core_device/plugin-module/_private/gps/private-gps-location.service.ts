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
    private _location$ = new BehaviorSubject<DeviceGpsLocationTuple | null>(null)
    private gpsWatchId: string | null
    private lastSeenPositionTupleAction: GpsLocationUpdateTupleAction
    private deviceId: string

    constructor(
        private tupleService: DeviceTupleService,
        private deviceService: DeviceEnrolmentService,
        private userService: UserService,
    ) {
        super()
        
        combineLatest(
            this.userService.loggedInStatus,
            this.deviceService.deviceInfoObservable()
        )
            .subscribe(async ([isLoggedIn, deviceInfo]) => {
                if (isLoggedIn && deviceInfo.isEnrolled) {
                    this.deviceId = deviceInfo.deviceId
                    
                    // Try to update current position
                    const position = await Geolocation.getCurrentPosition()
                        .catch(err => {
                            console.log("Cannot get current GPS position.")
                        })
                    
                    if (position?.coords) {
                        this.updateLocation(position)
                    }
                    
                    // Don't setup listener if already listening
                    if (this.gpsWatchId) {
                        return
                    }
                    
                    // Setup listener for location changes
                    this.gpsWatchId = Geolocation.watchPosition(
                        {"enableHighAccuracy": true},
                        (
                            position,
                            err
                        ) => {
                            if (position?.coords) {
                                this.updateLocation(position)
                            }
                        })
                }
                else {
                    // Clear listener if not logged in or enrolled
                    if (this.gpsWatchId) {
                        Geolocation.clearWatch({id: this.gpsWatchId})
                        this.gpsWatchId = null
                    }
                }
            })
    }
    
    get location$(): Observable<DeviceGpsLocationTuple | null> {
        return this._location$.asObservable()
    }
    
    get location(): DeviceGpsLocationTuple | null {
        return this._location$.getValue()
    }
    
    private get _location(): DeviceGpsLocationTuple | null {
        return this._location$.getValue()
    }
    
    private set _location(value) {
        this._location$.next(value)
    }
    
    private updateLocation(position): void {
        const now = new Date() // In datetime with timezone
        
        // Send to Peek Logic
        const action = new GpsLocationUpdateTupleAction()
        action.latitude = position.coords.latitude
        action.longitude = position.coords.longitude
        action.updateType = GpsLocationUpdateTupleAction.ACCURACY_FINE
        action.datetime = now
        action.deviceToken = this.deviceService.enrolmentToken()
        this.lastSeenPositionTupleAction = action
        this.tupleService.tupleOfflineAction.pushAction(action)
        
        // Update location observable
        const location = new DeviceGpsLocationTuple()
        location.latitude = position.coords.latitude
        location.longitude = position.coords.longitude
        location.datetime = now
        location.deviceToken = this.deviceService.enrolmentToken()
        this._location = location
    }
}