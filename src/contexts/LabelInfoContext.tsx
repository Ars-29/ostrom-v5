import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface LabelInfoState {
  [scene: string]: {
    [labelId: string]: boolean;
  };
}

interface LabelInfoContextProps {
  state: LabelInfoState;
  markClicked: (scene: string, labelId: string) => void;
  reset: () => void;
}

const LabelInfoContext = createContext<LabelInfoContextProps | undefined>(undefined);

export const useLabelInfo = () => {
  const ctx = useContext(LabelInfoContext);
  if (!ctx) throw new Error('useLabelInfo must be used within LabelInfoProvider');
  return ctx;
};

const STORAGE_KEY = 'labelInfoState:v1';

export const LabelInfoProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<LabelInfoState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as LabelInfoState) : {};
    } catch {
      return {};
    }
  });

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  const markClicked = (scene: string, labelId: string) => {
    setState(prev => ({
      ...prev,
      [scene]: {
        ...prev[scene],
        [labelId]: true,
      },
    }));
  };

  const reset = () => setState({});

  return (
    <LabelInfoContext.Provider value={{ state, markClicked, reset }}>
      {children}
    </LabelInfoContext.Provider>
  );
};
