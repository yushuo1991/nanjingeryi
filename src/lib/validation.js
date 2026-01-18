export function validatePatient(patient) {
  const errors = [];

  if (!patient.name || !patient.name.trim()) {
    errors.push('患者姓名不能为空');
  }

  if (patient.phone && !/^1[3-9]\d{9}$/.test(patient.phone)) {
    errors.push('请输入有效的手机号码');
  }

  if (patient.birthDate) {
    const birthDate = new Date(patient.birthDate);
    const today = new Date();
    if (birthDate > today) {
      errors.push('出生日期不能晚于今天');
    }
    const age = (today - birthDate) / (1000 * 60 * 60 * 24 * 365.25);
    if (age > 18) {
      errors.push('儿童医院系统仅接受18岁以下患者');
    }
  }

  if (patient.bedNo && !/^\d+$/.test(patient.bedNo)) {
    errors.push('床号应为数字');
  }

  return errors;
}

export function validateRecord(record) {
  const errors = [];

  if (!record.title || !record.title.trim()) {
    errors.push('记录标题不能为空');
  }

  if (!record.date) {
    errors.push('记录日期不能为空');
  }

  if (record.date) {
    const recordDate = new Date(record.date);
    const today = new Date();
    if (recordDate > today) {
      errors.push('记录日期不能晚于今天');
    }
  }

  return errors;
}
