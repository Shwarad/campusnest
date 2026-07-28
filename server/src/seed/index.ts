import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

const j = (arr: string[]) => JSON.stringify(arr);

async function seed() {
  console.log('🌱 Initialising SQLite database...');
  await prisma.$connect();
  console.log('✅ Connected. Starting seed...');

  // Clear all tables (order matters for FK constraints)
  await prisma.report.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.review.deleteMany();
  await prisma.savedProperty.deleteMany();
  await prisma.nearbyFacility.deleteMany();
  await prisma.roommateProfile.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Cleared existing data');

  const pwd = await bcrypt.hash('Demo@123', 12);

  // ── USERS ────────────────────────────────────────────────
  const demoStudent = await prisma.user.create({ data: { name: 'Priya Sharma', email: 'student@campusnest.demo', phone: '9876543210', password: pwd, role: 'student', college: 'Gauhati University', isVerified: true, identityStatus: 'verified' } });
  const demoOwner   = await prisma.user.create({ data: { name: 'Rajesh Kumar', email: 'owner@campusnest.demo', phone: '9876543211', password: pwd, role: 'owner', isVerified: true, identityStatus: 'verified' } });
  const adminUser   = await prisma.user.create({ data: { name: 'Admin User', email: 'admin@campusnest.demo', phone: '9876543212', password: pwd, role: 'admin', isVerified: true, identityStatus: 'verified' } });
  const ankita      = await prisma.user.create({ data: { name: 'Ankita Das', email: 'ankita.das@student.demo', phone: '9876001001', password: pwd, role: 'student', college: 'Assam Engineering College', isVerified: true, identityStatus: 'verified' } });
  const rohan       = await prisma.user.create({ data: { name: 'Rohan Borah', email: 'rohan.borah@student.demo', phone: '9876001002', password: pwd, role: 'student', college: 'Cotton University' } });
  const meenakshi   = await prisma.user.create({ data: { name: 'Meenakshi Gogoi', email: 'meenakshi.gogoi@student.demo', phone: '9876001003', password: pwd, role: 'student', college: 'Gauhati Commerce College', isVerified: true, identityStatus: 'verified' } });
  const biplab      = await prisma.user.create({ data: { name: 'Biplab Nath', email: 'biplab.nath@student.demo', phone: '9876001004', password: pwd, role: 'student', college: 'Assam Engineering College' } });
  const priyanka    = await prisma.user.create({ data: { name: 'Priyanka Baruah', email: 'priyanka.baruah@student.demo', phone: '9876001005', password: pwd, role: 'student', college: 'Gauhati University', isVerified: true, identityStatus: 'verified' } });
  const suresh      = await prisma.user.create({ data: { name: 'Suresh Deka', email: 'suresh.deka@owner.demo', phone: '9876002001', password: pwd, role: 'owner', isVerified: true, identityStatus: 'verified' } });
  const mita        = await prisma.user.create({ data: { name: 'Mita Kalita', email: 'mita.kalita@owner.demo', phone: '9876002002', password: pwd, role: 'owner', isVerified: true, identityStatus: 'pending' } });
  const binod       = await prisma.user.create({ data: { name: 'Binod Saikia', email: 'binod.saikia@owner.demo', phone: '9876002003', password: pwd, role: 'owner' } });
  console.log('✅ Created 11 users');

  // ── PROPERTIES ───────────────────────────────────────────
  const p1 = await prisma.property.create({ data: {
    title: 'Spacious PG for Boys near Gauhati University', description: 'Well-maintained boys PG in Jalukbari. Walking distance from GU main gate. Clean rooms with attached bathrooms. Power backup and 24/7 water supply.',
    street: 'House No. 12, Jalukbari Road', locality: 'Jalukbari', city: 'Guwahati', state: 'Assam', pincode: '781014', lat: 26.1445, lng: 91.6897,
    propertyType: 'pg', rent: 6500, deposit: 13000, totalRooms: 8, availableBeds: 3, furnishing: 'furnished', genderPreference: 'boys',
    wifi: true, attachedBathroom: true, parking: true, laundry: true, powerBackup: true, food: true, waterFilter: true,
    houseRules: j(['No smoking inside', 'Guests allowed till 9 PM', 'No loud music after 10 PM']),
    availableFrom: new Date('2024-01-15'),
    images: j(['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800']),
    ownerId: demoOwner.id, college: 'Gauhati University', distanceFromCollege: 0.4, verificationStatus: 'verified',
    views: 234, avgRating: 4.3, reviewCount: 7, scamRiskScore: 5, scamRiskLevel: 'low',
    scamRiskFlags: j([]),
    contactPhone: '9876543211', contactEmail: 'owner@campusnest.demo',
    facilities: { create: [{ name: 'D-Mart Supermarket', type: 'grocery', distance: '200m' }, { name: 'Jalukbari Bus Stop', type: 'bus_stop', distance: '150m' }, { name: 'Medical Store', type: 'pharmacy', distance: '300m' }] },
  }});

  const p2 = await prisma.property.create({ data: {
    title: 'Girls Hostel with Mess near AEC', description: 'Safe and secure girls hostel near Assam Engineering College. Fully furnished rooms with AC. Nutritious meals three times a day. 24/7 CCTV and security.',
    street: 'Chandmari Main Road, Nr. AEC Gate', locality: 'Chandmari', city: 'Guwahati', state: 'Assam', pincode: '781003', lat: 26.1567, lng: 91.7362,
    propertyType: 'hostel', rent: 8000, deposit: 16000, totalRooms: 12, availableBeds: 4, furnishing: 'furnished', genderPreference: 'girls',
    wifi: true, ac: true, laundry: true, powerBackup: true, food: true, waterFilter: true,
    houseRules: j(['Girls only', 'Curfew 10 PM', 'No alcohol']),
    availableFrom: new Date('2024-02-01'),
    images: j(['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800']),
    ownerId: suresh.id, college: 'Assam Engineering College', distanceFromCollege: 0.6, verificationStatus: 'verified',
    views: 187, avgRating: 4.5, reviewCount: 12, scamRiskScore: 2, scamRiskLevel: 'low',
    scamRiskFlags: j([]),
    contactPhone: '9876002001', contactEmail: 'suresh.deka@owner.demo',
    facilities: { create: [{ name: 'AEC Metro Bus Stop', type: 'bus_stop', distance: '50m' }, { name: 'Apollo Pharmacy', type: 'pharmacy', distance: '250m' }] },
  }});

  const p3 = await prisma.property.create({ data: {
    title: 'Affordable Shared Flat near Dispur', description: 'Comfortable shared flat in Dispur, ideal for government exam aspirants. 3-bedroom flat shared by 4-6 students. Kitchen available.',
    street: 'Housefed Complex, Near Last Gate', locality: 'Dispur', city: 'Guwahati', state: 'Assam', pincode: '781006', lat: 26.1341, lng: 91.7898,
    propertyType: 'flat', rent: 4500, deposit: 9000, totalRooms: 3, availableBeds: 2, furnishing: 'semi_furnished', genderPreference: 'boys',
    wifi: true, parking: true,
    houseRules: j(['No parties', 'Shared cooking only']),
    availableFrom: new Date('2024-01-20'),
    images: j(['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800']),
    ownerId: mita.id, college: 'Gauhati Commerce College', distanceFromCollege: 1.2, verificationStatus: 'pending',
    views: 98, avgRating: 3.8, reviewCount: 4, scamRiskScore: 10, scamRiskLevel: 'low',
    scamRiskFlags: j([]),
    contactPhone: '9876002002', contactEmail: 'mita.kalita@owner.demo',
    facilities: { create: [{ name: 'Dispur Market', type: 'grocery', distance: '400m' }, { name: 'Last Gate Bus Stand', type: 'bus_stop', distance: '200m' }] },
  }});

  const p4 = await prisma.property.create({ data: {
    title: 'Single AC Room near Zoo Road', description: 'Well-furnished single room with AC near Zoo Road. Ideal for students who prefer privacy. Attached bathroom, 24/7 water. 5 min walk to bus stop.',
    street: 'Zoo Road Tiniali, Near State Zoo', locality: 'Zoo Road', city: 'Guwahati', state: 'Assam', pincode: '781005', lat: 26.1759, lng: 91.7547,
    propertyType: 'room', rent: 9500, deposit: 19000, totalRooms: 1, availableBeds: 1, furnishing: 'furnished', genderPreference: 'coed',
    wifi: true, ac: true, attachedBathroom: true, powerBackup: true, refrigerator: true, tv: true,
    houseRules: j(['Quiet hours 11 PM-7 AM', 'No smoking']),
    availableFrom: new Date('2024-02-10'),
    images: j(['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800']),
    ownerId: demoOwner.id, college: 'Cotton University', distanceFromCollege: 2.1, verificationStatus: 'verified',
    views: 156, avgRating: 4.6, reviewCount: 5, scamRiskScore: 3, scamRiskLevel: 'low',
    scamRiskFlags: j([]),
    contactPhone: '9876543211', contactEmail: 'owner@campusnest.demo',
    facilities: { create: [{ name: 'Cafe Coffee Day', type: 'cafe', distance: '100m' }, { name: 'Zoo Road Hospital', type: 'hospital', distance: '600m' }] },
  }});

  const p5 = await prisma.property.create({ data: {
    title: 'Budget PG for Girls near Cotton University', description: 'Budget-friendly PG for girls near Cotton University. Shared rooms available. Clean bathrooms.',
    street: 'Panbazar Lane 3, Near Cotton University', locality: 'Panbazar', city: 'Guwahati', state: 'Assam', pincode: '781001', lat: 26.1829, lng: 91.7461,
    propertyType: 'pg', rent: 4000, deposit: 8000, totalRooms: 6, availableBeds: 4, furnishing: 'semi_furnished', genderPreference: 'girls',
    wifi: true, waterFilter: true,
    houseRules: j(['Girls only', 'Maintain cleanliness']),
    availableFrom: new Date('2024-01-25'),
    images: j(['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800']),
    ownerId: mita.id, college: 'Cotton University', distanceFromCollege: 0.3, verificationStatus: 'unverified',
    views: 67, avgRating: 3.5, reviewCount: 3, scamRiskScore: 20, scamRiskLevel: 'review_recommended',
    scamRiskFlags: j(['No property photos (only 1)', 'Owner identity not verified']),
    contactPhone: '9876002002', contactEmail: 'mita.kalita@owner.demo',
  }});

  const p6 = await prisma.property.create({ data: {
    title: 'Co-ed Shared Flat in Ganeshguri', description: 'Modern co-ed shared flat in Ganeshguri. 2 rooms available. Fully furnished. Excellent transport links to all major colleges.',
    street: 'GS Road, Ganeshguri Chowk', locality: 'Ganeshguri', city: 'Guwahati', state: 'Assam', pincode: '781005', lat: 26.1632, lng: 91.7701,
    propertyType: 'flat', rent: 7000, deposit: 14000, totalRooms: 4, availableBeds: 2, furnishing: 'furnished', genderPreference: 'coed',
    wifi: true, ac: true, attachedBathroom: true, parking: true, laundry: true, powerBackup: true, refrigerator: true,
    houseRules: j(['Mutual respect', 'Shared chores']),
    availableFrom: new Date('2024-02-15'),
    images: j(['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800']),
    ownerId: suresh.id, college: 'Assam Engineering College', distanceFromCollege: 3.5, verificationStatus: 'verified',
    views: 211, avgRating: 4.2, reviewCount: 8, scamRiskScore: 4, scamRiskLevel: 'low',
    scamRiskFlags: j([]),
    contactPhone: '9876002001', contactEmail: 'suresh.deka@owner.demo',
    facilities: { create: [{ name: 'GS Road Fitness', type: 'gym', distance: '200m' }, { name: 'Ganeshguri Market', type: 'grocery', distance: '300m' }, { name: 'HDFC ATM', type: 'atm', distance: '150m' }] },
  }});

  const p7 = await prisma.property.create({ data: {
    title: 'Economy Shared Room near Jalukbari', description: 'Extremely affordable shared accommodation near Jalukbari flyover. Ideal for students on tight budget.',
    street: 'Jalukbari Link Road, Near Flyover', locality: 'Jalukbari', city: 'Guwahati', state: 'Assam', pincode: '781014', lat: 26.1488, lng: 91.6812,
    propertyType: 'shared_room', rent: 2500, deposit: 5000, totalRooms: 3, availableBeds: 3, furnishing: 'unfurnished', genderPreference: 'boys',
    houseRules: j(['Respect roommates']),
    availableFrom: new Date('2024-01-10'),
    images: j([]),
    ownerId: binod.id, college: 'Gauhati University', distanceFromCollege: 1.8, verificationStatus: 'unverified',
    views: 43, avgRating: 2.8, reviewCount: 2, scamRiskScore: 45, scamRiskLevel: 'high',
    scamRiskFlags: j(['No property photos', 'Rent significantly below area average', 'Owner identity not verified']),
    contactPhone: '9876002003', contactEmail: 'binod.saikia@owner.demo',
  }});

  const p8 = await prisma.property.create({ data: {
    title: 'Premium Hostel near Assam Engineering College', description: 'State-of-the-art student hostel 5 minutes from AEC. Modern rooms with AC, dedicated study areas, high-speed WiFi. 24/7 security.',
    street: 'Jalukbari Bypass Road', locality: 'Jalukbari', city: 'Guwahati', state: 'Assam', pincode: '781014', lat: 26.1519, lng: 91.6943,
    propertyType: 'hostel', rent: 12000, deposit: 24000, totalRooms: 20, availableBeds: 5, furnishing: 'furnished', genderPreference: 'boys',
    wifi: true, ac: true, attachedBathroom: true, parking: true, laundry: true, powerBackup: true, food: true, gym: true, tv: true, refrigerator: true, waterFilter: true,
    houseRules: j(['Study hours 8-10 PM (mandatory silence)', 'Visitors in common area only']),
    availableFrom: new Date('2024-01-01'),
    images: j(['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800']),
    ownerId: suresh.id, college: 'Assam Engineering College', distanceFromCollege: 0.5, verificationStatus: 'verified',
    views: 412, avgRating: 4.7, reviewCount: 18, scamRiskScore: 1, scamRiskLevel: 'low',
    scamRiskFlags: j([]),
    contactPhone: '9876002001', contactEmail: 'suresh.deka@owner.demo',
    facilities: { create: [{ name: 'AEC Main Canteen', type: 'restaurant', distance: '300m' }, { name: 'State Bank Branch', type: 'atm', distance: '400m' }] },
  }});

  // createMany doesn't support nested relations in SQLite, so create individually
  await prisma.property.create({ data: {
    title: 'Modern 1BHK Near Gauhati Commerce College', description: 'Entire 1BHK flat for single student. Modern kitchen, spacious bedroom. Quiet residential area in Chandmari.',
    street: 'Chandmari Housing Colony, Block C', locality: 'Chandmari', city: 'Guwahati', state: 'Assam', pincode: '781003', lat: 26.1598, lng: 91.7289,
    propertyType: 'flat', rent: 11000, deposit: 22000, furnishing: 'furnished', genderPreference: 'coed',
    wifi: true, ac: true, attachedBathroom: true, parking: true, powerBackup: true, refrigerator: true, tv: true, waterFilter: true,
    houseRules: j([]),
    availableFrom: new Date('2024-03-01'),
    images: j(['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800']),
    ownerId: demoOwner.id, college: 'Gauhati Commerce College', distanceFromCollege: 0.8, verificationStatus: 'verified',
    views: 89, avgRating: 4.4, reviewCount: 3, scamRiskScore: 4, scamRiskLevel: 'low',
    scamRiskFlags: j([]),
    contactPhone: '9876543211', contactEmail: 'owner@campusnest.demo',
  }});

  await prisma.property.create({ data: {
    title: 'Cozy Room in Shared Villa - Dispur', description: 'Comfortable room near Secretariat. Perfect for UPSC/APSC aspirants. Home-cooked meals available.',
    street: 'Dispur Secretariat Road', locality: 'Dispur', city: 'Guwahati', state: 'Assam', pincode: '781006', lat: 26.1289, lng: 91.8002,
    propertyType: 'room', rent: 5500, deposit: 11000, furnishing: 'semi_furnished', genderPreference: 'coed',
    wifi: true, powerBackup: true, food: true, waterFilter: true,
    houseRules: j([]),
    availableFrom: new Date('2024-02-01'),
    images: j(['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800']),
    ownerId: mita.id, college: 'Gauhati Commerce College', distanceFromCollege: 1.5, verificationStatus: 'pending',
    views: 134, avgRating: 4.1, reviewCount: 6, scamRiskScore: 15, scamRiskLevel: 'low',
    scamRiskFlags: j([]),
    contactPhone: '9876002002', contactEmail: 'mita.kalita@owner.demo',
  }});

  await prisma.property.create({ data: {
    title: 'Twin-Sharing PG for Girls - Ganeshguri', description: 'Clean and safe twin-sharing PG in Ganeshguri. Home-cooked Assamese food twice daily. Warden available 24/7.',
    street: 'Ganeshguri Colony Lane 5', locality: 'Ganeshguri', city: 'Guwahati', state: 'Assam', pincode: '781005', lat: 26.1678, lng: 91.7789,
    propertyType: 'pg', rent: 5800, deposit: 11600, furnishing: 'semi_furnished', genderPreference: 'girls',
    wifi: true, attachedBathroom: true, laundry: true, powerBackup: true, food: true, waterFilter: true,
    houseRules: j([]),
    availableFrom: new Date('2024-01-20'),
    images: j(['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800']),
    ownerId: suresh.id, college: 'Cotton University', distanceFromCollege: 2.8, verificationStatus: 'verified',
    views: 178, avgRating: 4.3, reviewCount: 9, scamRiskScore: 3, scamRiskLevel: 'low',
    scamRiskFlags: j([]),
    contactPhone: '9876002001', contactEmail: 'suresh.deka@owner.demo',
  }});

  await prisma.property.create({ data: {
    title: 'Studio Apartment for Working Students', description: 'Self-contained studio apartment. Fully independent. Private kitchen, AC, high-speed broadband. Secure building.',
    street: 'GNB Road, Near RG Baruah Ground', locality: 'Zoo Road', city: 'Guwahati', state: 'Assam', pincode: '781005', lat: 26.1812, lng: 91.7612,
    propertyType: 'flat', rent: 14000, deposit: 28000, furnishing: 'furnished', genderPreference: 'coed',
    wifi: true, ac: true, attachedBathroom: true, parking: true, powerBackup: true, refrigerator: true, tv: true, waterFilter: true,
    houseRules: j([]),
    availableFrom: new Date('2024-02-20'),
    images: j(['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800']),
    ownerId: demoOwner.id, college: 'Cotton University', distanceFromCollege: 3.2, verificationStatus: 'verified',
    views: 95, avgRating: 4.8, reviewCount: 4, scamRiskScore: 2, scamRiskLevel: 'low',
    scamRiskFlags: j([]),
    contactPhone: '9876543211', contactEmail: 'owner@campusnest.demo',
  }});

  console.log('✅ Created 12 properties');

  // ── ROOMMATE PROFILES ────────────────────────────────────
  await prisma.roommateProfile.createMany({ data: [
    { userId: demoStudent.id, name: 'Priya Sharma', college: 'Gauhati University', budgetMin: 4000, budgetMax: 8000, preferredLocality: 'Jalukbari', moveInDate: new Date('2024-02-01'), roomType: 'pg', genderPreference: 'female', sleepSchedule: 'early_bird', studyHabits: 'quiet', cleanliness: 'very_clean', smoking: false, drinking: false, foodPreference: 'veg', noiseTolerance: 'low', visitors: 'occasional', pets: false, bio: 'Final year BSc. Love reading and quiet evenings.' },
    { userId: ankita.id, name: 'Ankita Das', college: 'Assam Engineering College', budgetMin: 5000, budgetMax: 10000, preferredLocality: 'Chandmari', moveInDate: new Date('2024-02-15'), roomType: 'flat', genderPreference: 'female', sleepSchedule: 'night_owl', studyHabits: 'with_music', cleanliness: 'clean', smoking: false, drinking: false, foodPreference: 'any', noiseTolerance: 'medium', visitors: 'occasional', pets: false, bio: 'CSE student at AEC. Night coder! Looking for a chill flatmate.' },
    { userId: rohan.id, name: 'Rohan Borah', college: 'Cotton University', budgetMin: 3000, budgetMax: 6000, preferredLocality: 'Ganeshguri', moveInDate: new Date('2024-03-01'), roomType: 'shared', genderPreference: 'male', sleepSchedule: 'flexible', studyHabits: 'social', cleanliness: 'moderate', smoking: false, drinking: true, foodPreference: 'non_veg', noiseTolerance: 'high', visitors: 'frequent', pets: true, bio: 'Arts student who loves football and music.' },
    { userId: meenakshi.id, name: 'Meenakshi Gogoi', college: 'Gauhati Commerce College', budgetMin: 4000, budgetMax: 7000, preferredLocality: 'Dispur', moveInDate: new Date('2024-02-01'), roomType: 'pg', genderPreference: 'female', sleepSchedule: 'early_bird', studyHabits: 'quiet', cleanliness: 'clean', smoking: false, drinking: false, foodPreference: 'veg', noiseTolerance: 'low', visitors: 'never', pets: false, bio: 'Commerce student preparing for CA. Need a quiet environment.' },
    { userId: biplab.id, name: 'Biplab Nath', college: 'Assam Engineering College', budgetMin: 6000, budgetMax: 12000, preferredLocality: 'Jalukbari', moveInDate: new Date('2024-01-20'), roomType: 'flat', genderPreference: 'male', sleepSchedule: 'night_owl', studyHabits: 'with_music', cleanliness: 'clean', smoking: false, drinking: true, foodPreference: 'non_veg', noiseTolerance: 'medium', visitors: 'occasional', pets: false, bio: 'Mechanical engineer student. Love cooking and cricket.' },
    { userId: priyanka.id, name: 'Priyanka Baruah', college: 'Gauhati University', budgetMin: 5000, budgetMax: 9000, preferredLocality: 'Zoo Road', moveInDate: new Date('2024-03-01'), roomType: 'pg', genderPreference: 'female', sleepSchedule: 'flexible', studyHabits: 'flexible', cleanliness: 'very_clean', smoking: false, drinking: false, foodPreference: 'veg', noiseTolerance: 'medium', visitors: 'occasional', pets: true, bio: 'Mass comm student. Love art, chai, and good conversations.' },
    { userId: suresh.id, name: 'Suresh Deka', college: 'Gauhati University', budgetMin: 3000, budgetMax: 5000, preferredLocality: 'Jalukbari', moveInDate: new Date('2024-02-10'), roomType: 'shared', genderPreference: 'male', sleepSchedule: 'early_bird', studyHabits: 'quiet', cleanliness: 'moderate', smoking: false, drinking: false, foodPreference: 'any', noiseTolerance: 'medium', visitors: 'occasional', pets: false, bio: 'Working part time. Need a budget room.' },
    { userId: mita.id, name: 'Mita Kalita', college: 'Cotton University', budgetMin: 4500, budgetMax: 8500, preferredLocality: 'Chandmari', moveInDate: new Date('2024-02-20'), roomType: 'pg', genderPreference: 'female', sleepSchedule: 'early_bird', studyHabits: 'quiet', cleanliness: 'clean', smoking: false, drinking: false, foodPreference: 'veg', noiseTolerance: 'low', visitors: 'occasional', pets: false, bio: 'English Hons student. Bookworm and occasional baker.' },
  ]});
  console.log('✅ Created 8 roommate profiles');

  // ── REVIEWS ─────────────────────────────────────────────
  await prisma.review.createMany({ data: [
    { propertyId: p1.id, studentId: ankita.id, roomQuality: 4, locality: 5, water: 4, electricity: 5, internet: 4, ownerBehaviour: 5, safety: 5, valueForMoney: 4, overallRating: 4.5, comment: 'Excellent PG! Very close to university, owner is very helpful. Would highly recommend.' },
    { propertyId: p1.id, studentId: meenakshi.id, roomQuality: 4, locality: 4, water: 4, electricity: 4, internet: 3, ownerBehaviour: 4, safety: 4, valueForMoney: 4, overallRating: 3.9, comment: 'Good PG overall. WiFi could be faster but other facilities are great.' },
    { propertyId: p2.id, studentId: priyanka.id, roomQuality: 5, locality: 4, water: 5, electricity: 5, internet: 5, ownerBehaviour: 5, safety: 5, valueForMoney: 4, overallRating: 4.8, comment: 'Best hostel near AEC! Security is top-notch. The mess food is surprisingly good.' },
    { propertyId: p3.id, studentId: biplab.id, roomQuality: 3, locality: 4, water: 4, electricity: 3, internet: 4, ownerBehaviour: 4, safety: 3, valueForMoney: 4, overallRating: 3.6, comment: 'Decent budget flat. Very affordable. Power cuts occasionally but manageable.' },
    { propertyId: p4.id, studentId: rohan.id, roomQuality: 5, locality: 5, water: 5, electricity: 5, internet: 5, ownerBehaviour: 5, safety: 5, valueForMoney: 4, overallRating: 4.9, comment: 'Amazing room! AC, attached bathroom, perfect for focused studying. Worth it.' },
    { propertyId: p6.id, studentId: demoStudent.id, roomQuality: 4, locality: 4, water: 4, electricity: 4, internet: 5, ownerBehaviour: 4, safety: 4, valueForMoney: 3, overallRating: 4.0, comment: 'Lovely co-ed flat in Ganeshguri. Flatmates are friendly. Transport is excellent.' },
    { propertyId: p8.id, studentId: ankita.id, roomQuality: 5, locality: 4, water: 5, electricity: 5, internet: 5, ownerBehaviour: 5, safety: 5, valueForMoney: 3, overallRating: 4.6, comment: 'Excellent premium hostel! Study rooms are great, gym is a bonus.' },
    { propertyId: p8.id, studentId: biplab.id, roomQuality: 5, locality: 5, water: 5, electricity: 5, internet: 5, ownerBehaviour: 4, safety: 5, valueForMoney: 4, overallRating: 4.8, comment: 'Best hostel experience. Very clean, well-managed, food is great.' },
    { propertyId: p2.id, studentId: meenakshi.id, roomQuality: 4, locality: 5, water: 4, electricity: 4, internet: 4, ownerBehaviour: 5, safety: 5, valueForMoney: 4, overallRating: 4.4, comment: 'Safe and secure girls hostel. Very convenient for AEC.' },
    { propertyId: p3.id, studentId: rohan.id, roomQuality: 3, locality: 4, water: 3, electricity: 3, internet: 4, ownerBehaviour: 3, safety: 3, valueForMoney: 5, overallRating: 3.5, comment: 'Very cheap. No AC or attached bathroom but excellent value for money.' },
  ]});
  console.log('✅ Created 10 reviews');

  // ── ENQUIRIES ───────────────────────────────────────────
  await prisma.enquiry.createMany({ data: [
    { propertyId: p1.id, studentId: demoStudent.id, ownerId: demoOwner.id, studentName: 'Priya Sharma', contactNumber: '9876543210', preferredVisitDate: new Date('2024-02-05'), moveInDate: new Date('2024-02-15'), message: 'Hi, I am a 3rd year BSc student at GU. Interested in the PG. Can I visit this weekend?', status: 'responded', ownerResponse: 'Yes, room is available. Please come Saturday 11 AM.' },
    { propertyId: p2.id, studentId: ankita.id, ownerId: suresh.id, studentName: 'Ankita Das', contactNumber: '9876001001', preferredVisitDate: new Date('2024-02-08'), moveInDate: new Date('2024-02-20'), message: 'I am an AEC student looking for girls hostel. Is the AC room available?', status: 'seen' },
    { propertyId: p4.id, studentId: rohan.id, ownerId: demoOwner.id, studentName: 'Rohan Borah', contactNumber: '9876001002', preferredVisitDate: new Date('2024-02-10'), moveInDate: new Date('2024-03-01'), message: 'Looking for the AC room near Zoo Road. Can I negotiate the deposit?', status: 'pending' },
  ]});
  console.log('✅ Created 3 enquiries');

  // ── REPORTS ─────────────────────────────────────────────
  await prisma.report.createMany({ data: [
    { propertyId: p7.id, reportedById: demoStudent.id, reason: 'fake_listing', description: 'Owner asking advance payment before showing property. Rent unrealistically low.', status: 'pending' },
    { propertyId: p7.id, reportedById: ankita.id, reason: 'advance_payment', description: 'Owner called and asked for ₹10,000 UPI advance before confirming visit.', status: 'pending' },
    { propertyId: p5.id, reportedById: meenakshi.id, reason: 'wrong_info', description: 'Listing shows WiFi but property has no working internet. Photos do not match.', status: 'reviewed', adminNotes: 'Owner contacted. Photos to be updated.' },
  ]});
  console.log('✅ Created 3 reports');

  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────────');
  console.log('Demo Accounts:');
  console.log('  Student → student@campusnest.demo / Demo@123');
  console.log('  Owner   → owner@campusnest.demo  / Demo@123');
  console.log('  Admin   → admin@campusnest.demo  / Demo@123');
  console.log('─────────────────────────────────');

  await prisma.$disconnect();
  process.exit(0);
}

seed().catch((err) => { console.error('❌ Seed failed:', err); process.exit(1); });
