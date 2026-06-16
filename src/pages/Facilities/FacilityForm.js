import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import Upload from "../../components/common/Upload";
import { getFacility, createFacility, updateFacility } from "../../services/facilityService";
import { toast } from "sonner";

export default function FacilityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isView = location.pathname.includes('/facilities/view');
  const isEdit = Boolean(id) && !isView;

  const [form, setForm] = useState({ facility_name: "", facility_type: "", address: "", phone: "", state: "", latitude: "", longitude: "", image_url: "", image_alt: "", sequence: 0, status: "active" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (isEdit || isView) { setLoading(true); getFacility(id).then(r => { setForm(r); }).catch(()=>toast.error('Failed to load')).finally(()=>setLoading(false)); } }, [id, isEdit, isView]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView) return;
    // basic validation
    if (!form.facility_name || !form.facility_type || !form.address || !form.phone || !form.state || !form.latitude || !form.longitude || !form.image_alt) { toast.error('Please fill required fields'); return; }
    const mobileRegex = /^\+?[0-9\s-]{8,15}$/;
    if (!mobileRegex.test(form.phone.trim())) {
      toast.error('Please enter a valid phone number');
      return;
    }
    try {
      setLoading(true);
      if (isEdit) await updateFacility(id, form); else await createFacility(form);
      toast.success('Saved');
      navigate('/facilities');
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{isView ? 'View Facility' : isEdit ? 'Edit Facility' : 'Add Facility'}</h2>
        <p className="text-sm text-gray-500 mt-1">Provide facility details and an image for listings</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 ">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-600 block mb-1">Facility Name <span className="text-red-500">*</span></label>
            <Input value={form.facility_name} onChange={e=>setForm(f=>({...f, facility_name: e.target.value}))} required disabled={isView} />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 block mb-1">Facility Type <span className="text-red-500">*</span></label>
            <Input value={form.facility_type} onChange={e=>setForm(f=>({...f, facility_type: e.target.value}))} required disabled={isView} />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 block mb-1">Address <span className="text-red-500">*</span></label>
            <Textarea value={form.address} onChange={e=>setForm(f=>({...f, address: e.target.value}))} required disabled={isView} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-600 block mb-1">Phone <span className="text-red-500">*</span></label>
              <Input value={form.phone} onChange={e=>setForm(f=>({...f, phone: e.target.value}))} required disabled={isView} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 block mb-1">State <span className="text-red-500">*</span></label>
              <Input value={form.state} onChange={e=>setForm(f=>({...f, state: e.target.value}))} required disabled={isView} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-600 block mb-1">Latitude <span className="text-red-500">*</span></label>
              <Input value={form.latitude} onChange={e=>setForm(f=>({...f, latitude: e.target.value}))} required disabled={isView} />
            </div>
            <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1">Longitude <span className="text-red-500">*</span></label>
                <Input value={form.longitude} onChange={e=>setForm(f=>({...f, longitude: e.target.value}))} required disabled={isView} />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 block mb-1">Image Alt Text <span className="text-red-500">*</span></label>
            <Input value={form.image_alt} onChange={e=>setForm(f=>({...f, image_alt: e.target.value}))} required disabled={isView} />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-2">Image Upload <span className="text-red-500">*</span></label>
            <Upload
              value={form.image_url}
              onChange={(url) => setForm(f => ({ ...f, image_url: url }))}
              mediaType="image"
              accept="image/*"
              maxSizeKB={500}
              disabled={isView}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 block mb-1">Sequence</label>
            <Input type="number" value={form.sequence} onChange={e=>setForm(f=>({...f, sequence: Number(e.target.value)}))} disabled={isView} />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            {!isView && <Button type="submit" disabled={loading}>{loading? 'Saving...' : 'Save'}</Button>}
            <Button type="button" variant="outline" onClick={()=>navigate('/facilities')}>{isView ? 'Back' : 'Cancel'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
