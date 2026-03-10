// src/pages/links.tsx
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LinksPage() {
  const [mounted, setMounted] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const colors = {
    bg: '#F7F5F0',       
    accent: '#C09549',   
    primary: '#000000',  
    white: '#FFFFFF',
    border: 'rgba(192, 149, 73, 0.2)', 
  };

  return (
    <div style={{ 
      backgroundColor: colors.bg, 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px 20px',
      fontFamily: "'Inter', sans-serif",
      boxSizing: 'border-box',
      WebkitTapHighlightColor: 'transparent'
    }}>
      <Head>
        <title>Two Six | Official Links</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      {/* WRAPPER PRINCIPAL */}
      <div style={{ 
        width: '100%', 
        maxWidth: '420px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        
        {/* HEADER SECTION - CENTRADO ABSOLUTO */}
        <header style={{ 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center',
          marginBottom: '50px' 
        }}>
          <Link href="/" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            width: '100%',
            textDecoration: 'none',
            marginBottom: '24px'
          }}>
            {!logoError ? (
              <img
                src="/logo.png"
                alt="Two Six Logo"
                style={{ 
                  width: '160px', 
                  height: 'auto', 
                  display: 'block',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.05))' 
                }}
                onError={() => setLogoError(true)}
              />
            ) : (
              <div style={{ fontSize: '30px', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', color: colors.primary }}>
                TWO SIX
              </div>
            )}
          </Link>
          
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '8px 20px', 
            border: `1px solid ${colors.accent}44`, 
            borderRadius: '100px', 
            backgroundColor: `${colors.accent}08`,
          }}>
            <span style={{ 
              fontSize: '11px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.35em', 
              fontWeight: 800,
              textAlign: 'center',
              background: 'linear-gradient(90deg, #FF0000 0%, #FF8A00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'block'
            }}>
              Crafted for real ones
            </span>
          </div>
        </header>

        {/* MARCO PREMIUM (THE VESSEL) */}
        <main style={{ 
          width: '100%', 
          padding: '24px', 
          backgroundColor: 'rgba(255,255,255,0.45)', 
          border: `1px solid ${colors.border}`, 
          borderRadius: '32px', 
          boxShadow: '0 20px 40px rgba(192, 149, 73, 0.08)',
          boxSizing: 'border-box'
        }}>
          
          {/* TIENDA OFICIAL */}
          <Link 
            href="/" 
            className="card-hover"
            style={{ 
              display: 'flex', alignItems: 'center', width: '100%', padding: '16px 18px', marginBottom: '12px',
              borderRadius: '18px', textDecoration: 'none', backgroundColor: colors.primary, color: colors.white,
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)', boxSizing: 'border-box'
            }}
          >
            <div style={{ backgroundColor: `${colors.accent}44`, padding: '8px', borderRadius: '12px', marginRight: '14px', display: 'flex' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <span style={{ flexGrow: 1, textAlign: 'center', marginRight: '32px', fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Tienda Oficial
            </span>
          </Link>

          {/* WHATSAPP */}
          <a 
            href="https://wa.me/3108777629" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="card-hover"
            style={{ 
              display: 'flex', alignItems: 'center', width: '100%', padding: '16px 18px', marginBottom: '12px',
              borderRadius: '18px', textDecoration: 'none', backgroundColor: colors.white, color: colors.primary,
              border: '1px solid rgba(0,0,0,0.03)', boxSizing: 'border-box'
            }}
          >
            <div style={{ backgroundColor: `${colors.accent}08`, padding: '8px', borderRadius: '12px', marginRight: '14px', display: 'flex' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <span style={{ flexGrow: 1, textAlign: 'center', marginRight: '32px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              WhatsApp Directo
            </span>
          </a>

          {/* FACEBOOK */}
          <a 
            href="https://www.facebook.com/share/1Tu9Bk7SCj/?mibextid=wwXIfr" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="card-hover"
            style={{ 
              display: 'flex', alignItems: 'center', width: '100%', padding: '16px 18px', marginBottom: '12px',
              borderRadius: '18px', textDecoration: 'none', backgroundColor: colors.white, color: colors.primary,
              border: '1px solid rgba(0,0,0,0.03)', boxSizing: 'border-box'
            }}
          >
            <div style={{ backgroundColor: `${colors.accent}08`, padding: '8px', borderRadius: '12px', marginRight: '14px', display: 'flex' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </div>
            <span style={{ flexGrow: 1, textAlign: 'center', marginRight: '32px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Facebook Oficial
            </span>
          </a>

          {/* TRACKING */}
          <Link 
            href="/tracking" 
            className="card-hover"
            style={{ 
              display: 'flex', alignItems: 'center', width: '100%', padding: '16px 18px',
              borderRadius: '18px', textDecoration: 'none', backgroundColor: colors.white, color: colors.primary,
              border: '1px solid rgba(0,0,0,0.03)', boxSizing: 'border-box'
            }}
          >
            <div style={{ backgroundColor: `${colors.accent}08`, padding: '8px', borderRadius: '12px', marginRight: '14px', display: 'flex' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16h6"/><path d="M19 16v6"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>
            </div>
            <span style={{ flexGrow: 1, textAlign: 'center', marginRight: '40px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Rastrear Pedido
            </span>
          </Link>

        </main>

        {/* FOOTER */}
        <footer style={{ marginTop: '50px', opacity: 0.5, textAlign: 'center' }}>
          <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.25em', color: colors.accent, margin: 0 }}>
            Two Six S.A.S. &copy; 2026 &bull; Col
          </p>
        </footer>

      </div>

      <style jsx>{`
        .card-hover { transition: all 0.2s ease-out; }
        .card-hover:active { transform: scale(0.97); opacity: 0.9; }
        header, main, footer {
          animation: fadeIn 1s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
