#!/usr/bin/env node
import 'dotenv/config';
import process from 'node:process';
import pg from 'pg';

const { Pool } = pg;
const endpoint = process.env.GOOGLE_SHEETS_WEB_APP_URL;
const databaseUrl = process.env.DATABASE_URL;
const dryRun = !process.argv.includes('--apply');
const pageSize = Number(process.env.SHEETS_PAGE_SIZE || 500);

if (!endpoint) throw new Error('GOOGLE_SHEETS_WEB_APP_URL is required');
if (!databaseUrl && !dryRun) throw new Error('DATABASE_URL is required for --apply');

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    })
  : null;
const clean = (value) => String(value ?? '').trim();
const number = (value) => {
  const parsed = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};
const integer = (value) => Math.max(0, Math.trunc(number(value)));
const date = (value) => {
  const raw = clean(value);
  if (!raw) return null;
  const iso = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (iso) return `${iso[1]}-${String(iso[2]).padStart(2, '0')}-${String(iso[3]).padStart(2, '0')}`;
  const dmy = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmy) return `${dmy[3]}-${String(dmy[2]).padStart(2, '0')}-${String(dmy[1]).padStart(2, '0')}`;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
};
const headerMap = (headers) =>
  Object.fromEntries(headers.map((header, index) => [clean(header).toLowerCase(), index]));
const cell = (row, headers, ...names) => {
  const map = headerMap(headers);
  for (const name of names) {
    const index = map[clean(name).toLowerCase()];
    if (index !== undefined) return clean(row[index]);
  }
  return '';
};

async function fetchSheetPage(sheet, offset) {
  const url = new URL(endpoint);
  url.searchParams.set('action', 'list');
  url.searchParams.set('sheet', sheet);
  url.searchParams.set('mode', 'page');
  url.searchParams.set('offset', String(offset));
  url.searchParams.set('limit', String(pageSize));
  url.searchParams.set('_', String(Date.now()));
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000), cache: 'no-store' });
  if (!response.ok) throw new Error(`${sheet}: HTTP ${response.status}`);
  const data = await response.json();
  if (!data.ok) throw new Error(`${sheet}: ${data.error || 'source read failed'}`);
  return data;
}

async function fetchSheet(sheet) {
  const first = await fetchSheetPage(sheet, 0);
  const rows = [...(first.rows || [])];
  for (
    let offset = rows.length;
    offset < Number(first.totalRows || rows.length);
    offset += pageSize
  ) {
    const page = await fetchSheetPage(sheet, offset);
    rows.push(...(page.rows || []));
    if (!page.rows?.length) break;
  }
  return { headers: first.headers || [], rows };
}

function validateUniqueRows(sheet, data, keyNames) {
  const seen = new Map();
  const errors = [];
  data.rows.forEach((row, index) => {
    const key = cell(row, data.headers, ...keyNames) || `row-${index + 2}`;
    if (seen.has(key))
      errors.push(`${sheet} duplicate key "${key}" at rows ${seen.get(key)} and ${index + 2}`);
    else seen.set(key, index + 2);
  });
  return errors;
}

