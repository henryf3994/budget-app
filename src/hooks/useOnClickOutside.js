import { useEffect } from 'react';

/**
 * Custom hook to detect clicks outside of a referenced element.
 * @param {React.RefObject} ref - React ref attached to the modal container.
 * @param {Function} handler - Callback function to fire on outside click (e.g., onClose).
 */
export function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendant elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    // Listen for mouse down and touch events
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
