from vortex.Tuple import Tuple, addTupleType, TupleField

from peek_core_device._private.PluginNames import deviceTuplePrefix


@addTupleType
class BuildUpdateAction(Tuple):
    """ Build Update Action

    This instructs the

    """
    __tupleType__ = deviceTuplePrefix + 'BuildUpdateAction'

    #:  Description of date1
    deviceType:str = TupleField()