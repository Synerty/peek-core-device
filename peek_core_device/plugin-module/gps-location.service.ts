import { GpsLocationTuple } from "./GpsLocationTuple"
import { Observable } from "rxjs"


export abstract class DeviceGpsLocationService {
    abstract get location(): Observable<GpsLocationTuple|null>
}