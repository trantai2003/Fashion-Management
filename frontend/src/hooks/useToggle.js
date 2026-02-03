import { useState, useCallback } from "react";

/**
 * Custom hook for toggle state management
 * @param {boolean} initialValue - Initial state (default: false)
 * @returns {[boolean, function, function, function]} [isOpen, open, close, toggle]
 */
export function useToggle(initialValue = false) {
    const [isOpen, setIsOpen] = useState(initialValue);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen(prev => !prev), []);

    return [isOpen, open, close, toggle];
}
