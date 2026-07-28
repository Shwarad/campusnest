import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building, Heart, Users, Clock,
  TrendingUp, MessageSquare, Loader2, AlertCircle
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { enquiryService } from '../services/enquiryService';
import { Property, Enquiry } from '../types';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';

export default function StudentDashboardPage() {
  const { user, refreshUser } = useAuth();
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [recommendedProperties, setRecommendedProperties] = useState<Property[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [saved, recommended, enqs] = await Promise.all([
          propertyService.getSaved(),
          propertyService.getRecommended({
            maxRent: user?.college ? 10000 : undefined,
            college: user?.college || undefined,
          }),
          enquiryService.getStudentEnquiries(),
        ]);
        setSavedProperties(saved);
        setRecommendedProperties(recommended.slice(0, 4));
        setEnquiries(enqs);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  const profileCompleteness = () => {
    let score = 0;
    if (user?.name) score += 25;
    if (user?.email) score += 25;
    if (user?.phone) score += 25;
    if (user?.college) score += 25;
    return score;
  };

  const completeness = profileCompleteness();

  const statCards = [
    { icon: Heart, label: 'Saved Properties', value: savedProperties.length, color: 'text-red-500 bg-red-50', link: '#saved' },
    { icon: MessageSquare, label: 'Enquiries Sent', value: enquiries.length, color: 'text-blue-500 bg-blue-50', link: '#enquiries' },
    { icon: Building, label: 'Recommended', value: recommendedProperties.length, color: 'text-primary-500 bg-primary-50', link: '#recommended' },
    { icon: Users, label: 'Roommate Match', value: 'Find Now', color: 'text-teal-500 bg-teal-50', link: '/roommates' },
  ];

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-96">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-gray-500 text-sm mt-1">{user?.college || 'Complete your profile to get better recommendations'}</p>
      </div>

      {/* Profile Completion */}
      {completeness < 100 && (
        <div className="card p-4 mb-6 border-primary-100 bg-primary-50/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-primary-800">Complete your profile for better matches</p>
            <span className="text-sm font-bold text-primary-600">{completeness}%</span>
          </div>
          <div className="w-full bg-primary-100 rounded-full h-2">
            <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${completeness}%` }} />
          </div>
          {!user?.college && (
            <p className="text-xs text-primary-700 mt-2">
              <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
              Add your college to get personalized recommendations
            </p>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ icon: Icon, label, value, color, link }) => (
          <Link key={label} to={link} className="card p-4 hover:shadow-card-hover transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recommended Properties */}
      <section id="recommended" className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            Recommended For You
          </h2>
          <Link to="/search" className="text-sm text-primary-600 hover:underline">View All</Link>
        </div>
        {recommendedProperties.length === 0 ? (
          <div className="card p-8 text-center">
            <Building className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Complete your profile to get personalized recommendations</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedProperties.map((p) => (
              <PropertyCard key={p._id} property={p} compact />
            ))}
          </div>
        )}
      </section>

      {/* Saved Properties */}
      <section id="saved" className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" />
            Saved Properties
          </h2>
          <Link to="/search" className="text-sm text-primary-600 hover:underline">Browse More</Link>
        </div>
        {savedProperties.length === 0 ? (
          <div className="card p-8 text-center">
            <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">You haven't saved any properties yet</p>
            <Link to="/search" className="btn-primary text-sm mt-3">Start Searching</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {savedProperties.slice(0, 4).map((p) => (
              <PropertyCard key={p._id} property={p} compact />
            ))}
          </div>
        )}
      </section>

      {/* Enquiries */}
      <section id="enquiries">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          My Enquiries
        </h2>
        {enquiries.length === 0 ? (
          <div className="card p-8 text-center">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No enquiries sent yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {enquiries.map((e) => {
              const prop = typeof e.property === 'object' ? e.property as Property : null;
              const statusColor = { pending: 'badge-pending', seen: 'badge-verified', responded: 'badge-verified', closed: 'badge-unverified' };
              return (
                <div key={e._id} className="card p-4 flex items-center gap-4">
                  {prop?.images?.[0] && (
                    <img src={prop.images[0]} alt="" className="w-16 h-12 object-cover rounded-xl flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{prop?.title || 'Property'}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      Visit: {new Date(e.preferredVisitDate).toLocaleDateString('en-IN')}
                    </p>
                    {e.ownerResponse && (
                      <p className="text-xs text-teal-600 mt-1 truncate">Owner replied: {e.ownerResponse}</p>
                    )}
                  </div>
                  <span className={`badge ${statusColor[e.status]} capitalize flex-shrink-0`}>{e.status}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Roommate Prompt */}
      <div className="card mt-8 p-5 bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-teal-900">Find a Roommate</h3>
            <p className="text-sm text-teal-700 mt-0.5">Complete your roommate profile to see compatibility scores</p>
          </div>
          <Link to="/roommates" className="btn-teal text-sm flex-shrink-0">
            <Users className="w-4 h-4" /> Find Roommates
          </Link>
        </div>
      </div>
    </div>
  );
}
