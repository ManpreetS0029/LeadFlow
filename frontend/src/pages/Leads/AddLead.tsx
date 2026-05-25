import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import { useState } from 'react';
import ComponentCard from '../../components/common/ComponentCard';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import DatePicker from '../../components/form/date-picker.tsx';
import TextArea from '../../components/form/input/TextArea';
import Button from '../../components/ui/button/Button';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

export default function AddLead() {
  const navigate = useNavigate();

  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'lost', label: 'Lost' },
    { value: 'converted', label: 'Converted' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  const [form, setForm] = useState({
    user_id: localStorage.getItem("user_id"),
    name: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    status: '',
    priority: '',
    follow_up_date: '',
    notes: '',
    estimated_value: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    e.preventDefault();

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (fieldName, option) => {
    // Check if component returns option object {value, label} or raw value string
    const selectedValue = option?.value !== undefined ? option.value : option;

    setForm({
      ...form,
      [fieldName]: selectedValue,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const apiUrl = import.meta.env.VITE_API_URL;

    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(`${apiUrl}/leads`, form, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = response.data;

      if (result.success) {
        toast.success('Lead created successfully');
        setTimeout(() => {
          navigate('/leads');
        }, 1200);
      }
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response?.data.errors);
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <PageMeta title="Lead | LeadFlow" description="Leads Management System" />
      <PageBreadcrumb pageTitle="Leads" />
      <ComponentCard title="Add Lead">
        <div className="space-y-6">
          <form onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <p className="text-red-500">{errors.name[0]}</p>}
            </div>
            <div className="mt-4">
              <Label htmlFor="email">Email</Label>
              <Input
                type="text"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="phone">Phone</Label>
              <Input
                type="text"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="company">Company</Label>
              <Input
                type="text"
                id="company"
                name="company"
                value={form.company}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="source">Source</Label>
              <Input
                type="text"
                id="source"
                name="source"
                value={form.source}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="status">Status</Label>
              <Select
                options={statusOptions}
                placeholder="Select Option"
                onChange={(option) => handleSelectChange('status', option)}
              />
              {errors.status && (
                <p className="text-red-500">{errors.status[0]}</p>
              )}
            </div>
            <div className="mt-4">
              <Label htmlFor="priority">Priority</Label>
              <Select
                options={priorityOptions}
                placeholder="Select Option"
                onChange={(option) => handleSelectChange('priority', option)}
              />
              {errors.priority && (
                <p className="text-red-500">{errors.priority[0]}</p>
              )}
            </div>
            <div className="mt-4">
              <Label htmlFor="estimated_value">Estimated Value ($)</Label>
              <Input
                type="number"
                id="estimated_value"
                name="estimated_value"
                value={form.estimated_value}
                onChange={handleChange}
                placeholder="Estimated Value"
              />
            </div>
            <div className="mt-4">
              <DatePicker
                id="date-picker"
                label="Follow Up Date"
                placeholder="Select a date"
                onChange={(dates, currentDateString) => {
                  setForm({
                    ...form,
                    follow_up_date: currentDateString,
                  });
                }}
              />
              {errors.follow_up_date && (
                <p className="text-red-500">{errors.follow_up_date[0]}</p>
              )}
            </div>
            <div className="mt-4">
              <Label htmlFor="notes">Notes</Label>
              <TextArea
                value={form.notes}
                onChange={(value) => setForm({ ...form, notes: value })}
                rows={6}
              />
            </div>

            <Button size="sm" variant="primary" className="mt-4">
              {loading ? <ClipLoader size={20} color="#fff" /> : 'Submit'}
            </Button>
          </form>
        </div>
      </ComponentCard>
    </>
  );
}
