import { builder } from "@/schema/builder";

// Simple CSV parser for participant import
function parseParticipantCSV(csvData: string): any[] {
  const lines = csvData.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const participants = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const participant: any = {};

    headers.forEach((header, index) => {
      if (values[index]) {
        participant[header] = values[index];
      }
    });

    participants.push(participant);
  }

  return participants;
}

builder.mutationField("importParticipants", (t) =>
  t.field({
    type: 'Int',
    description: 'Import participants from CSV data. Returns count of imported participants.',
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      csvData: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, { db, currentUser }) => {
      // Verify race belongs to user's organization
      const race = await db.race.findUnique({
        where: { id: args.raceId },
        select: { organizationId: true },
      });

      if (!race) {
        throw new Error("Race not found");
      }

      if (race.organizationId !== currentUser?.organizationId) {
        throw new Error("Not authorized to import participants for this race");
      }

      // Parse CSV
      const participantsData = parseParticipantCSV(args.csvData);
      let importCount = 0;

      for (const data of participantsData) {
        // Create participant
        const participant = await db.participant.create({
          data: {
            raceId: args.raceId,
            firstName: data.firstname || data.first_name || '',
            lastName: data.lastname || data.last_name || '',
            gender: data.gender || null,
            birthYear: data.birthyear ? parseInt(data.birthyear) : null,
            country: data.country || null,
          },
        });

        // Create registration if bib provided
        if (data.bib) {
          await db.registration.create({
            data: {
              participantId: participant.id,
              bib: data.bib,
            },
          });
        }

        importCount++;
      }

      return importCount;
    },
  })
);

builder.mutationField("exportParticipants", (t) =>
  t.field({
    type: 'String',
    description: 'Export participants to CSV format',
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, { db }) => {
      const participants = await db.participant.findMany({
        where: { raceId: args.raceId },
        include: {
          registrations: true,
        },
      });

      // Build CSV
      let csv = 'firstName,lastName,gender,birthYear,country,bib\n';

      for (const participant of participants) {
        const bib = participant.registrations[0]?.bib || '';
        csv += `${participant.firstName},${participant.lastName},${participant.gender || ''},${participant.birthYear || ''},${participant.country || ''},${bib}\n`;
      }

      return csv;
    },
  })
);

builder.mutationField("exportResults", (t) =>
  t.field({
    type: 'String',
    description: 'Export race results to CSV format',
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, { db }) => {
      const results = await db.resultCache.findMany({
        where: { raceId: args.raceId },
        include: {
          participant: true,
          registration: true,
        },
        orderBy: { place: 'asc' },
      });

      // Build CSV
      let csv = 'place,bib,firstName,lastName,category,gunTime,chipTime,netTime\n';

      for (const result of results) {
        const gunTime = result.gunTimeMs ? Number(result.gunTimeMs) / 1000 : '';
        const chipTime = result.chipTimeMs ? Number(result.chipTimeMs) / 1000 : '';
        const netTime = result.netTimeMs ? Number(result.netTimeMs) / 1000 : '';

        csv += `${result.place || ''},${result.registration?.bib || ''},${result.participant.firstName},${result.participant.lastName},${result.category || ''},${gunTime},${chipTime},${netTime}\n`;
      }

      return csv;
    },
  })
);
