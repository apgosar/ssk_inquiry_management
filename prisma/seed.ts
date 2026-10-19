import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CENTRES = [
  "Borivali - Malad",
  "Matunga - Dadar",
  "Opera House",
  "Mulund",
  "Ghatkopar",
  "Santacruz",
  "Ahmedabad",
  "Surat",
  "Vadodara",
  "Pune",
  "Chennai",
  "Bangalore",
  "Bhavnagar",
  "Hyderabad",
  "US-Canada",
  "Online",
];

const COORDINATORS = [
  "Ejal",
  "Jinali",
  "Sneha",
  "Nilsha",
  "Shraddha",
  "Amisha",
  "Dharti",
];

const REASONS = [
  "Pregnancy loss",
  "Family constraints / not approved by family",
  "Cost concerns (early pregnancy)",
  "Cost concerns (advanced pregnancy stage)",
  "Religious factor - non-Jain",
  "Extensive course - don't have time",
  "Found a local offline option",
  "Others - unspecified reason",
];

async function main() {
  // Safe to run on every deploy: lists are only seeded into empty tables, so renames,
  // deactivations and additions made in the admin screens are never overwritten.
  if ((await prisma.centre.count()) === 0) {
    for (const [i, name] of CENTRES.entries()) {
      await prisma.centre.create({ data: { name, sortOrder: i } });
    }
    console.log("Seeded centres.");
  }

  if ((await prisma.coordinator.count()) === 0) {
    for (const [i, name] of COORDINATORS.entries()) {
      await prisma.coordinator.create({ data: { name, sortOrder: i } });
    }
    console.log("Seeded coordinators.");
  }

  if ((await prisma.reasonNotJoining.count()) === 0) {
    for (const [i, label] of REASONS.entries()) {
      await prisma.reasonNotJoining.create({ data: { label, sortOrder: i } });
    }
    console.log("Seeded reasons.");
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword && (await prisma.user.count({ where: { role: Role.ADMIN } })) === 0) {
    await prisma.user.create({
      data: {
        name: process.env.ADMIN_NAME || "Admin",
        email: adminEmail.trim().toLowerCase(),
        passwordHash: await bcrypt.hash(adminPassword, 10),
        role: Role.ADMIN,
      },
    });
    console.log("Created admin account: " + adminEmail);
  }

  const demoEmail = process.env.DEMO_COORDINATOR_EMAIL;
  const demoPassword = process.env.DEMO_COORDINATOR_PASSWORD;
  if (demoEmail && demoPassword) {
    const linked = await prisma.coordinator.findFirst({ orderBy: { sortOrder: "asc" } });
    await prisma.user.upsert({
      where: { email: demoEmail.trim().toLowerCase() },
      update: {},
      create: {
        name: process.env.DEMO_COORDINATOR_NAME || "Demo Coordinator",
        email: demoEmail.trim().toLowerCase(),
        passwordHash: await bcrypt.hash(demoPassword, 10),
        role: Role.COORDINATOR,
        coordinatorId: linked?.id,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
