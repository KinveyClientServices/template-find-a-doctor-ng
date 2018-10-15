import { Injectable } from "@angular/core";
import { Kinvey } from "kinvey-nativescript-sdk";
import { RapidHealthProviders } from "~/app/shared/models/rapidHealthProviders.model";
import { Provider } from "../../shared/models/provider.model";

@Injectable()
export class ProviderService {

    dataStoreType = Kinvey.DataStoreType.Network;
    // tslint:disable-next-line:max-line-length
    private _rapidproviderStore = Kinvey.DataStore.collection<RapidHealthProviders>("RapidHealthProviders/Provider", this.dataStoreType);

    // tslint:disable-next-line:max-line-length
    findRapidHealthProviders(specialty: string, zipCode: string, latLong: string): Promise<Array<RapidHealthProviders>> {

        const query = new Kinvey.Query();

        if (specialty) {
            query.equalTo("specialty", specialty);
        }
        if (zipCode) {
            (specialty ? query.and() : query).equalTo("zipcode", zipCode);
        }
        if (latLong) {
            (specialty ? query.and() : query).equalTo("lat_lon", latLong);
        }

        const rapidprovidersPromise = this._rapidproviderStore.find(query).toPromise()
            .then((response) => {
                let rapidproviders = [];
                rapidproviders =  response as Array<RapidHealthProviders>;

                return rapidproviders;
            }, (err) => { console.log(err); })
            .catch((error: Kinvey.BaseError) => {
                alert({
                    title: "Oops something went wrong.",
                    message: error.message,
                    okButtonText: "Ok"
                });

                return null;
            });

        return rapidprovidersPromise;
    }

}
