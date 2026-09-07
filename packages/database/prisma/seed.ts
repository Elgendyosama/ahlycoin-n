import { PrismaClient, MatchStatus, MatchEventType, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Sports Social Database Seeding...');

  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);

  // Create Default Admin Account
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sports.com' },
    update: {
      role: Role.ADMIN,
      isVerified: true,
    },
    create: {
      username: 'admin',
      email: 'admin@sports.com',
      passwordHash: adminPasswordHash,
      name: 'مدير النظام',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  // Create Teams
  const ahly = await prisma.team.upsert({
    where: { code: 'AHL' },
    update: {},
    create: {
      name: 'Al Ahly SC',
      shortName: 'Al Ahly',
      code: 'AHL',
      logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120&auto=format&fit=crop',
      primaryColor: '#e11d48',
      secondaryColor: '#ffffff',
    },
  });

  const madrid = await prisma.team.upsert({
    where: { code: 'RMA' },
    update: {},
    create: {
      name: 'Real Madrid CF',
      shortName: 'Real Madrid',
      code: 'RMA',
      logoUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=120&auto=format&fit=crop',
      primaryColor: '#1e3a8a',
      secondaryColor: '#f59e0b',
    },
  });

  const arsenal = await prisma.team.upsert({
    where: { code: 'ARS' },
    update: {},
    create: {
      name: 'Arsenal FC',
      shortName: 'Arsenal',
      code: 'ARS',
      logoUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=120&auto=format&fit=crop',
      primaryColor: '#dc2626',
      secondaryColor: '#ffffff',
    },
  });

  // Create Users
  const user1 = await prisma.user.upsert({
    where: { username: 'ahmed_red' },
    update: {},
    create: {
      username: 'ahmed_red',
      email: 'ahmed@sports.com',
      passwordHash: '$2b$10$epR48r50.6h./p8k75g64.Q4i77h0k010xKzS7d6/4.0', // hashed 'password123'
      name: 'Ahmed El-Sayed',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop',
      bio: 'Die-hard Football Fanatic ⚽ | Tactical Analyst & Sports Journalist',
      favoriteTeamId: ahly.id,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { username: 'sarah_tactics' },
    update: {},
    create: {
      username: 'sarah_tactics',
      email: 'sarah@sports.com',
      passwordHash: '$2b$10$epR48r50.6h./p8k75g64.Q4i77h0k010xKzS7d6/4.0',
      name: 'Sarah Jenkins',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop',
      bio: 'High press fan | Madridista 🤍 | Real-time match data nerd',
      favoriteTeamId: madrid.id,
    },
  });

  // Create Matches
  const match1 = await prisma.match.upsert({
    where: { id: 'match-1' },
    update: {},
    create: {
      id: 'match-1',
      homeTeamId: ahly.id,
      awayTeamId: madrid.id,
      homeScore: 2,
      awayScore: 1,
      status: MatchStatus.LIVE,
      minute: 78,
      startTime: new Date(),
      venue: 'Cairo International Stadium',
      league: 'Club World Super Cup',
      events: {
        create: [
          {
            type: MatchEventType.GOAL,
            minute: 14,
            teamId: madrid.id,
            player: 'Vinicius Jr.',
            assistPlayer: 'Jude Bellingham',
            description: 'Stunning curler into the top right corner!',
          },
          {
            type: MatchEventType.GOAL,
            minute: 42,
            teamId: ahly.id,
            player: 'Emam Ashour',
            assistPlayer: 'Hussein El Shahat',
            description: 'Powerful header off a pinpoint corner kick!',
          },
          {
            type: MatchEventType.YELLOW_CARD,
            minute: 55,
            teamId: madrid.id,
            player: 'Camavinga',
            description: 'Tactical foul on the counter attack.',
          },
          {
            type: MatchEventType.GOAL,
            minute: 71,
            teamId: ahly.id,
            player: 'Wessam Abou Ali',
            assistPlayer: 'Mohamed Hany',
            description: 'Tap-in after a brilliant team buildup!',
          },
        ],
      },
    },
  });

  const match2 = await prisma.match.upsert({
    where: { id: 'match-2' },
    update: {},
    create: {
      id: 'match-2',
      homeTeamId: arsenal.id,
      awayTeamId: ahly.id,
      homeScore: 0,
      awayScore: 0,
      status: MatchStatus.SCHEDULED,
      minute: 0,
      startTime: new Date(Date.now() + 86400000), // tomorrow
      venue: 'Emirates Stadium, London',
      league: 'International Champions Cup',
    },
  });

  // Create Sample Posts
  await prisma.post.create({
    data: {
      authorId: user1.id,
      content: 'WHAT A MATCH! Al Ahly taking the 2-1 lead in the 71st minute against Real Madrid! Stadium is absolutely exploding right now 🔥⚡ #ClubWorldCup #AlAhly',
      matchId: match1.id,
      mediaUrls: [
        'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop',
      ],
      likes: {
        create: [{ userId: user2.id }],
      },
      comments: {
        create: [
          {
            userId: user2.id,
            content: 'Incredible atmosphere! That build up for the second goal was pure art.',
          },
        ],
      },
    },
  });

  await prisma.post.create({
    data: {
      authorId: user2.id,
      content: 'Real Madrid needs to increase the pressing intensity in midfield. Camavinga and Jude need to drive forward in the final 15 minutes! ⚽📈',
      matchId: match1.id,
      mediaUrls: [],
    },
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
