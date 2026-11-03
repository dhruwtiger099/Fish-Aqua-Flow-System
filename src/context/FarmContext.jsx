import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_PONDS,
  INITIAL_INVENTORY,
  INITIAL_PURCHASES,
  INITIAL_FEEDING_LOGS,
  INITIAL_SALES,
  USER_ROLES,
} from '../data/initialData';
import { addInventoryToSheet, addFeedCycleToSheet, addPurchaseOrderToSheet, fetchInventoryFromSheet, fetchPurchaseOrdersFromSheet, fetchMasterFromSheet, isSheetsConfigured, updateInventoryStock } from '../services/googleSheets';

const FarmContext = createContext(null);
const CLEAN_DATA_VERSION = 'clean-testing-v1';
const CLEAN_PONDS = INITIAL_PONDS.map((pond) => ({
  ...pond,
  cycle: 'No active cycle',
  cycleNumber: 0,
  cycleDay: 0,
  estimatedBiomassKg: 0,
  todayFeedKg: 0,
  feedRationsPlanned: 0,
  feedRationsCompleted: 0,
  liveStockCount: 0,
  initialStockCount: 0,
  survivalRate: 0,
  status: 'Inactive',
  targetHarvestKg: 0,
  avgWeightGrams: 0,
  alerts: [],
  notes: '',
  aeratorsActive: 0,
  waterQuality: { do: 0, temp: 0, ph: 0, ammonia: 0, nitrite: 0, salinity: 0, transparencyCm: 0 },
}));

