'use client';

import { createContext, useContext } from 'react';

export const AdminMobileCtx = createContext<{ toggle: () => void }>({ toggle: () => {} });

export function useAdminMobileMenu() {
  return useContext(AdminMobileCtx);
}
