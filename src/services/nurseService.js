import api from './api';

// ==================== ASSIGNED CHILDREN ====================
export const getMyAssignedChildren = (nurseId) => {
  return api.get(`/nurse/my-children?nurse_id=${nurseId}`);
};

// ==================== PENDING CHILDREN (VERIFICATION) ====================
export const getPendingChildren = () => api.get('/nurse/pending-children');
export const approveChild = (childId, nurseId) =>
  api.post(`/nurse/approve-child/${childId}`, { nurse_id: nurseId });
export const rejectChild = (childId) =>
  api.post(`/nurse/reject-child/${childId}`);

// ==================== PARENT VERIFICATION ====================
export const getPendingParents = () => api.get('/nurse/pending-parents');
export const approveParent = (parentId) => api.post(`/nurse/approve-parent/${parentId}`);
export const rejectParent = (parentId) => api.post(`/nurse/reject-parent/${parentId}`);

// ==================== WALK‑IN REGISTRATION ====================
export const walkinRegistration = (data) => api.post('/nurse/walkin', data);

// ==================== RECORD VACCINE ====================
export const recordVaccine = (appointmentId, batchNumber = '', notes = '') =>
  api.post('/nurse/record-vaccine', {
    appointment_id: appointmentId,
    batch_number: batchNumber,
    notes,
  });

// ==================== UPCOMING APPOINTMENTS ====================
export const getUpcomingAppointments = (nurseId) => {
  return api.get(`/nurse/upcoming-appointments?nurse_id=${nurseId}`);
};
export const approveReschedule = (appointmentId, approved) =>
  api.post(`/nurse/appointment/${appointmentId}/approve-reschedule`, { approved });
// ==================== SEARCH & FILTER ====================
export const searchChildren = (query, nurseId) =>
  api.get(`/nurse/search?q=${encodeURIComponent(query)}&nurse_id=${nurseId}`);
export const filterByVaccine = (vaccineId, nurseId) =>
  api.get(`/nurse/filter-by-vaccine?vaccine_id=${vaccineId}&nurse_id=${nurseId}`);

// ==================== CHILD NOTES ====================
export const addChildNotes = (childId, notes) =>
  api.post(`/nurse/child/${childId}/notes`, { notes });

// ==================== REPORTS ====================
export const generateReport = (type, periodStart, periodEnd, nurseId, challenges) =>
  api.post('/nurse/generate-report', {
    type,
    period_start: periodStart,
    period_end: periodEnd,
    nurse_id: nurseId,
    challenges,
  });
export const getReports = () => api.get('/nurse/reports');
export const getNurseReportsHistory = (nurseId) =>
  api.get(`/nurse/reports?nurse_id=${nurseId}`);
// ==================== RESCHEDULE APPROVAL ====================
// export const approveReschedule = (appointmentId, approved) =>
//   api.post(`/nurse/appointment/${appointmentId}/approve-reschedule`, { approved });

// ==================== CERTIFICATE APPROVAL (NURSE) ====================
export const getPendingCertificatesNurse = (nurseId) =>
  api.get(`/nurse/pending-certificates?nurse_id=${nurseId}`);
export const approveCertificateNurse = (certificateId) =>
  api.post(`/nurse/approve-certificate/${certificateId}`);

// ==================== ADDITIONAL (used by other components) ====================
export const getChildAppointments = (childId) =>
  api.get(`/appointments/child/${childId}`);
export const getAvailableBatches = (vaccineId) =>
  api.get(`/admin/inventory?vaccine_id=${vaccineId}`);
export const updateAppointmentStatus = (appointmentId, data) =>
  api.put(`/appointments/${appointmentId}/status`, data);