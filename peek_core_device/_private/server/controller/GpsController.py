import logging
from collections import namedtuple
from typing import Optional

from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import IntegrityError
from twisted.internet.defer import Deferred
from twisted.internet.defer import inlineCallbacks
from vortex.DeferUtil import callMethodLater
from vortex.DeferUtil import deferToThreadWrapWithLogger
from vortex.DeferUtil import vortexLogFailure
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

logger = logging.getLogger(__name__)
DeviceLocationTuple = namedtuple(
    "DeviceLocationTuple",
    ["deviceToken", "latitude", "longitude", "updatedDate"],
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
        self._tupleObservable = tupleObservable
        self._notifierController = notifierController

    def shutdown(self):
        pass

    def processTupleAction(self, tupleAction: TupleActionABC) -> Deferred:
        if isinstance(tupleAction, UpdateDeviceGpsLocationTupleAction):
            # We don't need to make the client wait for this request
            d = self._processGpsLocationUpdateTupleAction(tupleAction)
            d.addErrback(vortexLogFailure, logger, consumeError=True)
            return []

    @inlineCallbacks
    def _processGpsLocationUpdateTupleAction(
        self, action: UpdateDeviceGpsLocationTupleAction
    ):
        # capturedDate = datetime.now()
        currentLocation = DeviceLocationTuple(
            deviceToken=action.deviceToken,
            latitude=action.latitude,
            longitude=action.longitude,
            updatedDate=action.datetime,
        )
        updatedGpsLocationTableRow = yield self._insertGpsLocation(
            currentLocation
        )
        if updatedGpsLocationTableRow:
            self._notifyTuple(updatedGpsLocationTableRow)

    @callMethodLater
    def _notifyTuple(self, gpsLocationTable: GpsLocationTable):
        tuple_ = gpsLocationTable.toTuple()
        self._tupleObservable.notifyOfTupleUpdate(
            TupleSelector(
                tuple_.tupleName(), dict(deviceToken=tuple_.deviceToken)
            )
        )

        self._notifierController.notifyDeviceGpsLocation(
            gpsLocationTable.deviceToken,
            gpsLocationTable.latitude,
            gpsLocationTable.longitude,
            updatedDate=gpsLocationTable.updatedDate,
        )

    @deferToThreadWrapWithLogger(logger)
    def _insertGpsLocation(
        self, currentLocation: DeviceLocationTuple
    ) -> Optional[GpsLocationTable]:
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

            record = GpsLocationHistoryTable(
                deviceToken=currentLocation.deviceToken,
                latitude=currentLocation.latitude,
                longitude=currentLocation.longitude,
                loggedDate=currentLocation.updatedDate,
            )
            session.add(record)

            session.commit()

            if not insertedPrimaryKey:
                return

            # get the affected row
            updatedRows = session.query(GpsLocationTable).filter(
                GpsLocationTable.id == r.inserted_primary_key[0]
            )
            result = updatedRows.one()
            session.expunge_all()
            return result

        except IntegrityError:
            # This is most likely because
            # the device token does not yet exist in database
            # Most likely because the device enrollment hasn't finished
            session.rollback()
            pass

        finally:
            session.close()
