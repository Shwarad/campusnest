import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, ChevronRight, ChevronLeft, Loader2, CheckCircle,
  MapPin, BookOpen, Heart, Moon, Utensils
} from 'lucide-react';
import { roommateService } from '../services/roommateService';
import { RoommateMatch, RoommateProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import RoommateMatchExplanation from '../components/ai/RoommateMatchExplanation';
import toast from 'react-hot-toast';

const STEPS = ['Budget & Location', 'Lifestyle', 'Habits & Preferences', 'Review'];

const INITIAL_PROFILE = {
  name: '',
  college: '',
  budget: { min: 3000, max: 8000 },
  preferredLocality: '',
  moveInDate: '',
  roomType: 'pg' as const,
  genderPreference: 'any' as const,
  sleepSchedule: 'flexible' as const,
  studyHabits: 'flexible' as const,
  cleanliness: 'clean' as const,
  smoking: false,
  drinking: false,
  foodPreference: 'any' as const,
  noiseTolerance: 'medium' as const,
  visitors: 'occasional' as const,
  pets: false,
  bio: '',
};

function CompatibilityBar({ score }: { score: number }) {
  const color = score >= 75 ? 'bg-teal-500' : score >= 50 ? 'bg-amber-400' : 'bg-red-400';
  const label = score >= 75 ? 'Great Match' : score >= 50 ? 'Good Match' : 'Low Match';
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span className="font-bold text-gray-900">{score}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function RoommateMatchingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ ...INITIAL_PROFILE, name: user?.name || '', college: user?.college || '' });
  const [matches, setMatches] = useState<RoommateMatch[]>([]);
  const [myProfile, setMyProfile] = useState<RoommateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [isFetchingMatches, setIsFetchingMatches] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const existing = await roommateService.getMyProfile();
        if (existing) {
          setMyProfile(existing);
          loadMatches();
        } else {
          setShowQuestionnaire(true);
        }
      } catch { setShowQuestionnaire(true); }
    };
    load();
  }, [user]);

  const loadMatches = async () => {
    setIsFetchingMatches(true);
    try {
      const data = await roommateService.getMatches();
      setMatches(data.matches);
      setMyProfile(data.myProfile);
    } catch { }
    finally { setIsFetchingMatches(false); }
  };

  const handleSaveProfile = async () => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return; }
    setIsLoading(true);
    try {
      await roommateService.saveProfile({ ...profile, moveInDate: new Date(profile.moveInDate).toISOString() });
      toast.success('Profile saved!');
      setShowQuestionnaire(false);
      await loadMatches();
    } catch { toast.error('Failed to save profile'); }
    finally { setIsLoading(false); }
  };

  const update = (key: string, value: unknown) => setProfile((p) => ({ ...p, [key]: value }));

  const renderStep = () => {
    if (step === 0) return (
      <div className="space-y-4">
        <div>
          <label className="label">Your Name</label>
          <input className="input" value={profile.name} onChange={(e) => update('name', e.target.value)} placeholder="Full name" />
        </div>
        <div>
          <label className="label">Your College</label>
          <input className="input" value={profile.college} onChange={(e) => update('college', e.target.value)} placeholder="College name" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Min Budget (₹/mo)</label>
            <input type="number" className="input" value={profile.budget.min} onChange={(e) => update('budget', { ...profile.budget, min: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">Max Budget (₹/mo)</label>
            <input type="number" className="input" value={profile.budget.max} onChange={(e) => update('budget', { ...profile.budget, max: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <label className="label">Preferred Locality</label>
          <input className="input" value={profile.preferredLocality} onChange={(e) => update('preferredLocality', e.target.value)} placeholder="e.g. Jalukbari, Dispur" />
        </div>
        <div>
          <label className="label">Room Type Preference</label>
          <select className="input" value={profile.roomType} onChange={(e) => update('roomType', e.target.value)}>
            {[['single', 'Single Room'], ['shared', 'Shared Room'], ['pg', 'PG'], ['hostel', 'Hostel'], ['flat', 'Flat/Apartment']].map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Preferred Move-in Date</label>
          <input type="date" className="input" value={profile.moveInDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => update('moveInDate', e.target.value)} />
        </div>
      </div>
    );

    if (step === 1) return (
      <div className="space-y-5">
        <div>
          <label className="label flex items-center gap-2"><Moon className="w-4 h-4 text-primary-400" /> Sleep Schedule</label>
          <div className="grid grid-cols-3 gap-2">
            {[['early_bird', '🌅 Early Bird'], ['night_owl', '🦉 Night Owl'], ['flexible', '🔄 Flexible']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => update('sleepSchedule', v)} className={`p-2.5 rounded-xl border text-sm font-medium transition-all ${profile.sleepSchedule === v ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="label flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary-400" /> Study Habits</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[['quiet', '🤫 Quiet'], ['with_music', '🎵 With Music'], ['social', '👥 Social'], ['flexible', '🔄 Flexible']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => update('studyHabits', v)} className={`p-2.5 rounded-xl border text-sm font-medium transition-all ${profile.studyHabits === v ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">✨ Cleanliness</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[['very_clean', '🧹 Very Clean'], ['clean', '✅ Clean'], ['moderate', '🟡 Moderate'], ['relaxed', '😌 Relaxed']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => update('cleanliness', v)} className={`p-2.5 rounded-xl border text-sm font-medium transition-all ${profile.cleanliness === v ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="label flex items-center gap-2"><Utensils className="w-4 h-4 text-primary-400" /> Food Preference</label>
          <div className="grid grid-cols-3 gap-2">
            {[['veg', '🥗 Vegetarian'], ['non_veg', '🍗 Non-Veg'], ['any', '🍽️ No Preference']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => update('foodPreference', v)} className={`p-2.5 rounded-xl border text-sm font-medium transition-all ${profile.foodPreference === v ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    );

    if (step === 2) return (
      <div className="space-y-5">
        {[
          { key: 'smoking', label: '🚬 Do you smoke?', icon: null },
          { key: 'drinking', label: '🍺 Do you drink alcohol?', icon: null },
          { key: 'pets', label: '🐾 Do you have pets?', icon: null },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="label">{label}</label>
            <div className="flex gap-3">
              {['Yes', 'No'].map((opt) => {
                const val = opt === 'Yes';
                return (
                  <button key={opt} type="button" onClick={() => update(key, val)} className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${(profile as Record<string, unknown>)[key] === val ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}>{opt}</button>
                );
              })}
            </div>
          </div>
        ))}
        <div>
          <label className="label">🔊 Noise Tolerance</label>
          <div className="grid grid-cols-3 gap-2">
            {[['low', '🔇 Low'], ['medium', '🔉 Medium'], ['high', '🔊 High']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => update('noiseTolerance', v)} className={`p-2.5 rounded-xl border text-sm font-medium transition-all ${profile.noiseTolerance === v ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">👥 Visitors Policy</label>
          <div className="grid grid-cols-3 gap-2">
            {[['never', '🚫 Never'], ['occasional', '🟡 Occasionally'], ['frequent', '✅ Frequently']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => update('visitors', v)} className={`p-2.5 rounded-xl border text-sm font-medium transition-all ${profile.visitors === v ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">About You (optional)</label>
          <textarea className="input min-h-[80px] resize-none" value={profile.bio} onChange={(e) => update('bio', e.target.value)} placeholder="Brief intro about yourself..." maxLength={500} />
        </div>
      </div>
    );

    if (step === 3) return (
      <div className="space-y-3">
        <div className="p-4 bg-primary-50 rounded-xl">
          <h3 className="font-semibold text-primary-900 mb-3">Your Roommate Profile Summary</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            {[
              ['Name', profile.name],
              ['College', profile.college],
              ['Budget', `₹${profile.budget.min.toLocaleString('en-IN')} – ₹${profile.budget.max.toLocaleString('en-IN')}/mo`],
              ['Locality', profile.preferredLocality],
              ['Room Type', profile.roomType],
              ['Sleep', profile.sleepSchedule.replace('_', ' ')],
              ['Study', profile.studyHabits.replace('_', ' ')],
              ['Cleanliness', profile.cleanliness.replace('_', ' ')],
              ['Food', profile.foodPreference.replace('_', ' ')],
              ['Smoking', profile.smoking ? 'Yes' : 'No'],
              ['Drinking', profile.drinking ? 'Yes' : 'No'],
              ['Pets', profile.pets ? 'Yes' : 'No'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">{k}:</span>
                <span className="font-medium capitalize text-xs">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center">Your profile will be visible to other students looking for roommates</p>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <Users className="w-14 h-14 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Find Your Ideal Roommate</h2>
        <p className="text-gray-500 text-sm mb-5">Create a free account to complete your roommate profile and see compatibility scores</p>
        <div className="flex gap-3 justify-center">
          <Link to="/register" className="btn-primary">Sign Up Free</Link>
          <Link to="/login" className="btn-secondary">Log In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Roommate Matching</h1>
        <p className="text-gray-500 text-sm mt-1">Find students with compatible lifestyles using our compatibility algorithm</p>
      </div>

      {showQuestionnaire ? (
        <div className="max-w-xl mx-auto">
          <div className="card p-6">
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-6">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${i < step ? 'bg-teal-500 text-white' : i === step ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  {i < STEPS.length - 1 && <div className={`h-0.5 w-8 mx-1 ${i < step ? 'bg-teal-400' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-5">{STEPS[step]}</h2>

            {renderStep()}

            <div className="flex justify-between mt-6">
              {step > 0 && (
                <button onClick={() => setStep((s) => s - 1)} className="btn-secondary text-sm">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button onClick={() => setStep((s) => s + 1)} className="btn-primary text-sm ml-auto">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleSaveProfile} disabled={isLoading} className="btn-primary text-sm ml-auto">
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <>Find Matches <CheckCircle className="w-4 h-4" /></>}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* My Profile Summary */}
          {myProfile && (
            <div className="card p-4 mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900 text-sm">Your Profile</p>
                <p className="text-xs text-gray-500">{myProfile.college} · ₹{myProfile.budget.min.toLocaleString('en-IN')}–₹{myProfile.budget.max.toLocaleString('en-IN')}/mo · {myProfile.preferredLocality}</p>
              </div>
              <button onClick={() => setShowQuestionnaire(true)} className="btn-secondary text-xs py-1.5 px-3">Edit Profile</button>
            </div>
          )}

          {/* Matches */}
          <h2 className="font-bold text-gray-900 text-lg mb-4">
            Your Matches
            {matches.length > 0 && <span className="ml-2 text-sm font-normal text-gray-400">({matches.length} found)</span>}
          </h2>

          {isFetchingMatches ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : matches.length === 0 ? (
            <div className="card p-10 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No roommate profiles found yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {matches.map(({ profile: p, compatibility }) => {
                const user = typeof p.user === 'object' ? p.user as { name: string; college?: string } : null;
                const displayName = user?.name || p.name;
                return (
                  <div key={p._id} className="card p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />{p.college}
                        </p>
                      </div>
                    </div>

                    <CompatibilityBar score={compatibility.score} />

                    <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-600">
                      <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" />{p.preferredLocality}</div>
                      <div>₹{p.budget.min.toLocaleString('en-IN')}–{p.budget.max.toLocaleString('en-IN')}</div>
                      <div className="capitalize">{p.roomType.replace('_', ' ')}</div>
                      <div className="capitalize">{p.sleepSchedule.replace('_', ' ')}</div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {!p.smoking && <span className="text-xs bg-green-50 text-green-600 rounded-full px-2 py-0.5">Non-smoker</span>}
                      {p.foodPreference !== 'any' && <span className="text-xs bg-amber-50 text-amber-600 rounded-full px-2 py-0.5 capitalize">{p.foodPreference.replace('_', '-')}</span>}
                      {p.cleanliness === 'very_clean' && <span className="text-xs bg-teal-50 text-teal-600 rounded-full px-2 py-0.5">Very clean</span>}
                    </div>

                    {p.bio && <p className="text-xs text-gray-500 italic line-clamp-2">"{p.bio}"</p>}

                    <p className="text-xs text-primary-600 font-medium">{compatibility.explanation}</p>

                    <RoommateMatchExplanation
                      roommateProfileId={p._id}
                      roommateeName={displayName}
                      compatibilityScore={compatibility.score}
                    />

                    <button className="btn-primary w-full text-xs py-2 mt-auto">
                      <Heart className="w-3.5 h-3.5" /> Send Request
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
