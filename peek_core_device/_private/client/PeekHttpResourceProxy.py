import logging
from twisted.internet import reactor, protocol
from twisted.internet.defer import succeed
from twisted.web._newclient import ResponseDone
from twisted.web.client import Agent
from twisted.web.iweb import IBodyProducer
from twisted.web.server import NOT_DONE_YET
from txhttputil.site.BasicResource import BasicResource
from zope.interface import implementer

from vortex.DeferUtil import vortexLogFailure

logger = logging.getLogger(__name__)

@implementer(IBodyProducer)
class BytesProducer(object):
    def __init__(self, data: bytes):
        self.body: bytes = data
        self.length = len(data)

    def startProducing(self, consumer):
        consumer.write(self.body)
        return succeed(None)

    def pauseProducing(self):
        pass

    def stopProducing(self):
        pass

class _ResponseDataRelay(protocol.Protocol):
    def __init__(self, request):
        self._request = request

    def dataReceived(self, data):
        self._request.write()

    def connectionLost(self, reason):
        if not reason.check(ResponseDone):
            vortexLogFailure(reason, logger)
        self._request.finish()


class PeekHttpResourceProxy(BasicResource):
    isGzipped = True
    isLeaf = True

    def __init__(self, serverIp, serverPort):
        """ Constructor

        @param serverIp: The IP or host name of the peek server to download from.
        @param serverPort: The port of the peek servers platform http site.
                            Not the admin site.
        """

        self._serverIp = serverIp
        self._serverPort = serverPort


    def render_GET(self, request):
        # Construct an Agent.
        agent = Agent(reactor)

        d = agent.request(b'GET',
                          request.url,
                          request.headers,
                          BytesProducer(request.contents))

        def handle_response(response):
            request.response_code = response.code
            response.deliverBody(_ResponseDataRelay(request))
            return d

        d.addCallback(handle_response)
        return NOT_DONE_YET
