import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../lib/api';

/**
 * PatientContext - 患者数据管理
 *
 * 功能：
 * - 管理患者列表数据
 * - 提供 fetchPatients、createPatient、updatePatient、deletePatient 方法
 * - 集成 API 调用和错误处理
 * - 支持患者筛选和搜索
 */

const PatientContext = createContext(null);

/**
 * PatientProvider 组件
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - 子组件
 * @param {Function} props.onError - 错误处理回调
 */
export const PatientProvider = ({ children, onError }) => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 处理错误
   */
  const handleError = useCallback((err, context = '') => {
    const errorMessage = err.response?.data?.error || err.message || '操作失败';
    const fullError = context ? `${context}: ${errorMessage}` : errorMessage;

    console.error(fullError, err);
    setError(fullError);

    if (onError) {
      onError(fullError);
    }

    return fullError;
  }, [onError]);

  /**
   * 获取患者列表
   * @param {Object} options - 查询选项
   * @param {number} options.departmentId - 科室ID
   * @param {string} options.status - 患者状态 (active/completed)
   * @param {boolean} options.silent - 静默加载（不显示loading）
   * @returns {Promise<Array>} 患者列表
   */
  const fetchPatients = useCallback(async (options = {}) => {
    const { departmentId, status, silent = false } = options;

    if (!silent) {
      setLoading(true);
    }
    setError(null);

    try {
      const params = {};
      if (departmentId) params.departmentId = departmentId;
      if (status) params.status = status;

      const response = await api.get('/patients', { params });
      const patientList = response.data || [];

      setPatients(patientList);
      return patientList;
    } catch (err) {
      handleError(err, '获取患者列表失败');
      return [];
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [handleError]);

  /**
   * 获取单个患者详情
   * @param {number} patientId - 患者ID
   * @returns {Promise<Object|null>} 患者详情
   */
  const fetchPatientById = useCallback(async (patientId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/patients/${patientId}`);
      const patient = response.data;

      // 更新本地列表中的患者数据
      setPatients(prev =>
        prev.map(p => p.id === patientId ? patient : p)
      );

      return patient;
    } catch (err) {
      handleError(err, '获取患者详情失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  /**
   * 创建新患者
   * @param {Object} patientData - 患者数据
   * @returns {Promise<Object|null>} 创建的患者
   */
  const createPatient = useCallback(async (patientData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/patients', patientData);
      const newPatient = response.data;

      setPatients(prev => [newPatient, ...prev]);
      return newPatient;
    } catch (err) {
      handleError(err, '创建患者失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  /**
   * 更新患者信息
   * @param {number} patientId - 患者ID
   * @param {Object} updates - 更新的数据
   * @returns {Promise<Object|null>} 更新后的患者
   */
  const updatePatient = useCallback(async (patientId, updates) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put(`/patients/${patientId}`, updates);
      const updatedPatient = response.data;

      setPatients(prev =>
        prev.map(p => p.id === patientId ? updatedPatient : p)
      );

      if (selectedPatient?.id === patientId) {
        setSelectedPatient(updatedPatient);
      }

      return updatedPatient;
    } catch (err) {
      handleError(err, '更新患者失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, selectedPatient]);

  /**
   * 删除患者
   * @param {number} patientId - 患者ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  const deletePatient = useCallback(async (patientId) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/patients/${patientId}`);

      setPatients(prev => prev.filter(p => p.id !== patientId));

      if (selectedPatient?.id === patientId) {
        setSelectedPatient(null);
      }

      return true;
    } catch (err) {
      handleError(err, '删除患者失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError, selectedPatient]);

  /**
   * 添加治疗日志
   * @param {number} patientId - 患者ID
   * @param {Object} logData - 日志数据
   * @returns {Promise<Object|null>} 添加的日志
   */
  const addTreatmentLog = useCallback(async (patientId, logData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/patients/${patientId}/logs`, logData);
      const newLog = response.data;

      // 更新患者的治疗日志
      setPatients(prev =>
        prev.map(p => {
          if (p.id === patientId) {
            return {
              ...p,
              treatmentLogs: [...(p.treatmentLogs || []), newLog],
              todayTreated: true,
            };
          }
          return p;
        })
      );

      return newLog;
    } catch (err) {
      handleError(err, '添加治疗日志失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  /**
   * 更新 GAS 评分
   * @param {number} patientId - 患者ID
   * @param {Object} gasData - GAS 评分数据
   * @returns {Promise<boolean>} 是否更新成功
   */
  const updateGasScore = useCallback(async (patientId, gasData) => {
    setLoading(true);
    setError(null);

    try {
      await api.put(`/patients/${patientId}/gas`, gasData);

      // 更新本地数据
      setPatients(prev =>
        prev.map(p => {
          if (p.id === patientId) {
            return {
              ...p,
              gasScore: gasData.gasScore,
              gasGoals: gasData.gasGoals,
            };
          }
          return p;
        })
      );

      return true;
    } catch (err) {
      handleError(err, '更新GAS评分失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  /**
   * 选择患者
   * @param {Object|null} patient - 要选择的患者
   */
  const selectPatient = useCallback((patient) => {
    setSelectedPatient(patient);
  }, []);

  /**
   * 清除选择
   */
  const clearSelection = useCallback(() => {
    setSelectedPatient(null);
  }, []);

  /**
   * 按科室筛选患者
   */
  const getPatientsByDepartment = useCallback((departmentId) => {
    if (!departmentId) return patients;
    return patients.filter(p => p.departmentId === departmentId);
  }, [patients]);

  /**
   * 获取今日已治疗患者数
   */
  const getTodayTreatedCount = useCallback((departmentId = null) => {
    const targetPatients = departmentId
      ? getPatientsByDepartment(departmentId)
      : patients;
    return targetPatients.filter(p => p.todayTreated).length;
  }, [patients, getPatientsByDepartment]);

  /**
   * 获取待治疗患者数
   */
  const getPendingCount = useCallback((departmentId = null) => {
    const targetPatients = departmentId
      ? getPatientsByDepartment(departmentId)
      : patients;
    return targetPatients.filter(p => !p.todayTreated && p.status === 'active').length;
  }, [patients, getPatientsByDepartment]);

  // Context value with memoization
  const value = useMemo(() => ({
    // 状态
    patients,
    selectedPatient,
    loading,
    error,

    // 方法
    fetchPatients,
    fetchPatientById,
    createPatient,
    updatePatient,
    deletePatient,
    addTreatmentLog,
    updateGasScore,
    selectPatient,
    clearSelection,

    // 辅助方法
    getPatientsByDepartment,
    getTodayTreatedCount,
    getPendingCount,
  }), [
    patients,
    selectedPatient,
    loading,
    error,
    fetchPatients,
    fetchPatientById,
    createPatient,
    updatePatient,
    deletePatient,
    addTreatmentLog,
    updateGasScore,
    selectPatient,
    clearSelection,
    getPatientsByDepartment,
    getTodayTreatedCount,
    getPendingCount,
  ]);

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};

/**
 * usePatients Hook - 访问患者上下文
 *
 * @returns {Object} 患者上下文
 * @throws {Error} 如果在 PatientProvider 外部使用
 *
 * @example
 * const { patients, fetchPatients, createPatient, selectedPatient } = usePatients();
 */
export const usePatients = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
};

export default PatientContext;
