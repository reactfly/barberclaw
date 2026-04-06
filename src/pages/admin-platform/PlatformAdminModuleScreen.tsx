import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { PlatformAdminLayout } from '../../components/platform-admin/PlatformAdminLayout';
import { PlatformAdminModulePage } from '../../components/platform-admin/PlatformAdminModulePage';
import { getPlatformModule } from '../../data/platformAdmin';
import { getPlatformModuleData, type PlatformModuleData } from '../../lib/platformAdminApi';

export const PlatformAdminModuleScreen: React.FC<{ forcedModule?: Parameters<typeof getPlatformModule>[0] }> = ({
  forcedModule,
}) => {
  const params = useParams<{ module: string }>();
  const moduleSlug = (forcedModule ?? params.module ?? 'overview') as Parameters<typeof getPlatformModule>[0];
  const module = getPlatformModule(moduleSlug);
  const [data, setData] = useState<PlatformModuleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    getPlatformModuleData(module.slug)
      .then((result) => {
        if (mounted) setData(result);
      })
      .catch((error) => {
        if (mounted) setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel carregar o modulo.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [module.slug]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-300" />
      </div>
    );
  }

  if (!data) {
    if (errorMessage.includes('exclusivo')) {
      return <Navigate to="/admin" replace />;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-center text-red-200">
        {errorMessage || 'Nao foi possivel carregar o modulo.'}
      </div>
    );
  }

  return (
    <PlatformAdminLayout
      profile={data.context.profile}
      title={data.module.label}
      subtitle={data.module.description}
      commands={data.commands}
    >
      <PlatformAdminModulePage data={data} />
    </PlatformAdminLayout>
  );
};
