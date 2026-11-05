import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Plus, Shuffle, X } from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import {
  addFishLifecycleCycleToSheet,
  updateFishLifecycleCycleOnSheet,
  isSheetsConfigured,
} from '../services/googleSheets';
import DataLimitControl from '../components/DataLimitControl';

const KEY = 'aquaflow_fish_cycles';
const seed = [];
const today = () => new Date().toISOString().slice(0, 10);

export default function FishTransfersView() {
  const { ponds, updatePond, limitData } = useFarm();
  const [cycles, setCycles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || seed;
    } catch {
      return seed;
    }
  });
  const [tab, setTab] = useState('nursery');
  const [showNew, setShowNew] = useState(false);
  const [shiftCycle, setShiftCycle] = useState(null);

  // Listen for hardware/browser back button modal close event
  useEffect(() => {
    const handleCloseModal = () => {
      setShowNew(false);
      setShiftCycle(null);
    };
    window.addEventListener('close-active-modal', handleCloseModal);
    return () => window.removeEventListener('close-active-modal', handleCloseModal);
  }, []);
  const [shiftForm, setShiftForm] = useState({
    date: today(),
    totalWeight: '',
    totalQty: '',
    pondAWeight: '',
    pondAQty: '',
    pondBWeight: '',
    pondBQty: '',
    note: '',
  });
  const [newForm, setNewForm] = useState({
    date: today(),
    fishName: '',
    weight: '',
    fishCount: '',
    note: '',
  });
  const save = (next) => {
    setCycles(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };
  const pondsafe = (id) => ponds.find((pond) => pond.id === id) || {};
  useEffect(() => {
    const refresh = () => {
      try {
        setCycles(JSON.parse(localStorage.getItem(KEY)) || []);
      } catch {
        setCycles([]);
      }
    };
    window.addEventListener('aquaflow-cycle-updated', refresh);
    return () => window.removeEventListener('aquaflow-cycle-updated', refresh);
  }, []);
  const nextId = () => `Cycle - ${String(cycles.length + 1).padStart(3, '0')}`;
  const createCycle = (e) => {
    e.preventDefault();
    const newCycle = {
      id: nextId(),
      fishName: newForm.fishName.trim(),
      status: 'nursery-pending',
      stage: 'Fry (Nursery)',
      nurseryDate: newForm.date,
      nurseryWeight: Number(newForm.weight),
      nurseryFishCount: Number(newForm.fishCount) || 0,
      pondADate: '',
      pondAWeight: 0,
      pondBDate: '',
      pondBWeight: 0,
      note: newForm.note,
    };
    save([newCycle, ...cycles]);
    if (isSheetsConfigured)
      addFishLifecycleCycleToSheet(newCycle).catch((error) =>
        console.warn('Fish lifecycle sheet write failed:', error),
      );
    updatePond('pond-2', {
      estimatedBiomassKg: (pondsafe('pond-2')?.estimatedBiomassKg || 0) + newCycle.nurseryWeight,
      liveStockCount: (pondsafe('pond-2')?.liveStockCount || 0) + newCycle.nurseryFishCount,
    });
    setShowNew(false);
    setNewForm({ date: today(), fishName: '', weight: '', fishCount: '', note: '' });
  };
  const setSplitValue = (field, value) => {
    const numericValue = Math.max(0, Number(value) || 0);
    const isWeight = field.includes('Weight');
    const total = Number(shiftForm[isWeight ? 'totalWeight' : 'totalQty']) || 0;
    const otherField =
      field === 'pondAWeight'
        ? 'pondBWeight'
        : field === 'pondBWeight'
          ? 'pondAWeight'
          : field === 'pondAQty'
            ? 'pondBQty'
            : 'pondAQty';
    setShiftForm((current) => ({
      ...current,
      [field]: value,
      [otherField]: Math.max(0, total - numericValue),
    }));
  };
  const completeShift = (e) => {
    e.preventDefault();
    const isNurserySplit = shiftCycle.status === 'nursery-pending';
    const totalWeight = Number(shiftForm.totalWeight) || 0;
    const totalQty = Number(shiftForm.totalQty) || 0;
    const pondAWeight = Number(shiftForm.pondAWeight) || 0;
    const pondBWeight = Number(shiftForm.pondBWeight) || 0;
    const pondAQty = Number(shiftForm.pondAQty) || 0;
    const pondBQty = Number(shiftForm.pondBQty) || 0;
    const weight = isNurserySplit ? pondBWeight : totalWeight;
    const count = isNurserySplit ? pondBQty : Number(shiftCycle.nurseryFishCount) || 0;
    const fromPond = isNurserySplit ? 'pond-2' : 'pond-1';
    const toPond = isNurserySplit ? 'pond-3' : 'pond-3';
    updatePond(fromPond, {
      estimatedBiomassKg: Math.max(
        0,
        (pondsafe(fromPond)?.estimatedBiomassKg || 0) -
          (isNurserySplit ? shiftCycle.nurseryWeight : shiftCycle.pondAWeight),
      ),
      liveStockCount: Math.max(
        0,
        (pondsafe(fromPond)?.liveStockCount || 0) -
          (isNurserySplit ? shiftCycle.nurseryFishCount : count),
      ),
    });
    if (isNurserySplit) {
      updatePond('pond-1', {
        estimatedBiomassKg: (pondsafe('pond-1')?.estimatedBiomassKg || 0) + pondAWeight,
        liveStockCount: (pondsafe('pond-1')?.liveStockCount || 0) + pondAQty,
      });
    }
    updatePond(toPond, {
      estimatedBiomassKg: (pondsafe(toPond)?.estimatedBiomassKg || 0) + weight,
      liveStockCount: (pondsafe(toPond)?.liveStockCount || 0) + count,
    });
    const nextCycles = cycles.map((cycle) => {
      if (cycle.id !== shiftCycle.id) return cycle;
      return isNurserySplit
        ? {
            ...cycle,
            status: 'pond-b-pending',
            stage: 'Pond A + Pond B',
            pondADate: shiftForm.date,
            pondAWeight,
            pondAQty,
            pondBDate: shiftForm.date,
            pondBWeight,
            pondBQty,
            totalShiftWeight: totalWeight,
            totalShiftQty: totalQty,
            nurseryShiftNote: shiftForm.note,
            note: shiftForm.note || cycle.note,
          }
        : {
            ...cycle,
            status: 'pond-b-pending',
            stage: 'Grow-out / Adult (Pond B)',
            pondBDate: shiftForm.date,
            pondBWeight: weight,
            pondBQty: count,
            pondAShiftNote: shiftForm.note,
          };
    });
    const updatedCycle = nextCycles.find((cycle) => cycle.id === shiftCycle.id);
    save(nextCycles);
    if (isSheetsConfigured)
      updateFishLifecycleCycleOnSheet(updatedCycle).catch((error) =>
        console.warn('Fish lifecycle sheet update failed:', error),
      );
    setShiftCycle(null);
    setShiftForm({
      date: today(),
      totalWeight: '',
      totalQty: '',
      pondAWeight: '',
      pondAQty: '',
      pondBWeight: '',
      pondBQty: '',
      note: '',
    });
  };
  const completePondB = (cycle) => {
    const nextCycles = cycles.map((item) =>
      item.id === cycle.id
        ? {
            ...item,
            status: 'completed',
            stage: 'Harvested (Pond B)',
            harvestDate: today(),
            harvestWeight: cycle.pondBWeight,
          }
        : item,
    );
    save(nextCycles);
    const updatedCycle = nextCycles.find((item) => item.id === cycle.id);
    if (isSheetsConfigured)
      updateFishLifecycleCycleOnSheet(updatedCycle).catch((error) =>
        console.warn('Fish lifecycle sheet update failed:', error),
      );
  };
  const allRows = cycles.flatMap((cycle) => {
    const splitRows = [
      {
        cycle,
        pond: 'Nursery',
        date: cycle.nurseryDate,
        weight: cycle.nurseryWeight,
        qty: cycle.nurseryFishCount,
      },
    ];
    if (cycle.status === 'nursery-pending') return splitRows;
    if (cycle.pondADate || cycle.pondAWeight)
      splitRows.push({
        cycle,
        pond: 'Pond A',
        date: cycle.pondADate,
        weight: cycle.pondAWeight,
        qty: cycle.pondAQty,
      });
    if (cycle.pondBDate || cycle.pondBWeight)
      splitRows.push({
        cycle,
        pond: 'Pond B',
        date: cycle.pondBDate,
        weight: cycle.pondBWeight,
        qty: cycle.pondBQty,
      });
    return splitRows;
  });
  const filteredRows = allRows.filter((row) =>
    tab === 'nursery' ? row.pond === 'Nursery' : row.pond !== 'Nursery',
  );
  const rows = limitData(filteredRows);
  return (
    <div className="inventory-page" style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <DataLimitControl total={filteredRows.length} />
      </div>
      <section className="glass-surface" style={{ padding: 22 }}>
        <div className="fish-cycle-title">
          <div>
            <h1>Fish Lifecycle Ledger</h1>
            <p> </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>
            <Plus size={16} /> New nursery cycle
          </button>
        </div>
      </section>
      <section className="glass-surface" style={{ padding: 18 }}>
        <div className="fish-stage-tabs">
          <button className={tab === 'nursery' ? 'active' : ''} onClick={() => setTab('nursery')}>
            Nursery
          </button>
          <button className={tab === 'pond' ? 'active' : ''} onClick={() => setTab('pond')}>
            Pond
          </button>
        </div>
        <div className="fish-cycle-list-heading">
          <div>
            <h2>{tab === 'nursery' ? 'Nursery batches' : 'Pond batches'}</h2>
            <small>
              {tab === 'nursery'
                ? 'Original nursery records and transfer history'
                : 'Pond A and Pond B records in one view'}
            </small>
          </div>
          <span className="badge badge-ocean">{rows.length} records</span>
        </div>
        <div className="table-container">
          <table className="fms-table">
            <thead>
              <tr>
                <th>Cycle</th>
                <th>Fish Name</th>
                <th>Pond</th>
                <th>Stage date</th>
                <th>Weight</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const { cycle } = row;
                const canShift = row.pond === 'Nursery' && cycle.status === 'nursery-pending';
                const wasShifted = row.pond === 'Nursery' && cycle.status !== 'nursery-pending';
                const canHarvest = row.pond === 'Pond B' && cycle.status === 'pond-b-pending';
                return (
                  <tr key={`${cycle.id}-${row.pond}-${index}`}>
                    <td>
                      <strong>{cycle.id}</strong>
                      <div className="cycle-note">{cycle.note}</div>
                    </td>
                    <td>
                      <strong>{cycle.fishName || '—'}</strong>
                    </td>
                    <td>
                      <span className="badge badge-ocean">{row.pond}</span>
                    </td>
                    <td>{row.date || '—'}</td>
                    <td>
                      <strong>{Number(row.weight || 0).toLocaleString()} kg</strong>
                    </td>
                    <td>
                      <strong>{Number(row.qty || 0).toLocaleString()}</strong>
                    </td>
                    <td>
                      {canShift && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => setShiftCycle(cycle)}
                        >
                          <Shuffle size={14} /> Shift
                        </button>
                      )}
                      {wasShifted && <span className="badge badge-ocean">Shifted</span>}
                      {canHarvest && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => completePondB(cycle)}
                        >
                          <CheckCircle2 size={14} /> Complete / Harvest
                        </button>
                      )}
                      {!canShift && !wasShifted && !canHarvest && (
                        <span className="history-label">History saved</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <div className="modal-content fish-cycle-modal" onClick={(e) => e.stopPropagation()}>
            <ModalHeader title="New nursery cycle" close={() => setShowNew(false)} />
            <p className="modal-help">
              A unique cycle number will be generated for each new nursery batch.
            </p>
            <form className="fish-transfer-form" onSubmit={createCycle}>
              <Field label="Stocking date">
                <input
                  className="form-input"
                  type="date"
                  value={newForm.date}
                  onChange={(e) => setNewForm({ ...newForm, date: e.target.value })}
                  required
                />
              </Field>
              <Field label="Fish name / species">
                <input
                  className="form-input"
                  value={newForm.fishName}
                  onChange={(e) => setNewForm({ ...newForm, fishName: e.target.value })}
                  placeholder="e.g. Tilapia, Catfish"
                  required
                />
              </Field>
              <Field label="Initial weight (kg)">
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  value={newForm.weight}
                  onChange={(e) => setNewForm({ ...newForm, weight: e.target.value })}
                  required
                />
              </Field>
              <Field label="Fish count">
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  value={newForm.fishCount}
                  onChange={(e) => setNewForm({ ...newForm, fishCount: e.target.value })}
                />
              </Field>
              <Field label="Notes" wide>
                <input
                  className="form-input"
                  value={newForm.note}
                  onChange={(e) => setNewForm({ ...newForm, note: e.target.value })}
                  placeholder="Batch details..."
                />
              </Field>
              <ModalActions cancel={() => setShowNew(false)} submit="Create cycle" />
            </form>
          </div>
        </div>
      )}
      {shiftCycle && (
        <div className="modal-overlay" onClick={() => setShiftCycle(null)}>
          <div className="modal-content fish-cycle-modal" onClick={(e) => e.stopPropagation()}>
            <ModalHeader title={`Shift ${shiftCycle.id}`} close={() => setShiftCycle(null)} />
            <div className="shift-summary">
              <span>Nursery</span>
              <ArrowRight size={18} />
              <strong>Pond A + Pond B</strong>
            </div>
            <p className="modal-help">
              Enter the measured weight and transfer date. Fish quantity will remain balanced across
              both ponds.
            </p>
            <form className="fish-transfer-form" onSubmit={completeShift}>
              <Field label="Date of shifting">
                <input
                  className="form-input"
                  type="date"
                  value={shiftForm.date}
                  onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })}
                  required
                />
              </Field>
              <Field label="Total weight of fish (kg)">
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={shiftForm.totalWeight}
                  onChange={(e) => {
                    const totalWeight = e.target.value;
                    const half = (Number(totalWeight) || 0) / 2;
                    setShiftForm({
                      ...shiftForm,
                      totalWeight,
                      pondAWeight: String(half),
                      pondBWeight: String(half),
                    });
                  }}
                  required
                />
              </Field>
              <Field label="Total qty of fish">
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  value={shiftForm.totalQty}
                  onChange={(e) => {
                    const totalQty = e.target.value;
                    const half = Math.floor((Number(totalQty) || 0) / 2);
                    setShiftForm({
                      ...shiftForm,
                      totalQty,
                      pondAQty: String(half),
                      pondBQty: String((Number(totalQty) || 0) - half),
                    });
                  }}
                  required
                />
              </Field>
              <div className="split-pond-fields field-wide">
                <div className="split-pond-card">
                  <h3>Pond A</h3>
                  <Field label="Weight of fish (kg)">
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={shiftForm.pondAWeight}
                      onChange={(e) => setSplitValue('pondAWeight', e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Qty of fish">
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      value={shiftForm.pondAQty}
                      onChange={(e) => setSplitValue('pondAQty', e.target.value)}
                      required
                    />
                  </Field>
                </div>
                <div className="split-pond-card">
                  <h3>Pond B</h3>
                  <Field label="Weight of fish (kg)">
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={shiftForm.pondBWeight}
                      onChange={(e) => setSplitValue('pondBWeight', e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Qty of fish">
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      value={shiftForm.pondBQty}
                      onChange={(e) => setSplitValue('pondBQty', e.target.value)}
                      required
                    />
                  </Field>
                </div>
              </div>
              <Field label="Note / Remark" wide>
                <textarea
                  className="form-textarea"
                  value={shiftForm.note}
                  onChange={(e) => setShiftForm({ ...shiftForm, note: e.target.value })}
                  placeholder="Growth, health or batch notes..."
                  rows="3"
                />
              </Field>
              <ModalActions cancel={() => setShiftCycle(null)} submit="Confirm shift" />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
function Field({ label, children, wide }) {
  return (
    <label className={`form-label${wide ? ' field-wide' : ''}`}>
      {label}
      {children}
    </label>
  );
}
function ModalHeader({ title, close }) {
  return (
    <div className="modal-header-row">
      <div>
        <div className="eyebrow">Cycle management</div>
        <h2>{title}</h2>
      </div>
      <button className="btn btn-secondary" type="button" onClick={close}>
        <X size={16} /> Close
      </button>
    </div>
  );
}
function ModalActions({ cancel, submit }) {
  return (
    <div className="modal-actions">
      <button
        className="btn btn-secondary"
        type="button"
        onClick={cancel}
        style={{ flexShrink: 0, minWidth: '90px', whiteSpace: 'nowrap' }}
      >
        Cancel
      </button>
      <button className="btn btn-primary" type="submit" style={{ minWidth: 0, textAlign: 'center' }}>
        <CheckCircle2 size={16} /> {submit}
      </button>
    </div>
  );
}
