import {Injectable} from "@angular/core";
import {CanActivate} from "@angular/router";
import {TitleService} from "@synerty/peek-util";
import {DeviceEnrolmentService} from "./device-enrolment.service";
import {DeviceNavService} from "./_private/device-nav.service";
import {DeviceServerService} from "./_private/device-server.service";

@Injectable()
export class DeviceEnrolledGuard implements CanActivate {
    constructor(private enrolmentService: DeviceEnrolmentService,
                private nav: DeviceNavService,
                private titleService: TitleService,
                private serverService: DeviceServerService) {
    }

    canActivate() {
        if (!this.serverService.isSetup) {
            this.nav.toConnect();
            return false;
        }

        if (this.enrolmentService.isEnrolled()) {
            this.titleService.setEnabled(true);
            return true;
        }

        this.enrolmentService.checkEnrolment();
        return false;
    }
}