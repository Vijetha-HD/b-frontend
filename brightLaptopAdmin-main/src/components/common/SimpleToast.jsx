import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// Custom event name
const TOAST_EVENT = 'show-toast';

// Toast helper to dispatch events
export const toast = {
    success: (message) => {
        window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { type: 'success', message } }));
    },
    error: (message) => {
        window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { type: 'error', message } }));
    },
    info: (message) => {
        window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { type: 'info', message } }));
    },
    warning: (message) => {
        window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { type: 'warning', message } }));
    }
};

const SimpleToast = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handleToastEvent = (event) => {
            const { type, message } = event.detail;
            const id = Date.now();
            setToasts((prev) => [...prev, { id, type, message }]);

            // Auto remove after 3 seconds
            setTimeout(() => {
                removeToast(id);
            }, 3000);
        };

        window.addEventListener(TOAST_EVENT, handleToastEvent);
        return () => window.removeEventListener(TOAST_EVENT, handleToastEvent);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle size={20} className="text-green-500" />;
            case 'error': return <AlertCircle size={20} className="text-red-500" />;
            case 'info': return <Info size={20} className="text-blue-500" />;
            case 'warning': return <AlertCircle size={20} className="text-yellow-500" />;
            default: return null;
        }
    };

    const getStyles = (type) => {
        switch (type) {
            case 'success': return 'bg-green-50 border-green-200 text-green-800';
            case 'error': return 'bg-red-50 border-red-200 text-red-800';
            case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            default: return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-in slide-in-from-right-full transition-all ${getStyles(t.type)}`}
                    style={{ minWidth: '300px' }}
                >
                    {getIcon(t.type)}
                    <p className="flex-1 text-sm font-medium">{t.message}</p>
                    <button onClick={() => removeToast(t.id)} className="text-slate-400 hover:text-slate-600">
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default SimpleToast;
