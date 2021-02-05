import { GpsLocationTuple } from "./GpsLocationTuple"
import { Observable } from "rxjs"


export abstract class DeviceGpsLocationService {
    abstract location(): Observable<GpsLocationTuple|null>
}