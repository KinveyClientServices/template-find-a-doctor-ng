import { Injectable } from "@angular/core";
import { Kinvey } from "kinvey-nativescript-sdk";
@Injectable()
export class StatesService {

	private _USStates = Kinvey.DataStore.collection("USStates", Kinvey.DataStoreType.Network);

	getUSSStates(): Promise<any> {
        return this._USStates.find().toPromise()
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
