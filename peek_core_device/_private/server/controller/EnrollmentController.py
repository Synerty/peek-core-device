import logging
from datetime import datetime
from typing import List
from uuid import uuid4

from twisted.internet import reactor
from twisted.internet.defer import Deferred

from peek_core_device._private.storage.DeviceInfoTuple import DeviceInfoTuple
from peek_core_device._private.storage.Setting import globalSetting, AUTO_ENROLLMENT
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
        ormSession = self._dbSessionCreator()
        try:
            deviceInfo = DeviceInfoTuple()
            deviceInfo.description = action.description
            deviceInfo.deviceId = action.deviceId
            deviceInfo.deviceType = action.deviceType
            deviceInfo.deviceToken = str(uuid4())
            deviceInfo.createdDate = datetime.utcnow()
            deviceInfo.appVersion = '0.0.0'
            deviceInfo.isEnrolled = globalSetting(ormSession, AUTO_ENROLLMENT)
            ormSession.add(deviceInfo)
            ormSession.commit()

            self._notifyObservableFromMainThread(deviceId=deviceInfo.deviceId)

            ormSession.refresh(deviceInfo)
            ormSession.expunge_all()
            return [deviceInfo]

        finally:
            # Always close the session after we create it
            ormSession.close()

    @deferToThreadWrapWithLogger(logger)
    def _processAdminUpdateEnrolment(self, action: UpdateEnrollmentAction) -> Deferred:
        session = self._dbSessionCreator()
        try:
            deviceInfo = (
                session.query(DeviceInfoTuple)
                    .filter(DeviceInfoTuple.id == action.deviceInfoId)
                    .one()
            )

            deviceId = deviceInfo.deviceId

            if action.remove:
                session.delete(deviceInfo)
            else:
                deviceInfo.isEnrolled = not action.unenroll

            session.commit()

            self._notifyObservableFromMainThread(deviceId=deviceId)

        finally:
            # Always close the session after we create it
            session.close()

    def _notifyObservableFromMainThread(self, deviceId):
        reactor.callLater(0, self._notifyObservable, deviceId)

    def _notifyObservable(self, deviceId):
        """ Notify the observer of the update

         This tuple selector must exactly match what the UI observes

        """

        self._tupleObservable.notifyOfTupleUpdate(
            TupleSelector(DeviceInfoTuple.tupleName(), dict(deviceId=deviceId))
        )

        self._tupleObservable.notifyOfTupleUpdate(
            TupleSelector(DeviceInfoTuple.tupleName(), dict())
        )
