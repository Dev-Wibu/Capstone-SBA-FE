import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Monitor localStorage changes for debugging
const originalSetItem = localStorage.setItem;
const originalRemoveItem = localStorage.removeItem;
const originalClear = localStorage.clear;

localStorage.setItem = function(key: string, value: string) {
  if (key === 'accessToken' || key === 'refreshToken' || key === 'user') {
    console.log(`💾 [LOCALSTORAGE] setItem: ${key}`, value.substring(0, 50) + '...');
  }
  return originalSetItem.apply(this, [key, value]);
};

localStorage.removeItem = function(key: string) {
  if (key === 'accessToken' || key === 'refreshToken' || key === 'user') {
    console.warn(`🗑️ [LOCALSTORAGE] removeItem: ${key}`);
    console.trace('Called from:');
  }
  return originalRemoveItem.apply(this, [key]);
};

localStorage.clear = function() {
  console.error('🚨 [LOCALSTORAGE] clear() called - ALL DATA WILL BE DELETED');
  console.trace('Called from:');
  return originalClear.apply(this);
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
