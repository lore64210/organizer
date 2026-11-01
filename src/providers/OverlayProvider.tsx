import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, View } from 'react-native';

type OverlayEntry = {
  id: string;
  node: ReactNode;
};

type OverlayActions = {
  showOverlay: (id: string, node: ReactNode) => void;
  hideOverlay: (id: string) => void;
};

// Actions are stable forever; only the host subscribes to the rendered entries.
// Keeping them in separate contexts is what prevents an overlay update from
// re-rendering the component that pushed the overlay (and looping).
const ActionsContext = createContext<OverlayActions | null>(null);
const EntriesContext = createContext<OverlayEntry[]>([]);

export const useOverlay = (): OverlayActions => {
  const context = useContext(ActionsContext);
  if (!context) {
    throw new Error('useOverlay must be used inside OverlayProvider');
  }
  return context;
};

/**
 * Overlays that must live above the app content (and outside its BlurTargetView)
 * but still belong to the same React tree. Used by the glass modals.
 */
export const OverlayProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = useState<OverlayEntry[]>([]);

  const showOverlay = useCallback((id: string, node: ReactNode) => {
    setEntries(previous => {
      const index = previous.findIndex(entry => entry.id === id);
      if (index === -1) {
        return [...previous, { id, node }];
      }
      if (previous[index].node === node) {
        return previous;
      }
      const next = previous.slice();
      next[index] = { id, node };
      return next;
    });
  }, []);

  const hideOverlay = useCallback((id: string) => {
    setEntries(previous =>
      previous.some(entry => entry.id === id)
        ? previous.filter(entry => entry.id !== id)
        : previous,
    );
  }, []);

  const actions = useMemo(
    () => ({ showOverlay, hideOverlay }),
    [showOverlay, hideOverlay],
  );

  return (
    <ActionsContext.Provider value={actions}>
      <EntriesContext.Provider value={entries}>{children}</EntriesContext.Provider>
    </ActionsContext.Provider>
  );
};

/** Renders the current overlays. Must be placed above the BlurTargetView. */
export const OverlayHost = () => {
  const entries = useContext(EntriesContext);

  return (
    <View style={styles.host} pointerEvents="box-none">
      {entries.map(entry => (
        <Fragment key={entry.id}>{entry.node}</Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 900,
    elevation: 20,
  },
});
