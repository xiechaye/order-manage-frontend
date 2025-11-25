
import React, { useState } from 'react';
import { Search, Car, Calendar, Package, User, Hash, ArrowRight, Eye } from 'lucide-react';
import { searchOrders } from '../services/api';
import { Order, OrderStatusEnum } from '../types';
import { OrderModal } from './OrderModal';
import dayjs from 'dayjs';

export const HomePage: React.FC = () => {
  const [licensePlate, setLicensePlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    selectedOrder?: Order;
  }>({ isOpen: false });

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!licensePlate.trim()) return;

    setLoading(true);
    try {
      // Search by license plate
      const res = await searchOrders({
        currentPage: 1,
        pageSize: 50, // Fetch enough history
        licensePlate: licensePlate.trim()
      });

      if (res.code === 200 && res.data) {
        setOrders(res.data.records);
      } else {
        setOrders([]);
      }
      setHasSearched(true);
    } catch (error) {
      console.error('Search failed', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatusEnum) => {
    switch (status) {
      case OrderStatusEnum.PENDING_PICKUP: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case OrderStatusEnum.COMPLETED: return 'bg-green-100 text-green-800 border-green-200';
      case OrderStatusEnum.CANCELLED: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: OrderStatusEnum) => {
    switch (status) {
      case OrderStatusEnum.PENDING_PICKUP: return '待提货';
      case OrderStatusEnum.COMPLETED: return '已完成';
      case OrderStatusEnum.CANCELLED: return '已取消';
      default: return '未知';
    }
  };

  // Render the centered Hero Search view if no search has been performed yet
  if (!hasSearched) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
            <Car size={40} className="text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">订单快速查询</h1>
          <p className="text-lg text-gray-500 max-w-lg mx-auto">
            请输入车牌号码查询关联的历史订单记录及详细状态。
          </p>
        </div>

        <div className="w-full max-w-xl px-4">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-32 py-4 border-2 border-gray-200 rounded-full leading-5 bg-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg shadow-sm hover:border-gray-300"
              placeholder="请输入车牌号码 (例如: 粤A88888)"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !licensePlate.trim()}
              className="absolute inset-y-2 right-2 px-6 flex items-center bg-primary text-white rounded-full font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  查询
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </button>
          </form>
          <div className="mt-4 flex justify-center gap-4 text-sm text-gray-400">
            <span>支持模糊搜索</span>
            <span>•</span>
            <span>实时数据同步</span>
          </div>
        </div>
      </div>
    );
  }

  // Render Results View
  return (
    <div className="space-y-6 animate-fade-in-down">
      {/* Search Bar Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
             <Car className="text-primary" size={20} />
             搜索结果: <span className="text-primary">{licensePlate}</span>
           </h2>
           <p className="text-sm text-gray-500 mt-1">
             共找到 {orders.length} 条相关订单记录
           </p>
        </div>
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <input
            type="text"
            className="block w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="输入车牌号继续查询..."
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-primary"
          >
            <Search size={18} />
          </button>
        </form>
      </div>

      {loading ? (
         <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">正在查找订单信息...</p>
         </div>
      ) : orders.length === 0 ? (
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关订单</h3>
            <p className="text-gray-500">
              车牌号 "{licensePlate}" 没有关联的历史订单记录。
            </p>
            <button 
              onClick={() => { setHasSearched(false); setLicensePlate(''); }}
              className="mt-6 text-primary hover:text-primary/80 font-medium"
            >
              返回重新搜索
            </button>
         </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Hash size={14} />
                      {order.orderNo}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{order.productName}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                    {getStatusText(order.orderStatus)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-400">{order.customerPhone}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                     <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Package size={16} className="text-gray-400" />
                    </div>
                    <div>
                      <span className="text-gray-500">数量: </span>
                      <span className="font-medium text-gray-900">{order.productQuantity}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Calendar size={16} className="text-gray-400" />
                    </div>
                    <div>
                      <span className="text-gray-500">创建时间: </span>
                      <span className="text-gray-900">{dayjs(order.createdAt).format('YYYY-MM-DD HH:mm')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                 <div className="text-xs text-gray-400">
                    最后更新: {dayjs(order.updatedAt).format('MM-DD HH:mm')}
                 </div>
                 <button 
                   onClick={() => setModalState({ isOpen: true, selectedOrder: order })}
                   className="text-sm font-medium text-primary hover:text-blue-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                   查看详情 <ArrowRight size={14} />
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reusing OrderModal in 'view' mode */}
      <OrderModal
        isOpen={modalState.isOpen}
        type="view"
        order={modalState.selectedOrder}
        onClose={() => setModalState({ isOpen: false, selectedOrder: undefined })}
        onSubmit={async () => {}} // No-op for view mode
      />
    </div>
  );
};
