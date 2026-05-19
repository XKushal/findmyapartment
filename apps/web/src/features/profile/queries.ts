import { prisma } from "@/server/db/prisma";

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export type ProfileUser = {
  id: string;
  email: string;
  name: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: Date;
};

export async function getProfileUser(userId: string): Promise<ProfileUser | null> {
  if (!hasDatabaseUrl()) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      contactEmail: true,
      contactPhone: true,
      createdAt: true,
    },
  });
}
