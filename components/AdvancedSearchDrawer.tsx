import React, { useState } from 'react';
import { OrderStatusEnum } from '../types';
import { X, Search, RotateCcw } from 'lucide-react';

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: any) => void;
}

export const AdvancedSearchDrawer: React.FC<SearchDrawerProps> = ({ isOpen, onClose, onSearch }) => {
  const [filters, setFilters] = useState({
    orderNo: '',
    customerName: '',
    licensePlate: '',
    orderStatus: '' as unknown as OrderStatusEnum | '',
    startDate: '',
    endDate: ''
  });

  const handleReset = () => {
    const emptyFilters = {
      orderNo: '',
      customerName: '',
      licensePlate: '',
      orderStatus: '' as OrderStatusEnum | '',
      startDate: '',
      endDate: ''
    };
    setFilters(emptyFilters);
    // Don't trigger search on reset automatically, let user click search
  };

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">高级搜索</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 p-6 space-y-5 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">订单编号</label>
              <input
                type="text"
                value={filters.orderNo}
                onChange={(e) => setFilters({...filters, orderNo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="例如：ORD-12345"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">客户姓名</label>
              <input
                type="text"
                value={filters.customerName}
                onChange={(e) => setFilters({...filters, customerName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">车牌号</label>
              <input
                type="text"
                value={filters.licensePlate}
                onChange={(e) => setFilters({...filters, licensePlate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                value={filters.orderStatus}
                onChange={(e) => setFilters({...filters, orderStatus: e.target.value === '' ? '' : Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              >
                <option value="">全部状态</option>
                <option value={OrderStatusEnum.PENDING_PICKUP}>待提货</option>
                <option value={OrderStatusEnum.COMPLETED}>已完成</option>
                <option value={OrderStatusEnum.CANCELLED}>已取消</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日期范围</label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
                />
                <div className="text-center text-gray-400 text-xs">至</div>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
                />
              </div>
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50 flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-white transition-colors"
            >
              <RotateCcw size={16} />
              重置
            </button>
            <button
              onClick={handleSearch}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 transition-opacity"
            >
              <Search size={16} />
              搜索
            </button>
          </div>
        </div>
      </div>
    </>
  );
};