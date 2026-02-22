import { prisma } from "@/lib/prisma";

export interface SiteMode {
  readOnly: boolean;
  maintenance: boolean;
}

/**
 * Fetch current site mode flags from SiteSetting table.
 * Returns { readOnly: false, maintenance: false } if no rows exist.
 */
export async function getSiteMode(): Promise<SiteMode> {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: ["readOnlyMode", "maintenanceMode"] } },
  });
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    readOnly: map.get("readOnlyMode") === "true",
    maintenance: map.get("maintenanceMode") === "true",
  };
}
