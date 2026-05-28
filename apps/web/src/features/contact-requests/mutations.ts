import { forbidden, listingNotFound } from "@/server/api/errors";
import { prisma } from "@/server/db/prisma";

import { type ContactRequestCreateInput } from "./schemas";

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

const contactRequestInclude = {
  listing: {
    select: {
      title: true,
    },
  },
  requester: {
    select: {
      name: true,
      email: true,
    },
  },
  owner: {
    select: {
      name: true,
      email: true,
    },
  },
};

export async function createContactRequest(
  listingId: string,
  requesterId: string,
  input: ContactRequestCreateInput,
) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const listing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },
    select: {
      id: true,
      ownerId: true,
    },
  });

  if (!listing?.ownerId) {
    throw listingNotFound(listingId);
  }

  if (listing.ownerId === requesterId) {
    throw forbidden("Owners cannot contact themselves about their own listing.");
  }

  return prisma.contactRequest.create({
    data: {
      message: input.message,
      preferredContactMethod: input.preferredContactMethod,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      listing: {
        connect: {
          id: listingId,
        },
      },
      requester: {
        connect: {
          id: requesterId,
        },
      },
      owner: {
        connect: {
          id: listing.ownerId,
        },
      },
    },
    include: contactRequestInclude,
  });
}
