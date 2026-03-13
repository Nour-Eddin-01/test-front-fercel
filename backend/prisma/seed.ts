import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(' Seeding TradeHub database...');

  // 1. Create a Test Admin User
  // Note: passwordHash is required, totalBalance is Decimal
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tradehub.com' },
    update: {},
    create: {
      email: 'admin@tradehub.com',
      username: 'TradeMaster',
      passwordHash: 'placeholder_hashed_password', // Replace with bcrypt.hash later
      skillLevel: 'expert',
      totalBalance: 1000000.00,
    },
  });

  // creat user2 
  const user2 = await prisma.user.upsert({
    where: { email: 'user2@tradehub.com' },
    update: {},
    create: {
      email: 'user2@tradehub.com',
      username: 'TraderJoe',
      passwordHash: 'placeholder_hashed_password', // Replace with bcrypt.hash later
      skillLevel: 'intermediate',
      totalBalance: 50000.00,
    },
  });

  // creat user3
  const user3 = await prisma.user.upsert({
    where: { email: 'user3@tradehub.com' },
    update: {},
    create: {
      email: 'user3@tradehub.com',
      username: 'MarketMaven',
      passwordHash: 'placeholder_hashed_password', // Replace with bcrypt.hash later
      skillLevel: 'beginner',
      totalBalance: 10000.00,
    },
  });

  // 2. Create Initial Stocks
  // Note: ISIN, high, low, open, and BigInt volume are required
  // const initialStocks = [
  //   { 
  //     isin: 'US0378331002', 
  //     name: 'Apple Inc.', 
  //     symbol: 'AAPL', 
  //     price: 185.92, 
  //     sector: 'Technology',
  //     volume: BigInt(50000000)
  //   },
  //   { 
  //     isin: 'US88160R1014', 
  //     name: 'Tesla, Inc.', 
  //     symbol: 'TSLA', 
  //     price: 214.65, 
  //     sector: 'Automotive',
  //     volume: BigInt(120000000)
  //   },
  //   { 
  //     isin: 'US5949181045', 
  //     name: 'Microsoft Corp.', 
  //     symbol: 'MSFT', 
  //     price: 375.10, 
  //     sector: 'Technology',
  //     volume: BigInt(30000000)
  //   },
  // ];

  // for (const s of initialStocks) {
  //   await prisma.stock.upsert({
  //     where: { isin: s.isin },
  //     update: { currentPrice: s.price },
  //     create: {
  //       isin: s.isin,
  //       name: s.name,
  //       sector: s.sector,
  //       currentPrice: s.price,
  //       openPrice: s.price - 2,
  //       highPrice: s.price + 5,
  //       lowPrice: s.price - 3,
  //       volume: s.volume,
  //     },
  //   });
  // }
  for (let i = 1; i <= 50; i++) {
  const isin = `US00000000${i}`;
  await prisma.stock.upsert({
    where: { isin },
    update: { currentPrice: 100 + i },
    create: {
      isin,
      name: `Test Stock ${i}`,
      sector: i % 2 === 0 ? 'Technology' : 'Finance',
      currentPrice: 100 + i,
      openPrice: 95 + i,
      highPrice: 105 + i,
      lowPrice: 90 + i,
      volume: BigInt(1000000 * i),
    },
  });
}


  console.log(' Seeding complete! User and Stocks created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });