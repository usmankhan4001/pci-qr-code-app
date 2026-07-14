import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "it-team@pcirealestate.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "changeme123!";
  const shouldUpdateAdminPassword = Boolean(process.env.SEED_ADMIN_PASSWORD);

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: shouldUpdateAdminPassword ? { name: "PCI Admin", passwordHash } : {},
    create: {
      email: adminEmail,
      name: "PCI Admin",
      passwordHash,
    },
  });
  console.log(`Seeded admin user: ${admin.email}`);

  await prisma.brandTemplate.upsert({
    where: { id: "pci-default" },
    update: {},
    create: {
      id: "pci-default",
      name: "PCI Default",
      foreground: "#0B2545",
      background: "#FFFFFF",
      dotStyle: "rounded",
      cornerStyle: "extra-rounded",
      isDefault: true,
    },
  });
  console.log("Seeded default PCI brand template");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
