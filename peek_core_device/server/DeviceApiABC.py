from abc import ABCMeta, abstractmethod



class DeviceApiABC(metaclass=ABCMeta):
    """ Device API

    This is the public API for the part of the plugin that runs on the server service.

    """

    # @abstractmethod
    # def doSomethingGood(self, somethingsDescription:str) -> DoSomethingTuple:
    #     """ Add a New Task
    #
    #     Add a new task to the users device.
    #
    #     :param somethingsDescription: An arbitrary string
    #     :return: The computed result contained in a DoSomethingTuple tuple
    #
    #     """
