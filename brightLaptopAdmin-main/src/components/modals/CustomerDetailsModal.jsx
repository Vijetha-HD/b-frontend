import React, { useState, useEffect } from "react";
import {
  X,
  User,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  Clock,
  Volume2,
  Calendar,
  MapPin,
  Phone,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axiosInstance from "../../api/axios.config";
import API_CONFIG from "../../config/api.config";

const CustomerDetailsModal = ({ isOpen, onClose, customer }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [complaints, setComplaints] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (isOpen && customer) {
      if (activeTab === "complaints") {
        fetchCustomerComplaints();
      } else if (activeTab === "orders") {
        fetchCustomerOrders(ordersPage);
      }
    }
  }, [isOpen, customer, activeTab, ordersPage]);

  const fetchCustomerOrders = async (page = 1) => {
    try {
      setLoadingOrders(true);
      const response = await axiosInstance.get(
        API_CONFIG.ENDPOINTS.ORDERS.GET_ALL,
        {
          params: {
            userId: customer.id || customer._id,
            page: page,
            limit: 5, // Smaller limit for modal
          },
        },
      );

      if (response.data.success) {
        setOrders(response.data.data.orders || []);
        if (response.data.pagination) {
          setOrdersTotalPages(response.data.pagination.pages);
        }
      }
    } catch (error) {
      console.error("Error fetching customer orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchCustomerComplaints = async () => {
    try {
      setLoadingComplaints(true);
      const response = await axiosInstance.get(
        API_CONFIG.ENDPOINTS.COMPLAINTS.GET_ALL,
        {
          params: { userId: customer.id || customer._id },
        },
      );

      if (response.data.success) {
        setComplaints(response.data.data.complaints || []);
      }
    } catch (error) {
      console.error("Error fetching customer complaints:", error);
    } finally {
      setLoadingComplaints(false);
    }
  };

  if (!isOpen || !customer) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-orange-50 text-orange-600 border-orange-200";
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "RESOLVED":
        return "bg-green-50 text-green-600 border-green-200";
      case "CLOSED":
        return "bg-gray-50 text-gray-600 border-gray-200";
      // Order Statuses
      case "PENDING":
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "APPROVED":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "SHIPPED":
        return "bg-purple-50 text-purple-600 border-purple-200";
      case "DELIVERED":
        return "bg-green-50 text-green-600 border-green-200";
      case "CANCELLED":
        return "bg-red-50 text-red-600 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col scale-in animate-in slide-in-from-bottom-8">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
          <div>
            <h3 className="text-2xl font-black text-slate-800 leading-none">
              Customer Intelligence
            </h3>
            <p className="text-sm text-slate-400 mt-2 font-medium">
              Detailed insights & history
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-red-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar / Profile Summary */}
          <div className="w-1/3 bg-slate-50/30 border-r border-slate-100 p-8 overflow-y-auto">
            <div className="flex flex-col items-center text-center mb-8">
              <div
                className={`w-24 h-24 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-lg mb-4 ${customer.type === "B2B" ? "bg-indigo-500" : "bg-pink-500"}`}
              >
                {customer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)}
              </div>
              <h2 className="text-xl font-black text-slate-800">
                {customer.name}
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1">
                {customer.email}
              </p>

              <div className="flex gap-2 mt-4">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${customer.type === "B2B" ? "bg-indigo-50 text-indigo-600" : "bg-pink-50 text-pink-600"}`}
                >
                  {customer.type}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${customer.status === "Active" || customer.isVerified ? "bg-green-50 text-green-600" : "bg-slate-200 text-slate-500"}`}
                >
                  {customer.status ||
                    (customer.isVerified ? "Verified" : "Unverified")}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Total Spent
                </div>
                <div className="text-lg font-black text-slate-800">
                  ₹{customer.totalSpent?.toLocaleString() || "0"}
                </div>
              </div>

              {customer.phone && (
                <div className="flex items-center gap-3 text-sm text-slate-600 p-2">
                  <Phone size={16} className="text-slate-400" />
                  <span>{customer.phone}</span>
                </div>
              )}

              {customer.companyName && (
                <div className="flex items-center gap-3 text-sm text-slate-600 p-2">
                  <Building size={16} className="text-slate-400" />
                  <span>{customer.companyName}</span>
                </div>
              )}

              {customer.joinDate && (
                <div className="flex items-center gap-3 text-sm text-slate-600 p-2">
                  <Calendar size={16} className="text-slate-400" />
                  <span>
                    Joined {new Date(customer.joinDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Tabs */}
            <div className="flex border-b border-slate-100 px-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-6 mr-8 font-bold text-sm relative transition-colors ${activeTab === "overview" ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
              >
                Overview
                {activeTab === "overview" && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-slate-900 rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`py-6 mr-8 font-bold text-sm relative transition-colors ${activeTab === "orders" ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
              >
                Orders
                {activeTab === "orders" && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-slate-900 rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("complaints")}
                className={`py-6 font-bold text-sm relative transition-colors ${activeTab === "complaints" ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
              >
                Complaint History
                {activeTab === "complaints" && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-slate-900 rounded-t-full" />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Saved Addresses
                  </h4>
                  {customer.addresses && customer.addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customer.addresses.map((addr, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <MapPin
                              size={18}
                              className="text-blue-500 shrink-0 mt-0.5"
                            />
                            <div>
                              <p className="font-bold text-slate-800 text-sm">
                                {addr.type || "Address"}
                              </p>
                              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                {addr.addressLine1}
                                {addr.addressLine1 && <br />}
                                {addr.addressLine2 && (
                                  <>
                                    {addr.addressLine2}
                                    <br />
                                  </>
                                )}
                                {(addr.city ||
                                  addr.state ||
                                  addr.postalCode ||
                                  addr.zipCode ||
                                  addr.pincode ||
                                  addr.pinCode) && (
                                  <>
                                    {addr.city && `${addr.city}, `}
                                    {addr.state && `${addr.state} `}
                                    {addr.postalCode ||
                                      addr.zipCode ||
                                      addr.pincode ||
                                      addr.pinCode}
                                    <br />
                                  </>
                                )}
                                {addr.country}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200">
                      <p className="text-slate-400 font-bold">
                        No addresses found
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "orders" && (
                <>
                  <div className="space-y-4">
                    {loadingOrders ? (
                      <div className="text-center py-12">
                        <p className="text-slate-400 font-bold animate-pulse">
                          Loading orders...
                        </p>
                      </div>
                    ) : orders.length > 0 ? (
                      orders.map((order) => (
                        <div
                          key={order._id}
                          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex flex-col">
                              <span className="font-black text-slate-800 text-sm">
                                Order #{order._id.slice(-6).toUpperCase()}
                              </span>
                              <span className="text-xs text-slate-400 mt-1">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(order.status)}`}
                            >
                              {order.status}
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            {order.products.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                    {item.quantity}x
                                  </span>
                                  <span className="text-slate-600 font-medium truncate max-w-[200px]">
                                    {item.productId?.name || "Unknown Product"}
                                  </span>
                                </div>
                                <span className="font-bold text-slate-700">
                                  ₹{item.priceAtPurchase?.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Total Amount
                            </span>
                            <span className="font-black text-lg text-slate-800">
                              ₹{order.totalAmount?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16 bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200">
                        <ShoppingBag
                          size={32}
                          className="mx-auto text-slate-300 mb-3"
                        />
                        <p className="text-slate-400 font-bold">
                          No orders found
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          This customer hasn't placed any orders yet
                        </p>
                      </div>
                    )}
                  </div>
                  {activeTab === "orders" && ordersTotalPages > 1 && (
                    <div className="pt-6 border-t border-slate-50 flex items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            setOrdersPage(Math.max(1, ordersPage - 1))
                          }
                          disabled={ordersPage === 1}
                          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft size={20} className="text-slate-600" />
                        </button>

                        {Array.from(
                          { length: ordersTotalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => setOrdersPage(page)}
                            className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                              ordersPage === page
                                ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                                : "text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                        <button
                          onClick={() =>
                            setOrdersPage(
                              Math.min(ordersTotalPages, ordersPage + 1),
                            )
                          }
                          disabled={ordersPage === ordersTotalPages}
                          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight size={20} className="text-slate-600" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === "complaints" && (
                <div className="space-y-4">
                  {loadingComplaints ? (
                    <div className="text-center py-12">
                      <p className="text-slate-400 font-bold animate-pulse">
                        Loading history...
                      </p>
                    </div>
                  ) : complaints.length > 0 ? (
                    complaints.map((complaint) => (
                      <div
                        key={complaint._id}
                        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600">
                            {complaint.category}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(complaint.status)}`}
                          >
                            {complaint.status.replace("_", " ")}
                          </span>
                        </div>

                        <p className="text-slate-800 font-medium mb-3">
                          {complaint.description || (
                            <span className="italic text-slate-400">
                              Voice recording submitted
                            </span>
                          )}
                        </p>

                        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-50">
                          <div className="flex gap-4">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />{" "}
                              {new Date(
                                complaint.createdAt,
                              ).toLocaleDateString()}
                            </span>
                            {complaint.voiceMessage && (
                              <span className="flex items-center gap-1 text-blue-500 font-bold">
                                <Volume2 size={12} /> Audio
                              </span>
                            )}
                          </div>
                          {complaint.orderId && (
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">
                              Order #{complaint.orderId._id?.slice(-6)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16 bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200">
                      <CheckCircle
                        size={32}
                        className="mx-auto text-slate-300 mb-3"
                      />
                      <p className="text-slate-400 font-bold">
                        No registered complaints
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        This customer has a clean record
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
