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
  for (const [i, name] of CENTRES.entries()) {
    await prisma.centre.upsert({
      where: { name },
      update: {},
      create: { name, sortOrder: i },
    });
  }

  for (const [i, name] of COORDINATORS.entries()) {
    await prisma.coordinator.upsert({
      where: { name },
      update: {},
      create: { name, sortOrder: i },
    });
  }

  for (const [i, label] of REASONS.entries()) {
    await prisma.reasonNotJoining.upsert({
      where: { label },
      update: {},
      create: { label, sortOrder: i },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        name: process.env.ADMIN_NAME || "Admin",
        email: adminEmail,
        passwordHash,
        role: Role.ADMIN,
      },
    });
    console.log(`Admin account ready: ${adminEmail}`);
  }

  const demoEmail = process.env.DEMO_COORDINATOR_EMAIL;
  const demoPassword = process.env.DEMO_COORDINATOR_PASSWORD;
  if (demoEmail && demoPassword) {
    const passwordHash = await bcrypt.hash(demoPassword, 10);
    const linkedCoordinator = await prisma.coordinator.findUnique({
      where: { name: COORDINATORS[0] },
    });
    await prisma.user.upsert({
      where: { email: demoEmail },
      update: {},
      create: {
        name: process.env.DEMO_COORDINATOR_NAME || "Demo Coordinator",
        email: demoEmail,
        passwordHash,
        role: Role.COORDINATOR,
        coordinatorId: linkedCoordinator?.id,
      },
    });
    console.log(`Demo coordinator account ready: ${demoEmail}`);
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
