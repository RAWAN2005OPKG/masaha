import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiUserAddLine,
  RiShieldUserLine,
  RiCalendarLine,
  RiEdit2Line,
  RiCloseCircleLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiBuildingLine,
  RiDeleteBinLine,
  RiAddCircleLine,
  RiTimeLine,
  RiCheckLine,
  RiInformationLine,
} from 'react-icons/ri';
import PageHeader from '../../components/layout/PageHeader';

const statusStyles = {
  'نشط': 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  'معطل': 'bg-red-50 text-red-500 border border-red-200',
  'منتهي الاشتراك': 'bg-amber-50 text-amber-600 border border-amber-200',
  'قريباً (قيد المراجعة)': 'bg-blue-50 text-blue-600 border border-blue-200',
};

const calculateEndDate = (startDateStr, duration, durationUnit = 'months') => {
  if (!startDateStr) return '';
  const date = new Date(startDateStr);
  if (isNaN(date.getTime())) return '';

  const num = parseInt(duration, 10);
  if (isNaN(num) || num <= 0) return '';

  if (durationUnit === 'days') {
    date.setDate(date.getDate() + num);
  } else if (durationUnit === 'years') {
    date.setFullYear(date.getFullYear() + num);
  } else {
    // months
    date.setMonth(date.getMonth() + num);
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const processAccount = (acc) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = acc.startDate ? new Date(acc.startDate) : null;
  if (start) start.setHours(0, 0, 0, 0);

  const end = acc.endDate ? new Date(acc.endDate) : null;
  if (end) end.setHours(0, 0, 0, 0);

  let status = 'نشط';
  let remainingDays = 0;
  let expiredNotice = false;
  let pendingNotice = false;

  if (start && today < start) {
    status = 'قريباً (قيد المراجعة)';
    pendingNotice = true;
    remainingDays = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
  } else if (end && today > end) {
    status = 'منتهي الاشتراك';
    expiredNotice = true;
  } else if (acc.isManualDisabled) {
    status = 'معطل';
  } else {
    status = 'نشط';
    if (end) {
      remainingDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  };

  return {
    ...acc,
    remainingDays,
    status,
    expiredNotice,
    pendingNotice,
    dateRange: `${formatDate(acc.startDate)} – ${formatDate(acc.endDate)}`,
  };
};

const DEFAULT_DURATIONS = [
  { id: '7_days', label: 'أسبوع (7 أيام)', duration: 7, unit: 'days' },
  { id: '14_days', label: 'أسبوعان (14 يوماً)', duration: 14, unit: 'days' },
  { id: '1_months', label: 'شهر واحد (1)', duration: 1, unit: 'months' },
  { id: '2_months', label: 'شهران (2)', duration: 2, unit: 'months' },
  { id: '3_months', label: '3 أشهر', duration: 3, unit: 'months' },
  { id: '6_months', label: '6 أشهر', duration: 6, unit: 'months' },
  { id: '12_months', label: 'سنة كاملة (12 شهر)', duration: 12, unit: 'months' },
  { id: '24_months', label: 'سنتان (24 شهر)', duration: 24, unit: 'months' },
];

const SpaceOwners = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Available duration options
  const [durationOptions, setDurationOptions] = useState(DEFAULT_DURATIONS);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customValue, setCustomValue] = useState(15);
  const [customUnit, setCustomUnit] = useState('days');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    spaceName: '',
    phone: '',
    region: 'غزة',
    birthDate: '',
    internet: '100 Mbps',
    seats: '',
    electricity: '24/7',
    pricePerHour: '',
    pricePrivate: '',
    priceRoom: '',
    services: '',
    startDate: new Date().toISOString().split('T')[0],
    duration: 3,
    durationUnit: 'months',
  });

  const [formErrors, setFormErrors] = useState({});

  const fetchOwners = () => {
    window.axios
      .get('/api/admin/owners')
      .then((res) => setAccounts(res.data.map(processAccount)))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleEditClick = (id) => {
    window.axios
      .get(`/api/admin/owners/${id}`)
      .then((res) => {
        const dUnit = res.data.durationUnit || 'months';
        const dVal = res.data.duration || 3;

        // Ensure this duration exists in durationOptions
        const optKey = `${dVal}_${dUnit}`;
        if (!durationOptions.some((o) => o.duration === dVal && o.unit === dUnit)) {
          const unitLabel = dUnit === 'days' ? 'أيام' : dUnit === 'years' ? 'سنوات' : 'أشهر';
          setDurationOptions((prev) => [
            ...prev,
            { id: optKey, label: `${dVal} ${unitLabel}`, duration: dVal, unit: dUnit },
          ]);
        }

        setFormData({
          name: res.data.name || '',
          email: res.data.email || '',
          password: '',
          spaceName: res.data.spaceName || '',
          phone: res.data.phone || '',
          region: res.data.region || 'غزة',
          birthDate: res.data.birthDate || '',
          internet: res.data.internet || '100 Mbps',
          seats: res.data.seats || '',
          electricity: res.data.electricity || '24/7',
          pricePerHour: res.data.pricePerHour || '',
          pricePrivate: res.data.pricePrivate || '',
          priceRoom: res.data.priceRoom || '',
          services: res.data.services || '',
          startDate: res.data.startDate || new Date().toISOString().split('T')[0],
          duration: dVal,
          durationUnit: dUnit,
        });
        setEditingId(id);
        setFormErrors({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch((err) => console.error(err));
  };

  const handleDurationSelectChange = (e) => {
    const val = e.target.value;
    if (val === 'custom') {
      setShowCustomModal(true);
      return;
    }
    const [duration, unit] = val.split('_');
    setFormData((prev) => ({
      ...prev,
      duration: parseInt(duration, 10),
      durationUnit: unit,
    }));
  };

  const handleAddCustomDuration = () => {
    const num = parseInt(customValue, 10);
    if (isNaN(num) || num <= 0) {
      alert('يرجى إدخال رقم صحيح أكبر من 0');
      return;
    }

    const unitLabel = customUnit === 'days' ? 'يوم' : customUnit === 'years' ? 'سنة' : 'شهر';
    const optId = `${num}_${customUnit}`;
    const newOpt = {
      id: optId,
      label: `${num} ${unitLabel}`,
      duration: num,
      unit: customUnit,
    };

    if (!durationOptions.some((o) => o.id === optId)) {
      setDurationOptions((prev) => [...prev, newOpt]);
    }

    setFormData((prev) => ({
      ...prev,
      duration: num,
      durationUnit: customUnit,
    }));

    setShowCustomModal(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'الاسم مطلوب';
    if (!formData.email.trim()) errors.email = 'البريد الإلكتروني مطلوب';
    if (!editingId && (!formData.password || formData.password.length < 6)) {
      errors.password = 'كلمة المرور يجب أن لا تقل عن 6 أحرف';
    }
    if (!formData.spaceName.trim()) errors.spaceName = 'اسم المساحة مطلوب';
    if (!formData.phone.trim()) errors.phone = 'رقم الهاتف مطلوب';
    if (!formData.region) errors.region = 'المنطقة مطلوبة';
    if (!formData.birthDate) errors.birthDate = 'تاريخ الميلاد مطلوب';
    if (!formData.seats || parseInt(formData.seats, 10) <= 0) {
      errors.seats = 'إجمالي المقاعد مطلوب ويجب أن يكون أكبر من 0';
    }
    if (!formData.pricePerHour || parseFloat(formData.pricePerHour) <= 0) {
      errors.pricePerHour = 'سعر الموقع العادي مطلوب';
    }
    if (!formData.pricePrivate || parseFloat(formData.pricePrivate) <= 0) {
      errors.pricePrivate = 'سعر الموقع الخاص مطلوب';
    }
    if (!formData.priceRoom || parseFloat(formData.priceRoom) <= 0) {
      errors.priceRoom = 'سعر الغرف الخاصة مطلوب';
    }
    if (!formData.startDate) errors.startDate = 'تاريخ بداية الاشتراك مطلوب';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      alert('يرجى ملء جميع الحقول الإجبارية المؤشرة بنجمة حمراء (*) بشكل صحيح.');
      return;
    }

    const payload = { ...formData };
    if (!payload.duration) payload.duration = 1;
    if (!payload.durationUnit) payload.durationUnit = 'months';

    if (editingId) {
      window.axios
        .put(`/api/admin/owners/${editingId}`, payload)
        .then((res) => {
          fetchOwners();
          cancelEdit();
          alert('تم حفظ التعديلات وتحديث حالة الاشتراك بنجاح.');
        })
        .catch((err) => {
          console.error(err);
          const errorMsg =
            err.response?.data?.message || err.response?.data?.error || 'حدث خطأ أثناء الحفظ';
          alert('حدث خطأ: ' + errorMsg);
        });
    } else {
      window.axios
        .post('/api/admin/owners', payload)
        .then((res) => {
          fetchOwners();
          cancelEdit();
          alert(res.data.message || 'تم إنشاء الحساب بنجاح.');
        })
        .catch((err) => {
          console.error(err);
          const errorMsg =
            err.response?.data?.message ||
            err.response?.data?.error ||
            'تأكد من تعبئة جميع الحقول المطلوبة بشكل صحيح.';
          alert('حدث خطأ: ' + errorMsg);
        });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormErrors({});
    setFormData({
      name: '',
      email: '',
      password: '',
      spaceName: '',
      phone: '',
      region: 'غزة',
      birthDate: '',
      internet: '100 Mbps',
      seats: '',
      electricity: '24/7',
      pricePerHour: '',
      pricePrivate: '',
      priceRoom: '',
      services: '',
      startDate: new Date().toISOString().split('T')[0],
      duration: 3,
      durationUnit: 'months',
    });
  };

  const toggleStatus = (id) => {
    window.axios
      .put(`/api/admin/owners/${id}/toggle-status`)
      .then(() => {
        fetchOwners();
      })
      .catch((err) => console.error(err));
  };

  const handleDelete = (id) => {
    if (
      window.confirm(
        'هل أنت متأكد أنك تريد حذف حساب صاحب المساحة هذا؟ سيتم حذف المساحة وجميع حجوزاتها نهائياً.'
      )
    ) {
      window.axios
        .delete(`/api/admin/owners/${id}`)
        .then(() => {
          setAccounts((prev) => prev.filter((a) => a.id !== id));
          alert('تم حذف صاحب المساحة بنجاح.');
        })
        .catch((err) => console.error(err));
    }
  };

  const computedEndDate = calculateEndDate(
    formData.startDate,
    formData.duration,
    formData.durationUnit
  );

  const selectedDurationKey = `${formData.duration}_${formData.durationUnit}`;

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="حسابات أصحاب المساحات والاشتراكات"
        icon={<RiUserAddLine />}
        role="admin"
        roleIcon={<RiShieldUserLine size={20} />}
      />

      {/* Form Container */}
      <div className="relative bg-white rounded-[45px] border border-slate-100 p-8 md:p-10 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <RiUserAddLine size={24} className="text-violet-600 me-3" />
            <h3 className="text-slate-800 font-black text-xl">
              {editingId ? 'تعديل حساب صاحب المساحة والاشتراك' : 'إضافة صاحب مساحة جديد'}
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            الحقول المعلمة بـ (<span className="text-red-500 font-bold">*</span>) إجبارية
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Name */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600 pr-2 flex items-center gap-1">
              الاسم الكامل <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="محمد الغزاوي"
              className={`w-full bg-slate-50 border rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 transition-all ${
                formErrors.name ? 'border-red-400 bg-red-50/20' : 'border-slate-100'
              }`}
            />
            {formErrors.name && <p className="text-[10px] text-red-500 font-bold pr-2">{formErrors.name}</p>}
          </div>

          {/* 2. Email */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600 pr-2 flex items-center gap-1">
              البريد الإلكتروني <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="owner@masaha.ps"
              className={`w-full bg-slate-50 border rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 transition-all ${
                formErrors.email ? 'border-red-400 bg-red-50/20' : 'border-slate-100'
              }`}
            />
            {formErrors.email && <p className="text-[10px] text-red-500 font-bold pr-2">{formErrors.email}</p>}
          </div>

          {/* 3. Password */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600 pr-2 flex items-center gap-1">
              كلمة المرور {!editingId && <span className="text-red-500">*</span>}{' '}
              {editingId && <span className="text-[10px] text-slate-400">(اتركه فارغاً لعدم التغيير)</span>}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className={`w-full bg-slate-50 border rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 transition-all ${
                formErrors.password ? 'border-red-400 bg-red-50/20' : 'border-slate-100'
              }`}
            />
            {formErrors.password && <p className="text-[10px] text-red-500 font-bold pr-2">{formErrors.password}</p>}
          </div>

          {/* 4. Phone */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600 pr-2 flex items-center gap-1">
              رقم الهاتف <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="059-000-0000"
              className={`w-full bg-slate-50 border rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 transition-all ${
                formErrors.phone ? 'border-red-400 bg-red-50/20' : 'border-slate-100'
              }`}
            />
            {formErrors.phone && <p className="text-[10px] text-red-500 font-bold pr-2">{formErrors.phone}</p>}
          </div>

          {/* 5. Birth Date */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600 pr-2 flex items-center gap-1">
              تاريخ الميلاد <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className={`w-full bg-slate-50 border rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 transition-all ${
                formErrors.birthDate ? 'border-red-400 bg-red-50/20' : 'border-slate-100'
              }`}
            />
            {formErrors.birthDate && <p className="text-[10px] text-red-500 font-bold pr-2">{formErrors.birthDate}</p>}
          </div>

          {/* 6. Space Name */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600 pr-2 flex items-center gap-1">
              اسم المساحة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.spaceName}
              onChange={(e) => setFormData({ ...formData, spaceName: e.target.value })}
              placeholder="مساحة الإبداع والريادة"
              className={`w-full bg-slate-50 border rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 transition-all ${
                formErrors.spaceName ? 'border-red-400 bg-red-50/20' : 'border-slate-100'
              }`}
            />
            {formErrors.spaceName && <p className="text-[10px] text-red-500 font-bold pr-2">{formErrors.spaceName}</p>}
          </div>

          {/* 7. Region */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600 pr-2 flex items-center gap-1">
              المكان / المنطقة <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold outline-none"
            >
              <option value="غزة">غزة</option>
              <option value="الوسطى">الوسطى</option>
              <option value="الجنوب">الجنوب</option>
              <option value="الشمال">الشمال</option>
            </select>
          </div>

          {/* 8. Total Seats */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600 pr-2 flex items-center gap-1">
              إجمالي المقاعد <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.seats}
              onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
              placeholder="40"
              className={`w-full bg-slate-50 border rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 transition-all ${
                formErrors.seats ? 'border-red-400 bg-red-50/20' : 'border-slate-100'
              }`}
            />
            {formErrors.seats && <p className="text-[10px] text-red-500 font-bold pr-2">{formErrors.seats}</p>}
          </div>

          {/* 9. Standard Price */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600 pr-2 flex items-center gap-1">
              سعر الموقع العادي/ساعة (₪) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.5"
              min="1"
              value={formData.pricePerHour}
              onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
              placeholder="15"
              className={`w-full bg-slate-50 border rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 transition-all ${
                formErrors.pricePerHour ? 'border-red-400 bg-red-50/20' : 'border-slate-100'
              }`}
            />
            {formErrors.pricePerHour && (
              <p className="text-[10px] text-red-500 font-bold pr-2">{formErrors.pricePerHour}</p>
            )}
          </div>

          {/* 10. Private Seat Price */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600 pr-2 flex items-center gap-1">
              سعر الموقع الخاص/ساعة (₪) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.5"
              min="1"
              value={formData.pricePrivate}
              onChange={(e) => setFormData({ ...formData, pricePrivate: e.target.value })}
              placeholder="25"
              className={`w-full bg-slate-50 border rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 transition-all ${
                formErrors.pricePrivate ? 'border-red-400 bg-red-50/20' : 'border-slate-100'
              }`}
            />
            {formErrors.pricePrivate && (
              <p className="text-[10px] text-red-500 font-bold pr-2">{formErrors.pricePrivate}</p>
            )}
          </div>

          {/* 11. Private Room Price */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600 pr-2 flex items-center gap-1">
              سعر الغرف الخاصة/ساعة (₪) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.5"
              min="1"
              value={formData.priceRoom}
              onChange={(e) => setFormData({ ...formData, priceRoom: e.target.value })}
              placeholder="45"
              className={`w-full bg-slate-50 border rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 transition-all ${
                formErrors.priceRoom ? 'border-red-400 bg-red-50/20' : 'border-slate-100'
              }`}
            />
            {formErrors.priceRoom && (
              <p className="text-[10px] text-red-500 font-bold pr-2">{formErrors.priceRoom}</p>
            )}
          </div>

          {/* Internet Speed */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600 pr-2">سرعة الإنترنت</label>
            <input
              type="text"
              value={formData.internet}
              onChange={(e) => setFormData({ ...formData, internet: e.target.value })}
              placeholder="100 Mbps"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold focus:outline-none"
            />
          </div>
        </div>

        {/* Services */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-600 pr-2 flex items-center justify-between">
            <span>الخدمات المتوفرة (مفصولة بفاصلة عربية ،)</span>
            <span className="text-[11px] text-slate-400 font-normal">تظهر في صفحة تفاصيل المساحة للمستخدمين</span>
          </label>
          <textarea
            rows="3"
            value={formData.services}
            onChange={(e) => setFormData({ ...formData, services: e.target.value })}
            placeholder="قهوة مجانية، طباعة، خزانة، قاعة اجتماعات، شاشات عرض"
            className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 transition-all"
          ></textarea>
        </div>

        {/* Subscription Duration Section */}
        <div className="bg-gradient-to-r from-violet-50/60 to-purple-50/40 border border-violet-100/80 rounded-[32px] p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-violet-700 font-black text-lg flex items-center gap-2">
              <RiCalendarLine size={22} /> ضبط مدة الاشتراك وصلاحية الوصول
            </h3>
            <span className="text-xs font-bold text-violet-600 bg-white px-3.5 py-1 rounded-full border border-violet-100 shadow-sm flex items-center gap-1.5">
              <RiInformationLine /> يتم احتساب موعد الانتهاء تلقائياً
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 pr-2 flex items-center gap-1">
                تاريخ بداية الاشتراك <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all shadow-sm"
              />
              <p className="text-[10px] text-slate-400 pr-2 font-medium">
                إذا كان التاريخ في المستقبل، فلن يتمكن صاحب المساحة من الدخول وستظهر المساحة "قريباً" للمستخدم.
              </p>
            </div>

            {/* Duration Select with Add Button */}
            <div className="space-y-2">
              <div className="flex justify-between items-center pr-2">
                <label className="text-xs font-black text-slate-700 flex items-center gap-1">
                  مدة الاشتراك <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowCustomModal(true)}
                  className="text-xs text-violet-600 font-black hover:text-violet-800 flex items-center gap-1 transition-colors cursor-pointer bg-white px-2.5 py-1 rounded-xl border border-violet-200 shadow-xs"
                >
                  <RiAddCircleLine size={15} /> إضافة مدة مخصصة
                </button>
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedDurationKey}
                  onChange={handleDurationSelectChange}
                  className="flex-1 bg-white border border-slate-200 rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all shadow-sm"
                >
                  {durationOptions.map((opt) => (
                    <option key={opt.id} value={`${opt.duration}_${opt.unit}`}>
                      {opt.label}
                    </option>
                  ))}
                  <option value="custom">➕ تخصيص مدة أخرى...</option>
                </select>
              </div>

              <p className="text-[10px] text-slate-400 pr-2 font-medium">
                يمكنك اختيار مدة بأيام أو أشهر أو سنوات محددة.
              </p>
            </div>
          </div>

          {/* Computed End Date Indicator Banner */}
          <div className="bg-white/80 backdrop-blur-sm border border-violet-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold">
                <RiTimeLine size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-700">موعد انتهاء الاشتراك المحسوب:</p>
                <p className="text-sm font-black text-violet-600 font-mono mt-0.5">
                  {computedEndDate ? computedEndDate : 'يرجى تحديد تاريخ البداية والمدة'}
                </p>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-500 text-right md:text-left">
              عند حلول هذا الموعد، سيتوقف حساب صاحب المساحة تلقائياً وتختفي المساحة من صفحة المستخدمين حتى يتم التجديد.
            </div>
          </div>

          {/* Inline Custom Duration Box */}
          {showCustomModal && (
            <div className="bg-white border-2 border-violet-400 rounded-2xl p-5 space-y-4 shadow-lg animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-violet-700 flex items-center gap-1.5">
                  <RiAddCircleLine /> إضافة مدة اشتراك مخصصة إلى القائمة
                </h4>
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  إلغاء
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">القيمة (العدد)</label>
                  <input
                    type="number"
                    min="1"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    placeholder="15"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-bold outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">الوحدة</label>
                  <select
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-bold outline-none"
                  >
                    <option value="days">أيام (أقل من شهر)</option>
                    <option value="months">أشهر</option>
                    <option value="years">سنوات</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddCustomDuration}
                    className="w-full bg-violet-600 text-white py-2 px-4 rounded-xl text-xs font-black shadow-md shadow-violet-500/20 hover:bg-violet-700 transition-all flex items-center justify-center gap-1.5"
                  >
                    <RiCheckLine size={16} /> اعتماد وإضافة للقائمة
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit / Cancel Buttons */}
        <div className="flex justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-violet-600 text-white px-9 py-3.5 rounded-2xl font-black shadow-lg shadow-violet-500/25 hover:bg-violet-700 transition-all cursor-pointer flex items-center gap-2"
          >
            <RiCheckLine size={18} />
            {editingId ? 'حفظ تعديلات صاحب المساحة والاشتراك' : 'إنشاء وتفعيل الحساب'}
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            className="bg-white text-slate-500 px-8 py-3.5 rounded-2xl font-black border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>

      {/* Owners List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-black text-slate-800 text-lg">قائمة أصحاب المساحات ({accounts.length})</h3>
          <span className="text-xs text-slate-400 font-bold">يتم تحديث الحالة تلقائياً بناءً على مواعيد الاشتراك</span>
        </div>

        {accounts.map((acc) => (
          <div
            key={acc.id}
            className={`bg-white rounded-[32px] border p-6 shadow-sm space-y-4 transition-all ${
              acc.status === 'منتهي الاشتراك'
                ? 'border-amber-200 bg-amber-50/10'
                : acc.status === 'قريباً (قيد المراجعة)'
                ? 'border-blue-200 bg-blue-50/10'
                : 'border-slate-100'
            }`}
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 ${acc.avatarColor} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm`}
                >
                  {acc.initial}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-slate-800 text-base">{acc.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black ${statusStyles[acc.status]}`}>
                      {acc.status}
                    </span>

                    {acc.status === 'نشط' && acc.remainingDays > 0 && (
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-0.5 rounded-full text-[10px] font-black">
                        متبقي {acc.remainingDays} يوم
                      </span>
                    )}

                    {acc.status === 'قريباً (قيد المراجعة)' && acc.remainingDays > 0 && (
                      <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-0.5 rounded-full text-[10px] font-black">
                        يبدأ بعد {acc.remainingDays} يوم
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-slate-400 font-bold">{acc.email}</p>
                    {acc.phone && <span className="text-xs text-slate-400 font-bold">• {acc.phone}</span>}
                    {acc.birthDate && <span className="text-xs text-slate-400 font-bold">• مواليد {acc.birthDate}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleStatus(acc.id)}
                  title={acc.isManualDisabled ? 'تفعيل الحساب' : 'إيقاف الحساب يدوياً'}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                    acc.isManualDisabled
                      ? 'border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                      : 'border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  {acc.isManualDisabled ? <RiCheckboxCircleLine size={18} /> : <RiCloseCircleLine size={18} />}
                </button>
                <button
                  onClick={() => handleEditClick(acc.id)}
                  title="تعديل الحساب وتجديد الاشتراك"
                  className="w-10 h-10 rounded-xl border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-all cursor-pointer"
                >
                  <RiEdit2Line size={18} />
                </button>
                <button
                  onClick={() => handleDelete(acc.id)}
                  title="حذف صاحب المساحة"
                  className="w-10 h-10 rounded-xl border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all cursor-pointer"
                >
                  <RiDeleteBinLine size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold text-slate-500 flex-wrap justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-slate-600">
                  <RiBuildingLine className="text-violet-500" /> {acc.spaceName || 'مساحة العمل'}
                </span>
                <span className="text-slate-200">•</span>
                <span className="flex items-center gap-1 text-slate-600">
                  <RiCalendarLine className="text-violet-500" /> فترة الاشتراك: {acc.dateRange}
                </span>
              </div>

              {acc.status === 'منتهي الاشتراك' && (
                <button
                  type="button"
                  onClick={() => handleEditClick(acc.id)}
                  className="text-xs font-black text-amber-700 bg-amber-100/70 hover:bg-amber-200 px-3.5 py-1 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RiEdit2Line /> تجديد الاشتراك الآن
                </button>
              )}
            </div>

            {acc.expiredNotice && (
              <p className="text-[11px] text-amber-700 font-bold flex items-center gap-2 bg-amber-50 rounded-xl px-4 py-2.5 border border-amber-200/60">
                <RiAlertLine className="shrink-0 text-amber-600" /> انتهى الاشتراك: تم تعطيل دخول صاحب المساحة للوحة التحكم وإخفاء المساحة من صفحة المستخدمين تلقائياً. لتفعيلها اضغط على زر التجديد أعلاه.
              </p>
            )}

            {acc.pendingNotice && (
              <p className="text-[11px] text-blue-700 font-bold flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-2.5 border border-blue-200/60">
                <RiInformationLine className="shrink-0 text-blue-600" /> موعد الاشتراك في المستقبل: الحساب قيد المراجعة ولا يمكنه الدخول للوحة التحكم حتى يحين الموعد، وتظهر المساحة للمستخدمين بحالة "قريباً".
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const EditSpaceOwner = () => {
  return <SpaceOwners />;
};

export default SpaceOwners;
