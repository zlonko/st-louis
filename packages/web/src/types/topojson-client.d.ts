declare module 'topojson-client' {
  export function feature(
    topology: { objects: Record<string, object> },
    object: object,
  ): GeoJSON.Feature | GeoJSON.FeatureCollection;

  export function merge(topology: object, objects: object[]): object;
}
