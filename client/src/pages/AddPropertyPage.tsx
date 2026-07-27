import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, X, MapPin, Image as ImageIcon } from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  street: z.string().min(3, 'Street address required'),
  locality: z.string().min(2, 'Locality required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  pincode: z.string().length(6, 'Enter 6-digit pincode'),
  lat: z.number().optional(),
  lng: z.number().optional(),
  propertyType: z.enum(['room', 'pg', 'hostel', 'flat', 'shared_room']),
  rent: z.number().min(100, 'Minimum rent is ₹100'),
  deposit: z.number().min(0),
  totalRooms: z.number().min(1).optional(),
  availableBeds: z.number().min(0).optional(),
  furnishing: z.enum(['furnished', 'semi-furnished', 'unfurnished']),
  genderPreference: z.enum(['boys', 'girls', 'coed']),
  college: z.string().min(2, 'College name required'),
  distanceFromCollege: z.number().min(0).max(50),
  contactPhone: z.string().min(10),
  contactEmail: z.string().email(),
  availableFrom: z.string().min(1, 'Date required'),
});

type FormData = z.infer<typeof schema>;

const LOCALITIES = ['Jalukbari', 'Chandmari', 'Dispur', 'Ganeshguri', 'Zoo Road', 'Panbazar', 'Silpukhuri', 'Ulubari', 'Lachit Nagar', 'Lakhtokia'];
const COLLEGES = ['Gauhati University', 'Assam Engineering College', 'Cotton University', 'Gauhati Commerce College', 'IIT Guwahati', 'GMCH', 'Other'];

const LOCALITY_COORDS: Record<string, [number, number]> = {
  'Jalukbari': [26.1445, 91.6897], 'Chandmari': [26.1567, 91.7362], 'Dispur': [26.1341, 91.7898],
  'Ganeshguri': [26.1632, 91.7701], 'Zoo Road': [26.1759, 91.7547], 'Panbazar': [26.1829, 91.7461],
};

