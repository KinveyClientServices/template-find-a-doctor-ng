import { ChangeDetectorRef, Component, OnInit, ViewContainerRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { ListViewLinearLayout, RadListView } from "nativescript-ui-listview";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { Provider } from "../shared/models/provider.model";
import { RapidHealthProviders } from "../shared/models/rapidHealthProviders.model";
import { ProviderService } from "../shared/services/provider.service";
@Component({
 selector: "ResultsComponent",
 moduleId: module.id,
 templateUrl: "./results.component.html",
 styleUrls: ["./results-common.css"]
})
export class ResultsComponent implements OnInit {
 title: string;
 isLoading: boolean;
 resultItems: ObservableArray<RapidHealthProviders>;
 resultAllItems: ObservableArray<RapidHealthProviders>;

 private layout: ListViewLinearLayout;

 get mySortingFunc(): (item: any, otherItem: any) => number {
  return (item: RapidHealthProviders, otherItem: RapidHealthProviders) => {
   const res = item.distance < otherItem.distance ? -1 : item.distance > otherItem.distance ? 1 : 0;

   return res;
  };
 }

 constructor(
  private _providerService: ProviderService,
  private _activatedRoute: ActivatedRoute,
  private _routerExtensions: RouterExtensions,
  private _changeDetectionRef: ChangeDetectorRef) { }

 ngOnInit(): void {
  this.isLoading = true;
  this.title = "Find Results";
  this.layout = new ListViewLinearLayout();
  this.layout.scrollDirection = "Vertical";
  this._changeDetectionRef.detectChanges();
  // this.resultItems = new ObservableArray<rapidHealthProviders>();

  this._activatedRoute.params.subscribe((params) => {
   params = params || {};

   this._providerService.findRapidHealthProviders(params.specialty, params.zipCode, params.latLong)
    .then((rapidproviders) => {
     this.resultAllItems = new ObservableArray<RapidHealthProviders>(rapidproviders);
     // tslint:disable-next-line:no-unused-expression
     this.resultAllItems && this.resultAllItems.forEach((item) => item.distance = Number(item.distance.toFixed(1)));
     // tslint:disable-next-line:no-string-literal
     this.resultItems = this.resultAllItems["_array"].filter((item) => item.provider.entity_type === "individual");
     this.isLoading = false;
    });
  });
 }

 addMoreItemsFromSource(chunkSize: number, that) {
  const newItems = that.resultAllItems.splice(0, chunkSize);
    that.resultItems.push(newItems);
 }


 onLoadMoreItemsRequested(args) {
  const that = new WeakRef(this);
  // tslint:disable-next-line:no-this-assignment
  const resultComp = this;
  const listView: RadListView = args.object;
  //if (listView.items.length < this.resultItems.length)
  if (this.resultItems.length > 0) {
   setTimeout(() => {
    that.get().addMoreItemsFromSource(10, resultComp);
    listView.notifyLoadOnDemandFinished();
   }, 1000);
  } else {
   args.returnValue = false;
   listView.notifyLoadOnDemandFinished(true);
  }
 }

 onBackButtonTap(): void {
  this._routerExtensions.backToPreviousPage();
 }

 onResultTap(item: Provider) {
  this._routerExtensions.navigate(["results/result-detail", {
   rapidProvider: JSON.stringify(item)
  }], {
    animated: true,
    transition: {
     name: "slide",
     duration: 200,
     curve: "ease"
    }
   });
 }
}
