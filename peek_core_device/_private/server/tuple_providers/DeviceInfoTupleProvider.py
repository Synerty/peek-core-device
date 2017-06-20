from typing import Union

from twisted.internet.defer import Deferred

from peek_core_device._private.storage.DeviceInfoTuple import DeviceInfoTuple
from txhttputil.util.DeferUtil import deferToThreadWrap
from vortex.Payload import Payload
from vortex.TupleSelector import TupleSelector
from vortex.handler.TupleDataObservableHandler import TuplesProviderABC


class DeviceInfoTupleProvider(TuplesProviderABC):
    def __init__(self, ormSessionCreator):
        self._ormSessionCreator = ormSessionCreator

    @deferToThreadWrap
    def makeVortexMsg(self, filt: dict,
                      tupleSelector: TupleSelector) -> Union[Deferred, bytes]:

        deviceId = tupleSelector.selector.get("deviceId")

        session = self._ormSessionCreator()
        try:
            qry = session.query(DeviceInfoTuple)

            if deviceId is not None:
                qry = qry.filter(DeviceInfoTuple.deviceId == deviceId)

            tuples = qry.all()

            # Create the vortex message
            msg = Payload(filt, tuples=tuples).toVortexMsg()

            session.commit()

        finally:
            session.close()

        return msg
