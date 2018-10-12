import { Component, ViewContainerRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { ActivatedRoute } from "@angular/router";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { ProviderService } from "../shared/services/provider.service";
import { Provider } from "../shared/models/provider.model";
import { RapidHealthProviders } from "../shared/models/rapidHealthProviders.model";

@Component({
	selector: "ResultsComponent",
	moduleId: module.id,
	templateUrl: "./results.component.html",
	styleUrls: ["./results-common.css"]
})
export class ResultsComponent {
	title: string;
	isLoading: boolean;
	public resultItems: ObservableArray<RapidHealthProviders>;
	public resultAllItems: ObservableArray<RapidHealthProviders>;

	get mySortingFunc(): (item: any, otherItem: any) => number {
        return (item: RapidHealthProviders, otherItem: RapidHealthProviders) => {
            const res = item.distance < otherItem.distance ? -1 : item.distance > otherItem.distance ? 1 : 0;
            return res;
        };
	}
		
	constructor(
		private _providerService: ProviderService,
		private _activatedRoute: ActivatedRoute,
		private _routerExtensions: RouterExtensions	) { }

	ngOnInit(): void {
		this.isLoading = true;
		this.title = "Find Results";	
		
		this._activatedRoute.params.subscribe(params => {
			params = params || {};
		
			this._providerService.findRapidHealthProviders(params.specialty, params.zipCode)
			.then(rapidproviders => {						
				this.resultAllItems = new ObservableArray<RapidHealthProviders>(rapidproviders);
				this.resultAllItems && this.resultAllItems.forEach(item => item.distance = Number(item.distance.toFixed(1)));
				this.resultItems = this.resultAllItems["_array"].filter(item=>item.provider.entity_type==="individual");
				this.isLoading = false;
			})
		});
	}
	onBackButtonTap(): void {
		this._routerExtensions.backToPreviousPage();
	}

	onResultTap(item: Provider) {
		this._routerExtensions.navigate(["results/result-detail", { rapidProvider: JSON.stringify(item)  }],
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