function buildRecords(sheets) {
  const errors = [
    ...validateUniqueRows('Inventory', sheets.Inventory, ['SKU Code', 'Item Name']),
    ...validateUniqueRows('Purchase Order', sheets['Purchase Order'], [
      'Unique No',
      'Invoice / PO Reference',
    ]),
    ...validateUniqueRows('Farm Expenses & Maintenance', sheets['Farm Expenses & Maintenance'], [
      'Expense No',
    ]),
    ...validateUniqueRows('Harvesting', sheets.Harvesting, ['Sale No']),
  ];
  const inventory = sheets.Inventory.rows.map((row, index) => ({
    sourceRow: index + 2,
    sku: cell(row, sheets.Inventory.headers, 'SKU Code') || `SHEET-INV-${index + 1}`,
    name: cell(row, sheets.Inventory.headers, 'Item Name'),
    category: cell(row, sheets.Inventory.headers, 'Category') || 'Uncategorized',
    unit: cell(row, sheets.Inventory.headers, 'Unit') || 'kg',
    currentStock: number(cell(row, sheets.Inventory.headers, 'Current Stock', 'Initial Quantity')),
    purchaseQuantity: number(
      cell(row, sheets.Inventory.headers, 'Purchase Quantity', 'Initial Quantity'),
    ),
    minThreshold: number(cell(row, sheets.Inventory.headers, 'Min Threshold')),
    costPerUnit: number(
      cell(row, sheets.Inventory.headers, 'Cost per Unit ($)', 'Cost per Unit (₹)'),
    ),
    supplierName: cell(row, sheets.Inventory.headers, 'Primary Supplier'),
    supplierMobile: cell(row, sheets.Inventory.headers, 'Mobile'),
    expiryDate: date(cell(row, sheets.Inventory.headers, 'Expiry Date')),
  }));
  inventory.forEach((item) => {
    if (!item.name) errors.push(`Inventory row ${item.sourceRow}: Item Name is required`);
  });

  const cycles = sheets['Fish Lifecycle'].rows.map((row, index) => ({
    sourceRow: index + 2,
    cycleNo: cell(row, sheets['Fish Lifecycle'].headers, 'Cycle') || `SHEET-CYCLE-${index + 1}`,
    fishName: cell(row, sheets['Fish Lifecycle'].headers, 'Fish Name'),
    nurseryWeightKg: number(cell(row, sheets['Fish Lifecycle'].headers, 'Weight')),
    nurseryFishCount: integer(cell(row, sheets['Fish Lifecycle'].headers, 'Qty Of Fish')),
    nurseryDate: date(cell(row, sheets['Fish Lifecycle'].headers, 'Date')),
    stage: cell(row, sheets['Fish Lifecycle'].headers, 'Stage') || 'Fry (Nursery)',
    pondAWeightKg: number(
      cell(row, sheets['Fish Lifecycle'].headers, 'Pond A Weight', 'Weight Pond A'),
    ),
    pondAFishCount: integer(
      cell(row, sheets['Fish Lifecycle'].headers, 'Pond A Qty', 'Pond A Qty Of Fish'),
    ),
    pondADate: date(cell(row, sheets['Fish Lifecycle'].headers, 'Pond A Date')),
    pondBWeightKg: number(
      cell(row, sheets['Fish Lifecycle'].headers, 'Pond B Weight', 'Weight Pond B'),
    ),
    pondBFishCount: integer(
      cell(row, sheets['Fish Lifecycle'].headers, 'Pond B Qty', 'Pond B Qty Of Fish'),
    ),
    pondBDate: date(cell(row, sheets['Fish Lifecycle'].headers, 'Pond B Date')),
  }));
  cycles.forEach((item) => {
    if (!item.fishName) errors.push(`Fish Lifecycle row ${item.sourceRow}: Fish Name is required`);
  });

  const purchases = sheets['Purchase Order'].rows.map((row, index) => ({
    sourceRow: index + 2,
    purchaseNo:
      cell(row, sheets['Purchase Order'].headers, 'Unique No') || `SHEET-PUR-${index + 1}`,
    purchaseType: cell(row, sheets['Purchase Order'].headers, 'Purchase Type') || 'Supply',
    vendorName:
      cell(row, sheets['Purchase Order'].headers, 'Vendor / Supplier') || 'Unknown vendor',
    vendorMobile: cell(
      row,
      sheets['Purchase Order'].headers,
      'Vendor Mobile',
      'Supplier Mobile',
      'Mobile',
    ),
    invoiceReference: cell(row, sheets['Purchase Order'].headers, 'Invoice / PO Reference'),
    deliveryStatus: cell(row, sheets['Purchase Order'].headers, 'Delivery Status') || 'Received',
    taxRate: number(cell(row, sheets['Purchase Order'].headers, 'Tax Rate (%)')),
    freightAmount: number(cell(row, sheets['Purchase Order'].headers, 'Freight Amount')),
    totalAmount: number(cell(row, sheets['Purchase Order'].headers, 'Total Purchase Amount')),
    attachmentUrl: cell(row, sheets['Purchase Order'].headers, 'Attachment', 'Attachament'),
    notes: cell(row, sheets['Purchase Order'].headers, 'Receipt / Quality Inspection Notes'),
    orderedAt: date(cell(row, sheets['Purchase Order'].headers, 'Date', 'Timestamps')),
    itemName: cell(
      row,
      sheets['Purchase Order'].headers,
      'Item / Supply Name',
      'Fish Name / Species',
      'Select Inventory Item',
    ),
    quantity: number(cell(row, sheets['Purchase Order'].headers, 'Quantity', 'Quantity (kg)')),
    unit: cell(row, sheets['Purchase Order'].headers, 'Unit') || 'kg',
    unitPrice: number(
      cell(row, sheets['Purchase Order'].headers, 'Unit Price', 'Unit Price (₹ / kg)'),
    ),
    fishName: cell(row, sheets['Purchase Order'].headers, 'Fish Name / Species'),
    fishWeight: number(cell(row, sheets['Purchase Order'].headers, 'Initial Total Weight (kg)')),
    fishCount: integer(cell(row, sheets['Purchase Order'].headers, 'Fish Count')),
  }));

  const expenses = sheets['Farm Expenses & Maintenance'].rows.map((row, index) => ({
    sourceRow: index + 2,
    expenseNo:
      cell(row, sheets['Farm Expenses & Maintenance'].headers, 'Expense No') ||
      `SHEET-EXP-${index + 1}`,
    expenseType:
      cell(row, sheets['Farm Expenses & Maintenance'].headers, 'Expense type') || 'Other',
    pondArea: cell(row, sheets['Farm Expenses & Maintenance'].headers, 'Pond / Area') || 'All Farm',
    amount: number(
      cell(row, sheets['Farm Expenses & Maintenance'].headers, 'Amount (₹)', 'Amount'),
    ),
    expenseDate: date(
      cell(row, sheets['Farm Expenses & Maintenance'].headers, 'Date', 'Timestamps'),
    ),
    notes: cell(row, sheets['Farm Expenses & Maintenance'].headers, 'Notes'),
  }));
  expenses.forEach((item) => {
    if (!item.expenseDate) errors.push(`Expense row ${item.sourceRow}: Date is required`);
  });

  const feedLogs = (sheets['Feed Cycle']?.rows || []).map((row, index) => ({
    sourceRow: index + 2,
    pondName: cell(row, sheets['Feed Cycle'].headers, 'Pond', 'Pond / Area'),
    fedAt: date(cell(row, sheets['Feed Cycle'].headers, 'Date', 'Feeding Date', 'Timestamps')),
    quantityKg: number(
      cell(row, sheets['Feed Cycle'].headers, 'Quantity (kg)', 'Feed Quantity (kg)', 'Quantity'),
    ),
    technician: cell(row, sheets['Feed Cycle'].headers, 'Technician', 'Added By'),
    response: cell(row, sheets['Feed Cycle'].headers, 'Response'),
    notes: cell(row, sheets['Feed Cycle'].headers, 'Notes', 'Feed Note'),
  }));
  feedLogs.forEach((item) => {
    if (!item.fedAt) errors.push(`Feed Cycle row ${item.sourceRow}: Date is required`);
    if (item.quantityKg <= 0)
      errors.push(`Feed Cycle row ${item.sourceRow}: Quantity must be greater than zero`);
  });

  const sales = sheets.Harvesting.rows.map((row, index) => ({
    sourceRow: index + 2,
    saleNo: cell(row, sheets.Harvesting.headers, 'Sale No') || `SHEET-SALE-${index + 1}`,
    cycleNo: cell(row, sheets.Harvesting.headers, 'Cycle'),
    fishName: cell(row, sheets.Harvesting.headers, 'Fish Name / Species') || 'Unknown species',
    harvestWeightKg: number(cell(row, sheets.Harvesting.headers, 'Harvest Weight (kg)')),
    fishCount: integer(cell(row, sheets.Harvesting.headers, 'Estimated Fish Count')),
    sellingPricePerKg: number(cell(row, sheets.Harvesting.headers, 'Selling Price (₹ / kg)')),
    buyerName: cell(row, sheets.Harvesting.headers, 'Buyer / Distributor') || 'Unknown buyer',
    buyerMobile: cell(row, sheets.Harvesting.headers, 'Buyer Mobile'),
    harvestNettingCost: number(cell(row, sheets.Harvesting.headers, 'Harvest & Netting Cost (₹)')),
    soldAt: date(cell(row, sheets.Harvesting.headers, 'Date', 'Timestamps')),
  }));
  sales.forEach((item) => {
    if (!item.soldAt) errors.push(`Harvesting row ${item.sourceRow}: Timestamps/Date is required`);
  });
  return { errors, inventory, cycles, purchases, expenses, feedLogs, sales };
}

