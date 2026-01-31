import { Directive } from "@angular/core"
import { FormBuilder, FormGroup } from "@angular/forms"
import { Router } from "@angular/router"
import { AuthService } from "../services/auth/auth.service"
import { TypeButtonModel } from "../models/type-button.model";
import { UserService } from "../../main-appli-module/user-module/service/user/user.service";
import { ImagePreloaderService } from "../../common-module/services/image-preloader/image-preloader.service";

@Directive({})
export abstract class FormPageDirectiveAbstract {

    protected formGroup !: FormGroup;
    protected nameButtonLogin: string = "S'identifier";
    protected nameButtonRegister: string = "Créer un compte";
    protected nameButtonOffLine: string = "Mode hors ligne";
    protected TypeButtonModel = TypeButtonModel;
    protected message: string = '';

    protected showLoaderTimeout: any;
    protected isLoading: boolean = false;

    constructor(protected fb: FormBuilder,
        protected router: Router,
        protected authService: AuthService,
        protected userService: UserService,
        protected imagePreloaderService: ImagePreloaderService
    ) { }

    abstract ngOnInit(): void;
    abstract onSubmit(): void;

    protected startTimer(): void {
        this.showLoaderTimeout = setTimeout(() => {
            this.isLoading = true;
        }, 500);
    }

    protected stopTimer(): void {
        if (this.showLoaderTimeout) {
            clearTimeout(this.showLoaderTimeout);
            this.showLoaderTimeout = null;
        }
        this.isLoading = false;
    }
}
