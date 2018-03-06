import { Injectable } from "@angular/core";
import { Kinvey } from "kinvey-nativescript-sdk";
import { Observable } from "rxjs/Rx";
import { Specialty } from "./specialty";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";

@Injectable()
export class SpecialtyService {

    private _specialities: Array<Specialty>;

    private _specialtyStore = Kinvey.DataStore.collection<Specialty>("Specialty", Kinvey.DataStoreType.Network);
    private _specialitiesPromise: Promise<any>;

    getSpecialties(): Promise<Specialty[]> {
        if (!this._specialitiesPromise) {
            this._specialitiesPromise = this._specialtyStore.find().toPromise()
                .then((data) => {
                    this._specialities = [];

                    if (data && data.length) {
                        data.forEach((specialtyData: any) => {
                            //TODO: remove this hack when specialties are updated
                            if (specialtyData.specialty) {
                                specialtyData.specialty = specialtyData.specialty.charAt(0).toUpperCase() + specialtyData.specialty.slice(1);
                            }
                            
                            const specialty = new Specialty(specialtyData);
                            this._specialities.push(specialty);
                        });
                    }

                    return this._specialities;
                })
                .catch((error: Kinvey.BaseError) => {
                    alert({
                        title: "Oops something went wrong.",
                        message: error.message,
                        okButtonText: "Ok"
                    });
                });
        }

        return this._specialitiesPromise;
    }

}
