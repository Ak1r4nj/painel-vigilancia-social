import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function setupTestDb(prisma: PrismaClient) {
  const passwordHash = await bcrypt.hash('painel@2024', 4);
  await prisma.technician.upsert({
    where: { email: 'tecnico@prefeitura.rio' },
    update: {},
    create: { email: 'tecnico@prefeitura.rio', passwordHash },
  });

  await prisma.child.upsert({
    where: { id: 'child-test-001' },
    update: {},
    create: {
      id: 'child-test-001',
      fullName: 'Criança Teste Um',
      birthDate: new Date('2015-06-15'),
      neighborhood: 'Maré',
    },
  });

  await prisma.healthRecord.upsert({
    where: { childId: 'child-test-001' },
    update: {},
    create: {
      childId: 'child-test-001',
      lastVisit: new Date('2023-01-01'),
      vaccinesUpToDate: false,
      alerts: JSON.stringify(['Vacinas em atraso']),
    },
  });

  await prisma.child.upsert({
    where: { id: 'child-test-002' },
    update: {},
    create: {
      id: 'child-test-002',
      fullName: 'Criança Sem Dados',
      birthDate: new Date('2016-03-20'),
      neighborhood: 'Rocinha',
    },
  });
}
