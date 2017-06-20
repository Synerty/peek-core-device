import {addTupleType, Tuple} from "@synerty/vortexjs";
import {deviceTuplePrefix} from "./_private/PluginNames";


@addTupleType
export class DeviceInfoTuple extends Tuple {
    public static readonly tupleName = deviceTuplePrefix + "DeviceInfoTuple";

    readonly TYPE_MOBILE_IOS = "mobile-ios";
    readonly TYPE_MOBILE_ANDROUD = "mobile-android";
    readonly TYPE_MOBILE_WEB = "mobile-web";
    readonly TYPE_DESKTOP_WEB = "desktop-web";
    readonly TYPE_DESKTOP_WINDOWS = "desktop-windows";
    readonly TYPE_DESKTOP_MACOS = "desktop-macos";

    id: string;
    description: string;
    deviceId: string;
    deviceType: string;
    deviceToken: string;
    appVersion: string;
    updateVersion: string;
    lastOnline: Date;
    isOnline: boolean;
    isEnrolled: boolean;

    constructor() {
        super(DeviceInfoTuple.tupleName)
    }
}