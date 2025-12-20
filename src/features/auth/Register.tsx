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
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await register(name, email, password, role);
			toast.success('Registered');
			navigate('/');
		} catch (error) {
			toast.error('Registration failed');
			console.error(error);
		}
	};

	return (
		<div className="auth-page">
			<form className="auth-card" onSubmit={handleSubmit}>
				<h2>Register</h2>
				<label>Name</label>
				<input value={name} onChange={(e) => setName(e.target.value)} required />
				<label>Email</label>
				<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
				<label>Password</label>
				<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
				<label>Role</label>
				<select value={role} onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}>
					<option value="student">Student</option>
					<option value="teacher">Teacher</option>
				</select>
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
