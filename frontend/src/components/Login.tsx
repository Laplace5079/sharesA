import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Smartphone, ChevronRight } from 'lucide-react';

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/login', { password });
      if (response.data.status === 'success') {
        onLogin(response.data.token);
      }
    } catch (err: any) {
      setError('访问口令错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 pt-20 pb-10">
      {/* Brand Section */}
      <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-6 shadow-blue-100">
        <Smartphone className="text-white w-10 h-10" />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-2">研报助手</h1>
      <p className="text-gray-500 text-sm mb-12">专业的 A 股财报及公告检索工具</p>

      {/* Login Card */}
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
              <Lock size={18} />
            </div>
            <input
              type="password"
              className="w-full bg-gray-50 border-0 border-b-2 border-gray-200 py-4 pl-11 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all text-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入访问口令"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium animate-pulse">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 shadow-xl shadow-gray-200 active:scale-95 transition-all disabled:bg-gray-400"
          >
            <span>{loading ? '验证中...' : '立即开启'}</span>
            {!loading && <ChevronRight size={20} />}
          </button>
        </form>

        <div className="mt-12">
          <div className="flex items-center space-x-2 text-xs text-gray-400 justify-center mb-4">
            <div className="h-[1px] w-8 bg-gray-200"></div>
            <span>快捷演示密码</span>
            <div className="h-[1px] w-8 bg-gray-200"></div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {['friday_A66', 'shares_B88'].map(p => (
              <span 
                key={p} 
                onClick={() => setPassword(p)}
                className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] cursor-pointer hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100 transition-colors"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto text-[10px] text-gray-300">
        POWERED BY FRIDAY ASSISTANT
      </div>
    </div>
  );
};

export default Login;
