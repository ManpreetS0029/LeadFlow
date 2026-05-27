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
import { useAuth } from '../../context/AuthContext';
import Can from '../../components/Can';
import { Modal } from '../../components/ui/modal';
import { useModal } from '../../hooks/useModal';

interface Lead {
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

const statuses = [
    'new',
    'contacted',
    'qualified',
    'proposal_sent',
    'converted',
    'lost',
  ];

export default function Leads() {
  const { hasPermission } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [page, setPage] = useState(1);
  const [activeDropdownId, setActiveDropdownId] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');

  const toggleDropdown = (id: any) => {
    setActiveDropdownId(activeDropdownId === id ? null : id);
  };

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const { isOpen, openModal, closeModal } = useModal();
  const [selectedLead, setSelectedLead] = useState({
  id: null,
  status: '',
});

const handleOpenStatusModal = (lead) => {
  setSelectedLead({
    id: lead.id,
    status: lead.status,
  });

  openModal();
};

  const fetchLeads = async (pageNumber = 1) => {
    try {
      setLoading(false);
      setTableLoading(true);

      const response = await axios.get(`${apiUrl}/leads`, {
        params: {
          page: pageNumber,
          search,
          status,
          source,
        },
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = response.data;

      setLeads(result.data);

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
  }, [page, search, status, source]);

  const handleDelete = async (id: any) => {
    // 2. Trigger the SweetAlert confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this lead record!",
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
          const response = await axios.delete(`${apiUrl}/leads/${id}`, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          const data = response.data;

          if (data.success || response.status === 200) {
            setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== id));
            toast.success('Lead deleted successfully');
          }
        } catch (error) {
          console.error('Failed to delete lead: ', error);
          toast.error('Something went wrong while deleting');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const formatStatus = (value) => {
    if (!value) {
      return '-';
    }

    return value
      .replace('_', ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();

    try {
      await axios.patch(
        `${apiUrl}/leads/${selectedLead.id}/status`,
        { status: selectedLead.status },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success('Status updated successfully');
      fetchLeads(page);
      setActiveDropdownId(null);
      closeModal();
    } catch (error) {
      console.error('Failed to update status: ', error);
      toast.error('Failed to update status');
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
      <PageMeta title="Lead | LeadFlow" description="Leads Management System" />
      <PageBreadcrumb pageTitle="Leads" />
      <div className="space-y-6">
        <ComponentCard
          title="Leads"
          {...(hasPermission('leads.create') && {
            button: 'Add Lead',
            buttonLink: '/add-lead',
          })}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Can permission="leads.search">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, phone, company"
                className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-500"
              />
            </Can>

            <Can permission="leads.filters">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-blue-500"
              >
                <option value="" className="dark:bg-gray-900 dark:text-white">
                  All Status
                </option>
                <option
                  value="new"
                  className="dark:bg-gray-900 dark:text-white"
                >
                  New
                </option>
                <option
                  value="contacted"
                  className="dark:bg-gray-900 dark:text-white"
                >
                  Contacted
                </option>
                <option
                  value="qualified"
                  className="dark:bg-gray-900 dark:text-white"
                >
                  Qualified
                </option>
                <option
                  value="proposal_sent"
                  className="dark:bg-gray-900 dark:text-white"
                >
                  Proposal Sent
                </option>
                <option
                  value="converted"
                  className="dark:bg-gray-900 dark:text-white"
                >
                  Converted
                </option>
                <option
                  value="lost"
                  className="dark:bg-gray-900 dark:text-white"
                >
                  Lost
                </option>
              </select>

              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Filter by source"
                className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-500"
              />
            </Can>
          </div>

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
                      Company
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Source
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Priority
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Follow Up Date
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
                  ) : leads.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="py-10 text-center text-gray-500"
                      >
                        No leads found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <div className="flex items-center gap-3">
                            <div>
                              <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                {lead.name}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {lead.email}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {lead.phone}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {lead.company}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {lead.source}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <Badge
                            size="sm"
                            color={
                              lead.status === 'new'
                                ? 'success'
                                : lead.status === 'contacted' ||
                                    lead.status === 'qualified'
                                  ? 'warning'
                                  : 'error'
                            }
                          >
                            {lead.status.charAt(0).toUpperCase() +
                              lead.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <Badge
                            size="sm"
                            color={
                              lead.priority === 'low'
                                ? 'success'
                                : lead.priority === 'medium'
                                  ? 'warning'
                                  : 'error'
                            }
                          >
                            {lead.priority.charAt(0).toUpperCase() +
                              lead.priority.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {lead.follow_up_date}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <div className="relative inline-block">
                            <div>
                              <div>
                                {/* Pass the specific record ID to the toggle function */}
                                <button
                                  onClick={() => toggleDropdown(lead.id)}
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
                              {activeDropdownId === lead.id && (
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
                                      <Can permission="leads.view">
                                        <button
                                          onClick={() => {
                                            navigate(`/view-lead/${lead.id}`);
                                            setActiveDropdownId(null);
                                          }}
                                          className="text-xs flex w-full rounded-lg px-3 py-2 text-left font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                                        >
                                          View
                                        </button>
                                      </Can>
                                      <Can permission="leads.update">
                                        <button
                                          onClick={() => {
                                            // 1. Navigate to the edit URL with the current lead's ID
                                            navigate(`/edit-lead/${lead.id}`);

                                            // 2. Close the dropdown menu
                                            setActiveDropdownId(null);
                                          }}
                                          className="text-xs flex w-full rounded-lg px-3 py-2 text-left font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                                        >
                                          Edit
                                        </button>
                                        <Can permission="leads.change.status">
                                          <button
                                            className="text-xs flex w-full rounded-lg px-3 py-2 text-left font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                                            onClick={() => handleOpenStatusModal(lead)}
                                          >
                                            Change Status
                                          </button>
                                        </Can>
                                      </Can>
                                      <Can permission="leads.delete">
                                        <button
                                          onClick={() => {
                                            handleDelete(lead.id);
                                          }}
                                          className="text-xs flex w-full rounded-lg px-3 py-2 text-left font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                                        >
                                          Delete
                                        </button>
                                      </Can>
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

            <Modal
              isOpen={isOpen}
              onClose={closeModal}
              className="max-w-[500px] p-6"
            >
              <form onSubmit={handleStatusUpdate}>
                <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                  Change Status
                </h4>

                <div className="mb-5">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Status
                  </label>

                  <select
                    value={selectedLead.status}
                    onChange={(e) => setSelectedLead({...selectedLead, status: e.target.value})}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    {statuses.map((item) => (
                      <option
                        key={item}
                        value={item}
                        className="dark:bg-gray-900 dark:text-white"
                      >
                        {formatStatus(item)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
                  >
                    Update Status
                  </button>
                </div>
              </form>
            </Modal>
          </div>
          {pagination && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/[0.05]">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Showing page{' '}
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {pagination.current_page}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {pagination.last_page}
                </span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  id="leads-pagination-prev"
                  disabled={pagination.current_page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="px-4 py-2 text-sm font-medium border rounded-lg transition-colors border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                >
                  Previous
                </button>
                <button
                  id="leads-pagination-next"
                  disabled={pagination.current_page === pagination.last_page}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-4 py-2 text-sm font-medium border rounded-lg transition-colors border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
