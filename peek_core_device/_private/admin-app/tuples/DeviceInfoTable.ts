import { addTupleType, Tuple } from "@synerty/vortexjs"
import { DeviceTypeEnum, deviceTuplePrefix } from "@peek/peek_core_device/_private"
import { DeviceGpsLocationTuple } from "@peek/peek_core_device"
import { Capacitor } from "@capacitor/core"

@addTupleType
export class DeviceInfoTable extends Tuple {
    public static readonly tupleName = deviceTuplePrefix + "DeviceInfoTable"

    readonly TYPE_FIELD_IOS = "field-ios"
    readonly TYPE_FIELD_ANDROID = "field-android"
    readonly TYPE_MOBILE_WEB = "mobile-web"
    readonly TYPE_DESKTOP_WEB = "desktop-web"
    readonly TYPE_DESKTOP_WINDOWS = "desktop-windows"
    readonly TYPE_DESKTOP_MACOS = "desktop-macos"
    
    readonly DEVICE_OFFLINE = 0
    readonly DEVICE_ONLINE = 1
    readonly DEVICE_BACKGROUND = 2

    id: string
    description: string
    deviceId: string
    deviceType: string
    deviceToken: string
    appVersion: string
    updateVersion: string
    lastOnline: Date
    lastUpdateCheck: Date
    createdDate: Date
    deviceStatus: number
    isEnrolled: boolean
    currentLocation: DeviceGpsLocationTuple

    constructor() {
        super(DeviceInfoTable.tupleName)
    }

    get isWeb(): boolean {
        return !Capacitor.isNative
    }

    get isBackgrounded(): boolean {
        return !!(this.deviceStatus & this.DEVICE_BACKGROUND)
    }

    get googleMapLink() {
        if (!this.hasCurrentLocation()) {
            throw new Error("current location is not available")
        }
        return "https://www.google.com/maps/search/?api=1&query="
            + `${this.currentLocation.latitude},${this.currentLocation.longitude}`
    }

    setDeviceType(val: DeviceTypeEnum) {
        switch (val) {
            case DeviceTypeEnum.DESKTOP_WEB:
                this.deviceType = this.TYPE_DESKTOP_WEB
                break

            case DeviceTypeEnum.DESKTOP_MACOS:
                this.deviceType = this.TYPE_DESKTOP_MACOS
                break

            case DeviceTypeEnum.DESKTOP_WINDOWS:
                this.deviceType = this.TYPE_DESKTOP_WINDOWS
                break

            case DeviceTypeEnum.FIELD_IOS:
                this.deviceType = this.TYPE_FIELD_IOS
                break

            case DeviceTypeEnum.FIELD_ANDROID:
                this.deviceType = this.TYPE_FIELD_ANDROID
                break

            case DeviceTypeEnum.MOBILE_WEB:
                this.deviceType = this.TYPE_MOBILE_WEB
                break

        }
    }

    hasCurrentLocation() {
        if (!this.currentLocation?.latitude) {
            return false
        }
        if (typeof this.currentLocation.latitude === "number") {
            return true
        }
        return false
    }
}
