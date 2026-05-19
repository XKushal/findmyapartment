import { ListingStatus, ListingType } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getActiveListings(type?: ListingType) {
  if (!hasDatabaseUrl()) {
    return [];
  }

  return prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      ...(type ? { type } : {}),
    },
    orderBy: {
      createdAt: "desc",
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
