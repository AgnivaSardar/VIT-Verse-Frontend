import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/authApi';
import type { User } from '../features/auth/AuthContext';
import '../styles/layout.css';
import '../styles/video-detail.css';
import '../styles/profile.css';

function unwrap<T>(resp: any): T {
  if (resp && typeof resp === 'object' && 'data' in resp) {
    return (resp as any).data;
  }
  return resp as T;
}

type ExtendedUser = User & {
  userID?: number;
  createdAt?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  isSuperAdmin?: boolean;
  phone?: string;
  userPhone?: string;
  studentRegID?: string;
  studentBranch?: string;
  studentYear?: number;
  employeeID?: string;
  teacherID?: string;
  teacherSchool?: string;
};

const Profile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = useMemo(
    () =>
      (incoming: any): ExtendedUser => ({
        id: incoming?.id ?? incoming?.userID ?? user?.id,
        userID: incoming?.userID ?? incoming?.id ?? user?.id,
        name: incoming?.name ?? incoming?.userName ?? incoming?.username ?? user?.name ?? '',
        email: incoming?.email ?? incoming?.userEmail ?? user?.email ?? '',
        role: (incoming?.role ?? user?.role ?? 'student') as ExtendedUser['role'],
        phone: incoming?.phone ?? incoming?.userPhone ?? user?.phone ?? '',
        userPhone: incoming?.userPhone ?? incoming?.phone ?? '',
        studentRegID:
          incoming?.studentRegID ?? incoming?.student?.studentRegID ?? incoming?.registrationNumber ?? '',
        studentBranch: incoming?.studentBranch ?? incoming?.student?.studentBranch ?? '',
        studentYear: incoming?.studentYear ?? incoming?.student?.studentYear,
        employeeID: incoming?.employeeID ?? incoming?.teacherID ?? incoming?.teacher?.teacherID ?? '',
        teacherID: incoming?.teacherID ?? incoming?.employeeID ?? incoming?.teacher?.teacherID ?? '',
        teacherSchool: incoming?.teacherSchool ?? incoming?.teacher?.teacherSchool ?? '',
        isActive: incoming?.isActive ?? user?.isActive,
        isEmailVerified: incoming?.isEmailVerified ?? user?.isEmailVerified,
        isSuperAdmin: incoming?.isSuperAdmin ?? user?.isSuperAdmin,
        createdAt: incoming?.createdAt ?? user?.createdAt,
      }),
    [user]
  );

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Show cached user immediately
    setProfile(normalizeUser(user));
    setLoading(false);

    // Hydrate with latest profile data without blocking UI
    const fetchProfile = async () => {
      try {
        const response = await authApi.getUser(user.id);
        const data = unwrap<ExtendedUser | undefined>(response);
        if (data) {
          setProfile((prev) => ({ ...(prev ?? {}), ...normalizeUser(data) } as ExtendedUser));
        }
      } catch (error) {
        console.error('Profile load failed', error);
      }
    };

    fetchProfile();
  }, [user, isAuthenticated, normalizeUser]);

  const showValue = (value: string | number | undefined | null, fallback = 'Not set') => {
    if (value === null || value === undefined || value === '') return fallback;
    return value;
  };

  const showBoolean = (value: boolean | undefined | null) => {
    if (value === null || value === undefined) return 'Not set';
    return value ? 'Yes' : 'No';
  };

  const showDateTime = (value: string | Date | undefined | null) => {
    if (!value) return 'Not set';
    const dt = typeof value === 'string' ? value : value.toString();
    const parsed = Number.isNaN(Date.parse(dt)) ? null : new Date(dt);
    return parsed ? parsed.toLocaleString() : dt;
  };

  return (
    <div className="app-container">
      <Header />
      <Sidebar />

      <main className="profile-page">
        {loading ? (
          <div className="profile-card loading-card">Loading profile...</div>
        ) : !isAuthenticated || !user ? (
          <div className="profile-card">
            <h2>Profile</h2>
            <p className="muted">Please log in to view your profile.</p>
            <Link to="/login" className="btn-link">Go to Login</Link>
          </div>
        ) : (
          <div className="profile-card">
            <div className="profile-header-block">
              <div className="avatar-circle">
                {(profile?.name || 'U').slice(0, 2).toUpperCase()}
              </div>
              <div className="profile-heading">
                <div className="profile-title-row">
                  <h1>{profile?.name || 'User'}</h1>
                  <span className={`pill role-pill ${profile?.role}`}>{profile?.role || 'user'}</span>
                </div>
                <div className="profile-meta-row">
                  <span className="pill">{profile?.email}</span>
                </div>
              </div>
              <div className="profile-actions">
                <Link to="/profile/edit" className="btn-primary subtle">Edit Profile</Link>
              </div>
            </div>

            <div className="profile-grid">
              <div className="info-tile">
                <p className="label">User ID</p>
                <p className="value">{showValue(profile?.id ?? profile?.userID)}</p>
              </div>

              <div className="info-tile">
                <p className="label">Name</p>
                <p className="value">{showValue(profile?.name)}</p>
              </div>

              <div className="info-tile">
                <p className="label">Email</p>
                <p className="value">{showValue(profile?.email)}</p>
              </div>

              <div className="info-tile">
                <p className="label">Role</p>
                <p className="value">{showValue(profile?.role)}</p>
              </div>

              <div className="info-tile">
                <p className="label">Phone</p>
                <p className="value">{showValue(profile?.phone || profile?.userPhone)}</p>
              </div>

              <div className="info-tile">
                <p className="label">Email Verified</p>
                <p className="value">{showBoolean(profile?.isEmailVerified)}</p>
              </div>

              <div className="info-tile">
                <p className="label">Active</p>
                <p className="value">{showBoolean(profile?.isActive)}</p>
              </div>

              <div className="info-tile">
                <p className="label">Super Admin</p>
                <p className="value">{showBoolean(profile?.isSuperAdmin)}</p>
              </div>

              <div className="info-tile">
                <p className="label">Created At</p>
                <p className="value">{showDateTime(profile?.createdAt)}</p>
              </div>

              <div className="info-tile">
                <p className="label">Registration ID</p>
                <p className="value">
                  {profile?.role === 'teacher'
                    ? 'Not applicable'
                    : showValue(profile?.studentRegID)}
                </p>
              </div>

              <div className="info-tile">
                <p className="label">Branch</p>
                <p className="value">
                  {profile?.role === 'teacher'
                    ? 'Not applicable'
                    : showValue(profile?.studentBranch)}
                </p>
              </div>

              <div className="info-tile">
                <p className="label">Year</p>
                <p className="value">
                  {profile?.role === 'teacher'
                    ? 'Not applicable'
                    : showValue(profile?.studentYear ? `${profile.studentYear} year` : '')}
                </p>
              </div>

              <div className="info-tile">
                <p className="label">Employee / Teacher ID</p>
                <p className="value">
                  {profile?.role === 'student'
                    ? 'Not applicable'
                    : showValue(profile?.teacherID || profile?.employeeID)}
                </p>
              </div>

              <div className="info-tile">
                <p className="label">School / Department</p>
                <p className="value">
                  {profile?.role === 'student'
                    ? 'Not applicable'
                    : showValue(profile?.teacherSchool)}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
