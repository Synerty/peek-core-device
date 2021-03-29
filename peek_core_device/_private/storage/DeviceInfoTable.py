import logging

from peek_core_device.tuples.DeviceInfoTuple import DeviceInfoTuple
from sqlalchemy import Column
from sqlalchemy.sql.sqltypes import Boolean
from sqlalchemy.sql.sqltypes import DateTime
from sqlalchemy.sql.sqltypes import Integer
from sqlalchemy.sql.sqltypes import String

from .DeclarativeBase import DeclarativeBase
from ...tuples.DeviceGpsLocationTuple import DeviceGpsLocationTuple

logger = logging.getLogger(__name__)


class DeviceInfoTable(DeclarativeBase):
    """DeviceInfoTable

    This table stores information about devices.

    """

    __tablename__ = "DeviceInfo"

    TYPE_MOBILE_IOS = "mobile-ios"
    TYPE_MOBILE_ANDROUD = "mobile-android"
    TYPE_MOBILE_WEB = "mobile-web"
    TYPE_DESKTOP_WEB = "desktop-web"
    TYPE_DESKTOP_WINDOWS = "desktop-windows"
    TYPE_DESKTOP_MACOS = "desktop-macos"

    id = Column(Integer, primary_key=True)
    description = Column(String(100), nullable=False, unique=True)
    deviceId = Column(String(50), nullable=False, unique=True)
    deviceType = Column(String(20), nullable=False)
    deviceToken = Column(String(50), nullable=False, unique=True)
    appVersion = Column(String(15), nullable=False)
    updateVersion = Column(String(15))  # Null means it hasn't updated
    lastOnline = Column(DateTime(True))
    lastUpdateCheck = Column(DateTime(True))
    createdDate = Column(DateTime(True), nullable=False)
    deviceStatus = Column(Integer, nullable=False, server_default="0")
    isEnrolled = Column(Boolean, nullable=False, server_default="0")

    def toTuple(
        self,
        currentLocationTuple: DeviceGpsLocationTuple = None,
    ):
        return self.toTupleStatic(self, currentLocationTuple)

    @staticmethod
    def toTupleStatic(
        table: "DeviceInfoTable",
        currentLocationTuple: DeviceGpsLocationTuple = None
    ):
        return DeviceInfoTuple(
            description=table.description,
            deviceId=table.deviceId,
            deviceType=table.deviceType,
            deviceToken=table.deviceToken,
            appVersion=table.appVersion,
            updateVersion=table.updateVersion,
            lastOnline=table.lastOnline,
            lastUpdateCheck=table.lastUpdateCheck,
            createdDate=table.createdDate,
            deviceStatus=table.deviceStatus,
            isEnrolled=table.isEnrolled,
            currentLocation=currentLocationTuple,
        )
