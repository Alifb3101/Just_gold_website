import React from 'react';
import { ProductPage } from '@/app/pages/ProductPage';

// Keep a dedicated ShopPage export so existing routes/imports remain stable.
export function ShopPage() {
	return <ProductPage />;
}

export default ShopPage;
