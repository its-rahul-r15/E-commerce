import SellerLayout from '../../components/layout/SellerLayout';
import { CubeIcon } from '@heroicons/react/24/outline';

const SellerInventory = () => {
    return (
        <SellerLayout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center font-serif">
                <div className="w-24 h-24 bg-[var(--mehron)] border border-[var(--gold)] rounded-none flex items-center justify-center mb-6 shadow-xl">
                    <CubeIcon className="h-12 w-12 text-[var(--gold)]" />
                </div>
                <h2 className="text-3xl font-bold text-white uppercase tracking-widest mb-4">Orchestrating Essence</h2>
                <p className="text-gray-400 max-w-md mx-auto mb-8 text-[11px] uppercase tracking-[0.2em] font-bold">
                    Advanced inventory orchestrations and stock intelligence are currently being curated.
                    Entrust your stock levels to our refined curation interface in the meantime.
                </p>
                <a
                    href="/seller/products"
                    className="px-8 py-4 bg-[var(--mehron)] text-white font-serif text-[11px] uppercase tracking-[0.2em] rounded-none border border-[var(--gold)] hover:bg-[var(--mehron-deep)] transition-all shadow-lg font-bold"
                >
                    Visit Curation Suit
                </a>
            </div>
        </SellerLayout>
    );
};

export default SellerInventory;
