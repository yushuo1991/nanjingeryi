import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Sparkles, Upload, Camera, Loader2, CheckCircle2, FileText,
  User, AlertCircle, AlertTriangle, ClipboardList, X, Trash2, Check
} from '../components/icons';
import ModalBase from '../components/ui/ModalBase';
import ParticleButton from '../components/ui/ParticleButton';
import BoxLoader from '../components/ui/BoxLoader';

/**
 * AIIntakeModal - Modal for AI-powered patient intake
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {number} props.aiStep - Current step (0: upload, 1: processing, 2: form)
 * @param {Function} props.setAiStep - Function to update step
 * @param {Object} props.aiResult - AI extraction result
 * @param {Function} props.setAiResult - Function to update AI result
 * @param {string} props.uploadedImage - Uploaded image URL
 * @param {Function} props.setUploadedImage - Function to update uploaded image
 * @param {string} props.ocrText - OCR text result
 * @param {Function} props.setOcrText - Function to update OCR text
 * @param {number} props.ocrProgress - OCR progress (0-100)
 * @param {Function} props.setOcrProgress - Function to update progress
 * @param {Function} props.handleImageUpload - Function to handle image upload
 * @param {Function} props.updateFormField - Function to update form field
 * @param {Function} props.addSafetyAlert - Function to add safety alert
 * @param {Function} props.removeSafetyAlert - Function to remove safety alert
 * @param {Function} props.addTreatmentItem - Function to add treatment item
 * @param {Function} props.updateTreatmentItem - Function to update treatment item
 * @param {Function} props.removeTreatmentItem - Function to remove treatment item
 * @param {Function} props.handleGeneratePlan - Function to generate plan
 * @param {Function} props.confirmAdmission - Function to confirm admission
 * @param {boolean} props.isOcrProcessing - Whether OCR is processing
 * @param {boolean} props.isSavingPatient - Whether patient is being saved
 * @param {Array} props.departments - Array of departments
 */
