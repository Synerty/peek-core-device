import logging

from twisted.internet.defer import Deferred
from twisted.internet.defer import inlineCallbacks
from vortex.TupleAction import TupleActionABC
from vortex.handler.TupleActionProcessor import TupleActionProcessorDelegateABC

from peek_core_device._private.tuples.GpsLocationUpdateTupleAction import (
    GpsLocationUpdateTupleAction,
)

logger = logging.getLogger(__name__)


class GpsController(TupleActionProcessorDelegateABC):
    def __init__(self):
        pass

    def shutdown(self):
        pass

    def processTupleAction(self, tupleAction: TupleActionABC) -> Deferred:
        if isinstance(tupleAction, GpsLocationUpdateTupleAction):
            return self._processGpsLocationUpdateTupleAction(tupleAction)

    @inlineCallbacks
    def _processGpsLocationUpdateTupleAction(
        self, action: GpsLocationUpdateTupleAction
    ):
        logger.debug(action)
