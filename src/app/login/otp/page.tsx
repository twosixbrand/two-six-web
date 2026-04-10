'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function OtpForm() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState<string | null>(null);
    const router = useRouter();
    const { login } = useAuth();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const storedEmail = sessionStorage.getItem('pendingOtpEmail');
        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            router.push('/login');
        }
    }, [router]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [email]);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (otp[index] === '' && index > 0) {
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                inputRefs.current[index - 1]?.focus();
            } else {
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
        if (pastedData) {
            const newOtp = [...otp];
            for (let i = 0; i < pastedData.length; i++) {
                newOtp[i] = pastedData[i];
            }
            setOtp(newOtp);
            const focusIndex = Math.min(pastedData.length, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const completeOtp = otp.join('');
        if (completeOtp.length < 6) {
            setError('Por favor, ingresa los 6 dígitos');
            return;
        }

        setLoading(true);
        setError('');

        if (!email) {
            setError('Correo no encontrado. Vuelve a iniciar sesión.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/customer/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp: completeOtp }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'El código es incorrecto o ha expirado');
            }

            const data = await response.json();
            login(data.accessToken, data.customer);

            sessionStorage.removeItem('pendingOtpEmail');
            const prevPath = sessionStorage.getItem('preLoginPath');
            if (prevPath) {
                sessionStorage.removeItem('preLoginPath');
                router.push(prevPath);
            } else {
                router.push('/');
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocurrió un error al verificar el PIN');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return null;
    }

    return (
        <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20 relative z-10 transition-all duration-500 hover:shadow-accent/10">
            <div className="text-center">
                <h2 className="text-4xl font-serif font-bold tracking-tight text-primary">
                    Verificar Código
                </h2>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    Hemos enviado un código seguro de 6 dígitos a tu correo <br />
                    <span className="font-semibold text-primary">{email}</span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-8">
                <div>
                    <label className="sr-only">Código OTP</label>
                    <div className="flex justify-between gap-2" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className={`w-12 h-14 text-center text-2xl font-bold rounded-xl outline-none transition-all
                                    ${digit ? 'bg-primary text-secondary border border-primary ring-2 ring-primary/20 scale-105 shadow-md' : 'bg-white/50 text-primary border border-border focus:border-accent focus:ring-1 focus:ring-accent'}
                                `}
                            />
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg text-center animate-in fade-in zoom-in duration-300">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold tracking-wider uppercase text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                Verificando...
                            </span>
                        ) : (
                            'Completar Registro'
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push('/login')}
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:underline"
                    >
                        ¿No recibiste el código? Intentar de nuevo
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function OtpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary/20 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-secondary/20 py-12">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            </div>
        }>
            <OtpForm />
        </Suspense>
        </div>
    );
}
