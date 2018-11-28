import { Injectable } from "@angular/core";
import { Kinvey } from "kinvey-nativescript-sdk";
import { Plan } from "../models/plan.model";

@Injectable()
export class PlanService {
    private _plans: Array<Plan>;
    private _plansBystate: Array<Plan>;
    private _planStore = Kinvey.DataStore.collection<Plan>("RapidHealthPlans", Kinvey.DataStoreType.Network);
    private _plansPromise: Promise<any>;

    getPlanById(id: string): Promise<any> {
        const query = new Kinvey.Query();
        query.equalTo("plan_id", id);
        return this._planStore.find(query).toPromise()
            .then(data => {
                return <Plan>data[0];
            }, (err) => { console.log(err); })
            .catch((error: Kinvey.BaseError) => {
                alert({
                    title: "Oops something went wrong.",
                    message: error.message,
                    okButtonText: "Ok"
                });
            });
    }

    getPlansByState(state: string):Promise<Plan[]> {
        const query = new Kinvey.Query();

        if (state) {
            query.equalTo("state", state);
        }
        
        const planPromise = this._planStore.find(query).toPromise()
            .then((response) => {
                let plans = [];
                plans =  response as Array<Plan>;

                return plans;
            }, (err) => { console.log(err); })
            .catch((error: Kinvey.BaseError) => {
                alert({
                    title: "Oops something went wrong.",
                    message: error.message,
                    okButtonText: "Ok"
                });

                return null;
            });

        return planPromise;

    }

    getPlans(): Promise<Plan[]> {
        if (!this._plansPromise) {
            this._plansPromise = this._planStore.find().toPromise()
                .then((data) => {
                    const plans = [];

                    if (data && data.length) {
                        data.forEach((planData: any) => {
                            const plan = new Plan(planData);
                            plans.push(plan);
                        });
                    }

                    this._plans = plans;

                    return plans;
                })
                .catch((error: Kinvey.BaseError) => {
                    alert({
                        title: "Oops something went wrong.",
                        message: error.message,
                        okButtonText: "Ok"
                    });
                });
        }

        return this._plansPromise;
    }
}