async function applyRecords(client, records) {
  await client.query('BEGIN');
  try {
    const cycleIds = new Map();
    for (const item of records.cycles) {
      const result = await client.query(
        `INSERT INTO fish_cycles (cycle_no, fish_name, nursery_weight_kg, nursery_fish_count, nursery_date, stage, source_sheet, source_row_number) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (source_sheet, source_row_number) DO UPDATE SET fish_name=EXCLUDED.fish_name, nursery_weight_kg=EXCLUDED.nursery_weight_kg, nursery_fish_count=EXCLUDED.nursery_fish_count, updated_at=now(), version=fish_cycles.version+1 RETURNING id, cycle_no`,
        [
          item.cycleNo,
          item.fishName,
          item.nurseryWeightKg,
          item.nurseryFishCount,
          item.nurseryDate,
          item.stage,
          'Fish Lifecycle',
          item.sourceRow,
        ],
      );
      cycleIds.set(result.rows[0].cycle_no, result.rows[0].id);
    }
    const inventoryIds = new Map();
    for (const item of records.inventory) {
      const result = await client.query(
        `INSERT INTO inventory_items (sku, name, category, unit, current_stock, purchase_quantity, min_threshold, cost_per_unit, supplier_name, supplier_mobile, expiry_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (sku) DO UPDATE SET name=EXCLUDED.name, current_stock=EXCLUDED.current_stock, purchase_quantity=EXCLUDED.purchase_quantity, updated_at=now(), version=inventory_items.version+1 RETURNING id, sku`,
        [
          item.sku,
          item.name,
          item.category,
          item.unit,
          item.currentStock,
          item.purchaseQuantity,
          item.minThreshold,
          item.costPerUnit,
          item.supplierName,
          item.supplierMobile,
          item.expiryDate,
        ],
      );
      inventoryIds.set(result.rows[0].sku, result.rows[0].id);
    }
    for (const item of records.purchases) {
      const order = await client.query(
        `INSERT INTO purchase_orders (purchase_no, purchase_type, vendor_name, vendor_mobile, invoice_reference, delivery_status, tax_rate, freight_amount, total_amount, attachment_url, notes, ordered_at, source_sheet, source_row_number) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT (source_sheet, source_row_number) DO UPDATE SET total_amount=EXCLUDED.total_amount, delivery_status=EXCLUDED.delivery_status, updated_at=now(), version=purchase_orders.version+1 RETURNING id`,
        [
          item.purchaseNo,
          item.purchaseType,
          item.vendorName,
          item.vendorMobile,
          item.invoiceReference,
          item.deliveryStatus,
          item.taxRate,
          item.freightAmount,
          item.totalAmount,
          item.attachmentUrl,
          item.notes,
          item.orderedAt,
          'Purchase Order',
          item.sourceRow,
        ],
      );
      await client.query('DELETE FROM purchase_order_lines WHERE purchase_order_id = $1', [
        order.rows[0].id,
      ]);
      await client.query(
        `INSERT INTO purchase_order_lines (purchase_order_id, inventory_item_id, fish_name, quantity, unit, unit_price, initial_weight_kg, fish_count, line_total) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          order.rows[0].id,
          inventoryIds.get(
            records.inventory.find((inventory) => inventory.name === item.itemName)?.sku,
          ) || null,
          item.fishName || item.itemName,
          item.quantity,
          item.unit,
          item.unitPrice,
          item.fishWeight || null,
          item.fishCount || null,
          item.totalAmount,
        ],
      );
    }
    const pondIds = new Map();
    for (const pond of [
      { code: 'POND-A', name: 'Pond A' },
      { code: 'POND-B', name: 'Pond B' },
    ]) {
      const result = await client.query(
        `INSERT INTO ponds (code, name) VALUES ($1, $2)
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, updated_at = now()
         RETURNING id, name`,
        [pond.code, pond.name],
      );
      pondIds.set(result.rows[0].name, result.rows[0].id);
    }
    for (const item of records.cycles) {
      const cycleId = cycleIds.get(item.cycleNo);
      for (const allocation of [
        {
          name: 'Pond A',
          weightKg: item.pondAWeightKg,
          fishCount: item.pondAFishCount,
          date: item.pondADate,
        },
        {
          name: 'Pond B',
          weightKg: item.pondBWeightKg,
          fishCount: item.pondBFishCount,
          date: item.pondBDate,
        },
      ]) {
        if (!cycleId || (!allocation.weightKg && !allocation.fishCount)) continue;
        await client.query(
          `INSERT INTO cycle_pond_allocations (cycle_id, pond_id, shifted_at, weight_kg, fish_count)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (cycle_id, pond_id, shifted_at) DO UPDATE SET weight_kg=EXCLUDED.weight_kg, fish_count=EXCLUDED.fish_count, version=cycle_pond_allocations.version+1`,
          [
            cycleId,
            pondIds.get(allocation.name),
            allocation.date || item.nurseryDate,
            allocation.weightKg,
            allocation.fishCount,
          ],
        );
      }
    }
    for (const item of records.feedLogs) {
      await client.query(
        `INSERT INTO feed_logs (pond_id, pond_name, fed_at, quantity_kg, technician, response, notes, source_sheet, source_row_number)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (source_sheet, source_row_number) DO UPDATE SET pond_name=EXCLUDED.pond_name, fed_at=EXCLUDED.fed_at, quantity_kg=EXCLUDED.quantity_kg, technician=EXCLUDED.technician, response=EXCLUDED.response, notes=EXCLUDED.notes`,
        [
          pondIds.get(item.pondName) || null,
          item.pondName || null,
          item.fedAt,
          item.quantityKg,
          item.technician,
          item.response,
          item.notes,
          'Feed Cycle',
          item.sourceRow,
        ],
      );
    }
    for (const item of records.expenses) {
      await client.query(
        `INSERT INTO farm_expenses (expense_no, expense_type, pond_area, amount, expense_date, notes, cycle_id, source_sheet, source_row_number) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (source_sheet, source_row_number) DO UPDATE SET amount=EXCLUDED.amount, notes=EXCLUDED.notes, updated_at=now(), version=farm_expenses.version+1`,
        [
          item.expenseNo,
          item.expenseType,
          item.pondArea,
          item.amount,
          item.expenseDate,
          item.notes,
          cycleIds.get((item.notes || '').match(/Cycle\s*-\s*\d+/i)?.[0]) || null,
          'Farm Expenses & Maintenance',
          item.sourceRow,
        ],
      );
    }
    for (const item of records.sales) {
      await client.query(
        `INSERT INTO harvest_sales (sale_no, cycle_id, fish_name, harvest_weight_kg, estimated_fish_count, selling_price_per_kg, buyer_name, buyer_mobile, harvest_netting_cost, sold_at, source_sheet, source_row_number) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (source_sheet, source_row_number) DO UPDATE SET harvest_weight_kg=EXCLUDED.harvest_weight_kg, estimated_fish_count=EXCLUDED.estimated_fish_count, updated_at=now(), version=harvest_sales.version+1`,
        [
          item.saleNo,
          cycleIds.get(item.cycleNo) || null,
          item.fishName,
          item.harvestWeightKg,
          item.fishCount,
          item.sellingPricePerKg,
          item.buyerName,
          item.buyerMobile,
          item.harvestNettingCost,
          item.soldAt,
          'Harvesting',
          item.sourceRow,
        ],
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function main() {
  const sheetNames = [
    'Inventory',
    'Fish Lifecycle',
    'Purchase Order',
    'Farm Expenses & Maintenance',
    'Feed Cycle',
    'Harvesting',
  ];
  const sheets = Object.fromEntries(
    await Promise.all(sheetNames.map(async (sheet) => [sheet, await fetchSheet(sheet)])),
  );
  const records = buildRecords(sheets);
  console.log(
    JSON.stringify(
      {
        mode: dryRun ? 'dry-run' : 'apply',
        counts: Object.fromEntries(
          Object.entries(records)
            .filter(([, value]) => Array.isArray(value))
            .map(([key, value]) => [key, value.length]),
        ),
        errors: records.errors,
      },
      null,
      2,
    ),
  );
  if (records.errors.length)
    throw new Error(`Validation failed with ${records.errors.length} error(s)`);
  if (dryRun) {
    console.log('Dry-run complete. Re-run with --apply to write to PostgreSQL.');
    return;
  }
  const client = await pool.connect();
  try {
    await applyRecords(client, records);
    console.log('Migration committed successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
