import { addTupleType, Tuple } from "@synerty/vortexjs"
import { deviceTuplePrefix } from "./_private/PluginNames"


@addTupleType
export class DeviceGpsLocationTuple extends Tuple {
    public static readonly tupleName = deviceTuplePrefix + "GpsLocationTuple"
    
    // This field allows customer specific data, that peek doesn't need to work
    data: { [key: string]: any } = {}
    
    latitude: number
    longitude: number
    timestamp: number
    deviceToken: string
    
    constructor() {
        super(DeviceGpsLocationTuple.tupleName)
    }
}