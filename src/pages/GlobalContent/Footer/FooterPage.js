import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, Loader2, Globe, Edit2, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { getFooter, updateFooter } from "../../../services/globalContent/footer";
import Upload from "../../../components/common/Upload";

const fieldStyle =
  "w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white";

const emptySocialLink = () => ({
  _tempId: Date.now() + Math.random(),
  platform_name: "",
  icon_url: "",
  url: "",
  alt_text: "",
  sequence: 0,
  status: "active",
});

export default function FooterPage() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    phone: "",
    email: "",
    address: "",
    footer_description: "",
  });

  const [socialLinks, setSocialLinks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getFooter();
        if (res.success && res.data) {
          const d = res.data;
          const contact = d.contact || {};
          setForm({
            phone: contact.phone || "",
            email: contact.email || "",
            address: contact.address || "",
            footer_description: contact.footer_description || "",
          });
          const links = Array.isArray(d.socialLinks)
            ? d.socialLinks.map((l) => ({ ...l, _tempId: l.id || Date.now() + Math.random() }))
            : [];
          setSocialLinks(links);
          const hasData = !!(contact.phone || contact.email || contact.address || contact.footer_description || links.length > 0);
          setIsEditing(!hasData);
        } else {
          setIsEditing(true);
        }
      } catch (err) {
        toast.error("Failed to load footer details");
        setIsEditing(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [errors, setErrors] = useState({});

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleLinkChange = (tempId, field, value) => {
    setSocialLinks((prev) =>
      prev.map((l) => (l._tempId === tempId ? { ...l, [field]: value } : l))
    );
    const errKey = `${tempId}_${field}`;
    if (errors[errKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errKey];
        return next;
      });
    }
  };



  const addLink = () =>
    setSocialLinks((prev) => [...prev, emptySocialLink()]);

  const removeLink = (tempId) =>
    setSocialLinks((prev) => prev.filter((l) => l._tempId !== tempId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (form.phone.trim()) {
      const mobileRegex = /^\+?[0-9\s-]{8,15}$/;
      if (!mobileRegex.test(form.phone)) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    // Validate social links
    for (const l of socialLinks) {
      if (!l.platform_name.trim()) {
        newErrors[`${l._tempId}_platform_name`] = "Platform name is required";
      }
      if (!l.url.trim()) {
        newErrors[`${l._tempId}_url`] = "URL is required";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        socialLinks: socialLinks.map(({ _tempId, ...rest }) => rest),
      };
      const res = await updateFooter(payload);
      if (res.success) {
        toast.success("Footer details updated successfully");
        setIsEditing(false);
      } else {
        toast.error(res.message || "Update failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#981B1F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500 text-sm">Loading footer details...</p>
        </div>
      </div>
    );
  }

  const hasExistingData = !!(form.phone || form.email || form.address || form.footer_description || socialLinks.length > 0);

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
          Contact &amp; Footer Details
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage contact information and social links shown in the footer
        </p>
      </div>

      {!isEditing && hasExistingData ? (
        /* Preview Card View */
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-700 dark:text-white">
                Current Footer Details
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">Contact details and social links currently active on the site</p>
            </div>
            <Button
              variant="outline"
              className="border-[#981B1F] text-[#981B1F] hover:bg-[#981B1F]/5 gap-2"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="w-4 h-4" /> Edit Details
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/35 flex items-center justify-center text-[#981B1F] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 dark:text-gray-500 block uppercase tracking-wider">Phone</span>
                  <span className="text-sm font-medium text-slate-800 dark:text-gray-200">{form.phone || "—"}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/35 flex items-center justify-center text-[#981B1F] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 dark:text-gray-500 block uppercase tracking-wider">Email</span>
                  <span className="text-sm font-medium text-slate-800 dark:text-gray-200">{form.email || "—"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/35 flex items-center justify-center text-[#981B1F] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 dark:text-gray-500 block uppercase tracking-wider">Address</span>
                  <span className="text-sm font-medium text-slate-800 dark:text-gray-200 whitespace-pre-wrap">{form.address || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {form.footer_description && (
            <div className="border-t pt-4">
              <span className="text-xs font-semibold text-slate-400 dark:text-gray-500 block uppercase tracking-wider mb-1">Footer Description</span>
              <p className="text-sm text-slate-600 dark:text-gray-350 whitespace-pre-wrap bg-slate-50 dark:bg-gray-800/40 p-4 rounded-xl">
                {form.footer_description}
              </p>
            </div>
          )}

          {socialLinks.length > 0 && (
            <div className="border-t pt-4 space-y-3">
              <span className="text-xs font-semibold text-slate-400 dark:text-gray-500 block uppercase tracking-wider">Social Links</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {socialLinks.map((link) => (
                  <div key={link._tempId} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50">
                    {link.icon_url ? (
                      <img
                        src={link.icon_url.startsWith("data:") ? link.icon_url : `${process.env.REACT_APP_API_URL || ""}${link.icon_url}`}
                        alt={link.alt_text || link.platform_name}
                        className="w-8 h-8 rounded object-contain border bg-white p-1"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-slate-200 dark:bg-gray-700 flex items-center justify-center text-slate-400">
                        <Globe className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-semibold text-slate-800 dark:text-gray-200 block truncate">{link.platform_name}</span>
                      <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 dark:text-blue-400 underline truncate block">
                        {link.url}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Edit Form View */
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Contact Info */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
            <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                  Phone
                </label>
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={handleFormChange}
                  placeholder="+91 98765 43210"
                  error={!!errors.phone}
                  errorMessage={errors.phone}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  placeholder="info@example.com"
                  error={!!errors.email}
                  errorMessage={errors.email}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Address
              </label>
              <Textarea name="address" value={form.address} onChange={handleFormChange} placeholder="123, Main Street, City, State - 000000" rows={3} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Footer Description
              </label>
              <Textarea name="footer_description" value={form.footer_description} onChange={handleFormChange} placeholder="Brief description shown in the footer..." rows={4} />
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-semibold text-slate-700 dark:text-white">
                Social Links
              </h2>
              <Button type="button" size="sm" onClick={addLink} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90">
                <Plus className="w-3 h-3 mr-1" /> Add Link
              </Button>
            </div>

            {socialLinks.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Globe className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No social links added yet. Click "Add Link" to add one.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {socialLinks.map((link, idx) => (
                  <div key={link._tempId} className="border border-slate-200 dark:border-gray-700 rounded-xl p-4 space-y-3 bg-slate-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600 dark:text-gray-300">
                        Social Link #{idx + 1}
                      </span>
                      <Button type="button" size="sm" variant="destructive" onClick={() => removeLink(link._tempId)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Platform Name <span className="text-red-500">*</span></label>
                        <Input
                          value={link.platform_name}
                          onChange={(e) => handleLinkChange(link._tempId, "platform_name", e.target.value)}
                          placeholder="Facebook, Twitter, LinkedIn..."
                          error={!!errors[`${link._tempId}_platform_name`]}
                          errorMessage={errors[`${link._tempId}_platform_name`]}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">URL <span className="text-red-500">*</span></label>
                        <Input
                          value={link.url}
                          onChange={(e) => handleLinkChange(link._tempId, "url", e.target.value)}
                          placeholder="https://facebook.com/yourpage"
                          error={!!errors[`${link._tempId}_url`]}
                          errorMessage={errors[`${link._tempId}_url`]}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Alt Text</label>
                        <Input value={link.alt_text} onChange={(e) => handleLinkChange(link._tempId, "alt_text", e.target.value)} placeholder="Follow us on Facebook" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Sequence</label>
                        <Input type="number" min="0" value={link.sequence} onChange={(e) => handleLinkChange(link._tempId, "sequence", Number(e.target.value))} placeholder="0" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Icon Upload</label>
                        <Upload
                          value={link.icon_url}
                          onChange={(url) => handleLinkChange(link._tempId, "icon_url", url)}
                          mediaType="image"
                          accept="image/*"
                          maxSizeKB={30}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Status</label>
                        <select value={link.status} onChange={(e) => handleLinkChange(link._tempId, "status", e.target.value)} className={fieldStyle}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            {hasExistingData && (
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={submitting} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90">
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" />Save Changes</>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
