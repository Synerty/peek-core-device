import { addTupleType, Tuple } from "@synerty/vortexjs"
import { deviceTuplePrefix } from "./_private/PluginNames"


@addTupleType
export class GpsLocationTuple extends Tuple {
    public static readonly tupleName = deviceTuplePrefix + "GpsLocationTuple"
    
    // This field allows customer specific data, that peek doesn't need to work
    data: { [key: string]: any } = {}
    
    latitude: number
    longitude: number
    timestamp: number
    deviceId: string
    deviceToken: string
    
    constructor() {
        super(GpsLocationTuple.tupleName)
    }
}