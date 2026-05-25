import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphModel } from '../../dto/graph.interface';
import { environment } from '../../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GraphNode } from '../../dto/graph-node.interface';
import { GraphLink } from '../../dto/graph-link.interface';
import { LegendModel } from '../../dto/legend.interface';
import { SimpleModel } from '../../../../common-module/models/simple-model';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';
import { MediaIdTypeModel } from '../../../media-module/models/media-id-type.interface';

@Injectable({
  providedIn: 'root',
})
export class GraphService {

  private readonly apiUrlLibrary: string = `${environment.apiUrlLibrary}`;
  private readonly urlMediaMissingFiles: string = 'media-missing-files';
  private readonly urlOrphanMediaLibrary: string = 'orphan-media-library';
  private readonly urlDuplicateTmdb: string = 'duplicate-tmdb';

  private readonly apiUrlMedia: string = `${environment.apiUrlMedia}`;
  private readonly urlNullPoster: string = 'null-poster';

  private readonly apiUrlMovie: string = `${environment.apiUrlMovie}`;
  private readonly urlNodesMovie: string = 'nodes';

  private readonly apiUrlSeries: string = `${environment.apiUrlSeries}`;
  private readonly urlNodesSeries: string = 'nodes';

  private readonly apiUrlSimilarMovie: string = `${environment.apiUrlSimilarTitle}`;
  private readonly urlLinksSimilarTitle: string = 'links';
  private readonly urlLessSimilarTitles: string = 'movie-with-less-similar-titles';

  private readonly apiUrlCategory: string = `${environment.apiUrlCategory}`;
  private readonly urlNodesLinksCategory: string = 'graph';

  private readonly apiUrlSelections: string = `${environment.apiUrlSelection}`;
  private readonly urlSelectionGraph: string = 'graph';
  private readonly apiUrlLicense: string = `${environment.apirUrlLicense}`;
  private readonly urlLicenseGraph: string = 'graph';

  private readonly colorBlackMovie: string = '#000000';
  private readonly colorWhiteSeries: string = '#D9D9D9';
  private readonly colorGreenEpisode: string = '#6ee7b7';
  private readonly colorPurpleSeason: string = '#a78bfa';
  private readonly colorYellowCategory: string = '#ffd301';
  private readonly colorBlueSelection: string = `#7eb8f7`;
  private readonly colorGreenLicense: string = `#34D183`;

  private graphSubject: BehaviorSubject<GraphModel | undefined> = new BehaviorSubject<GraphModel | undefined>(undefined);
  private graph$: Observable<GraphModel | undefined> = this.graphSubject.asObservable();

  private legendsSubject: BehaviorSubject<LegendModel[]> = new BehaviorSubject<LegendModel[]>([]);
  private legends$: Observable<LegendModel[]> = this.legendsSubject.asObservable();

  private typeGraphSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private typeGraph$: Observable<boolean> = this.typeGraphSubject.asObservable();

  private linksBetweenSimilarTitle: GraphLink[] = [];
  private graphWithMovieAndCategory: GraphModel | undefined = undefined;
  private graphMovieWithNullPoster: GraphModel | undefined = undefined;
  private graphLessSimilarTitlesMovies: GraphModel | undefined = undefined;
  private graphMediaMissingFiles: GraphModel | undefined = undefined;
  private graphOrphanMediaLibraries: GraphModel | undefined = undefined;
  private graphDuplicateTmdb: GraphModel | undefined = undefined;

  private oldSaveGraphe: GraphModel = this.initOldSaveGraph();

