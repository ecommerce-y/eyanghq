type Point = { x: number; y: number };
type Rect = { x: number; y: number; width: number; height: number };
type Size = { width: number; height: number };
type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
};

type LayoutFrame = {
  viewport: Size;
  scale: number;
};

type CompositionSpec = {
  reference: Size;
  layout: {
    scale: number;
    rightGutterRatio: number;
    minRightGutter: number;
    maxRightGutter: number;
  };
  ratios: {
    headerWidth: number;
    headerHeight: number;
    branchStartX: number;
    diamondCenterX: number;
    diamondCenterY: number;
    diamondHalfDiag: number;
    circleRadius: number;
    panelOffsetXFromCircleLeft: number;
    panelOffsetYFromCircleBottom: number;
    panelWidth: number;
    panelHeight: number;
    titleX: number;
    titleY: number;
  };
  text: {
    title: string;
    work: string;
    talk: string;
    thinking: string;
    cursor: string;
    titleSize: number;
    headerTextOffsetY: number;
    thinkingSize: number;
    cursorSize: number;
    thinkingOffsetXFromCircleCenter: number;
    thinkingOffsetYFromCircleCenter: number;
    cursorOffsetXFromPanelLeft: number;
    cursorOffsetYFromPanelTop: number;
  };
  colors: {
    background: string;
    line: string;
    title: string;
    headerLabel: string;
    cursor: string;
    diamond: string;
    circle: string;
    thinking: string;
    panel: string;
  };
};

type DerivedGeometry = {
  header: Rect;
  junction: Point;
  leftHit: Point;
  branchStart: Point;
  branchEnd: Point;
  diamondCenter: Point;
  diamondHalfDiag: number;
  circleCenter: Point;
  circleRadius: number;
  panel: Rect;
  titlePos: Point;
  thinkingPos: Point;
  cursorPos: Point;
};

const SPEC: CompositionSpec = {
  reference: {
    width: 1600,
    height: 1000,
  },
  layout: {
    scale: 1.0,
    rightGutterRatio: 0.14,
    minRightGutter: 24,
    maxRightGutter: 220,
  },
  ratios: {
    headerWidth: 0.334375,
    headerHeight: 0.136,
    branchStartX: 0.105625,
    diamondCenterX: 0.19125,
    diamondCenterY: 0.427,
    diamondHalfDiag: 0.0858,
    circleRadius: 0.0375,
    panelOffsetXFromCircleLeft: 0.05125,
    panelOffsetYFromCircleBottom: 0.073,
    panelWidth: 0.15625,
    panelHeight: 0.136,
    titleX: 0.040625,
    titleY: 0.043,
  },
  text: {
    title: "ETHAN YANG",
    work: "WORK",
    talk: "TALK",
    thinking: "thinking?",
    cursor: "...|",
    titleSize: 70,
    headerTextOffsetY: 6,
    thinkingSize: 39,
    cursorSize: 35,
    thinkingOffsetXFromCircleCenter: -20,
    thinkingOffsetYFromCircleCenter: 50,
    cursorOffsetXFromPanelLeft: 15,
    cursorOffsetYFromPanelTop: 18,
  },
  colors: {
    background: "#FAF7F3",
    line: "#C6C3BE",
    title: "#3A3530",
    headerLabel: "#B8B8B8",
    cursor: "#8F8A84",
    diamond: "#CFA39C",
    circle: "#8A99B7",
    thinking: "#B8B8B8",
    panel: "#EEEEEE",
  },
};

const svgNs = "http://www.w3.org/2000/svg";

