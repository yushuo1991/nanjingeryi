import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

/**
 * UIContext - 全局UI状态管理
 *
 * 功能：
 * - 管理 currentPage、toast、loading 等UI状态
 * - 提供 navigateTo、showToast、setLoading 方法
 * - 管理模态框显示状态
 * - 管理全局加载状态
 */

const UIContext = createContext(null);

/**
 * Toast 类型
 */
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

/**
 * 页面类型
 */
export const PAGES = {
  HOME: 'home',
  PATIENTS: 'patients',
  PATIENT_DETAIL: 'patient-detail',
  MESSAGES: 'messages',
  PROFILE: 'profile',
};

/**
 * UIProvider 组件
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - 子组件
 * @param {string} props.defaultPage - 默认页面
 */
export const UIProvider = ({ children, defaultPage = PAGES.HOME }) => {
  // 页面导航状态
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem('rehab_current_page');
    return saved || defaultPage;
  });

  // Toast 状态
  const [toast, setToast] = useState(null);

  // 全局加载状态
  const [loading, setLoading] = useState(false);

  // 模态框状态
  const [modals, setModals] = useState({
    aiIntake: false,
    quickEntry: false,
    batchGenerate: false,
    templates: false,
    deleteConfirm: false,
    logConfirm: false,
    allPatients: false,
    addDepartment: false,
  });

  // FAB 菜单状态
  const [showFabMenu, setShowFabMenu] = useState(false);

  // 科室编辑状态
  const [isEditingDepartments, setIsEditingDepartments] = useState(false);

  // 选中的科室
  const [selectedDepartment, setSelectedDepartment] = useState(() => {
    const saved = localStorage.getItem('rehab_selected_department');
    return saved ? JSON.parse(saved) : null;
  });

  // 详情页标签
  const [detailTab, setDetailTab] = useState('today');

  // 保存当前页面到 localStorage
  useEffect(() => {
    localStorage.setItem('rehab_current_page', currentPage);
  }, [currentPage]);

  // 保存选中的科室到 localStorage
  useEffect(() => {
    if (selectedDepartment) {
      localStorage.setItem('rehab_selected_department', JSON.stringify(selectedDepartment));
    } else {
      localStorage.removeItem('rehab_selected_department');
    }
  }, [selectedDepartment]);

  /**
   * 导航到指定页面
   * @param {string} page - 页面名称
   * @param {Object} options - 导航选项
   */
  const navigateTo = useCallback((page, options = {}) => {
    setCurrentPage(page);

    // 如果有滚动选项，滚动到顶部
    if (options.scrollToTop !== false) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 关闭 FAB 菜单
    setShowFabMenu(false);
  }, []);

  /**
   * 返回上一页
   */
  const goBack = useCallback(() => {
    setCurrentPage(PAGES.HOME);
  }, []);

  /**
   * 显示 Toast 消息
   * @param {string} message - 消息内容
   * @param {string} type - 消息类型 (success/error/warning/info)
   * @param {number} duration - 显示时长（毫秒）
   */
  const showToast = useCallback((message, type = TOAST_TYPES.INFO, duration = 3000) => {
    const toastId = Date.now();
    setToast({ id: toastId, message, type });

    // 自动隐藏
    if (duration > 0) {
      setTimeout(() => {
        setToast(prev => (prev?.id === toastId ? null : prev));
      }, duration);
    }
  }, []);

  /**
   * 隐藏 Toast
   */
  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  /**
   * 显示成功消息
   */
  const showSuccess = useCallback((message, duration) => {
    showToast(message, TOAST_TYPES.SUCCESS, duration);
  }, [showToast]);

  /**
   * 显示错误消息
   */
  const showError = useCallback((message, duration) => {
    showToast(message, TOAST_TYPES.ERROR, duration);
  }, [showToast]);

  /**
   * 显示警告消息
   */
  const showWarning = useCallback((message, duration) => {
    showToast(message, TOAST_TYPES.WARNING, duration);
  }, [showToast]);

  /**
   * 显示信息消息
   */
  const showInfo = useCallback((message, duration) => {
    showToast(message, TOAST_TYPES.INFO, duration);
  }, [showToast]);

  /**
   * 打开模态框
   * @param {string} modalName - 模态框名称
   */
  const openModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  }, []);

  /**
   * 关闭模态框
   * @param {string} modalName - 模态框名称
   */
  const closeModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  }, []);

  /**
   * 切换模态框状态
   * @param {string} modalName - 模态框名称
   */
  const toggleModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: !prev[modalName] }));
  }, []);

  /**
   * 关闭所有模态框
   */
  const closeAllModals = useCallback(() => {
    setModals({
      aiIntake: false,
      quickEntry: false,
      batchGenerate: false,
      templates: false,
      deleteConfirm: false,
      logConfirm: false,
      allPatients: false,
      addDepartment: false,
    });
  }, []);

  /**
   * 切换 FAB 菜单
   */
  const toggleFabMenu = useCallback(() => {
    setShowFabMenu(prev => !prev);
  }, []);

  /**
   * 关闭 FAB 菜单
   */
  const closeFabMenu = useCallback(() => {
    setShowFabMenu(false);
  }, []);

  /**
   * 选择科室
   * @param {Object} department - 科室对象
   */
  const selectDepartment = useCallback((department) => {
    setSelectedDepartment(department);
  }, []);

  /**
   * 清除科室选择
   */
  const clearDepartmentSelection = useCallback(() => {
    setSelectedDepartment(null);
  }, []);

  /**
   * 切换科室编辑模式
   */
  const toggleDepartmentEdit = useCallback(() => {
    setIsEditingDepartments(prev => !prev);
  }, []);

  /**
   * 设置详情页标签
   * @param {string} tab - 标签名称
   */
  const setDetailTabValue = useCallback((tab) => {
    setDetailTab(tab);
  }, []);

  // Context value with memoization
  const value = useMemo(() => ({
    // 页面导航
    currentPage,
    navigateTo,
    goBack,

    // Toast
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,

    // 加载状态
    loading,
    setLoading,

    // 模态框
    modals,
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,

    // FAB 菜单
    showFabMenu,
    toggleFabMenu,
    closeFabMenu,

    // 科室
    selectedDepartment,
    selectDepartment,
    clearDepartmentSelection,
    isEditingDepartments,
    toggleDepartmentEdit,

    // 详情页
    detailTab,
    setDetailTab: setDetailTabValue,

    // 常量
    PAGES,
    TOAST_TYPES,
  }), [
    currentPage,
    navigateTo,
    goBack,
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    loading,
    modals,
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,
    showFabMenu,
    toggleFabMenu,
    closeFabMenu,
    selectedDepartment,
    selectDepartment,
    clearDepartmentSelection,
    isEditingDepartments,
    toggleDepartmentEdit,
    detailTab,
    setDetailTabValue,
  ]);

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

/**
 * useUI Hook - 访问UI上下文
 *
 * @returns {Object} UI上下文
 * @throws {Error} 如果在 UIProvider 外部使用
 *
 * @example
 * const { currentPage, navigateTo, showToast, openModal } = useUI();
 */
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export default UIContext;
