import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, Scissors } from 'lucide-react';
import { getCurrentSessionContext } from '../../lib/auth';

type ProtectedRouteMode = 'admin' | 'onboarding' | 'customer';

interface AccessState {
  isLoading: boolean;
  redirectTo: string | null;
  errorMessage: string | null;
}

const LoadingScreen: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#050505] px-6 text-center text-slate-100">
    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-lime-400/10">
      <Scissors className="h-8 w-8 text-lime-300" />
    </div>
    <Loader2 className="h-7 w-7 animate-spin text-lime-300" />
    <div>
      <p className="text-lg font-semibold text-white">Validando seu acesso</p>
      <p className="mt-2 text-sm text-slate-400">{message}</p>
    </div>
  </div>
);

export const ProtectedRoute: React.FC<{
  mode: ProtectedRouteMode;
  children: React.ReactNode;
}> = ({ mode, children }) => {
  const [accessState, setAccessState] = useState<AccessState>({
    isLoading: true,
    redirectTo: null,
    errorMessage: null,
  });
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const validateAccess = async () => {
      setAccessState({
        isLoading: true,
        redirectTo: null,
        errorMessage: null,
      });

      try {
        const context = await getCurrentSessionContext();

        if (!context) {
          if (isMounted) {
            setAccessState({
              isLoading: false,
              redirectTo: '/login',
              errorMessage: null,
            });
          }
          return;
        }

        const { profile, primaryBarbershop } = context;
        const isOwnerIncomplete =
          profile.role === 'owner' &&
          (!profile.onboarding_completed || !primaryBarbershop);

        let redirectTo: string | null = null;

        if (mode === 'admin') {
          if (profile.role === 'customer') {
            redirectTo = '/painel';
          } else if (isOwnerIncomplete) {
            redirectTo = '/onboarding';
          }
        }

        if (mode === 'onboarding') {
          if (profile.role === 'customer' || profile.role === 'staff') {
            redirectTo = profile.role === 'customer' ? '/painel' : '/admin';
          } else if (!isOwnerIncomplete) {
            redirectTo = '/admin';
          }
        }

        if (mode === 'customer') {
          if (profile.role !== 'customer') {
            redirectTo = isOwnerIncomplete ? '/onboarding' : '/admin';
          }
        }

        if (isMounted) {
          setAccessState({
            isLoading: false,
            redirectTo,
            errorMessage: null,
          });
        }
      } catch (error) {
        if (isMounted) {
          setAccessState({
            isLoading: false,
            redirectTo: '/login',
            errorMessage:
              error instanceof Error
                ? error.message
                : 'Nao foi possivel validar sua sessao agora.',
          });
        }
      }
    };

    void validateAccess();

    return () => {
      isMounted = false;
    };
  }, [location.pathname, mode]);

  if (accessState.isLoading) {
    return <LoadingScreen message="Conferindo sessao, perfil e permissao da sua conta." />;
  }

  if (accessState.redirectTo) {
    return (
      <Navigate
        replace
        to={accessState.redirectTo}
        state={accessState.errorMessage ? { authError: accessState.errorMessage } : undefined}
      />
    );
  }

  return <>{children}</>;
};
