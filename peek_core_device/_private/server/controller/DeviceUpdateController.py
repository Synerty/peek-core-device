import logging
from datetime import datetime
from typing import List
from uuid import uuid4

from twisted.internet import reactor
from twisted.internet.defer import Deferred

from peek_core_device._private.server.controller.DeviceInfoNotifier import DeviceInfoNotifier
from peek_core_device._private.storage.DeviceInfoTuple import DeviceInfoTuple
from peek_core_device._private.storage.DeviceUpdateTuple import DeviceUpdateTuple
from peek_core_device._private.storage.Setting import globalSetting, AUTO_ENROLLMENT
from peek_core_device._private.tuples.EnrolDeviceAction import EnrolDeviceAction
from peek_core_device._private.tuples.UpdateEnrollmentAction import UpdateEnrollmentAction
from vortex.DeferUtil import deferToThreadWrapWithLogger
from vortex.Tuple import Tuple
from vortex.TupleAction import TupleActionABC
from vortex.TupleSelector import TupleSelector
from vortex.handler.TupleDataObservableHandler import TupleDataObservableHandler

logger = logging.getLogger(__name__)


class DeviceUpdateController:
    def __init__(self, dbSessionCreator, tupleObservable: TupleDataObservableHandler):
        self._dbSessionCreator = dbSessionCreator
        self._tupleObservable = tupleObservable

    def shutdown(self):
        pass

    def processTupleAction(self, tupleAction: TupleActionABC) -> List[Tuple]:

        if isinstance(tupleAction, DeviceUpdateTuple):
            return self._processCreateUpdate(tupleAction)

        if isinstance(tupleAction, UpdateEnrollmentAction):
            return self._processAdminUpdateEnrolment(tupleAction)


    @deferToThreadWrapWithLogger(logger)
    def _processCreateUpdate(self, action: DeviceUpdateTuple) -> List[Tuple]:
        """ Process Device Enrolment

        :rtype: Deferred
        """
        ormSession = self._dbSessionCreator()
        try:
            deviceInfo = DeviceUpdateTuple()
            deviceInfo.description = action.description
            deviceInfo.deviceId = action.deviceId
            deviceInfo.deviceType = action.deviceType
            deviceInfo.deviceToken = str(uuid4())
            deviceInfo.createdDate = datetime.utcnow()
            deviceInfo.appVersion = '0.0.0'
            deviceInfo.isEnrolled = globalSetting(ormSession, AUTO_ENROLLMENT)
            ormSession.add(deviceInfo)
            ormSession.commit()

            DeviceInfoNotifier.notify(deviceId=deviceInfo.deviceId,
                                      tupleObservable=self._tupleObservable)

            ormSession.refresh(deviceInfo)
            ormSession.expunge_all()
            return [deviceInfo]

        finally:
            # Always close the session after we create it
            ormSession.close()

    @deferToThreadWrapWithLogger(logger)
    def _processAdminAlter(self, action: AlterDeviceUpdateAction) -> List[Tuple]:
        """ Process Admin Update

        :rtype: Deferred
        """
        session = self._dbSessionCreator()
        try:
            deviceInfo = (
                session.query(DeviceUpdateTuple)
                    .filter(DeviceInfoTuple.id == action.deviceInfoId)
                    .one()
            )

            deviceId = deviceInfo.deviceId

            if action.remove:
                session.delete(deviceInfo)
            else:
                deviceInfo.isEnrolled = not action.unenroll

            session.commit()

            DeviceInfoNotifier.notify(deviceId=deviceId,
                                      tupleObservable=self._tupleObservable)

            return []

        finally:
            # Always close the session after we create it
            session.close()
