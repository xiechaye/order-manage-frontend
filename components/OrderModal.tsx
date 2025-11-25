
import React, { useEffect, useState } from 'react';
import { Order, OrderStatusEnum } from '../types';
import { X, Save } from 'lucide-react';

interface OrderModalProps {
  isOpen: boolean;
  type: 'create' | 'edit' | 'view';
  order?: Order;
  onClose: () => void;
  onSubmit: (data: Partial<Order>) => Promise<void>;
}

export const OrderModal: React.FC<OrderModalProps> = ({ isOpen, type, order, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<Order>>({
    orderNo: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    licensePlate: '',
    productName: '',
    productQuantity: 1,
    orderStatus: OrderStatusEnum.PENDING_PICKUP,
    remarks: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (type === 'create') {
        setFormData({
          orderNo: '', // Backend generates this
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          licensePlate: '',
          productName: '',
          productQuantity: 1,
          orderStatus: OrderStatusEnum.PENDING_PICKUP,
          remarks: ''
        });
      } else if (order) {
        setFormData({ ...order });
      }
      setErrors({});
    }
  }, [isOpen, type, order]);

  if (!isOpen) return null;

  const isReadOnly = type === 'view';
  const title = type === 'create' ? '创建新订单' : type === 'edit' ? '编辑订单' : '订单详情';

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerName?.trim()) newErrors.customerName = '请输入客户姓名';
    if (!formData.customerPhone?.trim()) {
      newErrors.customerPhone = '请输入手机号';
    } else if (!/^\d{11}$/.test(formData.customerPhone)) {
      newErrors.customerPhone = '手机号格式不正确';
    }
    if (!formData.productName?.trim()) newErrors.productName = '请输入产品名称';
    if (!formData.productQuantity || formData.productQuantity <= 0) newErrors.productQuantity = '数量必须大于0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setSubmitting(true);
      try {
        await onSubmit(formData);
        onClose();
      } catch (err) {
        console.error(err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const inputClass = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isReadOnly ? 'bg-gray-100 text-gray-500' : 'bg-white border-gray-300'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">订单编号</label>
              <input
                type="text"
                value={type === 'create' ? '系统自动生成' : formData.orderNo}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">客户姓名 <span className="text-danger">*</span></label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                disabled={isReadOnly}
                className={inputClass}
              />
              {errors.customerName && <p className="text-danger text-xs mt-1">{errors.customerName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">手机号 <span className="text-danger">*</span></label>
              <input
                type="text"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                disabled={isReadOnly}
                className={inputClass}
              />
              {errors.customerPhone && <p className="text-danger text-xs mt-1">{errors.customerPhone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">电子邮箱</label>
              <input
                type="email"
                value={formData.customerEmail || ''}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                disabled={isReadOnly}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">车牌号</label>
              <input
                type="text"
                value={formData.licensePlate || ''}
                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                disabled={isReadOnly}
                className={inputClass}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                 value={formData.orderStatus}
                 onChange={(e) => setFormData({...formData, orderStatus: Number(e.target.value)})}
                 disabled={isReadOnly}
                 className={inputClass}
              >
                <option value={OrderStatusEnum.PENDING_PICKUP}>待提货</option>
                <option value={OrderStatusEnum.COMPLETED}>已完成</option>
                <option value={OrderStatusEnum.CANCELLED}>已取消</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">产品名称 <span className="text-danger">*</span></label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                disabled={isReadOnly}
                className={inputClass}
              />
               {errors.productName && <p className="text-danger text-xs mt-1">{errors.productName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">数量 <span className="text-danger">*</span></label>
              <input
                type="number"
                value={formData.productQuantity}
                onChange={(e) => setFormData({ ...formData, productQuantity: parseInt(e.target.value) || 0 })}
                disabled={isReadOnly}
                className={inputClass}
              />
               {errors.productQuantity && <p className="text-danger text-xs mt-1">{errors.productQuantity}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea
              value={formData.remarks || ''}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              disabled={isReadOnly}
              rows={3}
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              取消
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                <Save size={16} />
                {submitting ? '保存中...' : '保存'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
