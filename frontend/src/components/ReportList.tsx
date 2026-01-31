import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/reports`, {
        params: { stock_code: stockCode, keyword: keyword || undefined },
        headers: { 'X-Password': token }
      });
      setReports(response.data);
    } catch (err: any) {
      setError('Failed to fetch reports. Please check stock code or password.');
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">A-Share Reports</h1>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition"
          >
            Logout
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Code</label>
            <input
              type="text"
              value={stockCode}
              onChange={(e) => setStockCode(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 000001"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Keyword (Optional)</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 2023"
            />
          </div>
          <button
            onClick={fetchReports}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition disabled:bg-blue-300"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.length > 0 ? (
                reports.map((report, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof report.announcementTime === 'number' 
                        ? new Date(report.announcementTime).toLocaleDateString()
                        : report.announcementTime}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {report.announcementTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDownload(report.adjunctUrl)}
                        className="text-blue-600 hover:text-blue-900 font-semibold"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                    {loading ? 'Loading data...' : 'No reports found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportList;
