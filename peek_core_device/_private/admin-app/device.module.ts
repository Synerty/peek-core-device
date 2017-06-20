import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {EditSettingComponent} from "./edit-setting-table/edit.component";
// Import the required classes from VortexJS
import {
    TupleActionPushNameService,
    TupleActionPushService,
    TupleDataObservableNameService,
    TupleDataObserverService
} from "@synerty/vortexjs";
// Import our components
import {DeviceComponent} from "./device.component";
import {DeviceUpdateComponent} from "./device-update-table/device-update.component";
import {DeviceInfoComponent} from "./device-info-table/device-info.component";
import {deviceActionProcessorName, deviceFilt} from "@peek/peek_core_device/_private";
import {deviceObservableName} from "../../plugin-module/_private/PluginNames";


export function tupleActionPushNameServiceFactory() {
    return new TupleActionPushNameService(
        deviceActionProcessorName, deviceFilt);
}

export function tupleDataObservableNameServiceFactory() {
    return new TupleDataObservableNameService(
        deviceObservableName, deviceFilt);
}

// Define the routes for this Angular module
export const pluginRoutes: Routes = [
    {
        path: '',
        component: DeviceComponent
    }

];

// Define the module
@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(pluginRoutes),
        FormsModule],
    exports: [],
    providers: [
        TupleActionPushService, {
            provide: TupleActionPushNameService,
            useFactory: tupleActionPushNameServiceFactory
        },
        TupleDataObserverService, {
            provide: TupleDataObservableNameService,
            useFactory: tupleDataObservableNameServiceFactory
        },
    ],
    declarations: [
        DeviceComponent, DeviceInfoComponent, DeviceUpdateComponent, EditSettingComponent
    ]
})
export class DeviceModule {

}