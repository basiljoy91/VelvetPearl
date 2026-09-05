const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateDocumentTotals, numberToIndianWords } = require('../utils/documentMath');

test('calculates item tax, explicit tax rows, charges, discount, and total', () => {
  const totals = calculateDocumentTotals({
    items: [
      { description: 'Airport transfer', quantity: 2, unit_price: 500, tax_rate: 5 },
      { description: 'Waiting time', quantity: 1, unit_price: 100, tax_rate: 0 },
    ],
    taxRows: [{ label: 'Service tax adjustment', amount: 10 }],
    additionalCharges: [{ label: 'Parking', amount: 40 }],
    discountAmount: 25,
  });

  assert.equal(totals.subtotal_amount, 1100);
  assert.equal(totals.tax_amount, 60);
  assert.equal(totals.discount_amount, 25);
  assert.equal(totals.total_amount, 1175);
});

test('converts rupee totals to Indian numbering words', () => {
  assert.equal(numberToIndianWords(5335), 'Indian Rupee Five Thousand Three Hundred Thirty Five Only');
  assert.equal(numberToIndianWords(0), 'Indian Rupee Zero Only');
});
