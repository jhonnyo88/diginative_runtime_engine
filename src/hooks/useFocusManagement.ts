import { useEffect, useRef } from 'react';

interface FocusManagementOptions {
  skipToMainContent?: boolean;
  announcePageChange?: boolean;
  restoreFocusOnUnmount?: boolean;
}

  sceneId: string, 
  options: FocusManagementOptions = {}
) => {
  
  const {
    skipToMainContent = true,
    announcePageChange = true,
    restoreFocusOnUnmount = false
  } = options;

  useEffect(() => {
    // Store previous focus element
    if (restoreFocusOnUnmount) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    // Focus main content when scene changes
    if (skipToMainContent && mainContentRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (mainContentRef.current) {
          mainContentRef.current.focus();
        }
      }, 100);
    }

    // Announce page change to screen readers
    if (announcePageChange) {
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.style.position = 'absolute';
      announcement.style.left = '-10000px';
      announcement.style.width = '1px';
      announcement.style.height = '1px';
      announcement.style.overflow = 'hidden';
      
      document.body.appendChild(announcement);
      
      // Announce after a brief delay
      setTimeout(() => {
        announcement.textContent = `Ny scen laddad: ${sceneId}`;
        
        // Clean up after announcement
        setTimeout(() => {
          if (document.body.contains(announcement)) {
            document.body.removeChild(announcement);
          }
        }, 1000);
      }, 500);
    }

    // Cleanup function
    return () => {
      if (restoreFocusOnUnmount && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [sceneId, skipToMainContent, announcePageChange, restoreFocusOnUnmount]);

  return { mainContentRef };
};

// Hook for managing focus within a scene

    element.addEventListener('keydown', handleTabKey);
    
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  };

  return { trapFocus };
};