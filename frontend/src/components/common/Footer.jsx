import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-[var(--athenic-blue)] text-white pt-24 pb-12 overflow-hidden relative mt-20">
            {/* Decorative Meander Pattern Background */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--athenic-gold)] opacity-30"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">

                    {/* Brand Info */}
                    <div className="md:col-span-1">
                        <Link to="/" className="inline-block mb-8">
                            <h2 className="text-3xl font-serif-decorative tracking-[0.3em] text-[var(--gold)]">
                                KLYRA
                            </h2>
                        </Link>
                        <p className="text-[10px] font-serif tracking-widest text-gray-400 uppercase leading-relaxed">
                            Quality Clothing <br />
                            Modern Comfort <br />
                            Made with Care
                        </p>
                    </div>

                    {/* Explore */}
                    <div>
                        <h3 className="text-[11px] font-serif tracking-[0.2em] text-[var(--athenic-gold)] uppercase mb-8">
                            Explore
                        </h3>
                        <ul className="space-y-4">
                            {['Products', 'New Arrivals', 'Our Story', 'Shops', 'Contact Us'].map((item) => (
                                <li key={item}>
                                    <Link to="#" className="text-[10px] font-serif uppercase tracking-[0.1em] text-gray-400 hover:text-[var(--athenic-gold)] transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Assistance */}
                    <div>
                        <h3 className="text-[11px] font-serif tracking-[0.2em] text-[var(--athenic-gold)] uppercase mb-8">
                            Assistance
                        </h3>
                        <ul className="space-y-4">
                            {['Shipping & Returns', 'Size Guide', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((item) => (
                                <li key={item}>
                                    <Link to="#" className="text-[10px] font-serif uppercase tracking-[0.1em] text-gray-400 hover:text-[var(--athenic-gold)] transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-[11px] font-serif tracking-[0.2em] text-[var(--athenic-gold)] uppercase mb-8">
                            Join Our Newsletter
                        </h3>
                        <p className="text-[10px] font-serif text-gray-400 uppercase tracking-widest mb-6 leading-relaxed">
                            Subscribe to get updates on new products and special offers from local shops.
                        </p>
                        <form className="relative">
                            <input
                                type="email"
                                placeholder="YOUR EMAIL ADDRESS"
                                className="w-full bg-transparent border-b border-gray-700 py-3 text-[10px] font-serif tracking-widest text-white placeholder:text-gray-600 focus:outline-none focus:border-[var(--athenic-gold)] transition-colors uppercase"
                            />
                            <button className="absolute right-0 bottom-3 text-[var(--athenic-gold)] hover:translate-x-1 transition-transform">
                                →
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                    <p className="text-[9px] font-serif uppercase tracking-[0.2em] text-gray-500">
                        © 2024 KLYRA MARKETPLACE. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex space-x-8">
                        {['Instagram', 'Pinterest', 'LinkedIn'].map((social) => (
                            <Link key={social} to="#" className="text-[9px] font-serif uppercase tracking-[0.2em] text-gray-500 hover:text-[var(--athenic-gold)] transition-colors">
                                {social}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute -bottom-20 -right-20 opacity-5 pointer-events-none">
                <span className="text-[300px] font-serif text-[var(--athenic-gold)] overflow-hidden">⚜️</span>
            </div>
        </footer>
    );
};

export default Footer;
