import { Injectable } from "@angular/core"
import {
    TupleActionPushService,
    TupleActionPushNameService,
    VortexService,
    VortexStatusService
} from "@synerty/vortexjs"

import {
    deviceActionProcessorName,
    deviceFilt,
    deviceObservableName,
    deviceTupleOfflineServiceName
} from "./PluginNames"

import { DeviceGpsLocationServiceI } from "./gps-location.abstract"
import { GpsLocationTuple } from "../../../tuples/GpsLocationTuple"

import { Plugins } from "@capacitor/core"

const {Geolocation} = Plugins

@Injectable()
export class DeviceGpsLocationService extends DeviceGpsLocationServiceI {
    tupleAction: TupleActionPushService
    
    constructor(
        vortexService: VortexService,
        vortexStatusService: VortexStatusService
    ) {
        super()
        this.tupleAction = new TupleActionPushService(
            new TupleActionPushNameService(deviceActionProcessorName, deviceFilt),
            vortexService,
            vortexStatusService
        )
        
    }
    
    location(): GpsLocationTuple {
        const coordinates = await Geolocation.getCurrentPosition()
        let gpsLocationTuple = new GpsLocationTuple()
        gpsLocationTuple.latitude = coordinates.coords.latitude
        gpsLocationTuple.longitude = coordinates.coords.longitude
        return gpsLocationTuple
    }
}