from typing import Optional
from typing import Tuple

from vortex.Tuple import TupleField
from vortex.Tuple import addTupleType
from vortex.TupleAction import TupleActionABC

from peek_core_device._private.PluginNames import deviceTuplePrefix


@addTupleType
class GpsLocationUpdateTypeEnum(Tuple):
    __tupleType__ = deviceTuplePrefix + "GpsLocationUpdateTypeEnum"
    ACCURACY_COARSE = 1
    ACCURACY_FINE = 2

    value = TupleField(typingType=str)

    def __init__(self, value: Optional[str] = None):
        Tuple.__init__(self)
        self.value = value


@addTupleType
class GpsLocationUpdateTupleAction(TupleActionABC):
    __tupleType__ = deviceTuplePrefix + "GpsLocationUpdateTupleAction"

    latitude: float = TupleField()
    longitude: float = TupleField()
    updateType: GpsLocationUpdateTypeEnum = TupleField()
