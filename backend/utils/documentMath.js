const toMoney = (value) => {
  const parsed = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : 0;
};

const toQuantity = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Number(parsed.toFixed(2)) : 1;
};

const normalizeItems = (items = []) => {
  const sourceItems = Array.isArray(items) && items.length
    ? items
    : [{ description: 'Travel service', quantity: 1, unit_price: 0, tax_rate: 0 }];

  return sourceItems.map((item, index) => {
    const quantity = toQuantity(item.quantity);
    const unitPrice = toMoney(item.unit_price ?? item.rate);
    const baseAmount = toMoney(item.amount || quantity * unitPrice);
    const taxRate = toMoney(item.tax_rate);
    const taxAmount = toMoney(item.tax_amount || (baseAmount * taxRate) / 100);

    return {
      description: String(item.description || item.item || 'Travel service').trim(),
      quantity,
      unit_price: unitPrice,
      rate: unitPrice,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      amount: baseAmount,
      sort_order: Number(item.sort_order ?? index),
    };
  });
};

const normalizeAdjustmentRows = (rows = []) => {
  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => ({
      label: String(row.label || row.name || '').trim(),
      amount: toMoney(row.amount),
      rate: row.rate === undefined ? null : toMoney(row.rate),
    }))
    .filter((row) => row.label || row.amount);
};

const calculateDocumentTotals = ({
  items = [],
  taxRows = [],
  discountAmount = 0,
  additionalCharges = [],
} = {}) => {
  const normalizedItems = normalizeItems(items);
  const normalizedTaxRows = normalizeAdjustmentRows(taxRows);
  const normalizedAdditionalCharges = normalizeAdjustmentRows(additionalCharges);
  const subtotal = normalizedItems.reduce((total, item) => total + item.amount, 0);
  const itemTax = normalizedItems.reduce((total, item) => total + item.tax_amount, 0);
  const explicitTax = normalizedTaxRows.reduce((total, row) => total + row.amount, 0);
  const additionalTotal = normalizedAdditionalCharges.reduce((total, row) => total + row.amount, 0);
  const discount = toMoney(discountAmount);
  const taxAmount = toMoney(itemTax + explicitTax);
  const totalAmount = toMoney(subtotal + taxAmount + additionalTotal - discount);

  return {
    items: normalizedItems,
    tax_rows: normalizedTaxRows,
    additional_charges: normalizedAdditionalCharges,
    subtotal_amount: toMoney(subtotal),
    tax_amount: taxAmount,
    discount_amount: discount,
    total_amount: totalAmount,
  };
};

const SMALL_NUMBERS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];

const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

const wordsBelowThousand = (number) => {
  if (number < 20) return SMALL_NUMBERS[number];
  if (number < 100) {
    const ten = Math.floor(number / 10);
    const remainder = number % 10;
    return remainder ? `${TENS[ten]} ${SMALL_NUMBERS[remainder]}` : TENS[ten];
  }

  const hundred = Math.floor(number / 100);
  const remainder = number % 100;
  return remainder ? `${SMALL_NUMBERS[hundred]} hundred ${wordsBelowThousand(remainder)}` : `${SMALL_NUMBERS[hundred]} hundred`;
};

const numberToIndianWords = (value) => {
  let number = Math.floor(toMoney(value));
  if (number === 0) return 'Indian Rupee Zero Only';

  const parts = [];
  const crore = Math.floor(number / 10000000);
  number %= 10000000;
  const lakh = Math.floor(number / 100000);
  number %= 100000;
  const thousand = Math.floor(number / 1000);
  number %= 1000;

  if (crore) parts.push(`${wordsBelowThousand(crore)} crore`);
  if (lakh) parts.push(`${wordsBelowThousand(lakh)} lakh`);
  if (thousand) parts.push(`${wordsBelowThousand(thousand)} thousand`);
  if (number) parts.push(wordsBelowThousand(number));

  return `Indian Rupee ${parts.join(' ')} Only`
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

module.exports = {
  calculateDocumentTotals,
  normalizeItems,
  numberToIndianWords,
  toMoney,
};
