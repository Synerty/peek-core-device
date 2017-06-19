from vortex.Tuple import Tuple, addTupleType, TupleField

from peek_core_device._private.PluginNames import deviceTuplePrefix


@addTupleType
class DeviceTuple(Tuple):
    """ Device Tuple

    This tuple is a create example of defining classes to work with our data.
    """
    __tupleType__ = deviceTuplePrefix + 'DeviceTuple'

    #:  Description of date1
    dict1 = TupleField(defaultValue=dict)

    #:  Description of date1
    array1 = TupleField(defaultValue=list)

    #:  Description of date1
    date1 = TupleField()
