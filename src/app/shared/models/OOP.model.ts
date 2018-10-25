import { Entity } from "kinvey-nativescript-sdk";

export class OOPallowedAmt {
    public serviceId: string;
    public POS: string;
    public serviceCost: string;
    public benefitType: string;
    public benefitValue: string;
    public label: string;
    public oop: string;
    public narrative: string;
    public narrative2: string;
  } 

export class OOPServices implements Entity{
    public _id : string;
    public episode : string;
    public episodeDesc: string;
    public service: string;
    public correlationId:string;
    public dedIndRem: string;
    public oopIndRem: string;
    public dedFamRem: string;
    public oopFamRem: string;
    public dedIndLimit: string;
    public oopIndLimit: string;
    public dedFamLimit: string;
    public oopFamLimit: string;
    public allowedAmt: Array<OOPallowedAmt>;


    constructor (options: any) {
        this.episode = options.episode;
        this.episodeDesc = options.episodeDesc;
        this.service = options.service;
        this.correlationId = options.correlationId;
        this.dedIndRem = options.dedIndRem;
        this.oopIndRem = options.oopIndRem;
        this.dedFamRem = options.dedFamRem;
        this.oopFamRem = options.oopFamRem;
        this.dedIndLimit = options.dedIndLimit;
        this.oopIndLimit = options.oopIndLimit;
        this.dedFamLimit = options.dedFamLimit;
        this.oopFamLimit = options.oopFamLimit;
        this.allowedAmt = options.allowedAmt || [];
    }
}
