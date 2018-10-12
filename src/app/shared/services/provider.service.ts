import { Injectable } from "@angular/core";
import { Kinvey } from "kinvey-nativescript-sdk";
import { Provider } from "../../shared/models/provider.model";
import { RapidHealthProviders } from "~/app/shared/models/rapidHealthProviders.model";

@Injectable()
export class ProviderService {

    public dataStoreType = Kinvey.DataStoreType.Network;    
    private _rapidproviderStore = Kinvey.DataStore.collection<RapidHealthProviders>("RapidHealthProviders/Provider", this.dataStoreType);
        
    findRapidHealthProviders(specialty: string, zipCode: string): Promise<RapidHealthProviders[]> {
       
        const query = new Kinvey.Query();

        if (specialty) {
            query.equalTo("specialty", specialty);
        }
        if (zipCode) {
            (specialty ? query.and() : query).equalTo("zipcode", zipCode);
        }

        const rapidprovidersPromise = this._rapidproviderStore.find(query).toPromise()
            .then((response) => {
                let rapidproviders = [];
                rapidproviders =  response as RapidHealthProviders[];     
                
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
