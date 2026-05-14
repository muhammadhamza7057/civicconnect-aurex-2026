// Simple MongoDB seed script for CivicConnect (AUREX AI 2026 demo data)
const { connect } = require('../backend/src/lib/mongo');
const User = require('../backend/src/models/User');
const Department = require('../backend/src/models/Department');
const Ticket = require('../backend/src/models/Ticket');
const Announcement = require('../backend/src/models/Announcement');
const Event = require('../backend/src/models/Event');

async function seed() {
  await connect();

  const infra = await Department.findOneAndUpdate(
    { slug: 'infrastructure' },
    {
      name: 'Infrastructure',
      slug: 'infrastructure',
      contact_email: 'infra@civicconnect.test',
      sla_config: { response_hours: 24, resolution_hours: 72, critical_multiplier: 0.25 },
      staff_ids: []
    },
    { upsert: true, new: true }
  );

  // Clear existing users so we can recreate them with proper password hashing
  await User.deleteMany({ email: { $in: ['alice.resident@example.com', 'bob.staff@example.com', 'carol.deptadmin@example.com', 'dave.super@example.com'] } });

  // Create users with proper password hashing via .save() method
  const alice = await new User({
    name: 'Alice Resident',
    email: 'alice.resident@example.com',
    password: 'Password123!',
    role: 'resident'
  }).save();

  const bob = await new User({
    name: 'Bob Staff',
    email: 'bob.staff@example.com',
    password: 'Password123!',
    role: 'staff',
    department: infra._id,
    staff_id: 'STAFF-INF-001'
  }).save();

  const carol = await new User({
    name: 'Carol Admin',
    email: 'carol.deptadmin@example.com',
    password: 'Password123!',
    role: 'admin',
    department: infra._id
  }).save();

  const dave = await new User({
    name: 'Dave Super',
    email: 'dave.super@example.com',
    password: 'Password123!',
    role: 'super_admin'
  }).save();

  await Department.findByIdAndUpdate(infra._id, { $set: { staff_ids: [bob._id] } });

  const loc = { lat: 40.7128, lng: -74.006, text: 'Sector G-11, near community center' };

  const existing = await Ticket.findOne({ ticket_code: 'INF-2026-0001' });
  if (!existing) {
    await Ticket.create({
      ticket_code: 'INF-2026-0001',
      title: 'Burst water pipe in Sector G-11',
      description:
        'There is a major burst water pipe next to the community center in Sector G-11. Water flooding the street and affecting nearby homes. Immediate assistance needed.',
      reporter: alice._id,
      department: infra._id,
      assigned_to: bob._id,
      priority: 'emergency',
      status: 'in_progress',
      location: loc,
      attachments: [{ url: '/uploads/burst1.jpg', name: 'burst1.jpg' }],
      sla_due_at: new Date(Date.now() + 2 * 60 * 60 * 1000),
      metadata: { slaStatus: 'red', location: loc }
    });
  }

  await Announcement.findOneAndUpdate(
    { title: 'Water Advisory' },
    {
      title: 'Water Advisory',
      body: 'Due to emergency repairs, water pressure may be affected in some sectors.',
      author: carol._id,
      is_public: true,
      is_emergency: false
    },
    { upsert: true, new: true }
  );

  await Event.findOneAndUpdate(
    { title: 'Neighborhood Safety Walk' },
    {
      title: 'Neighborhood Safety Walk',
      description: 'Join department staff for a guided walkthrough and Q&A.',
      organizer: carol._id,
      capacity: 50,
      status: 'published',
      starts_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      registrants: [],
      location: { text: 'City Hall Plaza' }
    },
    { upsert: true, new: true }
  );

  console.log('Seed complete. Demo logins:');
  console.log('  Resident alice.resident@example.com / Password123!');
  console.log('  Staff bob.staff@example.com or staff_id STAFF-INF-001 / Password123!');
  console.log('  Admin carol.deptadmin@example.com / Password123!');
  console.log('  Super dave.super@example.com / Password123!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
