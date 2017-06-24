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

import {DeviceEnrolmentService} from "../device-enrolment.service";


/** Device Tuple Service
 *
 * This service provides the tuple action, observable and storage classes for the
 * other services in this plugin.
 *
 * Since there are sevaral services setting up their own instances of these, it made
 * sense to combine them all.
 *
 */
@Injectable()
export class DeviceTupleService {
     offlineStorage: TupleOfflineStorageService;
     offlineObserver: TupleDataObserverService;
     observer: TupleDataObserverService;


    constructor(webSqlFactory: WebSqlFactoryService,
                vortexService: VortexService,
                vortexStatusService: VortexStatusService,
                zone: NgZone) {

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

        // Create the observer
        this.observer = new TupleDataObserverService(
            vortexService,
            vortexStatusService,
            zone,
            new TupleDataObservableNameService(
                deviceObservableName,
                deviceFilt)
        );

    }


}