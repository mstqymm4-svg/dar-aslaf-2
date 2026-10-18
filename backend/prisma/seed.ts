import { PrismaClient, Role, BookStatus, BookLanguage, VideoType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Dar Al Uloom database...");

  // 1. Super Admin
  const adminEmail = process.env.ADMIN_EMAIL || "admin@dar-al-uloom.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        fullName: "مدير المنصة",
        role: Role.SUPER_ADMIN,
        isActive: true,
        preferredLanguage: "ar",
      },
    });
    console.log(`Created Super Admin: ${admin.email}`);
  } else {
    console.log(`Admin already exists: ${existingAdmin.email}`);
  }

  // 2. Categories
  const categories = [
    { name: "القرآن وعلومه", slug: "quran-sciences", sortOrder: 1 },
    { name: "الحديث الشريف", slug: "hadith", sortOrder: 2 },
    { name: "الفقه الإسلامي", slug: "fiqh", sortOrder: 3 },
    { name: "العقيدة", slug: "aqeedah", sortOrder: 4 },
    { name: "السيرة النبوية", slug: "seerah", sortOrder: 5 },
    { name: "التزكية والرقائق", slug: "tazkiyah", sortOrder: 6 },
    { name: "التاريخ الإسلامي", slug: "islamic-history", sortOrder: 7 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: { name: cat.name, sortOrder: cat.sortOrder },
    });
  }
  console.log(`Seeded ${categories.length} categories.`);

  // 3. Default App Settings
  const defaultSettings = [
    { key: "app_name", value: "دار العلوم", type: "text" },
    { key: "app_subtitle", value: "مكتبة إسلامية شاملة", type: "text" },
    { key: "theme_color", value: "#0d3b2e", type: "color" },
    { key: "contact_email", value: "support@dar-al-uloom.com", type: "text" },
    { key: "offline_mode", value: "true", type: "boolean" },
  ];

  for (const s of defaultSettings) {
    await prisma.appSetting.upsert({
      where: { key: s.key },
      create: { key: s.key, value: s.value, type: s.type as any },
      update: {},
    });
  }
  console.log("Seeded default app settings.");

  // 4. Sample Video Channel
  const sampleChannel = await prisma.videoChannel.upsert({
    where: { id: "dar-al-uloom-official" },
    create: {
      id: "dar-al-uloom-official",
      name: "قناة دار العلوم الرسمية",
      description: "المحاضرات والدروس العلمية المسجلة والمباشرة",
      youtubeUrl: "https://www.youtube.com",
      category: "محاضرات",
      sortOrder: 1,
      visible: true,
    },
    update: {},
  });

  // 5. Sample Videos
  const sampleVideos = [
    {
      title: "مقدمة في علوم القرآن الكريم",
      description: "مدخل شامل لدراسة القرآن الكريم وتفسيره وأسباب النزول",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      channelName: sampleChannel.name,
      videoChannelId: sampleChannel.id,
      category: "القرآن وعلومه",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      duration: "45:00",
      isFeatured: true,
      visible: true,
      sortOrder: 1,
      videoType: VideoType.normal,
    },
  ];

  for (const v of sampleVideos) {
    const existing = await prisma.video.findFirst({ where: { youtubeUrl: v.youtubeUrl } });
    if (!existing) {
      await prisma.video.create({ data: v });
    }
  }
  console.log("Seeded sample videos.");

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
