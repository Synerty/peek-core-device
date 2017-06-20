import logging

from twisted.internet import defer
from twisted.internet.defer import Deferred, inlineCallbacks

from peek_core_device._private.server.controller.EnrollmentController import \
    EnrollmentController
from vortex.TupleAction import TupleActionABC
from vortex.handler.TupleActionProcessor import TupleActionProcessorDelegateABC
from vortex.handler.TupleDataObservableHandler import TupleDataObservableHandler

logger = logging.getLogger(__name__)


class MainController(TupleActionProcessorDelegateABC):
    def __init__(self, dbSessionCreator, tupleObservable: TupleDataObservableHandler):
        self._dbSessionCreator = dbSessionCreator
        self._tupleObservable = tupleObservable

        self._enrollmentController = EnrollmentController(dbSessionCreator
                                                          , tupleObservable)

    def shutdown(self):
        self._enrollmentController.shutdown()


    @inlineCallbacks
    def processTupleAction(self, tupleAction: TupleActionABC) -> Deferred:
        result = yield self._enrollmentController.processTupleAction(tupleAction)
        if result is not None:
            defer.returnValue(result)

        raise NotImplementedError(tupleAction.tupleName())
