import { Injectable } from "@angular/core";
import { Kinvey } from "kinvey-nativescript-sdk";
import { RapidHealthProviders } from "~/app/shared/models/rapidHealthProviders.model";
import { RapidHealthProviderErrors } from "~/app/shared/models/rapidHealthProviderErrors.model";
import { Provider } from "../../shared/models/provider.model";

@Injectable()
export class ProviderService {

    dataStoreType = Kinvey.DataStoreType.Network;
    // tslint:disable-next-line:max-line-length
    private _rapidproviderStore = Kinvey.DataStore.collection<RapidHealthProviders>("RapidHealthProviders/Provider", this.dataStoreType);
    private _rapidproviderErrorsStore = Kinvey.DataStore.collection<RapidHealthProviderErrors>("RapidHealthProviderErrors", this.dataStoreType);

    // tslint:disable-next-line:max-line-length
    findRapidHealthProviders(specialty: string, zipCode: string, latLong: string): Promise<Array<RapidHealthProviders>> {

        const query = new Kinvey.Query();

        if (specialty) {
            query.equalTo("specialty", specialty);
        }
        if (zipCode) {
            (specialty ? query.and() : query).equalTo("zipcode", zipCode);
        }
        if (latLong && !zipCode) {
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

    saveItem(item : RapidHealthProviderErrors): RapidHealthProviderErrors {
        

        const rapidprovidersPromise = this._rapidproviderErrorsStore.save(item)
        .then((function(item){
            console.log(item);
            return item;
        }))
        .catch(function(error){
            console.log(error);
        }
        );
      return item;
    }

}
