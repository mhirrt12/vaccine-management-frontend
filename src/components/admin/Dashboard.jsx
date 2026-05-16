import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAdminStats,
  getLowStock,
  getExpiringBatches,
  getNurses,
  createNurse,
  deleteNurse,
  getPendingCertificates,
  approveCertificateAdmin,
  updateNurse,
  getAuditLogs,
  getNurseReports,
} from '../../services/adminService';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../../services/api';
import VaccineManager from './VaccineManager';
import InventoryManager from './InventoryManager';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ totalChildren: 0, monthlyVaccinations: 0, totalNurses: 0, totalParents: 0, vaccineLabels: [], vaccineCounts: [], recentActivities: [] });
  const [lowStock, setLowStock] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [pendingCerts, setPendingCerts] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newNurse, setNewNurse] = useState({ name: '', email: '', phone: '', education_level: '', certificate: '', work_experience: '', username: '', password: '' });
  const [editingNurse, setEditingNurse] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [nurseReports, setNurseReports] = useState([]);
  const [stampFile, setStampFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [stampPreview, setStampPreview] = useState('');
  const [signaturePreview, setSignaturePreview] = useState('');

  useEffect(() => { loadAllData(); loadBranding(); }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, lowRes, expRes, nursesRes, certsRes] = await Promise.all([getAdminStats(), getLowStock(), getExpiringBatches(), getNurses(), getPendingCertificates()]);
      setStats(statsRes.data); setLowStock(lowRes.data || []); setExpiring(expRes.data || []); setNurses(nursesRes.data || []); setPendingCerts(certsRes.data?.data || []);
    } catch { setError('Failed to load dashboard data'); } finally { setLoading(false); }
  };

  const loadAuditLogs = async () => { try { setAuditLogs((await getAuditLogs({ limit: 100 })).data?.data || []); } catch {} };
  const loadNurseReports = async () => { try { setNurseReports((await getNurseReports()).data?.data || []); } catch {} };
  const loadBranding = async () => { try { const res = await api.get('/admin/get-branding'); if (res.data?.data?.stamp_image) setStampPreview(res.data.data.stamp_image+'?'+Date.now()); if (res.data?.data?.signature_image) setSignaturePreview(res.data.data.signature_image+'?'+Date.now()); } catch {} };

  const handleUpload = async (type, file) => {
    if (!file) return; const form = new FormData(); form.append('type', type); form.append('file', file);
    try { await api.post('/admin/upload-branding', form, { headers: { 'Content-Type': 'multipart/form-data' } }); setSuccess(`${type==='stamp'?'Stamp':'Signature'} uploaded`); setTimeout(()=>setSuccess(''),3000); loadBranding(); } catch { setError('Upload failed'); }
  };

  useEffect(() => { if (activeTab==='audit') loadAuditLogs(); if (activeTab==='nurse-reports') loadNurseReports(); }, [activeTab]);

  const handleApproveCertificate = async (certId) => {
    try { await approveCertificateAdmin(certId); setPendingCerts(prev=>prev.filter(c=>c.id!==certId)); setSuccess('Certificate approved'); } catch { setError('Approval failed'); }
  };

  const handleAddNurse = async (e) => {
    e.preventDefault(); setError('');
    try { await createNurse(newNurse.name,newNurse.email,newNurse.phone,newNurse.education_level,newNurse.certificate,newNurse.work_experience,newNurse.username,newNurse.password); setNewNurse({name:'',email:'',phone:'',education_level:'',certificate:'',work_experience:'',username:'',password:''}); setSuccess('Nurse added'); loadAllData(); } catch(err) { setError(err.response?.data?.message||'Failed to add nurse'); }
  };

  const handleDeleteNurse = async (nurseId) => {
    if (!window.confirm('Revoke this nurse?')) return;
    try { await deleteNurse(nurseId); setNurses(prev=>prev.filter(n=>n.id!==nurseId)); setSuccess('Nurse revoked'); } catch { setError('Failed to revoke nurse'); }
  };

  const chartData = stats.vaccineLabels.length>0?{labels:stats.vaccineLabels,datasets:[{label:'Vaccinations (Last 30 Days)',data:stats.vaccineCounts,backgroundColor:'rgba(54,162,235,0.6)',borderColor:'rgba(54,162,235,1)',borderWidth:1}]}:null;
  const chartOptions = {responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top'},title:{display:true,text:'Vaccination Distribution by Type'}}};

  if (loading) return (<div className="d-flex justify-content-center align-items-center" style={{minHeight:'70vh',background:'linear-gradient(180deg,#f0f4f8 0%,#fff 100%)'}}><div className="text-center"><div className="spinner-border text-primary mb-3" style={{width:'3rem',height:'3rem'}}/><p className="text-muted fw-semibold">Loading dashboard...</p></div></div>);

  return (
    <div style={{background:'linear-gradient(180deg,#f0f4f8 0%,#fff 50%)',minHeight:'100vh',paddingTop:'20px',paddingBottom:'40px'}}>
      <div className="container-fluid" style={{maxWidth:'1400px'}}>
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div><h2 className="fw-bold mb-0" style={{color:'#1f2a3e'}}>📊 Admin Dashboard</h2><p className="text-muted small mb-0">System overview and management</p></div>
          <span className="badge bg-light text-primary px-3 py-2 rounded-pill shadow-sm">👋 Welcome, <strong>{user?.name}</strong></span>
        </div>

        {error&&<div className="alert alert-danger alert-dismissible fade show rounded-3 shadow-sm">{error}<button className="btn-close" onClick={()=>setError('')}/></div>}
        {success&&<div className="alert alert-success alert-dismissible fade show rounded-3 shadow-sm">{success}<button className="btn-close" onClick={()=>setSuccess('')}/></div>}

        {/* Tabs */}
        <ul className="nav nav-tabs border-0 mb-4 flex-wrap">
          {[
            {id:'dashboard',icon:'📊',label:'Dashboard'},
            {id:'certificates',icon:'📜',label:`Certificates (${pendingCerts.length})`},
            {id:'nurses',icon:'👩‍⚕️',label:`Nurses (${nurses.length})`},
            {id:'vaccines',icon:'💉',label:'Vaccines'},
            {id:'inventory',icon:'📦',label:'Inventory'},
            {id:'audit',icon:'📋',label:'Activity Logs'},
            {id:'nurse-reports',icon:'📁',label:'Nurse Reports'},
            {id:'branding',icon:'🖼️',label:'Branding'},
          ].map(tab=>(
            <li key={tab.id} className="nav-item">
              <button className={`nav-link border-0 rounded-pill px-3 py-2 me-2 fw-semibold small ${activeTab===tab.id?'bg-primary text-white':'bg-white text-secondary'}`} onClick={()=>setActiveTab(tab.id)}>{tab.icon} {tab.label}</button>
            </li>
          ))}
        </ul>

        {/* ====== DASHBOARD TAB ====== */}
        {activeTab==='dashboard'&&(<>
          <div className="row mb-4">
            {[{color:'primary',label:'Total Children',value:stats.totalChildren},{color:'success',label:'Monthly Vaccinations',value:stats.monthlyVaccinations},{color:'info',label:'Total Nurses',value:stats.totalNurses},{color:'warning',label:'Total Parents',value:stats.totalParents}].map((card,i)=>(
              <div key={i} className="col-md-3 mb-3">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                  <div className="card-body text-center p-4">
                    <h6 className="fw-bold text-muted small text-uppercase">{card.label}</h6>
                    <h1 className={`fw-bold text-${card.color} mb-0`}>{card.value}</h1>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {lowStock.length>0&&(<div className="alert border-0 rounded-3 shadow-sm mb-3" style={{background:'#fef2d0',color:'#d48a0b'}}><strong>⚠️ Low Stock:</strong><ul className="mb-0 mt-2 small">{lowStock.map(item=>(<li key={item.batch_number}>{item.vaccine_name} Batch {item.batch_number}: {item.quantity} doses</li>))}</ul></div>)}
          {expiring.length>0&&(<div className="alert border-0 rounded-3 shadow-sm mb-3" style={{background:'#fbe3e0',color:'#c0392b'}}><strong>⚠️ Expiring Soon:</strong><ul className="mb-0 mt-2 small">{expiring.map(item=>(<li key={item.batch_number}>{item.vaccine_name} Batch {item.batch_number} expires {item.expiry_date}</li>))}</ul></div>)}
          <div className="row mb-4"><div className="col-12"><div className="card border-0 shadow-sm rounded-4 overflow-hidden"><div className="card-header bg-white border-bottom"><h5 className="fw-bold mb-0">Vaccination Distribution</h5></div><div className="card-body"><div style={{height:'400px'}}>{chartData?<Bar data={chartData} options={chartOptions}/>:<div className="alert border-0 rounded-3" style={{background:'#d8e6fb',color:'#1e5fbb'}}>No data</div>}</div></div></div></div></div>
          <div className="row"><div className="col-12"><div className="card border-0 shadow-sm rounded-4 overflow-hidden"><div className="card-header bg-white border-bottom"><h5 className="fw-bold mb-0">Recent Vaccinations</h5></div><div className="card-body p-3">{stats.recentActivities.length>0?<table className="table table-hover align-middle"><thead><tr><th>Child</th><th>Vaccine</th><th>Given Date</th><th>Batch</th></tr></thead><tbody>{stats.recentActivities.map((a,idx)=>(<tr key={idx}><td className="fw-semibold">{a.child_name}</td><td>{a.vaccine_name}</td><td>{a.given_date}</td><td>{a.batch_number||'-'}</td></tr>))}</tbody></table>:<div className="alert border-0 rounded-3" style={{background:'#d8e6fb',color:'#1e5fbb'}}>No recent activities.</div>}</div></div></div></div>
        </>)}

        {/* ====== CERTIFICATES TAB ====== */}
        {activeTab==='certificates'&&(
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden"><div className="card-header text-white fw-bold" style={{background:'linear-gradient(135deg,#1e5fbb,#13458a)'}}><h5 className="mb-0">Pending Certificate Approvals</h5></div><div className="card-body p-4">{pendingCerts.length===0?<div className="alert border-0 rounded-3 text-center py-4" style={{background:'#d8e6fb',color:'#1e5fbb'}}>No certificates waiting for approval.</div>:<table className="table table-hover align-middle"><thead><tr><th>Child Name</th><th>Unique ID</th><th>Parent</th><th>Action</th></tr></thead><tbody>{pendingCerts.map(cert=>(<tr key={cert.id}><td className="fw-semibold">{cert.child_name}</td><td>{cert.unique_child_id}</td><td>{cert.parent_name}</td><td><button className="btn btn-success btn-sm rounded-pill px-3" onClick={()=>handleApproveCertificate(cert.id)}>Approve</button></td></tr>))}</tbody></table>}</div></div>
        )}

        {/* ====== NURSES TAB ====== */}
        {activeTab==='nurses'&&(
          <div className="row">
            <div className="col-md-5 mb-4">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden"><div className="card-header text-white fw-bold" style={{background:'linear-gradient(135deg,#1e5fbb,#13458a)'}}><h5 className="mb-0">{editingNurse?'Edit Nurse':'Add Nurse'}</h5></div><div className="card-body p-4">
                <form onSubmit={(e)=>{e.preventDefault();const data={...newNurse};if(editingNurse){updateNurse(editingNurse.id,data).then(()=>{setSuccess('Nurse updated');setEditingNurse(null);setNewNurse({name:'',email:'',phone:'',education_level:'',certificate:'',work_experience:'',username:'',password:''});loadAllData();}).catch(err=>setError(err.response?.data?.message||'Update failed'));}else{handleAddNurse(e);}}}>
                  <div className="row"><div className="col-md-6 mb-3"><label className="form-label small fw-semibold">Full Name *</label><input type="text" className="form-control rounded-3" value={newNurse.name} onChange={e=>setNewNurse({...newNurse,name:e.target.value})} required/></div><div className="col-md-6 mb-3"><label className="form-label small fw-semibold">Phone *</label><input type="text" className="form-control rounded-3" placeholder="0911XXXXXX" value={newNurse.phone} onChange={e=>setNewNurse({...newNurse,phone:e.target.value})} required/></div></div>
                  <div className="mb-3"><label className="form-label small fw-semibold">Email</label><input type="email" className="form-control rounded-3" value={newNurse.email} onChange={e=>setNewNurse({...newNurse,email:e.target.value})}/></div>
                  <div className="mb-3"><label className="form-label small fw-semibold">Username *</label><input type="text" className="form-control rounded-3" value={newNurse.username} onChange={e=>setNewNurse({...newNurse,username:e.target.value})} required/></div>
                  <div className="mb-3"><label className="form-label small fw-semibold">Password {editingNurse?'(leave blank)':''}</label><input type="password" className="form-control rounded-3" value={newNurse.password} onChange={e=>setNewNurse({...newNurse,password:e.target.value})}/></div>
                  <div className="mb-3"><label className="form-label small fw-semibold">Education Level</label><input type="text" className="form-control rounded-3" value={newNurse.education_level} onChange={e=>setNewNurse({...newNurse,education_level:e.target.value})}/></div>
                  <div className="mb-3"><label className="form-label small fw-semibold">Certificate</label><input type="text" className="form-control rounded-3" value={newNurse.certificate} onChange={e=>setNewNurse({...newNurse,certificate:e.target.value})}/></div>
                  <div className="mb-3"><label className="form-label small fw-semibold">Work Experience</label><textarea className="form-control rounded-3" rows="2" value={newNurse.work_experience} onChange={e=>setNewNurse({...newNurse,work_experience:e.target.value})}/></div>
                  <button type="submit" className="btn btn-primary rounded-pill w-100 fw-bold">{editingNurse?'Update Nurse':'Create Nurse'}</button>
                  {editingNurse&&<button type="button" className="btn btn-outline-secondary rounded-pill w-100 mt-2" onClick={()=>{setEditingNurse(null);setNewNurse({name:'',email:'',phone:'',education_level:'',certificate:'',work_experience:'',username:'',password:''});}}>Cancel</button>}
                </form>
              </div></div>
            </div>
            <div className="col-md-7">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden"><div className="card-header bg-white border-bottom"><h5 className="fw-bold mb-0">Nurse List</h5></div><div className="card-body p-3">{nurses.length===0?<div className="alert border-0 rounded-3" style={{background:'#d8e6fb',color:'#1e5fbb'}}>No nurses found.</div>:<table className="table table-hover align-middle"><thead><tr><th>Name</th><th>Phone</th><th>Username</th><th>Education</th><th>Actions</th></tr></thead><tbody>{nurses.map(nurse=>(<tr key={nurse.id}><td className="fw-semibold">{nurse.name}</td><td>{nurse.phone}</td><td>{nurse.username}</td><td>{nurse.education_level||'-'}</td><td><button className="btn btn-outline-primary btn-sm rounded-pill me-1" onClick={()=>{setEditingNurse(nurse);setNewNurse({name:nurse.name,email:nurse.email,phone:nurse.phone,education_level:nurse.education_level||'',certificate:nurse.certificate||'',work_experience:nurse.work_experience||'',username:nurse.username||'',password:''});}}>Edit</button><button className="btn btn-outline-danger btn-sm rounded-pill" onClick={()=>handleDeleteNurse(nurse.id)}>Revoke</button></td></tr>))}</tbody></table>}</div></div>
            </div>
          </div>
        )}

        {/* ====== VACCINES / INVENTORY / AUDIT / REPORTS / BRANDING TABS ====== */}
        {activeTab==='vaccines'&&<VaccineManager/>}
        {activeTab==='inventory'&&<InventoryManager/>}

        {activeTab==='audit'&&(
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden"><div className="card-header bg-white border-bottom"><h5 className="fw-bold mb-0">Activity Logs</h5></div><div className="card-body p-3">{auditLogs.length===0?<div className="alert border-0 rounded-3" style={{background:'#d8e6fb',color:'#1e5fbb'}}>No logs recorded.</div>:<table className="table table-sm table-hover"><thead><tr><th>Time</th><th>User</th><th>Action</th><th>Description</th></tr></thead><tbody>{auditLogs.map(log=>(<tr key={log.id}><td>{log.created_at}</td><td>{log.user_name||'System'}</td><td>{log.action}</td><td>{log.details}</td></tr>))}</tbody></table>}</div></div>
        )}

        {activeTab==='nurse-reports'&&(
          <div><h5 className="fw-bold mb-3">All Nurse Reports</h5>{nurseReports.length===0?<div className="alert border-0 rounded-3 text-center py-4" style={{background:'#d8e6fb',color:'#1e5fbb'}}>No reports submitted by nurses.</div>:nurseReports.map(report=>{let data={};try{data=typeof report.data==='string'?JSON.parse(report.data):report.data;}catch(e){}return(<div key={report.id} className="card border-0 shadow-sm mb-3 rounded-4 overflow-hidden" style={{borderLeft:'4px solid #0d7c9e'}}><div className="card-header bg-white border-bottom d-flex justify-content-between"><span><strong>{report.nurse_name}</strong> — {report.type?.toUpperCase()} REPORT</span><span className="text-muted small">{report.period_start} → {report.period_end} | {new Date(report.created_at).toLocaleString()}</span></div><div className="card-body p-4"><div className="row"><div className="col-md-6"><p className="fw-bold small">📊 Vaccination Summary</p><ul className="list-unstyled ms-3 small"><li>Children vaccinated: {data.vaccination_summary?.total_children_vaccinated??'—'}</li><li>New registrations: {data.vaccination_summary?.new_registrations??'—'}</li><li>Follow‑ups: {data.vaccination_summary?.follow_ups??'—'}</li><li>Doses per vaccine:<ul>{data.vaccination_summary?.doses_per_vaccine?.map((v,i)=>(<li key={i}>{v.name}: {v.count}</li>))||<li>No data</li>}</ul></li></ul><p className="fw-bold small">📅 Appointment Tracking</p><ul className="list-unstyled ms-3 small"><li>Completed: {data.appointment_tracking?.completed_appointments??'—'}</li><li>Defaulters: {data.appointment_tracking?.defaulters?.length?data.appointment_tracking.defaulters.map(d=>`${d.child_name} (${d.parent_phone})`).join(', '):'None'}</li><li>Reschedule: {data.appointment_tracking?.pending_reschedule_requests??0}/{data.appointment_tracking?.approved_reschedule_requests??0}</li></ul></div><div className="col-md-6"><p className="fw-bold small">📦 Inventory & Wastage</p><ul className="list-unstyled ms-3 small"><li>Doses used: {data.inventory_wastage?.doses_used??'—'}</li><li>Closing stock:<ul>{data.inventory_wastage?.closing_stock?.map((s,i)=>(<li key={i}>{s.name}: {s.total_qty}</li>))||<li>No data</li>}</ul></li></ul><p className="fw-bold small">🏥 Health & Safety</p><ul className="list-unstyled ms-3 small"><li>AEFI cases: {data.health_safety?.aefi_cases?.length||0}</li><li>Challenges: {data.health_safety?.challenges||'None'}</li></ul></div></div></div></div>);})}</div>
        )}

        {activeTab==='branding'&&(
          <div className="row">
            {[{title:'Official Stamp',type:'stamp',preview:stampPreview,file:stampFile,setFile:setStampFile,setPreview:setStampPreview},{title:'Authorized Signature',type:'signature',preview:signaturePreview,file:signatureFile,setFile:setSignatureFile,setPreview:setSignaturePreview}].map((item,i)=>(
              <div key={i} className="col-md-6 mb-4">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden"><div className="card-header text-white fw-bold" style={{background:'linear-gradient(135deg,#1e5fbb,#13458a)'}}><h5 className="mb-0">{item.title}</h5></div><div className="card-body text-center p-4">{item.preview?<img src={item.preview} alt={item.title} style={{maxHeight:'200px'}} className="mb-3 img-fluid rounded-3"/>:<div className="alert border-0 rounded-3" style={{background:'#d8e6fb',color:'#1e5fbb'}}>No {item.type} uploaded yet.</div>}<input type="file" accept="image/png" className="form-control rounded-3 mt-2" onChange={(e)=>{item.setFile(e.target.files[0]);item.setPreview(URL.createObjectURL(e.target.files[0]));}}/><button className="btn btn-primary rounded-pill mt-2 px-4 fw-bold" onClick={()=>handleUpload(item.type,item.file)}>Upload {item.title}</button></div></div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;