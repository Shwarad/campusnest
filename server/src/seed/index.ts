import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

const j = (arr: string[]) => JSON.stringify(arr);

// ─── helpers ──────────────────────────────────────────────────────────────────
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randF(min: number, max: number, dp = 1) { return parseFloat((Math.random() * (max - min) + min).toFixed(dp)); }

// ─── reference data ───────────────────────────────────────────────────────────
const CITIES = [
  { city: 'Guwahati',   state: 'Assam',         pinBase: '78100' },
  { city: 'Dibrugarh',  state: 'Assam',         pinBase: '78600' },
  { city: 'Silchar',    state: 'Assam',         pinBase: '78800' },
  { city: 'Jorhat',     state: 'Assam',         pinBase: '78500' },
  { city: 'Tezpur',     state: 'Assam',         pinBase: '78400' },
  { city: 'Nagaon',     state: 'Assam',         pinBase: '78200' },
  { city: 'Kolkata',    state: 'West Bengal',   pinBase: '70000' },
  { city: 'Shillong',   state: 'Meghalaya',     pinBase: '79300' },
  { city: 'Agartala',   state: 'Tripura',       pinBase: '79900' },
  { city: 'Imphal',     state: 'Manipur',       pinBase: '79500' },
];

const COLLEGES_BY_CITY: Record<string, string[]> = {
  Guwahati:  ['Gauhati University', 'Assam Engineering College', 'Cotton University', 'Gauhati Commerce College', 'Handique Girls College', 'IIT Guwahati', 'NIT Silchar'],
  Dibrugarh: ['Dibrugarh University', 'Dibrugarh University Institute of Engineering', 'Assam Medical College'],
  Silchar:   ['NIT Silchar', 'Silchar Medical College', 'Gurucharan College'],
  Jorhat:    ['Jorhat Engineering College', 'Assam Agricultural University', 'Jorhat Medical College'],
  Tezpur:    ['Tezpur University', 'Tezpur Medical College'],
  Nagaon:    ['Nagaon Commerce College', 'B. Borooah College Nagaon'],
  Kolkata:   ['Jadavpur University', 'Presidency University', 'Calcutta University', 'IIT Kharagpur'],
  Shillong:  ['NEHU Shillong', 'St. Edmunds College', 'NEIGRIHMS Medical College'],
  Agartala:  ['NIT Agartala', 'Tripura Medical College', 'MBB College Agartala'],
  Imphal:    ['Manipur University', 'NIT Manipur', 'RIMS Medical College'],
};

