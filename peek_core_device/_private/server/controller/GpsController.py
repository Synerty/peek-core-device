import logging
from collections import namedtuple
from copy import deepcopy
from datetime import datetime
from typing import List

import pytz
from sqlalchemy.dialects.postgresql import insert
from twisted.internet.defer import Deferred
from twisted.internet.defer import inlineCallbacks
from vortex.TupleAction import TupleActionABC
from vortex.TupleSelector import TupleSelector
from vortex.handler.TupleActionProcessor import TupleActionProcessorDelegateABC
from vortex.handler.TupleDataObservableHandler import TupleDataObservableHandler

from peek_core_device._private.server.controller.NotifierController import (
    NotifierController,
)
from peek_core_device._private.storage.GpsLocationHistoryTable import (
    GpsLocationHistoryTable,
)
from peek_core_device._private.storage.GpsLocationTable import GpsLocationTable
from peek_core_device._private.tuples.UpdateDeviceGpsLocationTupleAction import (
    UpdateDeviceGpsLocationTupleAction,
)
from peek_core_device.tuples.DeviceGpsLocationTuple import \
    DeviceGpsLocationTuple

logger = logging.getLogger(__name__)
DeviceLocationTuple = namedtuple(
    "DeviceLocationTuple",
    ["deviceToken", "latitude", "longitude", "updatedDate"]
)
TimezoneSetting = namedtuple("TimezoneSetting", ["timezone"])


class GpsController(TupleActionProcessorDelegateABC):
    def __init__(
        self,
        dbSessionCreator,
        tupleObservable: TupleDataObservableHandler,
        notifierController: NotifierController,
    ):
        self._dbSessionCreator = dbSessionCreator
        self._localTimezoneSetting = TimezoneSetting(
            timezone=self._getPeekDatabaseTimezone()
        )
        self._tupleObservable = tupleObservable
        self._notifierController = notifierController

    def shutdown(self):
        pass

    def processTupleAction(self, tupleAction: TupleActionABC) -> Deferred:
        if isinstance(tupleAction, UpdateDeviceGpsLocationTupleAction):
            return self._processGpsLocationUpdateTupleAction(tupleAction)

    @inlineCallbacks
    def _processGpsLocationUpdateTupleAction(
        self, action: UpdateDeviceGpsLocationTupleAction
    ):
        yield
        capturedDate = self._convertMillisecondTimestampFromUtcToLocal(action.timestamp)
        currentLocation = DeviceLocationTuple(
            deviceToken=action.deviceToken,
            latitude=action.latitude,
            longitude=action.longitude,
            updatedDate=capturedDate,
        )
        updatedGpsLocationTableRow = self._updateCurrentLocation(
            currentLocation)
        self._logToHistory(currentLocation)
        self._notifyTuple(updatedGpsLocationTableRow)
        logger.debug(action)
        return []

    def _notifyTuple(self, gpsLocationTable: GpsLocationTable):
        tuple_ = gpsLocationTable.toTuple()
        self._tupleObservable.notifyOfTupleUpdate(
            TupleSelector(
                tuple_.tupleName(),
                dict(deviceToken=tuple_.deviceToken),
            )
        )

        self._tupleObservable.notifyOfTupleUpdate(
            TupleSelector(tuple_.tupleName(), dict())
        )

        self._notifierController.notifyDeviceGpsLocation(
            gpsLocationTable.deviceToken,
            gpsLocationTable.latitude,
            gpsLocationTable.longitude,
            updatedDate=gpsLocationTable.updatedDate,
        )

    def _updateCurrentLocation(
        self, currentLocation: DeviceLocationTuple
    ) -> GpsLocationTable:
        statement = insert(GpsLocationTable).values(currentLocation._asdict())
        statement = statement.on_conflict_do_update(
            index_elements=[GpsLocationTable.deviceToken],
            set_=currentLocation._asdict(),
        )
        session = self._dbSessionCreator()
        try:
            # upsert updates
            r = session.execute(statement)
            insertedPrimaryKey = r.inserted_primary_key[0]
            session.commit()

            if not insertedPrimaryKey:
                return

            # get the affected row
            updatedRows = session.query(GpsLocationTable).filter(
                GpsLocationTable.id == r.inserted_primary_key[0]
            )
            return deepcopy(updatedRows.one())
        finally:
            session.rollback()
            session.close()

    def _logToHistory(self, currentLocation: DeviceLocationTuple):
        session = self._dbSessionCreator()
        record = GpsLocationHistoryTable(
            deviceToken=currentLocation.deviceToken,
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
