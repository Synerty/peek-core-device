import logging
from datetime import datetime

from sqlalchemy.dialects.postgresql import insert
from twisted.internet.defer import Deferred
from twisted.internet.defer import inlineCallbacks
from vortex.TupleAction import TupleActionABC
from vortex.handler.TupleActionProcessor import TupleActionProcessorDelegateABC

from peek_core_device._private.storage.GpsLocationTable import GpsLocationTable
from peek_core_device._private.tuples.GpsLocationUpdateTupleAction import (
    GpsLocationUpdateTupleAction,
)

logger = logging.getLogger(__name__)


class GpsController(TupleActionProcessorDelegateABC):
    def __init__(self, dbSessionCreator):
        self._dbSessionCreator = dbSessionCreator

    def shutdown(self):
        pass

    def processTupleAction(self, tupleAction: TupleActionABC) -> Deferred:
        if isinstance(tupleAction, GpsLocationUpdateTupleAction):
            return self._processGpsLocationUpdateTupleAction(tupleAction)

    # @inlineCallbacks
    def _processGpsLocationUpdateTupleAction(
        self, action: GpsLocationUpdateTupleAction
    ):
        now = datetime.now()
        currentLocation = {
            # TODO: get deviceId
            "deviceId": "55558558358173e746e31cdaa2f840b0",
            "latitude": action.latitude,
            "longitude": action.longitude,
            "updatedDate": now,
        }

        statement = insert(GpsLocationTable).values(currentLocation)
        statement = statement.on_conflict_do_update(
            index_elements=[GpsLocationTable.deviceId],
            set_=currentLocation,
        )
        session = self._dbSessionCreator()
        try:
            session.execute(statement)
        finally:
            session.close()

        logger.debug(action)
        return []
