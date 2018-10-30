import { Component, NgZone,	OnInit,	ViewChild,	ViewContainerRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import * as geolocation from "nativescript-geolocation";
import { ListViewEventData } from "nativescript-ui-listview";
import { RadListViewComponent } from "nativescript-ui-listview/angular";
import { EventData } from "tns-core-modules/data/observable";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { isAndroid } from "tns-core-modules/platform";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { SearchBar } from "tns-core-modules/ui/search-bar";
import { Specialty } from "./shared/specialty";
import { SpecialtyService } from "./shared/specialty.service";

@Component({
	selector: "SearchComponent",
	moduleId: module.id,
	templateUrl: "./search.component.html",
	styleUrls: ["./search-common.css"],
	providers: [SpecialtyService]
})
export class SearchComponent implements OnInit {
	selectedFilter: string = "home";
	specialty: string;
	specialtyItems: ObservableArray<Specialty>;
	recentItems: ObservableArray<any>;
	zipCode: string;
	filterSpecialties: string = "";
	isSpecialtyLoading: boolean;
	specialtyFilteringFunc;
	specialtyListViewTemplateSelector;
	navigator: Navigator;
	latLong: string;
	isValid: boolean = true;

	@ViewChild("specialtyListView") specialtyListView: RadListViewComponent;
	@ViewChild("specialityFilterSearchBar") specialityFilterSearchBar: any;

	constructor(
		private _specialtyService: SpecialtyService,
		private _routerExtensions: RouterExtensions,
		private _ngZone: NgZone
	) { }

	ngOnInit(): void {
		this.selectedFilter = "home";
		this.isSpecialtyLoading = true;
		const filterFunc = (item: Specialty): boolean => {
			return item.specialty.toLowerCase().includes(this.filterSpecialties.toLowerCase());
		};
		this.specialtyFilteringFunc = filterFunc.bind(this);

		this.specialtyListViewTemplateSelector = (item: Specialty, index: number, items: any) => {
			return items.length === index + 1 ? "last" : "default";
		};

		this._specialtyService.getSpecialties().then((specialities) => {
			this.specialtyItems = new ObservableArray<Specialty>(specialities);
			this.isSpecialtyLoading = false;
		});

		// to enable location services
		geolocation.isEnabled().then((isEnabled) => {
			if (!isEnabled) {
				geolocation.enableLocationRequest();
			}
		});
		// get current location (latitude and longitude)
		const location = geolocation.getCurrentLocation({
			desiredAccuracy: 3,
			updateDistance: 10,
			maximumAge: 20000,
			timeout: 20000
		}).
			then((loc) => {
				if (loc) {
					console.log("Latitude: " + loc.latitude);
					console.log("Longitude: " + loc.longitude);
				}
			}, (e) => {
				console.log("Error: " + e.message);
			});

	}

	specialtySearchBarLoaded(args) {
		const searchbar: SearchBar = <SearchBar>args.object;
		if (isAndroid) {
			searchbar.android.clearFocus();
		}
	}

	onResetLabelTap() {
		this.selectedFilter = "home";
		this.zipCode = "";
		this.specialty = "";
		this.filterSpecialties = "";
		if (this.specialtyItems) {
		this.specialtyItems.forEach((item) => item.selected = false);
		}
		// close keyboard in android
		if (isAndroid) {
			this.specialityFilterSearchBar.nativeElement.dismissSoftInput();
		}
	}

	onFilterButtonTap(args: EventData) {
		const sl = (<StackLayout>args.object).parent;
		this.selectedFilter = sl.get("data-name");
	}

	onFindButtonTap(args: EventData) {
	// tslint:disable-next-line:no-this-assignment
	const that = this;

	if (this.zipCode && this.zipCode.length < 5) {
		alert("Please enter the valid zip code.");

		return;
	}
	if (this.specialty === undefined || this.specialty === "") {
		alert("Please Select specialty to get list of physicians near you");

		return;
	}

	geolocation.isEnabled().then((isEnabled) => {
		if (!isEnabled && (that.zipCode === undefined || that.zipCode === "")) {
			alert("Please enable location services or enter zip code to find physicians near you.");

			return  false;
		} else if (isEnabled && (that.zipCode === undefined || that.zipCode === "")) {
			// get current location (latitude and longitude)
			geolocation.getCurrentLocation({
				desiredAccuracy: 3,
				updateDistance: 10,
				maximumAge: 20000,
				timeout: 20000
			}).then((loc) => {
				if (loc) {
					console.log("Latitude: " + loc.latitude);
					console.log("Longitude: " + loc.longitude);
					that.latLong = loc.latitude + "," + loc.longitude;
					that.navigateToResultsScreen(that);
				}
			});
		} else {
			that.navigateToResultsScreen(that);
		}
	});
}

	navigateToResultsScreen(that) {
		const filter = {
			zipCode: that.zipCode || "",
			specialty: that.specialty || "",
			latLong: that.latLong || ""
		};

		this._routerExtensions.navigate(["/results", filter], {
			animated: true,
			transition: {
				name: "slide",
				duration: 200,
				curve: "ease"
			}
		});
	}

	specialtySelected(args: ListViewEventData) {
		// tslint:disable-next-line:no-shadowed-variable
		this.specialtyItems.forEach((item) => item.selected = false);
		const selectedItems = args.object.getSelectedItems();
		const item = selectedItems && selectedItems[0];
		if (item) {
			item.selected = true;
			this.specialty = item.specialty;
		}

		this.specialityFilterSearchBar.nativeElement.dismissSoftInput();
	}

	onProfileButtonTap() {
		this._routerExtensions.navigate(["/plan"], {
			animated: true,
			transition: {
				name: "fade",
				duration: 200
			}
		});
	}

	onTextChanged(args: EventData) {
		const searchBar = <SearchBar>args.object;

		this.filterSpecialties = searchBar.text;
		this.specialtyListView.listView.refresh();
	}

	capitalize(item: string): string {
		return item ? item.charAt(0).toUpperCase() + item.slice(1) : "";
	}

	specialtyGroupingFunc(item: Specialty): any {
		return (item && item.specialty && item.specialty[0].toUpperCase()) || "";
	}

	onSpecialtyFilterSubmit(args: EventData) {
		if (args) {
			const searchTextBar = <SearchBar>args.object;
			searchTextBar.dismissSoftInput();
		}
	}

	// to set zip code character limit
	onZipCodeChange(args) {
		const textfield = args.object;
		// tslint:disable-next-line:radix
		const legth = parseInt("5");
		const array = [];
		array[0] = new android.text.InputFilter.LengthFilter(legth);
		textfield.android.setFilters(array);
	}
}