export function FarmProvider({ children }) {
  try {
    if (localStorage.getItem('aquaflow_data_version') !== CLEAN_DATA_VERSION) {
      ['ponds', 'inventory', 'purchases', 'feeding_logs', 'sales', 'expenses', 'fish_cycles'].forEach((key) => localStorage.removeItem(`aquaflow_${key}`));
      localStorage.setItem('aquaflow_data_version', CLEAN_DATA_VERSION);
    }
  } catch { /* storage may be unavailable during startup */ }
  // Local storage persistence helper
  const getStored = (key, defaultVal) => {
    try {
      const item = localStorage.getItem(`aquaflow_${key}`);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const [ponds, setPonds] = useState(() => getStored('ponds', CLEAN_PONDS));
  const [inventory, setInventory] = useState(() => getStored('inventory', []));
  const [purchases, setPurchases] = useState(() => getStored('purchases', []));
  const [feedingLogs, setFeedingLogs] = useState(() => getStored('feeding_logs', []));
  const [sales, setSales] = useState(() => getStored('sales', []));
  const [expenses, setExpenses] = useState(() => getStored('expenses', []));
  const [currentUser, setCurrentUser] = useState(USER_ROLES[0]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPondModal, setSelectedPondModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [masterData, setMasterData] = useState({ category: [], unit: [], expenseType: [], pondArea: [] });

  useEffect(() => {
    if (!isSheetsConfigured) return;
    const syncInventory = () => Promise.all([fetchInventoryFromSheet(), fetchPurchaseOrdersFromSheet(), fetchMasterFromSheet()])
      .then(([data, purchaseData, master]) => {
        if (master?.headers && master?.rows) {
          const columns = { category: 'Category', unit: 'Unit', expenseType: 'Expense type', pondArea: 'Pond / Area' };
          const values = Object.fromEntries(Object.entries(columns).map(([key, header]) => {
            const column = master.headers.indexOf(header);
            return [key, column < 0 ? [] : [...new Set(master.rows.map((row) => String(row[column] || '').trim()).filter(Boolean))]];
          }));
          setMasterData(values);
        }
        if (data?.rows?.length) {
          const index = Object.fromEntries(data.headers.map((header, i) => [header, i]));
          const sheetItems = data.rows.map((row, i) => ({
          id: `sheet-inv-${i + 1}`,
          name: row[index['Item Name']] || '', category: row[index['Category']] || 'Feed', sku: row[index['SKU Code']] || `SHEET-${i + 1}`,
          stockQty: Number(row[index['Current Stock']] || row[index['Initial Quantity']]) || 0, purchaseQty: Number(row[index['Purchase Quantity']] || row[index['Initial Quantity']]) || 0, unit: row[index.Unit] || 'kg', minThreshold: Number(row[index['Min Threshold']]) || 0,
          costPerUnit: Number(row[index['Cost per Unit ($)']]) || 0, supplier: row[index['Primary Supplier']] || '', supplierPhone: row[index.Mobile] || '', expiryDate: row[index['Expiry Date']] || '', location: 'Google Sheet',
          }));
          setInventory(sheetItems);
        }
        if (purchaseData?.headers && purchaseData?.rows) {
          const purchaseIndex = Object.fromEntries(purchaseData.headers.map((header, i) => [header, i]));
          const sheetPurchases = purchaseData.rows.map((row, i) => {
            const quantity = Number(row[purchaseIndex['Quantity (kg)']]) || 0;
            const unitPrice = Number(row[purchaseIndex['Unit Price (₹ / kg)']]) || 0;
            const reference = row[purchaseIndex['Invoice / PO Reference']] || `SHEET-PO-${i + 1}`;
            return {
              id: reference,
              itemName: row[purchaseIndex['Select Inventory Item']] || '',
              itemSku: '',
              supplier: row[purchaseIndex['Vendor / Supplier']] || '',
              invoiceNumber: reference,
              date: row[purchaseIndex.Date] || '',
              quantity,
              unit: 'kg',
              unitPrice,
              totalAmount: quantity * unitPrice,
              status: row[purchaseIndex['Delivery Status']] || 'Received',
            };
          }).filter((purchase) => purchase.itemName && purchase.quantity > 0);
          setPurchases(sheetPurchases);
        }
      })
      .catch((error) => console.warn('Google Sheet sync failed:', error));
    syncInventory();
    const refreshOnFocus = () => syncInventory();
    window.addEventListener('focus', refreshOnFocus);
    window.addEventListener('online', refreshOnFocus);
    const intervalId = window.setInterval(syncInventory, 3000);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshOnFocus);
      window.removeEventListener('online', refreshOnFocus);
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('aquaflow_ponds', JSON.stringify(ponds));
      localStorage.setItem('aquaflow_inventory', JSON.stringify(inventory));
      localStorage.setItem('aquaflow_purchases', JSON.stringify(purchases));
      localStorage.setItem('aquaflow_feeding_logs', JSON.stringify(feedingLogs));
      localStorage.setItem('aquaflow_sales', JSON.stringify(sales));
      localStorage.setItem('aquaflow_expenses', JSON.stringify(expenses));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [ponds, inventory, purchases, feedingLogs, sales, expenses]);

  // Toast notification system
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Ponds management
  const updatePond = (pondId, updates) => {
    setPonds((prev) =>
      prev.map((p) => (p.id === pondId ? { ...p, ...updates } : p))
    );
    // If selected modal is open, keep it in sync
    setSelectedPondModal((prev) => (prev && prev.id === pondId ? { ...prev, ...updates } : prev));
    addToast(`Pond updated successfully`, 'success');
  };

  // Inventory actions
  const addInventoryItem = (item) => {
    const newItem = {
      ...item,
      id: `inv-${Date.now()}`,
      stockQty: Number(item.stockQty) || 0,
      purchaseQty: Number(item.purchaseQty ?? item.stockQty) || 0,
      minThreshold: Number(item.minThreshold) || 0,
      costPerUnit: Number(item.costPerUnit) || 0,
      lastRestocked: new Date().toISOString().split('T')[0],
    };
    setInventory((prev) => [newItem, ...prev]);
    addInventoryToSheet(newItem).catch((error) => console.warn('Google Sheet write failed:', error));
    addToast(`Added "${newItem.name}" to inventory`, 'success');
    return newItem;
  };

  const adjustStock = (itemId, deltaQty, reason = '') => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQty = Math.max(0, (item.stockQty || 0) + Number(deltaQty));
          return { ...item, stockQty: newQty };
        }
        return item;
      })
    );
    addToast(`Stock adjusted (${deltaQty > 0 ? '+' : ''}${deltaQty})`, 'info');
  };

  // Purchase record workflow
  const addPurchase = (purchaseData) => {
    const qty = Number(purchaseData.quantity) || 0;
    const rate = Number(purchaseData.unitPrice) || 0;
    const taxRate = Number(purchaseData.taxRate) || 0;
    const shipping = Number(purchaseData.shippingFee) || 0;
    const subtotal = qty * rate;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount + shipping;

    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newPurchase = {
      ...purchaseData,
      id: poNumber,
      date: purchaseData.date || new Date().toISOString().split('T')[0],
      quantity: qty,
      unitPrice: rate,
      taxRate,
      shippingFee: shipping,
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      paidStatus: purchaseData.paidStatus || 'Paid',
      status: purchaseData.status || 'Received',
      receivedBy: currentUser.name,
    };

    setPurchases((prev) => [newPurchase, ...prev]);
    addPurchaseOrderToSheet(newPurchase)
      .then(() => addToast(`Purchase Order saved to Google Sheet`, 'success'))
      .catch((error) => {
        console.warn('Purchase Order sheet write failed:', error);
        addToast(`Purchase Order sheet update failed: ${error.message}`, 'warning');
      });

    // If purchase is received, automatically increase inventory
    if (newPurchase.status === 'Received' && newPurchase.itemId) {
      setInventory((prev) =>
        prev.map((item) => {
          if (item.id === newPurchase.itemId || (newPurchase.itemSku && item.sku === newPurchase.itemSku) || item.name === newPurchase.itemName) {
            const updatedStock = (Number(item.stockQty) || 0) + qty;
            updateInventoryStock(item, updatedStock).catch((error) => console.warn('Google Sheet purchase stock update failed:', error));
            return {
              ...item,
              stockQty: updatedStock,
              purchaseQty: Number(item.purchaseQty ?? item.stockQty) + qty,
              lastAddedQty: qty,
              costPerUnit: rate, // update latest unit price
              lastRestocked: newPurchase.date,
            };
          }
          return item;
        })
      );
    }

    // Catalog-based purchase orders can create a new inventory item when no
    // existing catalog item was selected. Fish purchases are tracked as
    // lifecycle batches instead of warehouse stock.
    if (newPurchase.status === 'Received' && !newPurchase.itemId && newPurchase.purchaseType !== 'Fish Buy') {
      setInventory((prev) => {
        const existing = prev.find((item) => item.name.toLowerCase() === String(newPurchase.itemName).toLowerCase());
        if (existing) return prev.map((item) => item.id === existing.id ? { ...item, stockQty: (Number(item.stockQty) || 0) + qty, purchaseQty: (Number(item.purchaseQty ?? item.stockQty) || 0) + qty, costPerUnit: rate, lastRestocked: newPurchase.date } : item);
        return [{
          id: `inv-${Date.now()}`,
          name: newPurchase.itemName,
          category: newPurchase.category || 'Feed',
          sku: newPurchase.itemSku || `AUTO-${Date.now()}`,
          stockQty: qty,
          purchaseQty: qty,
          unit: newPurchase.unit || 'kg',
          minThreshold: 0,
          costPerUnit: rate,
          supplier: newPurchase.supplier,
          location: 'Warehouse',
          lastRestocked: newPurchase.date,
        }, ...prev];
      });
    }

    addToast(`Purchase ${poNumber} recorded (₹${newPurchase.totalAmount.toLocaleString('en-IN')})`, 'success');
    return newPurchase;
  };

  // Feeding workflow
  const logFeeding = (feedData) => {
    const feedQty = Number(feedData.quantityKg) || 0;
    const newLog = {
      ...feedData,
      id: `feed-log-${Date.now()}`,
      date: feedData.date || new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quantityKg: feedQty,
      technician: currentUser.name,
      fcrEstimate: feedData.fcrEstimate || 1.25,
    };

    setFeedingLogs((prev) => [newLog, ...prev]);
    addFeedCycleToSheet(newLog)
      .then(() => addToast(`Feed Cycle updated for ${feedData.pondName}`, 'success'))
      .catch((error) => {
        console.warn('Google Sheet feed cycle write failed:', error);
        addToast(`Feed Cycle sheet update failed: ${error.message}`, 'warning');
      });

    // Update pond's todayFeedKg and rations completed
    setPonds((prev) =>
      prev.map((pond) => {
        if (pond.id === feedData.pondId) {
          return {
            ...pond,
            todayFeedKg: (pond.todayFeedKg || 0) + feedQty,
            feedRationsCompleted: Math.min(pond.feedRationsPlanned, (pond.feedRationsCompleted || 0) + 1),
          };
        }
        return pond;
      })
    );

    // Auto-deduct from feed inventory item if matched
    if (feedData.feedItemId) {
      setInventory((prev) =>
        prev.map((item) => {
          if (item.id === feedData.feedItemId) {
            const currentStock = Math.max(0, item.stockQty - feedQty);
            updateInventoryStock(item, currentStock).catch((error) => console.warn('Google Sheet stock update failed:', error));
            return { ...item, stockQty: currentStock, purchaseQty: Number(item.purchaseQty ?? item.stockQty) || 0 };
          }
          return item;
        })
      );
    }

    addToast(`Feeding logged: ${feedQty} kg fed to ${feedData.pondName}`, 'success');
    return newLog;
  };

  // Harvesting & Sales workflow
  const recordSale = (saleData) => {
    const weight = Number(saleData.weightKg) || 0;
    const price = Number(saleData.pricePerKg) || 0;
    const harvestCost = Number(saleData.harvestCost) || 0;
    const grossRevenue = weight * price;
    const netProfit = grossRevenue - harvestCost;

    const saleId = `SALE-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newSale = {
      ...saleData,
      id: saleId,
      date: saleData.date || new Date().toISOString().split('T')[0],
      weightKg: weight,
      pricePerKg: price,
      grossRevenue: parseFloat(grossRevenue.toFixed(2)),
      harvestCost: parseFloat(harvestCost.toFixed(2)),
      netProfit: parseFloat(netProfit.toFixed(2)),
      technician: currentUser.name,
      paymentStatus: saleData.paymentStatus || 'Paid',
    };

    setSales((prev) => [newSale, ...prev]);

    // Adjust pond biomass if it was harvested from active pond
    if (saleData.pondId) {
      setPonds((prev) =>
        prev.map((pond) => {
          if (pond.id === saleData.pondId) {
            const remainingBiomass = Math.max(0, (pond.estimatedBiomassKg || 0) - weight);
            const remainingCount = Math.max(0, (pond.liveStockCount || 0) - (Number(saleData.fishCount) || 0));
            return {
              ...pond,
              estimatedBiomassKg: remainingBiomass,
              liveStockCount: remainingCount,
            };
          }
          return pond;
        })
      );
    }

    addToast(`Sale recorded! Gross Revenue: ₹${newSale.grossRevenue.toLocaleString('en-IN')}`, 'success');
    return newSale;
  };

  const addExpense = (expenseData) => {
    const expense = {
      ...expenseData,
      id: `EXP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: expenseData.date || new Date().toISOString().split('T')[0],
      amount: Number(expenseData.amount) || 0,
    };
    setExpenses((prev) => [expense, ...prev]);
    addToast(`Expense recorded: ₹${expense.amount.toLocaleString('en-IN')}`, 'success');
    return expense;
  };

  // Reset to initial factory data
  const resetToFactoryData = () => {
    setPonds(CLEAN_PONDS);
    setInventory([]);
    setPurchases([]);
    setFeedingLogs([]);
    setSales([]);
    setExpenses([]);
    addToast('Reset to initial factory data', 'info');
  };

  return (
    <FarmContext.Provider
      value={{
        ponds,
        updatePond,
        inventory,
        addInventoryItem,
        adjustStock,
        purchases,
        addPurchase,
        feedingLogs,
        logFeeding,
        sales,
        recordSale,
        expenses,
        addExpense,
        masterData,
        currentUser,
        setCurrentUser,
        activeTab,
        setActiveTab,
        selectedPondModal,
        setSelectedPondModal,
        toasts,
        addToast,
        removeToast,
        resetToFactoryData,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within FarmProvider');
  }
  return context;
}
