export const DEV_PASSWORD = "Password123!";

export const DEV_USERS = [
  {
    id: "66a000000000000000000101",
    email: "owner.one@example.com",
    name: "Owner One",
    contactEmail: "owner.one@example.com",
    contactPhone: "320-555-0101",
  },
  {
    id: "66a000000000000000000102",
    email: "owner.two@example.com",
    name: "Owner Two",
    contactEmail: "owner.two@example.com",
    contactPhone: "320-555-0102",
  },
  {
    id: "66a000000000000000000103",
    email: "renter.one@example.com",
    name: "Renter One",
    contactEmail: "renter.one@example.com",
    contactPhone: "320-555-0103",
  },
];

export const DEV_LISTINGS = [
  {
    id: "66a000000000000000000201",
    ownerId: DEV_USERS[0].id,
    title: "Seeded studio near campus",
    type: "APARTMENT",
    status: "ACTIVE",
    description:
      "Compact studio with quiet study space, fast internet, and a short walk to campus.",
    rent: 925,
    deposit: 925,
    utilitiesIncluded: false,
    availableFrom: new Date("2026-06-01T00:00:00.000Z"),
    leaseDuration: "12 months",
    address: "410 5th Ave S, Saint Cloud, MN",
    distanceToCampus: "0.4 miles",
    contactEmail: DEV_USERS[0].contactEmail,
    contactPhone: DEV_USERS[0].contactPhone,
    bedrooms: 0,
    bathrooms: 1,
    petPolicy: "CATS_ONLY",
    amenities: ["Laundry", "Parking", "High-speed internet"],
    imageUrls: [],
  },
  {
    id: "66a000000000000000000202",
    ownerId: DEV_USERS[0].id,
    title: "Seeded private room in shared house",
    type: "ROOM",
    status: "ACTIVE",
    description:
      "Private room in a shared house with two roommates, in-unit laundry, and flexible move-in.",
    rent: 650,
    deposit: 500,
    utilitiesIncluded: true,
    availableFrom: new Date("2026-07-01T00:00:00.000Z"),
    leaseDuration: "Academic year",
    address: "720 4th Ave S, Saint Cloud, MN",
    distanceToCampus: "0.2 miles",
    contactEmail: DEV_USERS[0].contactEmail,
    contactPhone: DEV_USERS[0].contactPhone,
    bedrooms: 1,
    bathrooms: 1,
    petPolicy: "NO_PETS",
    amenities: ["Utilities included", "Laundry", "Furnished"],
    imageUrls: [],
  },
  {
    id: "66a000000000000000000203",
    ownerId: DEV_USERS[1].id,
    title: "Seeded two bedroom by downtown",
    type: "APARTMENT",
    status: "ACTIVE",
    description:
      "Two bedroom apartment close to downtown routes with parking and a larger kitchen.",
    rent: 1350,
    deposit: 1000,
    utilitiesIncluded: false,
    availableFrom: new Date("2026-08-15T00:00:00.000Z"),
    leaseDuration: "12 months",
    address: "120 7th Ave N, Saint Cloud, MN",
    distanceToCampus: "1.1 miles",
    contactEmail: DEV_USERS[1].contactEmail,
    contactPhone: DEV_USERS[1].contactPhone,
    bedrooms: 2,
    bathrooms: 1,
    petPolicy: "PETS_ALLOWED",
    amenities: ["Parking", "Dishwasher", "Pet friendly"],
    imageUrls: [],
  },
  {
    id: "66a000000000000000000204",
    ownerId: DEV_USERS[1].id,
    title: "Seeded roommate lead for fall",
    type: "ROOMMATE",
    status: "ACTIVE",
    description:
      "Looking for one roommate to join a fall lease near bus routes and campus.",
    rent: 575,
    deposit: null,
    utilitiesIncluded: true,
    availableFrom: new Date("2026-08-01T00:00:00.000Z"),
    leaseDuration: "Fall and spring semesters",
    address: null,
    distanceToCampus: "0.8 miles",
    contactEmail: DEV_USERS[1].contactEmail,
    contactPhone: DEV_USERS[1].contactPhone,
    bedrooms: 1,
    bathrooms: 1,
    petPolicy: "UNKNOWN",
    amenities: ["Bus route", "Utilities included"],
    imageUrls: [],
  },
];

export const DEV_REVIEWS = [
  {
    id: "66a000000000000000000301",
    listingId: DEV_LISTINGS[0].id,
    authorId: DEV_USERS[2].id,
    body: "Clean unit and the owner responded quickly to questions.",
    rating: 5,
  },
  {
    id: "66a000000000000000000302",
    listingId: DEV_LISTINGS[1].id,
    authorId: DEV_USERS[2].id,
    body: "Good option if you want utilities included and a short walk.",
    rating: 4,
  },
  {
    id: "66a000000000000000000303",
    listingId: DEV_LISTINGS[2].id,
    authorId: DEV_USERS[0].id,
    body: "Parking is useful here, especially in winter.",
    rating: 4,
  },
  {
    id: "66a000000000000000000304",
    listingId: DEV_LISTINGS[3].id,
    authorId: DEV_USERS[2].id,
    body: "The roommate expectations were clear in the listing.",
    rating: null,
  },
];

function userWriteData(user, passwordHash) {
  return {
    email: user.email,
    name: user.name,
    contactEmail: user.contactEmail,
    contactPhone: user.contactPhone,
    passwordHash,
  };
}

function listingWriteData(listing) {
  return {
    title: listing.title,
    type: listing.type,
    status: listing.status,
    description: listing.description,
    rent: listing.rent,
    deposit: listing.deposit,
    utilitiesIncluded: listing.utilitiesIncluded,
    availableFrom: listing.availableFrom,
    leaseDuration: listing.leaseDuration,
    address: listing.address,
    distanceToCampus: listing.distanceToCampus,
    contactEmail: listing.contactEmail,
    contactPhone: listing.contactPhone,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    petPolicy: listing.petPolicy,
    amenities: listing.amenities,
    imageUrls: listing.imageUrls,
    owner: {
      connect: {
        id: listing.ownerId,
      },
    },
  };
}

function reviewWriteData(review) {
  return {
    body: review.body,
    rating: review.rating,
    listing: {
      connect: {
        id: review.listingId,
      },
    },
    author: {
      connect: {
        id: review.authorId,
      },
    },
  };
}

export async function seedDevData({ prisma, hashPassword }) {
  for (const user of DEV_USERS) {
    const passwordHash = await hashPassword(DEV_PASSWORD);
    const writeData = userWriteData(user, passwordHash);

    await prisma.user.upsert({
      where: {
        id: user.id,
      },
      create: {
        id: user.id,
        ...writeData,
      },
      update: writeData,
    });
  }

  for (const listing of DEV_LISTINGS) {
    const writeData = listingWriteData(listing);

    await prisma.listing.upsert({
      where: {
        id: listing.id,
      },
      create: {
        id: listing.id,
        ...writeData,
      },
      update: writeData,
    });
  }

  for (const review of DEV_REVIEWS) {
    const writeData = reviewWriteData(review);

    await prisma.review.upsert({
      where: {
        id: review.id,
      },
      create: {
        id: review.id,
        ...writeData,
      },
      update: writeData,
    });
  }

  return {
    users: DEV_USERS.length,
    listings: DEV_LISTINGS.length,
    reviews: DEV_REVIEWS.length,
  };
}
