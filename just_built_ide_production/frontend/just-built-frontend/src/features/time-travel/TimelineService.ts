# Time-Travel Development Implementation

This module implements the Time-Travel Development feature, enabling users to navigate through the AI's development process, understand decisions, and make changes at any point.

```typescript
import { v4 as uuidv4 } from 'uuid';

// Types for Time-Travel Development
export interface TimelineNode {
  id: string;
  timestamp: Date;
  type: 'decision' | 'code' | 'plan' | 'explanation' | 'alternative' | 'user-edit';
  title: string;
  description: string;
  content: string;
  metadata: Record<string, any>;
  parentId?: string;
  childrenIds: string[];
  branchId: string;
  stepNumber: number;
}

export interface TimelineBranch {
  id: string;
  name: string;
  description: string;
  created: Date;
  nodeIds: string[];
  isActive: boolean;
  parentBranchId?: string;
  branchPoint?: string; // Node ID where this branch was created
}

export interface Timeline {
  projectId: string;
  branches: Map<string, TimelineBranch>;
  nodes: Map<string, TimelineNode>;
  mainBranchId: string;
  activeBranchId: string;
  activeNodeId: string;
  checkpoints: Map<string, string>; // name -> nodeId
}

export interface TimelineOptions {
  maxBranches?: number;
  maxNodesPerBranch?: number;
  autoCheckpointInterval?: number; // in minutes
}

// Time-Travel Development Service
export class TimelineService {
  private timelines: Map<string, Timeline> = new Map();
  private options: TimelineOptions = {
    maxBranches: 10,
    maxNodesPerBranch: 100,
    autoCheckpointInterval: 15
  };
  
  constructor(options?: Partial<TimelineOptions>) {
    if (options) {
      this.options = { ...this.options, ...options };
    }
  }
  
  // Create a new timeline for a project
  public createTimeline(projectId: string, initialDescription: string): Timeline {
    // Create main branch
    const mainBranchId = uuidv4();
    const mainBranch: TimelineBranch = {
      id: mainBranchId,
      name: 'Main',
      description: 'Main development branch',
      created: new Date(),
      nodeIds: [],
      isActive: true
    };
    
    // Create initial node
    const initialNodeId = uuidv4();
    const initialNode: TimelineNode = {
      id: initialNodeId,
      timestamp: new Date(),
      type: 'plan',
      title: 'Project Initialization',
      description: initialDescription,
      content: `Project initialized with description: ${initialDescription}`,
      metadata: {},
      childrenIds: [],
      branchId: mainBranchId,
      stepNumber: 1
    };
    
    // Update branch with initial node
    mainBranch.nodeIds.push(initialNodeId);
    
    // Create timeline
    const timeline: Timeline = {
      projectId,
      branches: new Map([[mainBranchId, mainBranch]]),
      nodes: new Map([[initialNodeId, initialNode]]),
      mainBranchId,
      activeBranchId: mainBranchId,
      activeNodeId: initialNodeId,
      checkpoints: new Map([['initial', initialNodeId]])
    };
    
    this.timelines.set(projectId, timeline);
    return timeline;
  }
  
  // Get a timeline by project ID
  public getTimeline(projectId: string): Timeline | undefined {
    return this.timelines.get(projectId);
  }
  
  // Add a node to the timeline
  public addNode(
    projectId: string, 
    nodeData: Omit<TimelineNode, 'id' | 'timestamp' | 'childrenIds' | 'branchId' | 'stepNumber'>
  ): TimelineNode | undefined {
    const timeline = this.getTimeline(projectId);
    if (!timeline) return undefined;
    
    const activeBranch = timeline.branches.get(timeline.activeBranchId);
    if (!activeBranch) return undefined;
    
    const activeNode = timeline.nodes.get(timeline.activeNodeId);
    if (!activeNode) return undefined;
    
    // Create new node
    const newNodeId = uuidv4();
    const newNode: TimelineNode = {
      ...nodeData,
      id: newNodeId,
      timestamp: new Date(),
      childrenIds: [],
      branchId: timeline.activeBranchId,
      stepNumber: activeNode.stepNumber + 1,
      parentId: activeNode.id
    };
    
    // Update active node's children
    activeNode.childrenIds.push(newNodeId);
    
    // Update timeline
    timeline.nodes.set(activeNode.id, activeNode);
    timeline.nodes.set(newNodeId, newNode);
    
    // Update branch
    activeBranch.nodeIds.push(newNodeId);
    timeline.branches.set(activeBranch.id, activeBranch);
    
    // Update active node
    timeline.activeNodeId = newNodeId;
    
    // Check if we should create an automatic checkpoint
    this.createAutoCheckpointIfNeeded(timeline);
    
    return newNode;
  }
  
  // Navigate to a specific node
  public navigateToNode(projectId: string, nodeId: string): boolean {
    const timeline = this.getTimeline(projectId);
    if (!timeline) return false;
    
    const targetNode = timeline.nodes.get(nodeId);
    if (!targetNode) return false;
    
    const targetBranch = timeline.branches.get(targetNode.branchId);
    if (!targetBranch) return false;
    
    // Update active node and branch
    timeline.activeNodeId = nodeId;
    timeline.activeBranchId = targetNode.branchId;
    
    return true;
  }
  
  // Create a new branch from the current node
  public createBranch(
    projectId: string, 
    branchName: string, 
    branchDescription: string
  ): TimelineBranch | undefined {
    const timeline = this.getTimeline(projectId);
    if (!timeline) return undefined;
    
    const activeNode = timeline.nodes.get(timeline.activeNodeId);
    if (!activeNode) return undefined;
    
    // Check if we've reached the maximum number of branches
    if (timeline.branches.size >= (this.options.maxBranches || 10)) {
      console.warn(`Maximum number of branches (${this.options.maxBranches}) reached.`);
      return undefined;
    }
    
    // Create new branch
    const newBranchId = uuidv4();
    const newBranch: TimelineBranch = {
      id: newBranchId,
      name: branchName,
      description: branchDescription,
      created: new Date(),
      nodeIds: [activeNode.id], // Start with the active node
      isActive: true,
      parentBranchId: activeNode.branchId,
      branchPoint: activeNode.id
    };
    
    // Update timeline
    timeline.branches.set(newBranchId, newBranch);
    
    // Set all other branches as inactive
    for (const [branchId, branch] of timeline.branches.entries()) {
      if (branchId !== newBranchId) {
        branch.isActive = false;
        timeline.branches.set(branchId, branch);
      }
    }
    
    // Update active branch
    timeline.activeBranchId = newBranchId;
    
    return newBranch;
  }
  
  // Create a checkpoint at the current node
  public createCheckpoint(projectId: string, checkpointName: string): boolean {
    const timeline = this.getTimeline(projectId);
    if (!timeline) return false;
    
    timeline.checkpoints.set(checkpointName, timeline.activeNodeId);
    return true;
  }
  
  // Navigate to a checkpoint
  public navigateToCheckpoint(projectId: string, checkpointName: string): boolean {
    const timeline = this.getTimeline(projectId);
    if (!timeline) return false;
    
    const checkpointNodeId = timeline.checkpoints.get(checkpointName);
    if (!checkpointNodeId) return false;
    
    return this.navigateToNode(projectId, checkpointNodeId);
  }
  
  // Get all checkpoints for a project
  public getCheckpoints(projectId: string): Map<string, string> | undefined {
    const timeline = this.getTimeline(projectId);
    if (!timeline) return undefined;
    
    return timeline.checkpoints;
  }
  
  // Get the path from the root to the current node
  public getCurrentPath(projectId: string): TimelineNode[] {
    const timeline = this.getTimeline(projectId);
    if (!timeline) return [];
    
    const path: TimelineNode[] = [];
    let currentNodeId = timeline.activeNodeId;
    
    // Traverse up the tree to build the path
    while (currentNodeId) {
      const currentNode = timeline.nodes.get(currentNodeId);
      if (!currentNode) break;
      
      path.unshift(currentNode); // Add to the beginning of the array
      
      if (!currentNode.parentId) break;
      currentNodeId = currentNode.parentId;
    }
    
    return path;
  }
  
  // Get alternative paths from a specific node
  public getAlternativePaths(projectId: string, nodeId: string): TimelineNode[][] {
    const timeline = this.getTimeline(projectId);
    if (!timeline) return [];
    
    const node = timeline.nodes.get(nodeId);
    if (!node) return [];
    
    const alternativePaths: TimelineNode[][] = [];
    
    // For each child, build a path
    for (const childId of node.childrenIds) {
      const path = this.buildPathFromNode(timeline, childId);
      if (path.length > 0) {
        alternativePaths.push(path);
      }
    }
    
    return alternativePaths;
  }
  
  // Build a path from a specific node to a leaf node
  private buildPathFromNode(timeline: Timeline, startNodeId: string): TimelineNode[] {
    const path: TimelineNode[] = [];
    let currentNodeId = startNodeId;
    
    // Traverse down the tree to build the path
    while (currentNodeId) {
      const currentNode = timeline.nodes.get(currentNodeId);
      if (!currentNode) break;
      
      path.push(currentNode);
      
      // If there are multiple children, just take the first one
      // In a real implementation, we might want to choose the "main" path
      if (currentNode.childrenIds.length === 0) break;
      currentNodeId = currentNode.childrenIds[0];
    }
    
    return path;
  }
  
  // Compare two nodes to show differences
  public compareNodes(projectId: string, nodeId1: string, nodeId2: string): any {
    const timeline = this.getTimeline(projectId);
    if (!timeline) return null;
    
    const node1 = timeline.nodes.get(nodeId1);
    const node2 = timeline.nodes.get(nodeId2);
    
    if (!node1 || !node2) return null;
    
    // In a real implementation, this would do a more sophisticated diff
    // based on the node type and content
    return {
      node1: {
        id: node1.id,
        title: node1.title,
        type: node1.type,
        content: node1.content
      },
      node2: {
        id: node2.id,
        title: node2.title,
        type: node2.type,
        content: node2.content
      },
      differences: {
        title: node1.title !== node2.title,
        type: node1.type !== node2.type,
        content: node1.content !== node2.content
      }
    };
  }
  
  // Get visualization data for the timeline
  public getVisualizationData(projectId: string): any {
    const timeline = this.getTimeline(projectId);
    if (!timeline) return null;
    
    const nodes = Array.from(timeline.nodes.values()).map(node => ({
      id: node.id,
      label: node.title,
      type: node.type,
      branchId: node.branchId,
      stepNumber: node.stepNumber,
      isActive: node.id === timeline.activeNodeId
    }));
    
    const edges: any[] = [];
    
    // Create edges between nodes
    for (const node of timeline.nodes.values()) {
      for (const childId of node.childrenIds) {
        edges.push({
          id: `${node.id}-${childId}`,
          source: node.id,
          target: childId
        });
      }
    }
    
    const branches = Array.from(timeline.branches.values()).map(branch => ({
      id: branch.id,
      name: branch.name,
      isActive: branch.id === timeline.activeBranchId,
      parentBranchId: branch.parentBranchId
    }));
    
    return { nodes, edges, branches };
  }
  
  // Create an automatic checkpoint if needed
  private createAutoCheckpointIfNeeded(timeline: Timeline): void {
    if (!this.options.autoCheckpointInterval) return;
    
    const now = new Date();
    const latestCheckpointTime = Array.from(timeline.checkpoints.entries())
      .map(([_, nodeId]) => timeline.nodes.get(nodeId)?.timestamp || new Date(0))
      .reduce((latest, current) => current > latest ? current : latest, new Date(0));
    
    const minutesSinceLastCheckpoint = (now.getTime() - latestCheckpointTime.getTime()) / (1000 * 60);
    
    if (minutesSinceLastCheckpoint >= this.options.autoCheckpointInterval) {
      const checkpointName = `auto-${now.toISOString().replace(/[:.]/g, '-')}`;
      this.createCheckpoint(timeline.projectId, checkpointName);
    }
  }
  
  // Get a summary of changes between two points in the timeline
  public getChangesSummary(projectId: string, startNodeId: string, endNodeId: string): any {
    const timeline = this.getTimeline(projectId);
    if (!timeline) return null;
    
    const startNode = timeline.nodes.get(startNodeId);
    const endNode = timeline.nodes.get(endNodeId);
    
    if (!startNode || !endNode) return null;
    
    // Find the path from start to end
    const pathToEnd = this.findPathBetweenNodes(timeline, startNodeId, endNodeId);
    if (!pathToEnd) return null;
    
    // Group changes by type
    const changes = {
      decisions: 0,
      codeChanges: 0,
      planUpdates: 0,
      userEdits: 0,
      explanations: 0,
      alternatives: 0,
      nodes: pathToEnd.slice(1) // Exclude the start node
    };
    
    // Count changes by type
    for (const node of pathToEnd.slice(1)) { // Skip the start node
      switch (node.type) {
        case 'decision':
          changes.decisions++;
          break;
        case 'code':
          changes.codeChanges++;
          break;
        case 'plan':
          changes.planUpdates++;
          break;
        case 'user-edit':
          changes.userEdits++;
          break;
        case 'explanation':
          changes.explanations++;
          break;
        case 'alternative':
          changes.alternatives++;
          break;
      }
    }
    
    return changes;
  }
  
  // Find a path between two nodes
  private findPathBetweenNodes(timeline: Timeline, startNodeId: string, endNodeId: string): TimelineNode[] | null {
    // Simple BFS to find the path
    const queue: { nodeId: string; path: TimelineNode[] }[] = [
      { nodeId: startNodeId, path: [] }
    ];
    const visited = new Set<string>();
    
    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      
      const node = timeline.nodes.get(nodeId);
      if (!node) continue;
      
      const newPath = [...path, node];
      
      if (nodeId === endNodeId) {
        return newPath;
      }
      
      // Add children to the queue
      for (const childId of node.childrenIds) {
        queue.push({ nodeId: childId, path: newPath });
      }
      
      // Also check parent if it exists
      if (node.parentId && !visited.has(node.parentId)) {
        queue.push({ nodeId: node.parentId, path: newPath });
      }
    }
    
    return null; // No path found
  }
}

export default TimelineService;
```
