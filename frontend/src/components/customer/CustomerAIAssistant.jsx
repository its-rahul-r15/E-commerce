import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatWithKlyraAssistant, parseCustomerQuery } from '../../services/aiService';
import { productService } from '../../services/api';

// Check if browser supports SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const QUICK_SUGGESTIONS = [
    "Show me trending kurtas",
    "Saree under ₹3000",
    "Wedding outfit ideas",
    "What's new at Klyra?",
];

const CustomerAIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            text: "Hey! 🙏 Main Naitri hoon, aapki personal styling assistant at Klyra.\n\nMujhse kuch bhi pucho — products dhundhne se lekar styling advice tak, I'm here to help!",
            products: []
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [recognitionError, setRecognitionError] = useState('');
    const recognitionRef = useRef(null);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const addMessage = (role, text, products = []) => {
        setMessages(prev => [...prev, { role, text, products }]);
    };

    const handleSend = async (query) => {
        const q = query?.trim();
        if (!q) return;
        addMessage('user', q);
        setInput('');
        setLoading(true);

        try {
            // Get conversational AI response with full history
            const aiResponse = await chatWithKlyraAssistant(q, messages);

            let products = [];

            // If AI says to show products, do the search
            if (aiResponse.showProducts && aiResponse.searchFilters) {
                const filters = aiResponse.searchFilters;
                const apiParams = {};
                if (filters.searchQuery) apiParams.search = filters.searchQuery;
                if (filters.maxPrice) apiParams.maxPrice = filters.maxPrice;
                if (filters.minPrice) apiParams.minPrice = filters.minPrice;
                if (filters.color) apiParams.color = filters.color;
                if (filters.category) apiParams.categories = filters.category;
                apiParams.limit = 20;

                // Pass 1: Try with all filters
                try {
                    const data = await productService.getProducts(apiParams);
                    products = (Array.isArray(data?.data) ? data.data : data?.data?.products || data?.products || []).slice(0, 6);
                } catch { /* fallback */ }

                // Pass 2: Search endpoint
                if (products.length === 0 && filters.searchQuery) {
                    try {
                        const fallback = await productService.searchProducts(filters.searchQuery, 1, 20);
                        const arr = Array.isArray(fallback) ? fallback : fallback?.products || fallback?.data || [];
                        products = arr.slice(0, 6);
                    } catch { /* ignore */ }
                }

                // Pass 3: Broader search
                if (products.length === 0) {
                    try {
                        const words = q.replace(/[₹\d,]/g, '').trim().split(/\s+/).slice(0, 2).join(' ');
                        const broader = await productService.getProducts({ search: words, limit: 20 });
                        products = (Array.isArray(broader?.data) ? broader.data : broader?.data?.products || broader?.products || []).slice(0, 6);
                    } catch { /* ignore */ }
                }
            }

            // Add AI reply
            const replyText = products.length > 0 && aiResponse.showProducts
                ? `${aiResponse.reply}\n\nYe rahi ${products.length} best picks:`
                : aiResponse.reply + (aiResponse.showProducts && products.length === 0
                    ? "\n\nIs category mein abhi products available nahi hain. Kuch aur try karo!"
                    : "");

            addMessage('assistant', replyText, products);
        } catch (err) {
            console.error('AI assistant error:', err);
            addMessage('assistant', 'Oops, kuch gadbad ho gayi! 😅 Dobara try karo ya koi aur cheez pucho.');
        } finally {
            setLoading(false);
        }
    };

    const startVoiceInput = () => {
        if (!SpeechRecognition) {
            setRecognitionError('Voice input not supported. Try Chrome or Edge.');
            return;
        }

        setRecognitionError('');
        const recognition = new SpeechRecognition();
        recognition.lang = 'hi-IN'; // Hindi + English mix
        recognition.continuous = false;
        recognition.interimResults = false;
        recognitionRef.current = recognition;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e) => {
            setIsListening(false);
            setRecognitionError(e.error === 'not-allowed' ? 'Microphone access denied.' : 'Voice input failed.');
        };
        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setInput(transcript);
            handleSend(transcript);
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
                className={`fixed bottom-20 lg:bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 border-2 border-[var(--athenic-gold)] focus:outline-none ${isOpen
                    ? 'bg-white text-black scale-90'
                    : 'bg-white hover:scale-110'
                    }`}
                aria-label="AI Shopping Assistant"
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <img
                        src="https://res.cloudinary.com/dpfls0d1n/image/upload/v1771658235/WhatsApp_Image_2026-02-21_at_11.53.16_AM-removebg-preview_zdwbkr.png"
                        alt="AI Assistant"
                        className="w-full h-full object-contain p-2"
                    />
                )}
            </button>

            {/* Pulse Indicator */}
            {!isOpen && (
                <div className="fixed bottom-20 lg:bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[var(--athenic-gold)] opacity-30 animate-ping pointer-events-none"></div>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-40 lg:bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] bg-white border border-[var(--athenic-gold)] border-opacity-20 shadow-2xl flex flex-col animate-slide-up overflow-hidden max-h-[80vh] rounded-2xl">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-[var(--athenic-blue)] to-[#1a365d] px-6 py-4 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-[var(--athenic-gold)]/30">
                                <span className="text-lg" style={{ filter: 'drop-shadow(0 0 4px gold)' }}>⚜️</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-serif font-semibold tracking-wide text-white">Naitri</h3>
                                <p className="text-[10px] font-serif text-white/60 tracking-wider">Klyra Shopping Assistant</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                            <span className="text-[9px] text-white/50 font-serif">Online</span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#faf9f7] to-white">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] ${msg.role === 'user' ? '' : ''}`}>
                                    {/* Avatar + bubble */}
                                    <div className="flex items-end gap-2">
                                        {msg.role === 'assistant' && (
                                            <div className="w-6 h-6 rounded-full bg-[var(--athenic-blue)] flex items-center justify-center flex-shrink-0 mb-1">
                                                <span className="text-[10px]">⚜️</span>
                                            </div>
                                        )}
                                        <div className={`px-4 py-3 text-[12px] leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                            ? 'bg-[var(--athenic-blue)] text-white rounded-2xl rounded-br-sm'
                                            : 'bg-white border border-gray-100 text-gray-700 rounded-2xl rounded-bl-sm shadow-sm'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>

                                    {/* Product results in message */}
                                    {msg.products?.length > 0 && (
                                        <div className="mt-3 ml-8 grid grid-cols-2 gap-2.5">
                                            {msg.products.slice(0, 6).map(product => (
                                                <div
                                                    key={product._id}
                                                    onClick={() => navigate(`/product/${product._id}`)}
                                                    className="bg-white border border-gray-100 hover:border-[var(--athenic-gold)] cursor-pointer transition-all group overflow-hidden rounded-lg shadow-sm"
                                                >
                                                    <div className="aspect-[3/4] overflow-hidden">
                                                        <img
                                                            src={product.images?.[0] || '/placeholder.png'}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div className="p-2">
                                                        <p className="text-[10px] font-medium text-gray-800 leading-tight truncate">{product.name}</p>
                                                        <p className="text-[11px] font-bold text-[var(--athenic-gold)] mt-0.5">
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

                        {/* Typing indicator */}
                        {loading && (
                            <div className="flex items-end gap-2">
                                <div className="w-6 h-6 rounded-full bg-[var(--athenic-blue)] flex items-center justify-center flex-shrink-0">
                                    <span className="text-[10px]">⚜️</span>
                                </div>
                                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center space-x-2">
                                    <div className="flex space-x-1">
                                        <div className="w-1.5 h-1.5 bg-[var(--athenic-gold)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-[var(--athenic-gold)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-[var(--athenic-gold)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 italic">Naitri is typing...</span>
                                </div>
                            </div>
                        )}

                        {/* Quick suggestions — show only after first message */}
                        {messages.length <= 1 && !loading && (
                            <div className="flex flex-wrap gap-2 ml-8 mt-2">
                                {QUICK_SUGGESTIONS.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(s)}
                                        className="text-[10px] px-3 py-1.5 rounded-full border border-[var(--athenic-gold)]/30 text-[var(--athenic-blue)] hover:bg-[var(--athenic-gold)] hover:text-white transition-all font-medium"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div ref={bottomRef}></div>
                    </div>

                    {/* Voice Error */}
                    {recognitionError && (
                        <div className="px-4 py-2 bg-red-50 border-t border-red-100">
                            <p className="text-[10px] text-red-500">{recognitionError}</p>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="border-t border-gray-100 p-3 flex-shrink-0 bg-white">
                        <div className="flex items-center space-x-2">
                            {/* Voice button */}
                            <button
                                onClick={isListening ? stopVoiceInput : startVoiceInput}
                                className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full transition-all ${isListening
                                    ? 'bg-red-50 text-red-500 animate-pulse ring-2 ring-red-200'
                                    : 'hover:bg-gray-50 text-gray-400 hover:text-[var(--athenic-blue)]'
                                    }`}
                                title={isListening ? 'Stop listening' : 'Speak your query'}
                            >
                                {isListening ? (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <rect x="6" y="6" width="12" height="12" rx="2" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                )}
                            </button>

                            {/* Text Input */}
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !loading && handleSend(input)}
                                placeholder="Kuch bhi pucho..."
                                className="flex-1 text-[12px] bg-gray-50 rounded-full px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-[var(--athenic-gold)]/20 outline-none transition-all placeholder:text-gray-300"
                                disabled={loading}
                            />

                            {/* Send button */}
                            <button
                                onClick={() => !loading && handleSend(input)}
                                disabled={loading || !input.trim()}
                                className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-[var(--athenic-blue)] text-white disabled:opacity-30 hover:bg-opacity-90 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        </div>

                        {/* Listening indicator */}
                        {isListening && (
                            <p className="text-[10px] text-red-500 mt-2 text-center animate-pulse">
                                🎙️ Sun raha hoon... Bolo!
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default CustomerAIAssistant;
