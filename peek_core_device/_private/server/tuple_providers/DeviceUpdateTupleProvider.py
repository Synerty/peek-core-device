from datetime import datetime
from typing import Union

from twisted.internet.defer import Deferred

from peek_core_device._private.storage.DeviceInfoTuple import DeviceInfoTuple
from peek_core_device._private.storage.DeviceUpdateTuple import DeviceUpdateTuple
from txhttputil.util.DeferUtil import deferToThreadWrap
from vortex.Payload import Payload
from vortex.TupleSelector import TupleSelector
from vortex.handler.TupleDataObservableHandler import TuplesProviderABC


class DeviceUpdateTupleProvider(TuplesProviderABC):
    def __init__(self, ormSessionCreator):
        self._ormSessionCreator = ormSessionCreator

    @deferToThreadWrap
    def makeVortexMsg(self, filt: dict,
                      tupleSelector: TupleSelector) -> Union[Deferred, bytes]:
        # Potential filters can be placed here.
        deviceToken = tupleSelector.selector["deviceToken"]

        session = self._ormSessionCreator()
        try:
            deviceInfo = (
                session.query(DeviceInfoTuple)
                    .filter(DeviceInfoTuple.deviceToken == deviceToken)
                    .one()
            )

            # Update the update check time for this device.
            deviceInfo.lastUpdateCheck = datetime.utcnow()

            updates = (
                session.query(DeviceUpdateTuple)
                    .filter(DeviceUpdateTuple.deviceType == deviceInfo.deviceType)
                    .filter(DeviceUpdateTuple.enabled == True)
                    .order_by(DeviceUpdateTuple.buildDate)
                    .all()
            )

            tuples = []
            if updates:
                tuples = updates[-1]

            # Create the vortex message
            msg = Payload(filt, tuples=tuples).toVortexMsg()

            session.commit()

        finally:
            session.close()

        return msg
