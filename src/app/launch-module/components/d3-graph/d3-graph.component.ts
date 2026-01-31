import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-d3-graph',
  standalone: true,
  imports: [],
  templateUrl: './d3-graph.component.html',
  styleUrls: ['./d3-graph.component.css']
})
export class D3GraphComponent implements AfterViewInit {
  @ViewChild('svgGraph', { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  private width = window.innerWidth;
  private height = window.innerHeight;
  private numNodes = 1500;
  private nbWidth = 20;

  private simulation: d3.Simulation<any, undefined> | undefined;
  private nodes: any[] = [];
  private links: any[] = [];

  private tickCount = 0;

  ngAfterViewInit(): void {
    this.createGraph();
    this.setAnimation('expand');
    window.addEventListener('resize', () => this.onResize());
  }

  private createGraph(): void {
    this.nodes = Array.from({ length: this.numNodes }, (_, i) => ({ id: i }));
    this.links = [];

    for (let i = 0; i < this.nodes.length; i++) {
      const right = i + 1;
      const bottom = i + this.nbWidth;

      if (right < this.nodes.length) {
        this.links.push({ source: i, target: right });
      }
      if (bottom < this.nodes.length) {
        this.links.push({ source: i, target: bottom });
      }
    }

    const svg = d3.select(this.svgRef.nativeElement);
    const container = svg.append('g');

    this.simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.links).id((d: any) => d.id).distance(10))
      .force('charge', d3.forceManyBody().strength(-2))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collision', d3.forceCollide().radius(4));

    container.append('g')
      .attr('stroke', '#aaa')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(this.links)
      .join('line')
      .attr('stroke-width', 0.5);

    container.append('g')
      .attr('stroke-width', 1)
      .selectAll('circle')
      .data(this.nodes)
      .join('circle')
      .attr('r', 3)
      .attr('stroke', '#282828')
      .attr('fill', d => d.id % 7 === 0 ? '#FFD812' : 'black')

    this.simulation.on('tick', () => {
      container.selectAll('line')
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      container.selectAll('circle')
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
    });
  }

  private onResize(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    if (this.simulation) {
      this.simulation
        .force('center', d3.forceCenter(this.width / 2, this.height / 2));
      this.simulation.alpha(1).restart();
    }
    const svg = d3.select(this.svgRef.nativeElement);
    svg.attr('width', this.width).attr('height', this.height);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', () => this.onResize());
    this.setAnimation('none');
    this.simulation?.stop();
  }

  private currentAnimation: 'none' | 'wave' | 'chaos' | 'pulse' | 'expand' = 'none';

  private animate(): void {
    if (this.currentAnimation === 'none') return;

    this.tickCount += 0.01;

    switch (this.currentAnimation) {
      case 'wave':
        this.animateWave();
        break;
      case 'chaos':
        this.animateChaos();
        break;
      case 'pulse':
        this.animatePulse();
        break;
      case 'expand':
        this.animateExpandContract();
        break;
    }

    this.simulation?.alpha(0.1).restart();
    requestAnimationFrame(() => this.animate());
  }

  private animateWave(): void {
    const amplitude = 5;
    const frequency = 0.1;

    this.nodes.forEach(node => {
      node.vx += Math.sin(this.tickCount + node.id * frequency) * amplitude * 0.01;
      node.vy += Math.cos(this.tickCount + node.id * frequency) * amplitude * 0.01;
    });
  }

  private animateChaos(): void {
    this.nodes.forEach(node => {
      node.vx += (Math.random() - 0.5) * 0.5;
      node.vy += (Math.random() - 0.5) * 0.5;
    });
  }

  private animatePulse(): void {
    const scale = 1 + Math.sin(this.tickCount * 10) * 0.2;

    d3.select(this.svgRef.nativeElement)
      .selectAll('circle')
      .attr('r', (d: any) => (d.id % 7 === 0 ? 3 * scale : 3))
  }

  private animateExpandContract(): void {
    const strength = Math.sin(this.tickCount * 3) * 0.1;

    this.nodes.forEach(node => {
      const dx = node.x - this.width / 2;
      const dy = node.y - this.height / 2;
      node.vx += dx * strength * 0.001;
      node.vy += dy * strength * 0.001;
    });
  }

  joinAnimation(): void {
    if (!this.simulation) return;

    this.simulation
      .force('charge', d3.forceManyBody().strength(20))
      .force('x', d3.forceX(this.width / 2).strength(0.2))
      .force('y', d3.forceY(this.height / 2).strength(0.2));

    this.simulation.alpha(1).restart();

    setTimeout(() => {
      this.simulation
        ?.force('charge', d3.forceManyBody().strength(-3))
        .force('x', null)
        .force('y', null)
        .alpha(1)
        .restart();
    }, 200);
  }

  setAnimation(type: 'none' | 'wave' | 'chaos' | 'pulse' | 'expand') {
    this.currentAnimation = type;
    this.animate();
  }

}
