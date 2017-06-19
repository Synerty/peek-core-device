from vortex.Tuple import addTupleType, TupleField
from vortex.TupleAction import TupleActionABC

from peek_core_device._private.PluginNames import deviceTuplePrefix


@addTupleType
class AddIntValueActionTuple(TupleActionABC):
    __tupleType__ = deviceTuplePrefix + "AddIntValueActionTuple"

    stringIntId = TupleField()
    offset = TupleField()
