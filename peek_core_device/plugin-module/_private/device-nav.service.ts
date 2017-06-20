import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {deviceBaseUrl} from "./PluginNames";


@Injectable()
export class DeviceNavService {
    constructor(private router: Router) {

    }

    toEnroll() {
        this.router.navigate([deviceBaseUrl, 'enroll']);
    }

    toEnrolling() {
        this.router.navigate([deviceBaseUrl, 'enrolling']);
    }

}