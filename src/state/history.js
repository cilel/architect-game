import { useState, useCallback } from 'react';

export const useHistory = (initialState = []) => {
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 推入新状态并截断未来的重做历史
  const push = useCallback((newState) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, currentIndex + 1);
      return [...newHistory, newState];
    });
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex]);

  // 撤销 (Ctrl+Z)
  const undo = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  // 重做 (Ctrl+Y)
  const redo = useCallback(() => {
    setCurrentIndex((prev) => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  return {
    current: history[currentIndex],
    push,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1
  };
};
