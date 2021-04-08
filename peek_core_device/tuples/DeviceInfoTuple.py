import logging

from vortex.Tuple import Tuple
from vortex.Tuple import TupleField
from vortex.Tuple import addTupleType

from peek_core_device._private.PluginNames import deviceTuplePrefix
from peek_core_device.tuples.DeviceGpsLocationTuple import DeviceGpsLocationTuple


logger = logging.getLogger(__name__)


@addTupleType
class DeviceInfoTuple(Tuple):
    """DeviceInfoTuple

    This table stores information about devices.

    """

    __tupleType__ = deviceTuplePrefix + "DeviceInfoTuple"

    TYPE_MOBILE_IOS = "mobile-ios"
    TYPE_MOBILE_ANDROUD = "mobile-android"
    TYPE_MOBILE_WEB = "mobile-web"
    TYPE_DESKTOP_WEB = "desktop-web"
    TYPE_DESKTOP_WINDOWS = "desktop-windows"
    TYPE_DESKTOP_MACOS = "desktop-macos"

    DEVICE_OFFLINE = 0
    DEVICE_ONLINE = 1
    DEVICE_BACKGROUND = 2

    description = TupleField()
    deviceId = TupleField()
    deviceType = TupleField()
    deviceToken = TupleField()
    appVersion = TupleField()
    updateVersion = TupleField()
    lastOnline = TupleField()
    lastUpdateCheck = TupleField()
    createdDate = TupleField()
    deviceStatus = TupleField()
    isEnrolled = TupleField()
    currentLocation: DeviceGpsLocationTuple = TupleField()