const LOCALITIES_BY_CITY: Record<string, { locality: string; lat: number; lng: number }[]> = {
  Guwahati: [
    { locality: 'Jalukbari',   lat: 26.1445, lng: 91.6897 },
    { locality: 'Chandmari',   lat: 26.1567, lng: 91.7362 },
    { locality: 'Dispur',      lat: 26.1341, lng: 91.7898 },
    { locality: 'Zoo Road',    lat: 26.1759, lng: 91.7547 },
    { locality: 'Panbazar',    lat: 26.1829, lng: 91.7461 },
    { locality: 'Ganeshguri',  lat: 26.1632, lng: 91.7701 },
    { locality: 'Beltola',     lat: 26.1195, lng: 91.7815 },
    { locality: 'Kahilipara',  lat: 26.1342, lng: 91.7621 },
    { locality: 'Six Mile',    lat: 26.1289, lng: 91.8123 },
    { locality: 'VIP Road',    lat: 26.1502, lng: 91.7934 },
    { locality: 'Paltan Bazar',lat: 26.1862, lng: 91.7502 },
    { locality: 'Ulubari',     lat: 26.1712, lng: 91.7398 },
    { locality: 'Rehabari',    lat: 26.1634, lng: 91.7289 },
    { locality: 'Bhangagarh',  lat: 26.1743, lng: 91.7612 },
  ],
  Dibrugarh: [
    { locality: 'Chowkidinghee', lat: 27.4728, lng: 94.9120 },
    { locality: 'AT Road',       lat: 27.4812, lng: 94.9034 },
    { locality: 'Lahowal',       lat: 27.4603, lng: 94.9345 },
  ],
  Silchar: [
    { locality: 'Tarapur',       lat: 24.8312, lng: 92.7834 },
    { locality: 'Ambikapur',     lat: 24.8198, lng: 92.7912 },
    { locality: 'Link Road',     lat: 24.8267, lng: 92.7756 },
  ],
  Jorhat: [
    { locality: 'AT Road Jorhat', lat: 26.7509, lng: 94.2037 },
    { locality: 'Cinnamara',      lat: 26.7389, lng: 94.1834 },
  ],
  Tezpur: [
    { locality: 'Dekargaon',  lat: 26.6328, lng: 92.7812 },
    { locality: 'Tezpur Town',lat: 26.6298, lng: 92.7967 },
  ],
  Nagaon: [
    { locality: 'BN College Road', lat: 26.3481, lng: 92.6823 },
    { locality: 'Haibargaon',      lat: 26.3567, lng: 92.6934 },
  ],
  Kolkata: [
    { locality: 'Jadavpur',      lat: 22.4998, lng: 88.3712 },
    { locality: 'Ballygunge',    lat: 22.5237, lng: 88.3698 },
    { locality: 'Tollygunge',    lat: 22.4890, lng: 88.3567 },
    { locality: 'Salt Lake',     lat: 22.5645, lng: 88.4234 },
    { locality: 'Dum Dum',       lat: 22.6234, lng: 88.4012 },
  ],
  Shillong: [
    { locality: 'Laban',    lat: 25.5516, lng: 91.8934 },
    { locality: 'Nongthymmai', lat: 25.5762, lng: 91.9123 },
    { locality: 'Mawlai',   lat: 25.5998, lng: 91.9267 },
  ],
  Agartala: [
    { locality: 'Battala',   lat: 23.8312, lng: 91.2867 },
    { locality: 'Motor Stand', lat: 23.8267, lng: 91.2978 },
  ],
  Imphal: [
    { locality: 'Singjamei', lat: 24.8398, lng: 93.9234 },
    { locality: 'Keishampat',lat: 24.8156, lng: 93.9378 },
  ],
};

const PROPERTY_TYPES = ['room', 'pg', 'hostel', 'flat', 'shared_room'] as const;
const FURNISHING     = ['furnished', 'semi_furnished', 'unfurnished'] as const;
const GENDER_PREFS   = ['boys', 'girls', 'coed'] as const;
const VERIFICATION   = ['verified', 'verified', 'verified', 'pending', 'unverified'] as const;
const SCAM_LEVELS    = ['low', 'low', 'low', 'review_recommended', 'high'] as const;

const TITLE_TEMPLATES = [
  (type: string, locality: string) => `Spacious ${type.toUpperCase()} for Students near ${locality}`,
  (type: string, locality: string) => `Affordable ${type.toUpperCase()} in ${locality} — Bills Included`,
  (type: string, locality: string) => `Well-Furnished ${type.toUpperCase()} at ${locality}`,
  (type: string, locality: string) => `Budget ${type.toUpperCase()} — ${locality} Area`,
  (type: string, locality: string) => `Premium ${type.toUpperCase()} with All Amenities — ${locality}`,
  (type: string, locality: string) => `Cozy ${type.toUpperCase()} for Girls near ${locality}`,
  (type: string, locality: string) => `Modern ${type.toUpperCase()} for Boys — ${locality}`,
  (type: string, locality: string) => `${locality} ${type.toUpperCase()} — Walking Distance from College`,
  (type: string, locality: string) => `Fully-Furnished ${type.toUpperCase()} | ${locality}`,
  (type: string, locality: string) => `Student ${type.toUpperCase()} with WiFi & Power Backup — ${locality}`,
];

const DESC_TEMPLATES = [
  'Comfortable and clean accommodation ideal for students. All basic amenities provided. Close to public transport and markets.',
  'Well-maintained property with 24/7 water supply and power backup. Ideal for students appearing for competitive exams. Owner is cooperative and responsive.',
  'Peaceful locality with excellent connectivity to colleges. Rooms are airy and well-lit. Security cameras installed.',
  'Budget-friendly option without compromising on cleanliness. Shared kitchen and common room available. Students from all colleges welcome.',
  'Premium accommodation with modern interiors. High-speed WiFi and AC in every room. Very close to the college gate.',
  'Newly renovated rooms with attached bathrooms. Home-cooked meals available. Strict no-noise policy after 10 PM.',
  'Friendly co-living space with like-minded students. Regular housekeeping. Mess facility available on request.',
  'Safe locality with CCTV and 24/7 security guard. Power backup ensures no study disruptions. Easy access to ATMs and medical stores.',
  'Great community of students from top colleges. Common study hall available. Rent includes electricity and water.',
  'Minimalist but comfortable rooms. Ideal for students who prefer privacy. Pet-friendly on request.',
];

