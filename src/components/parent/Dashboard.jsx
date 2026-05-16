import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getMyChildren,
  getChildSchedule,
  requestReschedule,
  downloadCertificate,
} from '../../services/parentService';
import api from '../../services/api';
import VaccineTable from './VaccineTable';
import ChildProfile from './ChildProfile';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [certStatus, setCertStatus] = useState(null);
  const [vaccinesList, setVaccinesList] = useState([]);

  useEffect(() => {
    loadChildren();
    loadVaccines();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      if (selectedChild.status === 'approved') {
        loadSchedule(selectedChild.id);
        checkCertificateStatus(selectedChild.id);
      }
    }
  }, [selectedChild]);

  const loadVaccines = async () => {
    try {
      const res = await api.get('/vaccines');
      setVaccinesList(res.data?.data || []);
    } catch (err) { /* ignore */ }
  };

  const calculateNextFromDOB = (dob) => {
    if (!vaccinesList.length || !dob) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = vaccinesList
      .map(v => {
        const dueDate = new Date(dob);
        dueDate.setDate(dueDate.getDate() + parseInt(v.days_from_birth));
        return { name: v.name, dueDate: dueDate.toISOString().split('T')[0], dateObj: dueDate };
      })
      .filter(v => v.dateObj >= today)
      .sort((a, b) => a.dateObj - b.dateObj);
    if (upcoming.length === 0) return null;
    const firstDate = upcoming[0].dueDate;
    const vaccinesOnDate = upcoming.filter(v => v.dueDate === firstDate).map(v => v.name);
    return { date: firstDate, vaccines: vaccinesOnDate };
  };

  const loadChildren = async () => {
    setLoading(true);
    setError('');
    try {
      const userId = user?.id;
      if (!userId) return;
      const res = await getMyChildren(userId);
      const childrenArray = res.data?.data || res.data || [];
      let childrenList = Array.isArray(childrenArray) ? childrenArray : [];
      childrenList = childrenList.map(child => ({
        ...child,
        assigned_nurse: child.nurse_id
          ? { id: child.nurse_id, name: child.nurse_name || 'Unknown', phone: child.nurse_phone || '', email: child.nurse_email || '' }
          : null,
      }));
      setChildren(childrenList);
      if (childrenList.length > 0) setSelectedChild(childrenList[0]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load children');
    } finally { setLoading(false); }
  };

  const loadSchedule = async (childId) => {
    try {
      const res = await getChildSchedule(childId, user.id);
      setSchedule(res.data.data.schedule || []);
    } catch (err) { setError(err.response?.data?.message || 'Failed to load vaccination schedule'); }
  };

  const checkCertificateStatus = async (childId) => {
    try {
      const res = await api.get(`/certificates/child/${childId}`);
      const data = res.data?.data || res.data;
      setCertStatus(data);
    } catch { setCertStatus(null); }
  };

  const handleDownloadCertificate = async () => {
    if (!selectedChild) return;
    setError(''); setSuccessMessage('');
    try {
      const res = await downloadCertificate(selectedChild.id);
      const blob = new Blob([res.data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${selectedChild.unique_child_id}.html`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
      setSuccessMessage('Certificate downloaded successfully.');
    } catch (err) { setError(err.response?.data?.message || 'Certificate not available yet.'); }
  };

  const handleReschedule = async (appointmentId, newDate) => {
    setError(''); setSuccessMessage('');
    try {
      await requestReschedule(appointmentId, newDate);
      setSuccessMessage('Reschedule request submitted.');
      if (selectedChild) loadSchedule(selectedChild.id);
    } catch (err) { setError(err.response?.data?.message || 'Failed to request reschedule'); }
  };

  if (loading && children.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh', background: 'linear-gradient(180deg, #f0f4f8 0%, #ffffff 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} />
          <p className="text-muted fw-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="parent-dashboard" style={{ background: 'linear-gradient(180deg, #f0f4f8 0%, #ffffff 50%)', minHeight: '100vh', paddingTop: '20px', paddingBottom: '40px' }}>
      <div className="container">
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 animate__animated animate__fadeIn">
          <div>
            <h2 className="fw-bold mb-0" style={{ color: '#1f2a3e' }}>👨‍👩‍👧 Parent Dashboard</h2>
            <p className="text-muted small mb-0">Manage your children's vaccinations</p>
          </div>
          <div className="text-end">
            <span className="badge bg-light text-primary px-3 py-2 rounded-pill shadow-sm">
              👋 Welcome, <strong>{user?.name}</strong>
            </span>
          </div>
        </div>

        {error && <div className="alert alert-danger alert-dismissible fade show rounded-3 shadow-sm">{error}<button className="btn-close" onClick={()=>setError('')}></button></div>}
        {successMessage && <div className="alert alert-success alert-dismissible fade show rounded-3 shadow-sm">{successMessage}<button className="btn-close" onClick={()=>setSuccessMessage('')}></button></div>}

        {children.length === 0 ? (
          <div className="card border-0 shadow-lg text-center" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            <div className="card-body py-5" style={{ background: 'linear-gradient(135deg, #d8e6fb 0%, #ffffff 100%)' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>👶</div>
              <h4 className="fw-bold" style={{ color: '#1f2a3e' }}>No Children Registered Yet</h4>
              <p className="text-muted mb-4">Click the button below to register your first child.</p>
              <Link to="/parent/add-child" className="btn btn-primary btn-lg px-4 fw-bold shadow-sm">
                ✨ Register a Child
              </Link>
            </div>
          </div>
        ) : (
          <div className="row">
            {/* Sidebar - Children List */}
            <div className="col-md-4 mb-4">
              <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div className="card-header text-white fw-bold" style={{ background: 'linear-gradient(135deg, #1e5fbb 0%, #13458a 100%)' }}>
                  <h5 className="mb-0">👶 My Children</h5>
                </div>
                <div className="list-group list-group-flush">
                  {children.map(child => (
                    <button
                      key={child.id}
                      className={`list-group-item list-group-item-action border-0 py-3 ${selectedChild?.id === child.id ? 'active' : ''}`}
                      style={selectedChild?.id === child.id ? { background: '#d8e6fb', color: '#1e5fbb', borderLeft: '4px solid #1e5fbb' } : { borderLeft: '4px solid transparent' }}
                      onClick={() => setSelectedChild(child)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong style={{ fontSize: '1rem' }}>{child.name}</strong>
                          <br />
                          <small style={{ opacity: '0.7' }}>ID: {child.unique_child_id}</small>
                        </div>
                        <span className={`badge rounded-pill ${child.status === 'pending' ? 'bg-warning text-dark' : 'bg-success'}`}>
                          {child.status === 'pending' ? '⏳ Pending' : '✅ Approved'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="card-footer bg-white border-0 p-3">
                  <Link to="/parent/add-child" className="btn btn-primary btn-sm w-100 fw-bold">
                    + Register New Child
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="col-md-8">
              {/* Pending Child */}
              {selectedChild && selectedChild.status === 'pending' && (
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                  <div className="card-header text-white" style={{ background: 'linear-gradient(135deg, #d48a0b 0%, #b8730a 100%)' }}>
                    <h5 className="mb-0">⏳ {selectedChild.name} — Pending Approval</h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="row mb-3">
                      <div className="col-6"><p className="mb-1 small text-muted">Unique ID</p><p className="fw-semibold">{selectedChild.unique_child_id}</p></div>
                      <div className="col-6"><p className="mb-1 small text-muted">Date of Birth</p><p className="fw-semibold">{selectedChild.dob}</p></div>
                      <div className="col-6"><p className="mb-1 small text-muted">Gender</p><p className="fw-semibold">{selectedChild.gender}</p></div>
                      <div className="col-6"><p className="mb-1 small text-muted">Blood Type</p><p className="fw-semibold">{selectedChild.blood_type || 'N/A'}</p></div>
                    </div>
                    <span className="badge bg-warning text-dark px-3 py-2 rounded-pill mb-3">⏳ Waiting for Nurse Approval</span>

                    {(() => {
                      const nextInfo = calculateNextFromDOB(selectedChild.dob);
                      if (nextInfo) {
                        return (
                          <div className="alert border-0 rounded-3 p-3 mt-3" style={{ background: '#d1f0f9', color: '#0d7c9e' }}>
                            <strong>📅 Estimated Next Appointment:</strong> {nextInfo.date}<br />
                            <strong>💉 Expected Vaccines:</strong> {nextInfo.vaccines.join(', ')}
                            <br /><small className="mt-2 d-block opacity-75">⚠️ This is an estimate. Exact date confirmed after nurse approval.</small>
                          </div>
                        );
                      }
                      return <div className="alert alert-secondary rounded-3 mt-3">No upcoming vaccines calculated.</div>;
                    })()}

                    <div className="alert border rounded-3 p-3 mt-3" style={{ background: '#f0f4f8' }}>
                      <strong>📋 Registration Status:</strong> Your child's registration has been submitted. 
                      Please wait for a nurse to verify and approve it.
                    </div>
                  </div>
                </div>
              )}

              {/* Approved Child */}
              {selectedChild && selectedChild.status === 'approved' && (
                <>
                  <ChildProfile child={selectedChild} />

                  {selectedChild.assigned_nurse && (
                    <div className="alert border-0 rounded-3 p-3 d-flex justify-content-between align-items-center mt-3 shadow-sm" style={{ background: '#d8e6fb', color: '#1e5fbb' }}>
                      <div>
                        <strong>👩‍⚕️ Assigned Nurse:</strong> {selectedChild.assigned_nurse.name}
                        <br /><small>📞 {selectedChild.assigned_nurse.phone} | ✉️ {selectedChild.assigned_nurse.email}</small>
                      </div>
                    </div>
                  )}

                  <div className="card border-0 shadow-sm mt-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    <div className="card-header text-white d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #1e5fbb 0%, #13458a 100%)' }}>
                      <h5 className="mb-0">💉 Vaccination Roadmap</h5>
                      <span className="d-flex align-items-center gap-2">
                        {certStatus ? (
                          certStatus.is_fully_approved ? (
                            <>
                              <span className="text-white small">✅ Approved</span>
                              <button className="btn btn-light btn-sm fw-bold" onClick={handleDownloadCertificate}>📄 Download</button>
                            </>
                          ) : (
                            <span className="text-white small">⏳ Pending {!certStatus.is_approved_by_nurse ? 'nurse' : 'admin'} approval</span>
                          )
                        ) : (
                          <button className="btn btn-warning btn-sm fw-bold" onClick={async () => {
                            try {
                              await api.post('/certificates/generate', { child_id: selectedChild.id });
                              setSuccessMessage('Certificate requested. Waiting for nurse & admin approval.');
                              checkCertificateStatus(selectedChild.id);
                            } catch (err) { setError(err.response?.data?.message || 'Could not request certificate'); }
                          }}>📄 Request Certificate</button>
                        )}
                      </span>
                    </div>
                    <div className="card-body p-3">
                      <VaccineTable schedule={schedule} onReschedule={handleReschedule} />
                    </div>
                  </div>

                  {schedule.filter(s => s.status === 'pending' && new Date(s.scheduled_date) >= new Date()).length > 0 && (
                    <div className="alert border-0 rounded-3 p-3 mt-3 shadow-sm" style={{ background: '#fef2d0', color: '#d48a0b' }}>
                      <strong>📅 Next Appointment:</strong> {schedule.find(s => s.status === 'pending' && new Date(s.scheduled_date) >= new Date())?.scheduled_date}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;