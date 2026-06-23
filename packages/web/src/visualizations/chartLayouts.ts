import * as d3 from 'd3';
import type { CensusTract } from '../types/data';

export const SIMULATION_TICKS = 120;
export const PRECOMPUTE_TICKS = 400;
export const BUBBLE_COLLIDE_PAD = 4;
export const POVERTY_COLLIDE_PAD = 3;
const MIN_GAP = 1;

export const BUBBLE_REF = {
  width: 800,
  height: 600,
  margin: { top: 16, right: 16, bottom: 56, left: 16 },
} as const;

export const POVERTY_REF = {
  width: 800,
  height: 600,
} as const;

const CITY = 'St. Louis City';
const COUNTY = 'St. Louis County';

type SimNode = CensusTract & d3.SimulationNodeDatum;

export function bubbleDimensions(width: number, height: number) {
  const { margin } = BUBBLE_REF;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const maxRadius = Math.min(12, Math.min(innerWidth, innerHeight) * 0.026);
  return { innerWidth, innerHeight, maxRadius };
}

export function povertyDimensions(width: number, height: number) {
  const maxRadius = Math.min(12, Math.min(width, height) * 0.022);
  const bubblePad = maxRadius + 8;
  const margin = { top: bubblePad + 20, right: 24, bottom: bubblePad + 8, left: 56 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  return { innerWidth, innerHeight, maxRadius, bubblePad, centerX: innerWidth / 2, margin };
}

export function hasBubbleLayout(data: CensusTract[]): boolean {
  const tracts = data.filter((d) => d.County === CITY || d.County === COUNTY);
  return tracts.length > 0 && tracts.every((d) => d.BubbleX != null && d.BubbleY != null);
}

export function hasPovertyLayout(data: CensusTract[]): boolean {
  return data.length > 0 && data.every((d) => d.PovertyX != null && d.PovertyY != null);
}

export function scaleBubblePosition(
  d: CensusTract,
  innerWidth: number,
  innerHeight: number,
): { x: number; y: number } {
  return {
    x: (d.BubbleX ?? 0) * innerWidth,
    y: (d.BubbleY ?? 0) * innerHeight,
  };
}

export function scalePovertyPosition(
  d: CensusTract,
  innerWidth: number,
  innerHeight: number,
): { x: number; y: number } {
  return {
    x: (d.PovertyX ?? 0) * innerWidth,
    y: (d.PovertyY ?? 0) * innerHeight,
  };
}

export function normalizeLayoutMap(
  positions: Map<string, { x: number; y: number }>,
  innerWidth: number,
  innerHeight: number,
): Map<string, { x: number; y: number }> {
  const normalized = new Map<string, { x: number; y: number }>();
  for (const [tract, pos] of positions) {
    normalized.set(tract, { x: pos.x / innerWidth, y: pos.y / innerHeight });
  }
  return normalized;
}

function resolveOverlaps<T extends { x?: number; y?: number }>(
  nodes: T[],
  radiusFn: (node: T) => number,
  maxIterations = 80,
): void {
  for (let iter = 0; iter < maxIterations; iter += 1) {
    let moved = false;
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const ri = radiusFn(nodes[i]);
        const rj = radiusFn(nodes[j]);
        const dx = (nodes[j].x ?? 0) - (nodes[i].x ?? 0);
        const dy = (nodes[j].y ?? 0) - (nodes[i].y ?? 0);
        const dist = Math.hypot(dx, dy) || 0.01;
        const minDist = ri + rj + MIN_GAP;
        if (dist < minDist) {
          const push = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          nodes[i].x = (nodes[i].x ?? 0) - nx * push;
          nodes[i].y = (nodes[i].y ?? 0) - ny * push;
          nodes[j].x = (nodes[j].x ?? 0) + nx * push;
          nodes[j].y = (nodes[j].y ?? 0) + ny * push;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
}

function settleSimulation(simulation: d3.Simulation<SimNode, undefined>, ticks: number): void {
  simulation.alpha(1);
  for (let i = 0; i < ticks; i += 1) {
    simulation.tick();
  }
}

export function computeBubbleLayout(
  data: CensusTract[],
  innerWidth: number,
  innerHeight: number,
): Map<string, { x: number; y: number }> {
  const cityCenterX = innerWidth * 0.2;
  const countyCenterX = innerWidth * 0.75;
  const clusterCenterY = innerHeight * 0.46;

  const tracts = data.filter((d) => d.County === CITY || d.County === COUNTY);
  const nodes: SimNode[] = tracts.map((d) => ({
    ...d,
    x: d.County === CITY ? cityCenterX : countyCenterX,
    y: clusterCenterY,
  }));

  const maxRadius = Math.min(12, Math.min(innerWidth, innerHeight) * 0.026);
  const popSizeScale = d3
    .scaleSqrt()
    .domain(d3.extent(tracts, (d) => d.Population) as [number, number])
    .range([2, maxRadius]);
  const radius = (d: SimNode) => popSizeScale(d.Population) ?? 2;

  const simulation = d3
    .forceSimulation(nodes)
    .force('charge', d3.forceManyBody<SimNode>().strength((d) => (d.County === CITY ? 2 : 3)))
    .force(
      'x',
      d3
        .forceX<SimNode>((d) => (d.County === CITY ? cityCenterX : countyCenterX))
        .strength(0.1),
    )
    .force('y', d3.forceY<SimNode>(clusterCenterY).strength(0.1))
    .force(
      'collide',
      d3
        .forceCollide<SimNode>((d) => radius(d) + BUBBLE_COLLIDE_PAD)
        .strength(1)
        .iterations(3),
    )
    .alphaDecay(0.02)
    .stop();

  settleSimulation(simulation, SIMULATION_TICKS);
  resolveOverlaps(nodes, radius);

  const positions = new Map<string, { x: number; y: number }>();
  for (const node of nodes) {
    positions.set(node.Tract, { x: node.x!, y: node.y! });
  }
  return positions;
}

function beeswarmPlace<T extends { x?: number; y?: number; Population: number }>(
  nodes: T[],
  radiusFn: (node: T) => number,
  innerWidth: number,
  innerHeight: number,
  anchors: { anchorX: (node: T) => number; anchorY: (node: T) => number },
): void {
  nodes.sort((a, b) => anchors.anchorY(b) - anchors.anchorY(a) || b.Population - a.Population);

  const placed: { x: number; y: number; r: number }[] = [];
  for (const node of nodes) {
    const r = radiusFn(node);
    const targetY = anchors.anchorY(node);
    const ax = anchors.anchorX(node);
    let placedNode = false;

    for (let ring = 0; ring < 50 && !placedNode; ring += 1) {
      const dist = ring * 3;
      const steps = Math.max(10, ring * 5);
      for (let step = 0; step < steps; step += 1) {
        const angle = (step / steps) * Math.PI * 2;
        const x = ax + dist * Math.cos(angle);
        const y = targetY + dist * Math.sin(angle);
        if (x < r || x > innerWidth - r || y < r || y > innerHeight - r) continue;

        const searchRadius = r + MIN_GAP + dist + 12;
        const overlaps = placed.some((other) => {
          if (Math.abs(other.x - x) > searchRadius || Math.abs(other.y - y) > searchRadius) {
            return false;
          }
          return Math.hypot(x - other.x, y - other.y) < r + other.r + MIN_GAP;
        });
        if (!overlaps) {
          node.x = x;
          node.y = y;
          placed.push({ x, y, r });
          placedNode = true;
          break;
        }
      }
    }

    if (!placedNode) {
      node.x = ax;
      node.y = targetY;
      placed.push({ x: ax, y: targetY, r });
    }
  }
}

export function computePovertyLayout(
  data: CensusTract[],
  innerWidth: number,
  innerHeight: number,
  maxRadius: number,
  bubblePad: number,
): Map<string, { x: number; y: number }> {
  const centerX = innerWidth / 2;
  const yMin = 0.05;
  const yMax = 0.55;
  const yScale = d3.scaleLinear().domain([yMin, yMax]).range([bubblePad, innerHeight - bubblePad]);

  const nodes: SimNode[] = data.map((d) => ({
    ...d,
    x: centerX,
    y: yScale(d.PctPoverty) ?? 0,
  }));
  const popSizeScale = d3
    .scaleSqrt()
    .domain(d3.extent(data, (d) => d.Population) as [number, number])
    .range([2, maxRadius]);
  const radius = (d: SimNode) => popSizeScale(d.Population) ?? 2;

  beeswarmPlace(nodes, radius, innerWidth, innerHeight, {
    anchorX: () => centerX,
    anchorY: (d) => yScale(d.PctPoverty) ?? 0,
  });
  resolveOverlaps(nodes, radius, 200);

  const positions = new Map<string, { x: number; y: number }>();
  for (const node of nodes) {
    positions.set(node.Tract, { x: node.x!, y: node.y! });
  }
  return positions;
}