export default function AddPropertyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const isEditing = !!editId;

  const [amenities, setAmenities] = useState({
    wifi: false, ac: false, attachedBathroom: false, parking: false,
    laundry: false, powerBackup: false, petFriendly: false, food: false,
    gym: false, tv: false, refrigerator: false, waterFilter: false,
  });
  const [houseRules, setHouseRules] = useState<string[]>(['']);
  const [images, setImages] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      propertyType: 'pg', furnishing: 'furnished', genderPreference: 'coed',
      totalRooms: 1, availableBeds: 1, deposit: 0, distanceFromCollege: 0.5,
    },
  });

  const locality = watch('locality');

  // Auto-fill coordinates when locality is selected
  useEffect(() => {
    if (LOCALITY_COORDS[locality]) {
      const [lat, lng] = LOCALITY_COORDS[locality];
      setValue('lat', lat + (Math.random() - 0.5) * 0.005);
      setValue('lng', lng + (Math.random() - 0.5) * 0.005);
    }
  }, [locality, setValue]);

  // Load property for editing
  useEffect(() => {
    if (!editId) return;
    const load = async () => {
      try {
        const { property } = await propertyService.getById(editId);
        setValue('title', property.title);
        setValue('description', property.description);
        setValue('street', property.address.street);
        setValue('locality', property.address.locality);
        setValue('city', property.address.city);
        setValue('state', property.address.state);
        setValue('pincode', property.address.pincode);
        setValue('lat', property.coordinates.lat);
        setValue('lng', property.coordinates.lng);
        setValue('propertyType', property.propertyType);
        setValue('rent', property.rent);
        setValue('deposit', property.deposit);
        setValue('furnishing', property.furnishing);
        setValue('genderPreference', property.genderPreference);
        setValue('college', property.college);
        setValue('distanceFromCollege', property.distanceFromCollege);
        setValue('contactPhone', property.contactPhone);
        setValue('contactEmail', property.contactEmail);
        setValue('availableFrom', property.availableFrom.split('T')[0]);
        setAmenities(property.amenities);
        setHouseRules(property.houseRules.length > 0 ? property.houseRules : ['']);
        setImages(property.images.length > 0 ? property.images : ['']);
      } catch { toast.error('Failed to load property'); }
    };
    load();
  }, [editId, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const propertyData = {
        title: data.title,
        description: data.description,
        address: { street: data.street, locality: data.locality, city: data.city, state: data.state, pincode: data.pincode },
        coordinates: { lat: data.lat || LOCALITY_COORDS[data.locality]?.[0] || 26.1445, lng: data.lng || LOCALITY_COORDS[data.locality]?.[1] || 91.6897 },
        propertyType: data.propertyType,
        rent: data.rent,
        deposit: data.deposit,
        totalRooms: data.totalRooms,
        availableBeds: data.availableBeds,
        furnishing: data.furnishing,
        genderPreference: data.genderPreference,
        amenities,
        houseRules: houseRules.filter((r) => r.trim()),
        availableFrom: data.availableFrom,
        college: data.college,
        distanceFromCollege: data.distanceFromCollege,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        images: images.filter((img) => img.trim()),
      };

      if (isEditing) {
        await propertyService.update(editId, propertyData);
        toast.success('Property updated!');
      } else {
        const created = await propertyService.create(propertyData);
        toast.success('Property listed successfully!');
        navigate(`/property/${created._id}`);
        return;
      }
      navigate('/owner/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to save property');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-7">{isEditing ? 'Edit Property' : 'Add New Property'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Basic Info */}
        <section className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Property Title *</label>
              <input className={`input ${errors.title ? 'border-red-300' : ''}`} {...register('title')} placeholder="e.g. Spacious PG near GU" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="label">Description *</label>
              <textarea className={`input min-h-[120px] resize-none ${errors.description ? 'border-red-300' : ''}`} {...register('description')} placeholder="Describe the property, location benefits, and what makes it special..." />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="label">Type *</label>
                <select className="input" {...register('propertyType')}>
                  {[['room', 'Single Room'], ['shared_room', 'Shared Room'], ['pg', 'PG'], ['hostel', 'Hostel'], ['flat', 'Flat']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">For *</label>
                <select className="input" {...register('genderPreference')}>
                  {[['boys', 'Boys'], ['girls', 'Girls'], ['coed', 'Co-ed']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Furnishing *</label>
                <select className="input" {...register('furnishing')}>
                  {[['furnished', 'Furnished'], ['semi-furnished', 'Semi-Furnished'], ['unfurnished', 'Unfurnished']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Available From *</label>
                <input type="date" className={`input ${errors.availableFrom ? 'border-red-300' : ''}`} {...register('availableFrom')} />
              </div>
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-500" /> Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Street / House Number *</label>
              <input className={`input ${errors.street ? 'border-red-300' : ''}`} {...register('street')} placeholder="House no., street name" />
              {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
            </div>
            <div>
              <label className="label">Locality *</label>
              <select className={`input ${errors.locality ? 'border-red-300' : ''}`} {...register('locality')}>
                <option value="">Select locality</option>
                {LOCALITIES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              {errors.locality && <p className="text-red-500 text-xs mt-1">{errors.locality.message}</p>}
            </div>
            <div>
              <label className="label">City *</label>
              <input className={`input ${errors.city ? 'border-red-300' : ''}`} {...register('city')} defaultValue="Guwahati" />
            </div>
            <div>
              <label className="label">State *</label>
              <input className={`input ${errors.state ? 'border-red-300' : ''}`} {...register('state')} defaultValue="Assam" />
            </div>
            <div>
              <label className="label">Pincode *</label>
              <input className={`input ${errors.pincode ? 'border-red-300' : ''}`} {...register('pincode')} placeholder="6-digit pincode" />
              {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
            </div>
          </div>
        </section>

        {/* Pricing & Rooms */}
        <section className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Pricing & Rooms</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="label">Monthly Rent (₹) *</label>
              <input type="number" className={`input ${errors.rent ? 'border-red-300' : ''}`} {...register('rent', { valueAsNumber: true })} placeholder="e.g. 6000" />
              {errors.rent && <p className="text-red-500 text-xs mt-1">{errors.rent.message}</p>}
            </div>
            <div>
              <label className="label">Deposit (₹) *</label>
              <input type="number" className="input" {...register('deposit', { valueAsNumber: true })} placeholder="e.g. 12000" />
            </div>
            <div>
              <label className="label">Total Rooms</label>
              <input type="number" min="1" className="input" {...register('totalRooms', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="label">Available Beds</label>
              <input type="number" min="0" className="input" {...register('availableBeds', { valueAsNumber: true })} />
            </div>
          </div>
        </section>

        {/* College & Distance */}
        <section className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Nearby College</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nearest College *</label>
              <select className={`input ${errors.college ? 'border-red-300' : ''}`} {...register('college')}>
                <option value="">Select college</option>
                {COLLEGES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.college && <p className="text-red-500 text-xs mt-1">{errors.college.message}</p>}
            </div>
            <div>
              <label className="label">Distance from College (km) *</label>
              <input type="number" step="0.1" min="0" max="50" className="input" {...register('distanceFromCollege', { valueAsNumber: true })} />
            </div>
          </div>
        </section>

        {/* Amenities */}
        <section className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Amenities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.entries(amenities).map(([key, val]) => {
              const labels: Record<string, string> = {
                wifi: '📶 Wi-Fi', ac: '❄️ AC', attachedBathroom: '🚿 Attached Bathroom',
                parking: '🅿️ Parking', laundry: '👕 Laundry', powerBackup: '⚡ Power Backup',
                petFriendly: '🐾 Pet Friendly', food: '🍱 Food Included', gym: '🏋️ Gym',
                tv: '📺 TV', refrigerator: '🧊 Refrigerator', waterFilter: '💧 Water Filter',
              };
              return (
                <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={(e) => setAmenities((prev) => ({ ...prev, [key]: e.target.checked }))}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  {labels[key] || key}
                </label>
              );
            })}
          </div>
        </section>

        {/* House Rules */}
        <section className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">House Rules</h2>
          <div className="space-y-2">
            {houseRules.map((rule, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  className="input flex-1"
                  value={rule}
                  onChange={(e) => {
                    const updated = [...houseRules];
                    updated[idx] = e.target.value;
                    setHouseRules(updated);
                  }}
                  placeholder={`Rule ${idx + 1}`}
                />
                <button type="button" onClick={() => setHouseRules((r) => r.filter((_, i) => i !== idx))}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50" aria-label="Remove rule">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setHouseRules((r) => [...r, ''])} className="btn-secondary text-sm">
              <Plus className="w-4 h-4" /> Add Rule
            </button>
          </div>
        </section>

        {/* Property Images */}
        <section className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-primary-500" /> Property Photos (Image URLs)</h2>
          <p className="text-xs text-gray-400 mb-3">Add direct image URLs (from Unsplash, your hosting, etc.)</p>
          <div className="space-y-2">
            {images.map((img, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  className="input flex-1"
                  value={img}
                  onChange={(e) => { const u = [...images]; u[idx] = e.target.value; setImages(u); }}
                  placeholder="https://..."
                  type="url"
                />
                {img && (
                  <img src={img} alt="" className="w-10 h-10 object-cover rounded-lg border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <button type="button" onClick={() => setImages((i) => i.filter((_, j) => j !== idx))}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50" aria-label="Remove image">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setImages((i) => [...i, ''])} className="btn-secondary text-sm">
              <Plus className="w-4 h-4" /> Add Image URL
            </button>
          </div>
        </section>

        {/* Contact */}
        <section className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Contact Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Contact Phone *</label>
              <input className={`input ${errors.contactPhone ? 'border-red-300' : ''}`} {...register('contactPhone')} defaultValue={user?.phone || ''} placeholder="10-digit phone" />
              {errors.contactPhone && <p className="text-red-500 text-xs mt-1">{errors.contactPhone.message}</p>}
            </div>
            <div>
              <label className="label">Contact Email *</label>
              <input type="email" className={`input ${errors.contactEmail ? 'border-red-300' : ''}`} {...register('contactEmail')} defaultValue={user?.email || ''} />
              {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail.message}</p>}
            </div>
          </div>
        </section>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/owner/dashboard')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> {isEditing ? 'Updating...' : 'Listing...'}</> : (isEditing ? 'Update Property' : 'List Property')}
          </button>
        </div>
      </form>
    </div>
  );
}
