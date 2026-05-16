import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getPendingParents,
  approveParent,
  rejectParent,
  getMyAssignedChildren,
  walkinRegistration,
  recordVaccine,
  getUpcomingAppointments,
  searchChildren,
  filterByVaccine,
  addChildNotes,
  generateReport,
  approveReschedule,
  approveCertificateNurse,
  getPendingChildren,
  approveChild,
  rejectChild,
  getChildAppointments,
} from '../../services/nurseService';
import api from '../../services/api';

const NurseDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('assigned');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [assignedChildren, setAssignedChildren] = useState([]);
  const [pendingParents, setPendingParents] = useState([]);
  const [pendingChildren, setPendingChildren] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [filteredAppts, setFilteredAppts] = useState([]);
  const [walkinForm, setWalkinForm] = useState({
    parent_id: 0,
    parent_name: '',
    parent_phone: '',
    child_name: '',
    dob: '',
    gender: 'Male',
    blood_type: '',
    allergies: '',
    birth_weight: '',
    delivery_type: 'Normal',
    birth_place: '',
    notes: '',
  });
  const [pendingReschedules, setPendingReschedules] = useState([]);
  const [reportType, setReportType] = useState('weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const [vaccinesList, setVaccinesList] = useState([]);
  const [expandedChild, setExpandedChild] = useState(null);
  const [appointmentsCache, setAppointmentsCache] = useState({});
  const [filterVaccineId, setFilterVaccineId] = useState('');
  const [pendingCerts, setPendingCerts] = useState([]);
  const [reportsHistory, setReportsHistory] = useState([]);
  const [challenges, setChallenges] = useState('');

  const commonChallenges = [
    'Vaccine shortage / stock‑out',
    'High number of missed appointments',
    'Cold chain equipment failure',
    'Adverse events (AEFI) observed',
    'Staff shortage / high workload',
    'Difficulties reaching defaulters',
    'Incomplete vaccination records',
    'Community resistance / misinformation',
    'Other (describe below)',
  ];

  useEffect(() => {
    if (activeTab === 'assigned') loadAssigned();
    if (activeTab === 'verify') loadPendingParents();
    if (activeTab === 'upcoming') loadUpcoming();
    if (activeTab === 'pending-children') loadPendingChildren();
    if (activeTab === 'certificates') loadPendingCerts();
    if (activeTab === 'reports') loadNurseReports();
    if (activeTab === 'reschedules') loadPendingReschedules();
  }, [activeTab]);

  useEffect(() => {
    api.get('/vaccines')
      .then(res => setVaccinesList(res.data?.data || []))
      .catch(() => {});
  }, []);

  const loadPendingReschedules = async () => {
    try {
      const res = await api.get(`/appointments/pending-reschedules?nurse_id=${user?.id}`);
      setPendingReschedules(res.data?.data || []);
    } catch (err) { /* ignore */ }
  };

  const loadAssigned = async () => {
    setLoading(true);
    try {
      const nurseId = user?.id;
      const res = await getMyAssignedChildren(nurseId);
      setAssignedChildren(res.data?.data || []);
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to load assigned children' });
    } finally {
      setLoading(false);
    }
  };

  const loadPendingParents = async () => {
    try {
      const res = await getPendingParents();
      setPendingParents(res.data?.data || []);
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to load pending parents' });
    }
  };

  const loadPendingChildren = async () => {
    try {
      const res = await getPendingChildren();
      setPendingChildren(res.data?.data || []);
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to load pending children' });
    }
  };

  const loadUpcoming = async () => {
    try {
      const res = await getUpcomingAppointments(user?.id);
      setUpcoming(res.data?.data || []);
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to load upcoming appointments' });
    }
  };

  const loadPendingCerts = async () => {
    try {
      const res = await api.get(`/nurse/pending-certificates?nurse_id=${user?.id}`);
      setPendingCerts(res.data?.data || []);
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to load certificates' });
    }
  };

  const loadNurseReports = async () => {
    try {
      const res = await api.get(`/nurse/reports?nurse_id=${user?.id}`);
      setReportsHistory(res.data?.data || []);
    } catch (err) {}
  };

  const handleApproveChild = async (childId) => {
    try {
      await approveChild(childId, user?.id);
      setMsg({ type: 'success', text: 'Child approved and assigned to you' });
      loadPendingChildren();
      loadAssigned();
    } catch (err) {
      setMsg({ type: 'error', text: 'Approval failed' });
    }
  };

  const handleRejectChild = async (childId) => {
    try {
      await rejectChild(childId);
      setMsg({ type: 'success', text: 'Child rejected' });
      loadPendingChildren();
    } catch (err) {
      setMsg({ type: 'error', text: 'Rejection failed' });
    }
  };

  const handleVaccine = async (apptId, batch, notes) => {
    try {
      await recordVaccine(apptId, batch, notes);
      setMsg({ type: 'success', text: 'Vaccine recorded – stock decreased' });
      loadAssigned();
      loadUpcoming();
      if (expandedChild) {
        getChildAppointments(expandedChild).then(res => {
          setAppointmentsCache(prev => ({
            ...prev,
            [expandedChild]: res.data?.data || [],
          }));
        }).catch(() => {});
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to record vaccine' });
    }
  };

  const handleWalkinSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...walkinForm, nurse_id: user?.id };
      await walkinRegistration(payload);
      setMsg({ type: 'success', text: 'Child registered, approved and assigned to you' });
      setWalkinForm({
        parent_id: 0,
        parent_name: '',
        parent_phone: '',
        child_name: '',
        dob: '',
        gender: 'Male',
        blood_type: '',
        allergies: '',
        birth_weight: '',
        delivery_type: 'Normal',
        birth_place: '',
        notes: '',
      });
      loadAssigned();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Registration failed' });
    }
  };

  const handleApproveParent = async (id) => {
    await approveParent(id);
    loadPendingParents();
  };

  const handleRejectParent = async (id) => {
    await rejectParent(id);
    loadPendingParents();
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const res = await searchChildren(searchQuery, user?.id);
      setSearchResults(res.data?.data || []);
    } catch (err) {
      setMsg({ type: 'error', text: 'Search failed' });
    }
  };

  const handleFilterVaccine = async () => {
    if (!filterVaccineId) return;
    try {
      const res = await filterByVaccine(filterVaccineId, user?.id);
      setFilteredAppts(res.data?.data || []);
    } catch (err) {
      setMsg({ type: 'error', text: 'Filter failed' });
    }
  };

  const handleGenerateReport = async () => {
    let start, end;
    const today = new Date();
    if (reportType === 'weekly') {
      const day = today.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const monday = new Date(today);
      monday.setDate(today.getDate() + diffToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      start = monday.toISOString().split('T')[0];
      end = sunday.toISOString().split('T')[0];
    } else {
      start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    }
    try {
      await generateReport(reportType, start, end, user?.id, challenges);
      setMsg({ type: 'success', text: 'Detailed report sent to admin' });
      setChallenges('');
      loadNurseReports();
    } catch (err) {
      setMsg({ type: 'error', text: 'Report failed' });
    }
  };

  const handleApproveCertificate = async (certId) => {
    try {
      await approveCertificateNurse(certId);
      setMsg({ type: 'success', text: 'Certificate approved' });
      loadPendingCerts();
    } catch (err) {
      setMsg({ type: 'error', text: 'Approval failed' });
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh', background: 'linear-gradient(180deg, #f0f4f8 0%, #ffffff 100%)' }}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} />
        <p className="text-muted fw-semibold">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div style={{ background: 'linear-gradient(180deg, #f0f4f8 0%, #ffffff 50%)', minHeight: '100vh', paddingTop: '20px', paddingBottom: '40px' }}>
      <div className="container-fluid" style={{ maxWidth: '1400px' }}>
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-0" style={{ color: '#1f2a3e' }}>👩‍⚕️ Nurse Dashboard</h2>
            <p className="text-muted small mb-0">Manage assigned children and vaccinations</p>
          </div>
          <span className="badge bg-light text-primary px-3 py-2 rounded-pill shadow-sm">
            👋 Welcome, <strong>{user?.name}</strong>
          </span>
        </div>

        {msg.text && (
          <div className={`alert alert-${msg.type === 'error' ? 'danger' : 'success'} alert-dismissible fade show rounded-3 shadow-sm`}>
            {msg.text}
            <button className="btn-close" onClick={() => setMsg({ type: '', text: '' })} />
          </div>
        )}

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4 border-0">
          <li className="nav-item"><button className={`nav-link border-0 rounded-pill px-3 py-2 me-2 fw-semibold small ${activeTab==='assigned'?'bg-primary text-white':'bg-white text-secondary'}`} onClick={()=>setActiveTab('assigned')}>👶 My Assigned Children</button></li>
          <li className="nav-item"><button className={`nav-link border-0 rounded-pill px-3 py-2 me-2 fw-semibold small ${activeTab==='pending-children'?'bg-primary text-white':'bg-white text-secondary'}`} onClick={()=>setActiveTab('pending-children')}>⏳ Pending ({pendingChildren.length})</button></li>
          <li className="nav-item"><button className={`nav-link border-0 rounded-pill px-3 py-2 me-2 fw-semibold small ${activeTab==='verify'?'bg-primary text-white':'bg-white text-secondary'}`} onClick={()=>setActiveTab('verify')}>✅ Verify Parents ({pendingParents.length})</button></li>
          <li className="nav-item"><button className={`nav-link border-0 rounded-pill px-3 py-2 me-2 fw-semibold small ${activeTab==='walkin'?'bg-primary text-white':'bg-white text-secondary'}`} onClick={()=>setActiveTab('walkin')}>🚶 Walk‑in</button></li>
          <li className="nav-item"><button className={`nav-link border-0 rounded-pill px-3 py-2 me-2 fw-semibold small ${activeTab==='upcoming'?'bg-primary text-white':'bg-white text-secondary'}`} onClick={()=>setActiveTab('upcoming')}>📅 Upcoming</button></li>
          <li className="nav-item"><button className={`nav-link border-0 rounded-pill px-3 py-2 me-2 fw-semibold small ${activeTab==='search'?'bg-primary text-white':'bg-white text-secondary'}`} onClick={()=>setActiveTab('search')}>🔍 Search</button></li>
          <li className="nav-item"><button className={`nav-link border-0 rounded-pill px-3 py-2 me-2 fw-semibold small ${activeTab==='filter-vaccine'?'bg-primary text-white':'bg-white text-secondary'}`} onClick={()=>setActiveTab('filter-vaccine')}>💉 Filter</button></li>
          <li className="nav-item"><button className={`nav-link border-0 rounded-pill px-3 py-2 me-2 fw-semibold small ${activeTab==='reschedules'?'bg-primary text-white':'bg-white text-secondary'}`} onClick={()=>setActiveTab('reschedules')}>🔄 Reschedule ({pendingReschedules.length})</button></li>
          <li className="nav-item"><button className={`nav-link border-0 rounded-pill px-3 py-2 me-2 fw-semibold small ${activeTab==='reports'?'bg-primary text-white':'bg-white text-secondary'}`} onClick={()=>setActiveTab('reports')}>📊 Reports</button></li>
          <li className="nav-item"><button className={`nav-link border-0 rounded-pill px-3 py-2 fw-semibold small ${activeTab==='certificates'?'bg-primary text-white':'bg-white text-secondary'}`} onClick={()=>setActiveTab('certificates')}>📜 Certs ({pendingCerts.length})</button></li>
        </ul>

        {/* ====== TAB CONTENT ====== */}
        
        {/* Assigned Children */}
        {activeTab === 'assigned' && (
          <div>
            {assignedChildren.length === 0 ? (
              <div className="alert border-0 rounded-3 p-4 text-center shadow-sm" style={{background:'#d8e6fb',color:'#1e5fbb'}}>No children assigned to you yet.</div>
            ) : (
              assignedChildren.map(child => (
                <div key={child.id} className="card border-0 shadow-sm mb-3" style={{borderRadius:'16px',overflow:'hidden',borderLeft:child.missed_count>0?'4px solid #c0392b':'4px solid #178a42'}}>
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">{child.name} <small className="text-muted">({child.unique_child_id})</small></h5>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <p className="mb-1 small"><strong>Parent:</strong> {child.parent_name}</p>
                        <p className="mb-1 small"><strong>Phone:</strong> {child.parent_phone}</p>
                        <p className="mb-1 small"><strong>DOB:</strong> {child.dob} | <strong>Gender:</strong> {child.gender}</p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1 small"><strong>Blood Type:</strong> {child.blood_type || 'N/A'}</p>
                        <p className="mb-1 small"><strong>Allergies:</strong> {child.allergies || 'None'}</p>
                        <div className="d-flex align-items-center mb-1">
                          <span className="me-2 small"><strong>Progress:</strong></span>
                          <div className="progress flex-grow-1" style={{ height: '10px', borderRadius: '10px' }}>
                            <div className="progress-bar bg-success rounded-pill" style={{ width: `${child.vaccine_progress || 0}%` }}>{child.vaccine_progress || 0}%</div>
                          </div>
                        </div>
                        <p className="mb-1 small"><strong>Missed Vaccines:</strong> <span className="badge bg-danger rounded-pill">{(appointmentsCache[child.id] || []).filter(a => a.status === 'missed').length}</span></p>
                      </div>
                    </div>
                    {child.next_appointment_date ? (
                      <div className="alert border-0 rounded-3 p-2 mb-2 small" style={{background:'#d8e6fb',color:'#1e5fbb'}}>
                        <strong>📅 Next:</strong> {child.next_appointment_date} — <strong>Vaccines:</strong> {child.next_vaccines?.join(', ') || 'None'}
                      </div>
                    ) : (
                      <div className="alert alert-secondary rounded-3 p-2 mb-2 small">No upcoming appointments.</div>
                    )}
                    <button className="btn btn-outline-primary btn-sm rounded-pill mb-2" onClick={() => {
                      if (expandedChild === child.id) { setExpandedChild(null); }
                      else {
                        setExpandedChild(child.id);
                        if (!appointmentsCache[child.id]) {
                          getChildAppointments(child.id).then(res => {
                            setAppointmentsCache(prev => ({ ...prev, [child.id]: res.data?.data || [] }));
                          }).catch(() => {});
                        }
                      }
                    }}>
                      {expandedChild === child.id ? 'Hide Vaccinations' : 'Show All Vaccinations'}
                    </button>
                    {expandedChild === child.id && (
                      <div className="table-responsive mt-2">
                        <table className="table table-sm table-bordered rounded-3 overflow-hidden">
                          <thead className="table-light"><tr><th>Vaccine</th><th>Due Date</th><th>Status</th><th>Batch No.</th><th>Notes</th><th>Action</th></tr></thead>
                          <tbody>
                            {(appointmentsCache[child.id] || []).map(appt => (
                              <tr key={appt.id}>
                                <td>{appt.vaccine_name}</td>
                                <td>{appt.scheduled_date}</td>
                                <td><span className={`badge rounded-pill ${appt.status==='completed'?'bg-success':appt.status==='missed'?'bg-danger':'bg-warning'}`}>{appt.status}</span></td>
                                <td>{appt.status === 'pending' ? <input type="text" className="form-control form-control-sm" id={`batch-${appt.id}`} style={{ width:'80px' }} /> : (appt.batch_number || '—')}</td>
                                <td>{appt.status === 'pending' ? <input type="text" className="form-control form-control-sm" id={`notes-${appt.id}`} /> : (appt.notes || '—')}</td>
                                <td>{appt.status === 'pending' && <button className="btn btn-success btn-sm rounded-pill" onClick={() => { const batch = document.getElementById(`batch-${appt.id}`).value; const notes = document.getElementById(`notes-${appt.id}`).value; handleVaccine(appt.id, batch, notes); }}>Record</button>}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <div className="row mt-2">
                      <div className="col-md-9"><textarea className="form-control form-control-sm rounded-3" rows="1" placeholder="Permanent notes…" id={`special-notes-${child.id}`} defaultValue={child.notes || ''}></textarea></div>
                      <div className="col-md-3"><button className="btn btn-outline-secondary btn-sm w-100 rounded-pill" onClick={async () => { const notes = document.getElementById(`special-notes-${child.id}`).value; try { await addChildNotes(child.id, notes); setMsg({ type: 'success', text: 'Notes saved' }); } catch { setMsg({ type: 'error', text: 'Save failed' }); } }}>Save Notes</button></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pending Children */}
        {activeTab === 'pending-children' && (
          <div>
            <h5 className="fw-bold mb-3">Pending Child Registrations</h5>
            {pendingChildren.length === 0 ? (
              <div className="alert border-0 rounded-3 p-4 text-center shadow-sm" style={{background:'#fef2d0',color:'#d48a0b'}}>No pending children to verify.</div>
            ) : (
              pendingChildren.map(child => (
                <div key={child.id} className="card border-0 shadow-sm mb-3" style={{borderRadius:'16px',overflow:'hidden',borderLeft:'4px solid #d48a0b'}}>
                  <div className="card-body p-4">
                    <h5 className="fw-bold">{child.name} <small className="text-muted">({child.unique_child_id})</small><span className="badge bg-warning text-dark ms-2 rounded-pill">Awaiting Approval</span></h5>
                    <div className="row mb-2">
                      <div className="col-md-6"><p className="mb-1 small"><strong>Parent:</strong> {child.parent_name || 'N/A'}</p><p className="mb-1 small"><strong>Phone:</strong> {child.parent_phone || 'N/A'}</p><p className="mb-1 small"><strong>DOB:</strong> {child.dob}</p></div>
                      <div className="col-md-6"><p className="mb-1 small"><strong>Gender:</strong> {child.gender}</p><p className="mb-1 small"><strong>Blood Type:</strong> {child.blood_type || 'N/A'}</p><p className="mb-1 small"><strong>Allergies:</strong> {child.allergies || 'None'}</p></div>
                    </div>
                    <p className="mb-2 small"><strong>Historical Vaccines:</strong> {child.pending_historical_vaccines ? child.pending_historical_vaccines.split(',').join(', ') : 'None reported'}</p>
                    <div className="d-flex gap-2 mt-3">
                      <button className="btn btn-success btn-sm rounded-pill px-3" onClick={() => handleApproveChild(child.id)}>✅ Approve</button>
                      <button className="btn btn-danger btn-sm rounded-pill px-3" onClick={() => handleRejectChild(child.id)}>❌ Reject</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Verify Parents */}
        {activeTab === 'verify' && (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white border-bottom"><h5 className="fw-bold mb-0">Verify Parent Registrations</h5></div>
            <div className="card-body p-3">
              {pendingParents.length === 0 ? (
                <div className="alert border-0 rounded-3" style={{background:'#d8e6fb',color:'#1e5fbb'}}>No parents to verify.</div>
              ) : (
                <table className="table table-hover align-middle">
                  <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Actions</th></tr></thead>
                  <tbody>
                    {pendingParents.map(p => (
                      <tr key={p.id}>
                        <td className="fw-semibold">{p.name}</td>
                        <td>{p.phone}</td>
                        <td>{p.email}</td>
                        <td>
                          <button className="btn btn-success btn-sm rounded-pill me-1" onClick={() => handleApproveParent(p.id)}>Approve</button>
                          <button className="btn btn-danger btn-sm rounded-pill" onClick={() => handleRejectParent(p.id)}>Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Walk‑in Registration */}
        {activeTab === 'walkin' && (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header text-white fw-bold" style={{background:'linear-gradient(135deg,#1e5fbb,#13458a)'}}><h5 className="mb-0">Walk‑in Registration (auto‑approved)</h5></div>
            <div className="card-body p-4">
              <form onSubmit={handleWalkinSubmit}>
                <div className="row">
                  <div className="col-md-4 mb-2"><label className="form-label small fw-semibold">Parent Name *</label><input type="text" className="form-control rounded-3" placeholder="Full name" value={walkinForm.parent_name} onChange={e => setWalkinForm({...walkinForm, parent_name: e.target.value})} required /></div>
                  <div className="col-md-4 mb-2"><label className="form-label small fw-semibold">Parent Phone *</label><input type="text" className="form-control rounded-3" placeholder="0911XXXXXX" value={walkinForm.parent_phone} onChange={e => setWalkinForm({...walkinForm, parent_phone: e.target.value})} required /></div>
                  <div className="col-md-4 mb-2"><label className="form-label small fw-semibold">Child Name *</label><input type="text" className="form-control rounded-3" placeholder="Child's full name" value={walkinForm.child_name} onChange={e => setWalkinForm({...walkinForm, child_name: e.target.value})} required /></div>
                </div>
                <div className="row">
                  <div className="col-md-3 mb-2"><label className="form-label small fw-semibold">Date of Birth *</label><input type="date" className="form-control rounded-3" value={walkinForm.dob} onChange={e => setWalkinForm({...walkinForm, dob: e.target.value})} required /></div>
                  <div className="col-md-3 mb-2"><label className="form-label small fw-semibold">Gender</label><select className="form-select rounded-3" value={walkinForm.gender} onChange={e => setWalkinForm({...walkinForm, gender: e.target.value})}><option>Male</option><option>Female</option></select></div>
                  <div className="col-md-3 mb-2"><label className="form-label small fw-semibold">Blood Type</label><select className="form-select rounded-3" value={walkinForm.blood_type} onChange={e => setWalkinForm({...walkinForm, blood_type: e.target.value})}><option value="">Select</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></div>
                  <div className="col-md-3 mb-2"><label className="form-label small fw-semibold">Birth Weight (kg)</label><input type="number" step="0.01" className="form-control rounded-3" value={walkinForm.birth_weight} onChange={e => setWalkinForm({...walkinForm, birth_weight: e.target.value})} /></div>
                </div>
                <div className="row">
                  <div className="col-md-4 mb-2"><label className="form-label small fw-semibold">Delivery Type</label><select className="form-select rounded-3" value={walkinForm.delivery_type} onChange={e => setWalkinForm({...walkinForm, delivery_type: e.target.value})}><option>Normal</option><option>C‑Section</option></select></div>
                  <div className="col-md-4 mb-2"><label className="form-label small fw-semibold">Birth Place</label><input type="text" className="form-control rounded-3" placeholder="Hospital or Home" value={walkinForm.birth_place} onChange={e => setWalkinForm({...walkinForm, birth_place: e.target.value})} /></div>
                  <div className="col-md-4 mb-2"><label className="form-label small fw-semibold">Allergies</label><input type="text" className="form-control rounded-3" placeholder="e.g., Eggs, Penicillin" value={walkinForm.allergies} onChange={e => setWalkinForm({...walkinForm, allergies: e.target.value})} /></div>
                </div>
                <div className="mb-3"><label className="form-label small fw-semibold">Special Notes</label><textarea className="form-control rounded-3" rows="2" placeholder="Additional notes…" value={walkinForm.notes} onChange={e => setWalkinForm({...walkinForm, notes: e.target.value})}></textarea></div>
                <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold">Register & Approve Child</button>
              </form>
            </div>
          </div>
        )}

        {/* Upcoming Appointments */}
        {activeTab === 'upcoming' && (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white border-bottom"><h5 className="fw-bold mb-0">Next 7 Days</h5></div>
            <div className="card-body p-3">
              {upcoming.length === 0 ? (
                <div className="alert border-0 rounded-3" style={{background:'#d8e6fb',color:'#1e5fbb'}}>No upcoming appointments.</div>
              ) : (
                <table className="table table-hover align-middle">
                  <thead><tr><th>Child</th><th>Vaccine</th><th>Scheduled Date</th><th>Parent Contact</th><th>Action</th></tr></thead>
                  <tbody>
                    {upcoming.map(a => (
                      <tr key={a.id}>
                        <td className="fw-semibold">{a.child_name}</td>
                        <td>{a.vaccine_name}</td>
                        <td>{a.scheduled_date}</td>
                        <td>{a.parent_phone}</td>
                        <td><button className="btn btn-success btn-sm rounded-pill" onClick={() => handleVaccine(a.id, prompt('Batch number'), '')}>Record</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Search Child */}
      {/* Search Child */}
{activeTab === 'search' && (
  <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
    <div className="card-header bg-white border-bottom"><h5 className="fw-bold mb-0">🔍 Search Child</h5></div>
    <div className="card-body p-4">
      <div className="input-group mb-4">
        <input 
          type="text" 
          className="form-control rounded-3" 
          placeholder="Search by unique ID or name" 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
        />
        <button className="btn btn-primary rounded-pill px-4" onClick={handleSearch}>Search</button>
      </div>
      
      {searchResults.length === 0 ? (
        <div className="alert border-0 rounded-3 text-center py-4" style={{background:'#d8e6fb',color:'#1e5fbb'}}>
          No matching children in your care.
        </div>
      ) : (
        searchResults.map(child => (
          <div key={child.id} className="card border-0 shadow-sm mb-3 rounded-4 overflow-hidden" style={{borderLeft:'4px solid #1e5fbb'}}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">
                {child.name} <small className="text-muted">({child.unique_child_id})</small>
                <span className="badge bg-success ms-2 rounded-pill">Assigned to you</span>
              </h5>
              <div className="row mb-3">
                <div className="col-md-6">
                  <p className="mb-1 small"><strong>Parent:</strong> {child.parent_name}</p>
                  <p className="mb-1 small"><strong>Phone:</strong> {child.parent_phone}</p>
                  <p className="mb-1 small"><strong>DOB:</strong> {child.dob} | <strong>Gender:</strong> {child.gender}</p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1 small"><strong>Blood Type:</strong> {child.blood_type || 'N/A'}</p>
                  <p className="mb-1 small"><strong>Allergies:</strong> {child.allergies || 'None'}</p>
                  <div className="d-flex align-items-center mb-1">
                    <span className="me-2 small"><strong>Progress:</strong></span>
                    <div className="progress flex-grow-1" style={{height:'10px',borderRadius:'10px'}}>
                      <div className="progress-bar bg-success rounded-pill" style={{width:`${child.vaccine_progress||0}%`}}>{child.vaccine_progress||0}%</div>
                    </div>
                  </div>
                  <p className="mb-1 small"><strong>Missed Vaccines:</strong> <span className="badge bg-danger rounded-pill">{(appointmentsCache[child.id]||[]).filter(a=>a.status==='missed').length}</span></p>
                </div>
              </div>

              {child.next_appointment_date ? (
                <div className="alert border-0 rounded-3 p-3 mb-3" style={{background:'#d8e6fb',color:'#1e5fbb'}}>
                  <strong>📅 Next Appointment Date:</strong> {child.next_appointment_date}<br />
                  <strong>💉 Vaccines due:</strong> {child.next_vaccines?.join(', ') || 'N/A'}
                </div>
              ) : (
                <div className="alert alert-secondary rounded-3 p-2 mb-3 small">No upcoming appointments.</div>
              )}

              <button 
                className="btn btn-outline-primary btn-sm rounded-pill mb-3" 
                onClick={() => {
                  if (expandedChild === child.id) { setExpandedChild(null); }
                  else { 
                    setExpandedChild(child.id); 
                    if (!appointmentsCache[child.id]) { 
                      getChildAppointments(child.id).then(res => { 
                        setAppointmentsCache(prev => ({ ...prev, [child.id]: res.data?.data || [] })); 
                      }).catch(() => {}); 
                    } 
                  }
                }}
              >
                {expandedChild === child.id ? '🔽 Hide All Vaccines' : '📋 Show All Vaccines & Record'}
              </button>

              {expandedChild === child.id && (
                <div className="table-responsive mt-2">
                  <table className="table table-sm table-bordered rounded-3 overflow-hidden">
                    <thead className="table-light">
                      <tr>
                        <th>Vaccine</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Batch No.</th>
                        <th>Notes</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(appointmentsCache[child.id] || []).map(appt => (
                        <tr key={appt.id}>
                          <td className="fw-semibold">{appt.vaccine_name}</td>
                          <td>{appt.scheduled_date}</td>
                          <td>
                            <span className={`badge rounded-pill ${appt.status==='completed'?'bg-success':appt.status==='missed'?'bg-danger':'bg-warning'}`}>
                              {appt.status}
                            </span>
                          </td>
                          <td>
                            {appt.status === 'pending' ? (
                              <input type="text" className="form-control form-control-sm rounded-3" id={`search-batch-${appt.id}`} style={{width:'80px'}} placeholder="Batch #" />
                            ) : (appt.batch_number || '—')}
                          </td>
                          <td>
                            {appt.status === 'pending' ? (
                              <input type="text" className="form-control form-control-sm rounded-3" id={`search-notes-${appt.id}`} placeholder="Optional" />
                            ) : (appt.notes || '—')}
                          </td>
                          <td>
                            {appt.status === 'pending' && (
                              <button className="btn btn-success btn-sm rounded-pill" onClick={() => { 
                                const batch = document.getElementById(`search-batch-${appt.id}`).value; 
                                const notes = document.getElementById(`search-notes-${appt.id}`).value; 
                                handleVaccine(appt.id, batch, notes); 
                              }}>Record</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
)}

        {/* Filter by Vaccine */}
        {activeTab === 'filter-vaccine' && (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white border-bottom"><h5 className="fw-bold mb-0">Filter by Vaccine</h5></div>
            <div className="card-body p-3">
              <div className="row mb-3">
                <div className="col-md-4"><select className="form-select rounded-3" value={filterVaccineId} onChange={e => setFilterVaccineId(e.target.value)}><option value="">Select vaccine</option>{vaccinesList.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
                <div className="col-md-2"><button className="btn btn-primary rounded-pill px-3" onClick={handleFilterVaccine}>Filter</button></div>
              </div>
              {filteredAppts.length === 0 ? (
                <div className="alert border-0 rounded-3" style={{background:'#d8e6fb',color:'#1e5fbb'}}>No matching appointments.</div>
              ) : (
                <table className="table table-hover"><thead><tr><th>Child</th><th>Vaccine</th><th>Scheduled Date</th><th>Status</th></tr></thead><tbody>{filteredAppts.map(a => (<tr key={a.id}><td className="fw-semibold">{a.child_name}</td><td>{a.vaccine_name}</td><td>{a.scheduled_date}</td><td>{a.status}</td></tr>))}</tbody></table>
              )}
            </div>
          </div>
        )}

        {/* Reschedule Requests */}
        {activeTab === 'reschedules' && (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white border-bottom"><h5 className="fw-bold mb-0">Pending Reschedule Requests</h5></div>
            <div className="card-body p-3">
              {pendingReschedules.length === 0 ? (
                <div className="alert border-0 rounded-3" style={{background:'#d8e6fb',color:'#1e5fbb'}}>No reschedule requests.</div>
              ) : (
                <table className="table table-hover align-middle">
                  <thead><tr><th>Child</th><th>Vaccine</th><th>Original Date</th><th>Requested Date</th><th>Actions</th></tr></thead>
                  <tbody>
                    {pendingReschedules.map(a => (
                      <tr key={a.id}>
                        <td className="fw-semibold">{a.child_name}</td>
                        <td>{a.vaccine_name}</td>
                        <td>{a.scheduled_date}</td>
                        <td>{a.reschedule_request_date}</td>
                        <td>
                          <button className="btn btn-success btn-sm rounded-pill me-1" onClick={() => { approveReschedule(a.id, true).then(() => loadPendingReschedules()); }}>Approve</button>
                          <button className="btn btn-danger btn-sm rounded-pill" onClick={() => { approveReschedule(a.id, false).then(() => loadPendingReschedules()); }}>Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Reports */}
        {activeTab === 'reports' && (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white border-bottom"><h5 className="fw-bold mb-0">Reports</h5></div>
            <div className="card-body p-4">
              <div className="row">
                <div className="col-md-5">
                  <div className="mb-2"><label className="form-label fw-semibold small">Report Type</label><select value={reportType} onChange={e => setReportType(e.target.value)} className="form-select rounded-3"><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></div>
                  <div className="mb-3"><label className="form-label fw-semibold small">Common Challenges</label><div className="row">{commonChallenges.map((issue, idx) => (<div className="col-md-6" key={idx}><div className="form-check"><input className="form-check-input" type="checkbox" id={`challenge-${idx}`} onChange={(e) => { if (e.target.checked) { setChallenges(prev => prev.includes(issue) ? prev : prev + (prev ? '\n' : '') + issue); } else { setChallenges(prev => prev.replace(issue + '\n', '').replace(issue, '').trim()); } }} /><label className="form-check-label small" htmlFor={`challenge-${idx}`}>{issue}</label></div></div>))}</div></div>
                  <div className="mb-3"><label className="form-label fw-semibold small">Additional Details</label><textarea className="form-control rounded-3" rows="3" value={challenges} onChange={e => setChallenges(e.target.value)} /></div>
                  <button className="btn btn-primary rounded-pill w-100 fw-bold" onClick={handleGenerateReport}>📤 Generate & Send to Admin</button>
                </div>
                <div className="col-md-7">
                  <h6 className="fw-bold">Previously Sent Reports</h6>
                  {reportsHistory.length === 0 ? (
                    <div className="alert border-0 rounded-3" style={{background:'#d8e6fb',color:'#1e5fbb'}}>No reports submitted yet.</div>
                  ) : (
                    <div className="table-responsive"><table className="table table-sm table-hover"><thead><tr><th>Type</th><th>Period</th><th>Date</th><th>Details</th></tr></thead><tbody>{reportsHistory.map(r => (<tr key={r.id}><td>{r.type}</td><td>{r.period_start} → {r.period_end}</td><td>{new Date(r.created_at).toLocaleDateString()}</td><td><button className="btn btn-outline-primary btn-sm rounded-pill" onClick={() => { const data = typeof r.data === 'string' ? JSON.parse(r.data) : r.data; alert(JSON.stringify(data, null, 2)); }}>View</button></td></tr>))}</tbody></table></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Approvals */}
        {activeTab === 'certificates' && (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white border-bottom"><h5 className="fw-bold mb-0">Certificates Awaiting Nurse Approval</h5></div>
            <div className="card-body p-3">
              {pendingCerts.length === 0 ? (
                <div className="alert border-0 rounded-3" style={{background:'#d8e6fb',color:'#1e5fbb'}}>No pending certificates.</div>
              ) : (
                <table className="table table-hover align-middle">
                  <thead><tr><th>Child</th><th>Unique ID</th><th>Requested Date</th><th>Action</th></tr></thead>
                  <tbody>
                    {pendingCerts.map(c => (
                      <tr key={c.certificate_id}>
                        <td className="fw-semibold">{c.child_name}</td>
                        <td>{c.unique_child_id}</td>
                        <td>{c.created_at}</td>
                        <td><button className="btn btn-success btn-sm rounded-pill" onClick={() => handleApproveCertificate(c.certificate_id)}>Approve</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default NurseDashboard;