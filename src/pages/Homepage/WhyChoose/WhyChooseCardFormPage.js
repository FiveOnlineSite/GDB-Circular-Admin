import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import Upload from "../../../components/common/Upload";
import EditPageDeleteAction from "../../../components/common/EditPageDeleteAction";
import { getWhyChooseCardById, createWhyChooseCard, updateWhyChooseCard } from "../../../services/homepage";

const selectStyle = "w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition bg-white   ";


export default function WhyChooseCardFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ card_title: "", card_description: "", file_url: "", cover_image_url: "", cover_image_alt: "", alt_text: "", sequence: 0, status: "active" });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setPageLoading(true);
        const res = await getWhyChooseCardById(id);
        if (res.success && res.data) {
          const d = res.data;
          setForm({ card_title: d.card_title || "", card_description: d.card_description || "", file_url: d.file_url || "", cover_image_url: d.cover_image_url || "", cover_image_alt: d.cover_image_alt || "", alt_text: d.alt_text || "", sequence: d.sequence ?? 0, status: d.status || "active" });
        } else { toast.error("Card not found"); navigate("/homepage-management/whychoose"); }
      } catch { toast.error("Failed to load"); navigate("/homepage-management/whychoose"); }
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

  const handlePrimaryMediaChange = (url) => {
    setForm((prev) => ({ ...prev, file_url: url }));
    if (errors.file_url || (!url && errors.alt_text)) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.file_url;
        if (!url) delete next.alt_text;
        return next;
      });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {};
    if (!form.card_title.trim()) newErrors.card_title = "Card title is required";
    if (!form.card_description.trim()) newErrors.card_description = "Card description is required";
    if (!form.file_url) newErrors.file_url = "Video / Primary Media Upload is required";
    if (form.file_url && !form.alt_text.trim()) newErrors.alt_text = "Primary media alt text is required when media is uploaded";
    if (form.cover_image_url && !form.cover_image_alt.trim()) newErrors.cover_image_alt = "Cover image alt text is required when an image is uploaded";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        card_title: form.card_title.trim(),
        card_description: form.card_description.trim(),
        alt_text: form.alt_text.trim(),
        cover_image_alt: form.cover_image_alt.trim(),
        sequence: Number(form.sequence),
      };
      const res = isEdit ? await updateWhyChooseCard(id, payload) : await createWhyChooseCard(payload);
      if (res.success) { toast.success(isEdit ? "Card updated" : "Card created"); navigate("/homepage-management/whychoose"); }
      else toast.error(res.message || "Operation failed");
    } catch (err) { toast.error(err.response?.data?.message || "Operation failed"); }
    finally { setSubmitting(false); }
  };

  if (pageLoading) return <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-[#981B1F] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 pb-12 w-full">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" type="button" onClick={() => navigate("/homepage-management/whychoose")} className="rounded-xl border-slate-200">
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800  tracking-tight">{isEdit ? "Edit Card" : "Add Card"}</h1>
          <p className="text-slate-500 text-sm">Manage a "Why Choose Us" card</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="bg-white  rounded-2xl border border-slate-100  shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700  border-b pb-3">Card Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-600  block mb-1">Card Title <span className="text-red-500">*</span></label>
              <Input
                name="card_title"
                value={form.card_title}
                onChange={handle}
                placeholder="e.g. Quality Assurance"
                error={!!errors.card_title}
                errorMessage={errors.card_title}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-600  block mb-1">Card Description <span className="text-red-500">*</span></label>
              <Textarea
                name="card_description"
                value={form.card_description}
                onChange={handle}
                rows={4}
                placeholder="Why this makes us unique..."
                error={!!errors.card_description}
                errorMessage={errors.card_description}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600  block mb-1">Status</label>
              <select name="status" value={form.status} onChange={handle} className={selectStyle}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="text-sm font-semibold text-slate-600  block mb-2">
                Video / Primary Media Upload <span className="text-red-500">*</span>
              </label>
              <Upload
                value={form.file_url}
                onChange={handlePrimaryMediaChange}
                mediaType="both"
                accept="image/*,video/mp4,video/webm,video/quicktime"
                maxSizeKB={500}
                maxSizeMB={10}
              />
              {errors.file_url && (
                <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
                  {errors.file_url}
                </span>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600  block mb-2">Primary Media Alt Text <span className="text-red-500">*</span></label>
              <Input name="alt_text" value={form.alt_text} onChange={handle} placeholder="Describe the primary image or video" error={!!errors.alt_text} errorMessage={errors.alt_text} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="text-sm font-semibold text-slate-600  block mb-2">
                Cover Image Upload
              </label>
              <Upload
                value={form.cover_image_url}
                onChange={(url) => {
                  setForm((prev) => ({ ...prev, cover_image_url: url }));
                  if (!url && errors.cover_image_alt) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.cover_image_alt;
                      return next;
                    });
                  }
                }}
                mediaType="image"
                accept="image/*"
                maxSizeKB={500}
              />
              <p className="mt-1 text-xs text-slate-500">Shown while the card video is loading on the homepage.</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 block mb-2">
                Cover Image Alt Text
                {form.cover_image_url && <span className="text-red-500"> *</span>}
              </label>
              <Input
                name="cover_image_alt"
                value={form.cover_image_alt}
                onChange={handle}
                placeholder="Describe the cover image"
                required={Boolean(form.cover_image_url)}
                aria-required={Boolean(form.cover_image_url)}
                error={!!errors.cover_image_alt}
                errorMessage={errors.cover_image_alt}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <EditPageDeleteAction
            id={isEdit ? id : null}
            permission="homepage.whychoose.delete"
            endpoint={`/homepage/whychoose/cards/${id}`}
            redirectTo="/homepage-management/whychoose"
            title="Delete Card"
            message="Are you sure you want to delete this card?"
            successMessage="Card deleted"
          />
          <Button type="button" variant="outline" onClick={() => navigate("/homepage-management/whychoose")}>Cancel</Button>
          <Button type="submit" disabled={submitting} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />{isEdit ? "Update Card" : "Create Card"}</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
