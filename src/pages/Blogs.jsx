import React from 'react';
import { Plus, User, Edit2, Trash2 } from 'lucide-react';

const Blogs = ({ blogs, authUser, setBlogToEdit, setBlogForm, setBlogModalOpen, setBlogs }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black text-slate-800 leading-none">Article Management</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">SEO & Marketing Content</p>
                </div>
                <button
                    onClick={() => {
                        setBlogToEdit(null);
                        setBlogForm({ title: '', excerpt: '', content: '', author: authUser.name, status: 'Draft' });
                        setBlogModalOpen(true);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-lg hover:bg-blue-700 transition-all flex items-center"
                >
                    <Plus size={20} className="mr-2" /> Draft News
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {blogs.map(blog => (
                    <div key={blog.id} className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${blog.status === 'Published' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                                    {blog.status}
                                </span>
                                <h4 className="text-xl font-black text-slate-800 mt-4 group-hover:text-blue-600 transition-colors">{blog.title}</h4>
                            </div>
                        </div>
                        <p className="mt-4 text-slate-500 text-sm font-medium line-clamp-2">{blog.excerpt}</p>
                        <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-8">
                            <div className="flex items-center text-slate-400 font-bold text-xs">
                                <User size={14} className="mr-2" /> <span>{blog.author}</span>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => { setBlogToEdit(blog); setBlogForm(blog); setBlogModalOpen(true); }}
                                    className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => setBlogs(blogs.filter(b => b.id !== blog.id))}
                                    className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Blogs;
