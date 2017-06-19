                                       import {addTupleType, Tuple, TupleActionABC} from "@synerty/vortexjs";
import {deviceTuplePrefix} from "../PluginNames";

@addTupleType
export class StringCapToggleActionTuple extends TupleActionABC {
    static readonly tupleName = deviceTuplePrefix + "StringCapToggleActionTuple";

    stringIntId: number;

    constructor() {
        super(StringCapToggleActionTuple.tupleName)
    }
}