  private modeGraph: SimpleModel[] = [
    {
      id: 0,
      name: 'USER.GRAPH.ALL_DATA',
      state: false,
      value: () => this.generateGraphWithAllMoviesWithAllCategoryWithAllSimilarMovie(),
      reset: () => {
        this.graphWithMovieAndCategory = undefined
      }
    },
    {
      id: 1,
      name: 'USER.GRAPH.MEDIA_WITHOUT_POSTER',
      state: false,
      value: () => this.generateGraphMovieWithNullPoster(),
      reset: () => {
        this.graphMovieWithNullPoster = undefined
      }
    },
    {
      id: 2,
      name: 'USER.GRAPH.NOT_YET_SIMILAR_TITLE',
      state: false,
      value: () => this.generateGraphLessSimilarTitlesMovies(),
      reset: () => {
        this.graphLessSimilarTitlesMovies = undefined
      }
    },
    {
      id: 3,
      name: 'USER.GRAPH.MEDIA_MISSING_FILES',
      state: false,
      value: () => this.generateGraphMediaWithMissingFiles(),
      reset: () => {
        this.graphMediaMissingFiles = undefined
      }
    },
    {
      id: 4,
      name: "USER.GRAPH.ORPHAN_MEDIA_LIBRARIES",
      state: false,
      value: () => this.generateGraphOrphanMediaLibraries(),
      reset: () => {
        this.graphOrphanMediaLibraries = undefined
      }
    },
    {
      id: 5,
      name: "USER.GRAPH.DUPLICATE_TMDB",
      state: false,
      value: () => this.generateGraphDuplicateTmdb(),
      reset: () => {
        this.graphDuplicateTmdb = undefined
      }
    }
  ]

  constructor(private http: HttpClient) { }

  private initOldSaveGraph(): GraphModel {
    return {
      nodes: [],
      links: []
    }
  }

  public getColorCategory(): string {
    return this.colorYellowCategory;
  }

  public getColorSelection(): string {
    return this.colorBlueSelection;
  }

  public getColorLicense(): string {
    return this.colorGreenLicense;
  }

  public getGraph(): Observable<GraphModel | undefined> {
    return this.graph$;
  }

  public getLegends(): Observable<LegendModel[]> {
    return this.legends$;
  }

  public getModeGraph(): SimpleModel[] {
    return this.modeGraph;
  }

  public getTypeGraph(): Observable<boolean> {
    return this.typeGraph$;
  }

  private updateGraphSubject(graph: GraphModel) {
    this.graphSubject.next(structuredClone(graph));
    this.oldSaveGraphe = this.initOldSaveGraph();
  }

