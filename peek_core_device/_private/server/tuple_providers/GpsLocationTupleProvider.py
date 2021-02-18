import logging
from typing import Union

from twisted.internet.defer import Deferred
from vortex.DeferUtil import deferToThreadWrapWithLogger
from vortex.Payload import Payload
from vortex.TupleSelector import TupleSelector
from vortex.handler.TupleDataObservableHandler import TuplesProviderABC

from peek_core_device._private.storage.GpsLocationTable import GpsLocationTable

logger = logging.getLogger(__name__)

class GpsLocationTupleProvider(TuplesProviderABC):
    def __init__(self, ormSessionCreator):
        self._ormSessionCreator = ormSessionCreator

    @deferToThreadWrapWithLogger(logger)
    def makeVortexMsg(self, filt: dict,
                      tupleSelector: TupleSelector) -> Union[Deferred, bytes]:
        deviceId = tupleSelector.selector.get("deviceId")

        ormSession = self._ormSessionCreator()
        try:
            query = ormSession.query(GpsLocationTable)

            if deviceId:
                query = query.filter(GpsLocationTable.deviceId == deviceId)

            tuples = query.all()

            return Payload(filt, tuples=tuples).makePayloadEnvelope().toVortexMsg()
        finally:
            ormSession.close()