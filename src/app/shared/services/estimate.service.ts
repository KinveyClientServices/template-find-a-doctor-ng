import { Injectable } from "@angular/core";
import { Kinvey } from "kinvey-nativescript-sdk";
import { Procedure } from "../../shared/models/procedure.model";
import { Estimate } from "../models/estimate.model";
@Injectable()
export class EstimateService {

	private _estimates: Array < Estimate > ;
	private _estimatesPromise: Promise < any > ;
	private _oopStore = Kinvey.DataStore.collection < Procedure > ("OOP", Kinvey.DataStoreType.Network);
	private _oopWidgetStore = Kinvey.DataStore.collection("oop-widget", Kinvey.DataStoreType.Network);

	getOOPDetails(procedure: Procedure): Promise <any> {
		const oopQuery = new Kinvey.Query();
		oopQuery.equalTo("episode_name", procedure.episode);
		oopQuery.equalTo("service_id", "");
		oopQuery.equalTo("category_name", "Day Of");

		return this._oopWidgetStore.find(oopQuery).toPromise()
			.then((data) => {

				if (data && data.length) {
					return data;
				}
			})
			.catch((error) => {
				alert("OOPS! Something went wrong or No Data Found");
			});
	}
}
