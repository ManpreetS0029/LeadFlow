import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import { useState, useEffect } from 'react';
import ComponentCard from '../../components/common/ComponentCard';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import Button from '../../components/ui/button/Button';
import { useNavigate, useParams } from 'react-router';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

export default function EditUser() {
  const { id } = useParams();

  const navigate = useNavigate();

  const rolesOptions = [
    { value: '1', label: 'Admin' },
    { value: '2', label: 'Sales Executive' },
    { value: '3', label: 'Manager' },
  ];

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role_id: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const getLead = async () => {

    setLoading(true);

    try {
      const response = await axios.get(`${apiUrl}/users/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = response.data;

      setForm({
        name: result.name,
        email: result.email,
        phone: result.phone,
        role_id: result.role_id,
        password: '',
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to get user: ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLead();
  }, []);

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
      const response = await axios.patch(`${apiUrl}/users/${id}`, form, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = response.data;

      if (result.success) {
        toast.success("User saved successfully!");

        setTimeout(() => {
          navigate('/users');
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <ClipLoader size={35} color="#465fff" />
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Users | LeadFlow" description="Leads Management System" />
      <PageBreadcrumb pageTitle="Users" />
      <ComponentCard title="Edit Users">
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
              <Label htmlFor="password">New Password (optional)</Label>
              <Input
                type="text"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="roles">Roles</Label>
              <Select
                key={`roles-${form.roles}`}
                options={rolesOptions}
                placeholder="Select Option"
                defaultValue={form.role_id ? String(form.role_id) : ""}
                onChange={(option) => handleSelectChange('role_id', option)}
              />
              {errors.role_id && (
                <p className="text-red-500">{errors.role_id[0]}</p>
              )}
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
