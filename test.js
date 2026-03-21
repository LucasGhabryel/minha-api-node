import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Criar um usuário de teste
    const user = await prisma.user.create({
      data: {
        name: 'Lucas',
        email: 'lucas@example.com',
        age: 20,
      },
    });
    console.log('Usuário criado:', user);

    // Listar todos os usuários
    const users = await prisma.user.findMany();
    console.log('Lista de usuários:', users);

    // Teste com SQL puro
    const raw = await prisma.$queryRaw`SELECT 1 + 1 AS result`;
    console.log('Teste SQL:', raw);

  } catch (err) {
    console.error('Erro ao testar:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();