import logging
from datetime import datetime
from datetime import timezone

from twisted.internet import reactor
from vortex.TupleSelector import TupleSelector
from vortex.handler.TupleDataObservableHandler import TupleDataObservableHandler

from peek_core_device._private.storage.DeviceUpdateTuple import \
    DeviceUpdateTuple
from peek_core_device.tuples.DeviceInfoTuple import DeviceInfoTuple

logger = logging.getLogger(__name__)


class NotifierController:
    def __init__(self, tupleObservable: TupleDataObservableHandler):
        self._tupleObservable = tupleObservable

        from peek_core_device._private.server.DeviceApi import DeviceApi

        self._api: DeviceApi = None

    def setApi(self, api):
        self._api = api

    def shutdown(self):
        self._tupleObservable = None
        self._api = None

    def notifyDeviceInfo(self, deviceId: str):
        reactor.callLater(0, self._notifyDeviceInfoObservable, deviceId)

    def _notifyDeviceInfoObservable(self, deviceId: str):
        """Notify the observer of the update

        This tuple selector must exactly match what the UI observes

        """

        self._tupleObservable.notifyOfTupleUpdate(
            TupleSelector(DeviceInfoTuple.tupleName(), dict(deviceId=deviceId))
        )

        self._tupleObservable.notifyOfTupleUpdate(
            TupleSelector(DeviceInfoTuple.tupleName(), dict())
        )

    def notifyDeviceUpdate(self, deviceType: str):
        reactor.callLater(0, self._notifyDeviceUpdateObservable, deviceType)

    def _notifyDeviceUpdateObservable(self, deviceType: str):
        """Notify the observer of the update

        This tuple selector must exactly match what the UI observes

        """

        self._tupleObservable.notifyOfTupleUpdate(
            TupleSelector(DeviceUpdateTuple.tupleName(),
                dict(deviceType=deviceType))
        )

        self._tupleObservable.notifyOfTupleUpdate(
            TupleSelector(DeviceUpdateTuple.tupleName(), dict())
        )

    def notifyDeviceOnline(self, deviceId: str, deviceToken: str, online: bool):
        """Notify Device Online

        Notify that the device has changed it's online status

        """
        reactor.callLater(
            0, self._notifyDeviceOnlineObservable, deviceId, deviceToken, online
        )

    def _notifyDeviceOnlineObservable(
        self, deviceId: str, deviceToken: str, online: bool
    ):
        self._api.notifyOfOnlineStatus(deviceId, deviceToken, online)

    def notifyDeviceGpsLocation(
        self,
        deviceToken: str,
        latitude: float,
        longitude: float,
        updatedDate: datetime,
    ):
        reactor.callLater(
            0,
            self._notifyDeviceGpsLocationObservable,
            deviceToken,
            latitude,
            longitude,
            updatedDate,
        )

    def _notifyDeviceGpsLocationObservable(
        self,
        deviceToken: str,
        latitude: float,
        longitude: float,
        updatedDate: datetime,
    ):
        timestamp = int(
            updatedDate.replace(tzinfo=timezone.utc).timestamp() * 1000)
        self._api.notifyCurrentGpsLocation(
            deviceToken,
            latitude,
            longitude,
            timestamp,
        )
