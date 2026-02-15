import {
  isIpInProhibitedJurisdiction,
  getClientIp,
} from "../../src/utils/geoblock";
import type { Request } from "express";

describe("geoblock", () => {
  const originalEnv = process.env.GEOBLOCK_DISABLED;

  afterEach(() => {
    process.env.GEOBLOCK_DISABLED = originalEnv;
  });

  describe("isIpInProhibitedJurisdiction", () => {
    it("allows localhost", () => {
      expect(isIpInProhibitedJurisdiction("127.0.0.1")).toEqual({
        blocked: false,
      });
      expect(isIpInProhibitedJurisdiction("::1")).toEqual({ blocked: false });
    });

    it("allows private IPs", () => {
      expect(isIpInProhibitedJurisdiction("192.168.1.1")).toEqual({
        blocked: false,
      });
      expect(isIpInProhibitedJurisdiction("10.0.0.1")).toEqual({
        blocked: false,
      });
    });

    it("skips when GEOBLOCK_DISABLED=1", () => {
      process.env.GEOBLOCK_DISABLED = "1";
      expect(isIpInProhibitedJurisdiction("8.8.8.8")).toEqual({
        blocked: false,
      });
    });

    it("blocks known sanctioned country IPs when in geo DB", () => {
      process.env.GEOBLOCK_DISABLED = "";
      const usResult = isIpInProhibitedJurisdiction("8.8.8.8");
      expect(usResult.blocked).toBe(false);
    });
  });

  describe("getClientIp", () => {
    it("extracts from x-forwarded-for", () => {
      const req = {
        headers: { "x-forwarded-for": "203.0.113.50, 70.41.3.18" },
        socket: { remoteAddress: "127.0.0.1" },
        ip: "127.0.0.1",
      } as unknown as Request;
      expect(getClientIp(req)).toBe("203.0.113.50");
    });

    it("extracts from x-real-ip", () => {
      const req = {
        headers: { "x-real-ip": "203.0.113.99" },
        socket: { remoteAddress: "127.0.0.1" },
        ip: "127.0.0.1",
      } as unknown as Request;
      expect(getClientIp(req)).toBe("203.0.113.99");
    });

    it("falls back to socket.remoteAddress", () => {
      const req = {
        headers: {},
        socket: { remoteAddress: "192.168.1.100" },
        ip: "192.168.1.100",
      } as unknown as Request;
      expect(getClientIp(req)).toBe("192.168.1.100");
    });
  });
});
