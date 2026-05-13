// Simple MongoDB seed script for CivicConnect
const { connect } = require('../backend/src/lib/mongo');
const User = require('../backend/src/models/User');
const Department = require('../backend/src/models/Department');
const Ticket = require('../backend/src/models/Ticket');
const Announcement = require('../backend/src/models/Announcement');

async function seed() {
  await connect();

  const infra = await Department.findOneAndUpdate(
    { slug: 'infrastructure' },
    { name: 'Infrastructure', slug: 'infrastructure', contact_email: 'infra@civicconnect.test' },
    { upsert: true, new: true }
  );

  const alice = await User.findOneAndUpdate(
    { email: 'alice.resident@example.com' },
    { full_name: 'Alice Resident', email: 'alice.resident@example.com', password: 'Password123!' },
    { upsert: true, new: true }
  );

  const bob = await User.findOneAndUpdate(
    { email: 'bob.staff@example.com' },
    { full_name: 'Bob Staff', email: 'bob.staff@example.com', password: 'Password123!', role: 'staff', department: infra._id },
    { upsert: true, new: true }
  );

  const carol = await User.findOneAndUpdate(
    { email: 'carol.deptadmin@example.com' },
    { full_name: 'Carol DeptAdmin', email: 'carol.deptadmin@example.com', password: 'Password123!', role: 'department_admin', department: infra._id },
    { upsert: true, new: true }
  );

  const dave = await User.findOneAndUpdate(
    { email: 'dave.super@example.com' },
    { full_name: 'Dave Super', email: 'dave.super@example.com', password: 'Password123!', role: 'super_admin' },
    { upsert: true, new: true }
  );

  const existing = await Ticket.findOne({ ticket_code: 'INF-2026-00412' });
  if (!existing) {
    await Ticket.create({
      ticket_code: 'INF-2026-00412',
      title: 'Burst water pipe in Sector G-11',
      description: 'There is a major burst water pipe next to the community center in Sector G-11. Water flooding the street and affecting nearby homes. Immediate assistance needed.',
      reporter: alice._id,
      department: infra._id,
      priority: 'emergency',
      status: 'submitted',
      attachments: [{ url: '/uploads/burst1.jpg', name: 'burst1.jpg' }],
      sla_due_at: new Date(Date.now() + 2 * 60 * 60 * 1000)
    });
  }

  await Announcement.findOneAndUpdate(
    { title: 'Water Advisory' },
    { title: 'Water Advisory', body: 'Due to emergency repairs, water pressure may be affected in some sectors.', author: carol._id, is_public: true },
    { upsert: true, new: true }
  );

  console.log('Seed complete');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
