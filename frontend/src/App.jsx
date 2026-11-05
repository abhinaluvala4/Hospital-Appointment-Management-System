import { useEffect, useMemo, useState } from 'react';
import { Activity, CalendarDays, Search, ShieldCheck, Stethoscope, UserRound, Clock3, LogOut, ArrowRight, HeartPulse, FileText, Pill, Users } from 'lucide-react';
import { api } from './api';

const specializations = ['All specialties', 'Cardiology', 'Dermatology', 'Family Medicine'];
function pretty(iso) { return new Date(iso).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }

export default function App() {
  const [session, setSession] = useState(() => { try { return JSON.parse(sessionStorage.getItem('hospital_user')); } catch { return null; } });
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [loginRole, setLoginRole] = useState('PATIENT');
  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState('');
  const [specialization, setSpecialization] = useState('All specialties');
  const [selected, setSelected] = useState(null);
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patientRecords, setPatientRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { loadDoctors(); }, []);
  useEffect(() => {
    let active = true;
    if (!session) {
      setAppointments([]);
      setPatientRecords([]);
      setRecordsLoading(false);
    } else {
      loadAppointments(() => active);
      if (session.role === 'PATIENT') loadPatientRecords(() => active);
      else {
        setPatientRecords([]);
        setRecordsLoading(false);
      }
    }
    return () => { active = false; };
  }, [session]);
  async function loadDoctors() {
    try { const params = new URLSearchParams(); if (query) params.set('q', query); if (specialization !== 'All specialties') params.set('specialization', specialization); setDoctors(await api(`/doctors?${params}`)); }
    catch (e) { setError(e.message); }
  }
  async function loadAppointments(isActive = () => true) {
    try {
      const result = await api('/appointments/me');
      if (isActive()) setAppointments(result);
    } catch (e) {
      if (isActive()) setError(e.message);
    }
  }
  async function loadPatientRecords(isActive = () => true) {
    setRecordsLoading(true);
    try {
      const result = await api('/patient/medical-records');
      if (isActive()) setPatientRecords(result);
    } catch (e) {
      if (isActive()) setError(e.message);
    } finally {
      if (isActive()) setRecordsLoading(false);
    }
  }
  async function openDoctor(doctor) {
    setSelected(doctor); setNotice(''); setError('');
    try { setSlots(await api(`/doctors/${doctor.id}/availability`)); } catch (e) { setError(e.message); }
  }
  async function submitAuth(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login' ? { email: form.email, password: form.password } : form;
      const result = await api(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      if (mode === 'login' && result.role !== loginRole) {
        throw new Error(`This account is registered as ${result.role.toLowerCase()}. Choose that role and try again.`);
      }
      sessionStorage.setItem('hospital_token', result.token);
      const user = { id: result.userId, name: result.fullName, email: result.email, role: result.role };
      sessionStorage.setItem('hospital_user', JSON.stringify(user)); setSession(user); setForm({ fullName: '', email: '', password: '' }); setNotice('You are signed in.');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function book(slot) {
    if (!session) { setNotice('Sign in with a patient account to book an appointment.'); document.getElementById('account')?.scrollIntoView({ behavior: 'smooth' }); return; }
    if (session.role !== 'PATIENT') { setNotice('Appointment booking is available to patient accounts.'); return; }
    setBusy(true); setError('');
    try { await api('/appointments', { method: 'POST', body: JSON.stringify({ doctorId: selected.id, startsAt: slot.startsAt, reason: null }) }); setNotice(`Appointment booked with ${selected.name}.`); await Promise.all([loadAppointments(), openDoctor(selected)]); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function cancel(id) { setError(''); try { await api(`/appointments/${id}/cancel`, { method: 'PATCH' }); setNotice('Appointment cancelled.'); await loadAppointments(); } catch (e) { setError(e.message); } }
  function signOut() { sessionStorage.removeItem('hospital_token'); sessionStorage.removeItem('hospital_user'); setSession(null); setNotice('You have signed out.'); }

  const nextAppointments = useMemo(() => appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING'), [appointments]);
  if (session?.role === 'DOCTOR') {
    return <DoctorWorkspace session={session} appointments={appointments} loadAppointments={loadAppointments} onSignOut={signOut} />;
  }
  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#home"><span className="brand-mark"><HeartPulse size={21}/></span><span>carepoint<span className="brand-dot">.</span><small>HOSPITAL CARE</small></span></a><nav><a href="#doctors">Find a doctor</a><a href="#appointments">Appointment history</a>{session?.role === 'PATIENT' && <a href="#medication-history">Medication history</a>}</nav><div className="top-actions">{session ? <><span className="user-pill"><span className="avatar">{session.name[0]}</span><span>{session.name.split(' ')[0]} <small>{session.role.toLowerCase()}</small></span></span><button className="icon-button" aria-label="Sign out" onClick={signOut}><LogOut size={18}/></button></> : <a className="button button-outline" href="#account">Sign in <ArrowRight size={15}/></a>}</div></header>
    <main id="home">
      <section className="hero"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line"/>YOUR HEALTH, IN GOOD HANDS</div><h1>Care that fits<br/>your <em>schedule.</em></h1><p>Find the right specialist and book a visit in just a few clicks. Thoughtful care starts here.</p><a href="#doctors" className="button button-primary">Explore our doctors <ArrowRight size={17}/></a><div className="hero-trust"><span><ShieldCheck size={16}/> Secure & private</span><span><Clock3 size={16}/> Easy scheduling</span></div></div><div className="hero-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-sun"/><div className="doctor-illustration"><div className="doctor-head"/><div className="doctor-neck"/><div className="doctor-body"><div className="coat-left"/><div className="coat-right"/><div className="shirt"/><div className="stethoscope"/></div><div className="doctor-arm"/></div><div className="floating-card card-rating"><span className="rating-stars">★★★★★</span><b>Trusted care</b><small>From doctors who listen</small></div><div className="floating-card card-availability"><span className="availability-icon"><CalendarDays size={17}/></span><span><b>Appointments</b><small>Made simple</small></span><i/></div><span className="art-spark spark-one">✳</span><span className="art-spark spark-two">✳</span></div><div className="hero-bottom"><span>CARE BUILT AROUND YOU</span><span>01 — 03</span></div></section>
      <section className="account-section" aria-label="Account sign in">
        <aside className="account-card" id="account"><span className="account-icon"><Activity size={20}/></span><div className="eyebrow">{session?'YOUR ACCOUNT':'GET STARTED'}</div><h3>{session?`Welcome, ${session.name.split(' ')[0]}.`:'Ready when you are.'}</h3><p>{session?`Signed in as ${session.email}. Your care journey is all in one place.`:'Sign in to view your appointment and medication history, or create a patient account to get started.'}</p>{session?<button className="button button-outline" onClick={signOut}>Sign out <LogOut size={15}/></button>:<form className="auth-form" onSubmit={submitAuth}>{mode==='register'&&<input required maxLength="120" placeholder="Full name" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})}/>}<input required type="email" placeholder="Email address" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>{mode==='login'&&<label className="auth-role">Sign in as<select value={loginRole} onChange={e=>setLoginRole(e.target.value)}><option value="PATIENT">Patient</option><option value="DOCTOR">Doctor</option></select></label>}<input required minLength="10" type="password" placeholder="Password (10+ characters)" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><button className="button button-primary" disabled={busy}>{busy?'Please wait…':mode==='login'?'Sign in':'Create account'} <ArrowRight size={15}/></button><button type="button" className="mode-toggle" onClick={()=>{setMode(mode==='login'?'register':'login');setError('');}}>{mode==='login'?"New here? Create an account":"Already have an account? Sign in"}</button><small className="auth-hint">{mode==='login'?'Choose your account role. Local demo sign-in details are in the README; new registrations create patient accounts.':'Patient accounts are created securely with your email and password.'}</small></form>}</aside>
      </section>
      <section className="trust-strip"><div><span className="trust-icon"><Stethoscope size={19}/></span><span><b>Experienced specialists</b><small>Care across key specialties</small></span></div><div><span className="trust-icon"><CalendarDays size={19}/></span><span><b>Appointments made easy</b><small>Choose a time that works</small></span></div><div><span className="trust-icon"><ShieldCheck size={19}/></span><span><b>Your privacy matters</b><small>Secure by design</small></span></div></section>
      <section className="section doctors-section" id="doctors"><div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>OUR CARE TEAM</div><h2>Meet your doctor.</h2></div><p>Good care begins with the right connection.<br/>Find a specialist who understands you.</p></div><div className="search-panel"><label className="search-input"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&loadDoctors()} placeholder="Search doctors by name"/><button aria-label="Search" onClick={loadDoctors}><ArrowRight size={17}/></button></label><label className="select-wrap"><span>Specialty</span><select value={specialization} onChange={e=>setSpecialization(e.target.value)}>{specializations.map(s=><option key={s}>{s}</option>)}</select></label><button className="button button-primary search-submit" onClick={loadDoctors}>Find a doctor <ArrowRight size={16}/></button></div>
        <div className="doctor-grid">{doctors.length ? doctors.map((d,i)=><article className="doctor-card" key={d.id}><div className={`doctor-photo photo-${i%3}`}><div className="portrait-head"/><div className="portrait-body"/><span className="photo-label">{d.specialization}</span></div><div className="doctor-info"><div className="doctor-name-line"><div><h3>{d.name}</h3><p>{d.specialization} specialist</p></div><span className="verified"><ShieldCheck size={15}/></span></div>{d.bio&&<p className="doctor-bio">{d.bio}</p>}<button className="text-link" onClick={()=>openDoctor(d)}>View availability <ArrowRight size={15}/></button></div></article>):<div className="empty-state"><Stethoscope size={25}/><b>No doctors found</b><span>Try another name or specialty.</span></div>}</div>
      </section>
      <section className="appointment-area" id="appointments"><div className="appointment-panel"><div className="section-heading compact"><div><div className="eyebrow"><span className="eyebrow-line"/>YOUR VISITS</div><h2>Appointment history.</h2></div><span className="count-badge">{nextAppointments.length} upcoming</span></div>{session ? appointments.length ? <div className="appointment-list">{appointments.map(a=><div className="appointment-row" key={a.id}><span className="appointment-date"><CalendarDays size={18}/></span><div className="appointment-main"><b>{a.doctorName}</b><span>{pretty(a.startsAt)} · {a.status.toLowerCase()}</span></div>{a.status==='CONFIRMED'&&<button className="cancel-button" onClick={()=>cancel(a.id)}>Cancel</button>}</div>)}</div>:<div className="appointment-empty"><CalendarDays size={22}/><span>Your appointments will appear here.</span></div> : <div className="appointment-empty"><UserRound size={22}/><span>Sign in to see your appointment history.</span><a href="#account" className="text-link">Sign in <ArrowRight size={14}/></a></div>}</div></section>
      {session?.role === 'PATIENT' && <section className="patient-history-section" id="medication-history">
        <div className="section-heading compact"><div><div className="eyebrow"><span className="eyebrow-line"/>YOUR CARE RECORD</div><h2>Medication history.</h2></div><Pill size={22}/></div>
        {recordsLoading ? <div className="patient-history-empty">Loading your medical history…</div> : patientRecords.length ? <div className="patient-record-grid">{patientRecords.map(record => <article className="patient-record-card" key={record.id}>
          <div className="patient-record-heading"><div><b>{record.diagnosis}</b><small>{pretty(record.appointmentStartsAt)} · Dr. {record.doctorName}</small></div><FileText size={18}/></div>
          {record.notes && <p className="record-notes">{record.notes}</p>}
          {record.prescriptions?.length ? record.prescriptions.map(prescription => <div className="patient-prescription" key={prescription.id}>
            <div className="workspace-title"><Pill size={16}/><b>Prescription</b></div>
            {prescription.items.map(medication => <div className="patient-medication" key={medication.id}><b>{medication.medication}</b><span>{medication.dosage} · {medication.frequency}{medication.durationDays ? ` · ${medication.durationDays} days` : ''}</span></div>)}
            {prescription.instructions && <small>{prescription.instructions}</small>}
          </div>) : <p className="patient-no-prescription">No medication was prescribed for this visit.</p>}
        </article>)}</div> : <div className="patient-history-empty"><Pill size={22}/><span>No medication history is available yet. Records from completed visits will appear here.</span></div>}
      </section>}
      <footer><a className="brand footer-brand" href="#home"><span className="brand-mark"><HeartPulse size={18}/></span><span>carepoint<span className="brand-dot">.</span></span></a><span>Thoughtful care, made simpler.</span><span>© 2026 Carepoint Health</span></footer>
    </main>
    {notice&&<div className="toast success" role="status">{notice}<button onClick={()=>setNotice('')}>×</button></div>}{error&&<div className="toast error" role="alert">{error}<button onClick={()=>setError('')}>×</button></div>}
    {selected&&<div className="modal-backdrop" onClick={()=>setSelected(null)}><section className="slot-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setSelected(null)}>×</button><div className="eyebrow"><span className="eyebrow-line"/>BOOK A VISIT</div><h2>{selected.name}</h2><p>{selected.specialization} · Select an available time</p><div className="slot-list">{slots.length?slots.map(slot=><button key={slot.id} className="slot-button" disabled={busy} onClick={()=>book(slot)}><CalendarDays size={16}/>{pretty(slot.startsAt)}<ArrowRight size={16}/></button>):<div className="empty-state">No published future appointments are available.</div>}</div><small className="modal-note">Appointments can be cancelled up to 24 hours before the visit.</small></section></div>}
  </div>;
}

function DoctorWorkspace({ session, appointments, loadAppointments, onSignOut }) {
  const [patientId, setPatientId] = useState('');
  const [records, setRecords] = useState([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [recordAppointmentId, setRecordAppointmentId] = useState('');
  const [prescribingRecordId, setPrescribingRecordId] = useState(null);
  const [prescription, setPrescription] = useState({ medication: '', dosage: '', frequency: '', durationDays: '', instructions: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const patients = useMemo(() => {
    const unique = new Map();
    appointments.forEach(appointment => unique.set(appointment.patientId, { id: appointment.patientId, name: appointment.patientName }));
    return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [appointments]);
  const selectedPatientAppointments = appointments.filter(appointment => String(appointment.patientId) === patientId);
  const recordAppointmentIds = new Set(records.map(record => record.appointmentId));
  const documentableAppointments = selectedPatientAppointments.filter(appointment =>
    new Date(appointment.startsAt) < new Date()
    && !['CANCELLED', 'RESCHEDULED'].includes(appointment.status)
    && !recordAppointmentIds.has(appointment.id)
  );

  async function selectPatient(id) {
    setPatientId(id);
    setRecords([]);
    setRecordAppointmentId('');
    setError('');
    setNotice('');
    if (!id) return;
    try { setRecords(await api(`/doctor/patients/${id}/medical-records`)); }
    catch (e) { setError(e.message); }
  }

  async function saveMedicalRecord(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await api(`/doctor/appointments/${recordAppointmentId}/medical-record`, {
        method: 'PUT',
        body: JSON.stringify({ diagnosis, notes }),
      });
      setDiagnosis('');
      setNotes('');
      setRecordAppointmentId('');
      await Promise.all([selectPatient(patientId), loadAppointments()]);
      setNotice('Medical record saved.');
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function addPrescription(event, recordId) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await api(`/doctor/medical-records/${recordId}/prescriptions`, {
        method: 'POST',
        body: JSON.stringify({
          instructions: prescription.instructions || null,
          items: [{
            medication: prescription.medication,
            dosage: prescription.dosage,
            frequency: prescription.frequency,
            durationDays: prescription.durationDays ? Number(prescription.durationDays) : null,
          }],
        }),
      });
      setPrescription({ medication: '', dosage: '', frequency: '', durationDays: '', instructions: '' });
      setPrescribingRecordId(null);
      await selectPatient(patientId);
      setNotice('Prescription added.');
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  return <div className="app-shell doctor-shell">
    <header className="topbar">
      <a className="brand" href="#doctor-home"><span className="brand-mark"><HeartPulse size={21}/></span><span>carepoint<span className="brand-dot">.</span><small>DOCTOR WORKSPACE</small></span></a>
      <nav><a href="#doctor-patients">My patients</a><a href="#doctor-history">Medical history</a></nav>
      <div className="top-actions"><span className="user-pill"><span className="avatar">{session.name[0]}</span><span>{session.name.split(' ')[0]} <small>doctor</small></span></span><button className="icon-button" aria-label="Sign out" onClick={onSignOut}><LogOut size={18}/></button></div>
    </header>
    <main id="doctor-home">
      <section className="doctor-welcome">
        <div><div className="eyebrow"><span className="eyebrow-line"/>CLINICAL WORKSPACE</div><h1>Welcome, Dr. {session.name.split(' ')[0]}.</h1><p>Review your appointments, see the medical history of your patients, and document care.</p></div>
        <div className="doctor-summary"><Users size={20}/><span><b>{patients.length}</b><small>patients with appointments</small></span></div>
      </section>
      <section className="doctor-workspace-grid">
        <aside className="doctor-patient-panel" id="doctor-patients">
          <div className="workspace-title"><Users size={19}/><h2>My patients</h2></div>
          <p>Patients with appointments assigned to you.</p>
          {patients.length ? <div className="doctor-patient-list">{patients.map(patient => (
            <button key={patient.id} className={`doctor-patient-item ${String(patient.id) === patientId ? 'selected' : ''}`} onClick={() => selectPatient(String(patient.id))}>
              <span className="avatar">{patient.name[0]}</span><span><b>{patient.name}</b><small>{appointments.filter(appointment => appointment.patientId === patient.id).length} appointment(s)</small></span><ArrowRight size={15}/>
            </button>
          ))}</div> : <div className="clinical-empty">No patient appointments are assigned to your account yet.</div>}
        </aside>
        <section className="doctor-history-panel" id="doctor-history">
          {!patientId ? <div className="clinical-empty clinical-empty-large"><FileText size={28}/><b>Select a patient</b><span>Their medical history and your appointments with them will appear here.</span></div> : <>
            <div className="workspace-title"><FileText size={19}/><h2>{patients.find(patient => String(patient.id) === patientId)?.name}'s medical history</h2></div>
            <p>History is available only for patients who have an appointment with you.</p>
            <div className="patient-visit-list"><h3>Appointments with this patient</h3>{selectedPatientAppointments.map(appointment => (
              <div className="patient-visit-row" key={appointment.id}><span>{pretty(appointment.startsAt)}</span><small>{appointment.status.toLowerCase()}</small></div>
            ))}</div>
            {records.length ? <div className="medical-record-list">{records.map(record => (
              <article className="medical-record-card" key={record.id}>
                <div className="record-heading"><div><b>{record.diagnosis}</b><small>{pretty(record.appointmentStartsAt)} · Dr. {record.doctorName}</small></div><span className="record-badge">Medical record</span></div>
                {record.notes && <p className="record-notes">{record.notes}</p>}
                {record.prescriptions?.length ? <div className="prescription-list">{record.prescriptions.map(item => (
                  <div className="prescription-card" key={item.id}><div className="workspace-title"><Pill size={16}/><b>Prescription</b></div>
                    {item.items.map(med => <p key={med.id}><b>{med.medication}</b> — {med.dosage}, {med.frequency}{med.durationDays ? ` for ${med.durationDays} days` : ''}</p>)}
                    {item.instructions && <small>{item.instructions}</small>}
                  </div>
                ))}</div> : <p className="record-notes">No prescriptions recorded for this visit.</p>}
                {record.doctorUserId === session.id && <div className="prescription-actions">
                  {prescribingRecordId === record.id ? <form className="clinical-form prescription-form" onSubmit={event => addPrescription(event, record.id)}>
                    <h3>Add prescription</h3>
                    <div className="clinical-form-row"><input required maxLength="160" placeholder="Medication" value={prescription.medication} onChange={event => setPrescription({ ...prescription, medication: event.target.value })}/><input required maxLength="120" placeholder="Dosage" value={prescription.dosage} onChange={event => setPrescription({ ...prescription, dosage: event.target.value })}/></div>
                    <div className="clinical-form-row"><input required maxLength="120" placeholder="Frequency" value={prescription.frequency} onChange={event => setPrescription({ ...prescription, frequency: event.target.value })}/><input type="number" min="1" placeholder="Duration (days)" value={prescription.durationDays} onChange={event => setPrescription({ ...prescription, durationDays: event.target.value })}/></div>
                    <textarea maxLength="2000" placeholder="Instructions (optional)" value={prescription.instructions} onChange={event => setPrescription({ ...prescription, instructions: event.target.value })}/>
                    <div className="clinical-form-actions"><button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : 'Save prescription'}</button><button type="button" className="button button-outline" onClick={() => setPrescribingRecordId(null)}>Close</button></div>
                  </form> : <button className="button button-outline" onClick={() => setPrescribingRecordId(record.id)}><Pill size={15}/> Add prescription</button>}
                </div>}
              </article>
            ))}</div> : <div className="clinical-empty">No medical history has been recorded for this patient yet.</div>}
            <section className="clinical-form-section">
              <h3><FileText size={17}/> Document a past appointment</h3>
              {documentableAppointments.length ? <form className="clinical-form" onSubmit={saveMedicalRecord}>
                <label>Appointment<select required value={recordAppointmentId} onChange={event => setRecordAppointmentId(event.target.value)}><option value="">Select an appointment</option>{documentableAppointments.map(appointment => <option key={appointment.id} value={appointment.id}>{pretty(appointment.startsAt)} · {appointment.status.toLowerCase()}</option>)}</select></label>
                <label>Diagnosis<input required maxLength="10000" value={diagnosis} onChange={event => setDiagnosis(event.target.value)} placeholder="Enter diagnosis"/></label>
                <label>Clinical notes<textarea maxLength="10000" value={notes} onChange={event => setNotes(event.target.value)} placeholder="Relevant clinical notes (optional)"/></label>
                <button className="button button-primary" disabled={busy || !recordAppointmentId}>{busy ? 'Saving…' : 'Save medical record'}</button>
              </form> : <div className="clinical-empty">No undocumented past appointments are available for this patient.</div>}
            </section>
          </>}
        </section>
      </section>
    </main>
    <footer><a className="brand footer-brand" href="#doctor-home"><span className="brand-mark"><HeartPulse size={18}/></span><span>carepoint<span className="brand-dot">.</span></span></a><span>Confidential clinical workspace</span><span>© 2026 Carepoint Health</span></footer>
    {notice && <div className="toast success" role="status">{notice}<button onClick={() => setNotice('')}>×</button></div>}
    {error && <div className="toast error" role="alert">{error}<button onClick={() => setError('')}>×</button></div>}
  </div>;
}
