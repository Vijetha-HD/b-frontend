import React, { useState, useEffect } from "react";
import {
  Plus,
  Laptop,
  Star,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react";

const Inventory = ({
  filteredInventory,
  setAddModalOpen,
  setBulkUploadModalOpen,
  warehouses,
  deleteProduct,
  onEdit,
  currentPage,
  totalPages,
  onPageChange,
  filters,
  setFilters,
}) => {
  const [localFilters, setLocalFilters] = useState(filters || {});

  // Sync local state with props when props change (e.g. on reset)
  useEffect(() => {
    setLocalFilters(filters || {});
  }, [filters]);

  // Debounce update to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(localFilters);
    }, 500);
    return () => clearTimeout(timer);
  }, [localFilters, setFilters]);

  const handleFilterChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Immediate update for select to avoid lag feeling
  const handleImmediateFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    // For select, we could update immediately but let's keep consistent debounce or force it.
    // Actually ensuring select updates state is enough, debounce handles the fetch.
  };

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 flex flex-col h-full">
      <div className="p-8 border-b border-slate-50 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-800">
            Master Inventory Control
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBulkUploadModalOpen(true)}
              className="px-5 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center"
            >
              <Upload size={18} className="mr-2" /> Bulk Upload
            </button>
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center"
            >
              <Plus size={20} className="mr-2" /> Add Asset
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Warehouse
            </label>
            <select
              value={localFilters?.warehouseId || ""}
              onChange={(e) =>
                handleFilterChange("warehouseId", e.target.value)
              }
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Stock Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={localFilters?.minStock || ""}
                onChange={(e) => handleFilterChange("minStock", e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={localFilters?.maxStock || ""}
                onChange={(e) => handleFilterChange("maxStock", e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Price Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={localFilters?.minPrice || ""}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={localFilters?.maxPrice || ""}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() =>
                setFilters({
                  warehouseId: "",
                  minStock: "",
                  maxStock: "",
                  minPrice: "",
                  maxPrice: "",
                  category: "",
                })
              }
              className="w-full py-2 bg-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-300 transition-colors text-sm"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[1000px]">
          <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
            <tr>
              <th className="px-8 py-5">Laptop Asset</th>
              <th className="px-8 py-5 text-center">Configuration</th>
              <th className="px-8 py-5 text-center">Warehouse</th>
              <th className="px-8 py-5 text-center">Rating</th>
              <th className="px-8 py-5 text-center">Stock</th>
              <th className="px-8 py-5 text-center">Price</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredInventory.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-blue-50/20 transition-all group"
              >
                <td className="px-8 py-5 flex items-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mr-4 shadow-inner border border-slate-100 group-hover:bg-white transition-all">
                    <Laptop size={22} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-base">
                      {item.brand}
                    </p>
                    <p className="text-xs font-bold text-slate-400">
                      {item.model}
                    </p>
                  </div>
                </td>
                <td className="px-8 py-5 text-center font-bold text-slate-600 text-sm">
                  {item.ram} / {item.ssd}
                </td>
                <td className="px-8 py-5 text-center">
                  {/* <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{item.warehouseId}</span> */}
                  <span className="text-xs font-bold text-slate-700">
                    {warehouses.find((w) => w.id === item.warehouseId)?.name ||
                      "Central Hub"}
                  </span>
                </td>
                <td className="px-8 py-5 text-center font-black text-yellow-500 flex items-center justify-center">
                  <Star size={14} className="fill-current mr-1" /> {item.rating}
                </td>
                <td className="px-8 py-5 text-center font-black text-slate-800 text-lg">
                  {item.count}
                </td>
                <td className="px-8 py-5 text-center font-black text-slate-800">
                  ₹{item.price.toLocaleString()}
                </td>
                <td className="px-8 py-5 text-right flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteProduct(item.id)}
                    className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-6 border-t border-slate-50 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                  currentPage === page
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} className="text-slate-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
