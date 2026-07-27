import { useState, useEffect } from 'react';
import {
  Users, Building, CheckCircle, AlertTriangle, BarChart3,
  Clock, Loader2, UserX, UserCheck, XCircle, Shield
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { AdminStats, Property, Report, User } from '../types';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'verifications' | 'reports' | 'users'>('overview');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [dashboard, pending, reps, usersData] = await Promise.all([
          adminService.getDashboard(),
          adminService.getPendingVerifications(),
          adminService.getReports(),
          adminService.getUsers(),
        ]);
        setStats(dashboard.stats);
        setPendingProperties(pending);
        setReports(reps);
        setUsers(usersData.users);
      } catch { toast.error('Failed to load admin data'); }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  const handleVerify = async (id: string) => {
    try {
      await adminService.verifyProperty(id);
      setPendingProperties((prev) => prev.filter((p) => p._id !== id));
      setStats((s) => s ? { ...s, pendingVerifications: s.pendingVerifications - 1, verifiedProperties: s.verifiedProperties + 1 } : s);
      toast.success('Property verified!');
    } catch { toast.error('Failed to verify'); }
  };

  const handleReject = async (id: string) => {
    try {
      await adminService.rejectProperty(id);
      setPendingProperties((prev) => prev.filter((p) => p._id !== id));
      setStats((s) => s ? { ...s, pendingVerifications: s.pendingVerifications - 1 } : s);
      toast.success('Verification rejected');
    } catch { toast.error('Failed to reject'); }
  };

  const handleReportStatus = async (id: string, status: string) => {
    try {
      await adminService.updateReportStatus(id, status);
      setReports((prev) => prev.map((r) => r._id === id ? { ...r, status: status as Report['status'] } : r));
      toast.success('Report updated');
    } catch { toast.error('Failed to update'); }
  };

  const handleToggleUser = async (id: string) => {
    try {
      await adminService.toggleUserStatus(id);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: !(u as User & { isActive: boolean }).isActive } : u));
      toast.success('User status updated');
    } catch { toast.error('Failed to update'); }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-96"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  const TABS = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'verifications', label: `Verifications (${stats?.pendingVerifications || 0})`, icon: CheckCircle },
    { key: 'reports', label: `Reports (${stats?.pendingReports || 0})`, icon: AlertTriangle },
    { key: 'users', label: 'Users', icon: Users },
  ] as const;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary-600" /> Admin Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage listings, users, and reports</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && stats && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary-500 bg-primary-50' },
              { label: 'Total Listings', value: stats.totalProperties, icon: Building, color: 'text-teal-500 bg-teal-50' },
              { label: 'Verified Properties', value: stats.verifiedProperties, icon: CheckCircle, color: 'text-green-500 bg-green-50' },
              { label: 'Pending Verification', value: stats.pendingVerifications, icon: Clock, color: 'text-amber-500 bg-amber-50' },
              { label: 'Pending Reports', value: stats.pendingReports, icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card p-4">
                <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-2`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-4">
              <h3 className="font-semibold text-sm mb-2 text-gray-700">User Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Students</span><strong>{stats.totalStudents}</strong></div>
                <div className="flex justify-between text-gray-600"><span>Property Owners</span><strong>{stats.totalOwners}</strong></div>
                <div className="flex justify-between text-gray-600"><span>Total Enquiries</span><strong>{stats.totalEnquiries}</strong></div>
                <div className="flex justify-between text-gray-600"><span>Total Reviews</span><strong>{stats.totalReviews}</strong></div>
              </div>
            </div>
            <div className="card p-4">
              <h3 className="font-semibold text-sm mb-2 text-gray-700">Property Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Total Properties</span><strong>{stats.totalProperties}</strong></div>
                <div className="flex justify-between text-gray-600"><span>Active Listings</span><strong>{stats.activeProperties}</strong></div>
                <div className="flex justify-between text-gray-600"><span>Verified</span><strong className="text-teal-600">{stats.verifiedProperties}</strong></div>
                <div className="flex justify-between text-gray-600"><span>Awaiting Verification</span><strong className="text-amber-600">{stats.pendingVerifications}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verifications */}
      {activeTab === 'verifications' && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Pending Verifications ({pendingProperties.length})</h2>
          {pendingProperties.length === 0 ? (
            <div className="card p-10 text-center">
              <CheckCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No pending verifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingProperties.map((p) => {
                const owner = typeof p.owner === 'object' ? p.owner as User : null;
                return (
                  <div key={p._id} className="card p-4 flex flex-col sm:flex-row gap-4">
                    <img
                      src={p.images[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200'}
                      alt=""
                      className="w-full sm:w-20 h-16 object-cover rounded-xl"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{p.title}</p>
                      <p className="text-xs text-gray-500">{p.address.locality}, {p.address.city} · ₹{p.rent.toLocaleString('en-IN')}/mo</p>
                      <p className="text-xs text-gray-400 mt-0.5">Owner: {owner?.name || 'Unknown'} · {owner?.identityStatus}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleVerify(p._id)} className="btn-teal text-xs py-1.5 px-3">
                        <CheckCircle className="w-3.5 h-3.5" /> Verify
                      </button>
                      <button onClick={() => handleReject(p._id)} className="btn-secondary text-xs py-1.5 px-3 text-red-600 border-red-200 hover:bg-red-50">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reports */}
      {activeTab === 'reports' && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">User Reports ({reports.length})</h2>
          {reports.length === 0 ? (
            <div className="card p-10 text-center">
              <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No reports</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => {
                const prop = typeof r.property === 'object' ? r.property as Property : null;
                const reporter = typeof r.reportedBy === 'object' ? r.reportedBy as User : null;
                return (
                  <div key={r._id} className="card p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{prop?.title || 'Property'}</p>
                        <p className="text-xs text-gray-400">Reported by: {reporter?.name || 'User'} · {new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <span className={`badge capitalize ${r.status === 'pending' ? 'badge-pending' : r.status === 'action_taken' ? 'badge-verified' : 'badge-unverified'}`}>{r.status.replace('_', ' ')}</span>
                    </div>
                    <p className="text-xs font-medium text-gray-700 mb-1 capitalize">Reason: {r.reason.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-600">{r.description}</p>
                    {r.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleReportStatus(r._id, 'action_taken')} className="btn-primary text-xs py-1.5 px-3">Take Action</button>
                        <button onClick={() => handleReportStatus(r._id, 'dismissed')} className="btn-secondary text-xs py-1.5 px-3">Dismiss</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">User Management ({users.length})</h2>
          <div className="space-y-2">
            {users.map((u) => {
              const isActive = (u as User & { isActive: boolean }).isActive !== false;
              return (
                <div key={u._id} className="card p-3 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm flex-shrink-0">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email} · <span className="capitalize">{u.role}</span></p>
                  </div>
                  <span className={`badge ${isActive ? 'badge-verified' : 'badge-unverified'} flex-shrink-0`}>
                    {isActive ? 'Active' : 'Suspended'}
                  </span>
                  {u.role !== 'admin' && (
                    <button onClick={() => handleToggleUser(u._id)} className="btn-secondary text-xs py-1.5 px-3 flex-shrink-0">
                      {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      {isActive ? 'Suspend' : 'Activate'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
