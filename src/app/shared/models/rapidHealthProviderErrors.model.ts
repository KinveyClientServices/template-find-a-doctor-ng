import { Entity } from "kinvey-nativescript-sdk";

export class ProviderLocationError {
    public city: string;
    public fax: string;
    public address_lines: Array<string>;
    public zipcode: string;
    public country: string;
    public phone: string;
    public state: string;
    public geo_location: Array<Number>;
    public suite: string;
  }     

export class ProviderResidency {
    public institution_name: string;
    public to_year?: Number;
    public type: string;
}

export class ProviderLicense {
    public status?: string;
    public verified?: string;
    public expiration_date?: string;
    public number: string;
    public state: string;
}

export class RapidHealthProviderErrors implements Entity {
    public _id : string;
    public uuid: string;
    public npi: string;
    public entity_type:string;
    public prefix: string;
    public first_name: string;
    public middle_name: string;
    public last_name: string;
    public birth_date: string;
    public gender: string;
    public locations: Array<ProviderLocationError>;
    public phone: string;
    public fax: string;
    public degree: string;
    public specialty: Array<string>;
    public specialty_primary: Array<string>;
    public specialty_secondary: Array<string>;
    public licensures: Array<ProviderLicense>;
    public licenses: Array<ProviderLicense>;
    public residencies: Array<ProviderResidency>;
    public education: {
        graduation_year: Number,
        medical_school: string
    };
    public board_certifications: Array<string>;
    public verified: Boolean;
    public distance: Number;
    public _kmd: {
        ect: string;
        lmt: string;
    };
    public status: string;
    public useremail: string;

    constructor (options: any) {
        this.uuid = options.uuid;
        this.npi = options.npi;
        this.entity_type = options.entity_type;
        this.prefix = options.prefix;
        this.first_name = options.first_name;
        this.middle_name = options.middle_name;
        this.last_name = options.last_name;
        this.birth_date = options.birth_date;
        this.gender = options.gender;
        this.locations = options.locations || [];
        this.phone = options.phone;
        this.fax = options.fax;
        this.degree = options.degree;
        this.specialty = options.specialty || [];
        this.specialty_primary = options.specialty_primary || [];
        this.specialty_secondary = options.specialty_secondary || [];
        this.licensures = options.licensures || [];
        this.licenses = options.licenses || [];
        this.residencies = options.residencies || [];
        this.education = options.education;
        this.board_certifications = options.board_certifications || [];
        this.verified = options.verified;
        this.distance = options.distance; 
        this._kmd = options._kmd || [];
        this.status = options.status;
    }
}
