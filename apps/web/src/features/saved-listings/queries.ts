import { ListingStatus } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getSavedListingIdsByUser(userId: string) {
  if (!hasDatabaseUrl()) {
    return [];
  }

  const savedListings = await prisma.savedListing.findMany({
    where: {
      userId,
    },
    select: {
      listingId: true,
    },
  });

  return savedListings.map((savedListing) => savedListing.listingId);
}

export async function getSavedListingsByUser(userId: string) {
  if (!hasDatabaseUrl()) {
    return [];
  }

  const savedListings = await prisma.savedListing.findMany({
    where: {
      userId,
      listing: {
        status: ListingStatus.ACTIVE,
      },
    },
    include: {
      listing: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return savedListings.map((savedListing) => savedListing.listing);
}