  private async generateGraphWithAllMoviesWithAllCategoryWithAllSimilarMovie(): Promise<void> {
    if (!this.graphWithMovieAndCategory) {
      const nodes: GraphNode[] = [];
      const links: GraphLink[] = [];
      this.linksBetweenSimilarTitle = [];

      //FILL MOVIE;
      const urlGetNodeMovie: string = `${this.apiUrlMovie}/${this.urlNodesMovie}`;
      let data: any = await firstValueFrom(this.http.get(urlGetNodeMovie)) || null;
      if (data) {
        data.forEach((item: any) => {
          nodes.push({
            id: item.id,
            name: item.name,
            color: this.colorBlackMovie,
            rayon: 6,
            mediaType: MediaTypeModel.MOVIE
          })
        });
      }

      //FILL SERIES
      const urlGetNodeSeries: string = `${this.apiUrlSeries}/${this.urlNodesSeries}`;
      data = await firstValueFrom(this.http.get(urlGetNodeSeries)) || null;
      if (data) {
        data.forEach((item: any) => {
          nodes.push({
            id: item.id,
            name: item.name,
            color: this.colorWhiteSeries,
            rayon: 6,
            mediaType: MediaTypeModel.SERIES
          })
        });
      }

      //FILL LINKS AND NODES CATEGORY
      const urlGetNodeLinksCategory: string = `${this.apiUrlCategory}/${this.urlNodesLinksCategory}`;
      data = await firstValueFrom(this.http.get(urlGetNodeLinksCategory)) || null;
      if (data) {
        data.nodes.forEach((item: any) => {
          const node: GraphNode = {
            id: item.id,
            name: item.name,
            color: this.colorYellowCategory,
            rayon: 15,
            mediaType: MediaTypeModel.CATEGORY
          }
          nodes.push(node);
        });
        data.links.forEach((item: any) => {
          const source: GraphNode | undefined = nodes.find((node: GraphNode) => node.id === item.source && node.mediaType === MediaTypeModel.CATEGORY);
          const target: GraphNode | undefined = nodes.find((node: GraphNode) => node.id === item.target && (node.mediaType === MediaTypeModel.MOVIE || node.mediaType === MediaTypeModel.SERIES));
          if (source && target) {
            links.push({
              source: source,
              target: target
            })
          }
        });
      }

      //FILL LINKS BETWEEN MOVIES;
      const urlGetLinkSimilar: string = `${this.apiUrlSimilarMovie}/${this.urlLinksSimilarTitle}`;
      data = await firstValueFrom(this.http.get(urlGetLinkSimilar)) || null;
      if (data) {
        data.forEach((item: any) => {
          const source: GraphNode | undefined = nodes.find((node: GraphNode) => node.id === item.source);
          const target: GraphNode | undefined = nodes.find((node: GraphNode) => node.id === item.target);
          if (source && target) {
            this.linksBetweenSimilarTitle.push({
              source: source,
              target: target
            })
          }
        });
      }

      //FILL NODE AND LINKS FROM ALL SELECTIONS
      const urlGetNodesLinksSelections: string = `${this.apiUrlSelections}/${this.urlSelectionGraph}`;
      data = await firstValueFrom(this.http.get(urlGetNodesLinksSelections)) || null;
      if (data) {
        data.nodes.forEach((item: any) => {
          nodes.push({
            id: item.id,
            name: item.name,
            color: this.colorBlueSelection,
            rayon: 15,
            mediaType: MediaTypeModel.SELECTION
          })
        });
        data.links.forEach((item: any) => {
          const source: GraphNode | undefined = nodes.find((node: GraphNode) => node.id === item.source && node.mediaType === MediaTypeModel.SELECTION);
          const target: GraphNode | undefined = nodes.find((node: GraphNode) => node.id === item.target && (node.mediaType === MediaTypeModel.MOVIE || node.mediaType === MediaTypeModel.SERIES));
          if (source && target) {
            links.push({
              source: source,
              target: target
            })
          }
        })
      }

      //FILL NODES AND LINKS FROM LICENSE
      const urlGetNodesLinksLicense: string = `${this.apiUrlLicense}/${this.urlLicenseGraph}`;
      data = await firstValueFrom(this.http.get(urlGetNodesLinksLicense)) || null;
      if (data) {
        data.nodes.forEach((item: any) => {
          nodes.push({
            id: item.id,
            name: item.name,
            color: this.colorGreenLicense,
            rayon: 20,
            mediaType: MediaTypeModel.LICENSE
          });
        });
        data.links.forEach((item: any) => {
          const source: GraphNode | undefined = nodes.find((node: GraphNode) => node.id === item.source && node.mediaType === MediaTypeModel.LICENSE);
          let target: GraphNode | undefined = undefined;
          if (item.targetType === MediaTypeModel.MEDIA) {
            target = nodes.find((node: GraphNode) => node.id === item.target && (node.mediaType === MediaTypeModel.MOVIE || node.mediaType === MediaTypeModel.SERIES));
          } else {
            target = nodes.find((node: GraphNode) => node.id === item.target && node.mediaType === item.targetType);
          }
          if (source && target) {
            links.push({
              source: source,
              target: target
            });
          }
        });
      }

      const graph: GraphModel = {
        nodes: nodes,
        links: links
      }

      this.graphWithMovieAndCategory = graph;
    }
    const legends: LegendModel[] = [
      {
        name: "CATEGORY",
        color: this.colorYellowCategory,
        effective: this.graphWithMovieAndCategory.nodes.filter((item: GraphNode) => item.color === this.colorYellowCategory).length,
        isVisible: true
      },
      {
        name: "MOVIE",
        color: this.colorBlackMovie,
        effective: this.graphWithMovieAndCategory.nodes.filter((item: GraphNode) => item.color === this.colorBlackMovie).length,
        isVisible: true
      },
      {
        name: "SERIES",
        color: this.colorWhiteSeries,
        effective: this.graphWithMovieAndCategory.nodes.filter((item: GraphNode) => item.color === this.colorWhiteSeries).length,
        isVisible: true
      },
      {
        name: "SELECTIONS",
        color: this.colorBlueSelection,
        effective: this.graphWithMovieAndCategory.nodes.filter((item: GraphNode) => item.color === this.colorBlueSelection).length,
        isVisible: true
      },
      {
        name: "LICENSE",
        color: this.colorGreenLicense,
        effective: this.graphWithMovieAndCategory.nodes.filter((item: GraphNode) => item.color === this.colorGreenLicense).length,
        isVisible: true
      }
    ];
    this.legendsSubject.next(legends);
    this.updateGraphSubject(this.graphWithMovieAndCategory);
  }

