import React from 'react';
import { X } from 'lucide-react';

const BlogModal = ({ isOpen, setBlogModalOpen, handleBlogSubmit, blogToEdit, blogForm, setBlogForm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden animate-in slide-in-from-bottom-8">
                <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-2xl font-black text-slate-800">{blogToEdit ? 'Update Article' : 'Draft Blog'}</h3>
                    <button onClick={() => setBlogModalOpen(false)} className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-red-500 transition-colors"><X size={28} /></button>
                </div>
                <form onSubmit={handleBlogSubmit} className="p-12 space-y-8 overflow-y-auto max-h-[70vh]">
                    <input required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[20px] outline-none font-black text-lg focus:border-blue-500 focus:bg-white transition-all" placeholder="Article Title" value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} />
                    <div className="grid grid-cols-2 gap-8">
                        <input required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[20px] outline-none font-bold text-slate-600 focus:border-blue-500 focus:bg-white transition-all" placeholder="Excerpt" value={blogForm.excerpt} onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })} />
                        <select className="px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[20px] font-black uppercase tracking-widest text-[10px]" value={blogForm.status} onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value })}>
                            <option value="Draft">Draft</option>
                            <option value="Published">Published</option>
                        </select>
                    </div>
                    <textarea rows="6" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[24px] outline-none font-medium text-slate-700 leading-relaxed focus:border-blue-500 focus:bg-white transition-all" placeholder="Article Content" value={blogForm.content} onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}></textarea>
                    <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-blue-700 transition-all">Save Changes</button>
                </form>
            </div>
        </div>
    );
};

export default BlogModal;
