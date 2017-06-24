import {Injectable} from "@angular/core";
import {TitleService} from "@synerty/peek-util";
import {Subject} from "rxjs";
import {TupleSelector, VortexStatusService} from "@synerty/vortexjs";
import {DeviceInfoTuple} from "./DeviceInfoTuple";
import {HardwareInfo} from "./_private/hardware-info/hardware-info.mweb";
import {DeviceNavService} from "./_private/device-nav.service";
import {DeviceTupleService} from "./_private/device-tuple.service";


@Injectable()
export class DeviceEnrolmentService {

    private deviceInfo: DeviceInfoTuple = null;
    private hardwareInfo: HardwareInfo;

    // There is no point having multiple services observing the same thing
    // So lets create a nice observable for the device info.
    deviceInfoObservable = new Subject<DeviceInfoTuple>();


    constructor(private nav: DeviceNavService,
                private titleService: TitleService,
                private tupleService: DeviceTupleService) {

        this.hardwareInfo = new HardwareInfo(this.tupleService.offlineStorage);

        this.hardwareInfo.uuid()
            .then(uuid => {
                // Create the tuple selector
                let tupleSelector = new TupleSelector(
                    DeviceInfoTuple.tupleName, {
                        "deviceId": uuid
                    }
                );

                // There is no point unsubscribing this
                this.tupleService.offlineObserver
                    .subscribeToTupleSelector(tupleSelector)
                    .subscribe((tuples: DeviceInfoTuple[]) => {

                        if (tuples.length == 1)
                            this.deviceInfo = tuples[0];
                        else
                            this.deviceInfo = null;

                        this.deviceInfoObservable.next(this.deviceInfo);

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