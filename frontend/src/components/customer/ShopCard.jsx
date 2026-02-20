import { Link } from 'react-router-dom';

const ShopCard = ({ shop }) => {
    return (
        <Link
            to={`/shop/${shop._id}`}
            className="athenic-boutique-card group block"
        >
            <div className="absolute top-4 right-4 bg-[var(--athenic-blue)] text-white text-[9px] px-3 py-1 font-serif tracking-widest uppercase">
                Active
            </div>

            <p className="text-[9px] font-serif uppercase tracking-[0.2em] text-[var(--athenic-gold)] mb-3 text-left">Athenic boutique</p>

            <h3 className="text-xl font-serif tracking-[0.1em] text-[var(--athenic-blue)] mb-2 group-hover:text-[var(--athenic-gold)] transition-colors uppercase truncate text-left">
                {shop.shopName}
            </h3>

            <p className="text-[10px] font-serif text-gray-500 mb-8 line-clamp-2 uppercase tracking-widest leading-relaxed text-left">
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
