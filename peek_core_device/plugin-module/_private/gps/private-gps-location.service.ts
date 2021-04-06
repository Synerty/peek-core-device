import { Injectable } from "@angular/core"
import { BehaviorSubject, combineLatest } from "rxjs"

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
    private gpsWatchId: string
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
            .subscribe(
                async ([isLoggedIn, deviceInfo]) => {
                    if (isLoggedIn && deviceInfo.isEnrolled) {
                        this.deviceId = deviceInfo.deviceId
                        
                        const position = await Geolocation.getCurrentPosition()
                            .catch(err => {
                                console.log("Cannot get current GPS position.")
                            })
                        
                        this.updateLocation(position)
                        
                        this.gpsWatchId = Geolocation.watchPosition(
                            {"enableHighAccuracy": true},
                            (
                                position,
                                err
                            ) => {
                                if (position != null) {
                                    this.updateLocation(position)
                                }
                            })
                    }
                }
            )
    }
    
    get location() {
        return this._location$.getValue()
    }
    
    get location$() {
        return this._location$.asObservable()
    }
    
    private get _location() {
        return this.location
    }
    
    private set _location(value) {
        this._location$.next(value)
    }

    private updateLocation(position): void {
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
        this.tupleService.tupleOfflineAction.pushAction(action)
        
        // update location observable
        const location = new DeviceGpsLocationTuple()
        location.latitude = position.coords.latitude
        location.longitude = position.coords.longitude
        location.datetime = now
        location.deviceToken = this.deviceService.enrolmentToken()
        this._location = location
    }
}