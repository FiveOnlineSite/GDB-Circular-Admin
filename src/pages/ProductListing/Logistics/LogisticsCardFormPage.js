import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import Upload from "../../../components/common/Upload";
import { Textarea } from "../../../components/ui/textarea";
import { getLogisticsCardById, createLogisticsCard, updateLogisticsCard } from "../../../services/productListing";

const ss = "w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white";

export default function LogisticsCardFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ card_title: "", card_description: "", icon_url: "", icon_alt: "", sequence: 0, status: "active" });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setPageLoading(true);
        const res = await getLogisticsCardById(id);
        if (res.success && res.data) {
          const d = res.data;
          setForm({ card_title: d.card_title || "", card_description: d.card_description || "", icon_url: d.icon_url || "", icon_alt: d.icon_alt || "", sequence: d.sequence ?? 0, status: d.status || "active" });
        } else { toast.error("Card not found"); navigate("/product-listing/logistics-support"); }
      } catch { toast.error("Failed to load"); navigate("/product-listing/logistics-support"); }
      finally { setPageLoading(false); }
    })();
  }, [id, isEdit, navigate]);

  const [errors, setErrors] = useState({});

  const handle = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {};
    if (!form.card_title.trim()) newErrors.card_title = "Card title is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = { ...form, sequence: Number(form.sequence) };
      const res = isEdit ? await updateLogisticsCard(id, payload) : await createLogisticsCard(payload);
      if (res.success) { toast.success(isEdit ? "Card updated" : "Card created"); navigate("/product-listing/logistics-support"); }
      else toast.error(res.message || "Operation failed");
    } catch (err) { toast.error(err.response?.data?.message || "Operation failed"); }
    finally { setSubmitting(false); }
  };

  if (pageLoading) return <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-[#981B1F] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 pb-12 w-full">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" type="button" onClick={() => navigate("/product-listing/logistics-support")} className="rounded-xl border-slate-200">
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{isEdit ? "Edit Card" : "Add Card"}</h1>
          <p className="text-slate-500 text-sm">Manage a logistics support card</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">Card Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Card Title <span className="text-red-500">*</span></label>
              <Input
                name="card_title"
                value={form.card_title}
                onChange={handle}
                placeholder="e.g. Express Delivery"
                error={!!errors.card_title}
                errorMessage={errors.card_title}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Card Description</label>
              <Textarea name="card_description" value={form.card_description} onChange={handle} rows={4} placeholder="Describe this support feature..." />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Icon Alt Text</label>
              <Input name="icon_alt" value={form.icon_alt} onChange={handle} placeholder="Alt text for icon/image" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Sequence</label>
              <Input type="number" min="0" name="sequence" value={form.sequence} onChange={handle} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Status</label>
              <select name="status" value={form.status} onChange={handle} className={ss}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Icon/Image Upload */}
          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-2">
              Icon / Image
            </label>
            <Upload
              value={form.icon_url}
              onChange={(url) => setForm(p => ({ ...p, icon_url: url }))}
              mediaType="image"
              accept="image/*"
              maxSizeKB={30}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/product-listing/logistics-support")}>Cancel</Button>
          <Button type="submit" disabled={submitting} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />{isEdit ? "Update Card" : "Create Card"}</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
