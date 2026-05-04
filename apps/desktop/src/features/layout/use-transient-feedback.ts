import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

type StatusTone = 'neutral' | 'success' | 'error';

export interface UseTransientFeedbackOptions {
  copyFeedbackAutoHideMs: number;
  statusAutoHideMs: number;
}

export const useTransientFeedback = ({
  copyFeedbackAutoHideMs,
  statusAutoHideMs,
}: UseTransientFeedbackOptions) => {
  const [status, setStatus] = useState<string>('');
  const [statusTone, setStatusTone] = useState<StatusTone>('neutral');
  const [copiedLabel, setCopiedLabel] = useState<string>('');
  const [inlineFeedback, setInlineFeedback] = useState<string>('');
  const statusAutoHideTimerRef = useRef<number | null>(null);
  const statusSequenceRef = useRef<number>(0);
  const copyFeedbackTimerRef = useRef<number | null>(null);
  const copyFeedbackSequenceRef = useRef<number>(0);
  const inlineFeedbackTimerRef = useRef<number | null>(null);
  const inlineFeedbackSequenceRef = useRef<number>(0);

  const setStatusLine = useCallback((message: string, tone: StatusTone = 'neutral') => {
    statusSequenceRef.current += 1;
    const sequence = statusSequenceRef.current;

    if (statusAutoHideTimerRef.current !== null) {
      window.clearTimeout(statusAutoHideTimerRef.current);
      statusAutoHideTimerRef.current = null;
    }

    setStatus(message);
    setStatusTone(tone);

    if (tone === 'error') {
      return;
    }

    statusAutoHideTimerRef.current = window.setTimeout(() => {
      if (statusSequenceRef.current !== sequence) {
        return;
      }
      setStatus('');
      statusAutoHideTimerRef.current = null;
    }, statusAutoHideMs);
  }, [statusAutoHideMs]);

  const dismissStatusLine = useCallback(() => {
    if (statusAutoHideTimerRef.current !== null) {
      window.clearTimeout(statusAutoHideTimerRef.current);
      statusAutoHideTimerRef.current = null;
    }
    setStatus('');
  }, []);

  const markCopied = useCallback((label: string) => {
    copyFeedbackSequenceRef.current += 1;
    const sequence = copyFeedbackSequenceRef.current;

    if (copyFeedbackTimerRef.current !== null) {
      window.clearTimeout(copyFeedbackTimerRef.current);
      copyFeedbackTimerRef.current = null;
    }

    setCopiedLabel(label);
    copyFeedbackTimerRef.current = window.setTimeout(() => {
      if (copyFeedbackSequenceRef.current !== sequence) {
        return;
      }
      setCopiedLabel('');
      copyFeedbackTimerRef.current = null;
    }, copyFeedbackAutoHideMs);
  }, [copyFeedbackAutoHideMs]);

  const pushInlineFeedback = useCallback((message: string) => {
    if (!message.trim()) {
      return;
    }

    inlineFeedbackSequenceRef.current += 1;
    const sequence = inlineFeedbackSequenceRef.current;

    if (inlineFeedbackTimerRef.current !== null) {
      window.clearTimeout(inlineFeedbackTimerRef.current);
      inlineFeedbackTimerRef.current = null;
    }

    setInlineFeedback(message);
    inlineFeedbackTimerRef.current = window.setTimeout(() => {
      if (inlineFeedbackSequenceRef.current !== sequence) {
        return;
      }
      setInlineFeedback('');
      inlineFeedbackTimerRef.current = null;
    }, copyFeedbackAutoHideMs);
  }, [copyFeedbackAutoHideMs]);

  useEffect(() => {
    return () => {
      if (statusAutoHideTimerRef.current !== null) {
        window.clearTimeout(statusAutoHideTimerRef.current);
      }
      if (copyFeedbackTimerRef.current !== null) {
        window.clearTimeout(copyFeedbackTimerRef.current);
      }
      if (inlineFeedbackTimerRef.current !== null) {
        window.clearTimeout(inlineFeedbackTimerRef.current);
      }
    };
  }, []);

  return {
    copiedLabel,
    dismissStatusLine,
    inlineFeedback,
    markCopied,
    pushInlineFeedback,
    setStatusLine,
    status,
    statusTone,
  };
};
