import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectAuth } from '../../store/authSlice';
import { apiClient } from '../../api/client';
import './ProfileComponent.css';

const ProfileComponent = () => {
	const navigate = useNavigate();
	const auth = useSelector(selectAuth);
	const token = auth?.token;
	const [form, setForm] = useState({
		userName: '',
		password: '',
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [redirecting, setRedirecting] = useState(false);

	useEffect(() => {
		let cancelled = false;

		if (!token) {
			setForm((prev) => ({ ...prev, userName: '' }));
			return () => {
				cancelled = true;
			};
		}

		const getUserName = async () => {
			try {
				const res = await apiClient.get('/user/getUserName', {
					params: { token: token },
					headers: { Authorization: `Bearer ${token}` },
				});

				if (cancelled) return;
				const userName = typeof res?.data === 'string' ? res.data : '';
				setForm((prev) => ({ ...prev, userName }));
			} catch {
				if (cancelled) return;
			}
		};

		getUserName();
		return () => {
			cancelled = true;
		};
	}, [token]);

	useEffect(() => {
		if (!success) return undefined;

		setRedirecting(true);
		const timer = setTimeout(() => {
			navigate('/dashboard');
		}, 900);

		return () => {
			clearTimeout(timer);
			setRedirecting(false);
		};
	}, [success, navigate]);

	const isUpdateDisabled =
		submitting ||
		redirecting ||
		!form.userName.trim() ||
		!form.password.trim();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		setError('');
		setSuccess('');
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			setSubmitting(true);
			setError('');
			setSuccess('');

			const res = await apiClient.put('/user/update', {
				token: token,
				userName: form.userName.trim(),
				password: form.password,
			});

			const nextUserName = res?.data?.userName;
			setForm((prev) => ({
				...prev,
				userName: typeof nextUserName === 'string' && nextUserName.trim() ? nextUserName : prev.userName,
				password: '',
			}));
			setSuccess('Profile updated successfully.');
		} catch (error) {
			const responseData = error?.response?.data;
			const backendMessage = typeof responseData === 'string'
				? responseData
				: responseData?.message;
			setError(backendMessage || error?.message || 'Failed to update profile');
		} finally {
			setSubmitting(false);
		}
	};

	const handleCancel = () => {
		if (redirecting) return;
		navigate('/dashboard');
	};

	return (
		<div className="profile-root">
			<div className="profile-card">
				<h2 className="profile-title">Profile</h2>
				<form onSubmit={handleSubmit}>
					<div className="profile-field">
						<label htmlFor="profile-username">User name</label>
						<input
							id="profile-username"
							name="userName"
							className="profile-input"
							value={form.userName}
							onChange={handleChange}
						/>
					</div>

					<div className="profile-field">
						<label htmlFor="profile-password">Password</label>
						<input
							id="profile-password"
							name="password"
							type="password"
							className="profile-input"
							value={form.password}
							onChange={handleChange}
						/>
					</div>

					<div className="profile-actions">
						<button type="submit" className="nav-btn primary" disabled={isUpdateDisabled}>
							{submitting ? 'Updating…' : 'Update Profile'}
						</button>
						<button type="button" className="nav-btn" onClick={handleCancel}>
							Cancel
						</button>
					</div>
					{error ? <p className="profile-error">{error}</p> : null}
					{success ? <p className="profile-success">{success}</p> : null}
				</form>
			</div>
		</div>
	);
};

export default ProfileComponent;