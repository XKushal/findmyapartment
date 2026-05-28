import { prisma } from "@/server/db/prisma";

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

export async function getReceivedContactRequestsByOwner(ownerId: string) {
  if (!hasDatabaseUrl()) {
    return [];
  }

  return prisma.contactRequest.findMany({
    where: {
      ownerId,
    },
    include: contactRequestInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getSentContactRequestsByRequester(requesterId: string) {
  if (!hasDatabaseUrl()) {
    return [];
  }

  return prisma.contactRequest.findMany({
    where: {
      requesterId,
    },
    include: contactRequestInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
}