function toPx(value: number): number {
  return Math.round(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Composition constraint failed: ${message}`);
  }
}

function deriveGeometry(spec: CompositionSpec): DerivedGeometry {
  const { width, height } = spec.reference;

  const header: Rect = {
    x: 0,
    y: 0,
    width: toPx(width * spec.ratios.headerWidth),
    height: toPx(height * spec.ratios.headerHeight),
  };

  const junction: Point = { x: header.width, y: header.height };

  const diagonalConst = junction.x + junction.y;
  const leftHit: Point = { x: 0, y: diagonalConst };

  const branchStartX = toPx(width * spec.ratios.branchStartX);
  const branchStart: Point = { x: branchStartX, y: diagonalConst - branchStartX };

  const branchIntercept = branchStart.y - branchStart.x;
  const branchEnd: Point = { x: height - branchIntercept, y: height };

  const diamondCenter: Point = {
    x: toPx(width * spec.ratios.diamondCenterX),
    y: toPx(height * spec.ratios.diamondCenterY),
  };
  const diamondHalfDiag = toPx(width * spec.ratios.diamondHalfDiag);

  const circleRadius = toPx(width * spec.ratios.circleRadius);
  const circleCenter: Point = {
    x: branchStart.x,
    y: leftHit.y + circleRadius,
  };

  const panel: Rect = {
    x:
      circleCenter.x -
      circleRadius +
      toPx(width * spec.ratios.panelOffsetXFromCircleLeft),
    y:
      circleCenter.y +
      circleRadius +
      toPx(height * spec.ratios.panelOffsetYFromCircleBottom),
    width: toPx(width * spec.ratios.panelWidth),
    height: toPx(height * spec.ratios.panelHeight),
  };

  const titlePos: Point = {
    x: toPx(width * spec.ratios.titleX),
    y: toPx(height * spec.ratios.titleY),
  };

  const thinkingPos: Point = {
    x: circleCenter.x + spec.text.thinkingOffsetXFromCircleCenter,
    y: circleCenter.y + spec.text.thinkingOffsetYFromCircleCenter,
  };

  const cursorPos: Point = {
    x: panel.x + spec.text.cursorOffsetXFromPanelLeft,
    y: panel.y + spec.text.cursorOffsetYFromPanelTop,
  };

  return {
    header,
    junction,
    leftHit,
    branchStart,
    branchEnd,
    diamondCenter,
    diamondHalfDiag,
    circleCenter,
    circleRadius,
    panel,
    titlePos,
    thinkingPos,
    cursorPos,
  };
}

function deriveContentBounds(g: DerivedGeometry): Bounds {
  const maxX = Math.max(
    g.header.width,
    g.branchEnd.x,
    g.diamondCenter.x + g.diamondHalfDiag,
    g.circleCenter.x + g.circleRadius,
    g.panel.x + g.panel.width,
  );
  const maxY = Math.max(
    g.branchEnd.y,
    g.circleCenter.y + g.circleRadius,
    g.panel.y + g.panel.height,
  );

  return {
    minX: 0,
    minY: 0,
    maxX,
    maxY,
    width: maxX,
    height: maxY,
  };
}

function deriveLayoutFrame(
  spec: CompositionSpec,
  viewport: Size,
  bounds: Bounds,
  geometry: DerivedGeometry,
): LayoutFrame {
  const rightGutter = clamp(
    viewport.width * spec.layout.rightGutterRatio,
    spec.layout.minRightGutter,
    spec.layout.maxRightGutter,
  );
  const fitScaleX = Math.max(1, viewport.width - rightGutter) / bounds.width;
  const endpointScaleY = viewport.height / geometry.branchEnd.y;
  const scale = Math.min(fitScaleX, endpointScaleY) * spec.layout.scale;

  return {
    viewport,
    scale,
  };
}

function validateConstraints(
  spec: CompositionSpec,
  g: DerivedGeometry,
  bounds: Bounds,
): void {
  const { width, height } = spec.reference;
  const panelBottom = g.panel.y + g.panel.height;

  assert(g.junction.x === g.header.width, "junction.x must equal header.width");
  assert(g.junction.y === g.header.height, "junction.y must equal header.height");

  const mainDiagConst = g.junction.x + g.junction.y;
  assert(g.leftHit.y === mainDiagConst, "main diagonal must hit left edge at x+y constant");
  assert(
    g.branchStart.x + g.branchStart.y === mainDiagConst,
    "branch start must lie on main diagonal",
  );

  assert(
    g.leftHit.y - g.junction.y === g.junction.x - g.leftHit.x,
    "main diagonal must be 45 degrees down-left",
  );

  assert(g.branchEnd.y === height, "branch must end on reference bottom edge");
  assert(
    g.branchEnd.y - g.branchStart.y === g.branchEnd.x - g.branchStart.x,
    "branch diagonal must be 45 degrees down-right",
  );

  assert(g.circleCenter.x === g.branchStart.x, "circle center x aligns with branch start x");
  assert(
    g.circleCenter.y - g.circleRadius === g.leftHit.y,
    "circle top aligns with main diagonal left intercept",
  );
  assert(panelBottom === g.branchEnd.y, "panel bottom must align with branch endpoint");
  assert(bounds.maxY === g.branchEnd.y, "branch endpoint must be the visual bottom");

  assert(bounds.maxX <= toPx(width * 0.42), "active cluster must stay in left ~42% of reference");
}

function getViewport(svg: SVGSVGElement): Size {
  return {
    width: Math.max(1, Math.round(svg.clientWidth)),
    height: Math.max(1, Math.round(svg.clientHeight)),
  };
}

function createSvgElement<T extends keyof SVGElementTagNameMap>(
  tag: T,
  attrs: Record<string, string | number>,
): SVGElementTagNameMap[T] {
  const node = document.createElementNS(svgNs, tag);
  Object.entries(attrs).forEach(([key, value]) => {
    node.setAttribute(key, String(value));
  });
  return node;
}

function render(spec: CompositionSpec, svg: SVGSVGElement): void {
  const geometry = deriveGeometry(spec);
  const bounds = deriveContentBounds(geometry);
  validateConstraints(spec, geometry, bounds);

  const frame = deriveLayoutFrame(spec, getViewport(svg), bounds, geometry);
  const strokeWidth = clamp(frame.scale * 1.2, 1, 1.6);

  svg.setAttribute("viewBox", `0 0 ${frame.viewport.width} ${frame.viewport.height}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.replaceChildren();

  const background = createSvgElement("rect", {
    x: 0,
    y: 0,
    width: frame.viewport.width,
    height: frame.viewport.height,
    fill: spec.colors.background,
  });

  const horizontalLine = createSvgElement("line", {
    x1: 0,
    y1: geometry.junction.y * frame.scale,
    x2: frame.viewport.width,
    y2: geometry.junction.y * frame.scale,
    stroke: spec.colors.line,
    "stroke-width": strokeWidth,
    "vector-effect": "non-scaling-stroke",
  });

  const headerHeight = geometry.header.height * frame.scale;
  const headerWidth = geometry.header.width * frame.scale;
  const headerSectionWidth = headerWidth / 2;
  const headerLabelPadXRatio = geometry.titlePos.x / geometry.header.width;
  const headerLabelXOffset = headerSectionWidth * headerLabelPadXRatio;
  const headerLabelY = headerHeight / 2 + spec.text.headerTextOffsetY * frame.scale;
  const headerLabelSize = spec.text.titleSize * frame.scale;

  const headerOverlay = createSvgElement("g", {
    stroke: spec.colors.line,
    "stroke-width": strokeWidth,
    fill: "none",
  });

  const headerSections = [
    {
      label: spec.text.work,
      x: frame.viewport.width - headerSectionWidth * 2,
    },
    {
      label: spec.text.talk,
      x: frame.viewport.width - headerSectionWidth,
    },
  ];

  headerSections.forEach(({ label, x }) => {
    headerOverlay.append(
      createSvgElement("line", {
        x1: x,
        y1: 0,
        x2: x,
        y2: headerHeight,
        "vector-effect": "non-scaling-stroke",
      }),
    );

    const headerLabel = createSvgElement("text", {
      x: x + headerLabelXOffset,
      y: headerLabelY,
      fill: spec.colors.headerLabel,
      "font-family": "'Space Grotesk', 'Helvetica Neue', Arial, sans-serif",
      "font-size": headerLabelSize,
      "font-weight": 700,
      "dominant-baseline": "middle",
      stroke: "none",
    });
    headerLabel.textContent = label;

    headerOverlay.append(headerLabel);
  });

  const contentGroup = createSvgElement("g", {
    transform: `scale(${frame.scale})`,
  });

  const structureGroup = createSvgElement("g", {
    stroke: spec.colors.line,
    "stroke-width": strokeWidth,
    fill: "none",
  });

  const structuralLines: Array<[Point, Point]> = [
    [{ x: geometry.junction.x, y: 0 }, geometry.junction],
    [geometry.junction, geometry.leftHit],
    [geometry.branchStart, geometry.branchEnd],
  ];

  structuralLines.forEach(([start, end]) => {
    structureGroup.append(
      createSvgElement("line", {
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
        "vector-effect": "non-scaling-stroke",
      }),
    );
  });

  const title = createSvgElement("text", {
    x: geometry.titlePos.x,
    y: geometry.header.height / 2 + spec.text.headerTextOffsetY,
    fill: spec.colors.title,
    "font-family": "'Space Grotesk', 'Helvetica Neue', Arial, sans-serif",
    "font-size": spec.text.titleSize,
    "font-weight": 700,
    "dominant-baseline": "middle",
  });
  title.textContent = spec.text.title;

  const diamondPoints = [
    `${geometry.diamondCenter.x},${geometry.diamondCenter.y - geometry.diamondHalfDiag}`,
    `${geometry.diamondCenter.x + geometry.diamondHalfDiag},${geometry.diamondCenter.y}`,
    `${geometry.diamondCenter.x},${geometry.diamondCenter.y + geometry.diamondHalfDiag}`,
    `${geometry.diamondCenter.x - geometry.diamondHalfDiag},${geometry.diamondCenter.y}`,
  ].join(" ");

  const diamond = createSvgElement("polygon", {
    points: diamondPoints,
    fill: spec.colors.diamond,
  });

  const circle = createSvgElement("circle", {
    cx: geometry.circleCenter.x,
    cy: geometry.circleCenter.y,
    r: geometry.circleRadius,
    fill: spec.colors.circle,
  });

  const thinking = createSvgElement("text", {
    x: geometry.thinkingPos.x,
    y: geometry.thinkingPos.y,
    fill: spec.colors.thinking,
    "font-family": "'Cormorant Garamond', Georgia, serif",
    "font-size": spec.text.thinkingSize,
    "font-weight": 500,
  });
  thinking.textContent = spec.text.thinking;

  const panel = createSvgElement("rect", {
    x: geometry.panel.x,
    y: geometry.panel.y,
    width: geometry.panel.width,
    height: geometry.panel.height,
    fill: spec.colors.panel,
  });

  const cursor = createSvgElement("text", {
    x: geometry.cursorPos.x,
    y: geometry.cursorPos.y,
    fill: spec.colors.cursor,
    "font-family": "'Space Grotesk', 'Helvetica Neue', Arial, sans-serif",
    "font-size": spec.text.cursorSize,
    "font-weight": 400,
    "dominant-baseline": "hanging",
  });
  cursor.textContent = spec.text.cursor;

  contentGroup.append(structureGroup, title, diamond, circle, thinking, panel, cursor);

  svg.append(background, headerOverlay, horizontalLine, contentGroup);
}

function mount(spec: CompositionSpec): void {
  const svg = document.getElementById("composition") as SVGSVGElement | null;
  if (!svg) {
    throw new Error("Missing #composition svg root");
  }

  const host = globalThis;
  let frameId: number | null = null;

  const scheduleRender = (): void => {
    if (frameId !== null) {
      return;
    }

    frameId = host.requestAnimationFrame(() => {
      frameId = null;
      render(spec, svg);
    });
  };

  scheduleRender();

  const observer = new ResizeObserver(() => {
    scheduleRender();
  });
  observer.observe(svg);
}

mount(SPEC);
