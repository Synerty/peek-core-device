import logging
from collections import namedtuple
from datetime import datetime

import pytz
from sqlalchemy.dialects.postgresql import insert
from twisted.internet.defer import Deferred
from twisted.internet.defer import inlineCallbacks
from vortex.TupleAction import TupleActionABC
from vortex.TupleSelector import TupleSelector
from vortex.handler.TupleActionProcessor import TupleActionProcessorDelegateABC
from vortex.handler.TupleDataObservableHandler import TupleDataObservableHandler

from peek_core_device._private.storage.GpsLocationHistoryTable import (
    GpsLocationHistoryTable,
)
from peek_core_device._private.storage.GpsLocationTable import GpsLocationTable
from peek_core_device._private.tuples.GpsLocationUpdateTupleAction import (
    GpsLocationUpdateTupleAction,
)
from peek_core_device.tuples.DeviceGpsLocationTuple import \
    DeviceGpsLocationTuple

logger = logging.getLogger(__name__)
DeviceLocationTuple = namedtuple(
    "DeviceLocationTuple", ["deviceId", "latitude", "longitude", "updatedDate"]
)
TimezoneSetting = namedtuple("TimezoneSetting", ["timezone"])


class GpsController(TupleActionProcessorDelegateABC):
    def __init__(self, dbSessionCreator, tupleObservable: TupleDataObservableHandler):
        self._dbSessionCreator = dbSessionCreator
        self._localTimezoneSetting = TimezoneSetting(
            timezone=self._getPeekDatabaseTimezone()
        )
        self._tupleObservable = tupleObservable

    def shutdown(self):
        pass

    def processTupleAction(self, tupleAction: TupleActionABC) -> Deferred:
        if isinstance(tupleAction, GpsLocationUpdateTupleAction):
            return self._processGpsLocationUpdateTupleAction(tupleAction)

    @inlineCallbacks
    def _processGpsLocationUpdateTupleAction(
        self, action: GpsLocationUpdateTupleAction
    ):
        yield
        capturedDate = self._convertMillisecondTimestampFromUtcToLocal(action.timestamp)
        currentLocation = DeviceLocationTuple(
            deviceId=action.deviceId,
            latitude=action.latitude,
            longitude=action.longitude,
            updatedDate=capturedDate,
        )
        self._updateCurrentLocation(currentLocation)
        self._logToHistory(currentLocation)
        self._notifyTuple(currentLocation)
        logger.debug(action)
        return []

    def _notifyTuple(self, currentLocation: DeviceLocationTuple):
        self._tupleObservable.notifyOfTupleUpdate(
            TupleSelector(
                DeviceGpsLocationTuple.tupleName(),
                dict(deviceId=currentLocation.deviceId),
            )
        )

        self._tupleObservable.notifyOfTupleUpdate(
            TupleSelector(DeviceGpsLocationTuple.tupleName(), dict())
        )

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

    def _convertMillisecondTimestampFromUtcToLocal(self,
                                                   timestamp: int) -> datetime:
        timestamp = datetime.utcfromtimestamp(timestamp / 1000.0)
        # from UTC
        timestamp = timestamp.replace(tzinfo=pytz.utc)
        # set as local
        return timestamp.astimezone(
            pytz.timezone(self._localTimezoneSetting.timezone))

    def _getPeekDatabaseTimezone(self) -> str:
        session = self._dbSessionCreator()
        result = session.execute("SELECT current_setting('TIMEZONE') AS \"timezone\";")
        return result.first()["timezone"]
