import { shallow } from 'zustand/shallow';

import { useStore } from '@wsh-2025/client/src/app/StoreContext';

export function useAuthActions() {
  return useStore(
    (state) => ({
      closeDialog: state.features.auth.closeDialog,
      openSignInDialog: state.features.auth.openSignInDialog,
      openSignOutDialog: state.features.auth.openSignOutDialog,
      openSignUpDialog: state.features.auth.openSignUpDialog,
      signIn: state.features.auth.signIn,
      signOut: state.features.auth.signOut,
      signUp: state.features.auth.signUp,
    }),
    shallow,
  );
}
