from peek_core_device._private.PluginNames import deviceTuplePrefix
from vortex.Tuple import Tuple, addTupleType, TupleField


@addTupleType
class ToggleUpdateEnabledAction(Tuple):
    """ Device Tuple

    This tuple is a create example of defining classes to work with our data.
    """
    __tupleType__ = deviceTuplePrefix + 'ToggleUpdateEnabledAction'

    #:  the ID of the DeviceUpdateTuple
    updateId: int = TupleField()
