import { Component, ViewContainerRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { Kinvey } from "kinvey-nativescript-sdk";
import { Plan } from "../shared/models/plan.model";
import { PlanService } from "../shared/services/plan.service";
import { openUrl } from "tns-core-modules/utils/utils";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
import { ModalComponent } from "./selectplan/selectplan.component";

@Component({
    selector: "PlanComponent",
    moduleId: module.id,
    templateUrl: "./plan.component.html",
    styleUrls: ["./plan-common.css"]
})
export class PlanComponent {
    title: string;
    item: Plan;
    user: any;
    isLoading: boolean;
    noImage: boolean;
    plan: object;
    private formatter: Intl.NumberFormat;
    isPlan: boolean;
    items: any;
    plans: any;
    userData: any;
    public prompt: string;

    constructor(
        private _planService: PlanService,
        private _routerExtensions: RouterExtensions,
        private modal: ModalDialogService, 
        private vcRef: ViewContainerRef
    ) {  }

    

    ngOnInit(): void {
        this.formatter = new Intl.NumberFormat("en-US", { style: 'currency', currency: 'USD' });
        // this.title = "Plan Information";
        this.item = new Plan({});
        
        this.user = {};
        this.isLoading = true;
        this.isPlan = false;
        
        
        Kinvey.User.me().then(user => {
            this.user = user && user.data;
            this.userData = user.data;
            //const planId = (this.user && this.user.planId) || "33602TX0420001"; // TODO: remove this hardcoded value
            const planId = this.user && this.user.planId;
            this._planService.getPlansByState(this.userData.state).then(plans => {
                this.plans = plans;
            });
            return this._planService.getPlanById(planId);
        }).then(plan => {
            // Display a placeholder when no image is available
            if(plan) {
                this.noImage = !plan.profile_image;
                this.item = plan;
                this.plan = plan;
            } 
            this.isLoading = false;
        }, error => {
            alert({
                title: "Backend operation failed",
                message: error.message,
                okButtonText: "Ok"
            });
        });
    }


    onLoaded(event) {
        if(this.plan) {
           
        } else {
            let options = {
                context: {plans: this.plans},
                fullscreen: true,
                viewContainerRef: this.vcRef
            };
            this.modal.showModal(ModalComponent, options).then(res => {
                console.log(res);
            });
        }
    }

    onBackButtonTap(): void {
        this._routerExtensions.backToPreviousPage();
    }

    getUserName(user: any):string {
        return user && user.givenName && user.familyName ? user.givenName + " " + user.familyName : "";
    }

    formatCurrency(value: number): string {
        if (isNaN(value)) {
            value = 0;
        }

        return this.formatter.format(value);
    }

    onBenefitsTap(url: string): void {
        openUrl(url || 'about:blank');
    }

    onSignOutButtonTap(): void {
        this.isLoading = true;
        Kinvey.User.logout().then(() => {
            this.isLoading = true;
            this._routerExtensions.navigate(["/login"], {
                clearHistory: true,
                animated: true,
                transition: {
                    name: "slide",
                    duration: 200,
                    curve: "ease"
                }
            });
        }, error => {
            alert({
                title: "Backend operation failed",
                message: error.message,
                okButtonText: "Ok"
            });
        });
    }

    getTotalCost(): string {
        var cost: number;
        cost = 0;
        if(this.item && this.item.premiums && this.item.premiums.length) {
            for(var i = 0; i < this.item.premiums.length; i++) {
                cost += this.item.premiums[i].cost;
            }
        }
        return this.formatter.format(cost);
    }

    getTotalAdults(): number {
        var adults: number;
        adults = 0;
        if(this.item && this.item.premiums && this.item.premiums.length) {
            for(var i = 0; i < this.item.premiums.length; i++) {
                adults += this.item.premiums[i].adults;
            }
        }
        return adults;
    }

    getTotalChildren(): number {
        var children: number;
        children = 0;
        if(this.item && this.item.premiums && this.item.premiums.length) {
            for(var i = 0; i < this.item.premiums.length; i++) {
                children += this.item.premiums[i].children;
            }
        }
        return children;
    }
}
