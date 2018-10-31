import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { SelectedIndexChangedEventData } from "tns-core-modules/ui/tab-view";
import { Estimate } from "../shared/models/estimate.model";
import { OOPServices } from "../shared/models/OOP.model";
import { Procedure } from "../shared/models/procedure.model";
import { EstimateService } from "../shared/services/estimate.service";
@Component({
	selector: "CalculatorResultComponent",
	moduleId: module.id,
	templateUrl: "./calculator-result.component.html",
	styleUrls: ["./calculator-result-common.css"]
})
export class CalculatorResultComponent implements OnInit {
	procedure: Procedure;
	title: string;
	procedureDesc: string;
	isLoading: boolean;
	resultItems: Array < Estimate > ;
	facilityCharge: string;
	professionalCharge: string;
	cost: number;
	calculation: string;
	show: boolean;
	showHideBtn: boolean;
	counter: number;
	pos: string;
	facilityCharges: OOPServices;
	professionalCharges: OOPServices;
	totalCharges: Array < any > ;

	// low,average,high variables
	lowCost: number;
	avgCost: number;
	highCost: number;
	lowCalc: string;
	avgCalc: string;
	highCalc: string;
	lowFacilityCharge: string;
	avgFacilityCharge: string;
	highFacilityCharge: string;
	lowProfessionalCharge: string;
	avgProfessionalCharge: string;
	highProfessionalCharge: string;
	coInsuranceFacility: string;
	coInsuranceProfessional: string;
	lowTap: boolean;
	avgTap: boolean;
	highTap: boolean;

	constructor(
		private _estimateService: EstimateService,
		private _activatedRoute: ActivatedRoute,
		private _routerExtensions: RouterExtensions
	) {}

	ngOnInit(): void {
		this.isLoading = true;
		this.counter = 0;
		this.show = false;
		this.showHideBtn = true;
		this.lowTap = false;
		this.avgTap = true;
		this.highTap = false;
		this._activatedRoute.params.subscribe((params) => {
			params = params || {};
			this.procedure = <Procedure> params;
			this.title = this.procedure.episode;
			this._estimateService.getOOPDetails(this.procedure)
				.then((estimates) => {
					this.isLoading = false;
					this.resultItems = estimates;
					if (estimates && estimates.length) {
						this.procedureDesc = estimates[0].episodeDesc;
						this.pos = estimates[0].allowedAmt[0].POS;
						estimates.forEach((oop) => {
							if (oop.service === "Facility Charges") {
								this.facilityCharges = oop;
							} else if (oop.service === "Professional Charges") {
								this.professionalCharges = oop;
							} else {	
								if(oop.totals) {
									this.totalCharges = oop.totals;
								}
							}
						});
						if(this.totalCharges !== undefined) {
						if (this.totalCharges && this.totalCharges.length) {
							this.totalCharges.forEach((charge) => {
								switch (charge.label) {
									case "Low":
										{
											this.lowCost = charge.oopTotal;
											this.lowCalc = charge.narrative;
											break;
										}
									case "Average":
										{
											this.avgCost = charge.oopTotal;
											this.avgCalc = charge.narrative;
											break;
										}
									case "High":
										{
											this.highCost = charge.oopTotal;
											this.highCalc = charge.narrative;
											break;
										}
								}
							});
						}
					}else {
							this.lowCost = 0;
							this.lowCalc = "Your total out of pocket cost estimate: $0";
							this.avgCost = 0;
							this.avgCalc = "Your total out of pocket cost estimate: $0";
							this.highCost = 0;
							this.highCalc = "Your total out of pocket cost estimate: $0";
						}
						if(this.facilityCharges !== undefined) {
						if (this.facilityCharges.allowedAmt && this.facilityCharges.allowedAmt.length) {
							this.facilityCharges.allowedAmt.forEach((amt) => {
								switch (amt.label) {
									case "Low":
										{
											this.lowFacilityCharge = amt.serviceCost;
											this.coInsuranceFacility = amt.benefitValue;
											break;
										}
									case "Average":
										this.avgFacilityCharge = amt.serviceCost;
										break;
									case "High":
										this.highFacilityCharge = amt.serviceCost;
										break;
								}
							});
						}
					} else {
							this.lowFacilityCharge = "0";
							this.coInsuranceFacility = "0";
							this.avgFacilityCharge = "0";
							this.highFacilityCharge = "0";
						}
						if(this.professionalCharges !== undefined) {
							this.professionalCharges.allowedAmt.forEach((amt) => {
								switch (amt.label) {
									case "Low":
										{
											this.lowProfessionalCharge = amt.serviceCost;
											this.coInsuranceProfessional = amt.benefitValue;
											break;
										}
									case "Average":
										this.avgProfessionalCharge = amt.serviceCost;
										break;
									case "High":
										this.highProfessionalCharge = amt.serviceCost;
										break;
								}
							});
						} else {
								this.lowProfessionalCharge = "0";
								this.coInsuranceProfessional = "0";
								this.avgProfessionalCharge = "0";
								this.highProfessionalCharge = "0";
							}
						
						this.cost = this.avgCost;
						this.calculation = this.avgCalc;
						this.facilityCharge = this.avgFacilityCharge;
						this.professionalCharge = this.avgProfessionalCharge;
					}
				});
		});
	}

	onBackButtonTap(): void {
		this._routerExtensions.backToPreviousPage();
	}

	onShowHideTap() {
		this.counter++;
		if (this.counter % 2 === 0) {
			this.show = false;
			this.showHideBtn = true;
		} else {
			this.show = true;
			this.showHideBtn = false;
		}
	}

	onLowTap() {
		this.changedValuesOnTap(this.lowCost, this.lowCalc, this.lowFacilityCharge, this.lowProfessionalCharge);
		this.tapLine(true, false, false);
	}

	onAverageTap() {
		this.changedValuesOnTap(this.avgCost, this.avgCalc, this.avgFacilityCharge, this.avgProfessionalCharge);
		this.tapLine(false, true, false);
	}

	onHighTap() {
		this.changedValuesOnTap(this.highCost, this.highCalc, this.highFacilityCharge, this.highProfessionalCharge);
		this.tapLine(false, false, true);
	}

	tapLine(lowTap, avgTap, highTap) {
		this.lowTap = lowTap;
		this.avgTap = avgTap;
		this.highTap = highTap;
	}

	changedValuesOnTap(cost, calculation, facilityCharge, professionalCharge) {
		this.cost = cost;
		this.calculation = calculation;
		this.facilityCharge = facilityCharge;
		this.professionalCharge = professionalCharge;
	}
}
