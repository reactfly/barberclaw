import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getAdminContext } from '../../lib/adminApi';

interface PlatformAwareAdminPageProps {
  platform: React.ReactNode;
  shop: React.ReactNode;
}

export const PlatformAwareAdminPage: React.FC<PlatformAwareAdminPageProps> = ({ platform, shop }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    getAdminContext()
      .then((context) => {
        if (mounted) setIsPlatformAdmin(context.isPlatformAdmin);
      })
      .catch(() => {
        if (mounted) setIsPlatformAdmin(false);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-300" />
      </div>
    );
  }

  return <>{isPlatformAdmin ? platform : shop}</>;
};
