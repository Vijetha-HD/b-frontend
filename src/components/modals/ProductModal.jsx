import React, { useState, useRef } from "react";
import { X, Upload, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useProducts } from "../../hooks/useProducts.js";
import { useUpload } from "../../hooks/useUpload.js";
import { useCategories } from "../../hooks/useCategories.js";
import { useBrands } from "../../hooks/useBrands.js";
import { useSpecifications } from "../../hooks/useSpecifications.js";
import { validateProductData } from "../../utils/validation.js";
import {
  PRODUCT_CONDITIONS,
  DEFAULT_VALUES,
  FIELD_LABELS,
} from "../../utils/constants.js";

const ProductModal = ({
  isOpen,
  setAddModalOpen,
  onProductCreated,
  productToEdit,
  warehouses,
}) => {
  const { create, update, loading: productLoading } = useProducts();
  const { uploadMultiple, loading: uploadLoading } = useUpload();
  const {
    categories,
    loading: categoriesLoading,
    createNewCategory,
  } = useCategories();
  const { brands, loading: brandsLoading, createNewBrand } = useBrands();
  const { specifications, loading: specsLoading } = useSpecifications();

  const fileInputRef = useRef(null);

  // Form state - organized by sections
  const [formData, setFormData] = useState({
    // Basic Information (Required)
    name: "",
    description: "",
    images: [],
    brand: "",
    category: "",

    // Pricing
    basePrice: "",
    mrp: "",
    discountPercentage: 0,
    b2bPrice: "",
    gstPercentage: DEFAULT_VALUES.GST_PERCENTAGE,
    moq: DEFAULT_VALUES.MOQ,
    bulkPricing: [],

    // Stock & Inventory
    stock: "",
    warehouseId: "", // Add warehouseId
    soldCount: 0,

    // Ratings & Reviews
    rating: DEFAULT_VALUES.RATING,
    reviewsCount: DEFAULT_VALUES.REVIEWS_COUNT,
    liveViewers: DEFAULT_VALUES.LIVE_VIEWERS,

    // Specifications
    specifications: {
      screenSize: "",
      resolution: "",
      screenType: "",
      processor: "",
      generation: "",
      ram: "",
      storage: "",
      touch: false,
      battery: "",
      adapter: "",
    },

    // Configuration Variants
    configurationVariants: [],

    // Warranty
    defaultWarranty: DEFAULT_VALUES.DEFAULT_WARRANTY,
    warrantyOptions: [],
    warrantyRenewalOptions: [],

    // Shipping
    shipping: {
      freeShipping: DEFAULT_VALUES.FREE_SHIPPING,
      estimatedDeliveryDays: DEFAULT_VALUES.ESTIMATED_DELIVERY_DAYS,
    },

    // Offers
    offers: {
      exchangeOffer: false,
      exchangeDiscountPercentage: 0,
      noCostEMI: false,
      bankOffers: false,
    },
  });

  // UI State
  const [errors, setErrors] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    pricing: false,
    ratings: false,
    specifications: false,
    warranty: false,
    warrantyRenewal: false,
    shipping: false,
    offers: false,
  });
  const [uploadedImages, setUploadedImages] = useState([]);

  // New Category State
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // New Brand State
  const [showBrandInput, setShowBrandInput] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");

  // Populate form on Edit
  React.useEffect(() => {
    if (isOpen && productToEdit) {
      setFormData({
        ...DEFAULT_VALUES, // Base defaults
        ...productToEdit, // Override with product data
        // Handle populated fields (category, warehouseId) if they come as objects
        category: productToEdit.category?._id || productToEdit.category || "",
        warehouseId:
          productToEdit.warehouseId?._id || productToEdit.warehouseId || "",
        soldCount: productToEdit.soldCount || 0,
      });
      // If images are already URLs, handle them visually
      if (productToEdit.images) {
        setUploadedImages(productToEdit.images || []);
      }
      // Auto-expand Warranty Renewal section if product has renewal options saved
      if ((productToEdit.warrantyRenewalOptions || []).length > 0) {
        setExpandedSections((prev) => ({ ...prev, warrantyRenewal: true }));
      }
    } else if (isOpen && !productToEdit) {
      // Reset for Add mode
      setFormData({
        name: "",
        description: "",
        images: [],
        brand: "",
        condition: DEFAULT_VALUES.CONDITION,
        category: "",
        basePrice: "",
        mrp: "",
        discountPercentage: 0,
        b2bPrice: "",
        gstIncluded: DEFAULT_VALUES.GST_INCLUDED,
        gstPercentage: DEFAULT_VALUES.GST_PERCENTAGE,
        moq: DEFAULT_VALUES.MOQ,
        bulkPricing: [],
        stock: "",
        warehouseId: "",
        soldCount: 0,
        rating: DEFAULT_VALUES.RATING,
        reviewsCount: DEFAULT_VALUES.REVIEWS_COUNT,
        liveViewers: DEFAULT_VALUES.LIVE_VIEWERS,
        specifications: {
          screenSize: "",
          resolution: "",
          screenType: "",
          processor: "",
          generation: "",
          ram: "",
          storage: "",
          touch: false,
          battery: "",
          adapter: "",
        },
        configurationVariants: [],
        defaultWarranty: DEFAULT_VALUES.DEFAULT_WARRANTY,
        warrantyOptions: [],
        warrantyRenewalOptions: [],
        shipping: {
          freeShipping: DEFAULT_VALUES.FREE_SHIPPING,
          estimatedDeliveryDays: DEFAULT_VALUES.ESTIMATED_DELIVERY_DAYS,
        },
        offers: {
          exchangeOffer: false,
          exchangeDiscountPercentage: 0,
          noCostEMI: false,
          bankOffers: false,
        },
      });
      setUploadedImages([]);
    }
  }, [isOpen, productToEdit]);

  // Effect: Calculate Base Price based on MRP and Discount Percentage
  // 🔹 Auto Calculate Base Price (MRP → GST ignored → Discount applied)
  React.useEffect(() => {
    const mrp = parseFloat(formData.mrp) || 0;
    const discount = parseFloat(formData.discountPercentage) || 0;

    if (mrp > 0) {
      const discountAmount = (mrp * discount) / 100;
      // Formula: Base Price = MRP - Discount (GST calculations are separate display only)
      const calculatedBase = mrp - discountAmount;

      setFormData((prev) => ({
        ...prev,
        basePrice: calculatedBase.toFixed(2),
      }));
    }
  }, [formData.mrp, formData.discountPercentage]);

  // Effect: Sync B2B Price and MOQ to first Bulk Pricing Tier
  // 🔹 Auto Sync B2B + MOQ to First Bulk Tier
  React.useEffect(() => {
    const b2b = parseFloat(formData.b2bPrice) || 0;
    const moq = parseInt(formData.moq) || 0;

    if (b2b > 0 && moq > 0) {
      setFormData((prev) => {
        const updated = [...prev.bulkPricing];

        const firstTier = { minQty: moq, price: b2b };

        if (updated.length > 0) {
          updated[0] = firstTier;
        } else {
          updated.push(firstTier);
        }

        return { ...prev, bulkPricing: updated };
      });
    }
  }, [formData.b2bPrice, formData.moq]);

  if (!isOpen) return null;

  // Handle input changes
  const handleChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle image upload
  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Clear previous upload errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.upload;
      return newErrors;
    });

    // Upload images immediately
    const result = await uploadMultiple(files);

    if (result.success) {
      // Check response structure - backend returns { success: true, count: N, data: { images: [...] } }
      const images = result.data?.data?.images || result.data?.images || [];

      if (images.length > 0) {
        const imageUrls = images.map((img) => img.secure_url || img.url);
        setUploadedImages((prev) => [...prev, ...imageUrls]);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...imageUrls],
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          upload: "No images were returned from the server",
        }));
      }
    } else {
      // Show upload error to user
      setErrors((prev) => ({
        ...prev,
        upload: result.error || "Failed to upload images. Please try again.",
      }));
      console.error("Upload error:", result);
    }

    // Reset file input to allow selecting same files again
    e.target.value = "";
  };

  // Remove image
  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    const result = await createNewCategory({
      name: newCategoryName,
      type: "USE_CASE", // Default type
      description: "Created from Product Modal",
    });

    if (result.success) {
      // success - set the new category as selected
      if (result.data && result.data._id) {
        handleChange("category", result.data._id);
      }
      setShowCategoryInput(false);
      setNewCategoryName("");
    } else {
      setErrors((prev) => ({ ...prev, category: result.error }));
    }
  };

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return;

    const result = await createNewBrand({
      name: newBrandName,
    });

    if (result.success) {
      if (result.data) {
        handleChange("brand", result.data.name);
      }
      setShowBrandInput(false);
      setNewBrandName("");
    } else {
      setErrors((prev) => ({ ...prev, brand: result.error }));
    }
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Add bulk pricing tier
  const addBulkPricingTier = () => {
    setFormData((prev) => ({
      ...prev,
      bulkPricing: [...prev.bulkPricing, { minQty: "", price: "" }],
    }));
  };

  // Remove bulk pricing tier
  const removeBulkPricingTier = (index) => {
    setFormData((prev) => ({
      ...prev,
      bulkPricing: prev.bulkPricing.filter((_, i) => i !== index),
    }));
  };

  // Update bulk pricing tier
  const updateBulkPricingTier = (index, field, value) => {
    setFormData((prev) => {
      // 1. Update the tier in the array
      const updatedTiers = prev.bulkPricing.map((tier, i) =>
        i === index ? { ...tier, [field]: value } : tier,
      );

      // 2. Prepare new state
      const newState = {
        ...prev,
        bulkPricing: updatedTiers,
      };

      // 3. Vice-versa Sync: If editing first tier, update global MOQ / B2B Price
      if (index === 0) {
        if (field === "minQty") {
          newState.moq = value; // Sync to MOQ
        } else if (field === "price") {
          newState.b2bPrice = value; // Sync to B2B Price
        }
      }

      return newState;
    });
  };

  // Add configuration variant
  const addConfigurationVariant = () => {
    setFormData((prev) => ({
      ...prev,
      configurationVariants: [
        ...prev.configurationVariants,
        { type: "RAM", value: "", priceAdjustment: "" },
      ],
    }));
  };

  // Remove configuration variant
  const removeConfigurationVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      configurationVariants: prev.configurationVariants.filter(
        (_, i) => i !== index,
      ),
    }));
  };

  // Update configuration variant
  const updateConfigurationVariant = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      configurationVariants: prev.configurationVariants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant,
      ),
    }));
  };

  // Add warranty option
  const addWarrantyOption = () => {
    setFormData((prev) => ({
      ...prev,
      warrantyOptions: [...prev.warrantyOptions, { duration: "", price: "" }],
    }));
  };

  // Remove warranty option
  const removeWarrantyOption = (index) => {
    setFormData((prev) => ({
      ...prev,
      warrantyOptions: prev.warrantyOptions.filter((_, i) => i !== index),
    }));
  };

  // Update warranty option
  const updateWarrantyOption = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      warrantyOptions: prev.warrantyOptions.map((option, i) =>
        i === index ? { ...option, [field]: value } : option,
      ),
    }));
  };

  // ── Warranty RENEWAL option handlers ──────────────────────────────
  const addWarrantyRenewalOption = () => {
    setFormData((prev) => ({
      ...prev,
      warrantyRenewalOptions: [
        ...(prev.warrantyRenewalOptions || []),
        { duration: "", price: "" },
      ],
    }));
  };

  const removeWarrantyRenewalOption = (index) => {
    setFormData((prev) => ({
      ...prev,
      warrantyRenewalOptions: prev.warrantyRenewalOptions.filter(
        (_, i) => i !== index,
      ),
    }));
  };

  const updateWarrantyRenewalOption = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      warrantyRenewalOptions: prev.warrantyRenewalOptions.map((option, i) =>
        i === index ? { ...option, [field]: value } : option,
      ),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const validation = validateProductData(formData);
    if (!validation.isValid) {
      setErrors({ general: validation.errors.join(", ") });
      return;
    }

    // Explicitly validate warehouse
    if (!formData.warehouseId) {
      setErrors({ general: "Please select a warehouse" });
      return;
    }

    // Prepare data for API
    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim() || "",
      images: formData.images,
      basePrice: Number(formData.basePrice),
      stock: Number(formData.stock),
      warehouseId: formData.warehouseId || null,
      category: formData.category, // Send ID directly
      condition: "refurbished", // Force condition

      // Optional fields
      ...(formData.brand && { brand: formData.brand.trim() }),
      ...(formData.mrp && { mrp: Number(formData.mrp) }),
      ...(formData.discountPercentage !== undefined && {
        discountPercentage: Number(formData.discountPercentage),
      }),
      ...(formData.b2bPrice && { b2bPrice: Number(formData.b2bPrice) }),
      gstIncluded: Number(formData.gstPercentage) > 0 ? true : false,
      ...(formData.gstPercentage !== undefined && {
        gstPercentage: Number(formData.gstPercentage),
      }),
      ...(formData.moq !== undefined && { moq: Number(formData.moq) }),
      ...(formData.bulkPricing.length > 0 && {
        bulkPricing: formData.bulkPricing
          .filter((tier) => tier.minQty && tier.price)
          .map((tier) => ({
            minQty: Number(tier.minQty),
            price: Number(tier.price),
          })),
      }),
      soldCount: Number(formData.soldCount || 0),
      ...(formData.rating !== undefined && { rating: Number(formData.rating) }),
      ...(formData.reviewsCount !== undefined && {
        reviewsCount: Number(formData.reviewsCount),
      }),
      ...(formData.liveViewers !== undefined && {
        liveViewers: Number(formData.liveViewers),
      }),
      ...(Object.values(formData.specifications).some((v) => v) && {
        specifications: formData.specifications,
      }),
      ...(formData.configurationVariants.length > 0 && {
        configurationVariants: formData.configurationVariants,
      }),
      ...(formData.defaultWarranty && {
        defaultWarranty: formData.defaultWarranty,
      }),
      ...(formData.warrantyOptions.length > 0 && {
        warrantyOptions: formData.warrantyOptions
          .filter((opt) => opt.duration && opt.price)
          .map((opt) => ({
            duration: Number(opt.duration),
            price: Number(opt.price),
          })),
      }),
      ...((formData.warrantyRenewalOptions || []).length > 0 && {
        warrantyRenewalOptions: (formData.warrantyRenewalOptions || [])
          .filter((opt) => opt.duration && opt.price !== "")
          .map((opt) => ({
            duration: Number(opt.duration),
            price: Number(opt.price),
          })),
      }),
      ...(formData.shipping && {
        shipping: {
          freeShipping: formData.shipping.freeShipping,
          estimatedDeliveryDays: Number(
            formData.shipping.estimatedDeliveryDays,
          ),
        },
      }),
      ...(formData.offers && { offers: formData.offers }),
    };

    // Create or Update product
    let result;
    if (productToEdit) {
      // Use _id if available (from backend), else id
      const productId = productToEdit._id || productToEdit.id;
      result = await update(productId, productData);
    } else {
      result = await create(productData);
    }

    if (result.success) {
      // Reset form
      setFormData({
        name: "",
        description: "",
        images: [],
        brand: "",
        condition: DEFAULT_VALUES.CONDITION,
        category: "",
        basePrice: "",
        mrp: "",
        discountPercentage: 0,
        b2bPrice: "",
        gstIncluded: DEFAULT_VALUES.GST_INCLUDED,
        gstPercentage: DEFAULT_VALUES.GST_PERCENTAGE,
        moq: DEFAULT_VALUES.MOQ,
        bulkPricing: [],
        stock: "",
        warehouseId: "",
        soldCount: 0,
        rating: DEFAULT_VALUES.RATING,
        reviewsCount: DEFAULT_VALUES.REVIEWS_COUNT,
        liveViewers: DEFAULT_VALUES.LIVE_VIEWERS,
        specifications: {
          screenSize: "",
          resolution: "",
          screenType: "",
          processor: "",
          generation: "",
          ram: "",
          storage: "",
          touch: false,
          battery: "",
          adapter: "",
        },
        configurationVariants: [],
        defaultWarranty: DEFAULT_VALUES.DEFAULT_WARRANTY,
        warrantyOptions: [],
        warrantyRenewalOptions: [],
        shipping: {
          freeShipping: DEFAULT_VALUES.FREE_SHIPPING,
          estimatedDeliveryDays: DEFAULT_VALUES.ESTIMATED_DELIVERY_DAYS,
        },
        offers: {
          exchangeOffer: false,
          exchangeDiscountPercentage: 0,
          noCostEMI: false,
          bankOffers: false,
        },
      });
      setUploadedImages([]);
      setErrors({});

      // Close modal and notify parent
      setAddModalOpen(false);
      if (onProductCreated) {
        onProductCreated(result.data);
      }
    } else {
      setErrors({ general: result.error });
    }
  };

  const isLoading = productLoading || uploadLoading;

  // 🔹 GST Breakdown Calculation
  const mrp = parseFloat(formData.mrp) || 0;
  const gst = parseFloat(formData.gstPercentage) || 0;

  let gstAmount = 0;
  let priceExcludingGST = 0;
  let totalIncludingGST = 0;

  if (mrp > 0 && gst > 0) {
    // Simplified calculation as per requirement (Base = MRP - GST, GST = MRP * GST%)
    gstAmount = (mrp * gst) / 100;
    priceExcludingGST = mrp - gstAmount;
    totalIncludingGST = mrp;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl my-8 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
          <h3 className="text-2xl font-black text-slate-800 leading-none">
            {productToEdit ? "Edit Product" : "Register New Product"}
          </h3>
          <button
            onClick={() => setAddModalOpen(false)}
            className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-red-500 transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto"
        >
          {/* General Error */}
          {errors.general && (
            <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100">
              {errors.general}
            </div>
          )}

          {/* Upload Error */}
          {errors.upload && (
            <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100">
              {errors.upload}
            </div>
          )}

          {/* Basic Information Section */}
          <Section
            title="Basic Information"
            expanded={expandedSections.basic}
            onToggle={() => toggleSection("basic")}
          >
            <div className="space-y-4">
              {/* Name - Required */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  {FIELD_LABELS.NAME} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                  placeholder="e.g., Dell Inspiron 15 | Intel i7 12th Gen | 16GB RAM | 512GB SSD"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  {FIELD_LABELS.DESCRIPTION}
                </label>
                <textarea
                  rows={3}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold resize-none"
                  placeholder="Product description..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  {FIELD_LABELS.BRAND}
                </label>

                {showBrandInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                      placeholder="New Brand Name"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleCreateBrand())
                      }
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleCreateBrand}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowBrandInput(false);
                        setNewBrandName("");
                      }}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <select
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                    value={formData.brand}
                    onChange={(e) => {
                      if (e.target.value === "NEW") {
                        setShowBrandInput(true);
                      } else {
                        handleChange("brand", e.target.value);
                      }
                    }}
                  >
                    <option value="">
                      {brandsLoading ? "Loading..." : "Select Brand"}
                    </option>
                    {brands &&
                      brands.map((brand) => (
                        <option
                          key={brand._id || brand.name}
                          value={brand.name}
                        >
                          {brand.name}
                        </option>
                      ))}
                    <option
                      value="NEW"
                      className="font-bold text-blue-600 bg-blue-50"
                    >
                      + Add New Brand
                    </option>
                  </select>
                )}
              </div>

              {/* Condition & Category */}
              {/* Warehouse & Category */}
              <div className="grid grid-cols-2 gap-4">
                {/* Warehouse Selection */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    Warehouse Node <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                    value={formData.warehouseId}
                    onChange={(e) =>
                      handleChange("warehouseId", e.target.value)
                    }
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses &&
                      warehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.name} ({wh.location})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    {FIELD_LABELS.CATEGORY}{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  {showCategoryInput ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                        placeholder="New Category Name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleCreateCategory())
                        }
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCategoryInput(false);
                          setNewCategoryName("");
                        }}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <select
                      required
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                      value={formData.category}
                      onChange={(e) => {
                        if (e.target.value === "NEW") {
                          setShowCategoryInput(true);
                        } else {
                          handleChange("category", e.target.value);
                        }
                      }}
                    >
                      <option value="">
                        {categoriesLoading ? "Loading..." : "Select Category"}
                      </option>
                      {categories &&
                        categories.map((cat) => (
                          <option key={cat._id || cat.slug} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      <option
                        value="NEW"
                        className="font-bold text-blue-600 bg-blue-50"
                      >
                        + Add New Category
                      </option>
                    </select>
                  )}
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Images - Required */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  {FIELD_LABELS.IMAGES} <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-500 transition-all flex items-center justify-center space-x-2 text-slate-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || uploadLoading}
                  >
                    <Upload size={20} />
                    <span className="font-bold">
                      {uploadLoading ? "Uploading Images..." : "Upload Images"}
                    </span>
                  </button>

                  {/* Uploaded Images Preview */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {uploadedImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-xl border-2 border-slate-100"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Section>

          {/* Pricing Section */}
          <Section
            title="Pricing"
            expanded={expandedSections.pricing}
            onToggle={() => toggleSection("pricing")}
          >
            <div className="space-y-6">
              {/* 1️⃣ MRP */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  {FIELD_LABELS.MRP}
                </label>
                <input
                  type="text"
                  min="0"
                  step="0.01"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold"
                  placeholder="0.00"
                  value={formData.mrp}
                  onChange={(e) => handleChange("mrp", e.target.value)}
                />

                <p className="mt-2 text-xs text-slate-500 font-semibold">
                  Note: Enter MRP inclusive of GST. Discount will be applied on
                  this MRP value.
                </p>

                {/* GST Breakdown Info */}
                {mrp > 0 && gst > 0 && (
                  <div className="mt-3 p-4 bg-blue-50 rounded-xl text-sm font-semibold text-slate-700">
                    <div className="flex justify-between">
                      <span>Price (Excl. GST)</span>
                      <span>₹{priceExcludingGST.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>GST ({gst}%)</span>
                      <span>₹{gstAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t mt-2 pt-2 font-bold flex justify-between">
                      <span>Total (Incl. GST)</span>
                      <span>₹{totalIncludingGST.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2️⃣ GST */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  {FIELD_LABELS.GST_PERCENTAGE}
                </label>
                <input
                  type="text"
                  min="0"
                  max="100"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold"
                  value={formData.gstPercentage}
                  onChange={(e) =>
                    handleChange("gstPercentage", e.target.value)
                  }
                />
              </div>

              {/* 3️⃣ Discount */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  {FIELD_LABELS.DISCOUNT_PERCENTAGE}
                </label>
                <input
                  type="text"
                  min="0"
                  max="100"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold"
                  value={formData.discountPercentage}
                  onChange={(e) =>
                    handleChange("discountPercentage", e.target.value)
                  }
                />
              </div>

              {/* 4️⃣ Base Price (Auto) */}
              {/* 4️⃣ Base Price (Auto) && Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    {FIELD_LABELS.BASE_PRICE}
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={formData.basePrice}
                    className="w-full px-5 py-4 bg-slate-100 border-2 border-slate-100 rounded-2xl text-slate-500 font-black cursor-not-allowed"
                    placeholder="Auto-calculated"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    {FIELD_LABELS.STOCK} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    min="0"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-xl"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => handleChange("stock", e.target.value)}
                  />
                </div>
              </div>

              {/* B2B + MOQ */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    {FIELD_LABELS.B2B_PRICE}
                  </label>
                  <input
                    type="text"
                    min="0"
                    step="0.01"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold"
                    value={formData.b2bPrice}
                    onChange={(e) => handleChange("b2bPrice", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    {FIELD_LABELS.MOQ}
                  </label>
                  <input
                    type="text"
                    min="1"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold"
                    value={formData.moq}
                    onChange={(e) => handleChange("moq", e.target.value)}
                  />
                </div>
              </div>

              {/* Bulk Pricing */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Bulk Pricing Tiers
                  </label>
                  <button
                    type="button"
                    onClick={addBulkPricingTier}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors flex items-center space-x-1"
                  >
                    <Plus size={14} />
                    <span>Add Tier</span>
                  </button>
                </div>
                {formData.bulkPricing.map((tier, index) => (
                  <div key={index} className="grid grid-cols-3 gap-3 mb-2">
                    <input
                      type="text"
                      min="1"
                      className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 font-bold"
                      placeholder="Min Qty"
                      value={tier.minQty}
                      onChange={(e) =>
                        updateBulkPricingTier(index, "minQty", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      min="0"
                      step="0.01"
                      className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 font-bold"
                      placeholder="Price"
                      value={tier.price}
                      onChange={(e) =>
                        updateBulkPricingTier(index, "price", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeBulkPricingTier(index)}
                      className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Ratings & Reviews Section */}
          <Section
            title="Ratings & Reviews"
            expanded={expandedSections.ratings}
            onToggle={() => toggleSection("ratings")}
          >
            <div className="space-y-4">
              {/* Stock & Sold Count */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    Sold Count
                  </label>
                  <input
                    type="text"
                    min="0"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                    placeholder="0"
                    value={formData.soldCount}
                    onChange={(e) => handleChange("soldCount", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    {FIELD_LABELS.RATING}
                  </label>
                  <input
                    type="text"
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                    placeholder="0.0"
                    value={formData.rating}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (e.target.value === "" || (val >= 0 && val <= 5)) {
                        handleChange("rating", e.target.value);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Reviews Count & Live Viewers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    {FIELD_LABELS.REVIEWS_COUNT}
                  </label>
                  <input
                    type="text"
                    min="0"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                    placeholder="0"
                    value={formData.reviewsCount}
                    onChange={(e) =>
                      handleChange("reviewsCount", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    {FIELD_LABELS.LIVE_VIEWERS}
                  </label>
                  <input
                    type="text"
                    min="0"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                    placeholder="0"
                    value={formData.liveViewers}
                    onChange={(e) =>
                      handleChange("liveViewers", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* Specifications Section */}
          <Section
            title="Specifications"
            expanded={expandedSections.specifications}
            onToggle={() => toggleSection("specifications")}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  {FIELD_LABELS.SCREEN_SIZE}
                </label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                  value={formData.specifications.screenSize}
                  onChange={(e) =>
                    handleChange("specifications.screenSize", e.target.value)
                  }
                >
                  <option value="">
                    {specsLoading ? "Loading..." : "Select Screen Size"}
                  </option>
                  {specifications?.screenSize?.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  {FIELD_LABELS.RESOLUTION}
                </label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                  placeholder="e.g., 1920x1080"
                  value={formData.specifications.resolution}
                  onChange={(e) =>
                    handleChange("specifications.resolution", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Screen Type
                </label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                  placeholder="e.g., IPS"
                  value={formData.specifications.screenType}
                  onChange={(e) =>
                    handleChange("specifications.screenType", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  {FIELD_LABELS.PROCESSOR}
                </label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                  value={formData.specifications.processor}
                  onChange={(e) =>
                    handleChange("specifications.processor", e.target.value)
                  }
                >
                  <option value="">
                    {specsLoading ? "Loading..." : "Select Processor"}
                  </option>
                  {specifications?.processor?.map((proc) => (
                    <option key={proc} value={proc}>
                      {proc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Generation
                </label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                  placeholder="e.g., 12th Gen"
                  value={formData.specifications.generation}
                  onChange={(e) =>
                    handleChange("specifications.generation", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  {FIELD_LABELS.RAM}
                </label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                  value={formData.specifications.ram}
                  onChange={(e) =>
                    handleChange("specifications.ram", e.target.value)
                  }
                >
                  <option value="">
                    {specsLoading ? "Loading..." : "Select RAM"}
                  </option>
                  {specifications?.ram?.map((ram) => (
                    <option key={ram} value={ram}>
                      {ram}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  {FIELD_LABELS.STORAGE}
                </label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                  value={formData.specifications.storage}
                  onChange={(e) =>
                    handleChange("specifications.storage", e.target.value)
                  }
                >
                  <option value="">
                    {specsLoading ? "Loading..." : "Select Storage"}
                  </option>
                  {specifications?.storage?.map((storage) => (
                    <option key={storage} value={storage}>
                      {storage}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  {FIELD_LABELS.BATTERY}
                </label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                  placeholder="e.g., Upto 8 hours"
                  value={formData.specifications.battery}
                  onChange={(e) =>
                    handleChange("specifications.battery", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Adapter
                </label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                  placeholder="e.g., 65W USB-C Adapter"
                  value={formData.specifications.adapter}
                  onChange={(e) =>
                    handleChange("specifications.adapter", e.target.value)
                  }
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="touch"
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={formData.specifications.touch}
                  onChange={(e) =>
                    handleChange("specifications.touch", e.target.checked)
                  }
                />
                <label
                  htmlFor="touch"
                  className="text-sm font-bold text-slate-700"
                >
                  Touch Screen
                </label>
              </div>
            </div>
          </Section>

          {/* Configuration Variants Section */}
          <Section
            title="Configuration Variants"
            expanded={expandedSections.specifications} // Share expansion state with specifications
            onToggle={() => toggleSection("specifications")}
          >
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Variants (RAM / Storage)
                  </label>
                  <button
                    type="button"
                    onClick={addConfigurationVariant}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors flex items-center space-x-1"
                  >
                    <Plus size={14} />
                    <span>Add Variant</span>
                  </button>
                </div>
                {formData.configurationVariants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-4 gap-3 mb-2">
                    <select
                      className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 font-bold"
                      value={variant.type}
                      onChange={(e) =>
                        updateConfigurationVariant(
                          index,
                          "type",
                          e.target.value,
                        )
                      }
                    >
                      <option value="RAM">RAM</option>
                      <option value="STORAGE">Storage</option>
                    </select>
                    <select
                      className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 font-bold"
                      value={variant.value}
                      onChange={(e) =>
                        updateConfigurationVariant(
                          index,
                          "value",
                          e.target.value,
                        )
                      }
                    >
                      <option value="">Select Value</option>
                      {variant.type === "RAM" &&
                        specifications?.ram?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      {variant.type === "STORAGE" &&
                        specifications?.storage?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      {/* Fallback for other types if any */}
                      {!["RAM", "STORAGE"].includes(variant.type) && (
                        <option disabled>Select Type First</option>
                      )}
                    </select>
                    <input
                      type="text"
                      step="0.01"
                      className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 font-bold"
                      placeholder="Price Adj. (+/-)"
                      value={variant.priceAdjustment}
                      onChange={(e) =>
                        updateConfigurationVariant(
                          index,
                          "priceAdjustment",
                          e.target.value,
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeConfigurationVariant(index)}
                      className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Warranty Section */}
          <Section
            title="Warranty"
            expanded={expandedSections.warranty}
            onToggle={() => toggleSection("warranty")}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  {FIELD_LABELS.DEFAULT_WARRANTY} (MONTHS)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                  placeholder="e.g. 12"
                  value={formData.defaultWarranty}
                  onChange={(e) =>
                    handleChange("defaultWarranty", e.target.value)
                  }
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Warranty Options
                  </label>
                  <button
                    type="button"
                    onClick={addWarrantyOption}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors flex items-center space-x-1"
                  >
                    <Plus size={14} />
                    <span>Add Option</span>
                  </button>
                </div>
                {formData.warrantyOptions.map((option, index) => (
                  <div key={index} className="grid grid-cols-3 gap-3 mb-2">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 font-bold"
                      placeholder="Months (e.g. 12)"
                      value={option.duration}
                      onChange={(e) =>
                        updateWarrantyOption(index, "duration", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      min="0"
                      step="0.01"
                      className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 font-bold"
                      placeholder="Price"
                      value={option.price}
                      onChange={(e) =>
                        updateWarrantyOption(index, "price", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeWarrantyOption(index)}
                      className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Shipping Section */}
          <Section
            title="Shipping"
            expanded={expandedSections.shipping}
            onToggle={() => toggleSection("shipping")}
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="freeShipping"
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={formData.shipping.freeShipping}
                  onChange={(e) =>
                    handleChange("shipping.freeShipping", e.target.checked)
                  }
                />
                <label
                  htmlFor="freeShipping"
                  className="text-sm font-bold text-slate-700"
                >
                  {FIELD_LABELS.FREE_SHIPPING}
                </label>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  {FIELD_LABELS.ESTIMATED_DELIVERY_DAYS}
                </label>
                <input
                  type="text"
                  min="0"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                  placeholder="7"
                  value={formData.shipping.estimatedDeliveryDays}
                  onChange={(e) =>
                    handleChange(
                      "shipping.estimatedDeliveryDays",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          </Section>

          {/* Offers Section */}
          <Section
            title="Offers"
            expanded={expandedSections.offers}
            onToggle={() => toggleSection("offers")}
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="exchangeOffer"
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={formData.offers.exchangeOffer}
                  onChange={(e) =>
                    handleChange("offers.exchangeOffer", e.target.checked)
                  }
                />
                <label
                  htmlFor="exchangeOffer"
                  className="text-sm font-bold text-slate-700"
                >
                  {FIELD_LABELS.EXCHANGE_OFFER}
                </label>
              </div>

              {formData.offers.exchangeOffer && (
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    Exchange Discount Percentage
                  </label>
                  <input
                    type="text"
                    min="0"
                    max="100"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                    placeholder="0"
                    value={formData.offers.exchangeDiscountPercentage}
                    onChange={(e) =>
                      handleChange(
                        "offers.exchangeDiscountPercentage",
                        e.target.value,
                      )
                    }
                  />
                </div>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="noCostEMI"
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={formData.offers.noCostEMI}
                  onChange={(e) =>
                    handleChange("offers.noCostEMI", e.target.checked)
                  }
                />
                <label
                  htmlFor="noCostEMI"
                  className="text-sm font-bold text-slate-700"
                >
                  {FIELD_LABELS.NO_COST_EMI}
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="bankOffers"
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={formData.offers.bankOffers}
                  onChange={(e) =>
                    handleChange("offers.bankOffers", e.target.checked)
                  }
                />
                <label
                  htmlFor="bankOffers"
                  className="text-sm font-bold text-slate-700"
                >
                  {FIELD_LABELS.BANK_OFFERS}
                </label>
              </div>
            </div>
          </Section>
          {/* Warranty Renewal Section */}
          <Section
            title="Warranty Renewal"
            expanded={expandedSections.warrantyRenewal}
            onToggle={() => toggleSection("warrantyRenewal")}
          >
            <div className="space-y-4">
              <p className="text-xs text-slate-400 font-bold">
                Set the durations and prices available when a customer renews
                their warranty. These will appear on the customer's "Renew Now"
                page.
              </p>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Renewal Options(MONTHS)
                  </label>
                  <button
                    type="button"
                    onClick={addWarrantyRenewalOption}
                    className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-xl text-xs font-bold hover:bg-orange-100 transition-colors flex items-center space-x-1"
                  >
                    <Plus size={14} />
                    <span>Add Option</span>
                  </button>
                </div>
                {(formData.warrantyRenewalOptions || []).length === 0 && (
                  <p className="text-xs text-slate-300 italic px-1">
                    No renewal options added yet.
                  </p>
                )}
                {(formData.warrantyRenewalOptions || []).map(
                  (option, index) => (
                    <div key={index} className="grid grid-cols-3 gap-3 mb-2">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-orange-400 font-bold"
                        placeholder="Months (e.g. 3)"
                        value={option.duration}
                        onChange={(e) =>
                          updateWarrantyRenewalOption(
                            index,
                            "duration",
                            e.target.value,
                          )
                        }
                      />
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-orange-400 font-bold"
                        placeholder="Price (₹)"
                        value={option.price}
                        onChange={(e) =>
                          updateWarrantyRenewalOption(
                            index,
                            "price",
                            e.target.value,
                          )
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeWarrantyRenewalOption(index)}
                        className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ),
                )}
              </div>
            </div>
          </Section>
          {/* Submit Button */}
          <div className="pt-6 border-t border-slate-100">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-blue-600 text-white rounded-[20px] font-black uppercase tracking-widest text-xs flex items-center justify-center shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Processing..."
                : productToEdit
                  ? "Update Product"
                  : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Section Component for collapsible sections
const Section = ({ title, expanded, onToggle, children }) => {
  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
      >
        <h4 className="text-lg font-black text-slate-800">{title}</h4>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {expanded && <div className="p-6 bg-white">{children}</div>}
    </div>
  );
};

export default ProductModal;
