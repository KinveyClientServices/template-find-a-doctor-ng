import { Entity } from "kinvey-nativescript-sdk";

export class Procedure implements Entity {
    _id: string;
    episode: string;
    service: string;
    keywords: string;
    selected: boolean;

    constructor(dataItem: any) {
        dataItem = dataItem || {};
        this._id = dataItem._id;
        this.episode = dataItem.episode;
        this.service = dataItem.service;
        this.keywords = dataItem.keywords;
        this.selected = dataItem.selected === true;
    }
}
