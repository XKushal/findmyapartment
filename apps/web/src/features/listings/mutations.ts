import { ListingStatus, type Prisma } from "@prisma/client";

import {
  type ListingCreateInput,
  type ListingUpdateInput,
  toListingWriteData,
} from "@/features/listings/schemas";
import { forbidden } from "@/server/api/errors";
import { prisma } from "@/server/db/prisma";

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export async function createListing(input: ListingCreateInput, ownerId: string) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  return prisma.listing.create({
    data: {
      ...(toListingWriteData(input) as Prisma.ListingCreateInput),
      owner: {
        connect: {
          id: ownerId,
        },
      },
    },
  });
}

export async function updateListing(
  id: string,
  input: ListingUpdateInput,
  ownerId: string,
) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const existing = await prisma.listing.findFirst({
    where: {
      id,
      status: {
        not: ListingStatus.ARCHIVED,
      },
    },
    select: {
      id: true,
      ownerId: true,
    },
  });

  if (!existing) {
    return null;
  }

  if (existing.ownerId !== ownerId) {
    throw forbidden("Only the listing owner can update this listing.");
  }

  return prisma.listing.update({
    where: { id },
    data: toListingWriteData(input) as Prisma.ListingUpdateInput,
  });
}

export async function archiveListing(id: string, ownerId: string) {
  return updateListing(
    id,
    {
      status: ListingStatus.ARCHIVED,
    },
    ownerId,
  );
}
