from txhttputil.util.ModuleUtil import filterModules


def loadPublicTuples():
    """Load Public Tuples

    In this method, we load the public tuples.
    This registers them so the Vortex can reconstructed them from
    serialised data.

    """
    for mod in filterModules(__name__, __file__):
        __import__(mod, locals(), globals())
