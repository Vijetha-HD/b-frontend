import {
    Truck,
    Zap,
    Package,
    Globe
} from 'lucide-react';

export const COURIER_PARTNERS = [
    { id: 'dl', name: 'Delhivery', icon: Truck, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'bd', name: 'BlueDart', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'ee', name: 'Ecom Express', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'fx', name: 'FedEx', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' }
];

export const STAGES = ['Received', 'Cleaning', 'Testing', 'Repairing', 'Certified'];
