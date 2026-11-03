const SPREADSHEET_ID = '1-KD56jTEth6vNUzvXZEHV0dr8wpqsO94zcVcD5lKIdg';
const ATTACHMENT_FOLDER_ID = '1Eenv6l1i63viMN09XAQvues1AjolqkOP';
const DEFAULT_HEADERS = ['Item Name', 'Category', 'SKU Code', 'Purchase Quantity', 'Current Stock', 'Unit', 'Min Threshold', 'Cost per Unit ($)', 'Primary Supplier', 'Mobile', 'Expiry Date'];

function doGet(e) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(e.parameter.sheet || 'Inventory');
  const values = sheet.getDataRange().getDisplayValues();
  const headers = values.shift();
  return json({ ok: true, headers, rows: values.filter(row => row.some(Boolean)) });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.action === 'uploadAttachment') {
      const bytes = Utilities.base64Decode(body.data);
      const blob = Utilities.newBlob(bytes, body.mimeType || MimeType.PDF, body.fileName || `invoice-${Date.now()}`);
      const file = DriveApp.getFolderById(ATTACHMENT_FOLDER_ID).createFile(blob);
      return json({ ok: true, fileId: file.getId(), url: file.getUrl(), name: file.getName() });
    }
    if (body.action === 'addPurchaseOrder') {
      const item = body.item || {};
      const purchaseSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Purchase Order');
      const headers = purchaseSheet.getRange(1, 1, 1, Math.max(purchaseSheet.getLastColumn(), 1)).getDisplayValues()[0];
      const values = {
        'Timestamps': new Date(), 'Purchase Type': item.purchaseType, 'Initial Total Weight (kg)': item.fishWeight,
        'Fish Count': item.fishCount || (item.purchaseType === 'Fish Species' ? item.quantity : ''), 'Fish Name / Species': item.fishName,
        'Item / Supply Name': item.itemName, 'Vendor / Supplier': item.supplier, 'Invoice / PO Reference': item.invoiceNumber,
        'Quantity': item.quantity, 'Unit': item.unit, 'Unit Price': item.unitPrice, 'Tax Rate (%)': item.taxRate,
        'Shipping / Freight': Number(item.shippingFee) > 0 ? 'Freight' : 'Self', 'Freight Amount': item.shippingFee,
        'Delivery Status': item.status, 'Attachament': item.attachmentName || '', 'Receipt / Quality Inspection Notes': item.notes,
        'Attachment': item.attachmentUrl || '', 'Total Purchase Amount': item.totalAmount,
      };
      if (headers.includes('Timestamps') && headers.includes('Purchase Type')) {
        purchaseSheet.appendRow(headers.map(header => values[header] ?? ''));
        return json({ ok: true, row: headers.map(header => values[header] ?? '') });
      }
      const legacyItem = body.item || {};
      const legacyPurchaseSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Purchase Order');
      const purchaseHeaders = ['Select Inventory Item', 'Vendor / Supplier', 'Invoice / PO Reference', 'Quantity (kg)', 'Unit Price (₹ / kg)', 'Tax Rate (%)', 'Shipping / Freight', 'Freight Amount', 'Delivery Status', 'Attachment', 'Receipt / Quality Inspection Notes'];
      let legacyHeaders = legacyPurchaseSheet.getRange(1, 1, 1, Math.max(legacyPurchaseSheet.getLastColumn(), 1)).getDisplayValues()[0];
      purchaseHeaders.forEach(header => { if (!legacyHeaders.includes(header)) { legacyPurchaseSheet.getRange(1, legacyHeaders.length + 1).setValue(header); legacyHeaders.push(header); } });
      const row = legacyHeaders.map(header => ({
        'Select Inventory Item': item.itemName, 'Vendor / Supplier': item.supplier, 'Invoice / PO Reference': item.invoiceNumber,
        'Quantity (kg)': item.quantity, 'Unit Price (₹ / kg)': item.unitPrice, 'Tax Rate (%)': item.taxRate,
        'Shipping / Freight': Number(item.shippingFee) > 0 ? 'Freight' : 'Self', 'Freight Amount': item.shippingFee,
        'Delivery Status': item.status, 'Attachment': item.attachmentUrl || item.attachmentName || '', 'Receipt / Quality Inspection Notes': item.notes,
      }[header] ?? ''));
      legacyPurchaseSheet.appendRow(row);
      return json({ ok: true, row });
    }
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(body.sheet || 'Inventory');
    if (body.action === 'updateStock') {
      const headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getDisplayValues()[0];
      const skuColumn = headers.indexOf('SKU Code') + 1;
      const nameColumn = headers.indexOf('Item Name') + 1;
      let stockColumn = headers.indexOf('Current Stock') + 1;
      if (!stockColumn) { stockColumn = headers.length + 1; sheet.getRange(1, stockColumn).setValue('Current Stock'); }
      const rows = sheet.getDataRange().getDisplayValues();
      let rowNumber = -1;
      for (let i = 1; i < rows.length; i += 1) {
        if ((body.sku && skuColumn && rows[i][skuColumn - 1] === body.sku) || (!body.sku && nameColumn && rows[i][nameColumn - 1] === body.itemName)) { rowNumber = i + 1; break; }
      }
      if (rowNumber < 0) throw new Error('Inventory item not found');
      sheet.getRange(rowNumber, stockColumn).setValue(Number(body.currentStock) || 0);
      return json({ ok: true, row: rowNumber, currentStock: Number(body.currentStock) || 0 });
    }
    if (body.action === 'addFeedCycle') {
      const feedHeaders = ['Date', 'Time', 'Pond', 'Feed Type', 'Quantity (kg)'];
      let existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getDisplayValues()[0];
      feedHeaders.forEach(header => { if (!existingHeaders.includes(header)) { sheet.getRange(1, existingHeaders.length + 1).setValue(header); existingHeaders.push(header); } });
      const item = body.item || {};
      const feedRow = existingHeaders.map(header => ({
        'Date': item.date, 'Time': item.time, 'Pond': item.pondName, 'Feed Type': item.feedItem,
        'Quantity (kg)': item.quantityKg,
      }[header] ?? ''));
      sheet.appendRow(feedRow);
      return json({ ok: true, row: feedRow });
    }
    if (body.action === 'addFishLifecycleCycle' || body.action === 'updateFishLifecycleCycle') {
      const lifecycleSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Fish Lifecycle');
      const lifecycleHeaders = ['Timestamps', 'Cycle', 'Fish Name', 'Weight', 'Qty Of Fish', 'Date', 'Weight', 'Qty Of Fish', 'Date', 'Weight', 'Qty Of Fish', 'Date', 'Stage'];
      let lifecycleExisting = lifecycleSheet.getRange(2, 1, 1, Math.max(lifecycleSheet.getLastColumn(), 1)).getDisplayValues()[0];
      if (lifecycleSheet.getLastRow() < 2 || !lifecycleExisting.some(Boolean)) lifecycleSheet.getRange(2, 1, 1, lifecycleHeaders.length).setValues([lifecycleHeaders]);
      const item = body.item || {};
      const values = [new Date(), item.id, item.fishName, item.nurseryWeight || '', item.nurseryFishCount || '', item.nurseryDate || '', item.pondAWeight || '', item.nurseryFishCount || '', item.pondADate || '', item.pondBWeight || '', item.nurseryFishCount || '', item.pondBDate || '', item.stage || 'Fry (Nursery)'];
      if (body.action === 'addFishLifecycleCycle') { lifecycleSheet.appendRow(values); return json({ ok: true, row: values }); }
      const rows = lifecycleSheet.getDataRange().getDisplayValues();
      const cycleColumn = 2;
      let rowNumber = -1;
      for (let i = 2; i < rows.length; i += 1) if (rows[i][cycleColumn - 1] === item.id) { rowNumber = i + 1; break; }
      if (rowNumber < 0) throw new Error('Fish lifecycle cycle not found');
      lifecycleSheet.getRange(rowNumber, 1, 1, values.length).setValues([values]);
      return json({ ok: true, row: rowNumber });
    }
    let headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getDisplayValues()[0];
    DEFAULT_HEADERS.forEach(header => {
      if (!headers.includes(header)) {
        sheet.getRange(1, headers.length + 1).setValue(header);
        headers.push(header);
      }
    });
    const item = body.item || {};
    const row = headers.map(header => ({
      'Item Name': item.name,
      'Category': item.category,
      'SKU Code': item.sku,
      'Initial Quantity': item.stockQty,
      'Purchase Quantity': item.purchaseQty ?? item.stockQty,
      'Current Stock': item.stockQty,
      'Unit': item.unit,
      'Min Threshold': item.minThreshold,
      'Cost per Unit ($)': item.costPerUnit,
      'Primary Supplier': item.supplier,
      'Mobile': item.supplierPhone,
      'Expiry Date': item.expiryDate,
    }[header] ?? ''));
    sheet.appendRow(row);
    return json({ ok: true, row });
  } catch (error) {
    return json({ ok: false, error: error.message });
  }
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
