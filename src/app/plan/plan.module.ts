import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NativeScriptUIListViewModule } from "nativescript-ui-listview/angular";
import { SharedModule } from "../shared/shared.module";
import { DropDownModule } from "nativescript-drop-down/angular";

import { PlanRoutingModule } from "./plan-routing.module";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        NativeScriptUIListViewModule,
        NativeScriptFormsModule,
        PlanRoutingModule,
        SharedModule,
        DropDownModule
    ],
    providers: [
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class PlanModule { }
