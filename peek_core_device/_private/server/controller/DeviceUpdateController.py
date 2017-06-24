import logging
import zipfile
from datetime import datetime
from pathlib import Path
from typing import List

import shutil
from twisted.internet.defer import Deferred, inlineCallbacks, returnValue

from peek_core_device._private.server.controller.ObservableNotifier import \
    ObservableNotifier
from peek_core_device._private.storage.DeviceUpdateTuple import DeviceUpdateTuple
from peek_core_device._private.tuples.AlterDeviceUpdateAction import \
    AlterDeviceUpdateAction
from peek_core_device._private.tuples.CreateDeviceUpdateAction import \
    CreateDeviceUpdateAction
from txhttputil.site.SpooledNamedTemporaryFile import SpooledNamedTemporaryFile
from vortex.DeferUtil import deferToThreadWrapWithLogger
from vortex.Tuple import Tuple
from vortex.TupleAction import TupleActionABC
from vortex.handler.TupleDataObservableHandler import TupleDataObservableHandler

logger = logging.getLogger(__name__)


class DeviceUpdateController:
    def __init__(self, dbSessionCreator,
                 tupleObservable: TupleDataObservableHandler,
                 deviceUpdateFilePath: Path):
        self._dbSessionCreator = dbSessionCreator
        self._tupleObservable = tupleObservable
        self._deviceUpdateFilePath = deviceUpdateFilePath

    def shutdown(self):
        pass

    def processTupleAction(self, tupleAction: TupleActionABC) -> List[Tuple]:

        if isinstance(tupleAction, DeviceUpdateTuple):
            return self._processAdminAlter(tupleAction)

    @deferToThreadWrapWithLogger(logger)
    def _processAdminAlter(self, action: AlterDeviceUpdateAction) -> List[Tuple]:
        """ Process Admin Update

        :rtype: Deferred
        """
        session = self._dbSessionCreator()
        try:
            deviceUpdate = (
                session.query(DeviceUpdateTuple)
                    .filter(DeviceUpdateTuple.id == action.updateId)
                    .one()
            )

            deviceType = deviceUpdate.deviceType

            if action.remove:
                session.delete(deviceUpdate)
            else:
                deviceUpdate.isEnabled = not action.isEnabled

            session.commit()

            ObservableNotifier.notifyDeviceUpdate(deviceType=deviceType,
                                                  tupleObservable=self._tupleObservable)

            return []

        finally:
            # Always close the session after we create it
            session.close()

    @inlineCallbacks
    def processCreateUpdateUpload(self, namedTempFile: SpooledNamedTemporaryFile,
                                  action: CreateDeviceUpdateAction):
        """ Process Create Update Upload

        Unlike the other action processes in the controllers, this method is called by
        a http resource upload.
        """

        if not zipfile.is_zipfile(namedTempFile.name):
            raise Exception("Uploaded archive is not a zip file")

        # Create the file name
        filePath = '%s/%s.zip' % (
        action.newUpdate.deviceType, action.newUpdate.updateVersion)
        action.newUpdate.filePath = filePath

        # Create the database object, If that fails from some integrity problem
        # Then the file will delete it's self still
        deviceUpdateTuple = yield self._createUpdateOrmObj(action.newUpdate)

        absFilePath = self._deviceUpdateFilePath / filePath

        shutil.move(namedTempFile.name, str(absFilePath))
        namedTempFile.delete = False

        ObservableNotifier.notifyDeviceUpdate(deviceType=deviceUpdateTuple.deviceType,
                                              tupleObservable=self._tupleObservable)

        returnValue("%s:%s Created Successfully"
                    % (deviceUpdateTuple.deviceType, deviceUpdateTuple.updateVersion))

    @deferToThreadWrapWithLogger(logger)
    def _createUpdateOrmObj(self, newUpdate: DeviceUpdateTuple) -> DeviceUpdateTuple:
        """ Process Device Enrolment

        :rtype: Deferred
        """
        ormSession = self._dbSessionCreator()
        try:
            newUpdate.buildDate = datetime.utcnow()
            newUpdate.isEnabled = False
            ormSession.add(newUpdate)
            ormSession.commit()

            ormSession.refresh(newUpdate)
            ormSession.expunge_all()
            return newUpdate

        finally:
            ormSession.close()