  private createNewGraph(nodes: any[], links: any[], color: string, rayon: number, mediaType: MediaTypeModel): GraphModel {
    const newNodes: GraphNode[] = [];
    const newLinks: GraphLink[] = [];
    nodes.forEach((node: any) => {
      newNodes.push({
        id: node.id,
        name: node.name,
        color: color,
        rayon: rayon,
        mediaType: mediaType
      })
    })

    links.forEach((link: any) => {
      const source: GraphNode | undefined = nodes.find((item: GraphNode) => item.id === link.source);
      const target: GraphNode | undefined = nodes.find((item: GraphNode) => item.id === link.target);
      if (source && target) {
        newLinks.push({
          source: source,
          target: target
        })
      }
    })
    return {
      nodes: newNodes,
      links: links
    }
  }

  private createNewLegend(name: string, color: string, effective: number): LegendModel {
    return {
      name: name,
      color: color,
      effective: effective,
      isVisible: true
    }
  }

  private async generateGraphMovieWithNullPoster(): Promise<void> {
    if (!this.graphMovieWithNullPoster) {
      const urlMedia: string = `${this.apiUrlMedia}/${this.urlNullPoster}`;
      const data: any = await firstValueFrom(this.http.get(urlMedia)) as any[];

      const movies: GraphModel = this.createNewGraph(data.movies, [], this.colorBlackMovie, 6, MediaTypeModel.MOVIE);
      const series: GraphModel = this.createNewGraph(data.series, [], this.colorWhiteSeries, 6, MediaTypeModel.SERIES);

      this.graphMovieWithNullPoster = {
        links: [...movies.links, ...series.links],
        nodes: [...movies.nodes, ...series.nodes]
      }
    }
    this.legendsSubject.next([
      this.createNewLegend('MOVIE', this.colorBlackMovie, this.graphMovieWithNullPoster.nodes.filter((item) => item.color === this.colorBlackMovie).length),
      this.createNewLegend('SERIES', this.colorWhiteSeries, this.graphMovieWithNullPoster.nodes.filter((item) => item.color === this.colorWhiteSeries).length),
    ]);
    this.updateGraphSubject(this.graphMovieWithNullPoster);
  }

  private async generateGraphLessSimilarTitlesMovies(): Promise<void> {
    if (!this.graphLessSimilarTitlesMovies) {
      const url: string = `${this.apiUrlSimilarMovie}/${this.urlLessSimilarTitles}`;
      const data: any = await firstValueFrom(this.http.get(url)) as any[];

      const movies = this.createNewGraph(data.movies, [], this.colorBlackMovie, 6, MediaTypeModel.MOVIE);
      const series = this.createNewGraph(data.series, [], this.colorWhiteSeries, 6, MediaTypeModel.SERIES);

      this.graphLessSimilarTitlesMovies = {
        links: [...movies.links, ...series.links],
        nodes: [...movies.nodes, ...series.nodes]
      }
    }
    this.legendsSubject.next([
      this.createNewLegend('MOVIE', this.colorBlackMovie, this.graphLessSimilarTitlesMovies.nodes.filter((item) => item.color === this.colorBlackMovie).length),
      this.createNewLegend('SERIES', this.colorWhiteSeries, this.graphLessSimilarTitlesMovies.nodes.filter((item) => item.color === this.colorWhiteSeries).length),
    ]);
    this.updateGraphSubject(this.graphLessSimilarTitlesMovies);
  }

