import { Component , ViewChild} from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import { SearchBar } from "tns-core-modules/ui/search-bar";
import { isAndroid } from "tns-core-modules/platform";
import { Plan } from "../../shared/models/plan.model";
import { EventData } from "tns-core-modules/data/observable";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { RadListViewComponent } from "nativescript-ui-listview/angular";
import { ListViewEventData } from "nativescript-ui-listview";
import { RegistrationForm } from "../../login/registration/registration-form.model";
import { UserService } from "../../login/shared/user.service";
import { Kinvey } from "kinvey-nativescript-sdk";
import { RouterExtensions } from "nativescript-angular/router";

@Component({
    selector: "my-modal",
    templateUrl: "app/plan/selectplan/selectplan.component.html",
})
export class ModalComponent {

    public frameworks: Array<string>;
    plans: Array<Plan>;
    plan: Plan;
    isplanLoading: boolean;
    filterPlans: string = "";
    planListViewTemplateSelector;
    planFilteringFunc;
    parameters: any;
    planID: string;
    user: RegistrationForm;
    
    @ViewChild("planListView") planListView: RadListViewComponent;
    @ViewChild("planFilterSearchBar") planFilterSearchBar: any;

    ngOnInit(): void {
		this.isplanLoading = true;
        const filterFunc = (item: Plan): boolean => {
            return item.plan_name.toLowerCase().includes(this.filterPlans.toLowerCase());
            
		};
		this.planFilteringFunc = filterFunc.bind(this);

		this.planListViewTemplateSelector = (item: Plan, index: number, items: any) => {
			return items.length === index + 1 ? "last" : "default";
        };
        this.plans = this.parameters.context.plans;
        this.isplanLoading = false;
    }

    public constructor(private params: ModalDialogParams, 
        private _routerExtensions: RouterExtensions
        ) {
        this.parameters = params;
        this.isplanLoading = false;
        this.user = params.context.user;
   }

    public onCancelButtonTap() {
        this.params.closeCallback();
    }

    onSaveButtonTap() {
        UserService.update(this.user).then((planId) => {
            
            //PlanComponent.item = this._planService.getPlanById(this.user.planId) 
            this._routerExtensions.navigate(["plan"],
                    {
                        clearHistory: true,
                        animated: true,
                        transition: {
                            name: "slide",
                            duration: 200,
                            curve: "ease"
                        }
                    });
            alert({
                title: "",
                message: "Plan saved succesfully",
                okButtonText: "Ok"
            });
            this.params.closeCallback();
        }).catch((error:Kinvey.BaseError) => {
            alert({
                title: "Error adding active plan",
                message: error.message,
                okButtonText: "Ok"
            });
        })
    }

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
            this.plan = item.plan_name;
            this.planID = item.plan_id;
            this.user.planId = item.plan_id;
		}

		this.planFilterSearchBar.nativeElement.dismissSoftInput();
    }


}