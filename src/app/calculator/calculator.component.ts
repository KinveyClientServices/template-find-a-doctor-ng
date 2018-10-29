import { Component, NgZone, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { ListViewEventData } from "nativescript-ui-listview";
import { RadListViewComponent } from "nativescript-ui-listview/angular";
import { EventData } from "tns-core-modules/data/observable";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { isAndroid } from "tns-core-modules/ui/page/page";
import { SearchBar } from "tns-core-modules/ui/search-bar";
import { Procedure } from "../shared/models/procedure.model";
import { ProcedureService } from "../shared/services/procedure.service";

@Component({
    selector: "CalculatorComponent",
    moduleId: module.id,
    templateUrl: "./calculator.component.html",
    styleUrls: ["./calculator-common.css"],
    providers: [ProcedureService]
})
export class CalculatorComponent implements OnInit {
    procedures: ObservableArray<any>; // TODO: ObservableArray<Procedure>;
    procedure: string = "";
    isLoading: boolean;
    hasConsentToSearch: boolean = false;
    proceduresFilter: string = "";
    procedureFilteringFunc: Function;

    @ViewChild("proceduresListView") proceduresListView: RadListViewComponent;
    @ViewChild("searchBar") searchBar: any;

    constructor(
        private _procedureService: ProcedureService,
        private _routerExtensions: RouterExtensions,
        private _ngZone: NgZone
    ) { }

    onResetLabelTap() {
      //  this.filterSpecialties = "";
        this.proceduresFilter = "";
        this.hasConsentToSearch = false;
        if (this.procedure) {
            this.procedures.forEach((item) => item.selected = false);
        }
        this.procedure = "";
    }

    ngOnInit(): void {
       // this.isLoading = true;
        this.procedureFilteringFunc = this.getFilteringFunc();

        this._procedureService.getProcedures().then((procedures) => {
            this.procedures = new ObservableArray<Procedure>(procedures);
            this.proceduresListView.listView.items = procedures;
            this.proceduresListView.listView.refresh();
         //   this.isLoading = false;
        });
    }

    onSearchBarLayoutChange(args) {
        const sb = <SearchBar>args.object;

        if (isAndroid) {
            sb.android.clearFocus();
        }
    }

    procedureSelected(args: ListViewEventData) {
        this.procedures.forEach((item) => item.selected = false);
        const selectedItems = args.object.getSelectedItems();
        const item = selectedItems && selectedItems[0];

        if (item) {
            item.selected = true;
            this.procedure = item;
        }

        this.searchBar.nativeElement.dismissSoftInput();
    }

    getFilteringFunc(): (item: Procedure) => boolean {
        const filterFunc = (item: Procedure): boolean => {
            if(item.episode && item.keywords){
                return item.episode.toLowerCase().includes(this.proceduresFilter.toLowerCase()) ||
                item.keywords.toLowerCase().includes(this.proceduresFilter.toLowerCase());
            }else if(item.keywords){
                return item.keywords.toLowerCase().includes(this.proceduresFilter.toLowerCase());
            } else if(item.episode){
                return item.episode.toLowerCase().includes(this.proceduresFilter.toLowerCase());
            }
        };

        return filterFunc;
    }

    onProcedureFilterSubmit(args: EventData) {
        this.searchBar.nativeElement.dismissSoftInput();
    }

    onTextChanged(args: EventData) {
        const searchBar = <SearchBar>args.object;

        this.proceduresFilter = searchBar.text;
        this.proceduresListView.listView.refresh();
    }

    onSubmitButtonTap(args: EventData) {
        this._routerExtensions.navigate(["/calculator-result", this.procedure],
            {
                animated: true,
                transition: {
                    name: "slide",
                    duration: 200,
                    curve: "ease"
                }
            });
    }
}
