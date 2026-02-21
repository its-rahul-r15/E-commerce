import { Link } from 'react-router-dom';

const ShopCard = ({ shop }) => {
    return (
        <Link
            to={`/shop/${shop._id}`}
            className="athenic-boutique-card group block text-center"
        >
            <div className="absolute top-4 right-4 bg-[var(--athenic-blue)] text-white text-[9px] px-3 py-1 font-serif tracking-widest uppercase z-10">
                Active
            </div>

            {/* Rounded Shop Image */}
            <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--athenic-gold)] border-opacity-20 p-1 group-hover:border-opacity-100 transition-all duration-500">
                    <div className="w-full h-full rounded-full overflow-hidden">
                        <img
                            src={shop.images?.[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?fit=crop&w=200&h=200'}
                            alt={shop.shopName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                    </div>
                </div>
            </div>

            <p className="text-[9px] font-serif uppercase tracking-[0.2em] text-[var(--athenic-gold)] mb-3">Athenic boutique</p>

            <h3 className="text-xl font-serif tracking-[0.1em] text-[var(--athenic-blue)] mb-2 group-hover:text-[var(--athenic-gold)] transition-colors uppercase truncate">
                {shop.shopName}
            </h3>

            <p className="text-[10px] font-serif text-gray-500 mb-8 line-clamp-2 uppercase tracking-widest leading-relaxed">
                {typeof shop.address === 'object'
                    ? `${shop.address.street || ''}, ${shop.address.city || ''}, ${shop.address.state || ''} ${shop.address.pincode || ''}`.replace(/^, |, $/, '')
                    : shop.address || 'The Luxury Row, Classical District, Athens'}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--athenic-gold)] border-opacity-20">
                <div className="flex items-center space-x-1">
                    <span className="text-[10px] font-serif text-[var(--athenic-gold)]">★</span>
                    <span className="text-[10px] font-serif font-bold text-[var(--athenic-blue)]">{shop.rating || '4.5'}</span>
                </div>
                <span className="text-[9px] font-serif uppercase tracking-widest text-[var(--athenic-blue)] border-b border-transparent group-hover:border-[var(--athenic-gold)] transition-all">
                    Visit Store
                </span>
            </div>
        </Link>
    );
};

export default ShopCard;
