import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useBulkUpload } from "../../hooks/useBulkUpload.js";

/**
 * BulkUploadModal
 * Accepts .xlsx or .csv file → parses it → shows preview → uploads to backend
 *
 * CSV/Excel expected columns (header row 1):
 *  PRODUCT NAME*, DESCRIPTION, BRAND, WAREHOUSE*, CATEGORY*,
 *  IMAGE_URL_1*, IMAGE_URL_2, IMAGE_URL_3,
 *  Price*, GST Included, GST %, Discount Percentage (%),
 *  Stock Quantity*, B2B Price, Minimum Order Quantity,
 *  Bulk Tier Qty,Price (e.g "10,85000"),
 *  Sold Count, Rating, Reviews Count, Live Viewers,
 *  Screen Size, Resolution, Screen Type, Processor, Generation,
 *  RAM, Storage, Battery, Adapter, Touch Screen,
 *  Variant Type, Variant Value, Price Adjustment,
 *  Default Warranty, Warranty Duration, Warranty Price,
 *  Free Shipping, Estimated Delivery Days,
 *  Exchange Offer, Exchange Discount (%), No Cost EMI, Bank Offers,
 *  Warranty Renewal Duration, Warranty Renewal Price
 */
const BulkUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const fileInputRef = useRef(null);
  const { uploadBulk, loading } = useBulkUpload();

  const [step, setStep] = useState("upload"); // 'upload' | 'preview' | 'result'
  const [parsedProducts, setParsedProducts] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState("");
  const [showPreviewTable, setShowPreviewTable] = useState(true);

  if (!isOpen) return null;

  // ── CSV/Excel Parsing ──────────────────────────────────────────────────────
  const parseBoolean = (val) => {
    if (val === undefined || val === null || val === "") return false;
    if (typeof val === "boolean") return val;
    return String(val).trim().toUpperCase() === "TRUE";
  };

  const parseNumber = (val, fallback = 0) => {
    const n = parseFloat(String(val).replace(/[^\d.-]/g, ""));
    return isNaN(n) ? fallback : n;
  };

  const parseInteger = (val, fallback = 0) => {
    const n = parseInt(String(val).replace(/[^\d-]/g, ""), 10);
    return isNaN(n) ? fallback : n;
  };

  // Parse "qty, price" string into { minQty, price }
  const parseBulkTier = (str) => {
    if (!str) return null;
    const parts = String(str)
      .split(",")
      .map((s) => s.trim());
    if (parts.length < 2) return null;
    const minQty = parseInt(parts[0], 10);
    const price = parseFloat(parts[1]);
    if (isNaN(minQty) || isNaN(price)) return null;
    return { minQty, price };
  };

  // Parse warranty duration: strip "months" text, return integer
  const parseWarrantyDuration = (val) => {
    if (!val) return null;
    const n = parseInt(String(val).replace(/[^\d]/g, ""), 10);
    return isNaN(n) ? null : n;
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        // header: 1 → array of arrays (first row = headers)
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

        if (rows.length < 2) {
          setParseErrors(["File is empty or has no data rows."]);
          return;
        }

        const headers = rows[0].map((h) => String(h).trim());
        const dataRows = rows.slice(1);

        // Map header name → column index
        const col = (name) => {
          const idx = headers.findIndex(
            (h) => h.toLowerCase() === name.toLowerCase(),
          );
          return idx;
        };

        // Build products by merging continuation rows into their parent
        const products = [];
        const errors = [];
        let currentProduct = null;

        dataRows.forEach((row, i) => {
          const rawName =
            row[col("PRODUCT NAME*")] || row[col("PRODUCT NAME")] || "";

          if (String(rawName).trim()) {
            // ── This is a main product row ──────────────────────────
            const images = [];
            [
              "IMAGE_URL_1*",
              "IMAGE_URL_1",
              "IMAGE_URL_2",
              "IMAGE_URL_3",
              "Product Images URL & Video URL*",
              "Product Images URL & Video URL",
            ].forEach((imgCol) => {
              const v = row[col(imgCol)];
              if (v && String(v).trim().startsWith("http")) {
                images.push(String(v).trim());
              }
            });

            // Remove duplicate image URLs
            const uniqueImages = [...new Set(images)];

            // Parse bulk pricing tier from this row
            const tierVal =
              row[col("Bulk Tier")] ||
              row[col("Minimum Quantity, Pricing")] ||
              row[col('"Minimum Quantity, Pricing"')] ||
              "";
            const bulkPricing = [];
            const tier = parseBulkTier(String(tierVal));
            if (tier) bulkPricing.push(tier);

            // Parse configuration variant from this row
            const configurationVariants = [];
            const variantType =
              row[col("Variant Type")] || row[col("STORAGE")] || "";
            const variantValue =
              row[col("Variant Value")] || row[col("SELECT VALUE")] || "";
            const priceAdj =
              row[col("Price Adjustment")] || row[col("PRICE ADJ (+/-)")] || "";
            if (variantType && variantValue) {
              const vType = String(variantType).trim().toUpperCase();
              if (vType === "RAM" || vType === "STORAGE") {
                configurationVariants.push({
                  type: vType,
                  value: String(variantValue).trim(),
                  priceAdjustment: parseNumber(priceAdj, 0),
                });
              }
            }

            // Parse warranty options
            const warrantyOptions = [];
            const wDur = parseWarrantyDuration(
              row[col("Warranty Duration")] || row[col("DURATION")] || "",
            );
            const wPrice =
              row[col("Warranty Price")] || row[col("PRICE")] || "";
            if (wDur && wPrice !== "") {
              warrantyOptions.push({
                duration: wDur,
                price: parseNumber(wPrice),
              });
            }

            // Parse warranty renewal options
            const warrantyRenewalOptions = [];
            const wrDur = parseWarrantyDuration(
              row[col("Warranty Renewal Duration")] ||
                row[col("WARRANTY EXTEND MONTH")] ||
                "",
            );
            const wrPrice =
              row[col("Warranty Renewal Price")] ||
              row[col("EXTEND WARRANTY PRICE")] ||
              "";
            if (wrDur && wrPrice !== "") {
              warrantyRenewalOptions.push({
                duration: wrDur,
                price: parseNumber(wrPrice),
              });
            }

            currentProduct = {
              name: String(rawName).trim(),
              description: String(
                row[col("DESCRIPTION (OPTIONAL)")] ||
                  row[col("DESCRIPTION")] ||
                  "",
              ).trim(),
              brand: String(
                row[col("BRAND(SELECT)")] || row[col("BRAND")] || "",
              ).trim(),
              categoryName: String(
                row[col("CATEGORY*")] || row[col("CATEGORY")] || "",
              ).trim(),
              warehouseName: String(
                row[col("WAREHOUSE*")] || row[col("WAREHOUSE")] || "",
              ).trim(),
              images: uniqueImages,
              basePrice: parseNumber(
                row[col("Price*")] || row[col("Price")] || 0,
              ),
              mrp: (() => {
                const parsedMrp = parseNumber(row[col("MRP")] || 0);
                const parsedBasePrice = parseNumber(
                  row[col("Price*")] || row[col("Price")] || 0,
                );
                const parsedDiscount = parseNumber(
                  row[col("Discount Percentage (%)")] ||
                    row[col("Discount Percentage")] ||
                    0,
                );
                if (parsedMrp > 0) return parsedMrp;
                // If MRP column is missing, calculate MRP from basePrice and discount
                if (
                  parsedBasePrice > 0 &&
                  parsedDiscount > 0 &&
                  parsedDiscount < 100
                ) {
                  return (
                    Math.round(
                      (parsedBasePrice / (1 - parsedDiscount / 100)) * 100,
                    ) / 100
                  );
                }
                // Fallback: MRP = basePrice (no discount applied)
                return parsedBasePrice;
              })(),
              discountPercentage: parseNumber(
                row[col("Discount Percentage (%)")] ||
                  row[col("Discount Percentage")] ||
                  0,
              ),
              b2bPrice:
                parseNumber(
                  row[col("B2B Price (₹)")] || row[col("B2B Price")] || 0,
                ) || undefined,
              gstIncluded: parseBoolean(row[col("GST Included")]),
              gstPercentage: parseNumber(row[col("GST %")] || 18),
              moq: parseInteger(row[col("Minimum Order Quantity")] || 1),
              bulkPricing,
              stock: parseInteger(
                row[col("Stock Quantity*")] ||
                  row[col("Stock Quantity *")] ||
                  row[col("Stock Quantity")] ||
                  0,
              ),
              soldCount: parseInteger(row[col("Sold Count")] || 0),
              rating: parseNumber(
                row[col("Rating (0-5)")] || row[col("Rating")] || 0,
              ),
              reviewsCount: parseInteger(row[col("Reviews Count")] || 0),
              liveViewers: parseInteger(row[col("Live Viewers")] || 0),
              specifications: {
                screenSize: String(row[col("Screen Size")] || "").trim(),
                resolution: String(row[col("Resolution")] || "").trim(),
                screenType: String(row[col("Screen Type")] || "").trim(),
                processor: String(row[col("Processor")] || "").trim(),
                generation: String(row[col("Generation")] || "").trim(),
                ram: String(row[col("RAM")] || "").trim(),
                storage: String(
                  row[col("Storage (SELECT)")] || row[col("Storage")] || "",
                ).trim(),
                battery: String(
                  row[col("BATTERY")] || row[col("Battery")] || "",
                ).trim(),
                adapter: String(
                  row[col("ADAPTER")] || row[col("Adapter")] || "",
                ).trim(),
                touch: parseBoolean(
                  row[col("TOUCH SCREEN")] || row[col("Touch Screen")] || false,
                ),
              },
              configurationVariants,
              defaultWarranty: String(
                row[col("DEFAULT WARRANTY")] ||
                  row[col("Default Warranty")] ||
                  "12 months",
              ).trim(),
              warrantyOptions,
              warrantyRenewalOptions,
              shipping: {
                freeShipping: parseBoolean(
                  row[col("FREE SHIPPING")] ||
                    row[col("Free Shipping")] ||
                    false,
                ),
                estimatedDeliveryDays: parseInteger(
                  row[col("ESTIMATED DELIVERY DAYS")] ||
                    row[col("Estimated Delivery Days")] ||
                    7,
                ),
              },
              offers: {
                exchangeOffer: parseBoolean(
                  row[col("EXCHANGE OFFER")] ||
                    row[col("Exchange Offer")] ||
                    false,
                ),
                exchangeDiscountPercentage: parseNumber(
                  row[col("EXCHANGE DISCOUNT PRICE")] ||
                    row[col("Exchange Discount (%)")] ||
                    0,
                ),
                noCostEMI: parseBoolean(
                  row[col("NO COST EMI")] || row[col("No Cost EMI")] || false,
                ),
                bankOffers: parseBoolean(
                  row[col("BANK OFFERS")] || row[col("Bank Offers")] || false,
                ),
              },
              _rowIndex: i + 2, // for error reporting (1-based header + 1)
            };

            products.push(currentProduct);
          } else if (currentProduct) {
            // ── Continuation row: merge extra tiers/variants/options ──────────
            const tierVal2 =
              row[col("Bulk Tier")] ||
              row[col("Minimum Quantity, Pricing")] ||
              row[col('"Minimum Quantity, Pricing"')] ||
              "";
            const tier2 = parseBulkTier(String(tierVal2));
            if (tier2) currentProduct.bulkPricing.push(tier2);

            // Merge extra config variant
            const variantType2 =
              row[col("Variant Type")] || row[col("STORAGE")] || "";
            const variantValue2 =
              row[col("Variant Value")] || row[col("SELECT VALUE")] || "";
            const priceAdj2 =
              row[col("Price Adjustment")] || row[col("PRICE ADJ (+/-)")] || "";
            if (variantType2 && variantValue2) {
              const vType2 = String(variantType2).trim().toUpperCase();
              if (vType2 === "RAM" || vType2 === "STORAGE") {
                currentProduct.configurationVariants.push({
                  type: vType2,
                  value: String(variantValue2).trim(),
                  priceAdjustment: parseNumber(priceAdj2, 0),
                });
              }
            }

            // Merge extra warranty option
            const wDur2 = parseWarrantyDuration(
              row[col("Warranty Duration")] || row[col("DURATION")] || "",
            );
            const wPrice2 =
              row[col("Warranty Price")] || row[col("PRICE")] || "";
            if (wDur2 && wPrice2 !== "") {
              currentProduct.warrantyOptions.push({
                duration: wDur2,
                price: parseNumber(wPrice2),
              });
            }

            // Merge extra warranty renewal option
            const wrDur2 = parseWarrantyDuration(
              row[col("Warranty Renewal Duration")] ||
                row[col("WARRANTY EXTEND MONTH")] ||
                "",
            );
            const wrPrice2 =
              row[col("Warranty Renewal Price")] ||
              row[col("EXTEND WARRANTY PRICE")] ||
              "";
            if (wrDur2 && wrPrice2 !== "") {
              currentProduct.warrantyRenewalOptions.push({
                duration: wrDur2,
                price: parseNumber(wrPrice2),
              });
            }
          }
        });

        // Client-side validation before preview
        const clientErrors = [];
        products.forEach((p, idx) => {
          if (!p.name)
            clientErrors.push(`Row ${p._rowIndex}: Product name is required.`);
          if (!p.categoryName)
            clientErrors.push(`Row ${p._rowIndex}: Category is required.`);
          if (!p.basePrice || p.basePrice <= 0)
            clientErrors.push(
              `Row ${p._rowIndex} (${p.name}): Price must be > 0.`,
            );
          if (p.stock < 0)
            clientErrors.push(
              `Row ${p._rowIndex} (${p.name}): Stock cannot be negative.`,
            );
          if (!p.images || p.images.length === 0)
            clientErrors.push(
              `Row ${p._rowIndex} (${p.name}): At least 1 image URL is required.`,
            );
        });

        setParseErrors(clientErrors);
        setParsedProducts(products);
        setStep("preview");
      } catch (err) {
        setParseErrors([`Failed to parse file: ${err.message}`]);
      }
    };
    reader.readAsBinaryString(file);
    // Reset input
    e.target.value = "";
  };

  const handleUpload = async () => {
    const cleanProducts = parsedProducts.map(({ _rowIndex, ...rest }) => rest);
    const result = await uploadBulk(cleanProducts);
    setResult(result);
    setStep("result");
    if (result.success && result.data?.summary?.created > 0) {
      onSuccess && onSuccess();
    }
  };

  const handleReset = () => {
    setStep("upload");
    setParsedProducts([]);
    setParseErrors([]);
    setResult(null);
    setFileName("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-4xl my-8 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-teal-50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <FileSpreadsheet size={20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 leading-none">
                Bulk Upload Products
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Upload CSV or Excel file to add multiple products
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* ── STEP 1: UPLOAD ─────────────────────────────────────── */}
          {step === "upload" && (
            <div className="space-y-5">
              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all group"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={28} className="text-emerald-600" />
                </div>
                <p className="text-base font-black text-slate-700">
                  Click to select CSV or Excel file
                </p>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Supports .csv, .xlsx, .xls — Max 500 products
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>

              {/* Format hint */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-black text-blue-700 uppercase tracking-widest mb-2">
                  Required Columns
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "PRODUCT NAME*",
                    "CATEGORY*",
                    "WAREHOUSE*",
                    "IMAGE_URL_1*",
                    "Price*",
                    "Stock Quantity*",
                  ].map((c) => (
                    <span
                      key={c}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-blue-500 mt-2 font-medium">
                  All other columns are optional. Use your existing CSV format.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 2: PREVIEW ────────────────────────────────────── */}
          {step === "preview" && (
            <div className="space-y-4">
              {/* File name + stats */}
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet size={20} className="text-emerald-600" />
                  <div>
                    <p className="text-sm font-black text-slate-800">
                      {fileName}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {parsedProducts.length} product(s) parsed
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-red-500 font-bold transition-colors"
                >
                  Change file
                </button>
              </div>

              {/* Client-side validation errors */}
              {parseErrors.length > 0 && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-xs font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <AlertCircle size={14} /> Warnings ({parseErrors.length})
                  </p>
                  <ul className="space-y-1 max-h-32 overflow-y-auto">
                    {parseErrors.map((e, i) => (
                      <li
                        key={i}
                        className="text-xs text-amber-600 font-medium"
                      >
                        • {e}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-amber-500 mt-2 font-medium">
                    Rows with errors will be skipped by the server.
                  </p>
                </div>
              )}

              {/* Preview Table */}
              {parsedProducts.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowPreviewTable((v) => !v)}
                    className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-2 hover:text-slate-700 transition-colors"
                  >
                    {showPreviewTable ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                    Preview ({parsedProducts.length} rows)
                  </button>

                  {showPreviewTable && (
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                      <table className="w-full text-left text-xs min-w-[700px]">
                        <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest">
                          <tr>
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Brand</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Warehouse</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Stock</th>
                            <th className="px-4 py-3">Images</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {parsedProducts.map((p, i) => (
                            <tr
                              key={i}
                              className={`${!p.images?.length || !p.categoryName ? "bg-red-50" : "hover:bg-slate-50/50"} transition-colors`}
                            >
                              <td className="px-4 py-3 font-bold text-slate-400">
                                {p._rowIndex}
                              </td>
                              <td className="px-4 py-3 font-bold text-slate-800 max-w-[180px] truncate">
                                {p.name}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {p.brand || "—"}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-0.5 rounded-lg font-bold ${p.categoryName ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-600"}`}
                                >
                                  {p.categoryName || "❌ Missing"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {p.warehouseName || "—"}
                              </td>
                              <td className="px-4 py-3 font-bold text-slate-800">
                                ₹{p.basePrice?.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 font-bold text-slate-800">
                                {p.stock}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-0.5 rounded-lg font-bold ${p.images?.length ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
                                >
                                  {p.images?.length
                                    ? `${p.images.length} URL(s)`
                                    : "❌ Missing"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={handleReset}
                  className="px-5 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleUpload}
                  disabled={loading || parsedProducts.length === 0}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-100 transition-all flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload {parsedProducts.length} Product(s)
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: RESULT ─────────────────────────────────────── */}
          {step === "result" && result && (
            <div className="space-y-4">
              {/* Summary card */}
              <div
                className={`p-5 rounded-2xl border ${result.success ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  {result.success ? (
                    <CheckCircle size={24} className="text-emerald-600" />
                  ) : (
                    <AlertCircle size={24} className="text-red-500" />
                  )}
                  <p className="text-base font-black text-slate-800">
                    {result.data?.message || result.error || "Upload complete"}
                  </p>
                </div>

                {result.data?.summary && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
                      <p className="text-2xl font-black text-slate-800">
                        {result.data.summary.total}
                      </p>
                      <p className="text-xs text-slate-400 font-bold uppercase">
                        Total Rows
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center border border-emerald-100">
                      <p className="text-2xl font-black text-emerald-600">
                        {result.data.summary.created}
                      </p>
                      <p className="text-xs text-slate-400 font-bold uppercase">
                        Created
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center border border-red-100">
                      <p className="text-2xl font-black text-red-500">
                        {result.data.summary.failedCount}
                      </p>
                      <p className="text-xs text-slate-400 font-bold uppercase">
                        Failed
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Failed rows detail */}
              {result.data?.failed?.length > 0 && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-xs font-black text-red-700 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <AlertCircle size={14} /> Failed Rows
                  </p>
                  <ul className="space-y-1.5 max-h-40 overflow-y-auto">
                    {result.data.failed.map((f, i) => (
                      <li
                        key={i}
                        className="text-xs text-red-600 font-medium flex gap-2"
                      >
                        <span className="font-black">Row {f.row}:</span>
                        <span className="text-slate-600">{f.name}</span>
                        <span>— {f.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Done button */}
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors"
                >
                  Upload Another File
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
