import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  // Seed Project_items table
  await prisma.project_items.createMany({
    data: [
      {
        id: '1',
        name: 'Project Item 1',
        description: 'Description of Project Item 1',
        code: 'ABC123',
        status: 'Active',
        type: 'Type 1',
        project: '1',
      },
      {
        id: '2',
        name: 'Project Item 2',
        description: 'Description of Project Item 2',
        code: 'DEF456',
        status: 'Inactive',
        type: 'Type 2',
        project: '2',
      },
      // Add more project_items as needed
    ],
    skipDuplicates: true,
  });

  // Seed Projects table
  await prisma.projects.createMany({
    data: [
      {
        id: '1',
        project_name: 'Project 1',
        project_description: 'Description of Project 1',
        project_workflow: 'Workflow 1',
      },
      {
        id: '2',
        project_name: 'Project 2',
        project_description: 'Description of Project 2',
        project_workflow: 'Workflow 2',
      },
      // Add more projects as needed
    ],
    skipDuplicates: true,
  });

  // Seed WorkspaceActivities table
  await prisma.workspaceActivities.createMany({
    data: [
      {
        createdAt: new Date(),
        projectID: 1,
        title: 'Activity 1',
        description: 'Description of Activity 1',
        status: 'Active',
        priority: 'High',
        id: '1',
        assigned: '1',
        createdBy: '1',
        position: 1,
        orderType: 'Order Type 1',
        taskListID: '1',
      },
      {
        createdAt: new Date(),
        projectID: 1,
        title: 'Activity 2',
        description: 'Description of Activity 2',
        status: 'Inactive',
        priority: 'Medium',
        id: '2',
        assigned: '2',
        createdBy: '2',
        position: 2,
        orderType: 'Order Type 2',
        taskListID: '2',
      },
      // Add more workspaceActivities as needed
    ],
    skipDuplicates: true,
  });

  // Add more seed data for other tables (WorkspaceLists, ValidationOrders, WorkOrder, WorkOrderItems, etc.) in a similar way.

  console.log('Database seeding completed successfully.');
}

seed()
  .catch((error) => {
    console.error('Error occurred during database seeding:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
