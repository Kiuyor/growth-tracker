import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const items = [
    {
      name: "休息15分钟",
      description: "放下书本，休息一会儿，让大脑充充电",
      icon: "Coffee",
      type: "REWARD",
      cost: 20,
      sortOrder: 1,
      limitConfig: JSON.stringify({ period: "WEEKLY", maxCount: 3 }),
    },
    {
      name: "看一集动漫",
      description: "完成一周目标后，奖励自己一集喜欢的动漫",
      icon: "Sparkles",
      type: "REWARD",
      cost: 50,
      sortOrder: 2,
      limitConfig: JSON.stringify({ period: "WEEKLY", maxCount: 2 }),
    },
    {
      name: "一杯奶茶",
      description: "学习辛苦了，来杯奶茶吧",
      icon: "Coffee",
      type: "REWARD",
      cost: 80,
      sortOrder: 3,
      limitConfig: JSON.stringify({ period: "MONTHLY", maxCount: 4 }),
    },
    {
      name: "深色主题头像框",
      description: "低调沉稳的专属头像框装饰",
      icon: "Crown",
      type: "DECORATION",
      cost: 100,
      sortOrder: 4,
      limitConfig: JSON.stringify({ period: "TOTAL", maxCount: 1 }),
    },
    {
      name: "免任务卡",
      description: "使用后可免除一个不想做的任务",
      icon: "Zap",
      type: "CONSUMABLE",
      cost: 30,
      sortOrder: 5,
      limitConfig: JSON.stringify({ period: "WEEKLY", maxCount: 1 }),
    },
    {
      name: "周末游戏时间",
      description: "兑换一个小时的自由游戏时间",
      icon: "Gift",
      type: "REWARD",
      cost: 120,
      sortOrder: 6,
      limitConfig: JSON.stringify({ period: "WEEKLY", maxCount: 1 }),
    },
  ];

  for (const item of items) {
    await prisma.shopItem.create({
      data: item,
    });
  }

  console.log("Shop items seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
