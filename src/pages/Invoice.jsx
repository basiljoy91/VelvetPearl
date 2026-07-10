import React from 'react';
import InvoicePreview from '../components/admin/InvoicePreview';

export default function Invoice() {
	let invoice = {};
	try {
		invoice = JSON.parse(window.sessionStorage.getItem('invoice') || '{}');
	} catch (e) {
		invoice = {};
	}

	return (
		<div className="min-h-screen bg-white p-6">
			<InvoicePreview invoice={invoice} />
		</div>
	);
}
