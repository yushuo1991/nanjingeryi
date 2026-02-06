/**
 * Context 统一导出
 *
 * 使用方式：
 * import { AuthProvider, useAuth, PatientProvider, usePatients, UIProvider, useUI } from './contexts';
 */

export { AuthProvider, useAuth } from './AuthContext';
export { PatientProvider, usePatients } from './PatientContext';
export { UIProvider, useUI, PAGES, TOAST_TYPES } from './UIContext';
