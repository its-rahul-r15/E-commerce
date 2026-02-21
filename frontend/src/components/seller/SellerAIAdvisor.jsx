import { useState, useEffect, useRef } from 'react';
import { generateSellerInsights, answerSellerQuestion, generateTrendInsights } from '../../services/aiService';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const SellerAIAdvisor = ({ sellerData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('insights'); // 'insights' | 'trends' | 'ask'
    const [insights, setInsights] = useState([]);
    const [trends, setTrends] = useState([]);
    const [loadingInsights, setLoadingInsights] = useState(false);
    const [loadingTrends, setLoadingTrends] = useState(false);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loadingAnswer, setLoadingAnswer] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceError, setVoiceError] = useState('');
    const recognitionRef = useRef(null);

    // Suggested quick questions
    const quickQuestions = [
        'What is my total revenue this month?',
        'Which product is my best seller?',
        'How many orders are pending?',
        'What should I restock?',
    ];

    useEffect(() => {
        if (sellerData && isOpen) {
            loadInsights();
        }
    }, [sellerData, isOpen]);

    const loadInsights = async () => {
        if (insights.length > 0) return;
        setLoadingInsights(true);
        try {
            const result = await generateSellerInsights(sellerData);
            setInsights(result);
        } catch (err) {
            console.error('Failed to load insights:', err);
        } finally {
            setLoadingInsights(false);
        }
    };

    const loadTrends = async () => {
        if (trends.length > 0) return; // already loaded
        setLoadingTrends(true);
        try {
            // Extract seller's existing product categories
            const sellerCategories = sellerData?.topProducts?.map(p => p.category).filter(Boolean) || [];
            const platformTrending = ['Kurtas', 'Silk Sarees', 'Indo-Western', 'Ethnic Jewelry', 'Lehengas'];
            const result = await generateTrendInsights(platformTrending, sellerCategories);
            setTrends(result);
        } catch (err) {
            console.error('Failed to load trends:', err);
        } finally {
            setLoadingTrends(false);
        }
    };

    const handleAsk = async (q) => {
        const query = q || question;
        if (!query.trim() || loadingAnswer) return;
        setQuestion('');
        setAnswer('');
        setLoadingAnswer(true);
        try {
            const response = await answerSellerQuestion(query, sellerData);
            setAnswer(response);
        } catch (err) {
            setAnswer('Unable to answer right now. Please check your API key configuration.');
        } finally {
            setLoadingAnswer(false);
        }
    };

    const startVoice = () => {
        if (!SpeechRecognition) {
            setVoiceError('Voice not supported. Use Chrome or Edge.');
            return;
        }
        setVoiceError('');
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.continuous = false;
        recognitionRef.current = recognition;
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => { setIsListening(false); setVoiceError('Voice input failed.'); };
        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setQuestion(transcript);
            handleAsk(transcript);
        };
        recognition.start();
    };

    const tabClass = (tab) =>
        `text-[9px] font-serif uppercase tracking-[0.2em] py-3 px-4 transition-all border-b-2 ${activeTab === tab
            ? 'text-[var(--athenic-blue)] border-[var(--athenic-gold)]'
            : 'text-gray-400 border-transparent hover:text-gray-600'
        }`;

    const insightColors = {
        success: 'border-l-emerald-400 bg-emerald-50',
        warning: 'border-l-amber-400 bg-amber-50',
        info: 'border-l-blue-400 bg-blue-50',
        tip: 'border-l-[var(--athenic-gold)] bg-[#fffbf0]',
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Assistant Panel */}
            {isOpen && (
                <div className="mb-4 w-80 md:w-96 bg-white border border-[var(--athenic-gold)] border-opacity-20 shadow-2xl overflow-hidden rounded-2xl flex flex-col max-h-[600px]">
                    {/* Header */}
                    <div className="bg-[var(--athenic-blue)] px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <span className="text-xl">🤖</span>
                            <div>
                                <h3 className="text-xs font-serif uppercase tracking-[0.2em] text-white">Naitri Ai</h3>
                                <p className="text-[9px] font-serif text-white opacity-50 tracking-widest">Your Private Business Strategist</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => {
                                    setInsights([]);
                                    loadInsights();
                                }}
                                className="text-[9px] font-serif uppercase tracking-widest text-[var(--athenic-gold)] hover:opacity-70 transition-opacity"
                                title="Refresh insights"
                            >
                                ↻
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:text-[var(--athenic-gold)] transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 flex-shrink-0">
                        <button className={tabClass('insights')} onClick={() => setActiveTab('insights')}>
                            📊 Insights
                        </button>
                        <button className={tabClass('trends')} onClick={() => { setActiveTab('trends'); loadTrends(); }}>
                            🔥 Trends
                        </button>
                        <button className={tabClass('ask')} onClick={() => setActiveTab('ask')}>
                            🎙️ Ask AI
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 overflow-y-auto custom-scrollbar">
                        {/* INSIGHTS TAB */}
                        {activeTab === 'insights' && (
                            <div className="space-y-4">
                                {loadingInsights ? (
                                    <div className="flex items-center justify-center py-8 space-x-3">
                                        <div className="animate-spin w-6 h-6 border-2 border-[var(--athenic-gold)] border-t-transparent rounded-full"></div>
                                        <p className="text-[10px] font-serif text-gray-400 uppercase tracking-widest">Analysing your store...</p>
                                    </div>
                                ) : insights.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-[10px] font-serif text-gray-400 uppercase tracking-widest">No insights yet. Trinetri Ai is analysing your store data.</p>
                                        <button onClick={loadInsights} className="mt-4 text-[9px] font-serif uppercase tracking-widest text-[var(--athenic-gold)] underline">
                                            Try again
                                        </button>
                                    </div>
                                ) : (
                                    insights.map((insight, i) => (
                                        <div key={i} className={`border-l-4 p-4 ${insightColors[insight.type] || insightColors.info}`}>
                                            <div className="flex items-start space-x-3">
                                                <span className="text-lg flex-shrink-0">{insight.icon}</span>
                                                <div>
                                                    <h4 className="text-[10px] font-serif uppercase tracking-widest text-[var(--athenic-blue)] mb-1">{insight.title}</h4>
                                                    <p className="text-[11px] font-serif text-gray-600 leading-relaxed">{insight.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* TRENDS TAB */}
                        {activeTab === 'trends' && (
                            <div className="space-y-4">
                                {loadingTrends ? (
                                    <div className="flex items-center justify-center py-8 space-x-3">
                                        <div className="animate-spin w-6 h-6 border-2 border-[var(--athenic-gold)] border-t-transparent rounded-full"></div>
                                        <p className="text-[10px] font-serif text-gray-400 uppercase tracking-widest">Scanning market trends...</p>
                                    </div>
                                ) : trends.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-[10px] font-serif text-gray-400 uppercase tracking-widest">Click the Trends tab to load market analysis.</p>
                                    </div>
                                ) : (
                                    trends.map((trend, i) => (
                                        <div key={i} className="border border-gray-100 p-4 hover:border-[var(--athenic-gold)] transition-all">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-[10px] font-serif uppercase tracking-widest text-[var(--athenic-blue)]">{trend.category}</h4>
                                                <div className="flex items-center space-x-1">
                                                    {[...Array(10)].map((_, j) => (
                                                        <div key={j} className={`w-1.5 h-1.5 rounded-full ${j < trend.trendScore ? 'bg-[var(--athenic-gold)]' : 'bg-gray-100'}`}></div>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-[11px] font-serif text-gray-600 leading-relaxed mb-2">{trend.message}</p>
                                            <p className="text-[9px] font-serif uppercase tracking-widest text-emerald-600 border-l-2 border-emerald-400 pl-2">
                                                → {trend.action}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* ASK AI TAB */}
                        {activeTab === 'ask' && (
                            <div className="space-y-6">
                                {/* Quick Questions */}
                                <div>
                                    <p className="text-[9px] font-serif uppercase tracking-widest text-gray-400 mb-3">Quick Questions</p>
                                    <div className="flex flex-wrap gap-2">
                                        {quickQuestions.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleAsk(q)}
                                                disabled={loadingAnswer}
                                                className="text-[9px] font-serif uppercase tracking-wide border border-gray-100 px-3 py-2 hover:border-[var(--athenic-gold)] hover:text-[var(--athenic-blue)] transition-all disabled:opacity-40"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Input */}
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={startVoice}
                                        disabled={isListening}
                                        className={`w-10 h-10 flex-shrink-0 flex items-center justify-center border transition-all ${isListening
                                            ? 'border-red-400 bg-red-50 animate-pulse'
                                            : 'border-gray-100 hover:border-[var(--athenic-gold)]'
                                            }`}
                                    >
                                        <svg className={`w-4 h-4 ${isListening ? 'text-red-500' : 'text-[var(--athenic-blue)]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                    </button>
                                    <input
                                        type="text"
                                        value={question}
                                        onChange={e => setQuestion(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAsk()}
                                        placeholder="Ask anything about your store..."
                                        className="flex-1 text-[11px] font-serif border-b border-gray-200 py-2 outline-none focus:border-[var(--athenic-gold)] placeholder:text-gray-300 bg-transparent"
                                        disabled={loadingAnswer}
                                    />
                                    <button
                                        onClick={() => handleAsk()}
                                        disabled={loadingAnswer || !question.trim()}
                                        className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[var(--athenic-blue)] text-white disabled:opacity-30 hover:bg-opacity-90 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </button>
                                </div>

                                {voiceError && <p className="text-[9px] font-serif text-red-500 uppercase tracking-widest">{voiceError}</p>}
                                {isListening && <p className="text-[9px] font-serif text-red-500 uppercase tracking-widest animate-pulse">🎙️ Listening...</p>}

                                {/* AI Answer */}
                                {loadingAnswer && (
                                    <div className="flex items-center space-x-3 py-4">
                                        <div className="flex space-x-1">
                                            {[0, 150, 300].map(d => (
                                                <div key={d} className="w-2 h-2 bg-[var(--athenic-gold)] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }}></div>
                                            ))}
                                        </div>
                                        <span className="text-[9px] font-serif text-gray-400 uppercase tracking-widest">Analysing your data...</span>
                                    </div>
                                )}
                                {answer && !loadingAnswer && (
                                    <div className="p-4 bg-[var(--athenic-bg)] border border-[var(--athenic-gold)] border-opacity-20">
                                        <p className="text-[9px] font-serif uppercase tracking-widest text-[var(--athenic-gold)] mb-2">AI Response</p>
                                        <p className="text-[12px] font-serif text-[var(--athenic-blue)] leading-relaxed">{answer}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Toggle Bubble */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isOpen ? 'bg-red-500 rotate-90' : 'bg-[var(--athenic-blue)] hover:scale-110'
                    } group relative`}
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <>
                        <span className="text-2xl group-hover:animate-bounce">🤖</span>
                        <div className="absolute -top-12 right-0 bg-white px-3 py-1.5 rounded-lg shadow-lg border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            <p className="text-[10px] font-serif uppercase tracking-widest text-[var(--athenic-blue)]">
                                Need help? <span className="text-[var(--athenic-gold)] font-bold">Naitri Ai</span>
                            </p>
                            <div className="absolute -bottom-1 right-5 w-2 h-2 bg-white border-r border-b border-gray-100 rotate-45"></div>
                        </div>
                    </>
                )}
            </button>
        </div>
    );
};

export default SellerAIAdvisor;
