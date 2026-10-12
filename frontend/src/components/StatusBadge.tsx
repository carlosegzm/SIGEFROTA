import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Truck } from 'lucide-react';

interface StatusBadgeProps {
  status: string | boolean;
  type?: 'vehicle' | 'driver' | 'document';
}

export function StatusBadge({ status, type = 'vehicle' }: StatusBadgeProps) {
  if (type === 'driver') {
    if (status === true || status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
          <CheckCircle2 size={14}/> Ativo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
        <AlertCircle size={14}/> Inativo
      </span>
    );
  }

  if (type === 'document') {
    if (status === 'OK') {
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200"><CheckCircle2 size={14}/> Regular</span>;
    }
    if (status === 'WARNING') {
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200"><AlertTriangle size={14}/> Vence em breve</span>;
    }
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200"><AlertCircle size={14}/> Vencido</span>;
  }

  // vehicle
  if (status === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
        <CheckCircle2 size={14}/> Ativo
      </span>
    );
  }
  if (status === 'IN_MAINTENANCE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
        <Truck size={14}/> Manutenção
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
      <AlertCircle size={14}/> Inativo
    </span>
  );
}
