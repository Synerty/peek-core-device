import {Injectable, NgZone} from "@angular/core";
import {
    TupleDataObservableNameService,
    TupleDataObserverService,
    TupleDataOfflineObserverService,
    TupleOfflineStorageNameService,
    TupleOfflineStorageService,
    TupleSelector,
    VortexService,
    VortexStatusService,
    WebSqlFactoryService
} from "@synerty/vortexjs";

import {
    deviceFilt,
    deviceObservableName,
    deviceTupleOfflineServiceName
} from "./PluginNames";


@Injectable()
export class DeviceUpdateService {
    private offlineStorage: TupleOfflineStorageService;
    private offlineObserver: TupleDataObserverService;
    private subscriptions: any[] = [];



    constructor(webSqlFactory: WebSqlFactoryService,
                vortexService: VortexService,
                vortexStatusService: VortexStatusService,
                zone: NgZone) {

        /*
        // Create the offline storage
        this.offlineStorage = new TupleOfflineStorageService(
            webSqlFactory,
            new TupleOfflineStorageNameService(deviceTupleOfflineServiceName)
        );

        // Create the offline observer
        this.offlineObserver = new TupleDataOfflineObserverService(
            vortexService,
            vortexStatusService,
            zone,
            new TupleDataObservableNameService(
                deviceObservableName,
                deviceFilt),
            this.offlineStorage
        );

        this.userService.loggedInStatus
            .filter(loggedIn => loggedIn)
            .subscribe(loggedIn => {
                if (loggedIn)
                    this.loadIncidentList();
                else
                    this.unloadAll();
            });

        if (this.userService.loggedIn)
            this.loadIncidentList();
        */
    }


}