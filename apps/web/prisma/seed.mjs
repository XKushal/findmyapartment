import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import nextEnv from "@next/env";

import { seedDevData } from "./seed-data.mjs";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

try {
  const result = await seedDevData({
    prisma,
    hashPassword: (password) => bcrypt.hash(password, 10),
  });

  console.log(
    `Seeded dev data: ${result.users} users, ${result.listings} listings, ${result.reviews} reviews, ${result.savedListings} saved listings.`,
  );
} finally {
  await prisma.$disconnect();
}
