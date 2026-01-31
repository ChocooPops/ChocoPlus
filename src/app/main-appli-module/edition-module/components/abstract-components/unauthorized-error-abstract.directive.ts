import { Directive, ViewChild } from "@angular/core";
import { PopupComponent } from "../popup/popup.component";
import { HttpErrorResponse } from "@angular/common/http";
import { MessageReturnedModel } from "../../../../common-module/models/message-returned.interface";

@Directive({})
export abstract class UnauthorizedError {

    @ViewChild(PopupComponent) popup !: PopupComponent;

    protected messageUnauthorizedAdd: string = "Vous n'êtes pas autorisé à ajouter des données.";
    protected messageUnauthorizedModify: string = "Vous n'êtes pas autorisé à modifier des données.";
    protected messageUnauthorizedDelete: string = "Vous n'êtes pas autorisé à supprimer des données.";
    protected messageSendEmail: string = "Voulez-vous envoyé vos ajouts à l'admin ?";

    displayLoader: boolean = false;

    protected displayPopupOnError(error: HttpErrorResponse, option: number): void {
        if (error.status === 401) {
            let messageRequest !: string;
            if (option === 1) {
                messageRequest = this.messageUnauthorizedAdd;
            } else if (option === 2) {
                messageRequest = this.messageUnauthorizedModify;
            } else {
                messageRequest = this.messageUnauthorizedDelete;
            }
            //messageRequest += " \n " + this.messageSendEmail;
            const message: MessageReturnedModel = {
                id: -1,
                state: false,
                message: messageRequest
            }
            this.popup.setMessage(message.message, message.state);
            this.popup.setEndTask(true);
        } else {
            const message: MessageReturnedModel = {
                id: -1,
                state: false,
                message: 'Error : ' + error.message
            }
            this.popup.setMessage(message.message, message.state);
            this.popup.setEndTask(true);
        }
    }

}