const HOUSE_RULE_POOL = [
  'No smoking inside premises',
  'Guests allowed till 9 PM only',
  'No loud music after 10 PM',
  'Girls only',
  'Boys only',
  'Curfew at 10 PM',
  'No alcohol on premises',
  'Shared kitchen usage on roster',
  'Maintain cleanliness in common areas',
  'Respect other tenants',
  'No parties without prior notice',
  'Vegetarians preferred',
  'Study hours: 8–10 PM',
  'Visitors allowed in common room only',
  'Register guests with warden',
];

const NEARBY_FACILITY_POOL = [
  { name: 'D-Mart Supermarket',    type: 'grocery' },
  { name: 'Apollo Pharmacy',        type: 'pharmacy' },
  { name: 'HDFC ATM',               type: 'atm' },
  { name: 'SBI Branch',             type: 'atm' },
  { name: 'City Bus Stop',          type: 'bus_stop' },
  { name: 'Metro Bus Stand',        type: 'bus_stop' },
  { name: 'Café Coffee Day',        type: 'cafe' },
  { name: 'Canteen at College',     type: 'restaurant' },
  { name: 'District Hospital',      type: 'hospital' },
  { name: 'Health Clinic',          type: 'hospital' },
  { name: 'Local Gym',              type: 'gym' },
  { name: 'More Supermarket',       type: 'grocery' },
  { name: 'Big Bazaar',             type: 'grocery' },
  { name: 'Reliance Fresh',         type: 'grocery' },
  { name: 'Railway Station',        type: 'bus_stop' },
];

const DISTANCES = ['50m', '100m', '150m', '200m', '250m', '300m', '400m', '500m', '600m', '800m', '1 km'];

const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
  'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
  'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
  'https://images.unsplash.com/photo-1522444195799-478538b28823?w=800',
];

// ─── rent ranges by type ──────────────────────────────────────────────────────
const RENT_RANGES: Record<string, [number, number]> = {
  shared_room: [2000, 4500],
  pg:          [4000, 9000],
  hostel:      [5000, 14000],
  room:        [5000, 12000],
  flat:        [7000, 20000],
};

