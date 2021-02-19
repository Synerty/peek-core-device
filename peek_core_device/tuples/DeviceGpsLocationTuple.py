from vortex.Tuple import Tuple
from vortex.Tuple import TupleField
from vortex.Tuple import addTupleType

from peek_core_device._private.PluginNames import deviceTuplePrefix


@addTupleType
class DeviceGpsLocationTuple(Tuple):
    __tupleType__ = deviceTuplePrefix + "GpsLocationTuple"

    latitude: float = TupleField()
    longitude: float = TupleField()
    timestamp: int = TupleField(comment="timestamp in milliseconds")
    deviceId: str = TupleField()
