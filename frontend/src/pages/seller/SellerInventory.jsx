import SellerLayout from '../../components/layout/SellerLayout';
import { CubeIcon } from '@heroicons/react/24/outline';

const SellerInventory = () => {
    return (
        <SellerLayout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <CubeIcon className="h-10 w-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Inventory Management</h2>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                    Advanced inventory tracking and stock management features are coming soon.
                    For now, you can manage stock levels via the Products page.
                </p>
                <a
                    href="/seller/products"
                    className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    Go to Products
                </a>
            </div>
        </SellerLayout>
    );
};

export default SellerInventory;
