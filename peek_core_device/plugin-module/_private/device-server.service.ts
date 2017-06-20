import {Injectable, NgZone} from "@angular/core";
import {Ng2BalloonMsgService} from "@synerty/ng2-balloon-msg";
import {
    addTupleType,
    Tuple,
    TupleOfflineStorageNameService,
    TupleOfflineStorageService,
    TupleSelector,
    VortexService,
    VortexStatusService,
    WebSqlFactoryService
} from "@synerty/vortexjs";

import {deviceTupleOfflineServiceName, deviceTuplePrefix} from "./PluginNames";
import {HardwareInfo} from "./hardware-info/hardware-info.mweb";
import {DeviceTypeEnum} from "./hardware-info/hardware-info.abstract";


@addTupleType
export class ServerInfoTuple extends Tuple {
    public static readonly tupleName = deviceTuplePrefix + "ServerInfoTuple";

    serverHost: string;
    serverPort: number;

    constructor() {
        super(ServerInfoTuple.tupleName);
    }
}

@Injectable()
export class DeviceServerService {
    private offlineStorage: TupleOfflineStorageService;

    private tupleSelector: TupleSelector = new TupleSelector(
        ServerInfoTuple.tupleName, {}
    );


    constructor(private balloonMsg: Ng2BalloonMsgService,
                webSqlFactory: WebSqlFactoryService,
                private vortexService: VortexService,
                vortexStatusService: VortexStatusService,
                zone: NgZone) {

        // Create the offline storage
        this.offlineStorage = new TupleOfflineStorageService(
            webSqlFactory,
            new TupleOfflineStorageNameService(deviceTupleOfflineServiceName)
        );


        let type: DeviceTypeEnum = (new HardwareInfo(this.offlineStorage)).deviceType();

        switch (type) {
            case DeviceTypeEnum.MOBILE_WEB:
            case DeviceTypeEnum.DESKTOP_WEB:
                let serverHost = location.host.split(':')[0];
                let serverPort = 8001;
                this.updateVortex(serverHost, serverPort);
                break;

            default:
                this.loadConnInfo();
                break;
        }

    }


    /** Set Server and Port
     *
     * Set the vortex server and port, persist the information to a websqldb
     */
    setServerAndPort(host: string, port: number): Promise<void> {
        this.setServerAndPort(host, port);

        // Create a new tuple to store
        let newTuple = new ServerInfoTuple();
        newTuple.serverHost = host;
        newTuple.serverPort = port;

        // Store the data
        return this.offlineStorage
            .saveTuples(this.tupleSelector, [newTuple])
            // Convert result to void
            .then(() => Promise.resolve())
            .catch(e => {
                console.log(e);
                this.balloonMsg.showError(`Error storing server details ${e}`);
            });
    }

    /** Load Conn Info
     *
     * Load the connection info from the websql db and set set the vortex.
     */
    private loadConnInfo() {
        this.offlineStorage
            .loadTuples(this.tupleSelector)
            .then((tuples: ServerInfoTuple[]) => {
                // If we have a UUID already, then use that.
                if (tuples.length != 0) {
                    let t = tuples[0];
                    return;
                }
            });
    }

    private updateVortex(host: string, port: number) {
        VortexService.setVortexUrl(`ws://${host}:${port}/vortexws`);
        this.vortexService.reconnect();
    }

}