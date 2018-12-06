import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptUIDataFormModule } from "nativescript-ui-dataform/angular";
import { SharedModule } from "../shared/shared.module";

import { LoginRoutingModule } from "./login-routing.module";
import { LoginComponent } from "./login.component";
import { RegistrationComponent } from "./registration/registration.component";
import {HttpClientModule} from '@angular/common/http';

@NgModule({
    imports: [
        LoginRoutingModule,
        NativeScriptCommonModule,
        NativeScriptUIDataFormModule,
        SharedModule,
        HttpClientModule
    ],
    declarations: [
        LoginComponent,
        RegistrationComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class LoginModule { }
