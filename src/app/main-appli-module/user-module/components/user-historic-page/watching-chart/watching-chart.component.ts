import { Component, ElementRef, ViewChild, Input } from '@angular/core';
import * as d3 from 'd3';
import { UserHistoricService } from '../../../service/user-historic/user-historic.service';
import { PeriodType } from '../../../dto/user-historic/period.type';
import { ContentType } from '../../../dto/user-historic/content.type';
import { DataPoint } from '../../../dto/user-historic/data-point.interface';
import { WatchingStatsResponse } from '../../../dto/user-historic/watching-stats-response.interface';
import { FilterOption } from '../../../dto/user-historic/filter-option.interface';

@Component({
  standalone: true,
  selector: 'app-watching-chart',
  templateUrl: './watching-chart.component.html',
  styleUrls: ['./watching-chart.component.scss'],
  imports: []
})
export class WatchingChartComponent {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;
  @Input() userId: number = 70000;

  selectedPeriod: PeriodType = 'month';
  selectedContent: ContentType = 'all';
  startDate: string = '';

  periodOptions: FilterOption[] = [
    { value: 'day', label: 'Jour', icon: '📅' },
    { value: 'week', label: 'Semaine', icon: '📆' },
    { value: 'month', label: 'Mois', icon: '🗓️' },
    { value: 'year', label: 'Année', icon: '📊' },
  ];

  contentOptions: FilterOption[] = [
    { value: 'all', label: 'Tout', icon: '🎬' },
    { value: 'movies', label: 'Films', icon: '🎥' },
    { value: 'series', label: 'Séries', icon: '📺' },
  ];

  stats: WatchingStatsResponse | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(private userHistoricService: UserHistoricService) {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    this.startDate = date.toISOString().split('T')[0];
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadData();
    }, 0);
  }

  onPeriodChange(period: PeriodType | any): void {
    this.selectedPeriod = period;
    this.loadData();
  }

  onContentChange(content: ContentType | any): void {
    this.selectedContent = content;
    this.loadData();
  }

  onStartDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.startDate = input.value;
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    this.userHistoricService
      .getUserWatchingHistory(this.userId, this.startDate, this.selectedPeriod, this.selectedContent)
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.loading = false;

          if (data.data.length > 0 && this.chartContainer) {
            setTimeout(() => {
              this.createChart();
            }, 100);
          }
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des données';
          this.loading = false;
        }
      });
  }

  private createChart(): void {
    if (!this.stats || this.stats.data.length === 0 || !this.chartContainer) {
      return;
    }

    d3.select(this.chartContainer.nativeElement).selectAll('*').remove();

    const containerWidth = this.chartContainer.nativeElement.clientWidth;
    const width = containerWidth - 60;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 60, left: 60 };

    const svg = d3
      .select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(this.stats.data.map(d => d.period))
      .range([0, width])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(this.stats.data, d => d.hours) || 0])
      .nice()
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('fill', '#999')
      .attr('font-size', '11px');

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', '#999')
      .attr('font-size', '11px');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .attr('fill', '#FFD81F')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .text('Heures de visionnage');

    const tooltip = d3
      .select(this.chartContainer.nativeElement)
      .append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', '#FFD81F')
      .style('color', '#141414')
      .style('padding', '10px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('pointer-events', 'none')
      .style('z-index', '1000');

    svg.selectAll('.bar')
      .data(this.stats.data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.period) || 0)
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.hours))
      .attr('height', d => height - y(d.hours))
      .attr('fill', '#FFD81F')
      .attr('stroke', '#141414')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', (event: MouseEvent, d: any) => {
        d3.select(event.currentTarget as SVGRectElement)
          .transition()
          .duration(200)
          .attr('fill', '#FFC107');

        const tooltipContent = this.getTooltipContent(d);
        tooltip
          .html(tooltipContent)
          .style('visibility', 'visible');
      })
      .on('mousemove', (event: MouseEvent) => {
        const containerRect = this.chartContainer.nativeElement.getBoundingClientRect();
        tooltip
          .style('top', (event.clientY - containerRect.top - 80) + 'px')
          .style('left', (event.clientX - containerRect.left + 10) + 'px');
      })
      .on('mouseout', (event: MouseEvent) => {
        d3.select(event.currentTarget as SVGRectElement)
          .transition()
          .duration(200)
          .attr('fill', '#FFD81F');

        tooltip.style('visibility', 'hidden');
      });

    svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#2a2a2a')
      .attr('stroke-dasharray', '2,2');
  }

  private getTooltipContent(d: DataPoint): string {
    let content = `
      <div style="line-height: 1.5;">
        <div style="font-weight: 700; margin-bottom: 5px;">${d.period}</div>
        <div>${d.hours.toFixed(1)} heures</div>
    `;

    if (this.selectedContent === 'all' || this.selectedContent === 'movies') {
      content += `<div>${d.movies} film${d.movies > 1 ? 's' : ''}</div>`;
    }

    if (this.selectedContent === 'all' || this.selectedContent === 'series') {
      content += `<div>${d.episodeCount} épisode${d.episodeCount > 1 ? 's' : ''}</div>`;
    }

    content += '</div>';
    return content;
  }

  refresh(): void {
    this.loadData();
  }

}