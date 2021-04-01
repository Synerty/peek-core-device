import { DeviceGpsLocationTuple } from "./DeviceGpsLocationTuple"
import { BehaviorSubject } from "rxjs"

export abstract class DeviceGpsLocationService {
    abstract location$: BehaviorSubject<DeviceGpsLocationTuple | null>
    abstract location: DeviceGpsLocationTuple | null
}