import { useEffect, useState } from 'react';
import { FormField, SelectInput, TextArea, TextInput } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { buildAssetFormData } from '../../utils/helpers';
import { createAsset, updateAsset } from '../../api/assets';
import { useToast } from '../../context/ToastContext';

const emptyForm = {
  assetName: '',
  category: '',
  vendor: '',
  department: '',
  model: '',
  serialNumber: '',
  purchaseDate: '',
  purchaseCost: '',
  warrantyExpiry: '',
  additionalNotes: '',
};

const getTodayDateValue = () => {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;

  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const getNextDateValue = (dateValue) => {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + 1);

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

export default function AssetForm({
  initialValues,
  assetId,
  categories,
  vendors,
  departments = [],
  onSuccess,
  onCancel,
}) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ ...emptyForm, ...initialValues });
  const [imageFile, setImageFile] = useState(null);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const todayDate = getTodayDateValue();
  const tomorrowDate = getNextDateValue(todayDate);

  const validateDates = () => {
    if (form.purchaseDate && form.purchaseDate > todayDate) {
      return 'Purchase date cannot be after today.';
    }

    if (form.warrantyExpiry && form.warrantyExpiry <= todayDate) {
      return 'Warranty expiry date must be greater than today.';
    }

    if (
      form.purchaseDate &&
      form.warrantyExpiry &&
      form.warrantyExpiry < form.purchaseDate
    ) {
      return 'Warranty expiry date cannot be before purchase date.';
    }

    return '';
  };

  useEffect(() => {
    if (initialValues) {
      setForm({ ...emptyForm, ...initialValues });
    }
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const dateError = validateDates();
    if (dateError) {
      showToast(dateError, 'error');
      return;
    }

    setLoading(true);

    try {
      const payload = buildAssetFormData(form, {
        assetImage: imageFile,
        assetInvoice: invoiceFile,
      });
      if (assetId) {
        await updateAsset(assetId, payload);
      } else {
        await createAsset(payload);
      }
      onSuccess?.();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Asset Name" required>
          <TextInput name="assetName" value={form.assetName} onChange={handleChange} required />
        </FormField>
        <FormField label="Model">
          <TextInput name="model" value={form.model} onChange={handleChange} />
        </FormField>
        <FormField label="Category" required>
          <SelectInput name="category" value={form.category} onChange={handleChange} required>
            <option value="">Select category</option>
            {categories.map((item) => (
              <option key={item._id} value={item._id}>
                {item.categoryName}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label="Vendor" required>
          <SelectInput name="vendor" value={form.vendor} onChange={handleChange} required>
            <option value="">Select vendor</option>
            {vendors.map((item) => (
              <option key={item._id} value={item._id}>
                {item.vendorName}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label="Department" required>
          <SelectInput name="department" value={form.department} onChange={handleChange} required>
            <option value="">Select department</option>
            {departments.map((item) => (
              <option key={item._id} value={item._id}>
                {item.deptName}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label="Serial Number">
          <TextInput name="serialNumber" value={form.serialNumber} onChange={handleChange} />
        </FormField>
        <FormField label="Purchase Cost">
          <TextInput
            type="number"
            min="0"
            name="purchaseCost"
            value={form.purchaseCost}
            onChange={handleChange}
          />
        </FormField>
        <FormField label="Purchase Date">
          <TextInput
            type="date"
            name="purchaseDate"
            value={form.purchaseDate}
            max={todayDate}
            onChange={handleChange}
          />
        </FormField>
        <FormField label="Warranty Expiry">
          <TextInput
            type="date"
            name="warrantyExpiry"
            value={form.warrantyExpiry}
            min={form.purchaseDate > tomorrowDate ? form.purchaseDate : tomorrowDate}
            onChange={handleChange}
          />
        </FormField>
        <FormField label="Asset Image" className="sm:col-span-2">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700"
          />
        </FormField>
        <FormField label="Asset Invoice" className="sm:col-span-2">
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={(event) => setInvoiceFile(event.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700"
          />
        </FormField>
        <FormField label="Additional Notes" className="sm:col-span-2">
          <TextArea
            name="additionalNotes"
            rows={3}
            value={form.additionalNotes}
            onChange={handleChange}
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {assetId ? 'Update Asset' : 'Create Asset'}
        </Button>
      </div>
    </form>
  );
}
