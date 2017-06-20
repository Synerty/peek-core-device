import {addTupleType, TupleActionABC} from "@synerty/vortexjs";
import {deviceTuplePrefix} from "../../PluginNames";


@addTupleType
export class AuthoriseEnrolmentAction extends TupleActionABC {
    public static readonly tupleName = deviceTuplePrefix + "AuthoriseEnrolmentAction";

    deviceInfoId: number;

    constructor() {
        super(AuthoriseEnrolmentAction.tupleName)
    }
}