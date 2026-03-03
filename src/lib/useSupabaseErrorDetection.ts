import { useState, useEffect } from "react";

let isBlocked = false;
const pendingRequests = new Set<number>();
let requestIdCounter = 0;
let globalSetShowModal: ((show: boolean) => void) | null = null;
let originalFetch: typeof fetch | null = null;
let interceptorInstalled = false;

function installInterceptor() {
  if (interceptorInstalled || typeof window === 'undefined') return;
  
  originalFetch = window.fetch;
  interceptorInstalled = true;
  
  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] instanceof Request ? args[0].url : String(args[0]));
    const isSupabaseRequest = url.includes('supabase');
    
    console.log('[Fetch]', { url, isSupabaseRequest, globalSetShowModal: !!globalSetShowModal });
    
    if (isBlocked && isSupabaseRequest) {
      console.log('[Fetch] Blocked');
      return Promise.reject(new Error('Connection blocked'));
    }
    
    if (!isSupabaseRequest) {
      return originalFetch!(...args);
    }
    
    const requestId = requestIdCounter++;
    pendingRequests.add(requestId);
    console.log('[Fetch] Supabase request started', requestId);
    
    // Set timeout to show modal after 6 seconds
    const timeoutId = setTimeout(() => {
      if (pendingRequests.has(requestId)) {
        console.log('[Fetch] TIMEOUT - showing modal', { globalSetShowModal: !!globalSetShowModal });
        if (globalSetShowModal) {
          console.log('[Fetch] Calling globalSetShowModal(true)');
          globalSetShowModal(true);
          isBlocked = true;
        } else {
          console.error('[Fetch] globalSetShowModal is null!');
        }
      }
    }, 6000);
    
    try {
      const response = await originalFetch!(...args);
      console.log('[Fetch] Completed', requestId);
      clearTimeout(timeoutId);
      pendingRequests.delete(requestId);
      return response;
    } catch (error) {
      console.log('[Fetch] Failed', requestId, error);
      clearTimeout(timeoutId);
      pendingRequests.delete(requestId);
      if (globalSetShowModal) {
        globalSetShowModal(true);
        isBlocked = true;
      }
      throw error;
    }
  };
}

// Install immediately when module loads
if (typeof window !== 'undefined') {
  installInterceptor();
}

export function useSupabaseErrorDetection() {
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    console.log('[Hook] Registering globalSetShowModal');
    globalSetShowModal = setShowErrorModal;
    installInterceptor(); // Ensure it's installed
    
    return () => {
      console.log('[Hook] Unregistering globalSetShowModal');
      globalSetShowModal = null;
    };
  }, []);

  const handleClose = () => {
    console.log('[Hook] handleClose');
    setShowErrorModal(false);
    isBlocked = false;
    pendingRequests.clear();
  };

  const handleRetry = () => {
    console.log('[Hook] handleRetry');
    setShowErrorModal(false);
    isBlocked = false;
    pendingRequests.clear();
    window.location.reload();
  };

  const triggerTestModal = () => {
    console.log('[Hook] triggerTestModal');
    setShowErrorModal(true);
    isBlocked = true;
  };

  console.log('[Hook] Render, showErrorModal=', showErrorModal);

  return {
    showErrorModal,
    handleClose,
    handleRetry,
    triggerTestModal,
  };
}
