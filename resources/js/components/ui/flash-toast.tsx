import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, X, XCircle } from 'lucide-react';

export default function FlashToast() {
    const { props } = usePage<{ flash?: { success?: string; error?: string; warning?: string } }>();
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'success' | 'error' | 'warning'>('success');

    useEffect(() => {
        const success = props.flash?.success;
        const error = props.flash?.error;
        const warning = props.flash?.warning;
        if (success || error || warning) {
            setMessage(error ?? warning ?? success ?? '');
            setType(error ? 'error' : warning ? 'warning' : 'success');
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [props.flash]);

    if (!visible) return null;

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-xl border px-5 py-4 shadow-lg transition-all ${
                type === 'success'
                    ? 'border-brand-soft bg-white text-brand-navy'
                    : type === 'warning'
                      ? 'border-amber-200 bg-white text-amber-800'
                      : 'border-red-200 bg-white text-red-700'
            }`}
        >
            {type === 'success' ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-blue" />
            ) : type === 'warning' ? (
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
            ) : (
                <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
            )}
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
                onClick={() => setVisible(false)}
                className="ml-2 rounded p-0.5 text-slate-400 hover:text-slate-600"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
