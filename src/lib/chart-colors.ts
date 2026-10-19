export const CHART = {
  primary: "#6b24d1",
  primarySoft: "#efe6fb",
  accent: "#e08a3c",
  whatsapp: "#25d366",
  pending: "#b8860f",
  enrolled: "#1a8f4c",
  notJoining: "#c0362c",
  muted: "#6b6478",
  grid: "#e7ddcd",
};

export const CATEGORICAL = [
  "#6b24d1",
  "#e08a3c",
  "#1a8f4c",
  "#c0362c",
  "#2f6f95",
  "#b8860f",
  "#9b4f96",
  "#25d366",
  "#a8763e",
  "#4f5fad",
  "#c26b8a",
  "#3f8f7c",
  "#8a5a2a",
  "#5c7a29",
  "#946bd1",
  "#d1876b",
];

export function colorFor(index: number): string {
  return CATEGORICAL[index % CATEGORICAL.length];
}
