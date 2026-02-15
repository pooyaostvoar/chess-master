declare module "geoip-lite" {
  interface Lookup {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
    ll?: [number, number];
    metro?: number;
    range?: [number, number];
  }

  function lookup(ip: string): Lookup | null;
}