  private async generateGraphMediaWithMissingFiles(): Promise<void> {
    if (!this.graphMediaMissingFiles) {
      const url: string = `${this.apiUrlLibrary}/${this.urlMediaMissingFiles}`;
      const data: any = await firstValueFrom(this.http.get(url)) as any[];

      const movies = this.createNewGraph(data.movies, [], this.colorBlackMovie, 6, MediaTypeModel.MOVIE);
      const episodes = this.createNewGraph(data.episodes, [], this.colorGreenEpisode, 6, MediaTypeModel.EPISODE);

      this.graphMediaMissingFiles = {
        links: [],
        nodes: [...movies.nodes, ...episodes.nodes]
      }
    }
    this.legendsSubject.next([
      this.createNewLegend('MOVIE', this.colorBlackMovie, this.graphMediaMissingFiles.nodes.filter((item) => item.color === this.colorBlackMovie).length),
      this.createNewLegend('EPISODES', this.colorGreenEpisode, this.graphMediaMissingFiles.nodes.filter((item) => item.color === this.colorGreenEpisode).length),
    ]);
    this.updateGraphSubject(this.graphMediaMissingFiles);
  }

  private async generateGraphOrphanMediaLibraries(): Promise<void> {
    if (!this.graphOrphanMediaLibraries) {
      const url: string = `${this.apiUrlLibrary}/${this.urlOrphanMediaLibrary}`;
      const data: any = await firstValueFrom(this.http.get(url)) as any[];

      const movies = this.createNewGraph(data.movies, [], this.colorBlackMovie, 6, MediaTypeModel.MOVIE);
      const series = this.createNewGraph(data.series, [], this.colorWhiteSeries, 6, MediaTypeModel.SERIES);
      const seasons = this.createNewGraph(data.seasons, [], this.colorPurpleSeason, 6, MediaTypeModel.SEASON);
      const episodes = this.createNewGraph(data.episodes, [], this.colorGreenEpisode, 6, MediaTypeModel.EPISODE);

      this.graphOrphanMediaLibraries = {
        links: [],
        nodes: [...movies.nodes, ...series.nodes, ...seasons.nodes, ...episodes.nodes]
      }
    }
    this.legendsSubject.next([
      this.createNewLegend('MOVIE', this.colorBlackMovie, this.graphOrphanMediaLibraries.nodes.filter((item) => item.color === this.colorBlackMovie).length),
      this.createNewLegend('SERIES', this.colorWhiteSeries, this.graphOrphanMediaLibraries.nodes.filter((item) => item.color === this.colorWhiteSeries).length),
      this.createNewLegend('SEASONS', this.colorPurpleSeason, this.graphOrphanMediaLibraries.nodes.filter((item) => item.color === this.colorPurpleSeason).length),
      this.createNewLegend('EPISODES', this.colorGreenEpisode, this.graphOrphanMediaLibraries.nodes.filter((item) => item.color === this.colorGreenEpisode).length)
    ]);
    this.updateGraphSubject(this.graphOrphanMediaLibraries);
  }

  private async generateGraphDuplicateTmdb(): Promise<void> {
    if (!this.graphDuplicateTmdb) {
      const url: string = `${this.apiUrlLibrary}/${this.urlDuplicateTmdb}`;
      const data: any = await firstValueFrom(this.http.get(url)) as any[];

      const movies = this.createNewGraph(data.nodes.movies, data.links.movies, this.colorBlackMovie, 6, MediaTypeModel.MOVIE);
      const series = this.createNewGraph(data.nodes.series, data.links.series, this.colorWhiteSeries, 6, MediaTypeModel.SERIES);

      this.graphDuplicateTmdb = {
        links: [...movies.links, ...series.links],
        nodes: [...movies.nodes, ...series.nodes]
      }
    }

    let countMovie: number = 0;
    let countSeries: number = 0;

    if (this.graphDuplicateTmdb.nodes.filter((item) => item.color === this.colorBlackMovie).length - 1 > 0) {
      countMovie = this.graphDuplicateTmdb.nodes.filter((item) => item.color === this.colorBlackMovie).length - 1;
    }

    if (this.graphDuplicateTmdb.nodes.filter((item) => item.color === this.colorWhiteSeries).length - 1 > 0) {
      countSeries = this.graphDuplicateTmdb.nodes.filter((item) => item.color === this.colorWhiteSeries).length - 1;
    }

    this.legendsSubject.next([
      this.createNewLegend('MOVIE', this.colorBlackMovie, countMovie),
      this.createNewLegend('SERIES', this.colorWhiteSeries, countSeries),
    ]);
    this.updateGraphSubject(this.graphDuplicateTmdb);
  }

