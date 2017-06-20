import {addTupleType, TupleActionABC} from "@synerty/vortexjs";
import {deviceTuplePrefix} from "../../PluginNames";


@addTupleType
export class ToggleUpdateEnabledAction extends TupleActionABC {
    public static readonly tupleName = deviceTuplePrefix + "ToggleUpdateEnabledAction";

    updateId: number;

    constructor() {
        super(ToggleUpdateEnabledAction.tupleName)
    }
}