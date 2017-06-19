import {addTupleType, Tuple} from "@synerty/vortexjs";
import {deviceTuplePrefix} from "../PluginNames";


@addTupleType
export class DeviceTuple extends Tuple {
    public static readonly tupleName = deviceTuplePrefix + "DeviceTuple";

    //  Description of date1
    dict1 : {};

    //  Description of array1
    array1 : any[];

    //  Description of date1
    date1 : Date;

    constructor() {
        super(DeviceTuple.tupleName)
    }
}