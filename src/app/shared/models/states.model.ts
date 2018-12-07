import { Entity } from "kinvey-nativescript-sdk";
import { stringify } from "@angular/core/src/util";

export class States implements Entity{
    public _id : string;
    public name: string;

    constructor () {
        this.name = "";
    }
}
