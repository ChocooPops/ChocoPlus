import { Component, ElementRef, ViewChild, Input } from '@angular/core';
import * as d3 from 'd3';
import { UserHistoricService } from '../../../service/user-historic/user-historic.service';
import { CategoryStats } from '../../../dto/user-historic/category-stats.interface';
import { UserCategoryPreferences } from '../../../dto/user-historic/user-category-preferences.interface';
import { CategoryByTime } from '../../../dto/user-historic/category-by-time';
import { CalculationMode } from '../../../dto/user-historic/calculate-mode.type';
import { ModeOption } from '../../../dto/user-historic/mode-option.interface';

@Component({
  standalone: true,
  selector: 'app-category-pie-chart',
  templateUrl: './category-pie-chart.component.html',
  styleUrls: ['./category-pie-chart.component.scss'],
  imports: []
})
export class CategoryPieChartComponent {

  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;
  @Input() userId!: number;
  @Input() limit: number = 10;

  private svg: any;
  private margin = { top: 10, right: 10, bottom: 10, left: 10 };
  private radius: number = 0;
  
  private customColors = [
    '#FFD81F', '#FFC107', '#FF9800', '#FF5722', '#E91E63',
    '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4'
  ];
  private colors = d3.scaleOrdinal(this.customColors);

  selectedMode: CalculationMode = 'simple';
  
  modeOptions: ModeOption[] = [
    {
      value: 'simple',
      label: 'Simple',
      description: 'Comptage basique des contenus par catégorie',
      icon: '📊'
    },
    {
      value: 'weighted',
      label: 'Pondéré',
      description: 'Prend en compte la progression de visionnage',
      icon: '⚖️'
    },
    {
      value: 'by-time',
      label: 'Par Temps',
      description: 'Basé sur le temps réel de visionnage',
      icon: '⏱️'
    }
  ];

