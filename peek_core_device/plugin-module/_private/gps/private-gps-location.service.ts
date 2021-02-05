import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"
import { TupleActionPushService } from "@synerty/vortexjs"

import { DeviceGpsLocationService, GpsLocationTuple } from "@peek/peek_core_device"

import { Plugins } from "@capacitor/core"
import { DeviceTupleService } from "../device-tuple.service"

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
            this.watchLocationUpdate(position, err)
        })
        console.log("feeeeee")

    }
    
    // obserable tuple
    // behavior subject
    location(): Observable<GpsLocationTuple|null> {
        return this.behaviorSubject
        
        }
    private watchLocationUpdate(coordinates, err) {
        const gpsLocationTuple = new GpsLocationTuple()
        gpsLocationTuple.latitude = coordinates.coords.latitude
        gpsLocationTuple.longitude = coordinates.coords.longitude
        this.behaviorSubject.next(gpsLocationTuple)
        
        // this.tupleService.tupleAction.pushAction()
    }
}