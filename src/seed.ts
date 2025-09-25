import { prisma } from "@/lib/prisma";

async function seed() {
  // Clear existing data
  await prisma.user.deleteMany();

  // Create users
  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice',
      password: "defaultpassword", // In a real app, ensure to hash passwords and handle securely
      profile: {
        create: {
          firstName: 'Alice',
          lastName: 'Wonderland',
          bio: 'Curious and adventurous'
        }
      }
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob',
      password: "defaultpassword", // In a real app, ensure to hash passwords and handle securely
      profile: {
        create: {
          firstName: 'Bob',
          lastName: 'Builder',
          bio: 'Can we fix it? Yes, we can!'
        }
      }
    },
  });

  console.log('Seed data created:', { alice, bob });
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