  public getGraphFromNodeClicked(id: number, mediaType: MediaTypeModel): GraphNode[] | undefined {
    const node: GraphNode | undefined = this.graphSubject.value?.nodes.find((item: GraphNode) => item.id === id && item.mediaType === mediaType);
    if (node) {
      const nodes: GraphNode[] = [];
      nodes.push(node);
      const linksFound: GraphLink[] = this.graphSubject.value?.links.filter((item: GraphLink) => item.source === node || item.target === node) || [];
      const linksSimilarTitle: GraphLink[] = this.linksBetweenSimilarTitle.filter((item: GraphLink) => (item.source.id === node.id && item.source.mediaType === mediaType) || (item.target.id === node.id && item.target.mediaType === mediaType)) || [];
      linksFound.forEach((link: GraphLink) => {
        if (node.id === link.source.id) {
          nodes.push(link.target);
        } else {
          nodes.push(link.source);
        }
      });
      linksSimilarTitle.forEach((link: GraphLink) => {
        if (node.id === link.source.id) {
          nodes.push(link.target);
        } else {
          nodes.push(link.source);
        }
      });
      return nodes;
    } else {
      return undefined;
    }
  }

  getSimilarTitlesLinks(id: number, type: MediaTypeModel): GraphLink[] | undefined {
    const node: GraphNode | undefined = this.graphSubject.value?.nodes.find((item: GraphNode) => item.id === id && item.mediaType === type);
    const links: GraphLink[] = [];
    if (node) {
      const nodes: GraphNode[] = this.graphSubject.value?.nodes || [];
      const linksSimilarTitle: GraphLink[] = this.linksBetweenSimilarTitle.filter((item: GraphLink) => (item.source.id === node.id && item.source.mediaType === type) || (item.target.id === node.id && item.target.mediaType === type)) || [];
      linksSimilarTitle.forEach((item: GraphLink) => {
        if (item.source.id !== node.id) {
          const nodeFound: GraphNode | undefined = nodes.find((nodeTmp: GraphNode) => nodeTmp.id === item.source.id)
          if (nodeFound) {
            links.push({
              source: node,
              target: nodeFound
            })
          }
        } else {
          const nodeFound: GraphNode | undefined = nodes.find((nodeTmp: GraphNode) => nodeTmp.id === item.target.id)
          if (nodeFound) {
            links.push({
              source: node,
              target: nodeFound
            })
          }
        }
      })
      return links;
    } else {
      return undefined;
    }
  }