const AIIntakeModal = ({
  isOpen,
  onClose,
  aiStep,
  setAiStep,
  aiResult,
  setAiResult,
  uploadedImage,
  setUploadedImage,
  ocrText,
  setOcrText,
  ocrProgress,
  setOcrProgress,
  handleImageUpload,
  updateFormField,
  addSafetyAlert,
  removeSafetyAlert,
  addTreatmentItem,
  updateTreatmentItem,
  removeTreatmentItem,
  handleGeneratePlan,
  confirmAdmission,
  isOcrProcessing,
  isSavingPatient,
  departments
}) => {
  const [newAlertInput, setNewAlertInput] = useState('');

  const handleClose = () => {
    onClose();
    setAiStep(0);
    setAiResult(null);
    setUploadedImage(null);
    setOcrText('');
    setOcrProgress(0);
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={handleClose}
      title="AI智能建档"
      icon={<Sparkles className="text-blue-500" size={20} />}
    >
      {/* Step 0: Upload medical record images */}
      {aiStep === 0 && (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-white shadow-md">
            <Upload size={36} className="text-blue-500" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 mb-2">上传病历资料</h4>
          <p className="text-sm text-slate-500 mb-6">上传病历图片，AI将自动识别并提取患者信息</p>

          <input
            type="file"
            id="medical-record-upload"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

          <label
            htmlFor="medical-record-upload"
            className="block border-2 border-dashed border-slate-200 rounded-3xl p-8 mb-4 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
          >
            <Camera size={32} className="text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-700 font-medium">点击选择图片或拍照（支持多图）</p>
            <p className="text-xs text-slate-400 mt-2">支持 JPG、PNG 等图片格式</p>
          </label>

          <p className="text-xs text-slate-400">图片将作为病历附件保存，方便日后查阅</p>
        </div>
      )}

      {/* Step 1: AI processing */}
      {aiStep === 1 && (
        <BoxLoader message="AI正在识别病例图片，请稍候..." />
      )}

      {/* Step 2: Fill patient information form */}
      {aiStep === 2 && aiResult && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-600">AI识别完成</span>
            </div>
            <p className="text-xs text-slate-600">已自动填充识别到的信息，请核对并补充，然后生成训练方案。</p>
          </div>

          {/* Medical record image preview */}
          <div className="bg-slate-50 rounded-2xl p-3">
            <div className="flex items-center gap-3 mb-2">
              <FileText size={16} className="text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">病历附件</span>
              <button
                onClick={() => { setAiStep(0); setUploadedImage(null); setAiResult(null); setOcrText(''); }}
                className="ml-auto text-xs text-rose-500 hover:text-rose-600 font-medium"
              >
                重新上传
              </button>
            </div>
            <img
              src={uploadedImage}
              alt="病历"
              className="w-full max-h-40 object-contain rounded-xl border border-slate-200"
            />
          </div>

          {/* Basic information */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-slate-100 shadow-sm">
            <h5 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <User size={16} className="text-blue-500" />
              基本信息 <span className="text-rose-500">*</span>
            </h5>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">姓名 *</label>
                <input
                  type="text"
                  value={aiResult.name}
                  onChange={(e) => updateFormField('name', e.target.value)}
                  placeholder="请输入患儿姓名"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">年龄 *</label>
                <input
                  type="text"
                  value={aiResult.age}
                  onChange={(e) => updateFormField('age', e.target.value)}
                  placeholder="如：5岁3个月"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">性别 *</label>
                <select
                  value={aiResult.gender}
                  onChange={(e) => updateFormField('gender', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                >
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">床号 *</label>
                <input
                  type="text"
                  value={aiResult.bedNo}
                  onChange={(e) => updateFormField('bedNo', e.target.value)}
                  placeholder="如：301-1"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-500 mb-1 block">所属科室 *</label>
                <input
                  type="text"
                  value={aiResult.department}
                  onChange={(e) => updateFormField('department', e.target.value)}
                  placeholder="输入科室名称，如：呼吸内科"
                  list="department-list"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                />
                <datalist id="department-list">
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.icon} {dept.name}</option>
                  ))}
                </datalist>
                <p className="text-xs text-slate-400 mt-1">可选择已有科室或输入新科室名称</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-500 mb-1 block">诊断信息 *</label>
                <textarea
                  value={aiResult.diagnosis}
                  onChange={(e) => updateFormField('diagnosis', e.target.value)}
                  placeholder="请输入诊断信息"
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none resize-none bg-white"
                />
              </div>
            </div>
          </div>

          {/* Current rehabilitation problems */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-slate-100 shadow-sm mb-4">
            <h5 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" />
              当下存在的康复问题
            </h5>
            <textarea
              value={aiResult.rehabProblems || ''}
              onChange={(e) => setAiResult({ ...aiResult, rehabProblems: e.target.value })}
              placeholder="描述患儿当前存在的康复问题，如：呼吸功能下降，运动耐力不足等"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none bg-white resize-none"
              rows="3"
            />
          </div>

          {/* Safety alerts */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-slate-100 shadow-sm">
            <h5 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-500" />
              安全提醒
            </h5>
            <div className="flex flex-wrap gap-2 mb-3">
              {aiResult.safetyAlerts.map((alert, i) => (
                <span
                  key={i}
                  className="bg-rose-100 text-rose-600 text-xs px-2.5 py-1 rounded-xl flex items-center gap-1 font-medium"
                >
                  {alert}
                  <button onClick={() => removeSafetyAlert(i)} className="hover:text-rose-700">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAlertInput}
                onChange={(e) => setNewAlertInput(e.target.value)}
                placeholder="添加安全提醒，如：防跌倒"
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addSafetyAlert(newAlertInput);
                    setNewAlertInput('');
                  }
                }}
              />
              <button
                onClick={() => { addSafetyAlert(newAlertInput); setNewAlertInput(''); }}
                className="px-3 py-2 bg-rose-100 text-rose-600 rounded-xl text-sm font-semibold hover:bg-rose-200"
              >
                添加
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {['防跌倒', '过敏体质', '癫痫风险', '禁止负重', '监测血氧'].map(tag => (
                <button
                  key={tag}
                  onClick={() => addSafetyAlert(tag)}
                  className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Treatment plan */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <ClipboardList size={16} className="text-emerald-500" />
                治疗计划（可选）
              </h5>
              <button
                onClick={addTreatmentItem}
                className="text-xs text-blue-500 hover:text-blue-600 font-semibold"
              >
                + 添加项目
              </button>
            </div>
            <div className="mb-3">
              <input
                type="text"
                value={aiResult.treatmentPlan.focus}
                onChange={(e) => setAiResult(prev => ({
                  ...prev,
                  treatmentPlan: { ...prev.treatmentPlan, focus: e.target.value }
                }))}
                placeholder="治疗重点，如：改善呼吸功能，增强运动耐力（总时长20分钟）"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-400 outline-none bg-white"
              />
            </div>
            <div className="space-y-2">
              {aiResult.treatmentPlan.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-xl p-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateTreatmentItem(i, 'name', e.target.value)}
                    placeholder="项目名称"
                    className="flex-1 border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-700 placeholder-slate-400 bg-white"
                  />
                  <input
                    type="text"
                    value={item.duration}
                    onChange={(e) => updateTreatmentItem(i, 'duration', e.target.value)}
                    placeholder="时长"
                    className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-700 placeholder-slate-400 bg-white"
                  />
                  <button
                    onClick={() => removeTreatmentItem(i)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex gap-3 pt-2 pb-4">
            <button
              onClick={() => { setAiStep(0); setAiResult(null); setUploadedImage(null); setOcrText(''); setOcrProgress(0); }}
              className="flex-1 border border-slate-300 text-slate-600 py-3 rounded-xl font-semibold hover:bg-slate-50 transition"
            >
              取消
            </button>
            <ParticleButton
              onClick={handleGeneratePlan}
              disabled={isOcrProcessing}
              variant="cyan"
              className="flex-1 py-3 rounded-xl disabled:opacity-60"
            >
              <Sparkles size={18} />
              生成方案
            </ParticleButton>
            <ParticleButton
              onClick={confirmAdmission}
              disabled={isSavingPatient || isOcrProcessing}
              variant="emerald"
              className={`flex-1 py-3 rounded-xl ${
                isSavingPatient ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSavingPatient ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  建档中...
                </>
              ) : (
                <>
                  <Check size={18} />
                  确认建档
                </>
              )}
            </ParticleButton>
          </div>
        </div>
      )}
    </ModalBase>
  );
};

AIIntakeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  aiStep: PropTypes.number.isRequired,
  setAiStep: PropTypes.func.isRequired,
  aiResult: PropTypes.object,
  setAiResult: PropTypes.func.isRequired,
  uploadedImage: PropTypes.string,
  setUploadedImage: PropTypes.func.isRequired,
  ocrText: PropTypes.string.isRequired,
  setOcrText: PropTypes.func.isRequired,
  ocrProgress: PropTypes.number.isRequired,
  setOcrProgress: PropTypes.func.isRequired,
  handleImageUpload: PropTypes.func.isRequired,
  updateFormField: PropTypes.func.isRequired,
  addSafetyAlert: PropTypes.func.isRequired,
  removeSafetyAlert: PropTypes.func.isRequired,
  addTreatmentItem: PropTypes.func.isRequired,
  updateTreatmentItem: PropTypes.func.isRequired,
  removeTreatmentItem: PropTypes.func.isRequired,
  handleGeneratePlan: PropTypes.func.isRequired,
  confirmAdmission: PropTypes.func.isRequired,
  isOcrProcessing: PropTypes.bool.isRequired,
  isSavingPatient: PropTypes.bool.isRequired,
  departments: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    icon: PropTypes.string,
  })).isRequired,
};

AIIntakeModal.defaultProps = {
  aiResult: null,
  uploadedImage: null,
};

export default AIIntakeModal;
