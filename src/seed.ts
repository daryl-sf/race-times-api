import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/auth";
const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.create({
    data: {
      name: "City Races Ltd",
      timezone: "Europe/London",
      users: {
        create: [
          {
            email: "admin@cityraces.com",
            role: "ADMIN",
            password: await hashPassword("password"),
            profile: {
              create: {
                firstName: "Admin",
                lastName: "User",
              }
            }
          },
          {
            email: "timer1@cityraces.com",
            role: "OPERATOR",
            password: await hashPassword("password"),
            profile: {
              create: {
                firstName: "Timer 1",
                lastName: "User",
              }
            }
          },
        ],
      },
    },
    include: { users: true },
  });

  const race = await prisma.race.create({
    data: {
      organizationId: org.id,
      name: "City 10K 2025",
      description: "Annual city 10 km run",
      startDate: new Date("2025-05-10T09:00:00Z"),
      timezone: "Europe/London",
      raceType: "MASS",
      checkpoints: {
        create: [
          { code: "START", isStart: true, orderIndex: 1, positionMeters: 0 },
          { code: "K5", orderIndex: 2, positionMeters: 5000 },
          { code: "FINISH", isFinish: true, orderIndex: 3, positionMeters: 10000 },
        ],
      },
    },
    include: { checkpoints: true },
  });

  const participants = await prisma.participant.createMany({
    data: [
      { raceId: race.id, firstName: "Alice", lastName: "Smith", country: "GB" },
      { raceId: race.id, firstName: "Bob", lastName: "Jones", country: "GB" },
      { raceId: race.id, firstName: "Cara", lastName: "Nguyen", country: "US" },
    ],
  });

  const [alice, bob, cara] = await prisma.participant.findMany({
    where: { raceId: race.id },
  });

  await prisma.registration.createMany({
    data: [
      { participantId: alice.id, bib: "101" },
      { participantId: bob.id, bib: "102" },
      { participantId: cara.id, bib: "103" },
    ],
  });

  const start = race.checkpoints.find((c) => c.code === "START")!;
  const finish = race.checkpoints.find((c) => c.code === "FINISH")!;

  const baseTime = new Date("2025-05-10T09:00:00Z").getTime();

  // sample timing events (finish times)
  await prisma.timingEvent.createMany({
    data: [
      {
        raceId: race.id,
        checkpointId: start.id,
        participantId: alice.id,
        timeMs: BigInt(baseTime),
        sequence: BigInt(1),
      },
      {
        raceId: race.id,
        checkpointId: finish.id,
        participantId: alice.id,
        timeMs: BigInt(baseTime + 45 * 60 * 1000),
        elapsedMs: BigInt(45 * 60 * 1000),
        sequence: BigInt(2),
      },
      {
        raceId: race.id,
        checkpointId: finish.id,
        participantId: bob.id,
        timeMs: BigInt(baseTime + 47 * 60 * 1000),
        elapsedMs: BigInt(47 * 60 * 1000),
        sequence: BigInt(3),
      },
    ],
  });

  console.log("Seed completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
