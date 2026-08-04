import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import Upload from "../../components/common/Upload";
import EditPageDeleteAction from "../../components/common/EditPageDeleteAction";
import {
  getFacilitiesWhatWeDoCardById,
  createFacilitiesWhatWeDoCard,
  updateFacilitiesWhatWeDoCard,
} from "../../services/facilityService";

const selectStyle = "w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition bg-white";

export default function WhatWeDoCardForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    card_title: "",
    card_description: "",
    icon_url: "",
    icon_alt: "",
    sequence: 0,
    status: "active",
  });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setPageLoading(true);
        const res = await getFacilitiesWhatWeDoCardById(id);
        if (res.success && res.data) {
          setForm({
            card_title: res.data.card_title || "",
            card_description: res.data.card_description || "",
            icon_url: res.data.icon_url || "",
            icon_alt: res.data.icon_alt || "",
            sequence: res.data.sequence ?? 0,
            status: res.data.status || "active",
          });
        } else {
          toast.error("Card not found");
          navigate("/facilities/what-we-do");
        }
      } catch {
        toast.error("Failed to load card");
        navigate("/facilities/what-we-do");
      } finally {
        setPageLoading(false);
      }
    })();
  }, [id, isEdit, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.card_title.trim()) nextErrors.card_title = "Card title is required";
    if (!form.icon_url) nextErrors.icon_url = "Icon upload is required";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        card_title: form.card_title.trim(),
        card_description: form.card_description.trim(),
        icon_alt: form.icon_alt.trim(),
        sequence: Number(form.sequence),
      };
      const res = isEdit ? await updateFacilitiesWhatWeDoCard(id, payload) : await createFacilitiesWhatWeDoCard(payload);
      if (res.success) {
        toast.success(isEdit ? "Card updated" : "Card created");
        navigate("/facilities/what-we-do");
      } else {
        toast.error(res.message || "Operation failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-[#981B1F] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 pb-12 w-full">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" type="button" onClick={() => navigate("/facilities/what-we-do")} className="rounded-xl border-slate-200">
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{isEdit ? "Edit What We Do Card" : "Add What We Do Card"}</h1>
          <p className="text-slate-500 text-sm">Manage a facilities service card</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700 border-b pb-3">Card Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-600 block mb-1">Card Title <span className="text-red-500">*</span></label>
              <Input name="card_title" value={form.card_title} onChange={handleChange} error={!!errors.card_title} errorMessage={errors.card_title} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-600 block mb-1">Card Description</label>
              <Textarea name="card_description" value={form.card_description} onChange={handleChange} rows={4} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 block mb-1">Icon Alt Text</label>
              <Input name="icon_alt" value={form.icon_alt} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 block mb-1">Sequence</label>
              <Input type="number" min="0" name="sequence" value={form.sequence} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 block mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={selectStyle}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600 block mb-2">Icon Upload <span className="text-red-500">*</span></label>
            <Upload value={form.icon_url} onChange={(url) => { setForm((prev) => ({ ...prev, icon_url: url })); setErrors((prev) => ({ ...prev, icon_url: undefined })); }} mediaType="image" accept="image/*" maxSizeKB={500} />
            {errors.icon_url && <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">{errors.icon_url}</span>}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <EditPageDeleteAction
            id={isEdit ? id : null}
            permission="facilities.whatwedo.delete"
            endpoint={`/facilities/what-we-do/cards/${id}`}
            redirectTo="/facilities/what-we-do"
            title="Delete Card"
            message="Are you sure you want to delete this card?"
            successMessage="Card deleted"
          />
          <Button type="button" variant="outline" onClick={() => navigate("/facilities/what-we-do")}>Cancel</Button>
          <Button type="submit" disabled={submitting} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />{isEdit ? "Update Card" : "Create Card"}</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
