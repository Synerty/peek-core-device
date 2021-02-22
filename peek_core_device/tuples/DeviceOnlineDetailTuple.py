from vortex.Tuple import Tuple
from vortex.Tuple import TupleField
from vortex.Tuple import addTupleType

from peek_core_device._private.PluginNames import deviceTuplePrefix


@addTupleType
class DeviceOnlineDetailTuple(Tuple):
    __tupleType__ = deviceTuplePrefix + "DeviceOnlineDetailTuple"

    deviceId: str = TupleField()
    deviceToken: str = TupleField()
    onlineStatus: bool = TupleField()
