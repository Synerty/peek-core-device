import { DeviceGpsLocationTuple } from "./DeviceGpsLocationTuple"
import { Observable } from "rxjs"

export abstract class DeviceGpsLocationService {
    abstract get location(): Observable<DeviceGpsLocationTuple | null>
}