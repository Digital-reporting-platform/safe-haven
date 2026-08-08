import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reassignCases() {
  const targetUserId = 'cmocqk4qk0000v6j0gthjbwcm'; // Your user ID
  
  console.log('Reassigning medical cases to user:', targetUserId);
  
  const result = await prisma.caseAssignment.updateMany({
    where: {
      caseType: {
        in: ['MEDICAL_SUPPORT', 'COMBINED_SUPPORT'],
      },
    },
    data: {
      assignedToId: targetUserId,
    },
  });
  
  console.log(`Updated ${result.count} case assignments`);
  
  // Verify the update
  const assignments = await prisma.caseAssignment.findMany({
    where: {
      caseType: {
        in: ['MEDICAL_SUPPORT', 'COMBINED_SUPPORT'],
      },
    },
    select: {
      id: true,
      assignedToId: true,
      reportId: true,
    },
  });
  
  console.log('Current assignments:', assignments);
}

reassignCases()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