// ─── main seed ────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Connecting to database...');
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

  // ── FIXED DEMO USERS ──────────────────────────────────────────────────────
  const demoStudent = await prisma.user.create({ data: { name: 'Priya Sharma', email: 'student@campusnest.demo', phone: '9876543210', password: pwd, role: 'student', college: 'Gauhati University', isVerified: true, identityStatus: 'verified' } });
  const demoOwner   = await prisma.user.create({ data: { name: 'Rajesh Kumar', email: 'owner@campusnest.demo', phone: '9876543211', password: pwd, role: 'owner', isVerified: true, identityStatus: 'verified' } });
  const adminUser   = await prisma.user.create({ data: { name: 'Admin User', email: 'admin@campusnest.demo', phone: '9876543212', password: pwd, role: 'admin', isVerified: true, identityStatus: 'verified' } });

  // Additional demo students / owners
  const ankita    = await prisma.user.create({ data: { name: 'Ankita Das',       email: 'ankita.das@student.demo',    phone: '9876001001', password: pwd, role: 'student', college: 'Assam Engineering College', isVerified: true, identityStatus: 'verified' } });
  const rohan     = await prisma.user.create({ data: { name: 'Rohan Borah',      email: 'rohan.borah@student.demo',   phone: '9876001002', password: pwd, role: 'student', college: 'Cotton University' } });
  const meenakshi = await prisma.user.create({ data: { name: 'Meenakshi Gogoi',  email: 'meenakshi.gogoi@student.demo',phone: '9876001003', password: pwd, role: 'student', college: 'Gauhati Commerce College', isVerified: true, identityStatus: 'verified' } });
  const biplab    = await prisma.user.create({ data: { name: 'Biplab Nath',      email: 'biplab.nath@student.demo',   phone: '9876001004', password: pwd, role: 'student', college: 'Assam Engineering College' } });
  const priyanka  = await prisma.user.create({ data: { name: 'Priyanka Baruah', email: 'priyanka.baruah@student.demo',phone: '9876001005', password: pwd, role: 'student', college: 'Gauhati University', isVerified: true, identityStatus: 'verified' } });
  const suresh    = await prisma.user.create({ data: { name: 'Suresh Deka',     email: 'suresh.deka@owner.demo',     phone: '9876002001', password: pwd, role: 'owner', isVerified: true, identityStatus: 'verified' } });
  const mita      = await prisma.user.create({ data: { name: 'Mita Kalita',     email: 'mita.kalita@owner.demo',     phone: '9876002002', password: pwd, role: 'owner', isVerified: true, identityStatus: 'pending' } });
  const binod     = await prisma.user.create({ data: { name: 'Binod Saikia',    email: 'binod.saikia@owner.demo',    phone: '9876002003', password: pwd, role: 'owner' } });

  // Extra owners for bulk data
  const ownerPool = [demoOwner, suresh, mita, binod];
  const allOwners: typeof demoOwner[] = [];

  const extraOwnerNames = [
    ['Deepak Hazarika',   'deepak.h'],   ['Rekha Boruah',    'rekha.b'],
    ['Ajit Choudhury',    'ajit.c'],     ['Mamoni Saikia',   'mamoni.s'],
    ['Dilip Baruah',      'dilip.b'],    ['Ritu Devi',       'ritu.d'],
    ['Kamal Nath',        'kamal.n'],    ['Hema Dutta',      'hema.d'],
    ['Pranab Gogoi',      'pranab.g'],   ['Sunita Das',      'sunita.d'],
    ['Nirmal Bora',       'nirmal.b'],   ['Anjali Sharma',   'anjali.s'],
    ['Bhaskar Kalita',    'bhaskar.k'],  ['Priti Nath',      'priti.n'],
    ['Subhash Medhi',     'subhash.m'],  ['Karuna Borah',    'karuna.b'],
    ['Hemanta Phukan',    'hemanta.p'],  ['Gayatri Roy',     'gayatri.r'],
    ['Lakshmi Devi',      'lakshmi.d'],  ['Tarun Saikia',    'tarun.s'],
  ];
  for (let i = 0; i < extraOwnerNames.length; i++) {
    const [name, slug] = extraOwnerNames[i];
    const o = await prisma.user.create({ data: {
      name, email: `${slug}@owner.demo`, phone: `98760${(3 + i).toString().padStart(5, '0')}`,
      password: pwd, role: 'owner',
      isVerified: rand(0, 1) === 1,
      identityStatus: pick(['verified', 'verified', 'pending', 'unverified']),
    }});
    allOwners.push(o);
  }
  allOwners.push(...ownerPool);

  console.log(`✅ Created ${3 + 8 + allOwners.length} users`);

  // ── BULK PROPERTY GENERATION ────────────────────────────────────────────────
  const propertyIds: string[] = [];
  const propertyOwnerMap: { propertyId: string; ownerId: string }[] = [];

  let propertyCount = 0;
  const TARGET = 512; // generates 512+ including the detailed ones below

  for (let i = 0; i < TARGET; i++) {
    const cityData   = pick(CITIES);
    const localities = LOCALITIES_BY_CITY[cityData.city] || [{ locality: cityData.city, lat: 26.14, lng: 91.74 }];
    const locData    = pick(localities);
    const colleges   = COLLEGES_BY_CITY[cityData.city] || ['Local University'];
    const college    = pick(colleges);
    const propType   = pick(PROPERTY_TYPES);
    const furnishing = pick(FURNISHING);
    const gender     = pick(GENDER_PREFS);
    const [rentMin, rentMax] = RENT_RANGES[propType];
    const rent       = rand(rentMin, rentMax);
    const deposit    = rent * pick([1, 2, 2, 3]);
    const owner      = pick(allOwners);
    const verStatus  = pick(VERIFICATION);
    const scamLevel  = verStatus === 'unverified' ? pick(['review_recommended', 'high', 'low']) : 'low';
    const scamScore  = scamLevel === 'high' ? rand(35, 70) : scamLevel === 'review_recommended' ? rand(15, 34) : rand(0, 12);
    const scamFlags  = scamLevel === 'high'
      ? pickN(['No property photos', 'Rent significantly below area average', 'Owner identity not verified', 'Advance payment demanded'], 3)
      : scamLevel === 'review_recommended'
      ? pickN(['No property photos (only 1)', 'Owner identity not verified'], 1)
      : [];
    const totalRooms     = rand(1, 20);
    const availableBeds  = rand(0, Math.min(totalRooms, 8));
    const houseRules     = pickN(HOUSE_RULE_POOL, rand(0, 4));
    const imgCount       = scamLevel === 'high' ? 0 : rand(1, 3);
    const images         = pickN(UNSPLASH_IMAGES, imgCount);
    const numFacilities  = rand(1, 4);
    const facilityPicks  = pickN(NEARBY_FACILITY_POOL, numFacilities);
    const pincode        = `${cityData.pinBase}${rand(1, 9)}`;
    const latJitter      = (Math.random() - 0.5) * 0.05;
    const lngJitter      = (Math.random() - 0.5) * 0.05;
    const avgRating      = availableBeds === 0 ? 0 : randF(2.5, 5.0);
    const reviewCount    = avgRating === 0 ? 0 : rand(1, 20);
    const views          = rand(10, 600);
    const titleFn        = pick(TITLE_TEMPLATES);
    const title          = titleFn(propType, locData.locality);
    const description    = pick(DESC_TEMPLATES);

    const p = await prisma.property.create({ data: {
      title,
      description,
      street: `House No. ${rand(1, 300)}, ${locData.locality} ${pick(['Road', 'Lane', 'Colony', 'Nagar', 'Block'])} ${rand(1, 10)}`,
      locality: locData.locality,
      city: cityData.city,
      state: cityData.state,
      pincode,
      lat:  locData.lat  + latJitter,
      lng:  locData.lng  + lngJitter,
      propertyType: propType,
      rent,
      deposit,
      totalRooms,
      availableBeds,
      furnishing,
      genderPreference: gender,
      wifi:            rand(0, 1) === 1,
      ac:              rand(0, 3) > 1 ? true : false,
      attachedBathroom:rand(0, 1) === 1,
      parking:         rand(0, 3) > 2 ? true : false,
      laundry:         rand(0, 3) > 2 ? true : false,
      powerBackup:     rand(0, 1) === 1,
      petFriendly:     rand(0, 5) > 4 ? true : false,
      food:            propType === 'hostel' || propType === 'pg' ? rand(0, 1) === 1 : false,
      gym:             propType === 'hostel' && rand(0, 3) > 2 ? true : false,
      tv:              rand(0, 3) > 2 ? true : false,
      refrigerator:    rand(0, 3) > 2 ? true : false,
      waterFilter:     rand(0, 1) === 1,
      houseRules:      j(houseRules),
      availableFrom:   new Date(Date.now() - rand(0, 90) * 86400000),
      images:          j(images),
      college,
      distanceFromCollege: randF(0.1, 5.0),
      verificationStatus: verStatus,
      isAvailable:     availableBeds > 0,
      isActive:        true,
      views,
      avgRating,
      reviewCount,
      scamRiskScore:   scamScore,
      scamRiskLevel:   scamLevel,
      scamRiskFlags:   j(scamFlags),
      contactPhone:    `9876${rand(100000, 999999)}`,
      contactEmail:    owner.email,
      ownerId:         owner.id,
      facilities: {
        create: facilityPicks.map((f) => ({
          name: f.name,
          type: f.type,
          distance: pick(DISTANCES),
        })),
      },
    }});

    propertyIds.push(p.id);
    propertyOwnerMap.push({ propertyId: p.id, ownerId: owner.id });
    propertyCount++;
  }

  // ── DETAILED SHOWCASE PROPERTIES (original 12, kept for demo accounts) ──────
  const p1 = await prisma.property.create({ data: {
    title: 'Spacious PG for Boys near Gauhati University', description: 'Well-maintained boys PG in Jalukbari. Walking distance from GU main gate. Clean rooms with attached bathrooms. Power backup and 24/7 water supply.',
    street: 'House No. 12, Jalukbari Road', locality: 'Jalukbari', city: 'Guwahati', state: 'Assam', pincode: '781014', lat: 26.1445, lng: 91.6897,
    propertyType: 'pg', rent: 6500, deposit: 13000, totalRooms: 8, availableBeds: 3, furnishing: 'furnished', genderPreference: 'boys',
    wifi: true, attachedBathroom: true, parking: true, laundry: true, powerBackup: true, food: true, waterFilter: true,
    houseRules: j(['No smoking inside', 'Guests allowed till 9 PM', 'No loud music after 10 PM']),
    availableFrom: new Date('2024-01-15'),
    images: j(['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800']),
    ownerId: demoOwner.id, college: 'Gauhati University', distanceFromCollege: 0.4, verificationStatus: 'verified',
    views: 234, avgRating: 4.3, reviewCount: 7, scamRiskScore: 5, scamRiskLevel: 'low', scamRiskFlags: j([]),
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
    views: 187, avgRating: 4.5, reviewCount: 12, scamRiskScore: 2, scamRiskLevel: 'low', scamRiskFlags: j([]),
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
    views: 98, avgRating: 3.8, reviewCount: 4, scamRiskScore: 10, scamRiskLevel: 'low', scamRiskFlags: j([]),
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
    views: 156, avgRating: 4.6, reviewCount: 5, scamRiskScore: 3, scamRiskLevel: 'low', scamRiskFlags: j([]),
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
    views: 211, avgRating: 4.2, reviewCount: 8, scamRiskScore: 4, scamRiskLevel: 'low', scamRiskFlags: j([]),
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
    views: 412, avgRating: 4.7, reviewCount: 18, scamRiskScore: 1, scamRiskLevel: 'low', scamRiskFlags: j([]),
    contactPhone: '9876002001', contactEmail: 'suresh.deka@owner.demo',
    facilities: { create: [{ name: 'AEC Main Canteen', type: 'restaurant', distance: '300m' }, { name: 'State Bank Branch', type: 'atm', distance: '400m' }] },
  }});

  propertyCount += 8;
  console.log(`✅ Created ${propertyCount} properties (${TARGET} bulk + 8 showcase)`);

  // ── ROOMMATE PROFILES ────────────────────────────────────────────────────────
  await prisma.roommateProfile.createMany({ data: [
    { userId: demoStudent.id, name: 'Priya Sharma',     college: 'Gauhati University',        budgetMin: 4000, budgetMax: 8000,  preferredLocality: 'Jalukbari',  moveInDate: new Date('2024-02-01'), roomType: 'pg',     genderPreference: 'female', sleepSchedule: 'early_bird', studyHabits: 'quiet',      cleanliness: 'very_clean', smoking: false, drinking: false, foodPreference: 'veg',     noiseTolerance: 'low',    visitors: 'occasional', pets: false, bio: 'Final year BSc. Love reading and quiet evenings.' },
    { userId: ankita.id,      name: 'Ankita Das',       college: 'Assam Engineering College', budgetMin: 5000, budgetMax: 10000, preferredLocality: 'Chandmari',  moveInDate: new Date('2024-02-15'), roomType: 'flat',   genderPreference: 'female', sleepSchedule: 'night_owl',  studyHabits: 'with_music', cleanliness: 'clean',      smoking: false, drinking: false, foodPreference: 'any',     noiseTolerance: 'medium', visitors: 'occasional', pets: false, bio: 'CSE student at AEC. Night coder! Looking for a chill flatmate.' },
    { userId: rohan.id,       name: 'Rohan Borah',      college: 'Cotton University',         budgetMin: 3000, budgetMax: 6000,  preferredLocality: 'Ganeshguri', moveInDate: new Date('2024-03-01'), roomType: 'shared', genderPreference: 'male',   sleepSchedule: 'flexible',   studyHabits: 'social',     cleanliness: 'moderate',   smoking: false, drinking: true,  foodPreference: 'non_veg', noiseTolerance: 'high',   visitors: 'frequent',   pets: true,  bio: 'Arts student who loves football and music.' },
    { userId: meenakshi.id,   name: 'Meenakshi Gogoi',  college: 'Gauhati Commerce College',  budgetMin: 4000, budgetMax: 7000,  preferredLocality: 'Dispur',     moveInDate: new Date('2024-02-01'), roomType: 'pg',     genderPreference: 'female', sleepSchedule: 'early_bird', studyHabits: 'quiet',      cleanliness: 'clean',      smoking: false, drinking: false, foodPreference: 'veg',     noiseTolerance: 'low',    visitors: 'never',      pets: false, bio: 'Commerce student preparing for CA. Need a quiet environment.' },
    { userId: biplab.id,      name: 'Biplab Nath',      college: 'Assam Engineering College', budgetMin: 6000, budgetMax: 12000, preferredLocality: 'Jalukbari',  moveInDate: new Date('2024-01-20'), roomType: 'flat',   genderPreference: 'male',   sleepSchedule: 'night_owl',  studyHabits: 'with_music', cleanliness: 'clean',      smoking: false, drinking: true,  foodPreference: 'non_veg', noiseTolerance: 'medium', visitors: 'occasional', pets: false, bio: 'Mechanical engineer student. Love cooking and cricket.' },
    { userId: priyanka.id,    name: 'Priyanka Baruah',  college: 'Gauhati University',        budgetMin: 5000, budgetMax: 9000,  preferredLocality: 'Zoo Road',   moveInDate: new Date('2024-03-01'), roomType: 'pg',     genderPreference: 'female', sleepSchedule: 'flexible',   studyHabits: 'flexible',   cleanliness: 'very_clean', smoking: false, drinking: false, foodPreference: 'veg',     noiseTolerance: 'medium', visitors: 'occasional', pets: true,  bio: 'Mass comm student. Love art, chai, and good conversations.' },
    { userId: suresh.id,      name: 'Suresh Deka',      college: 'Gauhati University',        budgetMin: 3000, budgetMax: 5000,  preferredLocality: 'Jalukbari',  moveInDate: new Date('2024-02-10'), roomType: 'shared', genderPreference: 'male',   sleepSchedule: 'early_bird', studyHabits: 'quiet',      cleanliness: 'moderate',   smoking: false, drinking: false, foodPreference: 'any',     noiseTolerance: 'medium', visitors: 'occasional', pets: false, bio: 'Working part time. Need a budget room.' },
    { userId: mita.id,        name: 'Mita Kalita',      college: 'Cotton University',         budgetMin: 4500, budgetMax: 8500,  preferredLocality: 'Chandmari',  moveInDate: new Date('2024-02-20'), roomType: 'pg',     genderPreference: 'female', sleepSchedule: 'early_bird', studyHabits: 'quiet',      cleanliness: 'clean',      smoking: false, drinking: false, foodPreference: 'veg',     noiseTolerance: 'low',    visitors: 'occasional', pets: false, bio: 'English Hons student. Bookworm and occasional baker.' },
  ]});
  console.log('✅ Created 8 roommate profiles');

  // ── REVIEWS for showcase properties ─────────────────────────────────────────
  await prisma.review.createMany({ data: [
    { propertyId: p1.id, studentId: ankita.id,    roomQuality: 4, locality: 5, water: 4, electricity: 5, internet: 4, ownerBehaviour: 5, safety: 5, valueForMoney: 4, overallRating: 4.5, comment: 'Excellent PG! Very close to university, owner is very helpful. Would highly recommend.' },
    { propertyId: p1.id, studentId: meenakshi.id, roomQuality: 4, locality: 4, water: 4, electricity: 4, internet: 3, ownerBehaviour: 4, safety: 4, valueForMoney: 4, overallRating: 3.9, comment: 'Good PG overall. WiFi could be faster but other facilities are great.' },
    { propertyId: p2.id, studentId: priyanka.id,  roomQuality: 5, locality: 4, water: 5, electricity: 5, internet: 5, ownerBehaviour: 5, safety: 5, valueForMoney: 4, overallRating: 4.8, comment: 'Best hostel near AEC! Security is top-notch. The mess food is surprisingly good.' },
    { propertyId: p3.id, studentId: biplab.id,    roomQuality: 3, locality: 4, water: 4, electricity: 3, internet: 4, ownerBehaviour: 4, safety: 3, valueForMoney: 4, overallRating: 3.6, comment: 'Decent budget flat. Very affordable. Power cuts occasionally but manageable.' },
    { propertyId: p4.id, studentId: rohan.id,     roomQuality: 5, locality: 5, water: 5, electricity: 5, internet: 5, ownerBehaviour: 5, safety: 5, valueForMoney: 4, overallRating: 4.9, comment: 'Amazing room! AC, attached bathroom, perfect for focused studying. Worth it.' },
    { propertyId: p6.id, studentId: demoStudent.id, roomQuality: 4, locality: 4, water: 4, electricity: 4, internet: 5, ownerBehaviour: 4, safety: 4, valueForMoney: 3, overallRating: 4.0, comment: 'Lovely co-ed flat in Ganeshguri. Flatmates are friendly. Transport is excellent.' },
    { propertyId: p8.id, studentId: ankita.id,    roomQuality: 5, locality: 4, water: 5, electricity: 5, internet: 5, ownerBehaviour: 5, safety: 5, valueForMoney: 3, overallRating: 4.6, comment: 'Excellent premium hostel! Study rooms are great, gym is a bonus.' },
    { propertyId: p8.id, studentId: biplab.id,    roomQuality: 5, locality: 5, water: 5, electricity: 5, internet: 5, ownerBehaviour: 4, safety: 5, valueForMoney: 4, overallRating: 4.8, comment: 'Best hostel experience. Very clean, well-managed, food is great.' },
    { propertyId: p2.id, studentId: meenakshi.id, roomQuality: 4, locality: 5, water: 4, electricity: 4, internet: 4, ownerBehaviour: 5, safety: 5, valueForMoney: 4, overallRating: 4.4, comment: 'Safe and secure girls hostel. Very convenient for AEC.' },
    { propertyId: p3.id, studentId: rohan.id,     roomQuality: 3, locality: 4, water: 3, electricity: 3, internet: 4, ownerBehaviour: 3, safety: 3, valueForMoney: 5, overallRating: 3.5, comment: 'Very cheap. No AC or attached bathroom but excellent value for money.' },
  ]});
  console.log('✅ Created 10 reviews');

  // ── ENQUIRIES ────────────────────────────────────────────────────────────────
  await prisma.enquiry.createMany({ data: [
    { propertyId: p1.id, studentId: demoStudent.id, ownerId: demoOwner.id, studentName: 'Priya Sharma',    contactNumber: '9876543210', preferredVisitDate: new Date('2024-02-05'), moveInDate: new Date('2024-02-15'), message: 'Hi, I am a 3rd year BSc student at GU. Interested in the PG. Can I visit this weekend?', status: 'responded', ownerResponse: 'Yes, room is available. Please come Saturday 11 AM.' },
    { propertyId: p2.id, studentId: ankita.id,      ownerId: suresh.id,    studentName: 'Ankita Das',      contactNumber: '9876001001', preferredVisitDate: new Date('2024-02-08'), moveInDate: new Date('2024-02-20'), message: 'I am an AEC student looking for girls hostel. Is the AC room available?', status: 'seen' },
    { propertyId: p4.id, studentId: rohan.id,       ownerId: demoOwner.id, studentName: 'Rohan Borah',     contactNumber: '9876001002', preferredVisitDate: new Date('2024-02-10'), moveInDate: new Date('2024-03-01'), message: 'Looking for the AC room near Zoo Road. Can I negotiate the deposit?', status: 'pending' },
  ]});
  console.log('✅ Created 3 enquiries');

  // ── REPORTS ──────────────────────────────────────────────────────────────────
  await prisma.report.createMany({ data: [
    { propertyId: p7.id, reportedById: demoStudent.id, reason: 'fake_listing',     description: 'Owner asking advance payment before showing property. Rent unrealistically low.', status: 'pending' },
    { propertyId: p7.id, reportedById: ankita.id,      reason: 'advance_payment',  description: 'Owner called and asked for ₹10,000 UPI advance before confirming visit.', status: 'pending' },
    { propertyId: p5.id, reportedById: meenakshi.id,   reason: 'wrong_info',       description: 'Listing shows WiFi but property has no working internet. Photos do not match.', status: 'reviewed', adminNotes: 'Owner contacted. Photos to be updated.' },
  ]});
  console.log('✅ Created 3 reports');

  const finalCount = TARGET + 8;
  console.log(`\n🎉 Seed complete! ${finalCount} properties total.`);
  console.log('─────────────────────────────────');
  console.log('Demo Accounts (password: Demo@123):');
  console.log('  Student → student@campusnest.demo');
  console.log('  Owner   → owner@campusnest.demo');
  console.log('  Admin   → admin@campusnest.demo');
  console.log('─────────────────────────────────');

  // Print city breakdown
  const breakdown = await prisma.property.groupBy({ by: ['city'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } });
  console.log('Property distribution by city:');
  breakdown.forEach((r) => console.log(`  ${r.city.padEnd(15)} ${r._count.id}`));

  await prisma.$disconnect();
  process.exit(0);
}

seed().catch((err) => { console.error('❌ Seed failed:', err); process.exit(1); });
