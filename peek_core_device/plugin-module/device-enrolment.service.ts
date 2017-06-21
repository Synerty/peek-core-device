import {Injectable, NgZone} from "@angular/core";
import {TitleService} from "@synerty/peek-util";
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
} from "./_private/PluginNames";
import {DeviceInfoTuple} from "./DeviceInfoTuple";
import {HardwareInfo} from "./_private/hardware-info/hardware-info.mweb";
import {DeviceNavService} from "./_private/device-nav.service";


@Injectable()
export class DeviceEnrolmentService {
    private offlineStorage: TupleOfflineStorageService;
    private offlineObserver: TupleDataObserverService;

    private deviceInfo: DeviceInfoTuple = null;
    private hardwareInfo: HardwareInfo;


    constructor(private nav: DeviceNavService,
                webSqlFactory: WebSqlFactoryService,
                vortexService: VortexService,
                vortexStatusService: VortexStatusService,
                zone: NgZone,
                private titleService: TitleService) {
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

        this.hardwareInfo = new HardwareInfo(this.offlineStorage);

        this.hardwareInfo.uuid()
            .then(uuid => {
                // Create the tuple selector
                let tupleSelector = new TupleSelector(
                    DeviceInfoTuple.tupleName, {
                        "deviceId": uuid
                    }
                );

                // There is no point unsubscribing this
                this.offlineObserver
                    .subscribeToTupleSelector(tupleSelector)
                    .subscribe((tuples: DeviceInfoTuple[]) => {

                        if (tuples.length == 1)
                            this.deviceInfo = tuples[0];
                        else
                            this.deviceInfo = null;


                        if (this.deviceInfo == null) {
                            titleService.setEnabled(false);
                            titleService.setTitle('');
                            this.nav.toEnroll();

                        } else if (!this.deviceInfo.isEnrolled) {
                            titleService.setEnabled(false);
                            titleService.setTitle('');
                            this.nav.toEnrolling();

                        } else {
                            titleService.setEnabled(true);
                            console.log("Device Enrollment Confirmed");
                            this.nav.toHome();

                        }

                    });
            });


    }

    isEnrolled(): boolean {
        return this.deviceInfo != null && this.deviceInfo.isEnrolled;
    }

    enrolmentToken(): string | null {
        return null;

    }

}