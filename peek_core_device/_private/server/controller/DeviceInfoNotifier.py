import logging

from twisted.internet import reactor

from peek_core_device._private.storage.DeviceInfoTuple import DeviceInfoTuple
from vortex.TupleSelector import TupleSelector
from vortex.handler.TupleActionProcessor import TupleActionProcessorDelegateABC
from vortex.handler.TupleDataObservableHandler import TupleDataObservableHandler

logger = logging.getLogger(__name__)


class DeviceInfoNotifier(TupleActionProcessorDelegateABC):
    @classmethod
    def notify(cls, deviceId: str,
               tupleObservable: TupleDataObservableHandler):
        reactor.callLater(0, cls._notifyObservable, deviceId, tupleObservable)

    @staticmethod
    def _notifyObservable(deviceId: str,
                          tupleObservable: TupleDataObservableHandler):
        """ Notify the observer of the update

         This tuple selector must exactly match what the UI observes

        """

        tupleObservable.notifyOfTupleUpdate(
            TupleSelector(DeviceInfoTuple.tupleName(), dict(deviceId=deviceId))
        )

        tupleObservable.notifyOfTupleUpdate(
            TupleSelector(DeviceInfoTuple.tupleName(), dict())
        )
