import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { Modal } from '../../components/ui/modal';
import { useModal } from '../../hooks/useModal';
import Swal from 'sweetalert2';
import TextArea from '../../components/form/input/TextArea';
import { useAuth } from '../../context/AuthContext';
import Can from '../../components/Can';

export default function ViewLead() {
  const { hasPermission } = useAuth();

  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [lead, setLead] = useState([]);
  const {
    isOpen: isStatusModalOpen,
    openModal: openStatusModal,
    closeModal: closeStatusModal,
  } = useModal();

  const {
    isOpen: isNoteModalOpen,
    openModal: openNoteModal,
    closeModal: closeNoteModal,
  } = useModal();

  const {
    isOpen: isAssignLeadModalOpen,
    openModal: openAssignLeadModal,
    closeModal: closeAssignLeadModal,
  } = useModal();

  const [status, setStatus] = useState('');
  const [form, setForm] = useState({
    note: '',
  });

  const statuses = [
    'new',
    'contacted',
    'qualified',
    'proposal_sent',
    'converted',
    'lost',
  ];

  const [users, setUsers] = useState([]);

  const [assignedUserId, setAssignedUserId] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const getLead = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${apiUrl}/leads/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = response.data;

      setLead(result.data ?? result);

      setLoading(false);
    } catch (error) {
      console.error('Failed to get lead: ', error);
    } finally {
      setLoading(false);
    }
  };

  const getUsers = async () => {
    try {
      const response = await axios.get(`${apiUrl}/sales-users`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = response.data;

      setUsers(result.data ?? result);
    } catch (error) {
      console.error('Failed to get users: ', error);
    }
  };

  useEffect(() => {
    getLead();
  }, []);

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    if (lead?.status) {
      setStatus(lead.status);
    }
    if (lead?.assigned_user_id) {
      setAssignedUserId(lead.assigned_user_id);
    }
  }, [lead]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.patch(
        `${apiUrl}/leads/${id}/status`,
        { status },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setLead((prev) => ({
        ...prev,
        status: response.data.lead?.status ?? status,
      }));

      toast.success('Status updated successfully');
      closeStatusModal();
    } catch (error) {
      console.error('Failed to update status: ', error);
      toast.error('Failed to update status');
    }
  };

  const formatStatus = (value) => {
    if (!value) {
      return '-';
    }

    return value
      .replace('_', ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getFollowUpStatus = (date) => {
    if (!date) {
      return (
        <span className="mt-2 inline-block rounded-full bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600 dark:bg-gray-500/15 dark:text-gray-400">
          No Follow-Up
        </span>
      );
    }

    const today = new Date();
    const followUpDate = new Date(date);

    today.setHours(0, 0, 0, 0);
    followUpDate.setHours(0, 0, 0, 0);

    if (followUpDate < today) {
      return (
        <span className="mt-2 inline-block rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600 dark:bg-red-500/15 dark:text-red-400">
          Overdue
        </span>
      );
    }

    if (followUpDate.getTime() === today.getTime()) {
      return (
        <span className="mt-2 inline-block rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-400">
          Today
        </span>
      );
    }

    return (
      <span className="mt-2 inline-block rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-600 dark:bg-green-500/15 dark:text-green-400">
        Upcoming
      </span>
    );
  };

  const handleDelete = async (id) => {
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
            setLoading(false);
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

  const addNote = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${apiUrl}/leads/${id}/notes`, form, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const newNote = response.data.note;
      setLead((prev: any) => ({
        ...prev,
        notes: [newNote, ...(prev.notes || [])],
      }));

      setForm({
        note: '',
      });

      toast.success('Note added successfully');
      closeNoteModal();
    } catch (error) {
      console.error('Failed to update note: ', error);
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
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
        try {
          await axios.delete(`${apiUrl}/lead-notes/${noteId}`, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          setLead((prev: any) => ({
            ...prev,
            notes: prev.notes?.filter((note: any) => note.id !== noteId),
          }));

          toast.success('Note deleted successfully');
        } catch (error) {
          console.error('Failed to delete note: ', error);
          toast.error('Something went wrong while deleting');
        }
      }
    });
  };

  const handleAssignLead = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.patch(
        `${apiUrl}/leads/${id}/assign`,
        { assigned_user_id: assignedUserId },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAssignedUserId(response.data.lead?.assigned_user_id ?? assignedUserId);

      toast.success('Lead assigned successfully');
      closeAssignLeadModal();
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

  if (!lead) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Lead not found.
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title="Lead Details | LeadFlow"
        description="Leads Management System"
      />

      <PageBreadcrumb pageTitle="Lead Details" />

      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
                {lead.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Created on{' '}
                {new Date(lead.created_at).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>

            <span className="w-fit rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
              {lead.status
                ? lead.status.charAt(0).toUpperCase() + lead.status.slice(1)
                : '-'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left */}
          <div className="space-y-6 xl:col-span-2">
            {/* Lead Information */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:p-6">
              <h4 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
                Lead Information
              </h4>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Info label="Email" value={lead.email} />
                <Info label="Phone" value={lead.phone} />
                <Info label="Company" value={lead.company} />
                <Info label="Source" value={lead.source} />
                <Info
                  label="Estimated Value"
                  value={lead.estimated_value ?? '-'}
                />
                <Info label="Assigned To" value={lead.assignedTo ?? '-'} />
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Notes
                </h4>

                <Can permission="leads.notes.create">
                  <button
                    className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                    onClick={openNoteModal}
                  >
                    Add Note
                  </button>
                </Can>
              </div>

              <div className="space-y-4">
                {lead.notes?.map((note) => (
                  <div
                    key={note.id}
                    className="relative rounded-xl border border-gray-200 p-4 dark:border-gray-800"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {note.note}
                        </p>
                      </div>
                      <Can permission="leads.notes.delete">
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete Note"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </Can>
                    </div>
                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Added by {note.user?.name} •{' '}
                      {new Date(note.created_at).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            {/* Follow-up */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:p-6">
              <h4 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
                Follow-up
              </h4>

              <Info
                label="Next Follow-up"
                value={new Date(lead.follow_up_date).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                })}
              />

              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Status
                </p>
                {getFollowUpStatus(lead.follow_up_date)}
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:p-6">
              <h4 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
                Quick Actions
              </h4>

              <div className="space-y-3">
                <button
                  className="w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                  onClick={() => {
                    navigate(`/edit-lead/${lead.id}`);
                  }}
                >
                  Edit Lead
                </button>

                <Can permission="leads.status.change">
                <button
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06]"
                  onClick={openStatusModal}
                >
                  Change Status
                </button>
                </Can>

                <Can permission="leads.assign">
                  <button
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06]"
                    onClick={openAssignLeadModal}
                  >
                    Assign User
                  </button>
                </Can>

                <Can permission="leads.delete">
                  <button
                    className="w-full rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-400"
                    onClick={() => {
                      handleDelete(lead.id);
                    }}
                  >
                    Delete Lead
                  </button>
                </Can>
              </div>
            </div>

            {/* Activity */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:p-6">
              <h4 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
                Activity Timeline
              </h4>

              <div className="space-y-4">
                {lead.activities?.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-brand-500" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {activity.description}
                      <br />
                      User: {activity.user?.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Modal
              isOpen={isNoteModalOpen}
              onClose={closeNoteModal}
              className="max-w-[500px] p-6"
            >
              <form onSubmit={addNote}>
                <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                  Add Note
                </h4>

                <div className="mb-5">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Note
                  </label>

                  <TextArea
                    value={form.note}
                    rows={6}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        note: value,
                      })
                    }
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeNoteModal}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </Modal>

            <Modal
              isOpen={isStatusModalOpen}
              onClose={closeStatusModal}
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
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
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
                    onClick={closeStatusModal}
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

            <Modal
              isOpen={isAssignLeadModalOpen}
              onClose={closeAssignLeadModal}
              className="max-w-[500px] p-6"
            >
              <form onSubmit={handleAssignLead}>
                <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                  Assign Lead
                </h4>

                <div className="mb-5">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Users
                  </label>

                  <select
                    value={assignedUserId}
                    onChange={(e) => setAssignedUserId(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    {users.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                        className="dark:bg-gray-900 dark:text-white"
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeAssignLeadModal}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
        {value}
      </p>
    </div>
  );
}
