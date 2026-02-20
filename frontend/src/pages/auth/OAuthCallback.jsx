import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';


const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loading, user } = useAuth();

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const error = searchParams.get('error');

        if (error) {
            const details = searchParams.get('details');
            console.error('OAuth error:', error, details);
            navigate(`/login?error=oauth_failed&details=${encodeURIComponent(details || '')}`);
            return;
        }

        if (accessToken && refreshToken) {
            // Store tokens in localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            // Redirect to home page and reload to trigger AuthContext
            window.location.href = '/';
        } else {
            navigate('/login?error=missing_tokens');
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">
                    Completing sign in...
                </h2>
                <p className="text-gray-500 mt-2">Please wait while we redirect you</p>
            </div>
        </div>
    );
};

export default OAuthCallback;
