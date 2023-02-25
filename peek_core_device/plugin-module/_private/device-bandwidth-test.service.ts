import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { first, takeUntil } from "rxjs/operators";

import {
    NgLifeCycleEvents,
    PayloadEndpoint,
    TupleSelector,
    VortexService,
} from "@synerty/vortexjs";
import { deviceFilt } from "./PluginNames";
import { DeviceTupleService } from "./device-tuple.service";
import { BandwidthTestResultTuple } from "./tuples/BandwidthTestResultTuple";
import { ClientSettingsTuple } from "./tuples/ClientSettingsTuple";
import { DeviceEnrolmentService } from "../device-enrolment.service";

const deviceBandwidthTestFilt = Object.assign(
    { key: "deviceBandwidthTestFilt" },
    deviceFilt
);

export interface BandwidthStatusI {
    isSlowNetwork: boolean | null;
    lastMetric: number | null;
}

@Injectable()
export class DeviceBandwidthTestService extends NgLifeCycleEvents {
    private bandwidthTestEndpoint: PayloadEndpoint;
    private unsubLastBandwidthTest = new Subject<void>();

    readonly RESPONSE_TIMEOUT_SECONDS = 30.0;
    private slowNetworkBandwidthMetricThreshold: number = 1200;

    private _isSlowNetwork: boolean = true;
    private _lastMetric: number = 1300;

    private _testRunning: boolean = false;

    readonly status$ = new BehaviorSubject<BandwidthStatusI>({
        isSlowNetwork: null,
        lastMetric: null,
    });

    constructor(
        private vortexService: VortexService,
        private tupleService: DeviceTupleService,
        private enrolmentService: DeviceEnrolmentService
    ) {
        super();
        this.bandwidthTestEndpoint = vortexService.createEndpoint(
            this,
            deviceBandwidthTestFilt,
            false
        );

        const ts = new TupleSelector(ClientSettingsTuple.tupleName, {});
        // noinspection TypeScriptValidateJSTypes
        this.tupleService.offlineObserver
            .subscribeToTupleSelector(ts)
            .pipe(takeUntil(this.onDestroyEvent))
            .subscribe((settings: ClientSettingsTuple[]) => {
                if (settings.length !== 0) {
                    this.slowNetworkBandwidthMetricThreshold =
                        settings[0].slowNetworkBandwidthMetricThreshold;
                }
            });
    }

    get isSlowNetwork(): boolean {
        return this._isSlowNetwork;
    }

    get lastMetric(): number {
        return this._lastMetric;
    }

    get isTestRunning(): boolean {
        return this._testRunning;
    }

    startTest(): void {
        if (this._testRunning) throw new Error("Test is already running");

        this._testRunning = true;

        this._performBandwidthTest()
            .catch((e) => console.log(`ERROR _performBandwidthTest: ${e}`))
            .then(() => (this._testRunning = false));
    }

    private _performBandwidthTest(): Promise<number | null> {
        if (this.enrolmentService.deviceInfo == null)
            throw new Error("We need a deviceInfo tuple set first");

        const startPoll = new Date().getTime();
        console.log(`Starting performance test`);

        return new Promise<number>((resolve, reject) => {
            const timeoutCallback = () => {
                this.unsubLastBandwidthTest.next();
                this.applyBandwidthMetric(null);
                console.log(
                    "Performance test response timed out after," +
                        ` ${this.RESPONSE_TIMEOUT_SECONDS}s`
                );
                reject();
            };

            const responseTimeoutHandle = setTimeout(
                timeoutCallback,
                this.RESPONSE_TIMEOUT_SECONDS * 1000
            );

            const receiveCallback = () => {
                clearTimeout(responseTimeoutHandle);

                const responseTimeMs = new Date().getTime() - startPoll;
                console.log(
                    `Performance test response received, took ${responseTimeMs}`
                );
                this.applyBandwidthMetric(responseTimeMs);

                resolve(responseTimeMs);
            };

            // Add the callback to the endpoint, but just onece
            this.unsubLastBandwidthTest.next();
            this.bandwidthTestEndpoint.observable
                .pipe(
                    first(),
                    takeUntil(this.onDestroyEvent),
                    takeUntil(this.unsubLastBandwidthTest)
                )
                .subscribe(receiveCallback);

            // Finally request the response
            this.vortexService.sendFilt(deviceBandwidthTestFilt);
        });
    }

    private applyBandwidthMetric(responseTimeMs: number | null) {
        this._lastMetric = responseTimeMs;

        if (this.slowNetworkBandwidthMetricThreshold == null) {
            this._isSlowNetwork = true;
        } else if (responseTimeMs == null) {
            this._isSlowNetwork = true;
        } else {
            this._isSlowNetwork =
                this.slowNetworkBandwidthMetricThreshold < responseTimeMs;
        }
        this.status$.next({
            isSlowNetwork: this._isSlowNetwork,
            lastMetric: responseTimeMs,
        });
        this.sendBandwidthUpdate(responseTimeMs);
    }

    private sendBandwidthUpdate(responseTimeMs: number | null) {
        const action = new BandwidthTestResultTuple();
        action.metric = responseTimeMs;
        action.deviceToken = this.enrolmentService.deviceInfo.deviceToken;
        this.tupleService.tupleAction
            .pushAction(action)
            .catch((e) =>
                console.log(`Failed to send bandwidth update to server: ${e}`)
            );
    }
}