  categoryData: UserCategoryPreferences | null = null;
  categoryDataByTime: CategoryByTime[] | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(private userHistoricService: UserHistoricService) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadData();
    }, 0);
  }

  onModeChange(mode: CalculationMode): void {
    this.selectedMode = mode;
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    this.categoryData = null;
    this.categoryDataByTime = null;

    this.userHistoricService
      .getPreferredCategoriesByMode(this.userId, this.selectedMode, this.limit)
      .subscribe({
        next: (data: any) => {
          
          if (this.selectedMode === 'by-time') {
            this.categoryDataByTime = data as CategoryByTime[];
            this.categoryData = this.convertTimeDataToStandard(data as CategoryByTime[]);
          } else {
            this.categoryData = data as UserCategoryPreferences;
          }
          
          this.loading = false;
                    
          if (this.categoryData && this.categoryData.categories.length > 0) {
            if (this.chartContainer && this.chartContainer.nativeElement) {
              setTimeout(() => {
                this.createChart();
              }, 100);
            } else {
              //console.error('Chart container not found!');
            }
          }
        },
        error: (err: any) => {
          this.error = 'Erreur lors du chargement des données';
          this.loading = false;
        }
      });
  }

  private convertTimeDataToStandard(timeData: CategoryByTime[]): UserCategoryPreferences {
    return {
      userId: this.userId,
      totalWatched: timeData.reduce((sum, cat) => sum + cat.count, 0),
      categories: timeData.map(cat => ({
        categoryId: cat.categoryId,
        categoryName: cat.categoryName,
        count: cat.count,
        percentage: cat.percentage
      }))
    };
  }

  private createChart(): void {
    if (!this.categoryData || this.categoryData.categories.length === 0) {
      return;
    }

    if (!this.chartContainer || !this.chartContainer.nativeElement) {
      return;
    }

    d3.select(this.chartContainer.nativeElement).selectAll('*').remove();

    const containerWidth = this.chartContainer.nativeElement.clientWidth;
    const width = containerWidth - 30;
    const chartHeight = Math.min(width, 350);

    this.radius = Math.min(width, chartHeight) / 2.8;

    const minItemWidth = 140;
    let itemsPerRow = Math.floor(width / minItemWidth);
    itemsPerRow = Math.max(1, Math.min(4, itemsPerRow));
    
    const legendRows = Math.ceil(this.categoryData.categories.length / itemsPerRow);
    const legendHeight = legendRows * 30 + 40;
    const totalHeight = chartHeight + legendHeight;

    const svg = d3
      .select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', width)
      .attr('height', totalHeight);

    const tooltip = d3
      .select(this.chartContainer.nativeElement)
      .append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', '#FFD81F')
      .style('color', '#141414')
      .style('padding', '10px 15px')
      .style('border-radius', '8px')
      .style('font-size', '13px')
      .style('font-weight', '600')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.3)')
      .style('white-space', 'nowrap');

    this.svg = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${chartHeight / 2})`);

    const pie = d3.pie<CategoryStats>()
      .value((d) => d.percentage)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<CategoryStats>>()
      .innerRadius(0)
      .outerRadius(this.radius);

    const arcHover = d3.arc<d3.PieArcDatum<CategoryStats>>()
      .innerRadius(0)
      .outerRadius(this.radius + 10);

    const arcs = this.svg
      .selectAll('.arc')
      .data(pie(this.categoryData.categories))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', (d: any, i: number) => this.colors(i.toString()))
      .attr('stroke', '#141414')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer')
      .on('mouseover', (event: MouseEvent, d: any) => {
        const sectionColor = d3.select(event.currentTarget as SVGPathElement).attr('fill');
        
        d3.select(event.currentTarget as SVGPathElement)
          .transition()
          .duration(200)
          .attr('d', arcHover as any)
          .style('opacity', 0.9);

        const tooltipContent = this.getTooltipContent(d.data);
        tooltip
          .html(tooltipContent)
          .style('background', sectionColor)
          .style('color', '#141414')
          .style('visibility', 'visible');
      })
      .on('mousemove', (event: MouseEvent) => {
        const containerRect = this.chartContainer.nativeElement.getBoundingClientRect();
        tooltip
          .style('top', (event.clientY - containerRect.top - 60) + 'px')
          .style('left', (event.clientX - containerRect.left + 10) + 'px');
      })
      .on('mouseout', (event: MouseEvent, d: any) => {
        d3.select(event.currentTarget as SVGPathElement)
          .transition()
          .duration(200)
          .attr('d', arc as any)
          .style('opacity', 1);

        tooltip.style('visibility', 'hidden');
      });

    arcs
      .append('text')
      .attr('transform', (d: any) => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .attr('fill', '#141414')
      .style('pointer-events', 'none')
      .text((d: any) => {
        return d.data.percentage > 5 ? `${d.data.percentage.toFixed(1)}%` : '';
      });

    this.addLegend(svg, width, chartHeight);
  }

  private getTooltipText(d: any): string {
    const category = d.data;
    let tooltip = `${category.categoryName}\n${category.count} contenus\n${category.percentage.toFixed(1)}%`;
    
    if (this.selectedMode === 'by-time' && this.categoryDataByTime) {
      const timeData = this.categoryDataByTime.find(c => c.categoryId === category.categoryId);
      if (timeData) {
        tooltip += `\n${timeData.total_time_hours.toFixed(1)} heures`;
      }
    }
    
    return tooltip;
  }

  private addLegend(svg: any, width: number, chartHeight: number): void {
    if (!this.categoryData) return;

    const legendY = chartHeight + 20;

    const legendContainer = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(0, ${legendY})`);

    const minItemWidth = 140;
    const maxItemWidth = 200;
    
    let itemsPerRow = Math.floor(width / minItemWidth);
    
    itemsPerRow = Math.max(1, Math.min(4, itemsPerRow));
    
    const actualItemWidth = Math.min(maxItemWidth, width / itemsPerRow);
    
    const legendItems = legendContainer
      .selectAll('.legend-item')
      .data(this.categoryData.categories)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d: any, i: number) => {
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;
        const x = col * actualItemWidth + 10;
        const y = row * 30;
        return `translate(${x}, ${y})`;
      });

    legendItems
      .append('rect')
      .attr('width', 16)
      .attr('height', 16)
      .attr('rx', 3)
      .attr('fill', (d: any, i: number) => this.colors(i.toString()))
      .attr('stroke', '#969696')
      .attr('stroke-width', 1);

    legendItems
      .append('text')
      .attr('x', 22)
      .attr('y', 8)
      .attr('dy', '0.35em')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#ffffff')
      .text((d: any) => {
        const availableWidth = actualItemWidth - 30;
        const charWidth = 7;
        const maxChars = Math.floor(availableWidth / charWidth);
        
        const fullText = `${d.categoryName} (${d.percentage.toFixed(1)}%)`;
        
        if (fullText.length > maxChars) {
          const percentText = ` (${d.percentage.toFixed(1)}%)`;
          const maxNameLength = maxChars - percentText.length - 3;
          
          if (maxNameLength > 0) {
            return `${d.categoryName.substring(0, maxNameLength)}...${percentText}`;
          } else {
            return `${d.percentage.toFixed(0)}%`;
          }
        }
        
        return fullText;
      });
  }

  private getTooltipContent(category: CategoryStats): string {
    let content = `
      <div style="line-height: 1.5;">
        <div style="font-size: 14px; font-weight: 700; margin-bottom: 5px;">
          ${category.categoryName}
        </div>
        <div style="font-size: 13px;">
          ${category.count} contenu${category.count > 1 ? 's' : ''}
        </div>
        <div style="font-size: 13px; font-weight: 700;">
          ${category.percentage.toFixed(1)}%
        </div>
    `;

    if (this.selectedMode === 'by-time' && this.categoryDataByTime) {
      const timeData = this.categoryDataByTime.find(c => c.categoryId === category.categoryId);
      if (timeData) {
        content += `
          <div style="font-size: 12px; margin-top: 5px; opacity: 0.9;">
            ⏱️ ${timeData.total_time_hours.toFixed(1)}h de visionnage
          </div>
        `;
      }
    }

    content += '</div>';
    return content;
  }

  refresh(): void {
    this.loadData();
  }

  getCurrentModeDescription(): string {
    const mode = this.modeOptions.find(m => m.value === this.selectedMode);
    return mode ? mode.description : '';
  }
}