import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Download, LogOut, Filter, FileText, ChevronRight, X } from 'lucide-react';

interface Report {
  announcementTitle: string;
  adjunctUrl: string;
  announcementTime: string | number;
  [key: string]: any;
}

interface ReportListProps {
  token: string;
  onLogout: () => void;
}

const ReportList: React.FC<ReportListProps> = ({ token, onLogout }) => {
  const [stockCode, setStockCode] = useState('000001');
  const [keyword, setKeyword] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    if (!stockCode) return;
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/reports`, {
        params: { stock_code: stockCode, keyword: keyword || undefined },
        headers: { 'X-Password': token }
      });
      setReports(response.data);
    } catch (err: any) {
      setError('无法获取研报数据，请确认代码');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownload = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : `http://www.cninfo.com.cn/new/announcement/download?bulletinId=${url}`;
    window.open(`/api/download?url=${encodeURIComponent(fullUrl)}&X-Password=${token}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col pb-6">
      {/* H5 Sticky Header */}
      <div className="sticky top-0 z-10 bg-white px-4 py-4 border-b border-gray-100 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-gray-900">A股研报</span>
        </div>
        <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-500 active:bg-gray-100 rounded-full transition-all">
          <LogOut size={20} />
        </button>
      </div>

      {/* Search Section */}
      <div className="p-4 bg-white shadow-sm mb-4">
        <div className="flex flex-col space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={stockCode}
              onChange={(e) => setStockCode(e.target.value)}
              className="w-full bg-gray-100 border-0 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              placeholder="输入股票代码 (如 000001)"
            />
            {stockCode && (
              <button 
                onClick={() => setStockCode('')}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400"
              >
                <X size={14} />
              </button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Filter size={16} />
              </div>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-gray-100 border-0 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                placeholder="关键词 (如 年度报告)"
              />
            </div>
            <button
              onClick={fetchReports}
              disabled={loading}
              className="bg-blue-600 active:bg-blue-700 text-white px-6 rounded-xl font-bold text-sm shadow-md shadow-blue-100 disabled:bg-blue-300 transition-all"
            >
              {loading ? '...' : '搜索'}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 flex-1">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-xs font-medium mb-4 flex items-center">
            <X size={14} className="mr-2" /> {error}
          </div>
        )}

        <div className="space-y-3">
          {reports.length > 0 ? (
            reports.map((report, idx) => (
              <div 
                key={idx} 
                onClick={() => handleDownload(report.adjunctUrl)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 active:bg-gray-50 active:scale-[0.98] transition-all flex justify-between items-start group"
              >
                <div className="flex-1 pr-4">
                  <h3 className="text-[15px] font-bold text-gray-800 leading-snug mb-2 group-active:text-blue-600 transition-colors">
                    {report.announcementTitle}
                  </h3>
                  <div className="flex items-center text-[11px] text-gray-400 font-medium">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-500 mr-2">PDF</span>
                    {typeof report.announcementTime === 'number' 
                      ? new Date(report.announcementTime).toLocaleDateString()
                      : report.announcementTime}
                  </div>
                </div>
                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                  <ChevronRight size={18} />
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Search size={48} className="mb-4 opacity-20" />
              <p className="text-sm">{loading ? '正在调取巨潮数据...' : '没有找到相关报告'}</p>
            </div>
          )}
        </div>
      </div>

      {/* H5 Footer */}
      <div className="text-center mt-8 pb-4">
        <p className="text-[10px] text-gray-300 tracking-widest">© 2026 FRIDAY FINANCE TOOL</p>
      </div>
    </div>
  );
};

export default ReportList;
