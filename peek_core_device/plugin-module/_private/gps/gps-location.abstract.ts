import { GpsLocationTuple } from "../../../tuples/GpsLocationTuple"

export abstract class DeviceGpsLocationServiceI {
    abstract location(): GpsLocationTuple
}