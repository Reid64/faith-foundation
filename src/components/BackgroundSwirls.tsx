type Variant =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "diagonal";

// Three overlapping arcs per variant form a soft broad band of color
// (a blurred-band effect without any CSS blur), drawn in a 1440x900 space
// that is scaled to cover the parent section.
const PATHS: Record<Variant, string[]> = {
  "top-left": [
    "M -200 100 C 200 -100 700 200 1200 500",
    "M -200 200 C 200 0 700 300 1200 600",
    "M -200 300 C 200 100 700 400 1200 700",
  ],
  "top-right": [
    "M 1640 100 C 1240 -100 740 200 240 500",
    "M 1640 200 C 1240 0 740 300 240 600",
    "M 1640 300 C 1240 100 740 400 240 700",
  ],
  "bottom-left": [
    "M -200 800 C 300 700 700 500 1400 200",
    "M -200 700 C 300 600 700 400 1400 100",
    "M -200 900 C 300 800 700 600 1400 300",
  ],
  "bottom-right": [
    "M 1640 800 C 1140 700 740 500 40 200",
    "M 1640 700 C 1140 600 740 400 40 100",
    "M 1640 900 C 1140 800 740 600 40 300",
  ],
  diagonal: [
    "M -200 -50 C 400 300 900 500 1640 900",
    "M -200 100 C 400 450 900 650 1640 1050",
    "M -200 -200 C 400 150 900 350 1640 750",
  ],
};

export default function BackgroundSwirls({
  variant = "top-left",
  color = "#255527",
  opacity = 0.22,
}: {
  variant?: Variant;
  color?: string;
  opacity?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
        pointerEvents: "none",
        zIndex: 0,
        opacity,
      }}
    >
      {PATHS[variant].map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={300}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
