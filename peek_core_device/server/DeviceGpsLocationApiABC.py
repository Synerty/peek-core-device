from abc import ABCMeta
from abc import abstractmethod

from rx import Observable


class DeviceGpsLocationApiABC(metaclass=ABCMeta):
    """Device GPS Location API

    This is the public API for exposing the GPS locations of devices to other
    plugins.
    """

    @abstractmethod
    def deviceCurrentGpsLocation(self) -> Observable:
        """Device Current GPS Location

        Subscribe to device current GPS location
        :return: An observable that fires when devices update GPS locations
        """
