import logging
from datetime import datetime

from sqlalchemy import Column
from sqlalchemy.sql.sqltypes import Boolean
from sqlalchemy.sql.sqltypes import DateTime
from sqlalchemy.sql.sqltypes import Integer
from sqlalchemy.sql.sqltypes import String

from .DeclarativeBase import DeclarativeBase
from ...tuples.DeviceGpsLocationTuple import DeviceGpsLocationTuple
from ...tuples.DeviceInfoTuple import DeviceInfoTuple

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
    isOnline = Column(Boolean, nullable=False, server_default="0")
    isEnrolled = Column(Boolean, nullable=False, server_default="0")

    @staticmethod
    def toTuple(
        description: str,
        deviceId: str,
        deviceType: str,
        deviceToken: str,
        appVersion: str,
        updateVersion: str,
        lastOnline: datetime,
        lastUpdateCheck: datetime,
        createdDate: datetime,
        isOnline: bool,
        isEnrolled: bool,
        currentLocationTuple: DeviceGpsLocationTuple = None,
    ):
        return DeviceInfoTuple(
            description=description,
            deviceId=deviceId,
            deviceType=deviceType,
            deviceToken=deviceToken,
            appVersion=appVersion,
            updateVersion=updateVersion,
            lastOnline=lastOnline,
            lastUpdateCheck=lastUpdateCheck,
            createdDate=createdDate,
            isOnline=isOnline,
            isEnrolled=isEnrolled,
            currentLocation=currentLocationTuple,
        )
