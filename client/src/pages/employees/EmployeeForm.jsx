import { useEffect, useState } from 'react';
import { FormField, SelectInput, TextInput } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { buildEmployeeFormData } from '../../utils/helpers';
import { createEmployee, updateEmployee } from '../../api/employees';
import { getDepartments } from '../../api/departments';
import { useToast } from '../../context/ToastContext';

const emptyForm = {
  name: '',
  empId: '',
  email: '',
  designation: '',
  department: '',
  phone: '',
  dateOfJoining: '',
};

export default function EmployeeForm({ initialValues, employeeId, onSuccess, onCancel }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ ...emptyForm, ...initialValues });
  const [departments, setDepartments] = useState([]);
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDepartments()
      .then((data) => setDepartments(data.departments || []))
      .catch(() => {});
  }, []);

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
    setLoading(true);

    try {
      const payload = buildEmployeeFormData(form, files);
      if (employeeId) {
        await updateEmployee(employeeId, payload);
      } else {
        await createEmployee(payload);
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
        <FormField label="Full Name" required>
          <TextInput name="name" value={form.name} onChange={handleChange} required />
        </FormField>
        <FormField label="Employee ID" required>
          <TextInput
            name="empId"
            value={form.empId}
            onChange={handleChange}
            required
            disabled={!!employeeId}
          />
        </FormField>
        <FormField label="Email" required>
          <TextInput type="email" name="email" value={form.email} onChange={handleChange} required />
        </FormField>
        <FormField label="Phone">
          <TextInput name="phone" value={form.phone} onChange={handleChange} />
        </FormField>
        <FormField label="Department">
          {departments.length ? (
            <SelectInput name="department" value={form.department} onChange={handleChange}>
              <option value="">Select department</option>
              {departments.map((item) => (
                <option key={item._id} value={item.deptName}>
                  {item.deptName}
                </option>
              ))}
            </SelectInput>
          ) : (
            <TextInput name="department" value={form.department} onChange={handleChange} />
          )}
        </FormField>
        <FormField label="Designation">
          <TextInput name="designation" value={form.designation} onChange={handleChange} />
        </FormField>
        <FormField label="Date of Joining">
          <TextInput
            type="date"
            name="dateOfJoining"
            value={form.dateOfJoining}
            onChange={handleChange}
          />
        </FormField>
        <FormField label="Profile Picture">
          <input
            type="file"
            accept="image/*"
            onChange={(event) =>
              setFiles((current) => ({ ...current, profilePic: event.target.files?.[0] }))
            }
            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700"
          />
        </FormField>
        <FormField label="ID Proof Document" className="sm:col-span-2">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(event) =>
              setFiles((current) => ({ ...current, idProofDoc: event.target.files?.[0] }))
            }
            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700"
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {employeeId ? 'Update Employee' : 'Create Employee'}
        </Button>
      </div>
    </form>
  );
}
