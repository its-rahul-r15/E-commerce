import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseCustomerQuery } from '../../services/aiService';
import { productService } from '../../services/api';
import ProductCard from './ProductCard';

// Check if browser supports SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const CustomerAIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            text: 'Namaste! 🙏 I am your Athenic Shopping Guide. Ask me anything like:\n\n"Show me silk kurtas under ₹2000"\n"Find red sarees"\n"I need office wear under ₹3000"',
            products: []
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [recognitionError, setRecognitionError] = useState('');
    const recognitionRef = useRef(null);
    const bottomRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const addMessage = (role, text, products = []) => {
        setMessages(prev => [...prev, { role, text, products }]);
    };

    const handleSearch = async (query) => {
        if (!query.trim()) return;
        addMessage('user', query);
        setInput('');
        setLoading(true);

        try {
            // Parse natural language query
            const filters = await parseCustomerQuery(query);

            if (filters.intent === 'navigate' && filters.searchQuery) {
                navigate(`/search?q=${encodeURIComponent(filters.searchQuery)}`);
                addMessage('assistant', `Taking you to search results for "${filters.searchQuery}"... 🔍`);
                setLoading(false);
                return;
            }

            // Build API params from parsed filters
            const apiParams = {};
            if (filters.searchQuery) apiParams.search = filters.searchQuery;
            if (filters.maxPrice) apiParams.maxPrice = filters.maxPrice;
            if (filters.minPrice) apiParams.minPrice = filters.minPrice;
            if (filters.color) apiParams.color = filters.color;
            if (filters.size) apiParams.size = filters.size;
            apiParams.limit = 20; // Fetch up to 20, display up to 6 in UI

            let products = [];

            // Pass 1: Try with all filters
            try {
                const data = await productService.getProducts(apiParams);
                products = (data.products || data.data || []).slice(0, 6);
            } catch { /* will fallback */ }

            // Pass 2: If no results, try dedicated search endpoint with just the keyword
            if (products.length === 0 && filters.searchQuery) {
                try {
                    const fallback = await productService.searchProducts(filters.searchQuery, 1, 20);
                    const arr = Array.isArray(fallback) ? fallback : fallback?.products || fallback?.data || [];
                    products = arr.slice(0, 6);
                } catch { /* ignore */ }
            }

            // Pass 3: If still nothing, try broader search with original input words
            if (products.length === 0) {
                try {
                    const words = query.replace(/[₹\d,]/g, '').trim().split(/\s+/).slice(0, 2).join(' ');
                    if (words && words !== filters.searchQuery) {
                        const broader = await productService.getProducts({ search: words, limit: 20 });
                        products = (broader.products || broader.data || []).slice(0, 6);
                    }
                } catch { /* ignore */ }
            }

            if (products.length === 0) {
                addMessage('assistant', `I couldn't find products matching "${filters.searchQuery || query}". This category may not be available yet in our collection. Try browsing all products!`, []);
            } else {
                const priceNote = filters.maxPrice ? ` under ₹${filters.maxPrice.toLocaleString()}` : '';
                const colorNote = filters.color ? ` in ${filters.color}` : '';
                addMessage(
                    'assistant',
                    `Found ${products.length} pieces for "${filters.searchQuery || query}"${colorNote}${priceNote}:`,
                    products
                );
            }
        } catch (err) {
            console.error('AI assistant error:', err);
            addMessage('assistant', 'Sorry, something went wrong while searching. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const startVoiceInput = () => {
        if (!SpeechRecognition) {
            setRecognitionError('Voice input not supported in this browser. Try Chrome or Edge.');
            return;
        }

        setRecognitionError('');
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN'; // Indian English
        recognition.continuous = false;
        recognition.interimResults = false;
        recognitionRef.current = recognition;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e) => {
            setIsListening(false);
            setRecognitionError(e.error === 'not-allowed' ? 'Microphone access denied.' : 'Voice input failed. Try again.');
        };
        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setInput(transcript);
            handleSearch(transcript);
        };

        recognition.start();
    };

    const stopVoiceInput = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 focus:outline-none ${isOpen
                    ? 'bg-[var(--athenic-blue)] text-white scale-90'
                    : 'bg-[var(--athenic-gold)] text-[var(--athenic-blue)] hover:scale-110'
                    }`}
                aria-label="AI Shopping Assistant"
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <span className="text-2xl">✨</span>
                )}
            </button>

            {/* Pulse Indicator */}
            {!isOpen && (
                <div className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[var(--athenic-gold)] opacity-30 animate-ping pointer-events-none"></div>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] bg-white border border-[var(--athenic-gold)] border-opacity-20 shadow-2xl flex flex-col animate-slide-up overflow-hidden max-h-[75vh]">

                    {/* Header */}
                    <div className="bg-[var(--athenic-blue)] px-6 py-4 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl" style={{ filter: 'drop-shadow(0 0 6px gold)' }}>⚜️</span>
                            <div>
                                <h3 className="text-xs font-serif uppercase tracking-[0.2em] text-white">Athenic AI Guide</h3>
                                <p className="text-[9px] font-serif text-white opacity-50 tracking-widest">Ask me anything</p>
                            </div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-[var(--athenic-gold)] animate-pulse"></div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--athenic-bg)]">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                                    <div className={`px-4 py-3 text-[11px] font-serif leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                        ? 'bg-[var(--athenic-blue)] text-white ml-auto'
                                        : 'bg-white border border-gray-100 text-gray-600'
                                        }`}>
                                        {msg.text}
                                    </div>

                                    {/* Product results in message */}
                                    {msg.products?.length > 0 && (
                                        <div className="mt-3 grid grid-cols-2 gap-3">
                                            {msg.products.slice(0, 6).map(product => (
                                                <div
                                                    key={product._id}
                                                    onClick={() => navigate(`/product/${product._id}`)}
                                                    className="bg-white border border-gray-100 hover:border-[var(--athenic-gold)] cursor-pointer transition-all group overflow-hidden"
                                                >
                                                    <div className="aspect-[3/4] overflow-hidden">
                                                        <img
                                                            src={product.images?.[0] || '/placeholder.png'}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div className="p-2">
                                                        <p className="text-[9px] font-serif uppercase tracking-wide text-[var(--athenic-blue)] leading-tight truncate">{product.name}</p>
                                                        <p className="text-[10px] font-serif text-[var(--athenic-gold)] mt-1">
                                                            ₹{(product.discountedPrice || product.price || 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Loading */}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 px-4 py-3 flex items-center space-x-2">
                                    <div className="flex space-x-1">
                                        <div className="w-1.5 h-1.5 bg-[var(--athenic-gold)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-[var(--athenic-gold)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-[var(--athenic-gold)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                    <span className="text-[9px] font-serif text-gray-400 uppercase tracking-widest">Searching the atelier...</span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef}></div>
                    </div>

                    {/* Voice Error */}
                    {recognitionError && (
                        <div className="px-4 py-2 bg-red-50 border-t border-red-100">
                            <p className="text-[9px] font-serif text-red-500 uppercase tracking-widest">{recognitionError}</p>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="border-t border-gray-100 p-3 flex-shrink-0 bg-white">
                        <div className="flex items-center space-x-2">
                            {/* Voice button */}
                            <button
                                onClick={isListening ? stopVoiceInput : startVoiceInput}
                                className={`w-10 h-10 flex-shrink-0 flex items-center justify-center border transition-all ${isListening
                                    ? 'border-red-400 bg-red-50 animate-pulse'
                                    : 'border-gray-100 hover:border-[var(--athenic-gold)] hover:bg-[var(--athenic-bg)]'
                                    }`}
                                title={isListening ? 'Stop listening' : 'Speak your query'}
                            >
                                {isListening ? (
                                    <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                        <rect x="6" y="6" width="12" height="12" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4 text-[var(--athenic-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                )}
                            </button>

                            {/* Text Input */}
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !loading && handleSearch(input)}
                                placeholder="e.g., silk saree under ₹3000..."
                                className="flex-1 text-[11px] font-serif border-b border-gray-200 py-2 focus:border-[var(--athenic-gold)] outline-none bg-transparent placeholder:text-gray-300 placeholder:italic"
                                disabled={loading}
                            />

                            {/* Send button */}
                            <button
                                onClick={() => !loading && handleSearch(input)}
                                disabled={loading || !input.trim()}
                                className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[var(--athenic-blue)] text-white disabled:opacity-30 hover:bg-opacity-90 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        </div>

                        {/* Listening indicator */}
                        {isListening && (
                            <p className="text-[9px] font-serif text-red-500 uppercase tracking-widest mt-2 text-center animate-pulse">
                                🎙️ Listening... Speak your request
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default CustomerAIAssistant;
