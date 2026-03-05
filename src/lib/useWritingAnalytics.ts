import { useEffect, useRef, useCallback } from 'react';
import { getSupabaseBrowserClient } from './supabaseClient';

type WritingActivity = {
  activeTime: number;
  typingTime: number;
  editingTime: number;
  charactersAdded: number;
  charactersDeleted: number;
  pasteCount: number;
};

export function useWritingAnalytics(articleId: string | null, userId: string | null) {
  const supabase = getSupabaseBrowserClient();
  const sessionIdRef = useRef<string | null>(null);
  const activityRef = useRef<WritingActivity>({
    activeTime: 0,
    typingTime: 0,
    editingTime: 0,
    charactersAdded: 0,
    charactersDeleted: 0,
    pasteCount: 0,
  });
  
  const lastActivityRef = useRef<number>(Date.now());
  const isActiveRef = useRef<boolean>(true);
  const activeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Save session data to database
  const saveSession = useCallback(async () => {
    if (!userId || !sessionIdRef.current) return;

    const activity = activityRef.current;
    
    // Only save if there's meaningful activity
    if (activity.activeTime === 0 && activity.charactersAdded === 0) return;

    try {
      const { error } = await supabase
        .from('writing_sessions')
        .upsert({
          id: sessionIdRef.current,
          writer_id: userId,
          article_id: articleId,
          session_date: new Date().toISOString().split('T')[0],
          active_time: activity.activeTime,
          typing_time: activity.typingTime,
          editing_time: activity.editingTime,
          characters_added: activity.charactersAdded,
          characters_deleted: activity.charactersDeleted,
          paste_count: activity.pasteCount,
          last_activity_at: new Date().toISOString(),
        });

      if (error) {
        console.error('[Writing Analytics] Save error:', error);
      }
    } catch (err) {
      console.error('[Writing Analytics] Save exception:', err);
    }
  }, [userId, articleId, supabase]);

  // Track active time
  useEffect(() => {
    if (!userId) return;

    // Create or reuse session ID
    if (!sessionIdRef.current) {
      sessionIdRef.current = crypto.randomUUID();
    }

    // Track visibility changes
    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden;
      
      if (!document.hidden) {
        lastActivityRef.current = Date.now();
      }
    };

    // Track active time every second when tab is visible
    activeIntervalRef.current = setInterval(() => {
      if (isActiveRef.current) {
        activityRef.current.activeTime += 1;
      }
    }, 1000);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (activeIntervalRef.current) {
        clearInterval(activeIntervalRef.current);
      }
    };
  }, [userId]);

  // Track typing and editing
  const trackInput = useCallback((event: InputEvent) => {
    if (!userId) return;

    const inputType = event.inputType;
    const data = event.data || '';

    // Track typing time (reset after 2 seconds of inactivity)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    const now = Date.now();
    const timeSinceLastActivity = (now - lastActivityRef.current) / 1000;
    
    if (timeSinceLastActivity < 2) {
      // Continuous typing
      activityRef.current.typingTime += 1;
    }
    
    lastActivityRef.current = now;
    
    typingTimeoutRef.current = setTimeout(() => {
      // Typing stopped
    }, 2000);

    // Track character changes
    if (inputType === 'insertText' || inputType === 'insertCompositionText') {
      activityRef.current.charactersAdded += data.length;
    } else if (inputType === 'insertFromPaste') {
      activityRef.current.charactersAdded += data.length;
      activityRef.current.pasteCount += 1;
    } else if (inputType === 'deleteContentBackward' || inputType === 'deleteContentForward') {
      activityRef.current.charactersDeleted += 1;
      activityRef.current.editingTime += 1;
    } else if (inputType.startsWith('delete')) {
      // Other delete operations
      activityRef.current.editingTime += 1;
    }
  }, [userId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!userId) return;

    saveIntervalRef.current = setInterval(() => {
      saveSession();
    }, 30000); // Save every 30 seconds

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [userId, saveSession]);

  // Save on unmount
  useEffect(() => {
    return () => {
      saveSession();
    };
  }, [saveSession]);

  return {
    trackInput,
    saveSession,
  };
}
