import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const neighborhoods = [
  'Maré', 'Rocinha', 'Complexo do Alemão', 'Jacarezinho', 'Manguinhos',
  'Cidade de Deus', 'Vigário Geral', 'Acari', 'Coelho Neto', 'Parada de Lucas',
];

const schools = [
  'CIEP 101 - Rui Barbosa', 'EM Jorge Amado', 'EM Machado de Assis',
  'CIEP 202 - Zumbi dos Palmares', 'EM Clarice Lispector',
];

const benefits = ['Bolsa Família', 'BPC', 'Auxílio Brasil', 'Cartão Carioca'];
const benefitStatuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'SUSPENDED', 'CANCELLED'];

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const children = Array.from({ length: 25 }, (_, i) => {
  const id = `child-${String(i + 1).padStart(3, '0')}`;
  const birthDate = randomDate(new Date('2010-01-01'), new Date('2019-12-31'));
  const neighborhood = pick(neighborhoods);

  const hasHealth = i < 22;
  const hasEducation = i < 20;
  const hasSocial = i < 23;

  const vaccinesUpToDate = Math.random() > 0.35;
  const lastVisit = hasHealth
    ? randomDate(new Date('2023-01-01'), new Date('2025-06-01'))
    : null;
  const attendanceRate = hasEducation ? Math.random() * 40 + 60 : null;
  const benefitStatus = pick(benefitStatuses);

  const healthAlerts: string[] = [];
  if (hasHealth) {
    if (!vaccinesUpToDate) healthAlerts.push('Vacinas em atraso');
    if (lastVisit && (Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24) > 180) {
      healthAlerts.push('Última consulta há mais de 180 dias');
    }
  }

  const educationAlerts: string[] = [];
  if (hasEducation && attendanceRate !== null && attendanceRate < 75) {
    educationAlerts.push('Frequência escolar abaixo de 75%');
  }

  const socialAlerts: string[] = [];
  if (hasSocial && (benefitStatus === 'SUSPENDED' || benefitStatus === 'CANCELLED')) {
    socialAlerts.push(`Benefício ${benefitStatus === 'SUSPENDED' ? 'suspenso' : 'cancelado'}`);
  }

  return {
    id,
    fullName: `Criança ${String(i + 1).padStart(2, '0')} da ${neighborhood}`,
    birthDate,
    neighborhood,
    hasHealth,
    hasEducation,
    hasSocial,
    vaccinesUpToDate,
    lastVisit,
    attendanceRate,
    benefitStatus,
    healthAlerts,
    educationAlerts,
    socialAlerts,
  };
});

async function main() {
  const passwordHash = await bcrypt.hash('painel@2024', 12);

  await prisma.technician.upsert({
    where: { email: 'tecnico@prefeitura.rio' },
    update: {},
    create: { email: 'tecnico@prefeitura.rio', passwordHash },
  });

  for (const c of children) {
    await prisma.child.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        fullName: c.fullName,
        birthDate: c.birthDate,
        neighborhood: c.neighborhood,
      },
    });

    if (c.hasHealth) {
      await prisma.healthRecord.upsert({
        where: { childId: c.id },
        update: {},
        create: {
          childId: c.id,
          lastVisit: c.lastVisit,
          vaccinesUpToDate: c.vaccinesUpToDate,
          alerts: JSON.stringify(c.healthAlerts),
        },
      });
    }

    if (c.hasEducation && c.attendanceRate !== null) {
      await prisma.educationRecord.upsert({
        where: { childId: c.id },
        update: {},
        create: {
          childId: c.id,
          school: pick(schools),
          attendanceRate: c.attendanceRate,
          alerts: JSON.stringify(c.educationAlerts),
        },
      });
    }

    if (c.hasSocial) {
      await prisma.socialRecord.upsert({
        where: { childId: c.id },
        update: {},
        create: {
          childId: c.id,
          benefit: pick(benefits),
          benefitStatus: c.benefitStatus,
          alerts: JSON.stringify(c.socialAlerts),
        },
      });
    }
  }

  console.log('Seed concluído: 1 técnico + 25 crianças inseridas.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
