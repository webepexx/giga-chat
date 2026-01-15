import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Manually load the .env file from the root
dotenv.config({ path: '.env' });

// Ensure DATABASE_URL exists before starting
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in your .env file");
}

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Plan Seeding ---');
  // ... (rest of your plans array and logic remains the same)
  
  const plans = [
    {
      name: 'Free',
      price: 0,
      editName: false,
      editPfp: false,
      sendEmojis: false,
      sendGifs: false,
      sendVideos: false,
      minMatchTime: 90,
      selectGender: false,
      chatTimer: 30,
      maxDailyChats: 20,
      maxFriendReq: 0,
    },
    {
      name: 'Basic',
      price: 99,
      editName: true,
      editPfp: true,
      sendEmojis: true,
      sendGifs: false,
      sendVideos: false,
      minMatchTime: 15,
      selectGender: true,
      chatTimer: 15,
      maxDailyChats: 50,
      maxFriendReq: 15,
    },
    {
      name: 'Premium',
      price: 499,
      editName: true,
      editPfp: true,
      sendEmojis: true,
      sendGifs: true,
      sendVideos: true,
      minMatchTime: 0,
      selectGender: true,
      chatTimer: 0,
      maxDailyChats: 9999,
      maxFriendReq: 50,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
    console.log(`✅ Upserted ${plan.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });