import { ListingStatus, type Prisma } from "@prisma/client";

import { type ListingQueryInput } from "@/features/listings/schemas";
import { prisma } from "@/server/db/prisma";

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

function availableByDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function toActiveListingWhere(filters: ListingQueryInput = {}) {
  const where: Prisma.ListingWhereInput = {
    status: ListingStatus.ACTIVE,
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.rentMin !== undefined || filters.rentMax !== undefined
      ? {
          rent: {
            ...(filters.rentMin !== undefined ? { gte: filters.rentMin } : {}),
            ...(filters.rentMax !== undefined ? { lte: filters.rentMax } : {}),
          },
        }
      : {}),
    ...(filters.bedroomsMin !== undefined
      ? {
          bedrooms: {
            gte: filters.bedroomsMin,
          },
        }
      : {}),
    ...(filters.bathroomsMin !== undefined
      ? {
          bathrooms: {
            gte: filters.bathroomsMin,
          },
        }
      : {}),
    ...(filters.petPolicy ? { petPolicy: filters.petPolicy } : {}),
    ...(filters.availableBy
      ? {
          OR: [
            {
              availableFrom: null,
            },
            {
              availableFrom: {
                lte: availableByDate(filters.availableBy),
              },
            },
          ],
        }
      : {}),
  };

  return where;
}

export async function getActiveListings(filters: ListingQueryInput = {}) {
  if (!hasDatabaseUrl()) {
    return [];
  }

  return prisma.listing.findMany({
    where: toActiveListingWhere(filters),
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getListingsByOwner(ownerId: string) {
  if (!hasDatabaseUrl()) {
    return [];
  }

  return prisma.listing.findMany({
    where: {
      ownerId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getListingById(id: string) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  return prisma.listing.findFirst({
    where: {
      id,
      status: ListingStatus.ACTIVE,
    },
  });
}
