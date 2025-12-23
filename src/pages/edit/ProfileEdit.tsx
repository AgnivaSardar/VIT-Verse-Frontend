import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { usersApi } from '../../services/usersApi';
import { authApi } from '../../services/authApi';

// Define the User type with all editable fields
// Keeping optional flags so every field can be shown even when empty
// and we can surface account metadata from the API.
type User = {
  id?: number;
  userID?: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  userPhone?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  isSuperAdmin?: boolean;
  createdAt?: string;
};

type StudentDetails = {
  studentRegID: string;
  studentBranch: string;
  studentYear: number;
};

type TeacherDetails = {
  teacherID: string;
  teacherSchool: string;
};

import '../../styles/layout.css';
import '../../styles/form.css';
import '../../styles/profile.css';

const ProfileEdit: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [studentDetails, setStudentDetails] = useState<StudentDetails>({
    studentRegID: '',
    studentBranch: '',
    studentYear: 1,
  });
  const [teacherDetails, setTeacherDetails] = useState<TeacherDetails>({
    teacherID: '',
    teacherSchool: '',
  });
  const [saving, setSaving] = useState(false);

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
    otp: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please log in to edit your profile');
      navigate('/login', { replace: true });
      return;
    }

    if (!isAuthenticated || !user?.id) return;

    const fetchProfile = async () => {
      try {
        const resp = await usersApi.getById(user.id);
        const data: any = resp?.data ?? resp; // unwrap if needed

        const mapped: User = {
          id: data.userID ?? data.id ?? user.id,
          userID: data.userID ?? data.id ?? user.id,
          name: data.userName ?? data.username ?? data.name ?? user.name,
          email: data.userEmail ?? data.email ?? user.email,
          role: data.role ?? user.role,
          phone: data.userPhone ?? data.phone,
          userPhone: data.userPhone ?? data.phone,
          isActive: data.isActive,
          isEmailVerified: data.isEmailVerified,
          isSuperAdmin: data.isSuperAdmin,
          createdAt: data.createdAt,
        };

        setProfile(mapped);

        const student = data.student ?? {};
        const teacher = data.teacher ?? {};

        setStudentDetails({
          studentRegID: student.studentRegID ?? data.studentRegID ?? '',
          studentBranch: student.studentBranch ?? data.studentBranch ?? '',
          studentYear: student.studentYear ?? data.studentYear ?? 1,
        });

        setTeacherDetails({
          teacherID: teacher.teacherID ?? data.teacherID ?? data.employeeID ?? '',
          teacherSchool: teacher.teacherSchool ?? data.teacherSchool ?? '',
        });
      } catch (err) {
        console.error('Failed to load profile', err);
        setProfile({
          id: user.id,
          userID: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        });
        setStudentDetails({ studentRegID: '', studentBranch: '', studentYear: 1 });
        setTeacherDetails({ teacherID: '', teacherSchool: '' });
      }
    };

    fetchProfile();
  }, [user, isAuthenticated, isLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudentDetails((prev) => ({
      ...prev,
      [name]: name === 'studentYear' ? parseInt(value, 10) : value,
    }));
  };

  const handleTeacherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTeacherDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequestOTP = async () => {
    if (!profile?.email) return;

    setSendingOTP(true);
    try {
      await authApi.requestPasswordChange({ email: profile.email });
      setOtpSent(true);
      toast.success('OTP sent to your email!');
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to send OTP';
      toast.error(errorMsg);
    } finally {
      setSendingOTP(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.email) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!passwordData.otp || passwordData.otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setChangingPassword(true);
    try {
      await authApi.changePassword({
        email: profile.email,
        otp: passwordData.otp,
        newPassword: passwordData.newPassword,
      });

      toast.success('Password changed successfully!');
      setShowPasswordChange(false);
      setPasswordData({ newPassword: '', confirmPassword: '', otp: '' });
      setOtpSent(false);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to change password';
      toast.error(errorMsg);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      if (profile.id) {
        const updateData: any = {
          username: profile.name,
          userPhone: profile.phone,
        };

        if (profile.role === 'student') {
          if (!studentDetails.studentRegID) {
            toast.error('Registration ID is required for students');
            setSaving(false);
            return;
          }
          updateData.student = studentDetails;
        }

        if (profile.role === 'teacher') {
          if (!teacherDetails.teacherID) {
            toast.error('Employee ID is required for professors');
            setSaving(false);
            return;
          }
          updateData.teacher = teacherDetails;
        }

        await usersApi.update(profile.id, updateData);
      }

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to update profile';
      toast.error(errorMsg);
      console.error('Profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const valueOr = (value: string | number | undefined | null, fallback = 'Not set') => {
    if (value === null || value === undefined || value === '') return fallback;
    return value;
  };

  const boolOr = (value: boolean | undefined | null) => {
    if (value === null || value === undefined) return 'Not set';
    return value ? 'Yes' : 'No';
  };

  const formatDate = (value: string | undefined | null) => {
    if (!value) return 'Not set';
    const parsed = Number.isNaN(Date.parse(value)) ? null : new Date(value);
    return parsed ? parsed.toLocaleString() : value;
  };

  const isStudent = profile?.role === 'student';
  const isTeacher = profile?.role === 'teacher';

  return (
    <div className="app-container">
      <Header />
      <Sidebar />

      <main>
        {!profile ? (
          <div className="no-results">Please log in to edit your profile.</div>
        ) : (
          <div className="profile-edit-shell">
            <div className="profile-card" style={{ padding: '1.5rem' }}>
              <div className="profile-header-block">
                <div className="avatar-circle">{(profile.name || 'U').slice(0, 2).toUpperCase()}</div>
                <div className="profile-heading">
                  <div className="profile-title-row">
                    <h1 style={{ margin: 0 }}>Edit Profile</h1>
                    <span className={`pill role-pill ${profile.role}`}>{profile.role}</span>
                  </div>
                  <div className="profile-meta-row">
                    <span className="pill">{profile.email}</span>
                  </div>
                </div>
              </div>

              <div className="profile-grid">
                <div className="info-tile">
                  <p className="label">User ID</p>
                  <p className="value">{valueOr(profile.id ?? profile.userID)}</p>
                </div>

                <div className="info-tile">
                  <p className="label">Name</p>
                  <p className="value">{valueOr(profile.name)}</p>
                </div>

                <div className="info-tile">
                  <p className="label">Email</p>
                  <p className="value">{valueOr(profile.email)}</p>
                </div>

                <div className="info-tile">
                  <p className="label">Role</p>
                  <p className="value">{valueOr(profile.role)}</p>
                </div>

                <div className="info-tile">
                  <p className="label">Phone</p>
                  <p className="value">{valueOr(profile.phone || profile.userPhone)}</p>
                </div>

                <div className="info-tile">
                  <p className="label">Email Verified</p>
                  <p className="value">{boolOr(profile.isEmailVerified)}</p>
                </div>

                <div className="info-tile">
                  <p className="label">Active</p>
                  <p className="value">{boolOr(profile.isActive)}</p>
                </div>

                <div className="info-tile">
                  <p className="label">Super Admin</p>
                  <p className="value">{boolOr(profile.isSuperAdmin)}</p>
                </div>

                <div className="info-tile">
                  <p className="label">Created At</p>
                  <p className="value">{formatDate(profile.createdAt)}</p>
                </div>

                <div className="info-tile">
                  <p className="label">Registration ID</p>
                  <p className="value">{isTeacher ? 'Not applicable' : valueOr(studentDetails.studentRegID)}</p>
                </div>

                <div className="info-tile">
                  <p className="label">Branch</p>
                  <p className="value">{isTeacher ? 'Not applicable' : valueOr(studentDetails.studentBranch)}</p>
                </div>

                <div className="info-tile">
                  <p className="label">Year</p>
                  <p className="value">{isTeacher ? 'Not applicable' : valueOr(studentDetails.studentYear ? `${studentDetails.studentYear} year` : '')}</p>
                </div>

                <div className="info-tile">
                  <p className="label">Employee / Teacher ID</p>
                  <p className="value">{isStudent ? 'Not applicable' : valueOr(teacherDetails.teacherID)}</p>
                </div>

                <div className="info-tile">
                  <p className="label">School / Department</p>
                  <p className="value">{isStudent ? 'Not applicable' : valueOr(teacherDetails.teacherSchool)}</p>
                </div>
              </div>
            </div>

            <div className="form-container">
              <div className="form-header">
                <h1>Details</h1>
                <p>Keep your contact and academic information current.</p>
              </div>

              <form onSubmit={handleSubmit} className="standard-form">
                <div className="form-grid">
                  {/* Basic Information */}
                  <div className="form-section">
                    <label className="form-label">Name</label>
                    <input
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div className="form-section full-span">
                    <label className="form-label">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter your email"
                      disabled
                    />
                    <p className="form-hint">Email cannot be changed</p>
                  </div>

                  <div className="form-section">
                    <label className="form-label">Phone Number</label>
                    <input
                      name="phone"
                      type="tel"
                      value={profile.phone || ''}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="form-section">
                    <label className="form-label">Role</label>
                    <input
                      value={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                      className="form-input"
                      disabled
                    />
                    <p className="form-hint">Role cannot be changed</p>
                  </div>

                  {/* Student fields - always visible, disabled when not a student */}
                  <h3 className="section-title" style={{ gridColumn: '1 / -1' }}>Student Information</h3>

                  <div className="form-section">
                    <label className="form-label">Registration ID</label>
                    <input
                      name="studentRegID"
                      value={studentDetails.studentRegID}
                      onChange={handleStudentChange}
                      className="form-input"
                      placeholder="Enter registration ID"
                      disabled={!isStudent}
                      required={isStudent}
                    />
                    {!isStudent && <p className="form-hint">Not applicable for your role</p>}
                  </div>

                  <div className="form-section">
                    <label className="form-label">Branch</label>
                    <input
                      name="studentBranch"
                      value={studentDetails.studentBranch}
                      onChange={handleStudentChange}
                      className="form-input"
                      placeholder="e.g., Computer Science"
                      disabled={!isStudent}
                      required={isStudent}
                    />
                    {!isStudent && <p className="form-hint">Not applicable for your role</p>}
                  </div>

                  <div className="form-section">
                    <label className="form-label">Year</label>
                    <select
                      name="studentYear"
                      value={studentDetails.studentYear}
                      onChange={handleStudentChange}
                      className="form-input"
                      disabled={!isStudent}
                      required={isStudent}
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                    {!isStudent && <p className="form-hint">Not applicable for your role</p>}
                  </div>

                  {/* Teacher fields - always visible, disabled when not a teacher */}
                  <h3 className="section-title" style={{ gridColumn: '1 / -1' }}>Teacher Information</h3>

                  <div className="form-section">
                    <label className="form-label">Employee / Teacher ID</label>
                    <input
                      name="teacherID"
                      value={teacherDetails.teacherID}
                      onChange={handleTeacherChange}
                      className="form-input"
                      placeholder="Enter employee ID"
                      disabled={!isTeacher}
                      required={isTeacher}
                    />
                    {!isTeacher && <p className="form-hint">Not applicable for your role</p>}
                  </div>

                  <div className="form-section">
                    <label className="form-label">School/Department</label>
                    <input
                      name="teacherSchool"
                      value={teacherDetails.teacherSchool}
                      onChange={handleTeacherChange}
                      className="form-input"
                      placeholder="e.g., School of Computer Science"
                      disabled={!isTeacher}
                      required={isTeacher}
                    />
                    {!isTeacher && <p className="form-hint">Not applicable for your role</p>}
                  </div>
                </div>

                {/* Password Change Section */}
                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Security</h3>

                  {!showPasswordChange ? (
                    <button
                      type="button"
                      onClick={() => setShowPasswordChange(true)}
                      className="btn btn-secondary"
                    >
                      Change Password
                    </button>
                  ) : (
                    <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1rem' }}>Change Password</h4>

                      {!otpSent ? (
                        <>
                          <p className="form-hint" style={{ marginBottom: '1rem' }}>
                            We'll send a verification code to your email: <strong>{profile.email}</strong>
                          </p>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                              type="button"
                              onClick={handleRequestOTP}
                              disabled={sendingOTP}
                              className="btn btn-primary"
                            >
                              {sendingOTP ? 'Sending...' : 'Send OTP'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowPasswordChange(false)}
                              className="btn btn-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <form onSubmit={handleChangePassword}>
                          <div className="form-section">
                            <label className="form-label">OTP Code</label>
                            <input
                              type="text"
                              name="otp"
                              value={passwordData.otp}
                              onChange={handlePasswordChange}
                              className="form-input"
                              placeholder="Enter 6-digit OTP"
                              maxLength={6}
                              required
                            />
                            <p className="form-hint">Check your email for the verification code</p>
                          </div>

                          <div className="form-section">
                            <label className="form-label">New Password</label>
                            <input
                              type="password"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              className="form-input"
                              placeholder="Enter new password"
                              minLength={6}
                              required
                            />
                          </div>

                          <div className="form-section">
                            <label className="form-label">Confirm Password</label>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              className="form-input"
                              placeholder="Re-enter new password"
                              minLength={6}
                              required
                            />
                          </div>

                          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button
                              type="submit"
                              disabled={changingPassword}
                              className="btn btn-primary"
                            >
                              {changingPassword ? 'Changing...' : 'Change Password'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowPasswordChange(false);
                                setOtpSent(false);
                                setPasswordData({ newPassword: '', confirmPassword: '', otp: '' });
                              }}
                              className="btn btn-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={saving} className="btn btn-primary">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfileEdit;
