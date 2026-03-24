import React from 'react';
import { Laptop, EyeOff, Eye } from 'lucide-react';

const Login = ({ handleLogin, loginForm, setLoginForm, showPassword, setShowPassword, authError }) => {
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-500">
                <div className="p-12 md:p-16">
                    <div className="flex items-center space-x-3 mb-10">
                        <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-100"><Laptop className="text-white" size={28} /></div>
                        <span className="text-2xl font-black text-blue-900 tracking-tight">Brright<span className="text-blue-500 italic">Laptop</span></span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 leading-tight">Admin Gateway</h2>
                    <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">Authorized Personnel Only</p>
                    <form onSubmit={handleLogin} className="mt-12 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800"
                                placeholder="admin@brightlaptop.com"
                                value={loginForm.email}
                                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Security Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800"
                                    placeholder="••••••••"
                                    value={loginForm.password}
                                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        {authError && <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100">{authError}</div>}
                        <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-blue-700 transition-all active:scale-95">Secure Access Login</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
