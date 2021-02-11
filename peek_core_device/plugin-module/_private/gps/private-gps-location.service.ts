import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"
import { TupleActionPushService } from "@synerty/vortexjs"

import { DeviceGpsLocationService, GpsLocationTuple } from "@peek/peek_core_device"

import { Plugins } from "@capacitor/core"
import { DeviceTupleService } from "../device-tuple.service"

import { GpsLocationUpdateTupleAction } from "./GpsLocationUpdateTupleAction"

const {Geolocation} = Plugins

@Injectable()
export class PrivateDeviceGpsLocationService extends DeviceGpsLocationService {
    tupleAction: TupleActionPushService
    private behaviorSubject = new BehaviorSubject<GpsLocationTuple|null>(null)
    private gpsWatchId: string
    private lastSeenPositionTupleAction: GpsLocationUpdateTupleAction

    constructor(
        private tupleService: DeviceTupleService
    ) {
        super()
        this.setUpGeoLocationWatcher()
    }

    get location(): Observable<GpsLocationTuple|null> {
        return this.behaviorSubject
        }
        
    private async getInitialGeoLocation() {
        this.lastSeenPositionTupleAction = new GpsLocationUpdateTupleAction()
        const position = await Geolocation.getCurrentPosition()
        this.lastSeenPositionTupleAction.latitude = position.coords.latitude
        this.lastSeenPositionTupleAction.longitude = position.coords.longitude
        this.lastSeenPositionTupleAction.updateType = GpsLocationUpdateTupleAction.ACCURACY_FINE
        this.behaviorSubject.next(this.lastSeenPositionTupleAction)
        this.tupleService.tupleAction.pushAction(this.lastSeenPositionTupleAction)
    }
        
    private async setUpGeoLocationWatcher() {
        await this.getInitialGeoLocation()
        this.gpsWatchId = Geolocation.watchPosition({}, (position, err) => {
                if (position == null) {
                    this.getInitialGeoLocation()
                }
                const coords = position.coords
                if (coords.latitude != this.lastSeenPositionTupleAction.latitude &&
                    coords.longitude != this.lastSeenPositionTupleAction.longitude) {
                    this.updateLocation(coords, err)
                    this.lastSeenPositionTupleAction.latitude = coords.latitude
                    this.lastSeenPositionTupleAction.longitude = coords.longitude
                }
        })
    }
    private updateLocation(coordinates, err) {
        // console.table(coordinates)
        const gpsLocationTupleAction = new GpsLocationUpdateTupleAction()
        gpsLocationTupleAction.latitude = coordinates.latitude
        gpsLocationTupleAction.longitude = coordinates.longitude
        gpsLocationTupleAction.updateType = GpsLocationUpdateTupleAction.ACCURACY_FINE
        this.behaviorSubject.next(gpsLocationTupleAction)
        
        this.tupleService.tupleAction.pushAction(gpsLocationTupleAction)
    }
}