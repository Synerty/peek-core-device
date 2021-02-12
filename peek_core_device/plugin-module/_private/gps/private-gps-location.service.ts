import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable, combineLatest } from "rxjs"

import { filter } from "rxjs/operators"

import { DeviceGpsLocationService, GpsLocationTuple } from "@peek/peek_core_device"
import { UserService } from "@peek/peek_core_user"
import { VortexStatusService } from "@synerty/vortexjs"

import { Plugins } from "@capacitor/core"
import { DeviceTupleService } from "../device-tuple.service"

import { GpsLocationUpdateTupleAction } from "./GpsLocationUpdateTupleAction"
import { DeviceEnrolmentService } from "../../device-enrolment.service"

const {Geolocation} = Plugins

@Injectable()
export class PrivateDeviceGpsLocationService extends DeviceGpsLocationService {
    private location$ = new BehaviorSubject<GpsLocationTuple|null>(null)
    private gpsWatchId: string
    private lastSeenPositionTuple: GpsLocationTuple
    private lastSeenPositionTupleAction: GpsLocationUpdateTupleAction
    private offlineLocationRecords: GpsLocationUpdateTupleAction[] = []
    private deviceId: string


    constructor(
        private tupleService: DeviceTupleService,
        private deviceService: DeviceEnrolmentService,
        private userService: UserService,
        private vortexStatusService: VortexStatusService,
    ) {
        super()

        combineLatest(this.userService.loggedInStatus,
            this.deviceService.deviceInfoObservable()).subscribe(
            ([isLoggedIn, deviceInfo]) => {
                console.warn(isLoggedIn)
                console.warn(deviceInfo)
                if (isLoggedIn && deviceInfo.isEnrolled) {
                    this.deviceId = deviceInfo.deviceId
                    this.setupGeoLocationWatcher()
                }
            }
        )
        
        // TODO: capture UTC timestamp and store unpushed GPS tuples
        this.vortexStatusService.isOnline
            .pipe(filter(online => online))
            .subscribe(() => this.sendOfflineLocations())
        
    }

    get location(): Observable<GpsLocationTuple|null> {
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
            (position, err) => {
                if (position != null) {
                this.updateLocation(position)
            }
        })
    }
    
    private updateLocation(position) {
        if (!position?.coords) {
            return
        }
        // send to Peek Logic
        const action = new GpsLocationUpdateTupleAction()
        action.latitude = position.coords.latitude
        action.longitude = position.coords.longitude
        action.updateType = GpsLocationUpdateTupleAction.ACCURACY_FINE
        this.lastSeenPositionTupleAction = action
        this.sendLiveLocation()
        
        // update location observable
        const location = new GpsLocationTuple()
        location.latitude = position.coords.latitude
        location.longitude = position.coords.longitude
        this.location$.next(location)
    }
    
    private sendPositionTupleAction(action: GpsLocationUpdateTupleAction) {
        // push action tuple via vortex
        if (!this.vortexStatusService.snapshot.isOnline) {
            this.offlineLocationRecords.push(action)
            return
        }
        console.table(action)
        this.tupleService.tupleAction.pushAction(action)
    }
    
    private sendLiveLocation() {
        this.sendPositionTupleAction(this.lastSeenPositionTupleAction)
    }
    
    private sendOfflineLocations() {
        if (this.offlineLocationRecords.length == 0) {
            return
        }
        // TODO: a better way to sync offline locations to Peek Logic
        for (let i = 0; i < this.offlineLocationRecords.length; ++i) {
            this.sendPositionTupleAction(this.offlineLocationRecords.shift())
        }
    }
}