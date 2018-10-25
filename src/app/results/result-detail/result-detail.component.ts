import { Component, NgModuleRef, OnInit, ViewContainerRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Kinvey } from "kinvey-nativescript-sdk";
import { ModalDialogOptions, ModalDialogService } from "nativescript-angular/modal-dialog";
import { RouterExtensions } from "nativescript-angular/router";
import * as phoneModule from "nativescript-phone";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { Provider, ProviderLocation, ProviderResidency } from "../../shared/models/provider.model";
import { RapidHealthProviders } from "../../shared/models/rapidHealthProviders.model";
import { AppointmentService } from "../../shared/services/appointment.service";
import { ProviderService } from "../../shared/services/provider.service";
import { CalendarModalViewComponent } from "./calendar-modal";
@Component({
	selector: "ResultDetailComponent",
	moduleId: module.id,
	templateUrl: "./result-detail.component.html",
	styleUrls: ["../results-common.css"]
})
export class ResultDetailComponent implements OnInit {
	rapidProviderData: RapidHealthProviders;
	isLoading: boolean;
	modalIsShown: boolean;
	btnRemove: boolean;
	title: string;
	appointmentId: string;
	item: RapidHealthProviders;

	constructor(
		private _modalService: ModalDialogService,
		private _vcRef: ViewContainerRef,
		private _moduleRef: NgModuleRef < any > ,
		private _appointmentService: AppointmentService,
		private _providerService: ProviderService,
		private _activatedRoute: ActivatedRoute,
		private _routerExtensions: RouterExtensions
	) {}

	ngOnInit(): void {
		this.isLoading = true;
		this.title = "Result Details";
		this.item = new RapidHealthProviders({});
		this.btnRemove = false;
		this._activatedRoute.params.subscribe((params) => {

			this.item = JSON.parse(params.rapidProvider).provider as RapidHealthProviders;
			this.btnRemove = !!params.remove;

			if (this.item.prefix !== undefined && this.item.prefix !== "") {
				this.title = this.item.prefix + " " + this.item.first_name + " " + this.item.last_name;
			} else {
				this.title = this.item.first_name + " " + this.item.last_name;
			}
			this.isLoading = false;
		});
	}

	onBackButtonTap(): void {
		this._routerExtensions.backToPreviousPage();
	}

	formatResidencies(residencies: Array < ProviderResidency >): string {
		let formatted = "";
		residencies.forEach((residency) => {
			if (residency.institution_name) {
				formatted += residency.institution_name + (residency.type ? ` (${residency.type})` : "") + "\n\n";
			}
		});
		if (formatted.endsWith("\n\n")) {
			formatted = formatted.substring(0, formatted.length - 2);
		}

		return formatted;
	}

	formatLocations(locations: Array < ProviderLocation >): string {
		let formatted = "";
		locations.forEach((location) => {
			if (location.address_lines && location.address_lines.length) {
				formatted += location.address_lines.join("\n");
			}
			formatted += `${location.city} ${location.state} - ${location.zipcode}\n`;
			formatted += location.phone + "\n\n";
		});
		if (formatted.endsWith("\n\n")) {
			// tslint:disable-next-line:indent
			formatted = formatted.substring(0, formatted.length - 1);
		}

		return formatted;
	}

	formatEducation(education: any): string {
		return education ? (education.medical_school || "") + " " + (education.graduation_year || "") : "";
	}

	onPhoneTap(dataItem: Provider): void {
		phoneModule.dial(dataItem.phone, true);
	}

	goToSearch() {
		this._routerExtensions.navigate([""], {
			clearHistory: true,
			animated: true,
			transition: {
				name: "slide",
				duration: 200,
				curve: "ease"
			}
		});
	}

	onBookButtonTap(dataItem: Provider): void {
		if (this.modalIsShown) {

			return;
		}

		this.modalIsShown = true;

		this.createModаlView().then((result) => {
			if (result) {
				if (result.data) {
					// TODO: remove setTimeout - this works around an issue in navigation initiated from the callback of a modal dialog
					setTimeout(() => {
						this.goToSearch();
					}, 1);
				}
				if (result.error) {
					// handle modal dialog error if needed
				}
			}

			this.modalIsShown = false;
		}).catch((error) => {
			alert({
				title: "Oops something went wrong.",
				message: error && error.message,
				okButtonText: "Ok"
			});
		});
	}

	onCancelButtonTap(dataItem: Provider): void {
		if (this.appointmentId) {
			let data;
			this.isLoading = true;
			Kinvey.User.me().then((user) => {
				data = user && user.data as any;

				return this._appointmentService.getAppointmentById(this.appointmentId);
			}).then((appointment) => {
				this.isLoading = false;
				if (!appointment) {

					return;
				}

				const startDate = new Date(appointment.start_date);
				dialogs.confirm({
					title: `Dear ${(data && data.givenName) || "patient"}`,
					message: `You are canceling the appointment with ${this.title} on ${this._formatDateTime(startDate)}`,
					okButtonText: "Confirm",
					cancelButtonText: "Cancel"
				}).then((result) => {
					if (result) {
						this._appointmentService.delete(appointment).then((res) => {
							this.goToSearch();
						});
					}
				});
			}, (error) => {
				dialogs.alert({
					title: "Backend operation failed",
					message: error.message,
					okButtonText: "Ok"
				}).then(() => {
					this.goToSearch();
				});
				this.isLoading = false;
			});
		}
	}

	_formatDateTime(date: Date): string {
		const locale = "en-us";
		let hour = date.getHours();
		let minutes = date.getMinutes().toString();
		const pm = hour >= 12 ? "PM" : "AM";
		if (hour > 12) {
			hour -= 12;
		}
		if (minutes.length === 1) {
			minutes = "0" + minutes;
		}

		const formattedDate = `${date.toLocaleDateString(locale)} at ${hour}:${minutes}${pm}`;

		return formattedDate;
	}

	private createModаlView(): Promise < any > {
		const options: ModalDialogOptions = {
			viewContainerRef: this._vcRef,
			moduleRef: this._moduleRef,
			context: this.item,
			fullscreen: false
		};

		return this._modalService.showModal(CalendarModalViewComponent, options);
	}
}
