const SHEETS_ENDPOINT = import.meta.env.VITE_GOOGLE_SHEETS_WEB_APP_URL;
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export const isSheetsConfigured = Boolean(SHEETS_ENDPOINT);

function buildUrl(params) {
  const url = new URL(SHEETS_ENDPOINT);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  url.searchParams.set('_', String(Date.now()));
  return url;
}

async function request(pathOrParams, options = {}) {
  if (!SHEETS_ENDPOINT) return null;
  const url =
    typeof pathOrParams === 'string' ? `${SHEETS_ENDPOINT}${pathOrParams}` : buildUrl(pathOrParams);
  const attempts = options.method === 'POST' ? 1 : 2;
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`Data request failed (${response.status})`);
      const data = await response.json();
      if (!data.ok) throw new Error(data.error || 'Data request failed');
      return data;
    } catch (error) {
      lastError = error;
      if (attempt + 1 < attempts)
        await new Promise((resolve) => window.setTimeout(resolve, 250 * 2 ** attempt));
    } finally {
      window.clearTimeout(timeoutId);
    }
  }
  throw lastError || new Error('Data request failed');
}

export async function fetchSheetFromSheet(sheetName, limit) {
  const params = { action: 'list', sheet: sheetName };
  if (limit && limit < 999999) params.limit = limit;
  return request(params);
}

export function fetchInventoryFromSheet(limit) {
  return fetchSheetFromSheet('Inventory', limit);
}
export function fetchPurchaseOrdersFromSheet(limit) {
  return fetchSheetFromSheet('Purchase Order', limit);
}
export function fetchMasterFromSheet() {
  return fetchSheetFromSheet('Master');
}

function postSheet(action, sheet, item) {
  return request('', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, sheet, item }),
  });
}

export function addInventoryToSheet(item) {
  return postSheet('add', 'Inventory', item);
}
export function addFeedCycleToSheet(item) {
  return postSheet('addFeedCycle', 'Feed Cycle', item);
}
export function addFishLifecycleCycleToSheet(item) {
  return postSheet('addFishLifecycleCycle', 'Fish Lifecycle', item);
}
export function addPurchaseOrderToSheet(item) {
  return postSheet('addPurchaseOrder', 'Purchase Order', item);
}
export function addExpenseToSheet(item) {
  return postSheet('addExpense', 'Farm Expenses & Maintenance', item);
}
export function addHarvestToSheet(item) {
  return postSheet('addHarvest', 'Harvesting', item);
}
export function updateFishLifecycleCycleOnSheet(cycle) {
  return postSheet('updateFishLifecycleCycle', 'Fish Lifecycle', cycle);
}

export function updateInventoryStock(item, currentStock) {
  return request('', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'updateStock',
      sheet: 'Inventory',
      sku: item.sku,
      itemName: item.name,
      currentStock,
    }),
  });
}

export async function uploadInvoiceAttachment(file) {
  if (!SHEETS_ENDPOINT || !file) return null;
  if (file.size > MAX_ATTACHMENT_BYTES) throw new Error('Attachment must be 10 MB or smaller');
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Attachment could not be read'));
    reader.readAsDataURL(file);
  });
  return request('', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'uploadAttachment',
      fileName: file.name,
      mimeType: file.type,
      data: String(dataUrl).split(',')[1],
    }),
  });
}
