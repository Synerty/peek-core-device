import logging
from collections import namedtuple
from datetime import datetime

from sqlalchemy.dialects.postgresql import insert
from twisted.internet.defer import Deferred
from twisted.internet.defer import inlineCallbacks
from vortex.TupleAction import TupleActionABC
from vortex.handler.TupleActionProcessor import TupleActionProcessorDelegateABC

from peek_core_device._private.storage.GpsLocationHistoryTable import (
    GpsLocationHistoryTable,
)
from peek_core_device._private.storage.GpsLocationTable import GpsLocationTable
from peek_core_device._private.tuples.GpsLocationUpdateTupleAction import (
    GpsLocationUpdateTupleAction,
)

logger = logging.getLogger(__name__)
DeviceLocationTuple = namedtuple(
    "DeviceLocationTuple", ["deviceId", "latitude", "longitude", "updatedDate"]
)


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
        currentLocation = DeviceLocationTuple(
            # TODO: get deviceId
            deviceId="55558558358173e746e31cdaa2f840b0",
            latitude=action.latitude,
            longitude=action.longitude,
            updatedDate=now,
        )
        self._updateCurrentLocation(currentLocation)
        self._logToHistory(currentLocation)
        logger.debug(action)
        return []

    def _updateCurrentLocation(self, currentLocation: DeviceLocationTuple):
        statement = insert(GpsLocationTable).values(currentLocation._asdict())
        statement = statement.on_conflict_do_update(
            index_elements=[GpsLocationTable.deviceId],
            set_=currentLocation._asdict(),
        )
        session = self._dbSessionCreator()
        try:
            session.execute(statement)
            session.commit()
        finally:
            session.close()

    def _logToHistory(self, currentLocation: DeviceLocationTuple):
        session = self._dbSessionCreator()
        record = GpsLocationHistoryTable(
            deviceId=currentLocation.deviceId,
            latitude=currentLocation.latitude,
            longitude=currentLocation.longitude,
            loggedDate=currentLocation.updatedDate,
        )
        try:
            session.add(record)
            session.commit()
        finally:
            session.close()
