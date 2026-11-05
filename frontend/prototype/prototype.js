(() => {
  const STORE = 'carepoint_prototype_v1';
  const app = document.getElementById('app');
  const modalRoot = document.getElementById('modal-root');
  const specialties = ['Cardiology', 'Dermatology', 'Family Medicine', 'Neurology', 'Pediatrics'];
  let state = loadState();
  let currentUserId = sessionStorage.getItem('carepoint_demo_user');
  let view = 'overview';
  let query = '';
  let filterSpecialty = '';
  let selectedAppointmentId = null;
  let notice = null;
  let authMode = 'login';

  function datePlus(days, hour = 10, minute = 0) { const d = new Date(); d.setDate(d.getDate() + days); d.setHours(hour, minute, 0, 0); return d.toISOString(); }
  function seed() {
    const doctors = [
      { id: 'doc-avery', userId: 'user-avery', name: 'Dr. Avery Shah', email: 'avery@carepoint.demo', specialty: 'Cardiology', bio: 'Heart health with a personal, thoughtful approach.', experience: '12 years' },
      { id: 'doc-jordan', userId: 'user-jordan', name: 'Dr. Jordan Lee', email: 'jordan@carepoint.demo', specialty: 'Family Medicine', bio: 'Whole-family care for every stage of life.', experience: '9 years' },
      { id: 'doc-maya', userId: 'user-maya', name: 'Dr. Maya Patel', email: 'maya@carepoint.demo', specialty: 'Dermatology', bio: 'Evidence-led skin care, tailored to you.', experience: '8 years' },
    ];
    const users = [
      { id: 'user-admin', name: 'Morgan Ellis', email: 'admin@carepoint.demo', password: 'admin123', role: 'ADMIN', active: true },
      { id: 'user-avery', name: 'Dr. Avery Shah', email: 'avery@carepoint.demo', password: 'doctor123', role: 'DOCTOR', doctorId: 'doc-avery', active: true },
      { id: 'user-jordan', name: 'Dr. Jordan Lee', email: 'jordan@carepoint.demo', password: 'doctor123', role: 'DOCTOR', doctorId: 'doc-jordan', active: true },
      { id: 'user-maya', name: 'Dr. Maya Patel', email: 'maya@carepoint.demo', password: 'doctor123', role: 'DOCTOR', doctorId: 'doc-maya', active: true },
      { id: 'user-patient', name: 'Taylor Morgan', email: 'patient@carepoint.demo', password: 'patient123', role: 'PATIENT', active: true },
    ];
    const availability = [];
    for (const doctor of doctors) for (let day = 2; day < 15; day++) for (const [hour, minute] of [[9,30],[10,30],[13,0],[14,0]]) {
      const startsAt = datePlus(day, hour, minute); const end = new Date(startsAt); end.setMinutes(end.getMinutes() + 30);
      availability.push({ id: `${doctor.id}-${day}-${hour}-${minute}`, doctorId: doctor.id, startsAt, endsAt: end.toISOString() });
    }
    return { users, doctors, availability, appointments: [], records: [] };
  }
  function loadState() {
    try { const saved = JSON.parse(localStorage.getItem(STORE)); if (saved && saved.users && saved.doctors && saved.availability) return saved; } catch (_) { /* start with demo data */ }
    const fresh = seed(); localStorage.setItem(STORE, JSON.stringify(fresh)); return fresh;
  }
  function save() { localStorage.setItem(STORE, JSON.stringify(state)); }
  function user() { return state.users.find(u => u.id === currentUserId && u.active) || null; }
  function patientId() { return user()?.id; }
  function doctor() { const u = user(); return u?.role === 'DOCTOR' ? state.doctors.find(d => d.id === u.doctorId) : null; }
  function esc(value = '') { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function fmt(value, options = { weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit' }) { return new Date(value).toLocaleString([], options); }
  function activeAppointments() { return state.appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING'); }
  function myAppointments() { const u=user(); if (!u) return []; if (u.role==='ADMIN') return state.appointments; if (u.role==='DOCTOR') return state.appointments.filter(a=>a.doctorId===u.doctorId); return state.appointments.filter(a=>a.patientUserId===u.id); }
  function toast(message, type='info') { notice={message,type}; render(); window.setTimeout(()=>{ if(notice?.message===message){notice=null;render();} },3500); }
  function header() {
    const u=user();
    return `<header class="topbar"><a class="brand" href="#"><span class="brand-icon">♡</span><span>carepoint<b>.</b><small>HOSPITAL CARE</small></span></a><div class="top-right"><span class="demo-chip">INTERACTIVE DEMO · SAMPLE DATA</span>${u?`<div class="user-menu"><span class="avatar">${esc(u.name[0])}</span><span>${esc(u.name)}<small>${u.role.toLowerCase()} account</small></span></div><button class="logout" data-action="logout">Sign out</button>`:''}</div></header>`;
  }
  function navItems() {
    const role=user()?.role;
    if(role==='PATIENT') return [['overview','⌂','Overview'],['doctors','✚','Find a doctor'],['appointments','▦','Appointments'],['records','▤','Medical records']];
    if(role==='DOCTOR') return [['overview','⌂','Overview'],['appointments','▦','My appointments'],['availability','◷','Availability'],['records','▤','Patient records'],['profile','♙','My profile']];
    return [['overview','⌂','Overview'],['appointments','▦','All appointments'],['doctors','✚','Doctor directory'],['users','♙','User accounts']];
  }
  function sideNav() { return `<aside class="sidebar"><div class="side-label">WORKSPACE</div>${navItems().map(([key,icon,label])=>`<button class="side-link ${view===key?'active':''}" data-view="${key}"><span class="side-icon">${icon}</span>${label}</button>`).join('')}<div class="side-card"><b>Care, all in one place.</b><p>This prototype keeps sample data in this browser so you can explore each role and workflow.</p><button data-action="reset-demo" style="margin-top:10px;border:0;background:transparent;color:#397257;padding:0;font-size:9px;font-weight:700">Reset demo data</button></div></aside>`; }
  function pageHead(title, subtitle, action='') { return `<div class="page-head"><div><div class="eyebrow">${user().role} WORKSPACE</div><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`; }
  function stat(label,value,caption,icon) { return `<div class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-caption">${caption}</div></div>`; }
  function appointmentRow(a, actions=true) {
    const d=state.doctors.find(x=>x.id===a.doctorId); const p=state.users.find(x=>x.id===a.patientUserId);
    const counterpart=user()?.role==='DOCTOR'||user()?.role==='ADMIN'?p?.name:d?.name;
    const canCancel=a.status==='CONFIRMED'&&new Date(a.startsAt)-Date.now()>=24*60*60*1000;
    let action='';
    if(actions&&user().role==='PATIENT'&&canCancel) action=`<button class="btn secondary small" data-action="reschedule" data-id="${a.id}">Reschedule</button><button class="btn danger small" data-action="cancel" data-id="${a.id}">Cancel</button>`;
    if(actions&&user().role==='ADMIN'&&a.status==='CONFIRMED') action=`<button class="btn danger small" data-action="cancel-admin" data-id="${a.id}">Cancel</button>`;
    if(actions&&user().role==='DOCTOR'&&a.status==='CONFIRMED') action=`<button class="btn small" data-action="record" data-id="${a.id}">Complete visit</button>`;
    return `<div class="appointment-row"><span class="date-icon">▦</span><div class="row-main"><b>${esc(counterpart||'Account')}</b><small>${fmt(a.startsAt)}${a.reason?` · ${esc(a.reason)}`:''}</small></div><span class="badge ${a.status.toLowerCase()}">${a.status.toLowerCase()}</span>${action}</div>`;
  }
  function overview() {
    const u=user(); const visits=myAppointments(); const upcoming=visits.filter(a=>new Date(a.startsAt)>new Date()&&(a.status==='CONFIRMED'||a.status==='PENDING')).sort((a,b)=>a.startsAt.localeCompare(b.startsAt));
    const count=visits.length; const next=upcoming[0];
    const stats=u.role==='PATIENT'?[stat('Upcoming visits',upcoming.length,'Your scheduled care','▦'),stat('Care team',state.doctors.length,'Available specialists','✚'),stat('Records',state.records.filter(r=>r.patientUserId===u.id).length,'Visit notes and prescriptions','▤')]:u.role==='DOCTOR'?[stat('Upcoming visits',upcoming.length,'Assigned to you','▦'),stat('Total patients',new Set(visits.map(a=>a.patientUserId)).size,'Across your appointments','♙'),stat('Published slots',state.availability.filter(s=>s.doctorId===u.doctorId&&new Date(s.startsAt)>new Date()).length,'Future appointment times','◷')]:[stat('Appointments',state.appointments.length,'All scheduled and past visits','▦'),stat('Patients',state.users.filter(x=>x.role==='PATIENT').length,'Registered accounts','♙'),stat('Doctors',state.doctors.length,'Active profiles','✚')];
    const title=u.role==='PATIENT'?`Good ${new Date().getHours()<12?'morning':'day'}, ${esc(u.name.split(' ')[0])}.`:u.role==='DOCTOR'?'Welcome back, doctor.':'Operations overview';
    const head=pageHead(title,u.role==='PATIENT'?'Your health journey, organized in one place.':u.role==='DOCTOR'?'Your schedule and patient care at a glance.':'A live view of the hospital appointment workspace.');
    const visitsPanel=`<section class="panel"><div class="panel-title"><h2>${u.role==='DOCTOR'?'Your next appointments':'Upcoming appointments'}</h2><button class="btn secondary small" data-view="appointments">View all</button></div>${upcoming.length?upcoming.slice(0,4).map(a=>appointmentRow(a,false)).join(''):'<div class="empty"><b>No upcoming visits</b>Scheduled appointments will show here.</div>'}</section>`;
    const side=u.role==='PATIENT'?`<section class="panel"><div class="panel-title"><h2>Care team</h2><span>${state.doctors.length} specialists</span></div>${state.doctors.slice(0,3).map(d=>`<div class="appointment-row"><span class="date-icon">✚</span><div class="row-main"><b>${esc(d.name)}</b><small>${esc(d.specialty)}</small></div><button class="btn secondary small" data-action="book-doctor" data-id="${d.id}">Book</button></div>`).join('')}</section>`:u.role==='DOCTOR'?`<section class="panel"><div class="panel-title"><h2>Quick actions</h2></div><p style="font-size:10px;color:#7e8b82;line-height:1.7">Keep your calendar current so patients can find a time that works.</p><button class="btn secondary" data-view="availability">Manage availability →</button></section>`:`<section class="panel"><div class="panel-title"><h2>Recent activity</h2><span>System snapshot</span></div><div class="appointment-row"><span class="date-icon">✓</span><div class="row-main"><b>Appointment scheduling is active</b><small>Published availability is visible to patients.</small></div></div><div class="appointment-row"><span class="date-icon">♙</span><div class="row-main"><b>Role-based workspaces</b><small>Switch using the demo sign-in buttons.</small></div></div></section>`;
    return `${head}<div class="grid stats">${stats.join('')}</div><div class="grid two-col">${visitsPanel}${side}</div>`;
  }
  function doctorDirectory(admin=false) {
    const list=state.doctors.filter(d=>(!query||`${d.name} ${d.specialty}`.toLowerCase().includes(query.toLowerCase()))&&(!filterSpecialty||d.specialty===filterSpecialty));
    const head=pageHead(admin?'Doctor directory':'Find your doctor',admin?'Review the care team profiles available in the system.':'Browse specialists and choose an appointment time.');
    return `${head}<div class="searchbar"><input id="doctor-query" value="${esc(query)}" placeholder="Search by doctor name or specialty"/><select id="specialty-filter"><option value="">All specialties</option>${specialties.map(s=>`<option ${filterSpecialty===s?'selected':''}>${s}</option>`).join('')}</select><button class="btn" data-action="search-doctors">Search</button>${admin?'<button class="btn secondary" data-action="add-doctor">+ Add doctor</button>':''}</div>${list.length?`<div class="grid doctor-grid">${list.map(d=>`<article class="doctor-card"><div class="doctor-art"><div class="portrait"></div><span class="specialty-tag">${esc(d.specialty)}</span></div><div class="doctor-info"><h3>${esc(d.name)}</h3><p>${esc(d.specialty)} · ${esc(d.experience||'New profile')}</p><p class="bio">${esc(d.bio||'Care tailored to each patient.')}</p><div class="doctor-actions"><small style="font-size:8px;color:#89958d">${state.availability.filter(s=>s.doctorId===d.id&&new Date(s.startsAt)>new Date()).length} times available</small><button class="btn small" data-action="${admin?'edit-doctor':'book-doctor'}" data-id="${d.id}">${admin?'Edit profile':'View times'}</button></div></div></article>`).join('')}</div>`:'<div class="empty"><b>No matching doctors</b>Try a different name or specialty.</div>'}`;
  }
  function appointmentsPage() {
    const items=myAppointments().sort((a,b)=>a.startsAt.localeCompare(b.startsAt));
    const title=user().role==='PATIENT'?'Your appointments':user().role==='DOCTOR'?'My appointments':'All appointments';
    const rows=items.map(a=>`<tr><td><b>${esc(state.users.find(x=>x.id===a.patientUserId)?.name||'Patient')}</b></td><td>${esc(state.doctors.find(x=>x.id===a.doctorId)?.name||'Doctor')}</td><td>${fmt(a.startsAt)}</td><td><span class="badge ${a.status.toLowerCase()}">${a.status.toLowerCase()}</span></td><td><div class="table-actions">${user().role==='DOCTOR'&&a.status==='CONFIRMED'?`<button class="btn small" data-action="record" data-id="${a.id}">Complete / record</button>`:''}${user().role==='PATIENT'&&a.status==='CONFIRMED'&&new Date(a.startsAt)-Date.now()>=86400000?`<button class="btn secondary small" data-action="reschedule" data-id="${a.id}">Reschedule</button><button class="btn danger small" data-action="cancel" data-id="${a.id}">Cancel</button>`:''}${user().role==='ADMIN'&&a.status==='CONFIRMED'?`<button class="btn danger small" data-action="cancel-admin" data-id="${a.id}">Cancel</button>`:''}</div></td></tr>`).join('');
    return `${pageHead(title,'Review appointment status, visit time and care team.')}<section class="panel"><div class="panel-title"><h2>${items.length} ${items.length===1?'appointment':'appointments'}</h2><span>Times shown in your local timezone</span></div>${items.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Patient</th><th>Doctor</th><th>Date and time</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<div class="empty"><b>No appointments yet</b>When a visit is booked, it will appear here.</div>'}</section>`;
  }
  function availabilityPage() {
    const d=doctor(); if(!d)return `${pageHead('Availability','Only doctor accounts can manage a schedule.')}<div class="empty"><b>Doctor account required</b>Sign in with one of the doctor demo accounts.</div>`;
    const slots=state.availability.filter(s=>s.doctorId===d.id&&new Date(s.startsAt)>new Date()).sort((a,b)=>a.startsAt.localeCompare(b.startsAt));
    return `${pageHead('Your availability','Publish future appointment times for patients to book.')}<div class="grid two-col"><section class="panel"><div class="panel-title"><h2>Publish a time</h2><span>30 minute visit</span></div><form id="availability-form"><div class="form-grid"><div class="field"><label for="slot-date">Date</label><input id="slot-date" name="date" type="date" required min="${new Date(Date.now()+86400000).toISOString().slice(0,10)}"/></div><div class="field"><label for="slot-time">Start time</label><input id="slot-time" name="time" type="time" required/></div></div><div class="form-actions"><button class="btn">Publish availability</button></div></form></section><section class="panel"><div class="panel-title"><h2>Upcoming published times</h2><span>${slots.length} open</span></div>${slots.length?slots.slice(0,8).map(s=>`<div class="appointment-row"><span class="date-icon">◷</span><div class="row-main"><b>${fmt(s.startsAt)}</b><small>30 minutes</small></div><button class="btn danger small" data-action="remove-slot" data-id="${s.id}">Remove</button></div>`).join(''):'<div class="empty"><b>No open times</b>Add availability to let patients book.</div>'}</section></div>`;
  }
  function recordsPage() {
    const u=user(); let records=state.records;
    if(u.role==='PATIENT') records=records.filter(r=>r.patientUserId===u.id);
    if(u.role==='DOCTOR') records=records.filter(r=>r.doctorId===u.doctorId);
    records=records.slice().sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    return `${pageHead(u.role==='PATIENT'?'Medical records':'Patient records',u.role==='PATIENT'?'Visit notes and prescriptions shared with you.':'Records for patients you have seen.')}<section class="panel">${records.length?records.map(r=>`<article class="record-card"><b>${esc(r.diagnosis)}</b><p>${esc(r.notes||'No additional notes.')}</p><small>${esc(r.patientName)} · ${esc(r.doctorName)} · ${fmt(r.createdAt,{month:'short',day:'numeric',year:'numeric'})}</small>${r.medication?`<p><b>Prescription:</b> ${esc(r.medication)}${r.instructions?` — ${esc(r.instructions)}`:''}</p>`:''}</article>`).join(''):'<div class="empty"><b>No medical records yet</b>Completed visit notes and prescriptions will be listed here.</div>'}</section>`;
  }
  function profilePage() {
    const d=doctor(),u=user();
    if(!d)return `${pageHead('My profile','Your account profile.')}<div class="empty"><b>Doctor profile unavailable</b>Sign in with a doctor account to manage a clinical profile.</div>`;
    return `${pageHead('My profile','Keep your public doctor profile up to date.')}<section class="panel"><form id="profile-form"><div class="form-grid"><div class="field"><label>Full name</label><input name="name" required maxlength="120" value="${esc(d.name)}"/></div><div class="field"><label>Email</label><input name="email" type="email" required value="${esc(u.email)}"/></div><div class="field"><label>Specialty</label><select name="specialty">${specialties.map(s=>`<option ${s===d.specialty?'selected':''}>${s}</option>`).join('')}</select></div><div class="field"><label>Experience</label><input name="experience" maxlength="60" value="${esc(d.experience||'')}"/></div><div class="field full"><label>Profile summary</label><textarea name="bio" maxlength="500">${esc(d.bio||'')}</textarea></div></div><div class="form-actions"><button class="btn">Save profile</button></div></form></section>`;
  }
  function usersPage() {
    const rows=state.users.map(u=>`<tr><td><b>${esc(u.name)}</b></td><td>${esc(u.email)}</td><td>${u.role.toLowerCase()}</td><td>${u.active?'Active':'Deactivated'}</td><td>${u.role==='ADMIN'?'<span style="color:#929b94">Protected</span>':`<button class="btn ${u.active?'danger':'secondary'} small" data-action="toggle-user" data-id="${u.id}">${u.active?'Deactivate':'Reactivate'}</button>`}</td></tr>`).join('');
    return `${pageHead('User accounts','Review patient and doctor accounts. Deactivation blocks demo sign-in.')}<section class="panel"><div class="panel-title"><h2>${state.users.length} accounts</h2><button class="btn secondary small" data-action="add-doctor">+ Create doctor account</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }
  function renderContent() {
    if(view==='overview')return overview();
    if(view==='doctors')return doctorDirectory(user().role==='ADMIN');
    if(view==='appointments')return appointmentsPage();
    if(view==='availability')return availabilityPage();
    if(view==='records')return recordsPage();
    if(view==='profile')return profilePage();
    if(view==='users')return usersPage();
    if(view==='booking')return bookingPage();
    if(view==='reschedule')return bookingPage(true);
    if(view==='record-form')return recordFormPage();
    return overview();
  }
  function bookingPage(reschedule=false) {
    const existing=reschedule?state.appointments.find(a=>a.id===selectedAppointmentId):null;
    const d=state.doctors.find(x=>x.id===(existing?.doctorId||window.bookingDoctorId)); if(!d)return doctorDirectory();
    const slots=state.availability.filter(s=>s.doctorId===d.id&&new Date(s.startsAt)>new Date()&&!activeAppointments().some(a=>a.id!==existing?.id&&a.doctorId===d.id&&a.startsAt===s.startsAt)).sort((a,b)=>a.startsAt.localeCompare(b.startsAt));
    return `${pageHead(reschedule?'Reschedule your visit':`Book with ${esc(d.name)}`,`${esc(d.specialty)} · Choose an open time.`,'<button class="btn secondary" data-view="appointments">← Back to appointments</button>')}<section class="panel"><div class="panel-title"><h2>Available appointment times</h2><span>30 minute visit</span></div>${slots.length?`<div class="slot-grid">${slots.map(s=>`<button class="slot-btn" data-action="${reschedule?'reschedule-slot':'book-slot'}" data-id="${s.id}">◷ &nbsp;${fmt(s.startsAt)}</button>`).join('')}</div>`:'<div class="empty"><b>No times currently available</b>Check back later or choose another doctor.</div>'}<p class="modal-note">Appointments can be cancelled or rescheduled at least 24 hours before their start time.</p></section>`;
  }
  function recordFormPage() {
    const a=state.appointments.find(x=>x.id===selectedAppointmentId); if(!a)return appointmentsPage();
    const p=state.users.find(x=>x.id===a.patientUserId); const d=state.doctors.find(x=>x.id===a.doctorId);
    return `${pageHead('Complete visit',`${esc(p?.name||'Patient')} · ${fmt(a.startsAt)}`,'<button class="btn secondary" data-view="appointments">← Back</button>')}<section class="panel"><form id="record-form"><div class="form-grid"><div class="field full"><label for="diagnosis">Diagnosis / visit summary</label><input id="diagnosis" name="diagnosis" required maxlength="300" placeholder="Enter a concise clinical summary"/></div><div class="field full"><label for="notes">Care notes</label><textarea id="notes" name="notes" maxlength="2000" placeholder="Follow-up guidance and notes"></textarea></div><div class="field"><label for="medication">Prescription (optional)</label><input id="medication" name="medication" maxlength="160" placeholder="Medication and dosage"/></div><div class="field"><label for="instructions">Prescription instructions</label><input id="instructions" name="instructions" maxlength="300" placeholder="Frequency and duration"/></div></div><div class="form-actions"><button class="btn">Save record and complete visit</button></div></form><p class="modal-note">Demo records are stored only in this browser. Do not enter real patient information.</p></section>`;
  }
  function authPage() {
    const signup=authMode==='register';
    return `${header()}${notice?`<div class="notice ${notice.type}" style="max-width:990px;margin:18px auto -25px">${esc(notice.message)}</div>`:''}<main class="auth-wrap"><section class="auth-intro"><div class="eyebrow">CARE THAT FITS YOUR LIFE</div><h1>Thoughtful care,<br/>made <em>simpler.</em></h1><p>Find your care team, manage your visits, and keep your health journey moving forward.</p><div class="auth-points"><span>✓ &nbsp;Browse trusted specialists</span><span>✓ &nbsp;Book a time that works for you</span><span>✓ &nbsp;Keep visits together in one place</span></div></section><form class="auth-form" id="auth-form"><div class="eyebrow">${signup?'CREATE AN ACCOUNT':'WELCOME BACK'}</div><h2>${signup?'Join Carepoint.':'Sign in to Carepoint.'}</h2><p>${signup?'Create a patient account to book your first visit.':'Choose a demo account below, or sign in with your account.'}</p>${signup?`<div class="field"><label for="auth-name">Full name</label><input id="auth-name" name="name" required maxlength="120" placeholder="Your name"/></div>`:''}<div class="field"><label for="auth-email">Email address</label><input id="auth-email" name="email" type="email" required placeholder="you@example.com"/></div><div class="field"><label for="auth-password">Password</label><input id="auth-password" name="password" type="password" required minlength="${signup?10:1}" placeholder="${signup?'At least 10 characters':'Your password'}"/></div><button class="btn" style="width:100%;margin-top:4px">${signup?'Create patient account':'Sign in'} →</button><div class="switch-auth">${signup?'Already have an account?':'New to Carepoint?'} <button type="button" data-action="toggle-auth">${signup?'Sign in':'Create account'}</button></div><div class="demo-logins"><b>TRY A DEMO ROLE</b><div class="demo-buttons"><button type="button" data-action="demo-login" data-email="patient@carepoint.demo">Patient</button><button type="button" data-action="demo-login" data-email="avery@carepoint.demo">Doctor</button><button type="button" data-action="demo-login" data-email="admin@carepoint.demo">Administrator</button></div></div></form></main>${footer()}`;
  }
  function footer() { return `<footer class="footer"><span>carepoint. · Interactive software engineering prototype</span><span>Sample data stays in this browser</span></footer>`; }
  function render() {
    if(!user()) { currentUserId=null;sessionStorage.removeItem('carepoint_demo_user');app.innerHTML=authPage(); }
    else app.innerHTML=`<div class="shell">${header()}<main class="layout">${sideNav()}<section class="content">${notice?`<div class="notice ${notice.type}">${esc(notice.message)}</div>`:''}${renderContent()}</section></main>${footer()}</div>`;
  }
  function login(email,password) {
    const u=state.users.find(x=>x.email.toLowerCase()===email.toLowerCase()&&x.password===password&&x.active);
    if(!u){toast('Email or password is incorrect, or the account is inactive.','error');return false;}
    currentUserId=u.id;sessionStorage.setItem('carepoint_demo_user',u.id);view='overview';notice=null;render();return true;
  }
  function bookSlot(slotId) {
    const slot=state.availability.find(s=>s.id===slotId); if(!slot)return;
    if(activeAppointments().some(a=>a.doctorId===slot.doctorId&&a.startsAt===slot.startsAt)){toast('That time was just booked. Choose another slot.','error');render();return;}
    const d=state.doctors.find(x=>x.id===slot.doctorId); const a={id:`appt-${Date.now()}`,patientUserId:user().id,doctorId:d.id,startsAt:slot.startsAt,endsAt:slot.endsAt,status:'CONFIRMED',reason:''};
    state.appointments.push(a);save();view='appointments';toast(`Appointment booked with ${d.name}.`);
  }
  function rescheduleSlot(slotId) {
    const a=state.appointments.find(x=>x.id===selectedAppointmentId),slot=state.availability.find(s=>s.id===slotId);
    if(!a||!slot)return;
    if(a.patientUserId!==user().id||a.status!=='CONFIRMED'||new Date(a.startsAt)-Date.now()<86400000){toast('This appointment can no longer be rescheduled.','error');view='appointments';render();return;}
    if(activeAppointments().some(x=>x.id!==a.id&&x.doctorId===a.doctorId&&x.startsAt===slot.startsAt)){toast('That time was just booked. Choose another slot.','error');render();return;}
    a.startsAt=slot.startsAt;a.endsAt=slot.endsAt;save();selectedAppointmentId=null;view='appointments';toast('Appointment rescheduled successfully.');
  }
  function cancelAppointment(id,admin=false) {
    const a=state.appointments.find(x=>x.id===id); if(!a)return;
    if(!admin&&new Date(a.startsAt)-Date.now()<86400000){toast('Cancellation is available until 24 hours before the visit.','error');return;}
    if(!['CONFIRMED','PENDING'].includes(a.status)){toast('Only active appointments can be cancelled.','error');return;}
    a.status='CANCELLED';save();toast('Appointment cancelled. The time is available again.');
  }
  function addDoctor() {
    modalRoot.innerHTML=`<div class="modal-bg" data-action="close-modal"><section class="modal" onclick="event.stopPropagation()"><button class="modal-close" data-action="close-modal">×</button><div class="eyebrow">ADMINISTRATOR</div><h2>Create doctor account</h2><form id="doctor-form"><div class="field"><label>Full name</label><input name="name" required maxlength="120"/></div><div class="field" style="margin-top:10px"><label>Email</label><input name="email" type="email" required/></div><div class="field" style="margin-top:10px"><label>Specialty</label><select name="specialty">${specialties.map(s=>`<option>${s}</option>`).join('')}</select></div><div class="field" style="margin-top:10px"><label>Temporary password</label><input name="password" required minlength="8" value="doctor123"/></div><div class="field" style="margin-top:10px"><label>Profile summary</label><textarea name="bio" maxlength="500"></textarea></div><div class="form-actions"><button class="btn">Create doctor</button></div></form><p class="modal-note">A starter availability schedule will be generated for the next two weeks.</p></section></div>`;
  }
  function editDoctor(id) {
    const d=state.doctors.find(x=>x.id===id);if(!d)return;
    modalRoot.innerHTML=`<div class="modal-bg" data-action="close-modal"><section class="modal" onclick="event.stopPropagation()"><button class="modal-close" data-action="close-modal">×</button><div class="eyebrow">DOCTOR PROFILE</div><h2>Edit profile</h2><form id="edit-doctor-form" data-id="${d.id}"><div class="field"><label>Full name</label><input name="name" required maxlength="120" value="${esc(d.name)}"/></div><div class="field" style="margin-top:10px"><label>Email</label><input name="email" type="email" required value="${esc(d.email)}"/></div><div class="field" style="margin-top:10px"><label>Specialty</label><select name="specialty">${specialties.map(s=>`<option ${s===d.specialty?'selected':''}>${s}</option>`).join('')}</select></div><div class="field" style="margin-top:10px"><label>Profile summary</label><textarea name="bio" maxlength="500">${esc(d.bio||'')}</textarea></div><div class="form-actions"><button class="btn">Save changes</button></div></form></section></div>`;
  }
  function saveDoctorProfile(form, doctorId) {
    const d=state.doctors.find(x=>x.id===doctorId);if(!d)return;const data=new FormData(form),email=String(data.get('email')).trim().toLowerCase();
    if(state.users.some(u=>u.id!==d.userId&&u.email.toLowerCase()===email)){toast('That email is already used by another account.','error');return;}
    d.name=String(data.get('name')).trim();d.email=email;d.specialty=String(data.get('specialty'));d.bio=String(data.get('bio')).trim();d.experience=String(data.get('experience')||d.experience||'');
    const account=state.users.find(x=>x.id===d.userId);if(account){account.name=d.name;account.email=email;}
    save();modalRoot.innerHTML='';toast('Doctor profile updated.');render();
  }
  function addDoctorSubmit(form) {
    const data=new FormData(form);const email=String(data.get('email')).trim().toLowerCase();
    if(state.users.some(u=>u.email.toLowerCase()===email)){toast('That email already has an account.','error');return;}
    const id=`user-${Date.now()}`,doctorId=`doc-${Date.now()}`;const name=String(data.get('name')).trim();
    state.users.push({id,name,email,password:String(data.get('password')),role:'DOCTOR',doctorId,active:true});
    state.doctors.push({id:doctorId,userId:id,name,email,specialty:String(data.get('specialty')),bio:String(data.get('bio')),experience:'New profile'});
    for(let day=2;day<15;day++)for(const [hour,minute]of[[9,30],[10,30],[13,0],[14,0]]){const startsAt=datePlus(day,hour,minute),end=new Date(startsAt);end.setMinutes(end.getMinutes()+30);state.availability.push({id:`${doctorId}-${day}-${hour}-${minute}`,doctorId,startsAt,endsAt:end.toISOString()});}
    save();modalRoot.innerHTML='';toast('Doctor profile and demo account created.');render();
  }
  function addAvailability(form) {
    const data=new FormData(form),[year,month,day]=String(data.get('date')).split('-').map(Number),[hour,minute]=String(data.get('time')).split(':').map(Number);const start=new Date(year,month-1,day,hour,minute,0,0);
    if(start<=new Date()){toast('Choose a future date and time.','error');return;}
    const d=doctor();const end=new Date(start);end.setMinutes(end.getMinutes()+30);
    const overlaps=state.availability.some(s=>s.doctorId===d.id&&new Date(start)<new Date(s.endsAt)&&new Date(end)>new Date(s.startsAt));
    const booked=activeAppointments().some(a=>a.doctorId===d.id&&new Date(start)<new Date(a.endsAt)&&new Date(end)>new Date(a.startsAt));
    if(overlaps||booked){toast('That time overlaps an existing slot or appointment.','error');return;}
    state.availability.push({id:`${d.id}-${Date.now()}`,doctorId:d.id,startsAt:start.toISOString(),endsAt:end.toISOString()});save();toast('Availability published.');render();
  }
  function saveRecord(form) {
    const a=state.appointments.find(x=>x.id===selectedAppointmentId);if(!a)return;const d=state.doctors.find(x=>x.id===a.doctorId),p=state.users.find(x=>x.id===a.patientUserId),data=new FormData(form);
    state.records.push({id:`record-${Date.now()}`,appointmentId:a.id,doctorId:d.id,patientUserId:p.id,patientName:p.name,doctorName:d.name,diagnosis:String(data.get('diagnosis')).trim(),notes:String(data.get('notes')).trim(),medication:String(data.get('medication')).trim(),instructions:String(data.get('instructions')).trim(),createdAt:new Date().toISOString()});
    a.status='COMPLETED';save();selectedAppointmentId=null;view='appointments';toast('Visit completed and record saved.');
  }
  function toggleUser(id) { const u=state.users.find(x=>x.id===id);if(!u||u.role==='ADMIN')return;u.active=!u.active;save();toast(`${u.name} ${u.active?'reactivated':'deactivated'}.`);render(); }
  function removeSlot(id) { const slot=state.availability.find(x=>x.id===id);if(!slot)return;if(activeAppointments().some(a=>a.doctorId===slot.doctorId&&a.startsAt===slot.startsAt)){toast('A booked appointment uses this time.','error');return;}state.availability=state.availability.filter(x=>x.id!==id);save();toast('Availability removed.');render(); }

  document.addEventListener('click',event=>{
    const viewButton=event.target.closest('[data-view]');if(viewButton){view=viewButton.dataset.view;notice=null;render();return;}
    const button=event.target.closest('[data-action]');if(!button)return;const action=button.dataset.action,id=button.dataset.id;
    if(action==='logout'){currentUserId=null;sessionStorage.removeItem('carepoint_demo_user');view='overview';notice=null;render();}
    else if(action==='toggle-auth'){authMode=authMode==='login'?'register':'login';render();}
    else if(action==='demo-login'){const email=button.dataset.email,u=state.users.find(x=>x.email===email);login(email,u?.password||'');}
    else if(action==='search-doctors'){query=document.getElementById('doctor-query')?.value||'';filterSpecialty=document.getElementById('specialty-filter')?.value||'';render();}
    else if(action==='book-doctor'){window.bookingDoctorId=id;view=user().role==='PATIENT'?'booking':'doctors';if(user().role!=='PATIENT')toast('Switch to a patient account to book a visit.');else render();}
    else if(action==='edit-doctor')editDoctor(id);
    else if(action==='book-slot')bookSlot(id);
    else if(action==='reschedule'){const a=state.appointments.find(x=>x.id===id);if(!a||new Date(a.startsAt)-Date.now()<86400000){toast('Rescheduling is available until 24 hours before the visit.','error');return;}selectedAppointmentId=id;view='reschedule';render();}
    else if(action==='reschedule-slot')rescheduleSlot(id);
    else if(action==='cancel')cancelAppointment(id,false);
    else if(action==='cancel-admin')cancelAppointment(id,true);
    else if(action==='record'){selectedAppointmentId=id;view='record-form';render();}
    else if(action==='add-doctor')addDoctor();
    else if(action==='close-modal'){modalRoot.innerHTML='';}
    else if(action==='toggle-user')toggleUser(id);
    else if(action==='remove-slot')removeSlot(id);
    else if(action==='reset-demo'){if(window.confirm('Reset all prototype changes in this browser?')){localStorage.removeItem(STORE);state=seed();save();currentUserId=null;sessionStorage.removeItem('carepoint_demo_user');notice=null;view='overview';render();}}
  });
  document.addEventListener('submit',event=>{
    if(event.target.id==='auth-form'){event.preventDefault();const data=new FormData(event.target);if(authMode==='login')login(String(data.get('email')),String(data.get('password')));else{const email=String(data.get('email')).trim().toLowerCase();if(state.users.some(u=>u.email.toLowerCase()===email)){toast('An account already uses that email.','error');return;}const id=`user-${Date.now()}`;state.users.push({id,name:String(data.get('name')).trim(),email,password:String(data.get('password')),role:'PATIENT',active:true});save();login(email,String(data.get('password')));}}
    else if(event.target.id==='availability-form'){event.preventDefault();addAvailability(event.target);}
    else if(event.target.id==='record-form'){event.preventDefault();saveRecord(event.target);}
    else if(event.target.id==='doctor-form'){event.preventDefault();addDoctorSubmit(event.target);}
    else if(event.target.id==='edit-doctor-form'){event.preventDefault();saveDoctorProfile(event.target,event.target.dataset.id);}
    else if(event.target.id==='profile-form'){event.preventDefault();saveDoctorProfile(event.target,doctor()?.id);}
  });
  render();
})();
