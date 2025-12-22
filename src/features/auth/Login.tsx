import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../services/authApi';

const Login: React.FC = () => {
	const { login, isLoading } = useAuth();
	const [identifier, setIdentifier] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();

	// Forgot password state
	const [showForgotPassword, setShowForgotPassword] = useState(false);
	const [forgotEmail, setForgotEmail] = useState('');
	const [otpSent, setOtpSent] = useState(false);
	const [otp, setOtp] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isResetting, setIsResetting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!identifier.trim()) {
			toast.error('Enter email, registration number, or employee ID');
			return;
		}
		if (password.length < 8) {
			toast.error('Password must be at least 8 characters');
			return;
		}
		try {
			await login(identifier.trim(), password);
			toast.success('Logged in');
			navigate('/');
		} catch (error) {
			toast.error('Login failed');
			console.error(error);
		}
	};

	const handleRequestOTP = async () => {
		if (!forgotEmail) {
			toast.error('Please enter your email');
			return;
		}
		setIsResetting(true);
		try {
			await authApi.requestPasswordChange({ email: forgotEmail });
			setOtpSent(true);
			toast.success('OTP sent to your email');
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Failed to send OTP');
		} finally {
			setIsResetting(false);
		}
	};

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!otp || otp.length !== 6) {
			toast.error('Please enter a valid 6-digit OTP');
			return;
		}
		if (newPassword.length < 8) {
			toast.error('Password must be at least 8 characters');
			return;
		}
		if (newPassword !== confirmPassword) {
			toast.error('Passwords do not match');
			return;
		}
		setIsResetting(true);
		try {
			await authApi.changePassword({
				email: forgotEmail,
				otp,
				newPassword,
			});
			toast.success('Password reset successfully');
			// Reset state and close modal
			setShowForgotPassword(false);
			setForgotEmail('');
			setOtp('');
			setNewPassword('');
			setConfirmPassword('');
			setOtpSent(false);
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Failed to reset password');
		} finally {
			setIsResetting(false);
		}
	};

	const handleCancelForgotPassword = () => {
		setShowForgotPassword(false);
		setForgotEmail('');
		setOtp('');
		setNewPassword('');
		setConfirmPassword('');
		setOtpSent(false);
	};

	return (
		<div className="auth-page">
			{!showForgotPassword ? (
				<form className="auth-card" onSubmit={handleSubmit}>
					<h2>Login</h2>
					<label htmlFor="identifier-input">Email / Reg No / Employee ID</label>
					<input
						id="identifier-input"
						name="identifier"
						value={identifier}
						onChange={(e) => setIdentifier(e.target.value)}
						type="text"
						placeholder="name@vitstudent.ac.in or reg/employee ID"
						required
					/>
					<label htmlFor="password-input">Password</label>
					<input id="password-input" name="password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
					<button type="submit" disabled={isLoading}>
						{isLoading ? 'Signing in...' : 'Login'}
					</button>
					<p>
						<button
							type="button"
							onClick={() => setShowForgotPassword(true)}
							style={{
								background: 'none',
								border: 'none',
								color: 'var(--primary)',
								cursor: 'pointer',
								textDecoration: 'underline',
								padding: 0,
								fontSize: '0.9rem'
							}}
						>
							Forgot Password?
						</button>
					</p>
					<p>
						No account? <Link to="/register">Register</Link>
					</p>
				</form>
			) : (
				<div className="auth-card">
					<h2>Reset Password</h2>
					{!otpSent ? (
						<>
							<p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
								Enter your email to receive an OTP
							</p>
							<label htmlFor="forgot-email">Email</label>
							<input
								id="forgot-email"
								type="email"
								value={forgotEmail}
								onChange={(e) => setForgotEmail(e.target.value)}
								required
							/>
							<div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
								<button
									type="button"
									onClick={handleCancelForgotPassword}
									style={{ flex: 1, background: 'var(--bg-secondary)' }}
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={handleRequestOTP}
									disabled={isResetting}
									style={{ flex: 1 }}
								>
									{isResetting ? 'Sending...' : 'Send OTP'}
								</button>
							</div>
						</>
					) : (
						<form onSubmit={handleResetPassword}>
							<p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
								Enter the OTP sent to {forgotEmail} and your new password
							</p>
							<label htmlFor="otp-input">OTP</label>
							<input
								id="otp-input"
								type="text"
								value={otp}
								onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
								maxLength={6}
								placeholder="Enter 6-digit OTP"
								required
							/>
							<label htmlFor="new-password">New Password</label>
							<input
								id="new-password"
								type="password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								minLength={8}
								placeholder="At least 8 characters"
								required
							/>
							<label htmlFor="confirm-password">Confirm Password</label>
							<input
								id="confirm-password"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="Re-enter new password"
								required
							/>
							<div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
								<button
									type="button"
									onClick={handleCancelForgotPassword}
									style={{ flex: 1, background: 'var(--bg-secondary)' }}
								>
									Cancel
								</button>
								<button type="submit" disabled={isResetting} style={{ flex: 1 }}>
									{isResetting ? 'Resetting...' : 'Reset Password'}
								</button>
							</div>
						</form>
					)}
				</div>
			)}
		</div>
	);
};

export default Login;
