import logging
from datetime import datetime

from peek_core_device._private.storage.DeviceUpdateTuple import \
    DeviceUpdateTuple
from peek_core_device.tuples.DeviceInfoTuple import DeviceInfoTuple
from vortex.DeferUtil import callLaterWrap
from vortex.TupleSelector import TupleSelector
from vortex.handler.TupleDataObservableHandler import TupleDataObservableHandler

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

    @callLaterWrap(seconds=0.0)
    def notifyDeviceInfo(self, deviceId: str):
        self._notifyDeviceInfoObservable(deviceId)

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

    @callLaterWrap(seconds=0.0)
    def notifyDeviceUpdate(self, deviceType: str):
        self._notifyDeviceUpdateObservable(deviceType)

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

    @callLaterWrap(seconds=0.0)
    def notifyDeviceOnline(self, deviceId: str, deviceToken: str, online: bool):
        """Notify Device Online

        Notify that the device has changed it's online status

        """
        self._notifyDeviceOnlineObservable(deviceId, deviceToken, online)

    def _notifyDeviceOnlineObservable(
        self, deviceId: str, deviceToken: str, online: bool
    ):
        self._api.notifyOfOnlineStatus(deviceId, deviceToken, online)

    @callLaterWrap(seconds=0.0)
    def notifyDeviceGpsLocation(
        self,
        deviceToken: str,
        latitude: float,
        longitude: float,
        updatedDate: datetime,
    ):
        self._notifyDeviceGpsLocationObservable(
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
        self._api.notifyCurrentGpsLocation(
            deviceToken,
            latitude,
            longitude,
            updatedDate,
        )
