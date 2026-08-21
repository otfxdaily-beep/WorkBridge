import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Location is a normalized lookup table (so the platform isn't hardcoded to
 * Abuja), but there's no admin-managed location list yet (that's Stage 17).
 * Until then we find-or-create the row a user types, which keeps the schema
 * normalized without blocking onboarding on seed data.
 */
export async function findOrCreateLocation(input: {
  country: string;
  state: string;
  city: string;
  area?: string | null;
}) {
  const country = input.country.trim();
  const state = input.state.trim();
  const city = input.city.trim();
  const area = input.area?.trim() || null;

  const existing = await prisma.location.findFirst({ where: { country, state, city, area } });
  if (existing) return existing;

  return prisma.location.create({ data: { country, state, city, area } });
}
