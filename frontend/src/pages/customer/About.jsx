import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <div className="bg-[var(--athenic-bg)] min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000"
                        alt="Klyra Luxury"
                        className="w-full h-full object-cover opacity-60 grayscale-[0.2]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--athenic-bg)]"></div>
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <p className="text-[10px] md:text-xs font-serif tracking-[0.4em] uppercase text-[var(--athenic-gold)] mb-6">
                        Established 2024
                    </p>
                    <h1 className="text-5xl md:text-7xl font-serif tracking-[0.1em] text-[var(--athenic-blue)] mb-6 leading-tight uppercase">
                        OUR STORY,<br />
                        <span className="italic font-playfair lowercase font-normal">Your Style</span>
                    </h1>
                </div>
            </section>

            {/* Narrative Section */}
            <section className="max-w-4xl mx-auto px-6 py-20 text-center">
                <div className="mb-12">
                    <span className="text-3xl text-[var(--athenic-gold)]">⚜️</span>
                </div>
                <h2 className="text-3xl font-serif tracking-widest text-[var(--athenic-blue)] mb-8 uppercase">
                    The Essence of Klyra
                </h2>
                <div className="space-y-6 text-gray-600 font-serif leading-relaxed italic text-sm md:text-base">
                    <p>
                        Klyra was born from a singular vision: to bridge the gap between traditional craftsmanship and modern convenience. We believe that true luxury isn't just about a label, but about the story, the artisan, and the heritage behind every stitch.
                    </p>
                    <p>
                        In a world of fast fashion, Klyra stands as a sanctuary for those who value longevity over trends. We curate the finest products from local boutiques, ensuring that every piece in our collection meets a gold standard of quality.
                    </p>
                </div>
            </section>

            {/* Brand Pillars */}
            <section className="bg-[var(--mehron-soft)] py-20 border-y border-[var(--athenic-gold)] border-opacity-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center group">
                            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-[var(--athenic-gold)] rounded-none group-hover:bg-[var(--athenic-gold)] transition-all">
                                <span className="text-2xl text-[var(--athenic-gold)] group-hover:text-white transition-colors">✨</span>
                            </div>
                            <h3 className="text-sm font-serif font-bold tracking-widest text-[var(--athenic-blue)] uppercase mb-4">Curated Excellence</h3>
                            <p className="text-[11px] font-serif text-gray-500 uppercase tracking-widest leading-relaxed">
                                Every artisan is hand-selected to ensure Klyra remains a beacon of premium craftsmanship.
                            </p>
                        </div>
                        <div className="text-center group">
                            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-[var(--athenic-gold)] rounded-none group-hover:bg-[var(--athenic-gold)] transition-all">
                                <span className="text-2xl text-[var(--athenic-gold)] group-hover:text-white transition-colors">🏛️</span>
                            </div>
                            <h3 className="text-sm font-serif font-bold tracking-widest text-[var(--athenic-blue)] uppercase mb-4">Local Heritage</h3>
                            <p className="text-[11px] font-serif text-gray-500 uppercase tracking-widest leading-relaxed">
                                We support local businesses, bringing the heart of our community's boutiques to your doorstep.
                            </p>
                        </div>
                        <div className="text-center group">
                            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-[var(--athenic-gold)] rounded-none group-hover:bg-[var(--athenic-gold)] transition-all">
                                <span className="text-2xl text-[var(--athenic-gold)] group-hover:text-white transition-colors">🛡️</span>
                            </div>
                            <h3 className="text-sm font-serif font-bold tracking-widest text-[var(--athenic-blue)] uppercase mb-4">Timeless Service</h3>
                            <p className="text-[11px] font-serif text-gray-500 uppercase tracking-widest leading-relaxed">
                                For us, the experience is as important as the product. We provide luxury service at every step.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="athenic-card p-2 border-2 border-[var(--athenic-gold)]">
                    <img
                        src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1000"
                        alt="Craftsmanship"
                        className="w-full h-full object-cover grayscale-[0.3]"
                    />
                </div>
                <div className="space-y-8">
                    <p className="text-[10px] font-serif uppercase tracking-[0.3em] text-[var(--athenic-gold)]">Our Philosophy</p>
                    <h2 className="text-4xl font-serif tracking-widest text-[var(--athenic-blue)] leading-tight uppercase">
                        A Commitment to the <br />
                        Art of the Boutique
                    </h2>
                    <p className="text-sm font-serif italic text-gray-600 leading-relaxed">
                        "At Klyra, we don't just sell clothes; we provide a canvas for self-expression. Our philosophy is rooted in the belief that the things we wear should reflect the depth of our identity and the excellence of our local communities."
                    </p>
                    <div className="pt-4">
                        <Link to="/products" className="btn-athenic-primary uppercase px-10">
                            Explore Collection
                        </Link>
                    </div>
                </div>
            </section>

            {/* Meander Divider */}
            <div className="meander-border opacity-20 mb-20"></div>

            {/* Founder Quote (Optional) */}
            <section className="bg-[var(--athenic-blue)] py-24 text-center text-white">
                <div className="max-w-3xl mx-auto px-6">
                    <span className="text-5xl font-serif italic opacity-30 block mb-6">"</span>
                    <p className="text-xl md:text-2xl font-serif italic tracking-wide mb-8">
                        Klyra is more than a marketplace; it is a celebration of the extraordinary found in our local streets.
                    </p>
                    <div className="h-px w-20 bg-[var(--athenic-gold)] mx-auto mb-4"></div>
                    <p className="text-[10px] font-serif uppercase tracking-[0.4em] text-[var(--athenic-gold)]">Klyra Team</p>
                </div>
            </section>
        </div>
    );
};

export default About;
