'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface StockItem {
  id_clothing_size: number;
  quantity: number;
  unit_price?: number;
  clothingSize: {
    size: { name: string };
    product?: { id: number; price: number };
    clothingColor: {
      color: { name: string };
      imageClothing?: { image_url: string }[];
      design: { reference: string; description?: string };
    };
  };
}

const formatCOP = (n: number) =>
  (n ?? 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

interface Warehouse {
  id: number;
  name: string;
  stocks: StockItem[];
}

interface SellReport {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  rejected_reason?: string;
  createdAt: string;
  warehouse: { id: number; name: string };
  items: {
    id: number;
    quantity: number;
    clothingSize: {
      size: { name: string };
      clothingColor: {
        color: { name: string };
        imageClothing?: { image_url: string }[];
        design: { reference: string };
      };
    };
  }[];
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pendiente', color: '#92400e', bg: '#fef3c7' },
  APPROVED: { label: 'Aprobado', color: '#065f46', bg: '#d1fae5' },
  REJECTED: { label: 'Rechazado', color: '#991b1b', bg: '#fee2e2' },
};

export default function MySalesPage() {
  const { isLoggedIn, isConsignmentAlly, userName, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<'stock' | 'report' | 'history' | 'payments'>('stock');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [reports, setReports] = useState<SellReport[]>([]);
  const [unpaidOrders, setUnpaidOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario de reporte
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [sellItems, setSellItems] = useState<{ id_clothing_size: number; quantity: number; label: string; max: number; unit_price: number }[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Payment form
  const [payOrderId, setPayOrderId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'TRANSFERENCIA' | 'EFECTIVO' | 'OTRO'>('TRANSFERENCIA');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payFile, setPayFile] = useState<File | null>(null);
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [payMessage, setPayMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('customerToken') : null;

  useEffect(() => {
    if (!authLoading && (!isLoggedIn || !isConsignmentAlly)) {
      router.push('/login');
    }
  }, [authLoading, isLoggedIn, isConsignmentAlly, router]);

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [stockRes, reportsRes, unpaidRes, paymentsRes] = await Promise.all([
        fetch(`${API_URL}/api/consignment/sell-reports/my-stock`, { headers }),
        fetch(`${API_URL}/api/consignment/sell-reports/my-reports`, { headers }),
        fetch(`${API_URL}/api/consignment/payments/my-unpaid`, { headers }),
        fetch(`${API_URL}/api/consignment/payments/my-payments`, { headers }),
      ]);
      if (stockRes.ok) setWarehouses(await stockRes.json());
      if (reportsRes.ok) setReports(await reportsRes.json());
      if (unpaidRes.ok) setUnpaidOrders(await unpaidRes.json());
      if (paymentsRes.ok) setPayments(await paymentsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && isConsignmentAlly && token) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, isConsignmentAlly, token]);

  const selectedWh = warehouses.find((w) => String(w.id) === selectedWarehouse);

  const getImg = (item: any) =>
    item.clothingSize?.clothingColor?.imageClothing?.[0]?.image_url ?? null;
  const getLabel = (item: any) => {
    const ref = item.clothingSize?.clothingColor?.design?.reference || '';
    const color = item.clothingSize?.clothingColor?.color?.name || '';
    const size = item.clothingSize?.size?.name || '';
    return `${ref} — ${color} · ${size}`;
  };

  const addSellItem = (stock: StockItem) => {
    if (sellItems.some((s) => s.id_clothing_size === stock.id_clothing_size)) return;
    const price = (stock as any).unit_price ?? stock.clothingSize?.product?.price ?? 0;
    setSellItems([
      ...sellItems,
      { id_clothing_size: stock.id_clothing_size, quantity: 1, label: getLabel(stock), max: stock.quantity, unit_price: price },
    ]);
  };

  const updateSellQty = (idx: number, qty: number) => {
    const item = sellItems[idx];
    const capped = Math.min(Math.max(0, qty), item.max);
    const next = [...sellItems];
    next[idx] = { ...next[idx], quantity: capped };
    setSellItems(next);
  };

  const removeSellItem = (idx: number) => {
    setSellItems(sellItems.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!selectedWarehouse) { setMessage({ type: 'error', text: 'Selecciona una bodega.' }); return; }
    if (sellItems.length === 0) { setMessage({ type: 'error', text: 'Agrega al menos un producto.' }); return; }
    if (sellItems.some((s) => s.quantity <= 0)) { setMessage({ type: 'error', text: 'Todas las cantidades deben ser mayores a 0.' }); return; }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/api/consignment/sell-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id_warehouse: Number(selectedWarehouse),
          notes: notes || undefined,
          items: sellItems.map((s) => ({
            id_clothing_size: s.id_clothing_size,
            quantity: s.quantity,
          })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Error al enviar el reporte.');
      }
      setMessage({ type: 'success', text: 'Reporte enviado correctamente. Two Six lo revisará pronto.' });
      setSellItems([]);
      setNotes('');
      setTab('history');
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-center text-gray-500">Cargando...</p>
      </main>
    );
  }

  if (!isLoggedIn || !isConsignmentAlly) return null;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Consignación</h1>
      <p className="text-gray-500 text-sm mb-6">
        Hola {userName?.split(' ')[0]}. Desde aquí puedes reportar tus ventas de productos en consignación.
      </p>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { key: 'stock', label: 'Mi Stock' },
          { key: 'report', label: 'Reportar Venta' },
          { key: 'history', label: `Mis Reportes (${reports.length})` },
          { key: 'payments', label: `Mis Pagos${unpaidOrders.length > 0 ? ` (${unpaidOrders.length} pend.)` : ''}` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              tab === t.key
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Mi Stock */}
      {tab === 'stock' && (
        <div>
          {warehouses.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No tienes stock en consignación.</p>
          ) : (
            warehouses.map((wh) => (
              <div key={wh.id} className="mb-6">
                <h3 className="font-semibold text-lg mb-2">{wh.name}</h3>
                {wh.stocks.length === 0 ? (
                  <p className="text-gray-400 text-sm">Sin stock en esta bodega.</p>
                ) : (
                  <div className="grid gap-2 mb-2">
                    {wh.stocks.map((s) => {
                      const price = (s as any).unit_price ?? s.clothingSize?.product?.price ?? 0;
                      const total = price * s.quantity;
                      return (
                      <div
                        key={s.id_clothing_size}
                        className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg"
                      >
                        {getImg(s) && (
                          <img src={getImg(s)!} alt="" className="w-12 h-12 rounded object-cover bg-gray-100" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{getLabel(s)}</p>
                          <p className="text-xs text-gray-400">Precio: {formatCOP(price)}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-lg">{s.quantity}</span>
                          <p className="text-xs text-gray-500">{formatCOP(total)}</p>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Reportar Venta */}
      {tab === 'report' && (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bodega</label>
              <select
                value={selectedWarehouse}
                onChange={(e) => {
                  setSelectedWarehouse(e.target.value);
                  setSellItems([]);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Selecciona...</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            {selectedWh && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Productos vendidos ({sellItems.length})
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  Toca un producto de tu stock para agregarlo al reporte.
                </p>

                {/* Stock clickeable */}
                <div className="grid gap-1 mb-4">
                  {selectedWh.stocks.map((s) => {
                    const added = sellItems.some((si) => si.id_clothing_size === s.id_clothing_size);
                    return (
                      <button
                        key={s.id_clothing_size}
                        type="button"
                        onClick={() => addSellItem(s)}
                        disabled={added}
                        className={`flex items-center gap-2 p-2 rounded-lg text-left text-sm border transition ${
                          added
                            ? 'border-amber-300 bg-amber-50 opacity-60 cursor-not-allowed'
                            : 'border-gray-200 hover:border-amber-400 hover:bg-amber-50 cursor-pointer'
                        }`}
                      >
                        {getImg(s) && (
                          <img src={getImg(s)!} alt="" className="w-8 h-8 rounded object-cover bg-gray-100" />
                        )}
                        <span className="flex-1">{getLabel(s)}</span>
                        <span className="text-gray-400 text-xs">{formatCOP((s as any).unit_price ?? 0)} · Stock: {s.quantity}</span>
                        {added && <span className="text-amber-600 text-xs font-medium">Agregado</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Items seleccionados con cantidad editable */}
                {sellItems.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">Cantidades vendidas:</p>
                    {sellItems.map((item, idx) => (
                      <div key={item.id_clothing_size} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <span className="flex-1 text-sm">{item.label}</span>
                        <span className="text-xs text-gray-400">{formatCOP(item.unit_price)}</span>
                        <input
                          type="number"
                          min={1}
                          max={item.max}
                          value={item.quantity}
                          onChange={(e) => updateSellQty(idx, parseInt(e.target.value) || 0)}
                          className="w-16 border border-gray-300 rounded px-2 py-1 text-center text-sm"
                        />
                        <span className="text-xs text-gray-500 w-20 text-right">{formatCOP(item.unit_price * item.quantity)}</span>
                        <button
                          type="button"
                          onClick={() => removeSellItem(idx)}
                          className="text-red-400 hover:text-red-600 text-sm px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {sellItems.length > 0 && (
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                        <span className="text-sm font-medium">Subtotal</span>
                        <span className="font-bold">{formatCOP(sellItems.reduce((s, i) => s + i.unit_price * i.quantity, 0))}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Ventas de la semana del 14 al 20 de abril"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {message && (
              <p className={`text-sm font-medium ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || sellItems.length === 0}
              className="w-full bg-amber-500 text-white font-semibold py-3 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting
                ? 'Enviando...'
                : `Enviar reporte (${sellItems.reduce((s, i) => s + i.quantity, 0)} uds · ${formatCOP(sellItems.reduce((s, i) => s + i.unit_price * i.quantity, 0))})`}
            </button>
          </div>
        </form>
      )}

      {/* Tab: Historial */}
      {tab === 'history' && (
        <div>
          {reports.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No has enviado reportes aún.</p>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => {
                const st = STATUS_LABELS[r.status];
                const totalQty = r.items.reduce((s, i) => s + i.quantity, 0);
                return (
                  <div key={r.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium text-sm">{r.warehouse.name}</span>
                        <span className="text-xs text-gray-400 ml-2">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: st.color, background: st.bg }}
                      >
                        {st.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {r.items.length} ref. · {totalQty} uds
                      {r.notes && ` — ${r.notes}`}
                    </p>
                    {r.status === 'REJECTED' && r.rejected_reason && (
                      <p className="text-sm text-red-600 italic">
                        Motivo: {r.rejected_reason}
                      </p>
                    )}
                    <div className="grid gap-1 mt-2">
                      {r.items.map((it) => (
                        <div key={it.id} className="flex items-center gap-2 text-xs text-gray-600">
                          {getImg(it) && (
                            <img src={getImg(it)!} alt="" className="w-6 h-6 rounded object-cover bg-gray-100" />
                          )}
                          <span>{getLabel(it)}</span>
                          <span className="ml-auto font-medium">{it.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Mis Pagos */}
      {tab === 'payments' && (
        <div>
          {/* Órdenes pendientes de pago */}
          {unpaidOrders.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Facturas pendientes de pago</h3>
              <div className="space-y-2">
                {unpaidOrders.map((o: any) => {
                  const paidAmount = (o.consignmentPayments || [])
                    .filter((p: any) => p.status === 'APPROVED')
                    .reduce((s: number, p: any) => s + p.amount, 0);
                  const pending = o.total_payment - paidAmount;
                  return (
                    <div key={o.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{o.order_reference}</p>
                        <p className="text-xs text-gray-400">
                          {o.status === 'MERMA' ? 'Merma' : 'Sell-out'} · {new Date(o.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${pending.toLocaleString('es-CO')}</p>
                        <p className="text-xs text-gray-400">de ${o.total_payment.toLocaleString('es-CO')}</p>
                      </div>
                      <button
                        onClick={() => {
                          setPayOrderId(String(o.id));
                          setPayAmount(String(pending));
                          setPayMethod('TRANSFERENCIA');
                          setPayRef('');
                          setPayNotes('');
                          setPayFile(null);
                          setPayMessage(null);
                        }}
                        className="ml-3 px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition"
                      >
                        Pagar
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Formulario de pago (visible cuando selecciona una orden) */}
          {payOrderId && (
            <div className="mb-6 p-4 border border-amber-300 rounded-lg bg-amber-50">
              <h3 className="font-semibold mb-3">Registrar pago — Orden {unpaidOrders.find((o: any) => String(o.id) === payOrderId)?.order_reference}</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPayMessage(null);
                  if (!payAmount || parseFloat(payAmount) <= 0) {
                    setPayMessage({ type: 'error', text: 'Monto inválido.' });
                    return;
                  }
                  if (payMethod === 'TRANSFERENCIA' && !payFile) {
                    setPayMessage({ type: 'error', text: 'Adjunta el comprobante de transferencia.' });
                    return;
                  }
                  try {
                    setPaySubmitting(true);
                    const formData = new FormData();
                    formData.append('id_order', payOrderId);
                    formData.append('amount', payAmount);
                    formData.append('payment_method', payMethod);
                    if (payRef) formData.append('reference_number', payRef);
                    if (payNotes) formData.append('notes', payNotes);
                    if (payFile) formData.append('proof', payFile);

                    const res = await fetch(`${API_URL}/api/consignment/payments/upload`, {
                      method: 'POST',
                      headers: { Authorization: `Bearer ${token}` },
                      body: formData,
                    });
                    if (!res.ok) {
                      const body = await res.json().catch(() => ({}));
                      throw new Error(body.message || 'Error al registrar el pago.');
                    }
                    setPayMessage({ type: 'success', text: 'Pago registrado. Two Six lo verificará pronto.' });
                    setPayOrderId('');
                    fetchData();
                  } catch (err: any) {
                    setPayMessage({ type: 'error', text: err.message });
                  } finally {
                    setPaySubmitting(false);
                  }
                }}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Monto (COP)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Medio de pago</label>
                    <select
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value as any)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="TRANSFERENCIA">Transferencia bancaria</option>
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>
                </div>

                {payMethod === 'TRANSFERENCIA' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Número de referencia</label>
                      <input
                        type="text"
                        value={payRef}
                        onChange={(e) => setPayRef(e.target.value)}
                        placeholder="Ej: 2026041700123"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Comprobante de transferencia *</label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setPayFile(e.target.files?.[0] || null)}
                        className="w-full text-sm"
                      />
                      {payFile && (
                        <p className="text-xs text-green-600 mt-1">{payFile.name} ({(payFile.size / 1024).toFixed(0)} KB)</p>
                      )}
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Notas (opcional)</label>
                  <input
                    type="text"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    placeholder="Observaciones adicionales"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                {payMessage && (
                  <p className={`text-sm font-medium ${payMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                    {payMessage.text}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPayOrderId('')}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={paySubmitting}
                    className="flex-1 bg-amber-500 text-white font-semibold py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition"
                  >
                    {paySubmitting ? 'Enviando...' : 'Registrar pago'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Historial de pagos */}
          <h3 className="font-semibold text-lg mb-2">Historial de pagos</h3>
          {payments.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No has registrado pagos aún.</p>
          ) : (
            <div className="space-y-2">
              {payments.map((p: any) => {
                const st = STATUS_LABELS[p.status] || { label: p.status, color: '#000', bg: '#eee' };
                return (
                  <div key={p.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">
                        {p.order?.order_reference} — {p.payment_method === 'TRANSFERENCIA' ? 'Transferencia' : p.payment_method === 'EFECTIVO' ? 'Efectivo' : 'Otro'}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                      {p.status === 'REJECTED' && p.rejected_reason && (
                        <p className="text-xs text-red-500 italic mt-0.5">Motivo: {p.rejected_reason}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${p.amount.toLocaleString('es-CO')}</p>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: st.color, background: st.bg }}
                      >
                        {st.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
