import { Component , ViewChild} from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import { SearchBar } from "tns-core-modules/ui/search-bar";
import { isAndroid } from "tns-core-modules/platform";
import { Plan } from "../../shared/models/plan.model";
import { EventData } from "tns-core-modules/data/observable";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { RadListViewComponent } from "nativescript-ui-listview/angular";

@Component({
    selector: "my-modal",
    templateUrl: "app/plan/selectplan/selectplan.component.html",
})
export class ModalComponent {

    public frameworks: Array<string>;
    plans: Array<Plan>;
    isplanLoading: boolean;
    filterSpecialties: string = "";
    planListViewTemplateSelector;
    planFilteringFunc;
    parameters: any;
    
    @ViewChild("planListView") planListView: RadListViewComponent;
    @ViewChild("specialityFilterSearchBar") specialityFilterSearchBar: any;

    ngOnInit(): void {
		//this.isplanLoading = true;
        const filterFunc = (item: Plan): boolean => {
			return item.plan_name.toLowerCase().includes(this.filterSpecialties.toLowerCase());
		};
		this.planFilteringFunc = filterFunc.bind(this);

		this.planListViewTemplateSelector = (item: Plan, index: number, items: any) => {
			return items.length === index + 1 ? "last" : "default";
        };
        this.plans = this.parameters.context.plans;
        //this.plans.forEach(plan=>plan.plan_name);
        //this.isplanLoading = false;
    }

    public constructor(private params: ModalDialogParams) {
        this.parameters = params;
        this.isplanLoading = false;
        
    }

    public close(res: string) {
        this.params.closeCallback(res);
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

		this.filterSpecialties = searchBar.text;
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


}