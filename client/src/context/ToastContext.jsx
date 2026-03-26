import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from "react";

const ToastContext = createContext(null);

function createToastPayload(input) {
  if (typeof input === "string") {
    return {
      title: input,
      tone: "info"
    };
  }

  return {
    title: input?.title || "Update",
    description: input?.description || "",
    tone: input?.tone || "info"
  };
}

export function ToastProvider({ children }) {
  const timeoutRegistry = useRef(new Map());
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    const timeoutId = timeoutRegistry.current.get(id);

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutRegistry.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((input) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const toast = {
      id,
      ...createToastPayload(input)
    };

    setToasts((current) => [...current, toast]);

    const timeoutId = window.setTimeout(() => {
      dismissToast(id);
    }, 3600);

    timeoutRegistry.current.set(id, timeoutId);
    return id;
  }, [dismissToast]);

  const value = useMemo(
    () => ({
      showToast,
      dismissToast
    }),
    [dismissToast, showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.tone}`}>
            <div style={{ minWidth: 0 }}>
              <strong style={{ display: "block", marginBottom: toast.description ? 4 : 0 }}>
                {toast.title}
              </strong>
              {toast.description ? (
                <p className="muted-text" style={{ margin: 0, color: "inherit" }}>
                  {toast.description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
