export type DefectKind = "crack" | "damp" | "noise" | "finish" | "light" | "other";

export type DefectPin = {
  id: string;
  spaceId: string;
  x: number; // 0–100 %
  y: number;
  kind: DefectKind;
  note: string;
  createdAt: string;
};

export type InspectionReport = {
  slug: string;
  title: string;
  pins: DefectPin[];
  checkedSpaces: string[];
  updatedAt: string;
};

const key = (slug: string) => `nivaas-inspect:${slug}`;

export function loadReport(slug: string): InspectionReport | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key(slug));
    return raw ? (JSON.parse(raw) as InspectionReport) : null;
  } catch {
    return null;
  }
}

export function saveReport(report: InspectionReport) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    key(report.slug),
    JSON.stringify({ ...report, updatedAt: new Date().toISOString() })
  );
}

export const defectLabels: Record<DefectKind, string> = {
  crack: "Crack / structural",
  damp: "Damp / leak",
  noise: "Noise",
  finish: "Finish quality",
  light: "Light / ventilation",
  other: "Other note",
};

export const defectColors: Record<DefectKind, string> = {
  crack: "#e07a5f",
  damp: "#4a9ebd",
  noise: "#d4b06a",
  finish: "#9b8cff",
  light: "#7dce82",
  other: "#a0a8a4",
};
