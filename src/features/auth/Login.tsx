import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const Login: React.FC = () => {
	const { login, isLoading } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await login(email, password);
			toast.success('Logged in');
			navigate('/');
		} catch (error) {
			toast.error('Login failed');
			console.error(error);
		}
	};

	return (
		<div className="auth-page">
			<form className="auth-card" onSubmit={handleSubmit}>
				<h2>Login</h2>
				<label>Email</label>
				<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
				<label>Password</label>
				<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
				<button type="submit" disabled={isLoading}>
					{isLoading ? 'Signing in...' : 'Login'}
				</button>
				<p>
					No account? <Link to="/register">Register</Link>
				</p>
			</form>
		</div>
	);
};

export default Login;
