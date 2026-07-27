import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building, Eye, MessageSquare, Plus, CheckCircle, Clock,
  XCircle, Loader2, MapPin
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { enquiryService } from '../services/enquiryService';
import { Property, Enquiry } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [propData, enqData] = await Promise.all([
          propertyService.getAll({ page: 1, limit: 50 }),
          enquiryService.getOwnerEnquiries(),
        ]);
        // Filter to owner's own properties
        const myProps = propData.properties.filter(
          (p) => typeof p.owner === 'object' ? (p.owner as { _id: string })._id === user?._id : p.owner === user?._id
        );
        setProperties(myProps);
        setEnquiries(enqData);
      } catch { }
      finally { setIsLoading(false); }
    };
    load();
  }, [user]);

  const handleRespond = async (enquiryId: string) => {
    if (!responseText.trim()) { toast.error('Enter a response'); return; }
    try {
      await enquiryService.respond(enquiryId, responseText);
      setEnquiries((prev) => prev.map((e) => e._id === enquiryId ? { ...e, status: 'responded', ownerResponse: responseText } : e));
      setRespondingTo(null);
      setResponseText('');
      toast.success('Response sent!');
    } catch { toast.error('Failed to respond'); }
  };

  const handleToggleAvailability = async (propertyId: string, current: boolean) => {
    try {
      await propertyService.update(propertyId, { isAvailable: !current });
      setProperties((prev) => prev.map((p) => p._id === propertyId ? { ...p, isAvailable: !current } : p));
      toast.success(!current ? 'Marked as available' : 'Marked as occupied');
    } catch { toast.error('Failed to update'); }
  };

  const handleRequestVerification = async (propertyId: string) => {
    try {
      await propertyService.update(propertyId, { verificationStatus: 'pending' });
      setProperties((prev) => prev.map((p) => p._id === propertyId ? { ...p, verificationStatus: 'pending' } : p));
      toast.success('Verification requested!');
    } catch { toast.error('Failed to request verification'); }
  };

  const totalViews = properties.reduce((sum, p) => sum + p.views, 0);
  const activeListings = properties.filter((p) => p.isAvailable && p.isActive).length;
  const pendingEnquiries = enquiries.filter((e) => e.status === 'pending').length;
  const verifiedProps = properties.filter((p) => p.verificationStatus === 'verified').length;

  if (isLoading) return <div className="flex items-center justify-center min-h-96"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your property listings</p>
        </div>
        <Link to="/owner/add-property" className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Add Property
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Building, label: 'Total Listings', value: properties.length, color: 'text-primary-500 bg-primary-50' },
          { icon: CheckCircle, label: 'Active Listings', value: activeListings, color: 'text-teal-500 bg-teal-50' },
          { icon: Eye, label: 'Total Views', value: totalViews, color: 'text-blue-500 bg-blue-50' },
          { icon: MessageSquare, label: 'New Enquiries', value: pendingEnquiries, color: 'text-amber-500 bg-amber-50' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-4">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* My Properties */}
      <section className="mb-8">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Building className="w-4 h-4" /> My Properties
        </h2>
        {properties.length === 0 ? (
          <div className="card p-8 text-center">
            <Building className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-3">You haven't listed any properties yet</p>
            <Link to="/owner/add-property" className="btn-primary text-sm">Add Your First Property</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {properties.map((p) => (
              <div key={p._id} className="card p-4 flex flex-col sm:flex-row gap-4">
                <img
                  src={p.images[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200'}
                  alt={p.title}
                  className="w-full sm:w-24 h-20 object-cover rounded-xl flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{p.title}</h3>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {p.address.locality} · ₹{p.rent.toLocaleString('en-IN')}/mo · {p.views} views
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {p.verificationStatus === 'verified' && <span className="badge badge-verified">Verified</span>}
                      {p.verificationStatus === 'pending' && <span className="badge badge-pending">Pending</span>}
                      {p.verificationStatus === 'unverified' && <span className="badge badge-unverified">Unverified</span>}
                      <span className={`badge ${p.isAvailable ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.isAvailable ? 'Available' : 'Occupied'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Link to={`/property/${p._id}`} className="btn-secondary text-xs py-1.5 px-3">View</Link>
                    <Link to={`/owner/edit-property/${p._id}`} className="btn-secondary text-xs py-1.5 px-3">Edit</Link>
                    <button
                      onClick={() => handleToggleAvailability(p._id, p.isAvailable)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      {p.isAvailable ? 'Mark Occupied' : 'Mark Available'}
                    </button>
                    {p.verificationStatus === 'unverified' && (
                      <button
                        onClick={() => handleRequestVerification(p._id)}
                        className="btn-teal text-xs py-1.5 px-3"
                      >
                        Request Verification
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Enquiries */}
      <section>
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Student Enquiries
          {pendingEnquiries > 0 && <span className="badge bg-amber-100 text-amber-700">{pendingEnquiries} new</span>}
        </h2>
        {enquiries.length === 0 ? (
          <div className="card p-8 text-center">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No enquiries received yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {enquiries.map((e) => {
              const prop = typeof e.property === 'object' ? e.property as Property : null;
              const student = typeof e.student === 'object' ? e.student : null;
              return (
                <div key={e._id} className="card p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{e.studentName}</p>
                      <p className="text-xs text-gray-400">{prop?.title || 'Property'} · {e.contactNumber}</p>
                    </div>
                    <span className={`badge ${e.status === 'pending' ? 'badge-pending' : 'badge-verified'} capitalize`}>{e.status}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{e.message}</p>
                  <p className="text-xs text-gray-400">
                    Visit: {new Date(e.preferredVisitDate).toLocaleDateString('en-IN')} · Move-in: {new Date(e.moveInDate).toLocaleDateString('en-IN')}
                  </p>
                  {e.ownerResponse ? (
                    <div className="mt-2 p-2 bg-teal-50 rounded-lg text-xs text-teal-700">
                      Your reply: {e.ownerResponse}
                    </div>
                  ) : (
                    respondingTo === e._id ? (
                      <div className="mt-3 flex gap-2">
                        <input
                          className="input flex-1 text-xs py-2"
                          placeholder="Type your response..."
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                        />
                        <button onClick={() => handleRespond(e._id)} className="btn-teal text-xs py-2">Send</button>
                        <button onClick={() => setRespondingTo(null)} className="btn-secondary text-xs py-2">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setRespondingTo(e._id)} className="mt-2 btn-secondary text-xs py-1.5 px-3">
                        Reply to Student
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
