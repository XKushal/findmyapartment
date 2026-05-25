import { prisma } from "@/server/db/prisma";

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export async function saveListing(userId: string, listingId: string) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  return prisma.savedListing.upsert({
    where: {
      userId_listingId: {
        userId,
        listingId,
      },
    },
    create: {
      user: {
        connect: {
          id: userId,
        },
      },
      listing: {
        connect: {
          id: listingId,
        },
      },
    },
    update: {},
  });
}

export async function unsaveListing(userId: string, listingId: string) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  await prisma.savedListing.deleteMany({
    where: {
      userId,
      listingId,
    },
  });

  return { saved: false };
}