  isolatedGraph(nodes: GraphNode[]): void {
    if (nodes.length > 0) {
      const mainNode: GraphNode = nodes[0];
      const newLinks: GraphLink[] = [];
      for (let i = 1; i < nodes.length; i++) {
        newLinks.push({
          source: mainNode,
          target: nodes[i]
        })
      }
      const newGraph: GraphModel = {
        nodes: nodes,
        links: newLinks
      }
      this.graphSubject.next(newGraph);
      this.typeGraphSubject.next(true);
    }
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    const lenA = a.length;
    const lenB = b.length;

    for (let i = 0; i <= lenA; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= lenB; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= lenA; i++) {
      for (let j = 1; j <= lenB; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;

        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[lenA][lenB];
  }

  public searchClosestNodeByName(inputName: string, nodes: GraphNode[]): MediaIdTypeModel | undefined {
    if (!inputName || !nodes.length) return undefined;
    const target = inputName.toLowerCase();
    let closestNode: GraphNode | undefined = undefined;
    let minDistance = Infinity;
    for (const node of nodes) {
      const nodeName = node.name.toLowerCase() ?? '';
      const distance = this.levenshteinDistance(target, nodeName);
      if (distance < minDistance) {
        minDistance = distance;
        closestNode = node;
      }
    }
    if (closestNode) {
      return {
        id: closestNode.id,
        mediaType: closestNode.mediaType
      }
    } else {
      return undefined;
    }
  }

  private toggleDisplayedModeGraph(mode: SimpleModel): void {
    this.modeGraph.forEach((item: SimpleModel) => {
      if (item === mode) {
        item.state = true;
      } else {
        item.state = false;
      }
    })
  }

  public generateGraphByModeActivate(): void {
    const mode: SimpleModel | undefined = this.modeGraph.find((item: SimpleModel) => item.state === true);
    if (mode) {
      mode.value();
    } else {
      this.modeGraph[0].value();
      this.toggleDisplayedModeGraph(this.modeGraph[0]);
    }
    this.typeGraphSubject.next(false);
  }

  public loadNewGraph(id: number): void {
    const mode: SimpleModel | undefined = this.modeGraph.find((item: SimpleModel) => item.id === id);
    if (mode) {
      this.toggleDisplayedModeGraph(mode);
      if (mode.value) {
        mode.value();
      }
    }
  }

  public changeVisibilityOfNodesAccordingToLegend(legend: LegendModel): void {
    if (!this.typeGraphSubject.value) {
      if (legend.isVisible) {
        this.removeNodesAccordingToLegend(legend)
      } else {
        this.addNodesAccoordingToLegend(legend);
      }
    }
  }

  private removeNodesAccordingToLegend(legend: LegendModel): void {
    const graph: GraphModel | undefined = this.graphSubject.value;
    if (graph) {
      const nodes: GraphNode[] = graph.nodes.filter((node: GraphNode) => node.color === legend.color);
      const links: GraphLink[] = graph.links.filter((link: GraphLink) => nodes.some((node: GraphNode) => link.source === node || link.target === node));
      graph.nodes = graph.nodes.filter((node: GraphNode) => !nodes.some((nodeTmp: GraphNode) => nodeTmp === node));
      graph.links = graph.links.filter((link: GraphLink) => !links.some((linkTmp: GraphLink) => linkTmp === link));
      this.oldSaveGraphe.nodes.push(...nodes);
      this.oldSaveGraphe.links.push(...links);
      this.graphSubject.next(graph);
      this.changeVisibilityLegendByColor(legend, false);
    }
  }

  private addNodesAccoordingToLegend(legend: LegendModel): void {
    const graph: GraphModel | undefined = this.graphSubject.value;
    if (graph) {
      const nodes: GraphNode[] = this.oldSaveGraphe.nodes.filter((node: GraphNode) => node.color === legend.color);
      graph.nodes.push(...nodes);
      const links: GraphLink[] = this.oldSaveGraphe.links.filter((link: GraphLink) => graph.nodes.includes(link.source) && graph.nodes.includes(link.target) && nodes.some((node: GraphNode) => link.source === node || link.target === node));
      graph.links.push(...links);
      this.oldSaveGraphe.nodes = this.oldSaveGraphe.nodes.filter((node: GraphNode) => !nodes.some((nodeTmp: GraphNode) => nodeTmp === node));
      this.oldSaveGraphe.links = this.oldSaveGraphe.links.filter((link: GraphLink) => !links.some((linkTmp: GraphLink) => linkTmp === link));
      this.graphSubject.next(graph);
      this.changeVisibilityLegendByColor(legend, true);
    }
  }

  private changeVisibilityLegendByColor(legend: LegendModel, value: boolean): void {
    const legends: LegendModel[] = this.legendsSubject.value;
    const index: number = legends.findIndex((item: LegendModel) => item.color === legend.color);
    if (index >= 0) {
      legends[index].isVisible = value;
      this.legendsSubject.next(legends);
    }
  }

  resetGraphByName(name: string): void {
    const graph: SimpleModel | undefined = this.modeGraph.find((item) => item.name === name);
    if (graph) {
      graph.reset();
      graph.value();
    }
  }

}