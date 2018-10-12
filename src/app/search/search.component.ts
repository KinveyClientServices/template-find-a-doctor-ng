import { Component, ViewContainerRef, ViewChild, NgZone } from "@angular/core";
import { EventData } from "tns-core-modules/data/observable";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { SearchBar } from "tns-core-modules/ui/search-bar";
import { ListViewEventData } from "nativescript-ui-listview";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { RouterExtensions } from "nativescript-angular/router";
import { SpecialtyService } from "./shared/specialty.service";
import { AppointmentService } from "../shared/services/appointment.service";
import { ProviderService } from "../shared/services/provider.service";
import { Appointment } from "../shared/models/appointment.model";
import { RadListViewComponent } from "nativescript-ui-listview/angular";
import { Specialty } from "./shared/specialty";
import { isAndroid } from "tns-core-modules/platform";
import * as geolocation from "nativescript-geolocation";

@Component({
    selector: "SearchComponent",
    moduleId: module.id,
    templateUrl: "./search.component.html",
    styleUrls: ["./search-common.css"],
    providers: [SpecialtyService, AppointmentService]
})
export class SearchComponent {
    selectedFilter: string = "home";
    specialty: string;
    specialtyItems: ObservableArray<Specialty>;
    recentItems: ObservableArray<any>;
    zipCode: string;
    filterSpecialties: string = "";
    isSpecialtyLoading: boolean;
    specialtyFilteringFunc: Function;
    appointmentsGroupingFunc: Function;
    specialtyListViewTemplateSelector: Function;
    navigator: Navigator;
    
    @ViewChild("specialtyListView") specialtyListView: RadListViewComponent;
    @ViewChild("specialityFilterSearchBar") specialityFilterSearchBar: any;

    constructor(
        private _appointmentService: AppointmentService,
        private _providerService: ProviderService,
        private _specialtyService: SpecialtyService,
        private _routerExtensions: RouterExtensions,
        private _ngZone: NgZone,
    ) { }

    ngOnInit(): void {
        this.selectedFilter = "home";
        this.isSpecialtyLoading = true;
        this.recentItems = new ObservableArray<Appointment>(0);
        const filterFunc = (item: Specialty): boolean => {
            return item.specialty.toLowerCase().includes(this.filterSpecialties.toLowerCase());
        };
        this.specialtyFilteringFunc = filterFunc.bind(this);
        const groupingFunc = (item: Appointment): string => {
            // non-braking space used to force Outdated group to be at the bottom
            return this.isRecent(item) ? " Your Recent Appointments".toUpperCase() : "\u00a0Outdated".toUpperCase();
        }
        this.appointmentsGroupingFunc = groupingFunc.bind(this);

        this.specialtyListViewTemplateSelector = (item: Specialty, index: number, items: any) => {
            return items.length === index + 1 ? "last" : "default";
        }

        this._specialtyService.getSpecialties().then(specialities => {
            this.specialtyItems = new ObservableArray<Specialty>(specialities);
            this.isSpecialtyLoading = false;
        });

       

        //to enable location services
        geolocation.isEnabled().then(function (isEnabled) {
            if (!isEnabled) {
                geolocation.enableLocationRequest().then(function () {
                }, function (e) {
                    console.log("Error1: " + (e.message || e));
                });
            }
        }, function (e) {
            console.log("Error2: " + (e.message || e));
        });
          //get current location (latitude and longitude)
        var location = geolocation.getCurrentLocation({desiredAccuracy: 3, updateDistance: 10, maximumAge: 20000, timeout: 20000}).
        then(function(loc) {
            if (loc) {
                console.log("Latitude: " +loc.latitude);
                console.log("Longitude: " +loc.longitude);
            }
        }, function(e){
            console.log("Error: " + e.message);
        });
            
    }
    

    public specialtySearchBarLoaded(args) {
        var searchbar: SearchBar = <SearchBar>args.object;
        if (isAndroid) {
            searchbar.android.clearFocus();
        }
    }

    onResetLabelTap() {
        this.selectedFilter = "home";
        this.zipCode = "";
        this.specialty = "";
        this.specialtyItems && this.specialtyItems.forEach(item => item.selected = false);

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
        if(this.specialty === undefined) {
            alert("Please select a speciality to find physicians near you");
            return;
        }
        // set values to "" if zipCode or speciality are undefined 
        // since undefined is passed as "undefined" string in NG navigation
        let filter = {
            zipCode: this.zipCode || "",
            specialty: this.specialty || ""
        };

        this._routerExtensions.navigate(["/results", filter],
            {
                animated: true,
                transition: {
                    name: "slide",
                    duration: 200,
                    curve: "ease"
                }
            });
    }

    specialtySelected(args: ListViewEventData) {
        this.specialtyItems.forEach(item => item.selected = false);
        const selectedItems = args.object.getSelectedItems();
        const item = selectedItems && selectedItems[0];
        if (item) {
            item.selected = true;
            this.specialty = item.specialty;
        }

        this.specialityFilterSearchBar.nativeElement.dismissSoftInput();
    }

    onProfileButtonTap() {
        this._routerExtensions.navigate(["/plan"],
            {
                animated: true,
                transition: {
                    name: "fade",
                    duration: 200
                }
            });
    }

    getProviderName(appointment: Appointment): string {
        // TODO: get the provider's name from the appointment
        return "Dr. Jerome Aya-Ay"; // item.prefix + ' ' + item.first_name + ' ' + item.last_name
    }

    getProviderImage(appointment: Appointment): string {
        // TODO: get the provider's small image from the appointment
        return "https://thumb9.shutterstock.com/display_pic_with_logo/102/172174202/stock-photo-portrait-of-confident-male-doctor-with-arms-crossed-standing-at-clinic-172174202.jpg";
    }

    getStartTime(start: string): string {
        const parsed = start && new Date(start);
        let result = "";
        if (parsed) {
            const locale = "en-us", hours = parsed.getHours(), minutes = parsed.getMinutes();
            result = `${parsed.toLocaleDateString(locale)}, at ${hours % 12 === 0 ? 12 : hours % 12}:${minutes > 10 ? minutes : '0' + minutes}${hours < 12 ? 'AM' : 'PM'}.`;
        }
        return result;
    }

    onAppointmentTap(appointment: Appointment) {
        // TODO: get actual provider npi from the appointment - appointment.provider_scheduler_uuid ? 
        const providerNpi = "1467560003";
        this._routerExtensions.navigate(["results/result-detail", { npi: providerNpi, remove: true, appointment: appointment.appointment_id }],
            {
                animated: true,
                transition: {
                    name: "slide",
                    duration: 200,
                    curve: "ease"
                }
            });
    }

    onTextChanged(args: EventData) {
        let searchBar = <SearchBar>args.object;

        this.filterSpecialties = searchBar.text;
        this.specialtyListView.listView.refresh();
    }

    isRecent(item: Appointment): boolean {
        var endDate = item && item.end_date && new Date(item.end_date);
        return (endDate && (endDate > new Date()))
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

    //to set zip code character limit
    onZipCodeChange(args) { 
        var textfield = args.object;
        var legth = parseInt("5");
            var array = [];
            array[0] = new android.text.InputFilter.LengthFilter(legth);
            textfield .android.setFilters(array);
    }
}
