 import {addTupleType, Tuple, TupleActionABC} from "@synerty/vortexjs";
import {deviceTuplePrefix} from "../PluginNames";

@addTupleType
export class AddIntValueActionTuple extends TupleActionABC {
    static readonly tupleName = deviceTuplePrefix + "AddIntValueActionTuple";

    stringIntId: number;
    offset: number;

    constructor() {
        super(AddIntValueActionTuple.tupleName)
    }
}