import { Injectable } from "@angular/core";
import { Kinvey } from "kinvey-nativescript-sdk";
import { Procedure } from "../models/procedure.model";

@Injectable()
export class ProcedureService {

    private _procedures: Array<Procedure>;
    private _filterProcedures: Array<any>;

    private _procedureStore = Kinvey.DataStore.collection<Procedure>("oop-services", Kinvey.DataStoreType.Network);
    private _proceduresPromise: Promise<any>;

    getProcedures(): Promise<Array<Procedure>> {
        if (!this._proceduresPromise) {
            this._proceduresPromise = this._procedureStore.find().toPromise()
                .then((data) => {
                    this._procedures = [];
                    this._filterProcedures = [];
                    this._filterProcedures = [] as Array<Procedure>;
                    this._procedures =  data as Array<Procedure>;
                   
                    var _tempProcedures = new Array<Procedure>();
                    this._procedures.forEach(function(element){
                        var isDuplicate : boolean = true;
                        if(_tempProcedures.length > 0){
                            _tempProcedures.some(function(item){
                                if(item.episode !== element.episode){
                                   isDuplicate = false;
                                }
                                else{
                                    isDuplicate = true;
                                    return true;
                                }
                            })
                            if(!isDuplicate){
                                _tempProcedures.push(element);
                            }
                        }else{
                            _tempProcedures.push(element);
                        }
                        
                    })
                    this._filterProcedures = _tempProcedures;

                    return this._filterProcedures;
                })
                .catch((error: Kinvey.BaseError) => {
                    alert({
                        title: "Oops something went wrong.",
                        message: error.message,
                        okButtonText: "Ok"
                    });
                });
        }

        return this._proceduresPromise;
    }
}
