from vortex.handler.TupleDataObservableHandler import TupleDataObservableHandler

from peek_core_device._private.PluginNames import deviceFilt
from peek_core_device._private.PluginNames import deviceObservableName

from .tuple_providers.StringIntTupleProvider import StringIntTupleProvider
from peek_core_device._private.storage.StringIntTuple import StringIntTuple


def makeTupleDataObservableHandler(ormSessionCreator):
    """" Make Tuple Data Observable Handler

    This method creates the observable object, registers the tuple providers and then
    returns it.

    :param ormSessionCreator: A function that returns a SQLAlchemy session when called

    :return: An instance of :code:`TupleDataObservableHandler`

    """
    tupleObservable = TupleDataObservableHandler(
                observableName=deviceObservableName,
                additionalFilt=deviceFilt)

    # Register TupleProviders here
    tupleObservable.addTupleProvider(StringIntTuple.tupleName(),
                                     StringIntTupleProvider(ormSessionCreator))
    return tupleObservable
