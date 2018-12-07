import { Component, ViewContainerRef , ViewChild, AfterViewInit, ViewChildren} from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { Kinvey } from "kinvey-nativescript-sdk";
import { Plan } from "../shared/models/plan.model";
import { PlanService } from "../shared/services/plan.service";
import { openUrl } from "tns-core-modules/utils/utils";
import { RadListViewComponent } from "nativescript-ui-listview/angular";
import { EventData } from "tns-core-modules/data/observable";
import { SearchBar } from "tns-core-modules/ui/search-bar";
import { isAndroid } from "tns-core-modules/platform";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { ListViewEventData } from "nativescript-ui-listview";
import { UserService } from "../login/shared/user.service";
import { States } from "../shared/models/states.model";
import { StatesService } from "../shared/services/states.service";
import { ValueList } from "nativescript-drop-down";

@Component({
    selector: "PlanComponent",
    moduleId: module.id,
    templateUrl: "./plan.component.html",
    styleUrls: ["./plan-common.css"]
})
export class PlanComponent {
    private _stateForm: States;
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
    isplanLoading: boolean;
    filterPlans: string = "";
    planListViewTemplateSelector;
    planFilteringFunc;
    planName: string;
    states: Array<States>;
    stateIt: Array<any>;
    selectedIndex;
    addEditPlanText: string = "";
    isEditPlan: boolean = false;

    @ViewChild("planListView") planListView: RadListViewComponent;
    @ViewChild("planFilterSearchBar") planFilterSearchBar: any;

    constructor(
        private _planService: PlanService,
        private _routerExtensions: RouterExtensions,
        private _statesService: StatesService
    ) {  }

    

    ngOnInit(): void {
        
        this.formatter = new Intl.NumberFormat("en-US", { style: 'currency', currency: 'USD' });
        this.item = new Plan({});
        
        this.user = {};
        this.isLoading = true;
        this.isPlan = true;
        this.addEditPlanText = "You don't have an active plan selected. Please select a plan from the below list..";
       
        Kinvey.User.me().then(user => {
            this.user = user && user.data;
            this.userData = user.data;
            const planId = this.user && this.user.planId;
            //this.getPlans(this.userData.state);
            return this._planService.getPlanById(planId);
        }).then(plan => {
            // Display a placeholder when no image is available
            if(plan) {
                this.isPlan = true;
                this.noImage = !plan.profile_image;
                this.item = plan;
                this.plan = plan;
            } else{
                this.isPlan = false;
                this.isEditPlan = false;
            }
            this.isLoading = false;
        }, error => {
            alert({
                title: "Backend operation failed",
                message: error.message,
                okButtonText: "Ok"
            });
        });
        this._stateForm = new States();

        const filterFunc = (item: Plan): boolean => {
            return item.plan_name.toLowerCase().includes(this.filterPlans.toLowerCase());
            
		};
		this.planFilteringFunc = filterFunc.bind(this);

		this.planListViewTemplateSelector = (item: Plan, index: number, items: any) => {
			return items.length === index + 1 ? "last" : "default";
        };

        this.items = new ValueList<string>();
        this._statesService.getUSSStates().then((states)=>{
            if(states && states.length){
                for (let loop = 0; loop < states.length; loop++) {
                    this.items.push({
                        value: states[loop]._id,
                        display: states[loop].name,
                    });
                }
            }
        });
       
    }


    get statesForm(): States {
        return this._stateForm;
    }

    getPlans(state) {
        this.isplanLoading = true;
        this._planService.getPlansByState(state).then((plans)=>{
            if(plans && plans.length) {
                this.plans = plans;
            } else{
                
                alert({
                    title: "",
                    message: "Selected state do not have any plan listed..",
                    okButtonText: "Ok"
                });
                this.plans = [];
            }
            
            this.isplanLoading = false;
        });
    }
   
    onLoaded(event) {
    
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

    //plan filter functions

    public onPlanTap(plan: Plan) {
        this.plan = plan;
    }

    planSearchBarLoaded(args) {
		const searchbar: SearchBar = <SearchBar>args.object;
		if (isAndroid) {
			searchbar.android.clearFocus();
		}
    }
    
    onFilterButtonTap(args: EventData) {
		const sl = (<StackLayout>args.object).parent;
		//this.selectedFilter = sl.get("data-name");
    }
    
    onTextChanged(args: EventData) {
		const searchBar = <SearchBar>args.object;

		this.filterPlans = searchBar.text;
		this.planListView.listView.refresh();
	}

	capitalize(item: string): string {
		return item ? item.charAt(0).toUpperCase() + item.slice(1) : "";
	}

	planGroupingFunc(item: Plan): any {
		return (item && item.plan_name && item.plan_name[0].toUpperCase()) || "";
	}

	onplanFilterSubmit(args: EventData) {
		if (args) {
			const searchTextBar = <SearchBar>args.object;
			searchTextBar.dismissSoftInput();
		}
    }
    
    planSelected(args: ListViewEventData) {
        this.plans.forEach((item) => item.selected = false);
		const selectedItems = args.object.getSelectedItems();
		const item = selectedItems && selectedItems[0];
		if (item) {
			item.selected = true;
            this.planName = item.plan_name;
            //this.planID = item.plan_id;
            this.user.planId = item.plan_id;
		}

		this.planFilterSearchBar.nativeElement.dismissSoftInput();
    }

    onSaveButtonTap() {
        this.isLoading = true;
        UserService.update(this.user).then((user)=>{
            alert({
                title: "",
                message: "Plan saved succesfully",
                okButtonText: "Ok"
             });
            
        }).catch((error)=>{
            alert("Problem saving plan " + error);
        });
        this._planService.getPlanById(this.user.planId).then((plan)=>{
            if (plan) {
                this.item = plan;
            } 
            this.isLoading = false;
            
        }).catch((error)=>{
            alert("Backend operation failed" + error);
        });
        this.isPlan = true;
        this.isEditPlan = false;
        this.resetaddEditPlan();
    }

    onCancelButtonTap() {
        this.isPlan = true;
        this.isEditPlan = false;
        this.resetaddEditPlan();
    }

    editPlanTap() {
        this.isPlan = false;
        this.addEditPlanText = "Please select a plan from the below list..";
        this.isEditPlan = true;
    }

    selectedIndexChanged(event) {
        console.log(event);
    }

    public onchange(args) {
        console.log(`Drop Down selected index changed from ${args.oldIndex} to ${args.newIndex}`);
        let state = this.items._array[args.newIndex].value;
        this.getPlans(state);
    }

    resetaddEditPlan() {
        if (this.plans) {
            this.plans.forEach((item) => item.selected = false);
        }
        this.filterPlans = "";
        this.planName = "";
        this.plans = [];
    }
}
