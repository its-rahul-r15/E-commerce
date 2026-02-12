import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShoppingBagIcon, LockClosedIcon, UserIcon, PhoneIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'customer',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                await register(formData);
            }
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Brand Section */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 relative overflow-hidden">
                {/* Animated background shapes */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
                    {/* Logo */}
                    <div>
                        <Link to="/" className="flex items-center space-x-2">
                            <ShoppingBagIcon className="h-10 w-10" />
                            <span className="text-3xl font-bold">LocalMarket</span>
                        </Link>
                        <div className="flex items-center space-x-2 mt-4 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 w-fit">
                            <LockClosedIcon className="h-4 w-4" />
                            <span className="text-sm">Secure Login</span>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-6">
                        <h1 className="text-5xl font-bold leading-tight">
                            Support your local<br />community today.
                        </h1>
                        <p className="text-lg text-purple-100 max-w-md">
                            Access the best local products, connect with artisans, and grow your neighborhood economy all in one place.
                        </p>
                    </div>

                    {/* Social Proof */}
                    <div className="flex items-center space-x-4">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 border-2 border-white"></div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white"></div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 border-2 border-white"></div>
                            <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm border-2 border-white flex items-center justify-center">
                                <span className="text-sm font-semibold">50K+</span>
                            </div>
                        </div>
                        <p className="text-sm">Join 50,000+ local shoppers today</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Link to="/" className="inline-flex items-center space-x-2 text-2xl font-bold text-gray-900">
                            <ShoppingBagIcon className="h-8 w-8 text-purple-600" />
                            <span>LocalMarket</span>
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                }}
                                className="text-sm text-gray-600"
                            >
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <span className="text-purple-600 font-semibold hover:text-purple-700">
                                    {isLogin ? 'Sign Up' : 'Sign In'}
                                </span>
                            </button>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {isLogin ? 'Please enter your details to sign in.' : 'Sign up to start shopping locally.'}
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {/* Google Sign In */}
                        <button
                            onClick={googleLogin}
                            className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 rounded-xl py-3.5 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-md group"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span className="font-semibold text-gray-700 group-hover:text-gray-900">
                                Continue with Google
                            </span>
                        </button>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500 font-medium">
                                    Or continue with email
                                </span>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                                                placeholder="9876543210"
                                                pattern="[6-9][0-9]{9}"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Account Type
                                        </label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                                        >
                                            <option value="customer">👤 Customer (Buy products)</option>
                                            <option value="seller">🏪 Seller (Own a shop)</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                                        placeholder="••••••••"
                                        minLength="8"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {isLogin && (
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-600">Remember me</span>
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm font-semibold text-purple-600 hover:text-purple-700"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3.5 rounded-xl hover:from-purple-700 hover:to-blue-700 focus:ring-4 focus:ring-purple-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center">
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        </form>

                        {/* Footer Links */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                                <Link to="/privacy" className="hover:text-purple-600 transition-colors">
                                    Privacy Policy
                                </Link>
                                <span>•</span>
                                <Link to="/terms" className="hover:text-purple-600 transition-colors">
                                    Terms of Service
                                </Link>
                                <span>•</span>
                                <Link to="/" className="hover:text-purple-600 transition-colors">
                                    Back to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
