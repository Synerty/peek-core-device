import { Injectable } from "@angular/core"
import { BalloonMsgService } from "@synerty/peek-plugin-base-js"
import {
    addTupleType,
    extend,
    Tuple,
    TupleSelector,
    VortexService,
    VortexStatusService
} from "@synerty/vortexjs"
import { deviceFilt, deviceTuplePrefix } from "./PluginNames"
import { DeviceTupleService } from "./device-tuple.service"
import { DeviceNavService } from "./device-nav.service"
import { Observable } from "rxjs"
import { Subject } from "rxjs"
import { Capacitor } from "@capacitor/core"
import { GpsLocationTuple } from "../GpsLocationTuple"
import { GpsLocationUpdateTupleAction } from "./gps/GpsLocationUpdateTupleAction"
import { PrivateDeviceGpsLocationService } from "./gps/private-gps-location.service"

@addTupleType
export class ServerInfoTuple extends Tuple {
    public static readonly tupleName = deviceTuplePrefix + "ServerInfoTuple"
    
    host: string
    useSsl: boolean = false
    httpPort: number = 8000
    websocketPort: number = 8001
    hasConnected: boolean = false
    
    constructor() {
        super(ServerInfoTuple.tupleName)
    }
}

@Injectable()
export class DeviceServerService {
    private tupleSelector: TupleSelector = new TupleSelector(
        ServerInfoTuple.tupleName, {}
    )
    private serverInfo: ServerInfoTuple = new ServerInfoTuple()
    private serverInfoSubject = new Subject<ServerInfoTuple>()
    private readonly deviceOnlineFilt = extend({key: "device.online"}, deviceFilt)
    private lastOnlineSub: any | null = null
    
    constructor(
        private nav: DeviceNavService,
        private balloonMsg: BalloonMsgService,
        private vortexService: VortexService,
        private vortexStatusService: VortexStatusService,
        private tupleService: DeviceTupleService
    ) {
        
        this._isWeb = Capacitor.getPlatform() === "web"
        
        // Web doesn't need connection details,
        // The websocket now connects to the same port as the http server.
        if (this.isWeb) {
            this._isLoading = false
            this.serverInfo = this.extractHttpDetails()
            this.serverInfo.hasConnected = true
        }
        else {
            this._loadNsWebsocket()
        }
    }
    
    private _isWeb: boolean = false
    
    get isWeb(): boolean {
        return this._isWeb
    }
    
    private _isLoading = true
    
    get isLoading(): boolean {
        return this._isLoading
    }
    
    get connInfoObserver(): Observable<ServerInfoTuple> {
        return this.serverInfoSubject
    }
    
    get connInfo(): ServerInfoTuple {
        return this.serverInfo
    }
    
    get isSetup(): boolean {
        return this.serverInfo != null
            && this.serverInfo.host != null
            && this.serverInfo.hasConnected
    }
    
    get isConnected(): boolean {
        return this.isSetup && this.vortexStatusService.snapshot.isOnline
    }
    
    get serverHost(): string {
        return this.serverInfo.host
    }
    
    get serverUseSsl(): boolean {
        return this.serverInfo.useSsl
    }
    
    get serverHttpPort(): number {
        return this.serverInfo.httpPort
    }
    
    get serverWebsocketPort(): number {
        return this.serverInfo.websocketPort
    }
    
    setWorkOffline(): void {
        this.weHaveConnected()
        this.balloonMsg.showWarning("Working Offline")
    }
    
    /** Set Server and Port
     *
     * Set the vortex server and port, persist the information to a websqldb
     */
    setServer(serverInfo: ServerInfoTuple): Promise<void> {
        this.serverInfo = serverInfo
        
        this.vortexStatusService.isOnline
            .filter(online => online == true)
            .first()
            .subscribe(() => {
                this.weHaveConnected()
                this.balloonMsg.showSuccess("Reconnection Successful")
            })
        
        this.updateVortex()
        
        // Store the data
        return this.saveConnInfo()
    }
    
    private _loadNsWebsocket() {
        this.loadConnInfo()
            .then(() => {
                
                // If there is a host set, set the vortex
                if (this.isSetup) {
                    this.updateVortex()
                    return
                }
                
                this.nav.toConnect()
                
            })
    }
    
    private extractHttpDetails(): ServerInfoTuple {
        if (!this._isWeb) {
            throw new Error("This method is only for the web version of the app")
        }
        
        let conn = new ServerInfoTuple()
        
        conn.host = location.host.split(":")[0]
        conn.useSsl = location.protocol.toLowerCase() == "https"
        
        if (location.host.split(":").length > 1) {
            conn.httpPort = parseInt(location.host.split(":")[1])
        }
        else {
            conn.httpPort = conn.useSsl ? 443 : 80
        }
        
        // The websocket port is now the HTTP port
        conn.websocketPort = conn.httpPort
        
        return conn
    }
    
    private weHaveConnected(): void {
        this.serverInfo.hasConnected = true
        this.saveConnInfo()
        this.nav.toHome()
    }
    
    /** Load Conn Info
     *
     * Load the connection info from the websql db and set set the vortex.
     */
    private loadConnInfo(): Promise<void> {
        return this.tupleService.offlineStorage
            .loadTuples(this.tupleSelector)
            .then((tuples: ServerInfoTuple[]) => {
                this._isLoading = false
                
                if (tuples.length) {
                    this.serverInfo = tuples[0]
                }
                
                this.serverInfoSubject.next(this.serverInfo)
            })
    }
    
    private saveConnInfo(): Promise<void> {
        this.serverInfoSubject.next(this.serverInfo)
        
        // Store the data
        return this.tupleService.offlineStorage
            .saveTuples(this.tupleSelector, [this.serverInfo])
            // Convert result to void
            .then(() => {
                this.serverInfoSubject.next(this.serverInfo)
                Promise.resolve()
            })
            .catch(e => {
                console.log(e)
                this.balloonMsg.showError(`Error storing server details ${e}`)
            })
    }
    
    private updateVortex() {
        let host = this.serverInfo.host
        let port = this.serverInfo.websocketPort
        let prot = this.serverInfo.useSsl ? "wss" : "ws"
        
        VortexService.setVortexUrl(`${prot}://${host}:${port}/vortexws`)
        this.vortexService.reconnect()
        
        this.setupOnlinePing()
    }
    
    /** Setup Online Ping
     *
     * This method sends a payload to the server when we detect that the vortex is
     * back online.
     *
     * The client listens for these payloads and tells the server acoordingly.
     *
     */
    private setupOnlinePing() {
        if (this.lastOnlineSub != null) {
            this.lastOnlineSub.unsubscribe()
            this.lastOnlineSub = null
        }
        
        // Setup the online ping
        this.tupleService.hardwareInfo
            .uuid()
            .then(deviceId => {
                let filt = extend({deviceId: deviceId}, this.deviceOnlineFilt)
                
                this.lastOnlineSub = this.vortexStatusService.isOnline
                    .filter(online => online) // Filter for online only
                    .subscribe(() => {
                        this.vortexService.sendFilt(filt)
                    })
                
                if (this.vortexStatusService.snapshot.isOnline)
                    this.vortexService.sendFilt(filt)
                
            })
    }
}
