import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import { useState } from 'react';
import ComponentCard from '../../components/common/ComponentCard';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import Button from '../../components/ui/button/Button';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

export default function AddUser() {
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
      const response = await axios.post(`${apiUrl}/users`, form, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = response.data;

      if (result.success) {
        toast.success('User created successfully');
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


  return (
    <>
      <PageMeta title="Users | LeadFlow" description="Leads Management System" />
      <PageBreadcrumb pageTitle="Users" />
      <ComponentCard title="Add User">
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
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
              />
               {errors.password && (
            <p className="text-red-600">{errors.password[0]}</p>
          )}
            </div>
            <div className="mt-4">
              <Label htmlFor="status">Roles</Label>
              <Select
                options={rolesOptions}
                placeholder="Select Option"
                onChange={(option) => handleSelectChange('roles', option)}
              />
              {errors.roles && (
                <p className="text-red-500">{errors.roles[0]}</p>
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
