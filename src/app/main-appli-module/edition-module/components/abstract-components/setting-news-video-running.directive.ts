import { Directive } from "@angular/core";
import { UnauthorizedError } from "./unauthorized-error-abstract.directive";
import { EditNewsVideoRunningService } from "../../services/edit-news-video-running/edit-news-video-running.service";
import { NewsVideoRunningModel } from "../../../news-module/models/news-video-running.interface";
import { Subscription, take } from "rxjs";
import { MediaTypeModel } from "../../../media-module/models/media-type.enum";
import { MediaModel } from "../../../media-module/models/media.interface";
import { SimpleModel } from "../../../../common-module/models/simple-model";

@Directive({})
export abstract class SettingNewsVideoRunning extends UnauthorizedError {

    protected editNewsRunningVideo!: NewsVideoRunningModel[];
    protected subscription: Subscription = new Subscription();
    protected mediaType!: MediaTypeModel;

    constructor(protected editNewsVideoRunningService: EditNewsVideoRunningService) {
        super();
    }

    ngOnInit(): void {
        this.displayLoader = true;
        this.subscription.add(
            this.editNewsVideoRunningService.getNewsVideoRunning().subscribe((data: NewsVideoRunningModel[]) => {
                this.editNewsRunningVideo = data;
            })
        );
        if (this.mediaType === MediaTypeModel.MOVIE) {
            this.editNewsVideoRunningService.fetchAllNewsMovieRunning().pipe(take(1)).subscribe(() => {
                this.displayLoader = false;
            });
        } else if (this.mediaType === MediaTypeModel.SERIES) {
            this.editNewsVideoRunningService.fetchAllNewsSeriesRunning().pipe(take(1)).subscribe(() => {
                this.displayLoader = false;
            });
        }
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.editNewsVideoRunningService.resetEditNewsRunningVideo();
    }

    protected addMediaIntoNews(media: MediaModel): void {
        this.editNewsVideoRunningService.addMediaIntoNews(media);
    }

    protected deleteMediaIntoNews(id: number): void {
        this.editNewsVideoRunningService.deleteMediaIntoNews(id);
    }

    protected modifyStartShowById(info: SimpleModel): void {
        this.editNewsVideoRunningService.modifyStartShowById(info.id, info.name);
    }

    protected modifyEndShowById(info: SimpleModel): void {
        this.editNewsVideoRunningService.modifyEndShowById(info.id, info.name);
    }

    protected modifySrcBackground(info: SimpleModel): void {
        this.editNewsVideoRunningService.modifySrcBackground(info.id, info.name)
    }

    protected modifyJellyfinId(info: SimpleModel): void {
        this.editNewsVideoRunningService.modifyJellyfinId(info.id, info.name);
    }

} 