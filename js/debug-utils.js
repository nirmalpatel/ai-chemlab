export function debugElement(elementId, message = '') {
  const element = document.getElementById(elementId);
  
  console.log(`[DEBUG] ${message || elementId}:`, {
    element: element,
    exists: !!element,
    innerHTML: element ? element.innerHTML : 'N/A',
    visibility: element ? window.getComputedStyle(element).visibility : 'N/A',
    display: element ? window.getComputedStyle(element).display : 'N/A',
    opacity: element ? window.getComputedStyle(element).opacity : 'N/A',
    zIndex: element ? window.getComputedStyle(element).zIndex : 'N/A',
  });
  
  if (element) {
    // Highlight element with a red border for visual debugging
    const originalBorder = element.style.border;
    element.style.border = '2px solid red';
    console.log(`Highlighted ${elementId} with red border for visibility`);
    
    // Restore original border after 3 seconds
    setTimeout(() => {
      element.style.border = originalBorder;
    }, 3000);
  }
  
  return element;
}

// Force render any element to be visible and working
export function forceElementVisibility(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element ${elementId} not found, cannot force visibility`);
    return null;
  }
  
  // Apply critical styles directly
  element.style.display = 'block';
  element.style.visibility = 'visible';
  element.style.opacity = '1';
  element.style.zIndex = '10000';
  element.style.position = 'fixed';
  
  console.log(`Forced visibility for ${elementId}`);
  return element;
}
