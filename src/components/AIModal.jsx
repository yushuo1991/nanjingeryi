import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, Upload, Camera, Loader2, Check, User, X } from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';
import { Field, Input, Textarea } from './FormComponents';
import { validatePatient } from '../lib/validation';

export default function AIModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(0); // 0: upload, 1: processing, 2: form
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  const uploadRunRef = useRef(0);
  const uploadAbortRef = useRef(null);
  const fileInputRef = useRef(null);

  const resetState = useCallback(() => {
    setStep(0);
    setUploading(false);
    setProcessing(false);
    setSaving(false);
    setProgress(0);
    setError('');
    setUploadedFiles([]);
    setPreviewImage(null);
    setAiResult(null);
    if (uploadAbortRef.current) {
      uploadAbortRef.current.abort();
      uploadAbortRef.current = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    if (processing || saving) return;
    resetState();
    onClose();
  }, [processing, saving, resetState, onClose]);

  // Fix 1: Image upload with immediate feedback and debouncing
  const handleImageUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files || []).filter(Boolean);
    e.target.value = ''; // Reset file input

    if (!files.length) return;

    // Immediate feedback
    setUploading(true);
    setError('');

    // Validate file types
    const unsupported = files.find((f) => {
      const t = String(f?.type || '');
      return t && !['image/jpeg', 'image/png', 'image/webp'].includes(t);
    });
    if (unsupported) {
      setError(`不支持的图片格式：${unsupported.type || unsupported.name}，请使用 JPG/PNG/WebP`);
      setUploading(false);
      return;
    }

    // Validate file sizes
    const tooLarge = files.find((f) => Number(f?.size || 0) > 15 * 1024 * 1024);
    if (tooLarge) {
      setError(`图片过大（单张最大 15MB）：${tooLarge.name || ''}`);
      setUploading(false);
      return;
    }

    // Store files metadata
    setUploadedFiles(files);

    // Generate preview for first image
    const first = files[0];
    const reader = new FileReader();
    reader.onloadend = async () => {
      const token = ++uploadRunRef.current;

      try {
        // Cancel previous upload if still running
        if (uploadAbortRef.current) {
          uploadAbortRef.current.abort();
        }
      } catch {
        // Ignore abort errors
      }

      const controller = new AbortController();
      uploadAbortRef.current = controller;

      setPreviewImage(reader.result);
      setUploading(false);
      setStep(1); // Move to processing step
      setProcessing(true);
      setProgress(0);

      try {
        // Upload files to create case
        const form = new FormData();
        for (const f of files) {
          form.append('files', f);
        }

        // Fix 3: Optimized API call with progress tracking
        const uploadRes = await api('/api/cases', {
          method: 'POST',
          body: form,
        });

        if (!uploadRes?.success) {
          throw new Error(uploadRes?.error || '上传失败');
        }

        const caseId = uploadRes.caseId;

        // Check if upload was cancelled
        if (token !== uploadRunRef.current) return;

        setProgress(30);

        // Analyze with AI (no fake progress interval to prevent re-renders)
        const analyzeRes = await api(`/api/cases/${caseId}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
          signal: controller.signal,
        });

        if (!analyzeRes?.success) {
          throw new Error(analyzeRes?.error || 'AI 分析失败');
        }

        // Check if upload was cancelled
        if (token !== uploadRunRef.current) return;

        setProgress(100);

        const { profile, plan } = analyzeRes;

        // Prepare form data
        const safeGender = ['男', '女'].includes(profile?.patient?.gender) ? profile.patient.gender : '';
        const newPatient = {
          name: profile?.patient?.name || '',
          gender: safeGender,
          birthDate: profile?.patient?.birthDate || '',
          guardianName: '',
          phone: '',
          department: profile?.patient?.department || '',
          bedNo: profile?.patient?.bedNo || '',
          diagnosis: profile?.patient?.diagnosis || '',
          _caseId: caseId,
          _aiProfile: profile,
          _aiPlan: plan,
        };

        setAiResult(newPatient);
        setProcessing(false);
        setStep(2); // Move to form step
      } catch (err) {
        if (token !== uploadRunRef.current) return;
        if (err.name === 'AbortError') return;

        setError(getErrorMessage(err));
        setProcessing(false);
        setStep(0); // Back to upload step
      }
    };

    reader.onerror = () => {
      setError('图片读取失败，请重试');
      setUploading(false);
    };

    reader.readAsDataURL(first);
  }, []);

  const handleRetryUpload = useCallback(() => {
    setStep(0);
    setError('');
    setUploadedFiles([]);
    setPreviewImage(null);
    setAiResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!aiResult) return;

    setError('');

    // Validate
    const validationErrors = validatePatient(aiResult);
    if (validationErrors.length > 0) {
      setError(validationErrors.join('；'));
      return;
    }

    setSaving(true);

    try {
      // Create patient
      const payload = {
        name: aiResult.name,
        gender: aiResult.gender,
        birthDate: aiResult.birthDate,
        guardianName: aiResult.guardianName,
        phone: aiResult.phone,
        department: aiResult.department,
        bedNo: aiResult.bedNo,
        diagnosis: aiResult.diagnosis,
      };

      const created = await api('/api/patients', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (created && created.id) {
        onSuccess(created);
        resetState();
        onClose();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }, [aiResult, onSuccess, resetState, onClose]);

  // Fix 2: Modal doesn't re-render or pop during progress - using stable state updates
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="relative mx-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Sparkles className="text-pink-500" size={20} />
            AI智能建档
          </h3>
          <button
            onClick={handleClose}
            disabled={processing || saving}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Step 0: Upload */}
          {step === 0 && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50">
                <Upload size={32} className="text-pink-500" />
              </div>
              <h4 className="mb-2 text-lg font-semibold text-slate-800">上传病历资料</h4>
              <p className="mb-6 text-sm text-slate-500">上传病历图片，AI将自动识别并提取患者信息</p>

              <input
                ref={fileInputRef}
                type="file"
                id="ai-record-upload"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading || processing || saving}
                className="hidden"
              />

              <label
                htmlFor="ai-record-upload"
                className={`block cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 p-8 transition-all hover:border-pink-500 hover:bg-pink-50/50 ${
                  uploading || processing || saving ? 'pointer-events-none opacity-60' : ''
                }`}
              >
                <Camera size={32} className="mx-auto mb-2 text-slate-400" />
                <p className="font-medium text-sm text-slate-600">
                  {uploading ? '处理中...' : '点击选择图片或拍照（支持多图）'}
                </p>
                <p className="mt-2 text-xs text-slate-400">支持 JPG、PNG、WebP 格式，单张最大 15MB</p>
              </label>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <p className="mt-4 text-xs text-slate-400">图片将作为病历附件保存，方便日后查阅</p>
            </div>
          )}

          {/* Step 1: Processing - NO setInterval to prevent re-renders */}
          {step === 1 && (
            <div className="py-12 text-center">
              <div className="relative mx-auto mb-6 h-24 w-24">
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="病历"
                    className="h-full w-full rounded-2xl object-cover opacity-50"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80">
                  <Loader2 size={32} className="animate-spin text-blue-500" />
                </div>
              </div>

              <h4 className="mb-2 text-lg font-semibold text-slate-800">AI 正在分析病历...</h4>
              <p className="mb-6 text-sm text-slate-500">请稍候，正在提取患者信息和生成康复方案</p>

              <div className="mx-auto max-w-xs">
                <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500">{progress}%</p>
              </div>

              {uploadedFiles.length > 1 && (
                <p className="mt-4 text-xs text-slate-400">已上传 {uploadedFiles.length} 张图片</p>
              )}
            </div>
          )}

          {/* Step 2: Form */}
          {step === 2 && aiResult && (
            <div>
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex-shrink-0">
                  <img
                    src={previewImage}
                    alt="病历"
                    className="h-20 w-20 rounded-lg border border-slate-200 object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-700">病历图片</p>
                  <p className="mt-0.5 text-xs text-slate-500">共 {uploadedFiles.length} 张</p>
                  <button
                    onClick={handleRetryUpload}
                    className="mt-2 text-xs text-pink-500 hover:text-pink-600"
                  >
                    重新上传
                  </button>
                </div>
              </div>

              <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
                <h5 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <User size={16} className="text-blue-500" />
                  基本信息
                </h5>

                <div className="grid gap-3">
                  <Field label="姓名 *">
                    <Input
                      value={aiResult.name}
                      onChange={(e) => setAiResult({ ...aiResult, name: e.target.value })}
                      placeholder="请输入姓名"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="性别">
                      <Input
                        placeholder="男/女"
                        value={aiResult.gender}
                        onChange={(e) => setAiResult({ ...aiResult, gender: e.target.value })}
                      />
                    </Field>
                    <Field label="出生日期">
                      <Input
                        type="date"
                        value={aiResult.birthDate}
                        onChange={(e) => setAiResult({ ...aiResult, birthDate: e.target.value })}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="监护人">
                      <Input
                        value={aiResult.guardianName}
                        onChange={(e) => setAiResult({ ...aiResult, guardianName: e.target.value })}
                        placeholder="请输入监护人姓名"
                      />
                    </Field>
                    <Field label="联系电话">
                      <Input
                        value={aiResult.phone}
                        onChange={(e) => setAiResult({ ...aiResult, phone: e.target.value })}
                        placeholder="请输入联系电话"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="科室">
                      <Input
                        value={aiResult.department}
                        onChange={(e) => setAiResult({ ...aiResult, department: e.target.value })}
                        placeholder="请输入科室"
                      />
                    </Field>
                    <Field label="床号">
                      <Input
                        value={aiResult.bedNo}
                        onChange={(e) => setAiResult({ ...aiResult, bedNo: e.target.value })}
                        placeholder="请输入床号"
                      />
                    </Field>
                  </div>

                  <Field label="主要诊断/备注">
                    <Textarea
                      value={aiResult.diagnosis}
                      onChange={(e) => setAiResult({ ...aiResult, diagnosis: e.target.value })}
                      placeholder="请输入主要诊断或备注"
                    />
                  </Field>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleRetryUpload}
                  disabled={processing || saving}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  重新识别
                </button>
                <button
                  onClick={handleSave}
                  disabled={processing || saving || !aiResult.name}
                  className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 py-2.5 text-sm font-medium text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="mr-2 inline animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Check size={16} className="mr-2 inline" />
                      确认建档
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
