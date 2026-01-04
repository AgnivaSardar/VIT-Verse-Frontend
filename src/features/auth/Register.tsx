import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const Register: React.FC = () => {
	const { register, isLoading } = useAuth();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [role, setRole] = useState<'student' | 'teacher'>('student');
	const [studentRegID, setStudentRegID] = useState('');
	const [employeeID, setEmployeeID] = useState('');
	const navigate = useNavigate();

	const isValidEmailDomain = (value: string) =>
		value.endsWith('@vitstudent.ac.in') || value.endsWith('@vit.ac.in');

	// Detect role from email domain. Returns 'student' | 'teacher' | null
	const detectRoleFromEmail = (value: string): 'student' | 'teacher' | null => {
		const v = value.toLowerCase();
		if (v.endsWith('@vitstudent.ac.in')) return 'student';
		if (v.endsWith('@vit.ac.in')) return 'teacher';
		return null;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!isValidEmailDomain(email)) {
			toast.error('Email must end with @vitstudent.ac.in (students) or @vit.ac.in (professors)');
			return;
		}

		// Enforce role/domain consistency: if the email domain implies a role,
		// disallow registering with the opposite role.
		const detected = detectRoleFromEmail(email);
		if (detected && detected !== role) {
			toast.error(
				`Your email domain (${email.split('@')[1]}) indicates a ${detected} account. Please select the ${detected} role or use an appropriate email.`
			);
			return;
		}
		if (password.length < 8) {
			toast.error('Password must be at least 8 characters');
			return;
		}
		if (role === 'student' && !studentRegID.trim()) {
			toast.error('Student Registration Number is required');
			return;
		}
		if (role === 'teacher' && !employeeID.trim()) {
			toast.error('Professor Employee ID is required');
			return;
		}
		try {
			await register({
				name,
				email,
				password,
				role,
				studentRegID: role === 'student' ? studentRegID.trim() : undefined,
				employeeID: role === 'teacher' ? employeeID.trim() : undefined,
			});
			toast.success('Registered. Please verify your email with OTP');
			navigate('/login');
		} catch (error) {
			toast.error('Registration failed');
			console.error(error);
		}
	};

		return (
			<div className="auth-page">
				<form className="auth-card" onSubmit={handleSubmit}>
					<h2>Register</h2>
					<label htmlFor="name-input">Name</label>
					<input id="name-input" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
					<label htmlFor="email-input">Email</label>
					<input
						id="email-input"
						name="email"
						value={email}
						onChange={(e) => {
							const v = e.target.value.trim();
							setEmail(v);
							const detected = detectRoleFromEmail(v);
							if (detected) setRole(detected);
						}}
						type="email"
						placeholder="name@vitstudent.ac.in or name@vit.ac.in"
						required
					/>
					<label htmlFor="password-input">Password</label>
					<input
						id="password-input"
						name="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						type="password"
						minLength={8}
						placeholder="At least 8 characters"
						required
					/>
					<label htmlFor="role-select">Role</label>
					{(() => {
						const detectedRole = detectRoleFromEmail(email);
						return (
							<>
								<select
									id="role-select"
									name="role"
									value={role}
									onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
									disabled={Boolean(detectedRole)}
								>
									<option value="student">Student</option>
									<option value="teacher">Teacher</option>
								</select>
								{detectedRole && (
									<p className="form-hint">Role is set to <strong>{detectedRole}</strong> based on your email domain.</p>
								)}
							</>
						);
					})()}
				{role === 'student' ? (
					<>
						<label htmlFor="student-reg">Student Registration Number</label>
						<input
							id="student-reg"
							name="studentRegID"
							value={studentRegID}
							onChange={(e) => setStudentRegID(e.target.value)}
							placeholder="e.g., 21BCE0000"
							required
						/>
					</>
				) : (
					<>
						<label htmlFor="employee-id">Professor Employee ID</label>
						<input
							id="employee-id"
							name="employeeID"
							value={employeeID}
							onChange={(e) => setEmployeeID(e.target.value)}
							placeholder="Enter your employee ID"
							required
						/>
					</>
				)}
				<button type="submit" disabled={isLoading}>
					{isLoading ? 'Signing up...' : 'Register'}
				</button>
				<p>
					Have an account? <Link to="/login">Login</Link>
				</p>
			</form>
		</div>
	);
};

export default Register;
