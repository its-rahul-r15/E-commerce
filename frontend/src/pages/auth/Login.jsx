import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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

    const { login, register, googleLogin, user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const errorParam = searchParams.get('error');
        const detailsParam = searchParams.get('details');

        if (errorParam === 'oauth_failed') {
            setError(detailsParam ? `Login Failed: ${detailsParam}` : 'Login Failed. Please try again.');
        } else if (errorParam === 'missing_tokens') {
            setError('Authentication failed: Registration was incomplete.');
        }
    }, [searchParams]);

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (user.role === 'seller') {
                navigate('/seller/dashboard');
            } else {
                navigate('/');
            }
        }
    }, [user, navigate]);

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
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans overflow-hidden">
            {/* Left Side: Fashion Image */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative bg-gray-100 items-center justify-center overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1550614000-4b95d4ebffdd?q=80&w=1470&auto=format&fit=crop" 
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Premium Fashion"
                />
                <div className="absolute inset-0 bg-black/25"></div>
                <div className="relative z-10 text-center text-white px-12">
                    <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
                        <h1 className="text-5xl xl:text-6xl font-serif tracking-[0.2em] uppercase mb-4">Klyra</h1>
                    </Link>
                    <p className="text-lg font-light tracking-wide max-w-md mx-auto opacity-90">
                        Discover a new era of premium fashion and timeless elegance.
                    </p>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 xl:px-32 py-12 overflow-y-auto">
                <div className="w-full max-w-md mx-auto">
                    {/* Header for Mobile */}
                    <div className="lg:hidden text-center mb-10">
                        <Link to="/" className="inline-block">
                            <h1 className="text-4xl font-serif tracking-widest uppercase text-gray-900">Klyra</h1>
                        </Link>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-serif text-gray-900 tracking-wide mb-2">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {isLogin 
                                ? 'Please enter your details to sign in.' 
                                : 'Join Klyra to unlock premium fashion and exclusive offers.'}
                        </p>
                    </div>

                    {/* Google Sign In */}
                    <button
                        type="button"
                        onClick={googleLogin}
                        className="w-full flex items-center justify-center space-x-3 border border-gray-200 py-3 hover:bg-gray-50 transition-colors mb-6 group"
                    >
                        <svg className="h-5 w-5 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">Continue with Google</span>
                    </button>

                    <div className="relative flex items-center mb-8">
                        <div className="flex-grow border-t border-gray-100"></div>
                        <span className="flex-shrink-0 mx-4 text-xs text-gray-400 uppercase tracking-widest bg-white px-2">Or</span>
                        <div className="flex-grow border-t border-gray-100"></div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-[#fff4f4] text-[#d32f2f] text-xs font-medium uppercase tracking-wider p-4 text-center border border-[#ffcdcd]">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div className="space-y-5 animate-fade-in">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full border-b border-gray-200 py-2 focus:border-[var(--athenic-gold)] focus:border-b-2 outline-none transition-all text-sm bg-transparent"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full border-b border-gray-200 py-2 focus:border-[var(--athenic-gold)] focus:border-b-2 outline-none transition-all text-sm bg-transparent"
                                            placeholder="Mobile number"
                                            pattern="[6-9][0-9]{9}"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">Join As</label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="w-full border-b border-gray-200 py-2 focus:border-[var(--athenic-gold)] focus:border-b-2 outline-none transition-all text-sm text-gray-700 bg-transparent cursor-pointer"
                                        >
                                            <option value="customer">Shopper</option>
                                            <option value="seller">Seller / Artisan</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full border-b border-gray-200 py-2 focus:border-[var(--athenic-gold)] focus:border-b-2 outline-none transition-all text-sm bg-transparent"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div className="relative">
                                <label className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">Password</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full border-b border-gray-200 py-2 focus:border-[var(--athenic-gold)] focus:border-b-2 outline-none transition-all text-sm bg-transparent pr-12"
                                    placeholder="••••••••"
                                    minLength="8"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 bottom-2 text-xs text-gray-400 hover:text-[var(--athenic-gold)] transition-colors uppercase font-medium tracking-wider"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {isLogin && (
                            <div className="flex items-center justify-between pt-2">
                                <label className="flex items-center space-x-2 cursor-pointer group">
                                    <input type="checkbox" className="w-3.5 h-3.5 border-gray-300 rounded-sm text-[var(--athenic-gold)] focus:ring-0 accent-[var(--athenic-gold)]" />
                                    <span className="text-xs text-gray-500 group-hover:text-gray-900 transition-colors uppercase tracking-wider">Remember Me</span>
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs text-gray-500 hover:text-[var(--athenic-gold)] underline transition-colors uppercase tracking-wider"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[var(--athenic-blue)] text-white text-[11px] font-semibold tracking-[0.2em] uppercase py-4 hover:bg-opacity-90 disabled:opacity-50 transition-all mt-6 shadow-md"
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    {/* Footer Toggle */}
                    <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-widest">
                            {isLogin ? "New to Klyra?" : "Already part of Klyra?"}{' '}
                            <button
                                onClick={() => { 
                                    setIsLogin(!isLogin); 
                                    setError(''); 
                                    setFormData({...formData, password: ''}); 
                                }}
                                className="font-semibold text-gray-900 hover:text-[var(--athenic-gold)] underline transition-colors ml-1"
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;
