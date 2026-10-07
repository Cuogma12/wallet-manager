import { router } from 'expo-router';

export function useFormNavigation() {
  function close() {
    if (router.canGoBack()) router.back();
    else router.replace('/accounts');
  }
  function createAccount() {
    router.push('/manage-account');
  }
  return { close, createAccount };
}
