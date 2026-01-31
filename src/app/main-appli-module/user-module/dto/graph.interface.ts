import { GraphLink } from "./graph-link.interface";
import { GraphNode } from "./graph-node.interface";

export interface GraphModel {
    nodes: GraphNode[],
    links: GraphLink[]
}