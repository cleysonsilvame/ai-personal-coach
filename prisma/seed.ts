import { faker } from "@faker-js/faker";
import prisma from "./prisma";

async function main() {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  await prisma.task.deleteMany();

  // First, create 20 users
  const users = [];
  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        age: faker.number.int({ min: 18, max: 80 }),
      },
    });
    users.push(user);
  }

  // Then, create 60 posts distributed among the users
  for (let i = 0; i < 60; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    await prisma.post.create({
      data: {
        title: faker.lorem.sentence({ min: 4, max: 8 }),
        content: faker.lorem.paragraphs({ min: 1, max: 3 }),
        published: faker.datatype.boolean(),
        author_id: randomUser.id,
      },
    });
  }

  // Finally, create 20 tasks
  for (let i = 0; i < 20; i++) {
    await prisma.task.create({
      data: {
        title: faker.lorem.sentence({ min: 3, max: 6 }),
        description: faker.lorem.paragraph({ min: 2, max: 4 }),
        steps: JSON.stringify([
          faker.lorem.sentence(),
          faker.lorem.sentence(),
          faker.lorem.sentence(),
        ]),
        estimated_time: `${faker.number.int({ min: 1, max: 8 })}h`,
        implementation_suggestion: faker.lorem.paragraphs(2),
        acceptance_criteria: JSON.stringify([
          faker.lorem.sentence(),
          faker.lorem.sentence(),
        ]),
        suggested_tests: JSON.stringify([
          `Test: ${faker.lorem.sentence()}`,
          `Test: ${faker.lorem.sentence()}`,
        ]),
        content: faker.lorem.paragraphs(3),
        chat_history: JSON.stringify([
          { role: "user", content: faker.lorem.sentence() },
          { role: "assistant", content: faker.lorem.paragraph() },
          { role: "user", content: faker.lorem.sentence() },
        ]),
      },
    });
  }

  console.log("Seed completed! Created:");
  console.log("- 20 users");
  console.log("- 60 posts");
  console.log("- 20 tasks");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
