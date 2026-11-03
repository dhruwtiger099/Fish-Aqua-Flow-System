const SHEETS_ENDPOINT = import.meta.env.VITE_GOOGLE_SHEETS_WEB_APP_URL;

export const isSheetsConfigured = Boolean(SHEETS_ENDPOINT);

export async function fetchInventoryFromSheet() {
  if (!SHEETS_ENDPOINT) return null;
  const response = await fetch(`${SHEETS_ENDPOINT}?action=list&sheet=Inventory&_=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Google Sheet read failed');
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || 'Google Sheet stock update failed');
  return data;
}

export async function fetchPurchaseOrdersFromSheet() {
  if (!SHEETS_ENDPOINT) return null;
  const response = await fetch(`${SHEETS_ENDPOINT}?action=list&sheet=Purchase%20Order&_=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Google Sheet purchase order read failed');
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || 'Google Sheet purchase order read failed');
  return data;
}

export async function fetchMasterFromSheet() {
  if (!SHEETS_ENDPOINT) return null;
  const response = await fetch(`${SHEETS_ENDPOINT}?action=list&sheet=Master&_=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Google Sheet master read failed');
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || 'Google Sheet master read failed');
  return data;
}

export async function addInventoryToSheet(item) {
  if (!SHEETS_ENDPOINT) return null;
  const response = await fetch(SHEETS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'add', sheet: 'Inventory', item }),
  });
  if (!response.ok) throw new Error('Google Sheet write failed');
  return response.json();
}

export async function addFeedCycleToSheet(feedData) {
  if (!SHEETS_ENDPOINT) return null;
  const response = await fetch(SHEETS_ENDPOINT, {
    method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'addFeedCycle', sheet: 'Feed Cycle', item: feedData }),
  });
  if (!response.ok) throw new Error('Google Sheet feed cycle write failed');
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || 'Google Sheet feed cycle write failed');
  return data;
}

export async function addFishLifecycleCycleToSheet(cycle) {
  if (!SHEETS_ENDPOINT) return null;
  const response = await fetch(SHEETS_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'addFishLifecycleCycle', sheet: 'Fish Lifecycle', item: cycle }) });
  if (!response.ok) throw new Error('Fish lifecycle sheet write failed');
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || 'Fish lifecycle sheet write failed');
  return data;
}

export async function updateFishLifecycleCycleOnSheet(cycle) {
  if (!SHEETS_ENDPOINT) return null;
  const response = await fetch(SHEETS_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'updateFishLifecycleCycle', sheet: 'Fish Lifecycle', item: cycle }) });
  if (!response.ok) throw new Error('Fish lifecycle sheet update failed');
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || 'Fish lifecycle sheet update failed');
  return data;
}

export async function updateInventoryStock(item, currentStock) {
  if (!SHEETS_ENDPOINT) return null;
  const response = await fetch(SHEETS_ENDPOINT, {
    method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'updateStock', sheet: 'Inventory', sku: item.sku, itemName: item.name, currentStock }),
  });
  if (!response.ok) throw new Error('Google Sheet stock update failed');
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || 'Google Sheet stock update failed');
  return data;
}

export async function uploadInvoiceAttachment(file) {
  if (!SHEETS_ENDPOINT || !file) return null;
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const response = await fetch(SHEETS_ENDPOINT, {
    method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'uploadAttachment', fileName: file.name, mimeType: file.type, data: String(dataUrl).split(',')[1] }),
  });
  if (!response.ok) throw new Error('Invoice upload failed');
  const result = await response.json();
  if (!result.ok) throw new Error(result.error || 'Invoice upload failed');
  return result;
}

export async function addPurchaseOrderToSheet(purchase) {
  if (!SHEETS_ENDPOINT) return null;
  const response = await fetch(SHEETS_ENDPOINT, {
    method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'addPurchaseOrder', sheet: 'Purchase Order', item: purchase }),
  });
  if (!response.ok) throw new Error('Purchase Order sheet write failed');
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || 'Purchase Order sheet write failed');
  return data;
}
