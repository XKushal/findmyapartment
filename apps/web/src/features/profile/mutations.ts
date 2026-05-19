import { type ProfileUpdateInput } from "@/features/profile/schemas";
import { prisma } from "@/server/db/prisma";

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export async function updateProfileUser(userId: string, input: ProfileUpdateInput) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: input,
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
