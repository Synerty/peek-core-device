import logging

from twisted.internet.defer import Deferred

from peek_core_device._private.storage.DeviceInfoTuple import DeviceInfoTuple
from peek_core_device._private.tuples.EnrolDeviceAction import EnrolDeviceAction
from txhttputil.util.DeferUtil import deferToThreadWrap
from vortex.DeferUtil import deferToThreadWrapWithLogger

from vortex.TupleSelector import TupleSelector
from vortex.TupleAction import TupleActionABC
from vortex.handler.TupleActionProcessor import TupleActionProcessorDelegateABC
from vortex.handler.TupleDataObservableHandler import TupleDataObservableHandler

# from peek_core_device._private.storage.StringIntTuple import StringIntTuple
# from peek_core_device._private.tuples.AddIntValueActionTuple import AddIntValueActionTuple
# from peek_core_device._private.tuples.StringCapToggleActionTuple import StringCapToggleActionTuple

logger = logging.getLogger(__name__)


class MainController(TupleActionProcessorDelegateABC):
    def __init__(self, dbSessionCreator, tupleObservable: TupleDataObservableHandler):
        self._dbSessionCreator = dbSessionCreator
        self._tupleObservable = tupleObservable

    def shutdown(self):
        pass

    def processTupleAction(self, tupleAction: TupleActionABC) -> Deferred:

        if isinstance(tupleAction, EnrolDeviceAction):
            return self._processEnrolment(tupleAction)

        # if isinstance(tupleAction, StringCapToggleActionTuple):
        #     return self._processCapToggleString(tupleAction)

        raise NotImplementedError(tupleAction.tupleName())

    @deferToThreadWrapWithLogger(logger)
    def _processEnrolment(self, action: EnrolDeviceAction):
        session = self._dbSessionCreator()
        try:
            # Perform update using SQLALchemy
            row = (
                session.query(DeviceInfoTuple)
                   .filter(DeviceInfoTuple.deviceId == action.deviceId)
                   .all()
            )

            session.commit()

            # Notify the observer of the update
            # This tuple selector must exactly match what the UI observes
            tupleSelector = TupleSelector(StringIntTuple.tupleName(), {})
            self._tupleObservable.notifyOfTupleUpdate(tupleSelector)

        finally:
            # Always close the session after we create it
            session.close()
