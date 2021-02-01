import { addTupleType, Tuple } from "@synerty/vortexjs"
import { deviceTuplePrefix } from "./_private/PluginNames"

export enum GpsLocationUpdateTypeEnum {
    COARSE = "COARSE",
    FINE = "FINE"
}

@addTupleType
export class GpsLocationUpdateTupleAction extends Tuple {
    public static readonly tupleName = deviceTuplePrefix + "GpsLocationUpdateTupleAction"
    
    // This field allows customer specific data, that peek doesn't need to work
    data: { [key: string]: any } = {}
    
    latitude: number
    longitude: number
    updateType: GpsLocationUpdateTypeEnum
    
    constructor() {
        super(GpsLocationUpdateTupleAction.tupleName)
    }
}