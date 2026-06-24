export const VIEWBOX = '-100 0 1350 1900';

export const categories = ['St. Louis City', 'St. Louis County'] as const;

export const NATIONAL_POC_THRESHOLD = 0.4;

export const categories2 = [
  'Below national average (40%)',
  'At or above national average (40%)',
] as const;

export const NATIONAL_BLACK_THRESHOLD = 0.13;

export const categories3 = ['Below national average (13%)', 'At or above national average (13%)'] as const;

export const categoriesXY: Record<string, number[]> = {
  'St. Louis City': [50, 500, 31913, 311273, 53.0, 46.3, 144255, 63.2, 0],
  'St. Louis County': [500, 500, 30100, 998684, 31.2, 23.7, 237047, 79.4, 15],
};

export const margin = { left: 200, top: 80, bottom: 50, right: 20 };
export const width = 1000 - margin.left - margin.right;
export const height = 950 - margin.top - margin.bottom;

export const colors = ['#7158b7', '#ba3f82'];
export const colors2 = ['#b8c4d6', '#073370'];
export const colors3 = ['#b8c4d6', '#073370'];
