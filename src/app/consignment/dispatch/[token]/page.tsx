'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface DispatchItem {
  id: number;
  quantity: number;
  received_ok?: boolean | null;
  received_qty?: number | null;
  observation?: string | null;
  reference: string;
  description?: string | null;
  color: string;
  size: string;
  image_url?: string | null;
}

interface ReceptionRow {
  id: number;
  received_ok: boolean;
  received_qty: number;
  observation: string;
}

interface DispatchView {
  id: number;
  dispatch_number: string;
  status: 'PENDIENTE' | 'EN_TRANSITO' | 'RECIBIDO' | 'CANCELADO';
  sent_at?: string | null;
  received_at?: string | null;
  received_by?: string | null;
  notes?: string | null;
  warehouse: {
    id: number;
    name: string;
    customer_name: string;
  };
  items: DispatchItem[];
}

export default function DispatchConfirmPage() {
  const params = useParams();
  const token = params?.token as string;

  const [dispatch, setDispatch] = useState<DispatchView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [receivedBy, setReceivedBy] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [receptionRows, setReceptionRows] = useState<ReceptionRow[]>([]);

  const fetchDispatch = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/consignment/dispatches/by-token/${token}`);
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `Error ${res.status}`);
      }
      const data = (await res.json()) as DispatchView;
      setDispatch(data);
      if (data.status === 'RECIBIDO') {
        setConfirmed(true);
      } else if (data.status === 'EN_TRANSITO') {
        setReceptionRows(
          data.items.map((it) => ({
            id: it.id,
            received_ok: true,
            received_qty: it.quantity,
            observation: '',
          })),
        );
      }
    } catch (err: any) {
      setError(err.message || 'No se pudo cargar el despacho.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDispatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivedBy.trim()) return;
    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/api/consignment/dispatches/by-token/${token}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          received_by: receivedBy.trim(),
          items: receptionRows.map((r) => ({
            id: r.id,
            received_ok: r.received_ok,
            received_qty: r.received_qty,
            observation: r.observation || undefined,
          })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Error ${res.status}`);
      }
      setConfirmed(true);
      await fetchDispatch();
    } catch (err: any) {
      setError(err.message || 'No se pudo confirmar la recepción.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main style={{ maxWidth: 600, margin: '3rem auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <p>Cargando despacho...</p>
      </main>
    );
  }

  if (error && !dispatch) {
    return (
      <main style={{ maxWidth: 600, margin: '3rem auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ color: '#dc2626' }}>Error</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!dispatch) return null;

  const totalUnits = dispatch.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <main
      style={{
        maxWidth: 640,
        margin: '2rem auto',
        padding: '1.5rem',
        fontFamily: 'system-ui, sans-serif',
        color: '#1a202c',
      }}
    >
      <header style={{ borderBottom: '2px solid #f0b429', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Two Six — Despacho en Consignación</h1>
        <p style={{ margin: '0.25rem 0 0', color: '#4a5568', fontSize: '0.9rem' }}>
          Nº {dispatch.dispatch_number}
        </p>
      </header>

      <section style={{ marginBottom: '1.5rem' }}>
        <p style={{ margin: '0.25rem 0' }}>
          <strong>Cliente:</strong> {dispatch.warehouse.customer_name}
        </p>
        <p style={{ margin: '0.25rem 0' }}>
          <strong>Bodega:</strong> {dispatch.warehouse.name}
        </p>
        {dispatch.sent_at && (
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Enviado:</strong> {new Date(dispatch.sent_at).toLocaleDateString()}
          </p>
        )}
        {dispatch.notes && (
          <p style={{ margin: '0.5rem 0', fontStyle: 'italic', color: '#4a5568' }}>“{dispatch.notes}”</p>
        )}
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          Contenido ({dispatch.items.length} referencias · {totalUnits} unidades)
        </h2>
        {dispatch.items.map((it, idx) => {
          const row = receptionRows.find((r) => r.id === it.id);
          const isEditable = dispatch.status === 'EN_TRANSITO' && row;
          const qtyMismatch = row && row.received_qty !== it.quantity;

          return (
            <div
              key={it.id}
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
                padding: '0.75rem',
                borderBottom: '1px solid #edf2f7',
                background: confirmed && it.received_ok === false ? '#fff5f5' : 'transparent',
              }}
            >
              {/* Checkbox */}
              {isEditable && (
                <input
                  type="checkbox"
                  checked={row.received_ok}
                  onChange={(e) => {
                    const next = [...receptionRows];
                    next[idx] = { ...next[idx], received_ok: e.target.checked };
                    if (e.target.checked && next[idx].received_qty !== it.quantity) {
                      next[idx].received_qty = it.quantity;
                    }
                    setReceptionRows(next);
                  }}
                  style={{ width: 20, height: 20, marginTop: 14, cursor: 'pointer', accentColor: '#f0b429', flexShrink: 0 }}
                />
              )}
              {confirmed && (
                <span style={{ fontSize: '1.2rem', marginTop: 12, flexShrink: 0 }}>
                  {it.received_ok ? '✅' : '⚠️'}
                </span>
              )}

              {/* Image */}
              {it.image_url && (
                <img
                  src={it.image_url}
                  alt={it.reference}
                  style={{ width: 56, height: 56, borderRadius: 6, objectFit: 'cover', background: '#f1f1f3', flexShrink: 0 }}
                />
              )}

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>
                  {it.reference} — {it.color} · {it.size}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#4a5568' }}>
                  Enviado: <strong>{it.quantity}</strong>
                  {confirmed && it.received_qty != null && (
                    <span style={{ marginLeft: 8, color: it.received_qty === it.quantity ? '#065f46' : '#dc2626' }}>
                      | Recibido: <strong>{it.received_qty}</strong>
                    </span>
                  )}
                </div>

                {/* Editable fields */}
                {isEditable && !row.received_ok && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.8rem', color: '#4a5568' }}>
                      Recibí:
                      <input
                        type="number"
                        min={0}
                        max={it.quantity * 2}
                        value={row.received_qty}
                        onChange={(e) => {
                          const next = [...receptionRows];
                          next[idx] = { ...next[idx], received_qty: parseInt(e.target.value) || 0 };
                          setReceptionRows(next);
                        }}
                        style={{
                          width: 60, marginLeft: 4, padding: '0.3rem',
                          border: '1px solid #cbd5e0', borderRadius: 4,
                          textAlign: 'center',
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Observación..."
                      value={row.observation}
                      onChange={(e) => {
                        const next = [...receptionRows];
                        next[idx] = { ...next[idx], observation: e.target.value };
                        setReceptionRows(next);
                      }}
                      style={{
                        flex: 1, minWidth: 120, padding: '0.3rem 0.5rem',
                        border: '1px solid #cbd5e0', borderRadius: 4,
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                )}

                {/* Show observation if confirmed */}
                {confirmed && it.observation && (
                  <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: '#92400e', fontStyle: 'italic' }}>
                    Obs: {it.observation}
                  </div>
                )}
              </div>

              {/* Quantity badge */}
              <div style={{
                fontWeight: 700, fontSize: '1.1rem', color: '#1a202c',
                minWidth: 30, textAlign: 'right', marginTop: 12,
              }}>
                {isEditable ? row.received_qty : it.quantity}
              </div>
            </div>
          );
        })}
      </section>

      {confirmed ? (
        <section
          style={{
            padding: '1.5rem',
            background: '#d1fae5',
            border: '1px solid #065f46',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ margin: 0, color: '#065f46' }}>✓ Recepción confirmada</h2>
          {dispatch.received_at && (
            <p style={{ margin: '0.5rem 0 0', color: '#065f46', fontSize: '0.9rem' }}>
              {new Date(dispatch.received_at).toLocaleString()}
              {dispatch.received_by && ` · Recibió: ${dispatch.received_by}`}
            </p>
          )}
        </section>
      ) : dispatch.status === 'CANCELADO' ? (
        <section style={{ padding: '1rem', background: '#fee2e2', border: '1px solid #991b1b', borderRadius: '8px' }}>
          <p style={{ margin: 0, color: '#991b1b' }}>
            Este despacho fue cancelado y no puede confirmarse.
          </p>
        </section>
      ) : dispatch.status !== 'EN_TRANSITO' ? (
        <section style={{ padding: '1rem', background: '#fef3c7', border: '1px solid #92400e', borderRadius: '8px' }}>
          <p style={{ margin: 0, color: '#92400e' }}>
            Este despacho aún no ha sido enviado por Two Six.
          </p>
        </section>
      ) : (
        <form
          onSubmit={handleConfirm}
          style={{ padding: '1.5rem', background: '#f7fafc', border: '1px solid #cbd5e0', borderRadius: '8px' }}
        >
          <h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>Confirmar recepción</h2>
          <p style={{ fontSize: '0.9rem', color: '#4a5568' }}>
            Verifica que recibiste todas las prendas listadas arriba. Al confirmar, Two Six marcará este
            despacho como recibido en su sistema.
          </p>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            Tu nombre *
          </label>
          <input
            type="text"
            value={receivedBy}
            onChange={(e) => setReceivedBy(e.target.value)}
            required
            placeholder="Nombre de quien recibe"
            style={{
              width: '100%',
              padding: '0.6rem',
              fontSize: '1rem',
              border: '1px solid #cbd5e0',
              borderRadius: '6px',
              marginBottom: '1rem',
            }}
          />
          {error && (
            <p style={{ color: '#dc2626', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting || !receivedBy.trim()}
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#1a202c',
              background: submitting ? '#cbd5e0' : '#f0b429',
              border: 'none',
              borderRadius: '6px',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Confirmando...' : 'Confirmar recepción'}
          </button>
        </form>
      )}
    </main>
  );
}
