from vortex.Tuple import Tuple
from vortex.Tuple import TupleField
from vortex.Tuple import addTupleType

from peek_core_device._private.PluginNames import deviceTuplePrefix


@addTupleType
class DeviceDetailTuple(Tuple):
    __tupleType__ = deviceTuplePrefix + "DeviceDetailTuple"

    deviceToken: str = TupleField()
    deviceType: str = TupleField()
    description: str = TupleField()
    lastOnline: str = TupleField()
    isOnline: bool = TupleField()
