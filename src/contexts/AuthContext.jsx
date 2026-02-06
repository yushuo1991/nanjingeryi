import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

/**
 * AuthContext - 用户认证和角色管理
 *
 * 功能：
 * - 管理用户登录状态、token、角色
 * - 提供 login、logout、checkAuth 方法
 * - 从 localStorage 恢复登录状态
 * - 支持角色切换（therapist/doctor）
 */

const AuthContext = createContext(null);

/**
 * 从 localStorage 恢复认证状态
 */
const loadAuthFromStorage = () => {
  try {
    const storedAuth = localStorage.getItem('rehab_auth');
    if (storedAuth) {
      return JSON.parse(storedAuth);
    }
  } catch (error) {
    console.error('Failed to load auth from storage:', error);
  }
  return null;
};

/**
 * 保存认证状态到 localStorage
 */
const saveAuthToStorage = (authData) => {
  try {
    if (authData) {
      localStorage.setItem('rehab_auth', JSON.stringify(authData));
    } else {
      localStorage.removeItem('rehab_auth');
    }
  } catch (error) {
    console.error('Failed to save auth to storage:', error);
  }
};

/**
 * AuthProvider 组件
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - 子组件
 * @param {string} props.defaultRole - 默认角色 (therapist/doctor)
 */
export const AuthProvider = ({ children, defaultRole = 'therapist' }) => {
  // 从 URL 参数读取只读模式
  const urlParams = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      readonly: params.get('readonly') === 'true',
      deptId: params.get('deptId') ? parseInt(params.get('deptId')) : null,
    };
  }, []);

  // 初始化认证状态
  const [auth, setAuth] = useState(() => {
    const stored = loadAuthFromStorage();
    if (stored) {
      return stored;
    }
    // 默认状态
    return {
      isAuthenticated: true, // 当前版本默认已登录
      user: {
        id: 1,
        name: '康复治疗师',
        role: urlParams.readonly ? 'doctor' : defaultRole,
      },
      token: null,
    };
  });

  // 保存认证状态到 localStorage
  useEffect(() => {
    saveAuthToStorage(auth);
  }, [auth]);

  /**
   * 登录方法
   * @param {Object} credentials - 登录凭证
   * @param {string} credentials.username - 用户名
   * @param {string} credentials.password - 密码
   * @returns {Promise<Object>} 登录结果
   */
  const login = useCallback(async (credentials) => {
    try {
      // TODO: 实现真实的登录 API 调用
      // const response = await api.post('/auth/login', credentials);

      // 模拟登录
      const userData = {
        isAuthenticated: true,
        user: {
          id: 1,
          name: credentials.username || '康复治疗师',
          role: credentials.role || 'therapist',
        },
        token: 'mock-token-' + Date.now(),
      };

      setAuth(userData);
      return { success: true, data: userData };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * 登出方法
   */
  const logout = useCallback(() => {
    setAuth({
      isAuthenticated: false,
      user: null,
      token: null,
    });
    saveAuthToStorage(null);
  }, []);

  /**
   * 检查认证状态
   * @returns {boolean} 是否已认证
   */
  const checkAuth = useCallback(() => {
    return auth.isAuthenticated && auth.user !== null;
  }, [auth]);

  /**
   * 切换用户角色
   * @param {string} role - 新角色 (therapist/doctor)
   */
  const switchRole = useCallback((role) => {
    if (!['therapist', 'doctor'].includes(role)) {
      console.error('Invalid role:', role);
      return;
    }

    setAuth(prev => ({
      ...prev,
      user: {
        ...prev.user,
        role,
        name: role === 'therapist' ? '康复治疗师' : '康复医生',
      },
    }));
  }, []);

  /**
   * 更新用户信息
   * @param {Object} updates - 要更新的用户信息
   */
  const updateUser = useCallback((updates) => {
    setAuth(prev => ({
      ...prev,
      user: {
        ...prev.user,
        ...updates,
      },
    }));
  }, []);

  // Context value with memoization
  const value = useMemo(() => ({
    // 状态
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    token: auth.token,
    userRole: auth.user?.role || 'therapist',
    isTherapist: auth.user?.role === 'therapist',
    isDoctor: auth.user?.role === 'doctor',
    urlParams,

    // 方法
    login,
    logout,
    checkAuth,
    switchRole,
    updateUser,
  }), [auth, urlParams, login, logout, checkAuth, switchRole, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook - 访问认证上下文
 *
 * @returns {Object} 认证上下文
 * @throws {Error} 如果在 AuthProvider 外部使用
 *
 * @example
 * const { user, userRole, isTherapist, switchRole } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
