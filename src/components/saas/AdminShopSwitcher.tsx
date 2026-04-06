import React, { useEffect, useState } from 'react';
import { Building2, ChevronDown, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { switchAdminShop, type AdminContext } from '../../lib/adminApi';

export const AdminShopSwitcher: React.FC<{
  context: AdminContext | null;
  onShopChanged?: () => void;
}> = ({ context, onShopChanged }) => {
  const [selectedShopId, setSelectedShopId] = useState(context?.shop?.id ?? '');
  const [isSwitching, setIsSwitching] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setSelectedShopId(context?.shop?.id ?? '');
  }, [context?.shop?.id]);

  if (!context) {
    return null;
  }

  const availableShops = context.availableShops ?? [];

  if (!context.isPlatformAdmin && availableShops.length <= 1) {
    return context.shop ? (
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
        Barbearia atual: <span className="font-semibold text-white">{context.shop.name}</span>
      </div>
    ) : null;
  }

  const handleSwitch = async () => {
    if (!selectedShopId || selectedShopId === context.shop?.id) {
      return;
    }

    setIsSwitching(true);
    setFeedback('');

    try {
      await switchAdminShop(context.profile.id, selectedShopId);
      onShopChanged?.();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Nao foi possivel trocar a barbearia.');
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Workspace</p>
          <p className="mt-1 text-sm text-slate-300">
            {context.shop ? (
              <>
                Gerenciando <span className="font-semibold text-white">{context.shop.name}</span>
              </>
            ) : (
              'Nenhuma barbearia selecionada no momento.'
            )}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-[240px]">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <select
              value={selectedShopId}
              onChange={(event) => setSelectedShopId(event.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-10 text-sm text-white focus:border-lime-400 focus:outline-none"
            >
              <option value="">Selecione uma barbearia</option>
              {availableShops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              void handleSwitch();
            }}
            disabled={isSwitching || !selectedShopId || selectedShopId === context.shop?.id}
            className="rounded-xl bg-lime-400 px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSwitching ? 'Trocando...' : 'Trocar'}
          </button>

          <Link
            to="/admin/settings"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <Settings className="h-4 w-4" />
            Barbearias
          </Link>
        </div>
      </div>

      {feedback ? (
        <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {feedback}
        </div>
      ) : null}
    </div>
  );
};
