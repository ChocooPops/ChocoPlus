import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';

interface JsonNode {
  key: string;
  value: any;
  type: string;
  path: string;
  level: number;
  isExpanded: boolean;
  isExpandable: boolean;
  childCount?: number;
  preview?: string;
}

@Component({
  selector: 'app-json-viewer',
  standalone: true,
  imports: [CommonModule, ScrollingModule],
  templateUrl: './json-viewer.component.html',
  styleUrl: './json-viewer.component.css',
})
export class JsonViewerComponent implements OnInit, OnChanges {
  @Input() data: any;
  @Input() maxInitialDepth: number = 1;

  allNodes: Map<string, JsonNode> = new Map();
  visibleNodes: JsonNode[] = [];
  totalNodes: number = 0;
  loading: boolean = false;

  ngOnInit() {
    this.loadJson();
  }

  ngOnChanges() {
    this.loadJson();
  }

  async loadJson() {
    if (!this.data) return;

    this.loading = true;
    this.allNodes.clear();
    this.visibleNodes = [];

    setTimeout(() => {
      this.parseJson();
      this.updateVisibleNodes();
      this.loading = false;
    }, 10);
  }

  parseJson() {
    this.allNodes.clear();
    this.parseValue(this.data, 'root', '', 0);
    this.totalNodes = this.allNodes.size;
  }

  parseValue(value: any, key: string, parentPath: string, level: number): void {
    const type = this.getType(value);
    const currentPath = parentPath ? `${parentPath}.${key}` : key;

    const node: JsonNode = {
      key,
      value,
      type,
      path: currentPath,
      level,
      isExpanded: level < this.maxInitialDepth,
      isExpandable: type === 'object' || type === 'array',
      childCount: 0,
      preview: '',
    };

    node.preview = this.calculatePreview(node);

    this.allNodes.set(currentPath, node);

    if (type === 'object') {
      const keys = Object.keys(value);
      node.childCount = keys.length;

      keys.forEach((k) => {
        this.parseValue(value[k], k, currentPath, level + 1);
      });
    } else if (type === 'array') {
      node.childCount = value.length;

      value.forEach((item: any, index: number) => {
        this.parseValue(item, `[${index}]`, currentPath, level + 1);
      });
    }
  }

  calculatePreview(node: JsonNode): string {
    if (node.type === 'string') {
      const str = String(node.value);
      return `"${str.length > 100 ? str.substring(0, 100) + '...' : str}"`;
    }
    if (node.type === 'null') return 'null';
    if (node.type === 'boolean') return String(node.value);
    if (node.type === 'number') return String(node.value);
    if (node.type === 'array') {
      return node.isExpanded
        ? `[ // ${node.childCount} éléments`
        : `[...] // ${node.childCount} éléments`;
    }
    if (node.type === 'object') {
      return node.isExpanded
        ? `{ // ${node.childCount} propriétés`
        : `{...} // ${node.childCount} propriétés`;
    }
    return String(node.value);
  }

  updateVisibleNodes() {
    const visible: JsonNode[] = [];
    const expandedPaths = new Set<string>();

    this.allNodes.forEach((node) => {
      if (node.isExpanded) {
        expandedPaths.add(node.path);
      }
    });

    this.allNodes.forEach((node) => {
      if (this.isNodeVisible(node, expandedPaths)) {
        visible.push(node);
      }
    });

    this.visibleNodes = visible.sort((a, b) => {
      return this.comparePaths(a.path, b.path);
    });
  }

  isNodeVisible(node: JsonNode, expandedPaths: Set<string>): boolean {
    if (node.level === 0) return true;

    const pathParts = node.path.split('.');

    for (let i = 1; i < pathParts.length; i++) {
      const parentPath = pathParts.slice(0, i).join('.');
      if (!expandedPaths.has(parentPath)) {
        return false;
      }
    }

    return true;
  }

  comparePaths(a: string, b: string): number {
    const aParts = a.split('.');
    const bParts = b.split('.');

    const minLen = Math.min(aParts.length, bParts.length);

    for (let i = 0; i < minLen; i++) {
      const aMatch = aParts[i].match(/\[(\d+)\]/);
      const bMatch = bParts[i].match(/\[(\d+)\]/);

      if (aMatch && bMatch) {
        const diff = parseInt(aMatch[1]) - parseInt(bMatch[1]);
        if (diff !== 0) return diff;
      } else if (aParts[i] !== bParts[i]) {
        return aParts[i].localeCompare(bParts[i]);
      }
    }

    return aParts.length - bParts.length;
  }

  toggleNode(node: JsonNode) {
    node.isExpanded = !node.isExpanded;
    node.preview = this.calculatePreview(node);
    this.allNodes.set(node.path, node);
    this.updateVisibleNodes();
  }

  expandAll() {
    this.loading = true;
    setTimeout(() => {
      this.allNodes.forEach((node) => {
        if (node.isExpandable) {
          node.isExpanded = true;
          node.preview = this.calculatePreview(node);
        }
      });
      this.updateVisibleNodes();
      this.loading = false;
    }, 10);
  }

  collapseAll() {
    this.allNodes.forEach((node) => {
      node.isExpanded = node.level === 0;
      node.preview = this.calculatePreview(node);
    });
    this.updateVisibleNodes();
  }

  expandToLevel(maxLevel: number) {
    this.allNodes.forEach((node) => {
      if (node.isExpandable) {
        node.isExpanded = node.level < maxLevel;
        node.preview = this.calculatePreview(node);
      }
    });
    this.updateVisibleNodes();
  }

  getType(value: any): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  trackByIndex(index: number, node: JsonNode): string {
    return node.path;
  }
}
