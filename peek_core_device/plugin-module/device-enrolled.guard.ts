import {Injectable} from "@angular/core";
import {CanActivate} from "@angular/router";
import {DeviceEnrolmentService} from "./device-enrolment.service";
import {DeviceNavService} from "./_private/device-nav.service";
import {DeviceServerService} from "./_private/device-server.service";

@Injectable()
export class DeviceEnrolledGuard implements CanActivate {
    constructor(private enrolmentService: DeviceEnrolmentService,
                private nav: DeviceNavService,
                private serverService: DeviceServerService) {
    }

    canActivate() {
        if (!this.serverService.isSetup) {
            this.nav.toConnect();
            return false;
        }

        if (this.enrolmentService.isEnrolled())
            return true;

        this.enrolmentService.checkEnrolment();
        return false;
    }
}