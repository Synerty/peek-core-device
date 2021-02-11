import logging

from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Float
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.sql.schema import ForeignKey
from vortex.Tuple import Tuple
from vortex.Tuple import addTupleType

from peek_core_device._private.PluginNames import deviceTuplePrefix
from .DeclarativeBase import DeclarativeBase

logger = logging.getLogger(__name__)


@addTupleType
class GpsLocationHistoryTable(Tuple, DeclarativeBase):
    __tablename__ = "GpsLocationHistory"
    __tupleType__ = deviceTuplePrefix + "GpsLocationHistoryTable"

    id = Column(Integer, primary_key=True, autoincrement=True)
    deviceId = Column(
        String(50),
        ForeignKey("DeviceInfo.deviceId"),
        nullable=False,
        primary_key=True,
    )
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    loggedDate = Column(DateTime(True), nullable=False, primary_key=True)
