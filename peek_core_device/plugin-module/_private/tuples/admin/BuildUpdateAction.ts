import {addTupleType, TupleActionABC} from "@synerty/vortexjs";
import {deviceTuplePrefix} from "../../PluginNames";


@addTupleType
export class BuildUpdateAction extends TupleActionABC {
    public static readonly tupleName = deviceTuplePrefix + "BuildUpdateAction";

    deviceType: string;

    constructor() {
        super(BuildUpdateAction.tupleName)
    }
}