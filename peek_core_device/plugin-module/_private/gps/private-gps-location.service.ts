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
    
    constructor(
        private tupleService: DeviceTupleService
    ) {
        super()
        this.gpsWatchId = Geolocation.watchPosition({}, (position, err) => {
            // console.table(this.location)
            this.updateLocation(position, err)
        })
    }

    get location(): Observable<GpsLocationTuple|null> {
        return this.behaviorSubject
        }
        
    private updateLocation(coordinates, err) {
        const gpsLocationTupleAction = new GpsLocationUpdateTupleAction()
        gpsLocationTupleAction.latitude = coordinates.coords.latitude
        gpsLocationTupleAction.longitude = coordinates.coords.longitude
        gpsLocationTupleAction.updateType = GpsLocationUpdateTupleAction.ACCURACY_FINE
        this.behaviorSubject.next(gpsLocationTupleAction)
        
        this.tupleService.tupleAction.pushAction(gpsLocationTupleAction)
    }
}