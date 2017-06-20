def loadPrivateTuples():
    """ Load Private Tuples

    In this method, we load the private tuples.
    This registers them so the Vortex can reconstructed them from
    serialised data.

    """
    from . import AuthoriseEnrolAction
    AuthoriseEnrolAction.__unused = False

    from . import BuildUpdateAction
    BuildUpdateAction.__unused = False

    from . import EnrolDeviceAction
    EnrolDeviceAction.__unused = False

    from . import ToggleUpdateEnabledAction
    ToggleUpdateEnabledAction.__unused = False