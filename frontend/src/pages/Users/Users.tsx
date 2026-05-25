import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

import Badge from '../../components/ui/badge/Badge';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

interface User {
  id: any;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  priority: string;
  follow_up_date: string;
  source: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [page, setPage] = useState(1);
  const [activeDropdownId, setActiveDropdownId] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const navigate = useNavigate();


  const toggleDropdown = (id: any) => {
    setActiveDropdownId(activeDropdownId === id ? null : id);
  };

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const fetchLeads = async (pageNumber = 1) => {
    try {
      setLoading(false);
      setTableLoading(true);

      const response = await axios.get(`${apiUrl}/users`, {
        params: {
          page: pageNumber,
        },
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = response.data;

      setUsers(result.data);

      setTableLoading(false);

      setPagination({
        current_page: result.current_page,
        last_page: result.last_page,
        per_page: result.per_page,
        total: result.total,
      });
    } catch (error) {
      console.error('Failed to fetch leads: ', error);
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(page);
  }, [page]);

  const handleDelete = async (id: any) => {
    // 2. Trigger the SweetAlert confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this user record!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        container: 'z-[99999]',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);

        try {
          const response = await axios.delete(`${apiUrl}/users/${id}`, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          const data = response.data;

          if (data.success || response.status === 200) {
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
            toast.success('User deleted successfully');
          }
        } catch (error) {
          console.error('Failed to delete user: ', error);
          toast.error('Something went wrong while deleting');
        } finally {
          setLoading(false);
        }
      }
    });
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
      <div className="space-y-6">
        <ComponentCard title="Users" button="Add User" buttonLink="/add-user">
          
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Email
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Phone
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Roles
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {tableLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-10 text-center">
                        <div className="flex justify-center items-center py-6">
                          <ClipLoader size={28} color="#465fff" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-10 text-center text-gray-500">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <div className="flex items-center gap-3">
                            <div>
                              <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                {user.name}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {user.email}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {user.phone}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        
                        <Badge
                            size="sm"
                            color={'success'}
                          >
                            {user.roles === 1 ? 'Admin' : (user.roles === 2 ? 'Sales Executive' : 'Manager')}  
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <div className="relative inline-block">
                            <div>
                              <div>
                                {/* Pass the specific record ID to the toggle function */}
                                <button
                                  onClick={() => toggleDropdown(user.id)}
                                  className="text-gray-500 dark:text-gray-400 focus:outline-none"
                                >
                                  <svg
                                    className="fill-current"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://w3.org"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                      d="M5.99902 10.245C6.96552 10.245 7.74902 11.0285 7.74902 11.995V12.005C7.74902 12.9715 6.96552 13.755 5.99902 13.755C5.03253 13.755 4.24902 12.9715 4.24902 12.005V11.995C4.24902 11.0285 5.03253 10.245 5.99902 10.245ZM17.999 10.245C18.9655 10.245 19.749 11.0285 19.749 11.995V12.005C19.749 12.9715 18.9655 13.755 17.999 13.755C17.0325 13.755 16.249 12.9715 16.249 12.005V11.995C16.249 11.0285 17.0325 10.245 17.999 10.245ZM13.749 11.995C13.749 11.0285 12.9655 10.245 11.999 10.245C11.0325 10.245 10.249 11.0285 10.249 11.995V12.005C10.249 12.9715 11.0325 13.755 11.999 13.755C12.9655 13.755 13.749 12.9715 13.749 12.005V11.995Z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                </button>
                              </div>

                              {/* Only display if this specific row's ID matches the active ID */}
                              {activeDropdownId === user.id && (
                                <div
                                  className="z-10"
                                  style={{
                                    position: 'absolute',
                                    inset: '0px 0px auto auto',
                                    margin: '0px',
                                    transform: 'translate3d(0px, 32.8px, 0px)',
                                  }}
                                  data-popper-placement="bottom-end"
                                >
                                  <div className="p-2 bg-white border border-gray-200 rounded-2xl shadow-lg dark:border-gray-800 dark:bg-gray-900 w-40">
                                    <div
                                      className="space-y-1"
                                      role="menu"
                                      aria-orientation="vertical"
                                      aria-labelledby="options-menu"
                                    >
                                      <button
                                        onClick={() => {
                                          // 1. Navigate to the edit URL with the current lead's ID
                                          navigate(`/edit-user/${user.id}`);

                                          // 2. Close the dropdown menu
                                          setActiveDropdownId(null);
                                        }}
                                        className="text-xs flex w-full rounded-lg px-3 py-2 text-left font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleDelete(user.id);
                                        }}
                                        className="text-xs flex w-full rounded-lg px-3 py-2 text-left font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                       
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          {pagination && (
            <div className="flex items-center gap-3 mt-4">
              <button
                disabled={pagination.current_page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="px-4 py-2 border disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {pagination.current_page} of {pagination.last_page}
              </span>
              <button
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-4 py-2 border disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
