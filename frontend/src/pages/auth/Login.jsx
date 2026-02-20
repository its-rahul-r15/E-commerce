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
        <div className="min-h-screen flex bg-[var(--athenic-bg)] selection:bg-[var(--athenic-gold)] selection:text-white overflow-hidden">

            {/* Left Side: The Dynasty Wing (Branding) */}
            <div className="hidden lg:flex lg:w-5/12 relative bg-white border-r border-[var(--athenic-gold)] border-opacity-20 animate-fade-in">
                {/* Marble Texture Background */}
                <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/marble-white.png')]"></div>

                <div className="relative z-10 w-full flex flex-col justify-between p-16">
                    {/* Top Ornament */}
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 border border-[var(--athenic-gold)] flex items-center justify-center text-[var(--athenic-gold)]">
                            🏛️
                        </div>
                        <span className="text-xs font-serif uppercase tracking-[0.4em] text-[var(--athenic-gold)]">Athenic Tradition</span>
                    </div>

                    {/* Center Branding */}
                    <div className="space-y-8">
                        <div className="relative inline-block mb-4">
                            <div className="w-24 h-24 rounded-full border border-[var(--athenic-gold)] border-opacity-40 flex items-center justify-center animate-spin-slow">
                                <span className="text-4xl">⚜️</span>
                            </div>
                            <div className="absolute -inset-2 border-2 border-[var(--athenic-gold)] border-opacity-10 rounded-full scale-110"></div>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-serif tracking-[0.2em] text-[var(--athenic-blue)] uppercase leading-[1.2]">
                            WELCOME <br /> BACK <br /> FRIEND
                        </h1>

                        <p className="text-sm font-serif italic text-gray-400 tracking-widest max-w-sm leading-loose">
                            "Support your favorite local shops. Log in to explore quality products from your neighborhood."
                        </p>
                    </div>

                    {/* Footer Ornament */}
                    <div className="meander-border opacity-20 py-4"></div>
                </div>
            </div>

            {/* Right Side: The Scroll of Entry (Forms) */}
            <div className="flex-1 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/papyros-dark.png')] bg-repeat">

                <div className="w-full max-w-lg bg-white bg-opacity-95 p-10 sm:p-16 border border-[var(--athenic-gold)] border-opacity-10 shadow-athenic animate-slide-up relative">

                    {/* Greek Meander Top Bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--athenic-blue)]"></div>

                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center space-x-6 mb-10">
                            <button
                                onClick={() => setIsLogin(true)}
                                className={`text-[10px] font-serif uppercase tracking-[0.3em] transition-all pb-2 border-b-2 ${isLogin ? 'text-[var(--athenic-blue)] border-[var(--athenic-gold)]' : 'text-gray-300 border-transparent hover:text-gray-400'}`}
                            >
                                Login
                            </button>
                            <span className="h-4 w-[1px] bg-gray-100 mb-2"></span>
                            <button
                                onClick={() => setIsLogin(false)}
                                className={`text-[10px] font-serif uppercase tracking-[0.3em] transition-all pb-2 border-b-2 ${!isLogin ? 'text-[var(--athenic-blue)] border-[var(--athenic-gold)]' : 'text-gray-300 border-transparent hover:text-gray-400'}`}
                            >
                                Create Account
                            </button>
                        </div>

                        <h2 className="text-3xl font-serif tracking-[0.1em] text-[var(--athenic-blue)] uppercase">
                            {isLogin ? 'Welcome Back' : 'Join Us'}
                        </h2>
                        <div className="h-0.5 w-12 bg-[var(--athenic-gold)] mx-auto mt-4 opacity-40"></div>
                    </div>

                    {/* Google Sign In */}
                    <button
                        onClick={googleLogin}
                        className="w-full flex items-center justify-center space-x-4 bg-white border border-gray-100 py-5 transition-all hover:bg-[var(--athenic-bg)] hover:border-[var(--athenic-gold)] group"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="text-[10px] font-serif uppercase tracking-[0.2em] text-gray-500 group-hover:text-[var(--athenic-blue)]">
                            Continue with Google
                        </span>
                    </button>

                    {/* Divider */}
                    <div className="relative my-10">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-6 bg-white text-[9px] font-serif uppercase tracking-widest text-gray-300 italic">
                                Or use your account
                            </span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-8 p-4 bg-[#FFF5F5] border-l-2 border-[#C53030] animate-pulse">
                            <p className="text-[10px] font-serif uppercase tracking-widest text-[#C53030]">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {!isLogin && (
                            <>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-serif uppercase tracking-widest text-[var(--athenic-blue)] opacity-60">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-b border-gray-200 py-3 text-sm font-serif focus:border-[var(--athenic-gold)] outline-none transition-all placeholder:text-gray-200"
                                        placeholder="Ariston of Sparta"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[10px] font-serif uppercase tracking-widest text-[var(--athenic-blue)] opacity-60">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-b border-gray-200 py-3 text-sm font-serif focus:border-[var(--athenic-gold)] outline-none transition-all placeholder:text-gray-200"
                                        placeholder="Phone Number"
                                        pattern="[6-9][0-9]{9}"
                                    />
                                </div>

                                <div className="space-y-1 pb-4">
                                    <label className="block text-[10px] font-serif uppercase tracking-widest text-[var(--athenic-blue)] opacity-60 mb-2">Role in Tradition</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-b border-gray-200 py-3 text-[10px] font-serif uppercase tracking-widest focus:border-[var(--athenic-gold)] outline-none transition-all"
                                    >
                                        <option value="customer">I am a Customer</option>
                                        <option value="seller">I am a Seller</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="space-y-1">
                            <label className="block text-[10px] font-serif uppercase tracking-widest text-[var(--athenic-blue)] opacity-60">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-gray-200 py-3 text-sm font-serif focus:border-[var(--athenic-gold)] outline-none transition-all placeholder:text-gray-200"
                                placeholder="name@email.com"
                            />
                        </div>

                        <div className="space-y-1 relative">
                            <label className="block text-[10px] font-serif uppercase tracking-widest text-[var(--athenic-blue)] opacity-60">Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-gray-200 py-3 text-sm font-serif focus:border-[var(--athenic-gold)] outline-none transition-all placeholder:text-gray-200"
                                placeholder="••••••••"
                                minLength="8"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-0 bottom-3 text-gray-300 hover:text-[var(--athenic-gold)] transition-colors"
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>

                        {isLogin && (
                            <div className="flex items-center justify-between">
                                <label className="flex items-center space-x-2 cursor-pointer group">
                                    <input type="checkbox" className="w-3 h-3 border border-gray-200 focus:ring-0 checked:bg-[var(--athenic-gold)] transition-all" />
                                    <span className="text-[9px] font-serif uppercase tracking-widest text-gray-400 group-hover:text-gray-600 transition-colors">Remember Me</span>
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-[9px] font-serif uppercase tracking-widest text-[var(--athenic-gold)] hover:opacity-70 transition-opacity italic underline-offset-4 underline"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[var(--athenic-blue)] text-white font-serif text-[11px] uppercase tracking-[0.3em] py-5 shadow-athenic hover:bg-opacity-90 disabled:opacity-50 transition-all flex items-center justify-center space-x-3 overflow-hidden relative group"
                        >
                            <span className="relative z-10">{loading ? 'Loading...' : (isLogin ? 'Login' : 'Create Account')}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-12 pt-8 border-t border-gray-50 text-center">
                        <Link to="/" className="text-[9px] font-serif uppercase tracking-[0.4em] text-gray-300 hover:text-[var(--athenic-gold)] transition-colors">
                            Return to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
