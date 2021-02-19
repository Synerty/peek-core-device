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
class GpsLocationTable(Tuple, DeclarativeBase):
    __tablename__ = "GpsLocation"
    __tupleType__ = deviceTuplePrefix + "GpsLocationTable"

    id = Column(Integer, primary_key=True)
    deviceId = Column(
        String(50), ForeignKey("DeviceInfo.deviceId"), nullable=False,
        unique=True
    )
    # TODO: update alembic migration scripts
    deviceToken = Column(
        String(50), ForeignKey("DeviceInfo.deviceToken"), nullable=False,
        unique=True
    )
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    updatedDate = Column(DateTime(True), nullable=False)
