import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { usersApi } from '../../services/usersApi';
import { authApi } from '../../services/authApi';

// Define the User type with all editable fields
type User = {
  id?: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
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

const ProfileEdit: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [teacherDetails, setTeacherDetails] = useState<TeacherDetails | null>(null);
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
    if (!isAuthenticated) return;
    if (user) {
      setProfile(user);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudentDetails((prev) => (
      prev ? { ...prev, [name]: name === 'studentYear' ? parseInt(value) : value } : prev
    ));
  };

  const handleTeacherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTeacherDetails((prev) => (prev ? { ...prev, [name]: value } : prev));
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
      // Update user profile
      if (profile.id) {
        const updateData: any = {
          username: profile.name,
          userPhone: profile.phone,
        };
        
        // Add role-specific data
        if (profile.role === 'student' && studentDetails) {
          updateData.student = studentDetails;
        } else if (profile.role === 'teacher' && teacherDetails) {
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

  return (
    <div className="app-container">
      <Header />
      <Sidebar />

      <main>
        {!profile ? (
          <div className="no-results">Please log in to edit your profile.</div>
        ) : (
          <div className="form-container">
            <div className="form-header">
              <h1>Edit Profile</h1>
              <p>Update your personal information</p>
            </div>
            
            <form onSubmit={handleSubmit} className="standard-form">
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

              <div className="form-section">
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

              {/* Student-specific fields */}
              {profile.role === 'student' && studentDetails && (
                <>
                  <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Student Information</h3>
                  
                  <div className="form-section">
                    <label className="form-label">Registration ID</label>
                    <input 
                      name="studentRegID" 
                      value={studentDetails.studentRegID} 
                      onChange={handleStudentChange} 
                      className="form-input"
                      placeholder="Enter registration ID"
                      required
                    />
                  </div>

                  <div className="form-section">
                    <label className="form-label">Branch</label>
                    <input 
                      name="studentBranch" 
                      value={studentDetails.studentBranch} 
                      onChange={handleStudentChange} 
                      className="form-input"
                      placeholder="e.g., Computer Science"
                      required
                    />
                  </div>

                  <div className="form-section">
                    <label className="form-label">Year</label>
                    <select 
                      name="studentYear" 
                      value={studentDetails.studentYear} 
                      onChange={handleStudentChange}
                      className="form-input"
                      required
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </>
              )}

              {/* Teacher-specific fields */}
              {profile.role === 'teacher' && teacherDetails && (
                <>
                  <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Teacher Information</h3>
                  
                  <div className="form-section">
                    <label className="form-label">Teacher ID</label>
                    <input 
                      name="teacherID" 
                      value={teacherDetails.teacherID} 
                      onChange={handleTeacherChange} 
                      className="form-input"
                      placeholder="Enter teacher ID"
                      required
                    />
                  </div>

                  <div className="form-section">
                    <label className="form-label">School/Department</label>
                    <input 
                      name="teacherSchool" 
                      value={teacherDetails.teacherSchool} 
                      onChange={handleTeacherChange} 
                      className="form-input"
                      placeholder="e.g., School of Computer Science"
                      required
                    />
                  </div>
                </>
              )}

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
        )}
      </main>
    </div>
  );
};

export default ProfileEdit;
