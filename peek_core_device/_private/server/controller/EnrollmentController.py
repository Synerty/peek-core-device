import logging
from datetime import datetime
from typing import List

from twisted.internet import reactor
from twisted.internet.defer import Deferred

from peek_core_device._private.storage.DeviceInfoTuple import DeviceInfoTuple
from peek_core_device._private.tuples.EnrolDeviceAction import EnrolDeviceAction
from peek_core_device._private.tuples.UpdateEnrollmentAction import UpdateEnrollmentAction
from vortex.DeferUtil import deferToThreadWrapWithLogger
from vortex.Tuple import Tuple
from vortex.TupleAction import TupleActionABC
from vortex.TupleSelector import TupleSelector
from vortex.handler.TupleActionProcessor import TupleActionProcessorDelegateABC
from vortex.handler.TupleDataObservableHandler import TupleDataObservableHandler

logger = logging.getLogger(__name__)


class EnrollmentController(TupleActionProcessorDelegateABC):
    def __init__(self, dbSessionCreator, tupleObservable: TupleDataObservableHandler):
        self._dbSessionCreator = dbSessionCreator
        self._tupleObservable = tupleObservable

    def shutdown(self):
        pass

    def processTupleAction(self, tupleAction: TupleActionABC) -> List[Tuple]:

        if isinstance(tupleAction, EnrolDeviceAction):
            self._processDeviceEnrolment(tupleAction)
            return []

        if isinstance(tupleAction, UpdateEnrollmentAction):
            self._processAdminUpdateEnrolment(tupleAction)
            return []

        raise NotImplementedError(tupleAction.tupleName())

    @deferToThreadWrapWithLogger(logger)
    def _processDeviceEnrolment(self, action: EnrolDeviceAction) -> Deferred:
        session = self._dbSessionCreator()
        try:
            deviceInfo = DeviceInfoTuple()
            deviceInfo.description = action.description
            deviceInfo.deviceId = action.deviceId
            deviceInfo.deviceType = action.deviceType
            deviceInfo.deviceToken = 'nothing'
            deviceInfo.createdDate = datetime.utcnow()
            deviceInfo.appVersion = '0.0.0'
            session.add(deviceInfo)
            session.commit()

            self._notifyObservable(deviceId=action.deviceId)

        finally:
            # Always close the session after we create it
            session.close()

    @deferToThreadWrapWithLogger(logger)
    def _processAdminUpdateEnrolment(self, action: UpdateEnrollmentAction) -> Deferred:
        session = self._dbSessionCreator()
        try:
            deviceInfo = (
                session.query(DeviceInfoTuple)
                    .filter(DeviceInfoTuple.id == action.deviceInfoId)
                    .one()
            )

            if action.remove:
                session.delete(deviceInfo)
            else:
                deviceInfo.isEnrolled = not action.unenroll

            session.commit()

            self._notifyObservable(deviceId=action.deviceId)

        finally:
            # Always close the session after we create it
            session.close()

    def _notifyObservable(self, deviceId):
        # Notify the observer of the update
        # This tuple selector must exactly match what the UI observes

        reactor.callLater(
            0, self._tupleObservable.notifyOfTupleUpdate,
            TupleSelector(DeviceInfoTuple.tupleName(), dict(deviceId=deviceId))
        )

        reactor.callLater(
            0, self._tupleObservable.notifyOfTupleUpdate,
            TupleSelector(DeviceInfoTuple.tupleName(), dict())
        )
