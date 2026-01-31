import { GraphNode } from "./graph-node.interface";

export interface GraphLink {
    source: GraphNode;
    target: GraphNode;
    name?: string
}