import { Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { GraphService } from '../../../service/graph/graph.service';
import { Subscription } from 'rxjs';
import { GraphModel } from '../../../dto/graph.interface';
import { GraphNode } from '../../../dto/graph-node.interface';
import { LegendModel } from '../../../dto/legend.interface';
import { NgClass } from '@angular/common';
import { GraphLink } from '../../../dto/graph-link.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OtherModeComponent } from '../other-mode/other-mode.component';
import { MediaIdTypeModel } from '../../../../media-module/models/media-id-type.interface';
import { MediaTypeModel } from '../../../../media-module/models/media-type.enum';
import { EditionParametersService } from '../../../../edition-module/services/edition-parameters/edition-parameters.service';
import { UserModel } from '../../../dto/user.model';
import { RoleModel } from '../../../../../common-module/models/role.enum';
import { UserService } from '../../../service/user/user.service';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, OtherModeComponent],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css'
})
export class GraphComponent {
  @ViewChild('svgGraph', { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  public user: UserModel | undefined = undefined;
  public RoleModel = RoleModel;

  public formGroup !: FormGroup;
  public formInputSearch: string = 'inputSearch';
  private width = window.innerWidth;
  private height = window.innerHeight;
  private subscription: Subscription = new Subscription();

  private simulation!: d3.Simulation<any, undefined>;
  private nodes: any[] = [];
  private links: any[] = [];
  private labels: any;
  private defaultColorStroke: string = '#fff';
  private colorStrokeWhenSearch: string = '#FF0000';

  public legends: LegendModel[] = [];
  public nodeClicked: GraphNode[] | undefined;
  public srcImageName: string = 'icon/name.svg';
  public srcImageGraph: string = 'icon/graph.svg';
  public srcImageSearch: string = 'icon/research.svg';
  public srcImageArrow: string = 'icon/arrow-2.svg';
  public srcVisible: string = 'icon/visible.svg';
  public srcNotVisible: string = 'icon/not-visible.svg';
  public srcEdition: string = 'icon/edition.svg';
  public labelsVisible: boolean = true;
  public isNewGraph: boolean = false;
  public diplayOtherMode: boolean = false;

  private dynamicLinksGroup!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private dynamicLinks!: d3.Selection<SVGLineElement | d3.BaseType, any, SVGGElement, unknown>;

  private currentTransform: d3.ZoomTransform = d3.zoomIdentity;

  private wheelAttached = false;

  constructor(private graphService: GraphService,
    private editionParametersService: EditionParametersService,
    private userService: UserService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.user = this.userService.getCurrentUserValue();
    this.formGroup = this.fb.group({
      inputSearch: ['', Validators.required]
    })
  }

  ngAfterViewInit(): void {
    this.subscription.add(
      this.graphService.getTypeGraph().subscribe((type: boolean) => {
        this.isNewGraph = type;
      })
    )
    this.subscription.add(
      this.graphService.getGraph().subscribe((graph: GraphModel | undefined) => {
        if (graph) {
          this.nodes = graph.nodes;
          this.links = graph.links;
          this.createGraph();
          this.verifNodeClicked();
          window.removeEventListener('resize', () => this.onResize());
          window.addEventListener('resize', () => this.onResize());
        } else {
          this.stopSimulation();
        }
      })
    )

    this.subscription.add(
      this.graphService.getLegends().subscribe((legends: LegendModel[]) => {
        this.legends = legends;
      })
    )
    this.graphService.generateGraphByModeActivate();
  }

  private createGraph(): void {
    const svgEl = this.svgRef.nativeElement;

    this.currentTransform = d3.zoomTransform(svgEl);

    if (this.simulation) {
      this.simulation.stop();
    }

    d3.select(svgEl).selectAll('*').remove();
    this.labels = null;
    this.dynamicLinks?.remove();
    this.dynamicLinksGroup?.remove();

    const svg = d3.select(svgEl)
      .attr('width', this.width)
      .attr('height', this.height);

    const container = svg.append('g'); // le groupe à zoomer/déplacer

    // Liens
    const link = container.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(this.links)
      .join('line')
      .attr('stroke-width', 1.2);

    this.dynamicLinksGroup = container.append('g')
      .attr('class', 'dynamic-links')
      .attr('stroke', '#FFD812')
      .attr('stroke-opacity', 0.8);

    // Nœuds
    const node = container.append('g')
      .selectAll('circle')
      .data(this.nodes)
      .join('circle')
      .attr('r', d => d.rayon)
      .attr('fill', d => d.color)
      .attr('stroke', this.defaultColorStroke)
      .attr('stroke-width', d => d.rayon / 4)
      .on('click', (event, d) => this.onNodeClick(d))
      .call(d3.drag<any, any>()
        .on('start', (event, d) => this.onDragStart(event, d))
        .on('drag', (event, d) => this.onDragged(event, d))
        .on('end', (event, d) => this.onDragEnd(event, d))
      );

    // Nom 
    this.labels = container.append('g')
      .selectAll('text')
      .data(this.nodes)
      .join('text')
      .text(d => d.name) // suppose que chaque nœud a une propriété `name`
      .attr('font-size', '12px')
      .attr('fill', '#333')
      .attr('text-anchor', 'middle')
      .attr('dy', d => -d.rayon - 4 + 'px'); // décale légèrement le texte au-dessus du cercle

    // ZOOM / PAN
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on('zoom', (event) => container.attr('transform', event.transform));

    svg.on('.zoom', null); // nettoie les anciens du même namespace
    svg.call(zoom).call(zoom.transform, this.currentTransform);

    // Empêche le scroll de la page sur molette
    if (!this.wheelAttached) {
      svgEl.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
      this.wheelAttached = true;
    }

    // Physique du graphe
    this.simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.links)
        .id((d: any) => d.id)
        .distance(600)
        .strength(0.15)
      )
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collide', d3.forceCollide().radius(15))
      .alphaDecay(0.02)
      .on('tick', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);

        node
          .attr('cx', (d: any) => d.x)
          .attr('cy', (d: any) => d.y);

        if (this.labels) {
          this.labels
            .attr('x', (d: any) => d.x)
            .attr('y', (d: any) => d.y);
        }
      });

    this.labels.style('display', this.labelsVisible ? 'block' : 'none');

  }

  private onDragStart(event: d3.D3DragEvent<any, any, any>, d: any) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  private onDragged(event: d3.D3DragEvent<any, any, any>, d: any) {
    d.fx = event.x;
    d.fy = event.y;
  }

  private onDragEnd(event: d3.D3DragEvent<any, any, any>, d: any) {
    if (!event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  private onNodeClick(nodeData: GraphNode): void {
    this.simulation?.on('tick.dynamicLinks', null as any); // <-- coupe le handler
    if (this.nodeClicked && this.nodeClicked[0] === nodeData) {
      this.nodeClicked = undefined;
      this.dynamicLinks?.remove();
    } else {
      this.nodeClicked = this.graphService.getGraphFromNodeClicked(nodeData.id, nodeData.mediaType);
      const newLinks: GraphLink[] | undefined = this.graphService.getSimilarTitlesLinks(nodeData.id, nodeData.mediaType);
      if (newLinks && newLinks.length > 1) {
        this.updateDynamicLinks(newLinks);
      } else {
        this.dynamicLinks?.remove();
      }
    }
    const svgEl = this.svgRef.nativeElement;
    d3.select(svgEl)
      .selectAll<SVGCircleElement, any>('circle')
      .attr('stroke', this.defaultColorStroke)
      .attr('r', d => d.rayon)
      .attr('stroke-width', d => d.rayon / 4)
  }

  private onResize(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    d3.select(this.svgRef.nativeElement)
      .attr('width', this.width)
      .attr('height', this.height);

    this.simulation.force('center', d3.forceCenter(this.width / 2, this.height / 2));
    this.simulation.alpha(1).restart();
  }

  toggleLabels(): void {
    this.labelsVisible = !this.labelsVisible;
    if (this.labels) {
      this.labels.style('display', this.labelsVisible ? 'block' : 'none');
    }
  }

  ngOnDestroy(): void {
    this.stopSimulation();
    this.subscription.unsubscribe();
  }

  private stopSimulation(): void {
    window.removeEventListener('resize', () => this.onResize());
    if (this.simulation) {
      this.simulation.stop();
    }
    const svgEl = this.svgRef.nativeElement;
    d3.select(svgEl).selectAll('*').remove();

    this.nodes = [];
    this.links = [];
    this.labels = null;
    this.dynamicLinks?.remove();
  }

  updateDynamicLinks(newLinks: GraphLink[]) {
    this.simulation?.on('tick.dynamicLinks', null as any);

    // Supprime les anciens liens dynamiques
    this.dynamicLinks?.remove();

    if (!this.isNewGraph) {
      // Crée les nouveaux liens
      this.dynamicLinks = this.dynamicLinksGroup
        .selectAll('line')
        .data(newLinks, (d: any) => d.id ?? `${d.source?.id}-${d.target?.id}`)
        .join('line')
        .attr('stroke-width', 2);

      // Mise à jour à chaque tick
      this.simulation.on('tick.dynamicLinks', () => {
        this.dynamicLinks?.attr('x1', (d: any) => d.source?.x ?? 0)
          .attr('y1', (d: any) => d.source?.y ?? 0)
          .attr('x2', (d: any) => d.target?.x ?? 0)
          .attr('y2', (d: any) => d.target?.y ?? 0);
      });

      // Relancer la simulation légèrement pour repositionner
      this.simulation.alpha(0.5).restart();
    }
  }

  createNewGraphAccordingToNodeClicked(): void {
    if (this.isNewGraph) {
      this.graphService.generateGraphByModeActivate();
    } else {
      if (this.nodeClicked) {
        this.graphService.isolatedGraph(this.nodeClicked);
      }
    }
  }

  onClickEdit(): void {
    if (this.nodeClicked) {
      const node: GraphNode = this.nodeClicked[0];
      if (node.mediaType === MediaTypeModel.MOVIE) {
        this.editionParametersService.navigateToModifyMovie(node.id);
      } else if (node.mediaType === MediaTypeModel.SERIES) {
        this.editionParametersService.navigateToModifySeries(node.id);
      } else if (node.color === this.graphService.getColorCategory()) {
        this.editionParametersService.navigateToModifyCategory(node.id);
      } else if (node.color === this.graphService.getColorSelection()) {
        this.editionParametersService.navigateToModifySelection(node.id);
      } else if (node.color === this.graphService.getColorLicense()) {
        this.editionParametersService.navigateToModifyLicense(node.id);
      }
    }
  }

  onSearchNode(): void {
    if (this.formGroup.valid) {
      const text: string = this.formGroup.get(this.formInputSearch)?.value;
      const nodeId: MediaIdTypeModel | undefined = this.graphService.searchClosestNodeByName(text, this.nodes);
      if (nodeId) {
        this.changePropertiesNodeById(nodeId);
      }
    }
  }

  private changePropertiesNodeById(nodeIdType: MediaIdTypeModel): void {
    const svgEl = this.svgRef.nativeElement;
    const node: GraphNode | undefined = this.nodes.find((item: GraphNode) => item.id === nodeIdType.id && item.mediaType === nodeIdType.mediaType);

    if (node) {
      this.onNodeClick(node);
      d3.select(svgEl)
        .selectAll<SVGCircleElement, any>('circle')
        .filter(d => d.id === nodeIdType.id && d.mediaType === nodeIdType.mediaType)
        .attr('stroke', this.colorStrokeWhenSearch)
        .attr('r', d => d.rayon * 4)
        .attr('stroke-width', d => d.rayon / 4 * 4)
    }

  }

  public toggleDisplayOtherMode(): void {
    this.diplayOtherMode = !this.diplayOtherMode;
  }

  public onClickVisibilityLegends(legend: LegendModel): void {
    this.graphService.changeVisibilityOfNodesAccordingToLegend(legend);
    this.verifNodeClicked();
  }

  private verifNodeClicked(): void {
    if (this.nodeClicked && this.nodeClicked.length > 0) {
      const node: GraphModel | undefined = this.nodes.find((node: GraphNode) => this.nodeClicked && node.id === this.nodeClicked[0].id);
      if (!node) {
        this.nodeClicked = undefined;
      }
    }
  }

}
