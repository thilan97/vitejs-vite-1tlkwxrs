// ═══════════════════════════════════════════════
// PHẦN 1/6 — Xóa hết App.tsx, paste cái này vào đầu
// ═══════════════════════════════════════════════
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://uzloxzrqtzuucxlokqfm.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bG94enJxdHp1dWN4bG9rcWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODAwOTYsImV4cCI6MjA5MTA1NjA5Nn0.INA68j0bmDb7kFtn4H3TiQmPzEqs67sKMsBhc--mvvo'
const db = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── THEME ────────────────────────────────────────
const T: any = {
  gold:'#C4973A', goldBg:'#FFFAEE', goldText:'#7A5A10', goldBorder:'#E5CFA0',
  sidebar:'#16120E', bg:'#FDFCF8', card:'#FFFFFF',
  dark:'#1A1614', med:'#6B5F50', light:'#A09080', border:'#EDE8DF',
  green:'#15803D', greenBg:'#DCFCE7',
  amber:'#B45309', amberBg:'#FEF9C3',
  red:'#B91C1C', redBg:'#FEE2E2',
  blue:'#1D4ED8', blueBg:'#DBEAFE',
  purple:'#7C3AED', purpleBg:'#EDE9FE',
  teal:'#0F766E', tealBg:'#CCFBF1',
  gray:'#6B7280', grayBg:'#F3F4F6',
}

const DEPT_COLOR: any = { kho:'#1A56A8', sale:'#15803D', vp:'#C2410C', all:'#6B7280' }
const DEPT_NAME: any  = { kho:'Kho', sale:'Sale', vp:'Văn phòng', all:'Tất cả' }
const SCHEDULE: any = {
  kho:  { in:'08:30', breakStart:'12:30', breakEnd:'13:30', out:'17:30' },
  sale: { in:'08:00', breakStart:'12:30', breakEnd:'14:00', out:'17:00' },
  vp:   { in:'08:00', breakStart:'12:30', breakEnd:'14:00', out:'17:00' },
}
const STATUS_CFG: any = {
  done:    { label:'✅ Hoàn thành', color:T.green, bg:T.greenBg },
  doing:   { label:'⏳ Đang làm',  color:T.amber, bg:T.amberBg },
  notyet:  { label:'❌ Chưa làm', color:T.gray,  bg:T.grayBg  },
  blocked: { label:'⚠️ Bị block', color:T.red,   bg:T.redBg   },
}
const ATT_STATUS: any = {
  present: { label:'✅ Có mặt',    color:T.green,  bg:T.greenBg  },
  late:    { label:'⏰ Đi muộn',   color:T.amber,  bg:T.amberBg  },
  absent:  { label:'❌ Vắng',      color:T.red,    bg:T.redBg    },
  sick:    { label:'🏥 Nghỉ bệnh', color:T.purple, bg:T.purpleBg },
  leave:   { label:'🏖️ Nghỉ phép', color:T.blue,   bg:T.blueBg   },
  half:    { label:'🌓 Nửa ngày',  color:T.teal,   bg:T.tealBg   },
}
const LEAVE_TYPE: any = {
  annual:'Nghỉ phép năm', sick:'Nghỉ bệnh', personal:'Việc cá nhân', unpaid:'Nghỉ không lương', half:'Nghỉ nửa ngày',
  half:'Nghỉ nửa ngày'
}
const FREQ_COLOR: any = {
  'Hàng ngày':  { color:'#1D4ED8', bg:'#DBEAFE' },
  'Hàng tuần':  { color:'#15803D', bg:'#DCFCE7' },
  'Hàng tháng': { color:'#B45309', bg:'#FEF3C7' },
}
const PRI_CFG: any = {
  high: { label:'🔴 Cao',   color:T.red,   bg:T.redBg   },
  mid:  { label:'🟡 TB',    color:T.amber, bg:T.amberBg },
  low:  { label:'🟢 Thấp', color:T.green, bg:T.greenBg },
}

// ── PERMISSION SYSTEM ────────────────────────────
const getPerm = (user: any) => {
  const pos = user?.position || {}
  const isAdmin = pos.perm_view_all_dashboard ?? false
  return {
    viewDeptChecklist:  isAdmin || (pos.perm_view_dept_checklist  ?? false),
    viewAllChecklist:   isAdmin || (pos.perm_view_all_checklist   ?? false),
    createTask:         isAdmin || (pos.perm_create_task          ?? false),
    manageTemplate:     isAdmin || (pos.perm_manage_template      ?? false),
    markAttendance:     isAdmin || (pos.perm_mark_attendance      ?? false),
    markPeerAttendance: isAdmin || (pos.perm_mark_peer_attendance ?? false),
    approveLeave:       isAdmin || (pos.perm_approve_leave        ?? false),
    approveOT:          isAdmin || (pos.perm_approve_ot           ?? false),
    viewAllAttendance:  isAdmin || (pos.perm_view_all_attendance  ?? false),
    manageUsers:        pos.perm_manage_users         ?? false,
    managePositions:    pos.perm_manage_positions     ?? false,
    announceAll:        isAdmin || (pos.perm_announce_all         ?? false),
    viewAllDashboard:   isAdmin,
    resetChecklist:     isAdmin || (pos.perm_reset_checklist      ?? false),
  }
}

const canMarkFor = (actor: any, target: any, allUsers: any[]) => {
  const perm = getPerm(actor)
  if (perm.viewAllDashboard) return true
  if (perm.markAttendance && actor.dept_id === target.dept_id) return true
  if (perm.markPeerAttendance) {
    const actorPos = actor.position_id
    const targetPos = target.position_id
    const actorReports = actor.position?.reports_to
    const targetReports = target.position?.reports_to
    if (actorReports && targetReports && actorReports === targetReports && actorPos !== targetPos) return true
  }
  return false
}
const ALL_PERMS = [
  { key:'perm_view_dept_checklist',  label:'Xem checklist phòng mình',       group:'Công việc' },
  { key:'perm_view_all_checklist',   label:'Xem checklist toàn công ty',      group:'Công việc' },
  { key:'perm_create_task',          label:'Tạo & giao task',                 group:'Công việc' },
  { key:'perm_manage_template',      label:'Quản lý template checklist',      group:'Công việc' },
  { key:'perm_mark_attendance',      label:'Chấm công phòng mình',            group:'Nhân sự'   },
  { key:'perm_mark_peer_attendance', label:'Chấm công đồng cấp',             group:'Nhân sự'   },
  { key:'perm_approve_leave',        label:'Duyệt nghỉ phép',                group:'Nhân sự'   },
  { key:'perm_approve_ot',           label:'Duyệt OT',                       group:'Nhân sự'   },
  { key:'perm_view_all_attendance',  label:'Xem chấm công toàn công ty',     group:'Nhân sự'   },
  { key:'perm_manage_users',         label:'Quản lý nhân viên',              group:'Quản trị'  },
  { key:'perm_manage_positions',     label:'Quản lý vị trí & quyền',         group:'Quản trị'  },
  { key:'perm_announce_all',         label:'Đăng thông báo toàn công ty',    group:'Quản trị'  },
  { key:'perm_view_all_dashboard',   label:'Xem dashboard toàn công ty',     group:'Quản trị'  },
  { key:'perm_reset_checklist',      label:'Reset checklist',                 group:'Quản trị'  },
]
// ── UTILITIES ────────────────────────────────────
const fmtNow   = () => new Date().toLocaleString('vi-VN',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit',year:'numeric'})
const todayStr = () => new Date().toLocaleDateString('vi-VN')
const todayISO = () => new Date().toISOString().split('T')[0]
const fmtDate  = (d: string) => { try { return new Date(d).toLocaleDateString('vi-VN') } catch { return d } }
const isOverdue = (item: any) => {
  if (!item || item.status === 'done') return false
  const dl = item.deadline; if (!dl) return false
  if (dl.includes('-')) return new Date(dl) < new Date(new Date().toDateString())
  const now = new Date(), [h, m] = dl.split(':').map(Number)
  const due = new Date(now); due.setHours(h, m, 0); return now > due
}
const daysBetween = (a: string, b: string) => {
  try { return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000) + 1 } catch { return 1 }
}
const calcHours = (start: string, end: string) => {
  try {
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    return Math.round(((eh*60+em)-(sh*60+sm))/60*10)/10
  } catch { return 0 }
}
const useWindowWidth = () => {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

// ── LOGO ─────────────────────────────────────────
const LALogo = ({ size = 38 }: any) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    <circle cx="40" cy="40" r="37" stroke={T.gold} strokeWidth="1.8"/>
    <circle cx="40" cy="40" r="32" stroke={T.gold} strokeWidth="0.6" opacity="0.45"/>
    <text x="11" y="56" fontFamily="Georgia,serif" fontSize="40" fontStyle="italic" fill={T.gold}>L</text>
    <text x="36" y="54" fontFamily="Georgia,serif" fontSize="35" fontStyle="italic" fill={T.gold}>A</text>
  </svg>
)

// ── SHARED COMPONENTS ────────────────────────────
const Badge = ({ type, cfg, small }: any) => {
  const c = cfg || STATUS_CFG[type] || ATT_STATUS[type] || PRI_CFG[type] || {}
  return <span style={{ display:'inline-block', fontSize:small?10:11, fontWeight:600,
    padding:small?'2px 7px':'3px 9px', borderRadius:20, color:c.color, background:c.bg, whiteSpace:'nowrap' }}>
    {c.label}
  </span>
}

const Av = ({ u, size = 32, showDept = false, showTitle = false }: any) => (
  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
    <div style={{ width:size, height:size, borderRadius:'50%',
      background:DEPT_COLOR[u?.dept_id]||T.gold, flexShrink:0,
      display:'flex', alignItems:'center', justifyContent:'center',
      color:'#fff', fontSize:size>36?13:10, fontWeight:700 }}>
      {u?.ini||'?'}
    </div>
    {(showDept||showTitle) && <div>
      <div style={{ fontSize:13, fontWeight:500, color:T.dark }}>{u?.name}</div>
      {showTitle && u?.position_name && <div style={{ fontSize:10, color:T.gold, fontWeight:600 }}>{u.position_name}</div>}
      {showDept && !showTitle && <div style={{ fontSize:11, color:T.light }}>{u?.dept_name||''}</div>}
    </div>}
  </div>
)

const Card = ({ children, style }: any) => (
  <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:'18px 22px', ...style }}>
    {children}
  </div>
)

const GoldBtn = ({ onClick, children, small, outline, danger, disabled }: any) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: danger?T.red:outline?'transparent':T.gold,
    color: (danger||!outline)?'#fff':T.gold,
    border:`1.5px solid ${danger?T.red:T.gold}`,
    borderRadius:8, padding:small?'6px 13px':'8px 18px',
    fontSize:small?12:13, fontWeight:600,
    cursor:disabled?'not-allowed':'pointer',
    fontFamily:'inherit', opacity:disabled?0.5:1,
  }}>{children}</button>
)

const Modal = ({ open, onClose, title, children, wide }: any) => {
  if (!open) return null
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:16, padding:'24px 28px',
        width:'100%', maxWidth:wide?680:480, maxHeight:'88vh', overflowY:'auto' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <h3 style={{ margin:0, color:T.dark, fontSize:16, fontWeight:700 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:T.light }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

const Inp = ({ label, value, onChange, type='text', placeholder, min, max, disabled }: any) => (
  <div style={{ marginBottom:13 }}>
    {label && <div style={{ fontSize:12, fontWeight:500, color:T.med, marginBottom:5 }}>{label}</div>}
    <input type={type} value={value} min={min} max={max} disabled={disabled}
      onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width:'100%', padding:'8px 11px', border:`1px solid ${T.border}`, borderRadius:8,
        fontSize:13, fontFamily:'inherit', color:T.dark, background:disabled?T.bg:'#fff',
        boxSizing:'border-box', outline:'none', opacity:disabled?0.6:1 }}/>
  </div>
)

const Sel = ({ label, value, onChange, options, disabled }: any) => (
  <div style={{ marginBottom:13 }}>
    {label && <div style={{ fontSize:12, fontWeight:500, color:T.med, marginBottom:5 }}>{label}</div>}
    <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
      style={{ width:'100%', padding:'8px 11px', border:`1px solid ${T.border}`, borderRadius:8,
        fontSize:13, fontFamily:'inherit', color:T.dark, background:T.bg, outline:'none', cursor:'pointer' }}>
      {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
)

const TH = ({ cols }: any) => (
  <thead><tr style={{ background:T.bg }}>
    {cols.map((h: string, i: number) => (
      <th key={i} style={{ padding:'10px 13px', textAlign:'left', fontSize:10, fontWeight:600,
        color:T.light, textTransform:'uppercase', letterSpacing:.5,
        borderBottom:`1px solid ${T.border}` }}>{h}</th>
    ))}
  </tr></thead>
)

const Topbar = ({ title, subtitle, action, mobile }: any) => (
  <div style={{ padding:mobile?'16px 16px 0':'20px 24px 0',
    display:'flex', alignItems:'flex-start', justifyContent:'space-between',
    marginBottom:18, flexWrap:'wrap', gap:10 }}>
    <div>
      <h1 style={{ margin:0, fontSize:mobile?18:20, fontWeight:700, color:T.dark }}>{title}</h1>
      {subtitle && <div style={{ color:T.light, fontSize:12, marginTop:3 }}>{subtitle}</div>}
    </div>
    {action}
  </div>
)

// ── IN-APP ALERT BANNER ──────────────────────────
const AlertBanner = ({ user, checklist, leaveRequests, otRequests, allUsers }: any) => {
  const perm = getPerm(user)
  const dids = allUsers.filter((u: any) => u.dept_id === user.dept_id).map((u: any) => u.id)
  const overdueItems = checklist.filter((c: any) => c.assignee_id === user.id && isOverdue(c))
  const pendingLeave = leaveRequests.filter((r: any) => {
    if (r.status !== 'pending') return false
    if (perm.viewAllDashboard) return true
    if (perm.approveLeave) return dids.includes(r.user_id) && !['pending_admin','approved','rejected'].includes(r.status)
    return false
  })
  const pendingOT = (otRequests||[]).filter((r: any) => {
    if (r.status !== 'pending') return false
    if (perm.viewAllDashboard) return true
    if (perm.approveOT) return dids.includes(r.user_id)
    return false
  })
  const alerts = [
    ...overdueItems.map((c: any) => ({ msg:`⚠️ Trễ deadline: ${c.title}`, color:T.red, bg:T.redBg })),
    ...pendingLeave.map((r: any) => {
      const u = allUsers.find((u: any) => u.id === r.user_id)
      return { msg:`🏖️ ${u?.name} xin nghỉ ${r.days} ngày — chờ duyệt`, color:T.amber, bg:T.amberBg }
    }),
    ...pendingOT.map((r: any) => {
      const u = allUsers.find((u: any) => u.id === r.user_id)
      return { msg:`⏰ ${u?.name} đăng ký OT ${fmtDate(r.date)} — chờ duyệt`, color:T.blue, bg:T.blueBg }
    }),
  ]
  if (alerts.length === 0) return null
  return (
    <div style={{ margin:'0 0 14px', display:'flex', flexDirection:'column', gap:6 }}>
      {alerts.slice(0,3).map((a, i) => (
        <div key={i} style={{ padding:'8px 14px', borderRadius:8, fontSize:12, fontWeight:500,
          color:a.color, background:a.bg }}>{a.msg}</div>
      ))}
      {alerts.length > 3 && <div style={{ fontSize:11, color:T.light }}>+{alerts.length-3} thông báo khác...</div>}
    </div>
  )
}

// ══ KẾT THÚC PHẦN 1 — Paste tiếp Phần 2 bên dưới ══
// ═══════════════════════════════════════════════
// PHẦN 2/6 — Paste nối tiếp bên dưới Phần 1
// ═══════════════════════════════════════════════

// ── LOGIN SCREEN ─────────────────────────────────
function LoginScreen({ onLogin }: any) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [mustChange, setMustChange]   = useState(false)
const [pendingUser, setPendingUser] = useState<any>(null)
const [newPass, setNewPass]         = useState('')
const [confirmPass, setConfirmPass] = useState('')
const handleLogin = async () => {
  if (!username.trim() || !password.trim()) { setError('Vui lòng nhập đầy đủ thông tin'); return }
  setLoading(true); setError('')
  try {
    const { data, error: qErr } = await db.from('users').select('*')

    if (qErr) { setError('Lỗi kết nối: ' + qErr.message); setLoading(false); return }
    if (!data || data.length === 0) { setError('Không có dữ liệu users'); setLoading(false); return }

    const found = data.find((u: any) => u.ini?.toUpperCase() === username.trim().toUpperCase())
    if (!found) { setError(`Không tìm thấy ini="${username.trim().toUpperCase()}" trong ${data.length} users`); setLoading(false); return }
    if (found.pin !== password) { setError('Mật khẩu không đúng'); setLoading(false); return }

    let posData = null
    if (found.position_id) {
      const { data: pos } = await db.from('positions').select('*').eq('id', found.position_id).single()
      posData = pos
    }

    const { data: depts } = await db.from('departments').select('*')
    const dept = depts?.find((d: any) => d.id === found.dept_id)

    const userObj = {
      ...found,
      dept_name: dept?.name || '',
      position: posData,
      position_name: posData?.name || '',
      must_change_password: found.must_change_password ?? false,
    }

    if (found.pin === '1234' || found.must_change_password === true) {
      setPendingUser(userObj); setMustChange(true); setLoading(false); return
    }
    localStorage.setItem('la_user', JSON.stringify(userObj))
onLogin(userObj)
  } catch(e: any) {
    setError('Lỗi: ' + (e?.message || JSON.stringify(e)))
  }
  setLoading(false)
}
    
 if (mustChange && pendingUser) return (
    <ChangePasswordScreen user={pendingUser} onDone={(newPin: string) => {
      onLogin({...pendingUser, pin: newPin, must_change_password: false})
    }}/>
  )
  return (
    <div style={{ minHeight:'100vh', background:'#16120E', display:'flex',
      flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ textAlign:'center', marginBottom:40 }}>
        <LALogo size={72}/>
        <div style={{ color:T.gold, fontSize:22, fontFamily:'Georgia,serif', marginTop:14, letterSpacing:2 }}>LA Global Beauty</div>
        <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12, marginTop:6 }}>Hệ thống quản lý nội bộ</div>
      </div>

      <div style={{ width:'100%', maxWidth:360, background:'rgba(255,255,255,0.05)',
        border:'1px solid rgba(196,151,58,0.25)', borderRadius:16, padding:'28px 28px' }}>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.5)', marginBottom:6 }}>Tên đăng nhập</div>
          <input value={username} onChange={e => setUsername(e.target.value)}
            placeholder="Nhập username..."
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width:'100%', padding:'10px 13px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)',
              background:'rgba(255,255,255,0.08)', color:'#fff', fontSize:14, fontFamily:'inherit',
              outline:'none', boxSizing:'border-box' }}/>
        </div>

        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.5)', marginBottom:6 }}>Mật khẩu</div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu..."
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width:'100%', padding:'10px 13px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)',
              background:'rgba(255,255,255,0.08)', color:'#fff', fontSize:14, fontFamily:'inherit',
              outline:'none', boxSizing:'border-box' }}/>
        </div>

        {error && <div style={{ color:'#F87171', fontSize:12, marginBottom:14, textAlign:'center' }}>{error}</div>}

        <button onClick={handleLogin} disabled={loading}
          style={{ width:'100%', padding:'11px', borderRadius:8, border:'none',
            background:T.gold, color:'#fff', fontSize:14, fontWeight:700,
            cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', opacity:loading?0.7:1 }}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <div style={{ textAlign:'center', marginTop:14, fontSize:11, color:'rgba(255,255,255,0.25)' }}>
          Lần đầu đăng nhập: dùng mật khẩu mặc định <span style={{ color:T.gold }}>1234</span>
        </div>
      </div>
    </div>
  )
}

// ── CHANGE PASSWORD (lần đầu) ─────────────────────
function ChangePasswordScreen({ user, onDone }: any) {
  const [newPw, setNewPw]       = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [error, setError]       = useState('')
  const [saving, setSaving]     = useState(false)

  const handleChange = async () => {
    if (newPw.length < 6) { setError('Mật khẩu phải từ 6 ký tự!'); return }
    if (newPw !== confirmPw) { setError('Xác nhận mật khẩu không khớp!'); return }
    if (newPw === '1234') { setError('Không được dùng mật khẩu mặc định!'); return }
    setSaving(true)
    await db.from('users').update({ pin: newPw, must_change_password: false }).eq('id', user.id)
    setSaving(false)
    localStorage.setItem('la_user', JSON.stringify({...user, pin: newPw, must_change_password: false}))
onDone(newPw)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#16120E', display:'flex',
      flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ textAlign:'center', marginBottom:32 }}>
        <LALogo size={56}/>
        <div style={{ color:T.gold, fontSize:18, fontFamily:'Georgia,serif', marginTop:12 }}>LA Global Beauty</div>
      </div>
      <div style={{ width:'100%', maxWidth:360, background:'rgba(255,255,255,0.05)',
        border:`1px solid ${T.gold}55`, borderRadius:16, padding:'28px' }}>
        <div style={{ color:T.gold, fontSize:15, fontWeight:700, marginBottom:6 }}>🔐 Đổi mật khẩu lần đầu</div>
        <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12, marginBottom:20, lineHeight:1.6 }}>
          Xin chào <span style={{ color:'#fff', fontWeight:600 }}>{user.name}</span>!<br/>
          Vui lòng đổi mật khẩu trước khi sử dụng.
        </div>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginBottom:6 }}>Mật khẩu mới (tối thiểu 6 ký tự)</div>
          <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
            placeholder="Nhập mật khẩu mới..."
            style={{ width:'100%', padding:'10px 13px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)',
              background:'rgba(255,255,255,0.08)', color:'#fff', fontSize:14, fontFamily:'inherit',
              outline:'none', boxSizing:'border-box' }}/>
        </div>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginBottom:6 }}>Xác nhận mật khẩu</div>
          <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
            placeholder="Nhập lại mật khẩu..."
            onKeyDown={e => e.key === 'Enter' && handleChange()}
            style={{ width:'100%', padding:'10px 13px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)',
              background:'rgba(255,255,255,0.08)', color:'#fff', fontSize:14, fontFamily:'inherit',
              outline:'none', boxSizing:'border-box' }}/>
        </div>
        {error && <div style={{ color:'#F87171', fontSize:12, marginBottom:12 }}>{error}</div>}
        <button onClick={handleChange} disabled={saving}
          style={{ width:'100%', padding:'11px', borderRadius:8, border:'none',
            background:T.gold, color:'#fff', fontSize:14, fontWeight:700,
            cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', opacity:saving?0.7:1 }}>
          {saving ? 'Đang lưu...' : 'Xác nhận đổi mật khẩu'}
        </button>
      </div>
    </div>
  )
}

// ── NAVIGATION ───────────────────────────────────
// ── NAV GROUPS (5 nhóm chính) ────────────────────
const NAV_GROUPS = (perm: any, deptId = '') => {
  const hasDashboard  = perm.viewAllDashboard || perm.viewDeptChecklist
  const hasAttendance = perm.markAttendance || perm.markPeerAttendance || perm.viewAllAttendance
  const hasShortage   = deptId === 'sale' || perm.viewAllDashboard
  const hasManage     = perm.manageUsers || perm.managePositions || perm.manageTemplate ||
                        perm.announceAll || perm.viewAllDashboard || perm.resetChecklist

  const groups = [
    hasDashboard && {
      id:'dashboard', icon:'📊', label:'Tổng quan',
      pages:[{ id:'dashboard', icon:'📊', label:'Dashboard' }]
    },
    {
      id:'work', icon:'✅', label:'Công việc',
      pages:[
        { id:'checklist',  icon:'✅', label:'Checklist'  },
        { id:'tasks',      icon:'📌', label:'Giao việc'  },
        perm.manageTemplate && { id:'templates', icon:'📋', label:'Template' },
        { id:'history',    icon:'🗂️', label:'Lịch sử'   },
      ].filter(Boolean)
    },
    hasAttendance && {
      id:'hr', icon:'👥', label:'Nhân sự',
      pages:[
        { id:'attendance', icon:'🕐', label:'Chấm công' },
        { id:'overtime',   icon:'⏰', label:'Làm thêm'  },
        { id:'leave',      icon:'🏖️', label:'Nghỉ phép' },
      ]
    },
    !hasAttendance && {
      id:'hr', icon:'👥', label:'Nhân sự',
      pages:[
        { id:'overtime',   icon:'⏰', label:'Làm thêm'  },
        { id:'leave',      icon:'🏖️', label:'Nghỉ phép' },
      ]
    },
    hasShortage && {
      id:'shortage', icon:'📦', label:'Hàng thiếu',
      pages:[{ id:'shortage', icon:'📦', label:'Hàng thiếu' }]
    },
    {
      id:'manage', icon:'⚙️', label:'Quản lý',
      pages:[
        { id:'announce',  icon:'📣', label:'Thông báo'  },
        { id:'orgchart',  icon:'🏢', label:'Sơ đồ'      },
        perm.manageUsers     && { id:'users',     icon:'👥', label:'Nhân viên' },
        perm.managePositions && { id:'positions',  icon:'🎯', label:'Vị trí'   },
        { id:'settings',  icon:'⚙️', label:'Cài đặt'   },
      ].filter(Boolean)
    },
  ].filter(Boolean) as any[]

  return groups
}

// For backward compat — flat list of all accessible page IDs
const getNav = (perm: any, deptId = '') => {
  return NAV_GROUPS(perm, deptId).flatMap((g: any) => g.pages)
}

// Get group for a page
const getGroupForPage = (pageId: string, perm: any, deptId = '') => {
  const groups = NAV_GROUPS(perm, deptId)
  return groups.find((g: any) => g.pages.some((p: any) => p.id === pageId))
}

function Sidebar({ user, page, setPage, onLogout, pendingLeave, pendingOT }: any) {
  const perm   = getPerm(user)
  const groups = NAV_GROUPS(perm, user?.dept_id||'')
  const activeGroup = getGroupForPage(page, perm, user?.dept_id||'')

  return (
    <div style={{ width:220, background:T.sidebar, display:'flex', flexDirection:'column',
      flexShrink:0, height:'100vh', position:'sticky', top:0 }}>
      {/* Logo */}
      <div style={{ padding:'16px 14px 12px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <LALogo size={30}/>
          <div style={{ color:T.gold, fontSize:11, fontFamily:'Georgia,serif', lineHeight:1.4, letterSpacing:.5 }}>
            LA Global<br/>Beauty
          </div>
        </div>
      </div>
      {/* Groups */}
      <nav style={{ flex:1, padding:'6px', overflowY:'auto' }}>
        {groups.map((group: any) => {
          const isActiveGroup = activeGroup?.id === group.id
          const groupBadge = group.id==='hr' ? pendingLeave+pendingOT : 0
          return (
            <div key={group.id} style={{ marginBottom:4 }}>
              {/* Group header */}
              <div style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 8px 4px',
                fontSize:10, fontWeight:700, color:isActiveGroup?T.gold:'rgba(255,255,255,0.3)',
                textTransform:'uppercase', letterSpacing:.8 }}>
                <span>{group.icon}</span>
                <span style={{ flex:1 }}>{group.label}</span>
                {groupBadge>0 && <span style={{ background:T.red, color:'#fff', borderRadius:10,
                  fontSize:9, fontWeight:700, padding:'1px 5px' }}>{groupBadge}</span>}
              </div>
              {/* Sub-pages */}
              {group.pages.map((item: any) => {
                const active = page === item.id
                const badge = item.id==='leave' ? pendingLeave : item.id==='overtime' ? pendingOT : 0
                return (
                  <button key={item.id} onClick={() => setPage(item.id)}
                    style={{ width:'100%', display:'flex', alignItems:'center', gap:8,
                      padding:'7px 10px 7px 20px', borderRadius:7, marginBottom:1, border:'none',
                      cursor:'pointer', fontFamily:'inherit', fontSize:12, textAlign:'left',
                      background:active?'rgba(196,151,58,0.2)':'transparent',
                      color:active?T.gold:'rgba(255,255,255,0.5)',
                      fontWeight:active?600:400 }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as any).style.background='rgba(255,255,255,0.05)' }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as any).style.background='transparent' }}>
                    <span style={{ fontSize:12 }}>{item.icon}</span>
                    <span style={{ flex:1 }}>{item.label}</span>
                    {badge>0 && <span style={{ background:T.red, color:'#fff', borderRadius:10,
                      fontSize:9, fontWeight:700, padding:'1px 5px' }}>{badge}</span>}
                  </button>
                )
              })}
            </div>
          )
        })}
      </nav>
      {/* User info + logout */}
      <div style={{ padding:'10px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <div style={{ width:30, height:30, borderRadius:'50%', background:DEPT_COLOR[user.dept_id]||T.gold,
            flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontSize:9, fontWeight:700 }}>{user.ini}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ color:'rgba(255,255,255,0.85)', fontSize:11, fontWeight:600,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
            <div style={{ color:T.gold, fontSize:9 }}>{user.position_name||user.dept_name}</div>
          </div>
        </div>
        <button onClick={onLogout}
          style={{ width:'100%', padding:'6px', borderRadius:7, border:'1px solid rgba(255,255,255,0.1)',
            background:'transparent', color:'rgba(255,255,255,0.4)', fontSize:11,
            cursor:'pointer', fontFamily:'inherit' }}>🚪 Đăng xuất</button>
      </div>
    </div>
  )
}

function BottomNav({ page, setPage, user, pendingLeave, pendingOT, onLogout }: any) {
  const perm   = getPerm(user)
  const groups = NAV_GROUPS(perm, user?.dept_id||'')
  const activeGroup = getGroupForPage(page, perm, user?.dept_id||'')
  const [showSubTabs, setShowSubTabs] = useState(false)

  const handleGroupClick = (group: any) => {
    if (activeGroup?.id === group.id) {
      setShowSubTabs(v => !v)
    } else {
      // Navigate to first page of group
      const firstPage = group.pages[0]?.id
      if (firstPage) { setPage(firstPage); setShowSubTabs(false) }
    }
  }

  return (
    <>
      {/* Sub-tab strip — hiện khi tap vào group đang active */}
      {showSubTabs && activeGroup && activeGroup.pages.length > 1 && (
        <div style={{ position:'fixed', bottom:60, left:0, right:0, background:T.sidebar,
          borderTop:'1px solid rgba(255,255,255,0.12)', zIndex:99 }}>
          {/* User info */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'8px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:DEPT_COLOR[user.dept_id]||T.gold,
                display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:8, fontWeight:700 }}>{user.ini}</div>
              <div>
                <div style={{ color:'rgba(255,255,255,0.85)', fontSize:11, fontWeight:600 }}>{user.name}</div>
                <div style={{ color:T.gold, fontSize:9 }}>{user.position_name||user.dept_name}</div>
              </div>
            </div>
            <button onClick={() => { if(confirm('Đăng xuất?')) onLogout() }}
              style={{ padding:'4px 10px', borderRadius:6, border:'1px solid rgba(255,100,100,0.4)',
                background:'transparent', color:'#F87171', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>
              🚪 Đăng xuất
            </button>
          </div>
          {/* Sub pages */}
          <div style={{ display:'flex', flexWrap:'wrap', padding:'6px 8px', gap:4 }}>
            {activeGroup.pages.map((item: any) => {
              const active = page === item.id
              const badge = item.id==='leave' ? pendingLeave : item.id==='overtime' ? pendingOT : 0
              return (
                <button key={item.id} onClick={() => { setPage(item.id); setShowSubTabs(false) }}
                  style={{ flex:'1 1 auto', display:'flex', alignItems:'center', justifyContent:'center',
                    gap:6, padding:'8px 10px', borderRadius:8, border:'none',
                    background:active?'rgba(196,151,58,0.22)':'rgba(255,255,255,0.06)',
                    color:active?T.gold:'rgba(255,255,255,0.65)',
                    cursor:'pointer', fontFamily:'inherit', fontSize:12,
                    fontWeight:active?600:400, position:'relative' }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {badge>0 && <span style={{ position:'absolute', top:3, right:6, background:T.red,
                    color:'#fff', borderRadius:10, fontSize:8, fontWeight:700, padding:'1px 4px' }}>{badge}</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Main bottom bar — 5 group icons */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:T.sidebar,
        display:'flex', borderTop:'1px solid rgba(255,255,255,0.1)', zIndex:100,
        paddingBottom:'env(safe-area-inset-bottom,0px)' }}>
        {groups.map((group: any) => {
          const isActive = activeGroup?.id === group.id
          const badge = group.id==='hr' ? pendingLeave+pendingOT : 0
          const hasMultiple = group.pages.length > 1
          return (
            <button key={group.id} onClick={() => handleGroupClick(group)}
              style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center',
                justifyContent:'center', padding:'10px 2px', border:'none',
                background: isActive && showSubTabs ? 'rgba(196,151,58,0.15)' : 'transparent',
                cursor:'pointer', position:'relative',
                color:isActive?T.gold:'rgba(255,255,255,0.4)' }}>
              <span style={{ fontSize:19, marginBottom:2 }}>{group.icon}</span>
              <span style={{ fontSize:9, fontWeight:isActive?700:400, fontFamily:'inherit',
                letterSpacing:.2 }}>{group.label}</span>
              {isActive && hasMultiple && (
                <span style={{ fontSize:7, color:T.gold, marginTop:1 }}>
                  {showSubTabs ? '▲' : '▼'}
                </span>
              )}
              {badge>0 && <span style={{ position:'absolute', top:5, right:'calc(50% - 16px)',
                background:T.red, color:'#fff', borderRadius:10, fontSize:8, fontWeight:700, padding:'1px 4px' }}>{badge}</span>}
            </button>
          )
        })}
      </div>
    </>
  )
}

// ══ KẾT THÚC PHẦN 2 — Paste tiếp Phần 3 bên dưới ══
// ═══════════════════════════════════════════════
// PHẦN 3/6 — Paste nối tiếp bên dưới Phần 2
// ═══════════════════════════════════════════════

// ── DASHBOARD ────────────────────────────────────
function Dashboard({ user, checklist, tasks, allUsers, attendance, leaveRequests, otRequests, mobile }: any) {
  const p = mobile ? '16px' : '24px'
  const perm = getPerm(user)
  const dids = allUsers.filter((u: any) => u.dept_id === user.dept_id).map((u: any) => u.id)
  const rIds = perm.viewAllDashboard ? allUsers.map((u: any) => u.id)
    : perm.viewDeptChecklist ? dids : [user.id]

  const myCl = checklist.filter((c: any) => rIds.includes(c.assignee_id))
  const myTk = tasks.filter((t: any) => rIds.includes(t.assignee_id))
  const todayAtt = attendance.filter((a: any) => a.date === todayISO() && rIds.includes(a.user_id))
  const clDone = myCl.filter((c: any) => c.status === 'done').length
  const staffCount = allUsers.filter((u: any) => rIds.includes(u.id) && u.id !== 'admin').length
  const absentCount = todayAtt.filter((a: any) => ['absent','sick'].includes(a.status)).length
  const pendingLeave = leaveRequests.filter((r: any) => r.status === 'pending' &&
    (perm.viewAllDashboard || (perm.approveLeave && dids.includes(r.user_id)))).length
  const pendingOT = (otRequests||[]).filter((r: any) => r.status === 'pending' &&
    (perm.viewAllDashboard || (perm.approveOT && dids.includes(r.user_id)))).length

  const staffStats = allUsers
    .filter((u: any) => rIds.includes(u.id) && u.id !== 'admin')
    .map((u: any) => {
      const uCl = checklist.filter((c: any) => c.assignee_id === u.id)
      const done = uCl.filter((c: any) => c.status === 'done').length
      return { name:u.name, pos:u.position_name||'', done, total:uCl.length,
        pct:uCl.length>0?Math.round(done/uCl.length*100):0 }
    })
    .sort((a: any, b: any) => b.pct - a.pct)

  const deptStats = ['kho','sale','vp'].map(d => {
    const du = allUsers.filter((u: any) => u.dept_id === d).map((u: any) => u.id)
    const dc = checklist.filter((c: any) => du.includes(c.assignee_id))
    const done = dc.filter((c: any) => c.status === 'done').length
    return { name:DEPT_NAME[d], done, total:dc.length, pct:dc.length>0?Math.round(done/dc.length*100):0, color:DEPT_COLOR[d] }
  })

  return (
    <div style={{ padding:`0 ${p} ${p}` }}>
      <AlertBanner user={user} checklist={checklist} leaveRequests={leaveRequests} otRequests={otRequests||[]} allUsers={allUsers}/>
      <Topbar mobile={mobile}
        title={perm.viewAllDashboard?'Dashboard':perm.viewDeptChecklist?`Dashboard — ${user.dept_name}`:'Tổng quan'}
        subtitle={new Date().toLocaleDateString('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'})}/>

      <div style={{ display:'grid', gridTemplateColumns:mobile?'1fr 1fr':'repeat(4,1fr)', gap:10, marginBottom:16 }}>
        {[
          { label:'Checklist xong', val:`${clDone}/${myCl.length}`,      icon:'✅', color:T.green },
          { label:'Checklist trễ',  val:myCl.filter(isOverdue).length,   icon:'🔴', color:T.red   },
          { label:'Vắng hôm nay',   val:`${absentCount}/${staffCount}`,  icon:'🏠', color:T.amber },
          { label:'Chờ duyệt',      val:pendingLeave+pendingOT,          icon:'⏳', color:T.purple},
        ].map((k, i) => (
          <div key={i} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:11, padding:'14px 16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:10, fontWeight:600, color:T.light, textTransform:'uppercase', letterSpacing:.4 }}>{k.label}</span>
              <span style={{ fontSize:16 }}>{k.icon}</span>
            </div>
            <div style={{ fontSize:24, fontWeight:700, color:k.color }}>{k.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:mobile?'1fr':perm.viewAllDashboard?'1fr 1fr':'1fr 1fr', gap:14 }}>
        {perm.viewAllDashboard && (
          <Card>
            <div style={{ fontSize:13, fontWeight:600, color:T.dark, marginBottom:12 }}>Tiến độ theo phòng ban</div>
            {deptStats.map(d => (
              <div key={d.name} style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                  <span style={{ fontWeight:500, color:T.dark }}>{d.name}</span>
                  <span style={{ color:T.light }}>{d.done}/{d.total} — {d.pct}%</span>
                </div>
                <div style={{ height:6, background:T.border, borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${d.pct}%`, background:d.color, borderRadius:3 }}/>
                </div>
              </div>
            ))}
          </Card>
        )}
        <Card>
          <div style={{ fontSize:13, fontWeight:600, color:T.dark, marginBottom:12 }}>
            {perm.viewAllDashboard||perm.viewDeptChecklist ? 'Tiến độ nhân viên' : 'Việc chưa xong hôm nay'}
          </div>
          {staffStats.length > 0 ? staffStats.slice(0,6).map((s: any, i: number) => (
            <div key={i} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                <div>
                  <span style={{ fontWeight:500, color:T.dark }}>{s.name}</span>
                  {s.pos && <span style={{ fontSize:10, color:T.light, marginLeft:6 }}>{s.pos}</span>}
                </div>
                <span style={{ color:T.light }}>{s.done}/{s.total} — {s.pct}%</span>
              </div>
              <div style={{ height:6, background:T.border, borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${s.pct}%`, background:T.gold, borderRadius:3 }}/>
              </div>
            </div>
          )) : checklist.filter((c: any) => c.assignee_id === user.id && c.status !== 'done').slice(0,5).map((c: any) => (
            <div key={c.id} style={{ display:'flex', gap:8, padding:'7px 0', borderBottom:`1px solid ${T.border}` }}>
              <span>{isOverdue(c)?'🔴':'🕐'}</span>
              <div>
                <div style={{ fontSize:12, fontWeight:500, color:isOverdue(c)?T.red:T.dark }}>{c.title}</div>
                {c.deadline && <div style={{ fontSize:11, color:T.light }}>{c.deadline}</div>}
              </div>
            </div>
          ))}
        </Card>
      </div>

      {perm.viewAllDashboard && staffStats.length > 0 && (
        <Card style={{ marginTop:14 }}>
          <div style={{ fontSize:13, fontWeight:600, color:T.dark, marginBottom:14 }}>🏆 Bảng xếp hạng hôm nay</div>
          <div style={{ display:'grid', gridTemplateColumns:mobile?'1fr':'repeat(3,1fr)', gap:10 }}>
            {staffStats.slice(0,9).map((s: any, i: number) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px',
                background:i===0?T.goldBg:T.bg, borderRadius:8,
                border:`1px solid ${i===0?T.goldBorder:T.border}` }}>
                <div style={{ fontSize:16, width:24, textAlign:'center' }}>
                  {i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:T.dark }}>{s.name}</div>
                  <div style={{ fontSize:10, color:T.light }}>{s.pos||`${s.done}/${s.total} việc`}</div>
                </div>
                <div style={{ fontSize:13, fontWeight:700,
                  color:s.pct>=80?T.green:s.pct>=50?T.amber:T.red }}>{s.pct}%</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ── CHECKLIST ────────────────────────────────────
function Checklist({ user, checklist, setChecklist, addLog, allUsers, mobile }: any) {
  const [filterDept, setFilterDept]     = useState('all')
  const [filterPerson, setFilterPerson] = useState('all')
  const [filterFreq, setFilterFreq]     = useState('all')
  const [showAdd, setShowAdd]           = useState(false)
  const [addForm, setAddForm]           = useState({ title:'', time_start:'', time_end:'', freq:'Hàng ngày', priority:'mid' })
  const p = mobile ? '16px' : '24px'
  const perm = getPerm(user)
  const dids = allUsers.filter((u: any) => u.dept_id === user.dept_id).map((u: any) => u.id)
  const sopts = Object.entries(STATUS_CFG).map(([v, s]: any) => ({ value:v, label:s.label }))

  // Danh sách item theo quyền
  const baseItems = useMemo(() => {
    return perm.viewAllChecklist ? checklist
      : perm.viewDeptChecklist ? checklist.filter((c: any) => dids.includes(c.assignee_id))
      : checklist.filter((c: any) => c.assignee_id === user.id)
  }, [checklist, user, perm, dids])

  // Áp filter
  const items = useMemo(() => {
    return baseItems.filter((c: any) => {
      const av = allUsers.find((u: any) => u.id === c.assignee_id)
      if (filterDept !== 'all' && av?.dept_id !== filterDept) return false
      if (filterPerson !== 'all' && c.assignee_id !== filterPerson) return false
      if (filterFreq !== 'all' && c.freq !== filterFreq) return false
      return true
    })
  }, [baseItems, filterDept, filterPerson, filterFreq, allUsers])

  const updateStatus = async (id: string, newStatus: string) => {
    const item = checklist.find((c: any) => c.id === id); if (!item) return
    const done_at = newStatus === 'done' ? fmtNow() : ''
    setChecklist((prev: any) => prev.map((c: any) => c.id === id ? {...c, status:newStatus, done_at} : c))
    await db.from('checklist').upsert({...item, status:newStatus, done_at})
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Xóa công việc này?')) return
    setChecklist((prev: any) => prev.filter((c: any) => c.id !== id))
    await db.from('checklist').delete().eq('id', id)
  }

  const addSelfItem = async () => {
    if (!addForm.title.trim()) return
    const newItem = {
      id: `cl_self_${user.id}_${Date.now()}`,
      template_id: '', title: addForm.title.trim(),
      description: addForm.time_start && addForm.time_end ? `${addForm.time_start} → ${addForm.time_end}` : '',
      time_start: addForm.time_start, time_end: addForm.time_end,
      assignee_id: user.id, priority: addForm.priority, freq: addForm.freq,
      deadline: addForm.time_end || '', status: 'notyet', done_at: '',
      date: todayStr(), dept_id: user.dept_id || '', self_created: true
    }
    setChecklist((prev: any) => [...prev, newItem])
    const { error } = await db.from('checklist').insert(newItem)
    if (error) {
      setChecklist((prev: any) => prev.filter((c: any) => c.id !== newItem.id))
      alert('❌ Lỗi: ' + error.message); return
    }
    setShowAdd(false)
    setAddForm({ title:'', time_start:'', time_end:'', freq:'Hàng ngày', priority:'mid' })
  }

  const canEditItem = (item: any) =>
    perm.viewAllChecklist || item.assignee_id === user.id || (perm.viewDeptChecklist && dids.includes(item.assignee_id))

  const canDeleteItem = (item: any) =>
    item.self_created && item.assignee_id === user.id || perm.viewAllDashboard

  // Nhóm item theo assignee
  const groups = useMemo(() => {
    const map: Record<string, any[]> = {}
    items.forEach((c: any) => {
      if (!map[c.assignee_id]) map[c.assignee_id] = []
      map[c.assignee_id].push(c)
    })
    return Object.entries(map).map(([uid, its]) => ({
      uid,
      person: allUsers.find((u: any) => u.id === uid),
      items: its.sort((a: any, b: any) => (a.time_start||a.deadline||'').localeCompare(b.time_start||b.deadline||'')),
      done: its.filter((c: any) => c.status === 'done').length,
      total: its.length,
    })).sort((a, b) => (a.person?.name||'').localeCompare(b.person?.name||''))
  }, [items, allUsers])

  const totalDone  = items.filter((c: any) => c.status === 'done').length
  const totalItems = items.length

  const filterableUsers = perm.viewAllChecklist
    ? allUsers.filter((u: any) => u.id !== 'admin')
    : allUsers.filter((u: any) => dids.includes(u.id))

  return (
    <div style={{ padding:`0 ${p} ${mobile?'80px':p}` }}>
      <Topbar mobile={mobile} title="Checklist hàng ngày"
        subtitle={`${todayStr()} — ${totalDone}/${totalItems} hoàn thành`}
        action={<GoldBtn small outline onClick={() => setShowAdd(true)}>+ Tự thêm</GoldBtn>}/>

      {/* ── Filter bar ── */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        {(perm.viewAllChecklist || perm.viewDeptChecklist) && (
          <select value={filterDept} onChange={e => { setFilterDept(e.target.value); setFilterPerson('all') }}
            style={{ padding:'6px 10px', borderRadius:8, fontSize:12, fontFamily:'inherit',
              border:`1.5px solid ${filterDept!=='all'?T.gold:T.border}`,
              background:filterDept!=='all'?T.goldBg:T.bg, color:T.dark, cursor:'pointer' }}>
            <option value="all">🏢 Tất cả phòng</option>
            {(['kho','sale','vp'] as string[]).map(d => <option key={d} value={d}>{DEPT_NAME[d]}</option>)}
          </select>
        )}
        {(perm.viewAllChecklist || perm.viewDeptChecklist) && (
          <select value={filterPerson} onChange={e => setFilterPerson(e.target.value)}
            style={{ padding:'6px 10px', borderRadius:8, fontSize:12, fontFamily:'inherit',
              border:`1.5px solid ${filterPerson!=='all'?T.gold:T.border}`,
              background:filterPerson!=='all'?T.goldBg:T.bg, color:T.dark, cursor:'pointer' }}>
            <option value="all">👤 Tất cả người</option>
            {filterableUsers
              .filter((u: any) => filterDept==='all' || u.dept_id===filterDept)
              .map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        )}
        {/* Tab tần suất */}
        <div style={{ display:'flex', gap:4 }}>
          {(['all','Hàng ngày','Hàng tuần','Hàng tháng'] as string[]).map(f => (
            <button key={f} onClick={() => setFilterFreq(f)}
              style={{ padding:'5px 11px', borderRadius:7, cursor:'pointer', fontFamily:'inherit', fontSize:12,
                border:`1.5px solid ${filterFreq===f?T.purple:T.border}`,
                background:filterFreq===f?T.purpleBg:'transparent',
                color:filterFreq===f?T.purple:T.med, fontWeight:filterFreq===f?600:400 }}>
              {f==='all'?'Tất cả':f}
            </button>
          ))}
        </div>
        {(filterDept!=='all'||filterPerson!=='all'||filterFreq!=='all') && (
          <button onClick={() => { setFilterDept('all'); setFilterPerson('all'); setFilterFreq('all') }}
            style={{ padding:'5px 10px', borderRadius:7, border:`1px solid ${T.border}`,
              fontSize:12, fontFamily:'inherit', color:T.med, background:'transparent', cursor:'pointer' }}>
            ✕ Xóa filter
          </button>
        )}
      </div>

      {/* ── Tổng progress bar ── */}
      {totalItems > 0 && (
        <div style={{ marginBottom:16, padding:'12px 16px', background:T.card,
          borderRadius:10, border:`1px solid ${T.border}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6 }}>
            <span style={{ fontWeight:600, color:T.dark }}>Tiến độ tổng thể hôm nay</span>
            <span style={{ color:totalDone===totalItems?T.green:T.med, fontWeight:700 }}>
              {totalDone}/{totalItems} — {Math.round(totalDone/totalItems*100)}%
            </span>
          </div>
          <div style={{ height:8, background:T.border, borderRadius:4, overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:4, transition:'width .4s',
              width:`${totalItems>0?Math.round(totalDone/totalItems*100):0}%`,
              background: totalDone===totalItems ? T.green : T.gold }}/>
          </div>
        </div>
      )}

      {/* ── Groups theo người ── */}
      {groups.length === 0 ? (
        <Card style={{ textAlign:'center', padding:'48px', color:T.light }}>
          <div style={{ fontSize:36, marginBottom:10 }}>✅</div>
          <div style={{ fontSize:14, fontWeight:500 }}>Không có checklist nào</div>
        </Card>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {groups.map((g: any) => {
            const pct = g.total > 0 ? Math.round(g.done/g.total*100) : 0
            const deptColor = DEPT_COLOR[g.person?.dept_id] || T.gold
            return (
              <div key={g.uid} style={{ border:`1px solid ${T.border}`, borderRadius:12, overflow:'hidden', background:T.card }}>
                {/* Group header */}
                <div style={{ padding:'12px 16px', background:`${deptColor}12`,
                  borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:12 }}>
                  {g.person && <Av u={g.person} size={36} showTitle/>}
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontSize:12, color:T.med }}>
                        {g.done===g.total && g.total>0 ? '🎉 Hoàn thành hết!' : `${g.done}/${g.total} việc xong`}
                      </span>
                      <span style={{ fontSize:12, fontWeight:700,
                        color:pct===100?T.green:pct>=60?T.amber:T.red }}>{pct}%</span>
                    </div>
                    <div style={{ height:6, background:T.border, borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:3, transition:'width .4s',
                        width:`${pct}%`,
                        background:pct===100?T.green:pct>=60?T.amber:T.red }}/>
                    </div>
                  </div>
                </div>

                {/* Items */}
                {mobile ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                    {g.items.map((item: any, idx: number) => {
                      const late = isOverdue(item)
                      const sc = STATUS_CFG[item.status]||{}
                      const canEdit = canEditItem(item)
                      return (
                        <div key={item.id} style={{
                          padding:'11px 14px', display:'flex', gap:10, alignItems:'center',
                          borderBottom: idx<g.items.length-1?`1px solid ${T.border}`:'none',
                          background: item.status==='done'?'#F8FFF8': late&&item.status!=='done'?'#FFF5F5':'transparent'
                        }}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:13, fontWeight:500,
                              color:item.status==='done'?T.green:late&&item.status!=='done'?T.red:T.dark,
                              textDecoration:item.status==='done'?'line-through':'none' }}>
                              {item.title}
                            </div>
                            <div style={{ display:'flex', gap:8, marginTop:4, alignItems:'center', flexWrap:'wrap' }}>
                              {(item.time_start||item.time_end) && (
                                <span style={{ fontSize:11, color:T.blue, fontWeight:600 }}>
                                  🕐 {item.time_start||'?'} → {item.time_end||item.deadline||'?'}
                                </span>
                              )}
                              <span style={{ fontSize:10, padding:'1px 6px', borderRadius:20, fontWeight:600,
                                color:FREQ_COLOR[item.freq]?.color, background:FREQ_COLOR[item.freq]?.bg }}>
                                {item.freq}
                              </span>
                              <Badge cfg={PRI_CFG[item.priority]} small/>
                            </div>
                          </div>
                          {canEdit ? (
                            <select value={item.status} onChange={e => updateStatus(item.id, e.target.value)}
                              style={{ padding:'4px 7px', borderRadius:7, border:`1.5px solid ${sc.color||T.border}`,
                                background:sc.bg||'#fff', color:sc.color||T.dark, fontSize:11, fontWeight:600,
                                cursor:'pointer', fontFamily:'inherit', outline:'none', flexShrink:0 }}>
                              {sopts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          ) : <Badge type={item.status} small/>}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <TH cols={['Công việc','Tần suất','Ưu tiên','Khung giờ','Trạng thái','Xong lúc']}/>
                    <tbody>
                      {g.items.map((item: any, idx: number) => {
                        const late = isOverdue(item)
                        const sc = STATUS_CFG[item.status]||{}
                        const canEdit = canEditItem(item)
                        return (
                          <tr key={item.id} style={{
                            background: item.status==='done'?'#F8FFF8': late&&item.status!=='done'?'#FFF5F5': idx%2===0?'#fff':T.bg,
                            borderBottom:`1px solid ${T.border}`
                          }}>
                            <td style={{ padding:'10px 14px', maxWidth:260 }}>
                              <div style={{ fontSize:13, fontWeight:500,
                                color:item.status==='done'?T.green:late&&item.status!=='done'?T.red:T.dark,
                                textDecoration:item.status==='done'?'line-through':'none' }}>
                                {late&&item.status!=='done'&&'⚠️ '}{item.title}
                              </div>
                              {item.description && <div style={{ fontSize:11, color:T.light }}>{item.description}</div>}
                            </td>
                            <td style={{ padding:'10px 13px' }}>
                              <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:20,
                                color:FREQ_COLOR[item.freq]?.color, background:FREQ_COLOR[item.freq]?.bg }}>{item.freq}</span>
                            </td>
                            <td style={{ padding:'10px 13px' }}><Badge cfg={PRI_CFG[item.priority]} small/></td>
                            <td style={{ padding:'10px 14px', whiteSpace:'nowrap' }}>
                              {(item.time_start||item.time_end) ? (
                                <span style={{ fontSize:12, fontWeight:700, color:T.blue }}>
                                  🕐 {item.time_start||'?'} → {item.time_end||item.deadline||'?'}
                                </span>
                              ) : item.deadline ? (
                                <span style={{ fontSize:12, color:late&&item.status!=='done'?T.red:T.med }}>
                                  ⏰ {item.deadline}
                                </span>
                              ) : <span style={{ color:T.light }}>—</span>}
                            </td>
                            <td style={{ padding:'10px 13px' }}>
                              {canEdit ? (
                                <select value={item.status} onChange={e => updateStatus(item.id, e.target.value)}
                                  style={{ padding:'4px 8px', borderRadius:7, border:`1.5px solid ${sc.color||T.border}`,
                                    background:sc.bg||'#fff', color:sc.color||T.dark, fontSize:11, fontWeight:600,
                                    cursor:'pointer', fontFamily:'inherit', outline:'none' }}>
                                  {sopts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                              ) : <Badge type={item.status} small/>}
                            </td>
                            <td style={{ padding:'10px 13px', fontSize:11, color:item.done_at?T.green:T.light }}>
                              {item.done_at||'—'}
                            </td>
                            <td style={{ padding:'9px 8px' }}>
                              {canDeleteItem(item) && (
                                <button onClick={() => deleteItem(item.id)}
                                  style={{ padding:'3px 8px', borderRadius:6, border:`1px solid ${T.redBg}`,
                                    background:T.redBg, cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.red }}>🗑️</button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )
          })}
        </div>
      )}
      {/* Modal tự thêm checklist */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Tự thêm việc hôm nay">
        <div style={{ padding:'8px 12px', background:T.goldBg, borderRadius:8, marginBottom:14, fontSize:12, color:T.goldText }}>
          💡 Việc tự thêm chỉ áp dụng cho hôm nay, không lặp lại tự động. Dùng để ghi nhận công việc phát sinh.
        </div>
        <Inp label="Tên công việc *" value={addForm.title}
          onChange={(v: string) => setAddForm(f => ({...f, title:v}))} placeholder="VD: Gọi điện khách hàng X..."/>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Inp label="🕐 Giờ bắt đầu" type="time" value={addForm.time_start}
            onChange={(v: string) => setAddForm(f => ({...f, time_start:v}))}/>
          <Inp label="🏁 Giờ kết thúc" type="time" value={addForm.time_end}
            onChange={(v: string) => setAddForm(f => ({...f, time_end:v}))}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Sel label="Tần suất" value={addForm.freq}
            onChange={(v: string) => setAddForm(f => ({...f, freq:v}))}
            options={['Hàng ngày','Hàng tuần','Hàng tháng'].map(v => ({value:v, label:v}))}/>
          <Sel label="Ưu tiên" value={addForm.priority}
            onChange={(v: string) => setAddForm(f => ({...f, priority:v}))}
            options={[{value:'high',label:'🔴 Cao'},{value:'mid',label:'🟡 Trung bình'},{value:'low',label:'🟢 Thấp'}]}/>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:8 }}>
          <GoldBtn outline small onClick={() => setShowAdd(false)}>Hủy</GoldBtn>
          <GoldBtn small onClick={addSelfItem} disabled={!addForm.title.trim()}>Thêm vào checklist</GoldBtn>
        </div>
      </Modal>
    </div>
  )
}

// ── TASKS ────────────────────────────────────────
function Tasks({ user, tasks, setTasks, addLog, allUsers, mobile }: any) {
  const [show, setShow]           = useState(false)
  const [filterDept, setFilterDept] = useState('all')
  const [filterPerson, setFilterPerson] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [form, setForm] = useState({
    title:'', description:'', assignee_id:'', priority:'high',
    deadline:'', deadline_time:'17:00', notes:''
  })
  const p = mobile ? '16px' : '24px'
  const perm = getPerm(user)
  const dids = allUsers.filter((u: any) => u.dept_id === user.dept_id).map((u: any) => u.id)
  const sopts = Object.entries(STATUS_CFG).map(([v, s]: any) => ({ value:v, label:s.label }))

  // Danh sách hiển thị theo quyền
  const base = perm.viewAllChecklist ? tasks
    : perm.viewDeptChecklist ? tasks.filter((t: any) => dids.includes(t.assignee_id) || t.created_by === user.id)
    : tasks.filter((t: any) => t.assignee_id === user.id)

  // Áp filter
  const mine = base.filter((t: any) => {
    const av = allUsers.find((u: any) => u.id === t.assignee_id)
    if (filterDept !== 'all' && av?.dept_id !== filterDept) return false
    if (filterPerson !== 'all' && t.assignee_id !== filterPerson) return false
    if (filterStatus !== 'all' && t.status !== filterStatus) return false
    return true
  })

  const assignable = perm.viewAllChecklist
    ? allUsers.filter((u: any) => u.id !== 'admin')
    : allUsers.filter((u: any) => u.dept_id === user.dept_id && u.id !== user.id)

  // Danh sách người để filter
  const filterableUsers = perm.viewAllChecklist
    ? allUsers.filter((u: any) => u.id !== 'admin')
    : allUsers.filter((u: any) => dids.includes(u.id))

  const canDelete = (t: any) =>
    perm.viewAllDashboard || t.created_by === user.id

  const upd = async (id: string, newStatus: string) => {
    const task = tasks.find((t: any) => t.id === id); if (!task) return
    const done_at = newStatus === 'done' ? fmtNow() : ''
    setTasks((prev: any) => prev.map((t: any) => t.id === id ? {...t, status:newStatus, done_at} : t))
    await db.from('tasks').upsert({...task, status:newStatus, done_at})
  }

  const del = async (id: string) => {
    if (!confirm('Xóa task này?')) return
    setTasks((prev: any) => prev.filter((t: any) => t.id !== id))
    await db.from('tasks').delete().eq('id', id)
  }

  const create = async () => {
    if (!form.title || !form.deadline || !form.assignee_id) return
    const now = new Date()
    const start_time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    const newTask = {
      id:'t'+Date.now(), ...form,
      start_time,
      created_by: user.id,
      assigned: todayStr(),
      status:'notyet', done_at:'',
      dept_id: allUsers.find((u: any) => u.id === form.assignee_id)?.dept_id||''
    }
    setTasks((prev: any) => [newTask, ...prev])
    await db.from('tasks').insert(newTask)
    setShow(false)
    setForm({ title:'', description:'', assignee_id:'', priority:'high', deadline:'', deadline_time:'17:00', notes:'' })
  }

  const done  = mine.filter((t: any) => t.status==='done').length

  const FilterBar = () => (
    <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
      {/* Phòng ban */}
      {(perm.viewAllChecklist || perm.viewDeptChecklist) && (
        <select value={filterDept} onChange={e => { setFilterDept(e.target.value); setFilterPerson('all') }}
          style={{ padding:'6px 10px', borderRadius:8, border:`1.5px solid ${filterDept!=='all'?T.gold:T.border}`,
            fontSize:12, fontFamily:'inherit', color:T.dark, background:filterDept!=='all'?T.goldBg:T.bg, cursor:'pointer' }}>
          <option value="all">🏢 Tất cả phòng</option>
          {(['kho','sale','vp'] as string[]).map(d => <option key={d} value={d}>{DEPT_NAME[d]}</option>)}
        </select>
      )}
      {/* Người */}
      {(perm.viewAllChecklist || perm.viewDeptChecklist) && (
        <select value={filterPerson} onChange={e => setFilterPerson(e.target.value)}
          style={{ padding:'6px 10px', borderRadius:8, border:`1.5px solid ${filterPerson!=='all'?T.gold:T.border}`,
            fontSize:12, fontFamily:'inherit', color:T.dark, background:filterPerson!=='all'?T.goldBg:T.bg, cursor:'pointer' }}>
          <option value="all">👤 Tất cả người</option>
          {filterableUsers
            .filter((u: any) => filterDept === 'all' || u.dept_id === filterDept)
            .map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      )}
      {/* Trạng thái */}
      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
        style={{ padding:'6px 10px', borderRadius:8, border:`1.5px solid ${filterStatus!=='all'?T.purple:T.border}`,
          fontSize:12, fontFamily:'inherit', color:T.dark, background:filterStatus!=='all'?T.purpleBg:T.bg, cursor:'pointer' }}>
        <option value="all">📋 Tất cả trạng thái</option>
        {Object.entries(STATUS_CFG).map(([v, s]: any) => <option key={v} value={v}>{s.label}</option>)}
      </select>
      {/* Reset filter */}
      {(filterDept!=='all'||filterPerson!=='all'||filterStatus!=='all') && (
        <button onClick={() => { setFilterDept('all'); setFilterPerson('all'); setFilterStatus('all') }}
          style={{ padding:'6px 10px', borderRadius:8, border:`1px solid ${T.border}`,
            fontSize:12, fontFamily:'inherit', color:T.med, background:'transparent', cursor:'pointer' }}>
          ✕ Xóa filter
        </button>
      )}
      <div style={{ marginLeft:'auto', fontSize:12, color:T.light }}>{done}/{mine.length} hoàn thành</div>
    </div>
  )

  return (
    <div style={{ padding:`0 ${p} ${mobile?'80px':p}` }}>
      <Topbar mobile={mobile}
        title={perm.viewAllChecklist?'Giao việc':perm.viewDeptChecklist?'Việc phòng tôi':'Việc của tôi'}
        subtitle={`Hôm nay: ${todayStr()}`}
        action={perm.createTask && <GoldBtn small onClick={() => setShow(true)}>+ Tạo task</GoldBtn>}/>

      <FilterBar/>

      {mine.length === 0 ? (
        <Card style={{ textAlign:'center', padding:'40px', color:T.light }}>
          <div style={{ fontSize:32, marginBottom:8 }}>📌</div>
          <div style={{ fontSize:14 }}>Không có task nào</div>
        </Card>
      ) : mobile ? (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {mine.map((t: any) => {
            const late = isOverdue(t), sc = STATUS_CFG[t.status]||{}
            const av = allUsers.find((u: any) => u.id === t.assignee_id)
            const ce = perm.viewAllChecklist || t.assignee_id === user.id || (perm.viewDeptChecklist && dids.includes(t.assignee_id))
            return (
              <div key={t.id} style={{ background:late&&t.status!=='done'?'#FFF5F5':T.card,
                border:`1px solid ${late&&t.status!=='done'?T.red:T.border}`, borderRadius:10, padding:'12px 14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <div style={{ flex:1, marginRight:8 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:late&&t.status!=='done'?T.red:T.dark }}>{t.title}</div>
                    {t.description && <div style={{ fontSize:11, color:T.light }}>{t.description}</div>}
                    {t.notes && <div style={{ fontSize:11, color:T.blue }}>📝 {t.notes}</div>}
                    <div style={{ fontSize:11, color:T.light, marginTop:4 }}>
                      ⏰ {t.start_time||'--:--'} → {t.deadline_time||'--:--'} &nbsp;·&nbsp; 📅 {fmtDate(t.deadline)}
                    </div>
                  </div>
                  <Badge cfg={PRI_CFG[t.priority]} small/>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:6 }}>
                  <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                    {av && <Av u={av} size={20}/>}
                    {ce && <select value={t.status} onChange={e => upd(t.id, e.target.value)}
                      style={{ padding:'4px 7px', borderRadius:7, border:`1.5px solid ${sc.color||T.border}`,
                        background:sc.bg||'#fff', color:sc.color||T.dark, fontSize:11, fontWeight:600,
                        cursor:'pointer', fontFamily:'inherit', outline:'none' }}>
                      {sopts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>}
                  </div>
                  {canDelete(t) && (
                    <button onClick={() => del(t.id)}
                      style={{ padding:'4px 9px', borderRadius:6, border:`1px solid ${T.redBg}`,
                        background:T.redBg, cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.red }}>
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Card style={{ padding:0, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <TH cols={['Tiêu đề','Giao cho','Ưu tiên','Bắt đầu','Deadline','Trạng thái','Xong lúc','']}/>
            <tbody>
              {mine.map((t: any, i: number) => {
                const late = isOverdue(t), sc = STATUS_CFG[t.status]||{}
                const av = allUsers.find((u: any) => u.id === t.assignee_id)
                const ce = perm.viewAllChecklist || t.assignee_id === user.id || (perm.viewDeptChecklist && dids.includes(t.assignee_id))
                return (
                  <tr key={t.id} style={{ background:late&&t.status!=='done'?'#FFF5F5':i%2===0?'#fff':T.bg, borderBottom:`1px solid ${T.border}` }}>
                    <td style={{ padding:'10px 13px', maxWidth:220 }}>
                      <div style={{ fontSize:13, fontWeight:500, color:late&&t.status!=='done'?T.red:T.dark }}>{t.title}</div>
                      {t.description && <div style={{ fontSize:11, color:T.light, marginTop:2 }}>{t.description}</div>}
                      {t.notes && <div style={{ fontSize:11, color:T.blue }}>📝 {t.notes}</div>}
                    </td>
                    <td style={{ padding:'10px 13px' }}>{av && <Av u={av} size={24} showTitle/>}</td>
                    <td style={{ padding:'10px 13px' }}><Badge cfg={PRI_CFG[t.priority]} small/></td>
                    <td style={{ padding:'10px 13px', fontSize:12, color:T.med, whiteSpace:'nowrap' }}>
                      <div style={{ fontWeight:500, color:T.dark }}>{t.start_time||'—'}</div>
                      <div style={{ fontSize:10, color:T.light }}>{fmtDate(t.assigned||'')||'—'}</div>
                    </td>
                    <td style={{ padding:'10px 13px', whiteSpace:'nowrap' }}>
                      <div style={{ fontSize:12, fontWeight:600, color:late&&t.status!=='done'?T.red:T.dark }}>
                        {late&&t.status!=='done'?'⚠️ ':''}
                        {t.deadline_time||'--:--'}
                      </div>
                      <div style={{ fontSize:11, color:T.light }}>{fmtDate(t.deadline)}</div>
                    </td>
                    <td style={{ padding:'10px 13px' }}>
                      {ce ? <select value={t.status} onChange={e => upd(t.id, e.target.value)}
                        style={{ padding:'4px 8px', borderRadius:7, border:`1.5px solid ${sc.color||T.border}`,
                          background:sc.bg||'#fff', color:sc.color||T.dark, fontSize:11, fontWeight:600,
                          cursor:'pointer', fontFamily:'inherit', outline:'none' }}>
                        {sopts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select> : <Badge type={t.status} small/>}
                    </td>
                    <td style={{ padding:'10px 13px', fontSize:11, color:t.done_at?T.green:T.light }}>{t.done_at||'—'}</td>
                    <td style={{ padding:'10px 8px' }}>
                      {canDelete(t) && (
                        <button onClick={() => del(t.id)}
                          style={{ padding:'4px 8px', borderRadius:6, border:`1px solid ${T.redBg}`,
                            background:T.redBg, cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.red }}>
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={show} onClose={() => setShow(false)} title="Tạo task mới">
        <Inp label="Tiêu đề *" value={form.title} onChange={(v: string) => setForm(f => ({...f, title:v}))} placeholder="Nhập tiêu đề..."/>
        <Inp label="Mô tả" value={form.description} onChange={(v: string) => setForm(f => ({...f, description:v}))} placeholder="Mô tả yêu cầu..."/>
        <Sel label="Giao cho *" value={form.assignee_id} onChange={(v: string) => setForm(f => ({...f, assignee_id:v}))}
          options={[{value:'',label:'— Chọn nhân viên —'},...assignable.map((u: any) => ({value:u.id,label:`${u.name} — ${u.position_name||u.dept_name||''}`}))]}/>
        <Sel label="Mức ưu tiên" value={form.priority} onChange={(v: string) => setForm(f => ({...f, priority:v}))}
          options={[{value:'high',label:'🔴 Cao'},{value:'mid',label:'🟡 Trung bình'},{value:'low',label:'🟢 Thấp'}]}/>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Inp label="Ngày deadline *" type="date" value={form.deadline} onChange={(v: string) => setForm(f => ({...f, deadline:v}))}/>
          <Inp label="Giờ kết thúc *" type="time" value={form.deadline_time} onChange={(v: string) => setForm(f => ({...f, deadline_time:v}))}/>
        </div>
        <div style={{ padding:'8px 12px', background:T.goldBg, borderRadius:8, fontSize:12, color:T.goldText, marginBottom:13 }}>
          ⏰ Giờ bắt đầu sẽ tự động ghi nhận thời điểm tạo task
        </div>
        <Inp label="Ghi chú" value={form.notes} onChange={(v: string) => setForm(f => ({...f, notes:v}))} placeholder="Ghi chú thêm..."/>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:8 }}>
          <GoldBtn outline small onClick={() => setShow(false)}>Hủy</GoldBtn>
          <GoldBtn small onClick={create} disabled={!form.title||!form.deadline||!form.assignee_id}>Tạo task</GoldBtn>
        </div>
      </Modal>
    </div>
  )
}

// ── TEMPLATES ────────────────────────────────────
function Templates({ templates, setTemplates, allUsers, mobile }: any) {
  const [show, setShow] = useState(false)
  const [edit, setEdit] = useState<any>(null)
  const emptyForm = { title:'', description:'', assignee_id:'', priority:'mid',
    freq:'Hàng ngày', time_start:'08:00', time_end:'09:00',
    day_of_month:'1', mins:'60', active:true }
  const [form, setForm] = useState<any>(emptyForm)
  const p = mobile ? '16px' : '24px'
  const staff = allUsers.filter((u: any) => u.id !== 'admin')

  const openCreate = () => { setEdit(null); setForm(emptyForm); setShow(true) }
  const openEdit = (t: any) => {
    setEdit(t)
    setForm({ title:t.title, description:t.description||'', assignee_id:t.assignee_id||'',
      priority:t.priority, freq:t.freq, time_start:t.time_start||'08:00',
      time_end:t.time_end||'09:00', day_of_month:String(t.day_of_month||1),
      mins:String(t.mins||60), active:t.active })
    setShow(true)
  }

  const save = async () => {
    if (!form.title || !form.assignee_id) return
    const data = { ...form, mins:Number(form.mins), day_of_month:Number(form.day_of_month),
      // deadline_suggest vẫn giữ = time_end để tương thích với performReset
      deadline_suggest: form.time_end }
    if (edit) {
      const updated = {...edit, ...data}
      setTemplates((prev: any) => prev.map((t: any) => t.id === edit.id ? updated : t))
      await db.from('checklist_templates').upsert(updated)
    } else {
      const newT = { id:'tp'+Date.now(), ...data }
      setTemplates((prev: any) => [...prev, newT])
      await db.from('checklist_templates').insert(newT)
    }
    setShow(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Xóa template này?')) return
    setTemplates((prev: any) => prev.filter((t: any) => t.id !== id))
    await db.from('checklist_templates').delete().eq('id', id)
  }

  const deptGroups = ['kho','sale','vp'].map(d => ({
    dept:d, name:DEPT_NAME[d],
    items:templates.filter((t: any) => allUsers.find((u: any) => u.id === t.assignee_id)?.dept_id === d)
  }))

  const timeRange = (tp: any) => {
    if (tp.time_start && tp.time_end) return `${tp.time_start} → ${tp.time_end}`
    if (tp.deadline_suggest) return `→ ${tp.deadline_suggest}`
    return '—'
  }

  return (
    <div style={{ padding:`0 ${p} ${mobile?'80px':p}` }}>
      <Topbar mobile={mobile} title="Template checklist" subtitle="Tự sinh checklist hàng ngày"
        action={<GoldBtn small onClick={openCreate}>+ Thêm template</GoldBtn>}/>

      {deptGroups.map(group => group.items.length === 0 ? null : (
        <Card key={group.dept} style={{ padding:0, overflow:'hidden', marginBottom:16 }}>
          <div style={{ background:DEPT_COLOR[group.dept], padding:'11px 16px' }}>
            <span style={{ color:'#fff', fontWeight:700, fontSize:14 }}>{group.name} — {group.items.length} template</span>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <TH cols={['Công việc','Giao cho','Tần suất','Ưu tiên','Khung giờ','Trạng thái','']}/>
            <tbody>
              {group.items.map((tp: any, i: number) => {
                const assignee = allUsers.find((u: any) => u.id === tp.assignee_id)
                return (
                  <tr key={tp.id} style={{ background:i%2===0?'#fff':T.bg, borderBottom:`1px solid ${T.border}`, opacity:tp.active?1:0.5 }}>
                    <td style={{ padding:'9px 13px' }}>
                      <div style={{ fontSize:13, fontWeight:500, color:T.dark }}>{tp.title}</div>
                      {tp.description && <div style={{ fontSize:11, color:T.light }}>{tp.description}</div>}
                    </td>
                    <td style={{ padding:'9px 13px' }}>{assignee && <Av u={assignee} size={22} showTitle/>}</td>
                    <td style={{ padding:'9px 13px' }}>
                      <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:20,
                        color:FREQ_COLOR[tp.freq]?.color, background:FREQ_COLOR[tp.freq]?.bg }}>{tp.freq}</span>
                      {tp.freq==='Hàng tháng' && tp.day_of_month && (
                        <div style={{ fontSize:10, color:T.light, marginTop:2 }}>Ngày {tp.day_of_month}</div>
                      )}
                    </td>
                    <td style={{ padding:'9px 13px' }}><Badge cfg={PRI_CFG[tp.priority]} small/></td>
                    <td style={{ padding:'9px 13px', fontSize:12, fontWeight:600, color:T.dark }}>
                      🕐 {timeRange(tp)}
                      <div style={{ fontSize:10, color:T.light }}>{tp.mins} phút</div>
                    </td>
                    <td style={{ padding:'9px 13px' }}>
                      <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:20,
                        color:tp.active?T.green:T.gray, background:tp.active?T.greenBg:T.grayBg }}>
                        {tp.active?'Đang dùng':'Tắt'}
                      </span>
                    </td>
                    <td style={{ padding:'9px 13px' }}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={() => openEdit(tp)} style={{ padding:'4px 10px', borderRadius:6, border:`1px solid ${T.border}`, background:'transparent', cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.med }}>Sửa</button>
                        <button onClick={() => remove(tp.id)} style={{ padding:'4px 10px', borderRadius:6, border:`1px solid ${T.redBg}`, background:T.redBg, cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.red }}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      ))}

      <Modal open={show} onClose={() => setShow(false)} title={edit?'Sửa template':'Thêm template mới'} wide>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div style={{ gridColumn:'1/-1' }}>
            <Inp label="Tiêu đề *" value={form.title} onChange={(v: string) => setForm((f: any) => ({...f, title:v}))} placeholder="Nhập tiêu đề..."/>
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <Inp label="Mô tả" value={form.description} onChange={(v: string) => setForm((f: any) => ({...f, description:v}))} placeholder="Mô tả ngắn..."/>
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <Sel label="Giao cho *" value={form.assignee_id} onChange={(v: string) => setForm((f: any) => ({...f, assignee_id:v}))}
              options={[{value:'',label:'— Chọn nhân viên —'},...staff.map((u: any) => ({value:u.id,label:`${u.name} — ${u.position_name||u.dept_name||''}`}))]}/>
          </div>
          <Sel label="Tần suất" value={form.freq} onChange={(v: string) => setForm((f: any) => ({...f, freq:v}))}
            options={['Hàng ngày','Hàng tuần','Hàng tháng'].map(v => ({value:v,label:v}))}/>
          <Sel label="Ưu tiên" value={form.priority} onChange={(v: string) => setForm((f: any) => ({...f, priority:v}))}
            options={[{value:'high',label:'🔴 Cao'},{value:'mid',label:'🟡 Trung bình'},{value:'low',label:'🟢 Thấp'}]}/>
          <Inp label="🕐 Giờ bắt đầu" type="time" value={form.time_start} onChange={(v: string) => setForm((f: any) => ({...f, time_start:v}))}/>
          <Inp label="🏁 Giờ kết thúc" type="time" value={form.time_end} onChange={(v: string) => setForm((f: any) => ({...f, time_end:v}))}/>
          {form.freq === 'Hàng tháng' && (
            <Inp label="📅 Ngày trong tháng (1-28)" type="number" min="1" max="28"
              value={form.day_of_month} onChange={(v: string) => setForm((f: any) => ({...f, day_of_month:v}))}/>
          )}
          <Inp label="Thời lượng (phút)" type="number" value={form.mins} onChange={(v: string) => setForm((f: any) => ({...f, mins:v}))}/>
        </div>
        {form.time_start && form.time_end && (
          <div style={{ padding:'8px 12px', background:T.goldBg, borderRadius:8, fontSize:12, color:T.goldText, margin:'8px 0 13px', fontWeight:600 }}>
            🕐 Khung giờ: <b>{form.time_start} → {form.time_end}</b>
            {form.freq==='Hàng tháng' && ` — Ngày ${form.day_of_month} hàng tháng`}
          </div>
        )}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <input type="checkbox" id="tpact" checked={form.active} onChange={e => setForm((f: any) => ({...f, active:e.target.checked}))}/>
          <label htmlFor="tpact" style={{ fontSize:13, color:T.dark, cursor:'pointer' }}>Đang hoạt động</label>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
          <GoldBtn outline small onClick={() => setShow(false)}>Hủy</GoldBtn>
          <GoldBtn small onClick={save} disabled={!form.title||!form.assignee_id}>Lưu</GoldBtn>
        </div>
      </Modal>
    </div>
  )
}

// ══ KẾT THÚC PHẦN 3 — Paste tiếp Phần 4 bên dưới ══
// ═══════════════════════════════════════════════
// PHẦN 4A — Paste nối tiếp bên dưới Phần 3
// ═══════════════════════════════════════════════

function Attendance({ user, allUsers, leaveRequests, attendance, setAttendance, mobile }: any) {
  const [tab, setTab]           = useState<'today'|'week'|'month'>('today')
  const [date, setDate]         = useState(todayISO())
  const [monthYear, setMonthYear] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  })
  const [editRow, setEditRow]   = useState<any>(null)
  const [editForm, setEditForm] = useState({ status:'present', late_mins:0, reason:'', notes:'' })
  const p = mobile ? '16px' : '24px'

  const canMarkAll  = getPerm(user).viewAllAttendance
  const canMarkDept = getPerm(user).markAttendance
  const canMarkPeer = getPerm(user).markPeerAttendance
  const canMark     = canMarkAll || canMarkDept || canMarkPeer

  const peerIds = allUsers
    .filter((u: any) => u.reports_to && u.reports_to === user.position_id && u.id !== user.id)
    .map((u: any) => u.id)

  // Quản lý tự chấm được cho bản thân + nhân viên phòng mình
  const staffList = canMarkAll
    ? allUsers  // Admin thấy tất cả (kể cả mình)
    : canMarkDept
    ? allUsers.filter((u: any) => u.dept_id === user.dept_id)  // Quản lý: cả phòng kể cả mình
    : allUsers.filter((u: any) => peerIds.includes(u.id))

  const deptGroups = canMarkAll
    ? ['kho','sale','vp'].map(d => ({ dept:d, name:DEPT_NAME[d], users:staffList.filter((u: any) => u.dept_id === d) }))
    : [{ dept:user.dept_id, name:user.dept_name, users:staffList }]

  const hasLeave = (uid: string, d: string) =>
    leaveRequests.some((r: any) => r.user_id===uid && r.status==='approved' && r.start_date<=d && r.end_date>=d)

  const getRec    = (uid: string, d: string) => attendance.find((r: any) => r.user_id===uid && r.date===d)

  const getStatus = (uid: string, d: string) => {
    const rec = getRec(uid, d)
    if (rec) return rec.status
    if (hasLeave(uid, d)) return 'leave'
    return 'present'
  }

  const saveRec = async (u: any, d: string, overrides: any = {}) => {
    const ex = getRec(u.id, d)
    const rec = {
      id: ex?.id || `att_${u.id}_${d.replace(/-/g,'')}`,
      date:d, user_id:u.id, dept_id:u.dept_id,
      status:   overrides.status   ?? editForm.status,
      late_mins:Number(overrides.late_mins ?? editForm.late_mins),
      reason:   overrides.reason   ?? editForm.reason,
      notes:    overrides.notes    ?? editForm.notes,
      marked_by:user.id, created_at:fmtNow()
    }
    setAttendance((prev: any) => ex ? prev.map((r: any) => r.id===ex.id ? rec : r) : [...prev, rec])
    await db.from('attendance').upsert(rec)
    setEditRow(null)
  }

  const quickMark = (u: any, d: string, status: string) =>
    saveRec(u, d, { status, late_mins:0, reason:'', notes:'' })

  const openEdit = (u: any, d: string) => {
    const rec = getRec(u.id, d)
    setEditRow({ u, d })
    setEditForm({ status:rec?.status||(hasLeave(u.id,d)?'leave':'present'), late_mins:rec?.late_mins||0, reason:rec?.reason||'', notes:rec?.notes||'' })
  }

  const scheduleLabel = (deptId: string) => {
    const s = SCHEDULE[deptId] || SCHEDULE['sale']
    return `Vào: ${s.in} | Nghỉ trưa: ${s.breakStart}–${s.breakEnd} | Tan: ${s.out}`
  }

  const weekDays = Array.from({ length:7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i)
    return { iso:d.toISOString().split('T')[0], label:['CN','T2','T3','T4','T5','T6','T7'][d.getDay()], dayNum:d.getDate(), isToday:d.toISOString().split('T')[0]===todayISO() }
  })

  const [yr, mo] = monthYear.split('-').map(Number)
  const daysInMonth = new Date(yr, mo, 0).getDate()
  const monthDays = Array.from({ length:daysInMonth }, (_, i) => {
    const d = new Date(yr, mo-1, i+1)
    return { iso:d.toISOString().split('T')[0], dayNum:i+1, isWeekend:d.getDay()===0||d.getDay()===6 }
  })

  const monthSummary = (uid: string) => {
    let present=0,late=0,absent=0,sick=0,leave=0,half=0
    monthDays.forEach(({ iso, isWeekend }) => {
      if (isWeekend) return
      const s = getStatus(uid, iso)
      if (s==='present') present++
      else if (s==='late') { present++; late++ }
      else if (s==='absent') absent++
      else if (s==='sick') sick++
      else if (s==='leave') leave++
      else if (s==='half') half++
    })
    return { present, late, absent, sick, leave, half }
  }

  const renderToday = () => (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ padding:'7px 11px', border:`1px solid ${T.border}`, borderRadius:8, fontSize:13, fontFamily:'inherit', color:T.dark, background:T.bg, cursor:'pointer' }}/>
      </div>
      {deptGroups.map(group => (
        <div key={group.dept} style={{ marginBottom:20 }}>
          <div style={{ background:DEPT_COLOR[group.dept], borderRadius:'10px 10px 0 0', padding:'12px 16px' }}>
            <span style={{ color:'#fff', fontWeight:700, fontSize:14 }}>🏢 {group.name}</span>
            <span style={{ color:'rgba(255,255,255,0.6)', fontSize:11, marginLeft:10 }}>{scheduleLabel(group.dept)}</span>
          </div>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:'0 0 10px 10px', overflow:'hidden' }}>
            {group.users.map((u: any, i: number) => {
              const status = getStatus(u.id, date)
              const rec    = getRec(u.id, date)
              const sc     = ATT_STATUS[status] || ATT_STATUS.present
              return (
                <div key={u.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 16px',
                  borderBottom:i<group.users.length-1?`1px solid ${T.border}`:'none',
                  background:['absent','sick'].includes(status)?'#FFF5F5':status==='late'?'#FFFBEB':'#fff' }}>
                  <Av u={u} size={36}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:T.dark }}>{u.name}</div>
                    <div style={{ fontSize:10, color:T.gold }}>{u.position_name||''}</div>
                    {rec?.late_mins>0 && <div style={{ fontSize:11, color:T.amber }}>Muộn {rec.late_mins} phút</div>}
                    {rec?.reason && <div style={{ fontSize:11, color:T.light }}>Lý do: {rec.reason}</div>}
                  </div>
                  {canMark && !mobile && (
                    <div style={{ display:'flex', gap:5 }}>
                      {Object.entries(ATT_STATUS).map(([st, cfg]: any) => (
                        <button key={st} onClick={() => quickMark(u, date, st)}
                          style={{ padding:'5px 9px', borderRadius:7, cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:600,
                            border:`1.5px solid ${status===st?cfg.color:T.border}`,
                            background:status===st?cfg.bg:'transparent',
                            color:status===st?cfg.color:T.light }}>
                          {cfg.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  )}
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20,
                      color:sc.color, background:sc.bg, whiteSpace:'nowrap' }}>{sc.label}</span>
                    {canMark && (
                      <button onClick={() => openEdit(u, date)}
                        style={{ padding:'5px 11px', borderRadius:7, border:`1px solid ${T.border}`,
                          background:'transparent', cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.med }}>
                        {mobile ? '✏️' : 'Chi tiết'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )

  const renderWeek = () => (
    <div>
      {deptGroups.map(group => (
        <div key={group.dept} style={{ marginBottom:20 }}>
          <div style={{ background:DEPT_COLOR[group.dept], borderRadius:'10px 10px 0 0', padding:'11px 16px' }}>
            <span style={{ color:'#fff', fontWeight:700, fontSize:14 }}>🏢 {group.name}</span>
          </div>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:'0 0 10px 10px', overflow:'hidden', overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:500 }}>
              <thead>
                <tr style={{ background:T.bg }}>
                  <th style={{ padding:'10px 14px', textAlign:'left', fontSize:12, fontWeight:600, color:T.dark, borderBottom:`1px solid ${T.border}`, minWidth:130 }}>Nhân viên</th>
                  {weekDays.map(d => (
                    <th key={d.iso} style={{ padding:'10px 8px', textAlign:'center', fontSize:11, fontWeight:600,
                      color:d.isToday?T.gold:T.light, borderBottom:`1px solid ${T.border}`,
                      background:d.isToday?T.goldBg:'transparent', minWidth:65 }}>
                      <div style={{ fontWeight:700 }}>{d.label}</div>
                      <div style={{ fontSize:13, color:d.isToday?T.gold:T.dark }}>{d.dayNum}</div>
                    </th>
                  ))}
                  <th style={{ padding:'10px 8px', textAlign:'center', fontSize:11, fontWeight:600, color:T.light, borderBottom:`1px solid ${T.border}`, minWidth:70 }}>Tổng</th>
                </tr>
              </thead>
              <tbody>
                {group.users.map((u: any, ri: number) => {
                  const ws = weekDays.reduce((acc, d) => {
                    const s = getStatus(u.id, d.iso)
                    if (['present','late'].includes(s)) acc.p++
                    if (s==='late') acc.l++
                    if (s==='absent') acc.a++
                    return acc
                  }, {p:0,l:0,a:0})
                  return (
                    <tr key={u.id} style={{ background:ri%2===0?'#fff':T.bg, borderBottom:`1px solid ${T.border}` }}>
                      <td style={{ padding:'10px 14px' }}>
                        <div style={{ fontSize:13, fontWeight:600, color:T.dark }}>{u.name}</div>
                        <div style={{ fontSize:10, color:T.gold }}>{u.position_name||''}</div>
                      </td>
                      {weekDays.map(d => {
                        const status = getStatus(u.id, d.iso)
                        const rec    = getRec(u.id, d.iso)
                        const isFuture = d.iso > todayISO()
                        return (
                          <td key={d.iso} style={{ padding:'8px', textAlign:'center', background:d.isToday?'#FFFDF5':'transparent' }}>
                            {isFuture ? <span style={{ fontSize:11, color:T.border }}>—</span> : (
                              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                                <span style={{ fontSize:16, cursor:canMark?'pointer':'default' }}
                                  onClick={() => canMark && openEdit(u, d.iso)}>
                                  {status==='present'?'✅':status==='late'?'⏰':status==='absent'?'❌':status==='sick'?'🏥':status==='leave'?'🏖️':'🌓'}
                                </span>
                                {rec?.late_mins>0 && <span style={{ fontSize:9, color:T.amber }}>+{rec.late_mins}'</span>}
                              </div>
                            )}
                          </td>
                        )
                      })}
                      <td style={{ padding:'8px', textAlign:'center' }}>
                        <div style={{ fontSize:12, fontWeight:700, color:T.green }}>{ws.p}/7</div>
                        {ws.l>0 && <div style={{ fontSize:10, color:T.amber }}>{ws.l} muộn</div>}
                        {ws.a>0 && <div style={{ fontSize:10, color:T.red }}>{ws.a} vắng</div>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )

  const renderMonth = () => {
    const workDays = monthDays.filter(d => !d.isWeekend).length
    return (
      <div>
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
          <input type="month" value={monthYear} onChange={e => setMonthYear(e.target.value)}
            style={{ padding:'7px 11px', border:`1px solid ${T.border}`, borderRadius:8, fontSize:13, fontFamily:'inherit', color:T.dark, background:T.bg, cursor:'pointer' }}/>
        </div>
        {deptGroups.map(group => (
          <div key={group.dept} style={{ marginBottom:20 }}>
            <div style={{ background:DEPT_COLOR[group.dept], borderRadius:'10px 10px 0 0', padding:'11px 16px' }}>
              <span style={{ color:'#fff', fontWeight:700, fontSize:14 }}>🏢 {group.name}</span>
              <span style={{ color:'rgba(255,255,255,0.6)', fontSize:11, marginLeft:10 }}>Tháng {mo}/{yr} — {workDays} ngày làm</span>
            </div>
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:'0 0 10px 10px', overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <TH cols={['Nhân viên','Ngày đi','Đi muộn','Vắng','Nghỉ bệnh','Nghỉ phép','Tỷ lệ']}/>
                <tbody>
                  {group.users.map((u: any, i: number) => {
                    const ms = monthSummary(u.id)
                    const pct = workDays>0 ? Math.round(ms.present/workDays*100) : 0
                    return (
                      <tr key={u.id} style={{ background:i%2===0?'#fff':T.bg, borderBottom:`1px solid ${T.border}` }}>
                        <td style={{ padding:'10px 14px' }}>
                          <div style={{ fontSize:13, fontWeight:600, color:T.dark }}>{u.name}</div>
                          <div style={{ fontSize:10, color:T.gold }}>{u.position_name||''}</div>
                        </td>
                        <td style={{ padding:'10px', textAlign:'center', fontSize:13, fontWeight:700, color:T.green }}>{ms.present}/{workDays}</td>
                        <td style={{ padding:'10px', textAlign:'center', fontSize:13, fontWeight:600, color:ms.late>0?T.amber:T.light }}>{ms.late}</td>
                        <td style={{ padding:'10px', textAlign:'center', fontSize:13, fontWeight:600, color:ms.absent>0?T.red:T.light }}>{ms.absent}</td>
                        <td style={{ padding:'10px', textAlign:'center', fontSize:13, fontWeight:600, color:ms.sick>0?T.purple:T.light }}>{ms.sick}</td>
                        <td style={{ padding:'10px', textAlign:'center', fontSize:13, fontWeight:600, color:ms.leave>0?T.blue:T.light }}>{ms.leave}</td>
                        <td style={{ padding:'10px', textAlign:'center' }}>
                          <span style={{ fontSize:14, fontWeight:700, color:pct>=90?T.green:pct>=75?T.amber:T.red }}>{pct}%</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ padding:`0 ${p} ${mobile?'80px':p}` }}>
      <Topbar mobile={mobile} title="Chấm công" subtitle="Quản lý điểm danh nhân viên"/>
      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
        {([['today','📅 Hôm nay'],['week','📊 Tuần này'],['month','📈 Tháng này']] as [string,string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id as any)}
            style={{ padding:'7px 16px', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontSize:13,
              border:`1.5px solid ${tab===id?T.gold:T.border}`,
              background:tab===id?T.goldBg:'transparent',
              color:tab===id?T.goldText:T.med,
              fontWeight:tab===id?700:400 }}>{label}</button>
        ))}
      </div>
      {tab==='today' && renderToday()}
      {tab==='week'  && renderWeek()}
      {tab==='month' && renderMonth()}

      <Modal open={!!editRow} onClose={() => setEditRow(null)}
        title={`Chấm công: ${editRow?.u?.name} — ${editRow?.d ? fmtDate(editRow.d) : ''}`}>
        <div style={{ padding:'8px 12px', background:T.bg, borderRadius:8, marginBottom:14, fontSize:12, color:T.med }}>
          {scheduleLabel(editRow?.u?.dept_id)}
        </div>
        <Sel label="Trạng thái" value={editForm.status}
          onChange={(v: string) => setEditForm(f => ({...f, status:v}))}
          options={Object.entries(ATT_STATUS).map(([v, s]: any) => ({ value:v, label:s.label }))}/>
        {editForm.status==='late' && (
          <Inp label="Số phút đi muộn" type="number"
            value={String(editForm.late_mins)}
            onChange={(v: string) => setEditForm(f => ({...f, late_mins:Number(v)}))}
            placeholder="VD: 15"/>
        )}
        {['absent','sick','half'].includes(editForm.status) && (
          <Inp label="Lý do" value={editForm.reason}
            onChange={(v: string) => setEditForm(f => ({...f, reason:v}))}
            placeholder="Nhập lý do..."/>
        )}
        <Inp label="Ghi chú" value={editForm.notes}
          onChange={(v: string) => setEditForm(f => ({...f, notes:v}))}
          placeholder="Ghi chú..."/>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
          <GoldBtn outline small onClick={() => setEditRow(null)}>Hủy</GoldBtn>
          <GoldBtn small onClick={() => saveRec(editRow.u, editRow.d)}>Lưu</GoldBtn>
        </div>
      </Modal>
    </div>
  )
}

// ══ KẾT THÚC PHẦN 4A — Paste tiếp Phần 4B bên dưới ══
// ═══════════════════════════════════════════════
// PHẦN 4B — Paste nối tiếp bên dưới Phần 4A
// ═══════════════════════════════════════════════

function Overtime({ user, allUsers, mobile }: any) {
  const [requests, setRequests]     = useState<any[]>([])
  const [show, setShow]             = useState(false)
  const [reviewItem, setReviewItem] = useState<any>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [form, setForm]             = useState({ date:'', start_time:'', end_time:'', reason:'' })
  const [tab, setTab]               = useState('mine')
  const [monthFilter, setMonthFilter] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  })
  const p = mobile ? '16px' : '24px'

  const canApprove = getPerm(user).approveOT
  const canAll     = getPerm(user).viewAllDashboard
  const dids = allUsers.filter((u: any) => u.dept_id === user.dept_id).map((u: any) => u.id)

  useEffect(() => {
    db.from('overtime_requests').select('*').order('created_at', { ascending:false })
      .then(({ data }) => setRequests(data || []))
  }, [])

  const myReqs  = requests.filter((r: any) => r.user_id === user.id)
  const pending = requests.filter((r: any) => r.status==='pending' && (canAll || dids.includes(r.user_id)))
  const allV    = canAll ? requests : requests.filter((r: any) => dids.includes(r.user_id) || r.user_id===user.id)

  const [myr, mmo] = monthFilter.split('-').map(Number)
  const monthReqs = requests.filter((r: any) => {
    try {
      const d = new Date(r.date)
      return d.getFullYear()===myr && d.getMonth()+1===mmo && r.status==='approved'
    } catch { return false }
  })

  const otByUser = allUsers
    .map((u: any) => ({
      ...u,
      reqs: monthReqs.filter((r: any) => r.user_id===u.id),
      totalHours: monthReqs.filter((r: any) => r.user_id===u.id).reduce((sum: number, r: any) => sum+(r.hours||0), 0)
    }))
    .filter((u: any) => u.reqs.length > 0)

  const submit = async () => {
    if (!form.date || !form.start_time || !form.end_time || !form.reason) return
    const hours = calcHours(form.start_time, form.end_time)
    const req = { id:'ot'+Date.now(), ...form, hours, user_id:user.id, dept_id:user.dept_id,
      status:'pending', reviewed_by:'', reviewed_at:'', review_notes:'', created_at:new Date().toISOString() }
    setRequests(prev => [req, ...prev])
    const { error } = await db.from('overtime_requests').insert(req)
    if (error) {
      setRequests(prev => prev.filter((r: any) => r.id !== req.id))
      alert('❌ Gửi đơn OT thất bại: ' + error.message)
      console.error('OT insert error:', error)
      return
    }
    setShow(false)
    setForm({ date:'', start_time:'', end_time:'', reason:'' })
  }

  const review = async (id: string, status: string) => {
    const req = requests.find((r: any) => r.id===id); if (!req) return
    const updated = {...req, status, reviewed_by:user.id, reviewed_at:fmtNow(), review_notes:reviewNotes}
    setRequests(prev => prev.map((r: any) => r.id===id ? updated : r))
    await db.from('overtime_requests').upsert(updated)
    setReviewItem(null); setReviewNotes('')
  }

  const remove = async (id: string) => {
    if (!confirm('Xóa đơn OT này?')) return
    setRequests(prev => prev.filter((r: any) => r.id!==id))
    await db.from('overtime_requests').delete().eq('id', id)
  }

  const RS: any = {
    pending:  { label:'⏳ Chờ duyệt', color:T.amber, bg:T.amberBg },
    approved: { label:'✅ Đã duyệt',  color:T.green, bg:T.greenBg },
    rejected: { label:'❌ Từ chối',   color:T.red,   bg:T.redBg   },
  }

  const tabList: Array<[string,string]> = [['mine', `📋 Đơn của tôi (${myReqs.length})`]]
  if (canApprove) {
    tabList.push(['pending', `⏳ Chờ duyệt (${pending.length})`])
    tabList.push(['all', `📊 Tất cả (${allV.length})`])
    tabList.push(['summary', '📈 Tổng kết tháng'])
  }

  const displayList = tab==='mine' ? myReqs : tab==='pending' ? pending : allV

  return (
    <div style={{ padding:`0 ${p} ${mobile?'80px':p}` }}>
      <Topbar mobile={mobile} title="Làm thêm giờ (OT)"
        subtitle={canApprove && pending.length>0 ? `${pending.length} đơn chờ duyệt` : 'Quản lý OT'}
        action={<GoldBtn small onClick={() => setShow(true)}>+ Đăng ký OT</GoldBtn>}/>

      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
        {tabList.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ padding:'6px 13px', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontSize:12,
              border:`1.5px solid ${tab===id?T.gold:T.border}`,
              background:tab===id?T.goldBg:'transparent',
              color:tab===id?T.goldText:T.med,
              fontWeight:tab===id?600:400 }}>{label}</button>
        ))}
      </div>

      {tab==='summary' ? (
        <div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
            <input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
              style={{ padding:'7px 11px', border:`1px solid ${T.border}`, borderRadius:8, fontSize:13, fontFamily:'inherit', color:T.dark, background:T.bg, cursor:'pointer' }}/>
          </div>
          {otByUser.length===0 ? (
            <Card style={{ textAlign:'center', padding:'40px', color:T.light }}>
              <div style={{ fontSize:32, marginBottom:8 }}>⏱️</div>
              <div style={{ fontSize:14 }}>Không có OT trong tháng {mmo}/{myr}</div>
            </Card>
          ) : (
            <Card style={{ padding:0, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <TH cols={['Nhân viên','Số lần OT','Tổng giờ','Chi tiết ngày OT']}/>
                <tbody>
                  {otByUser.map((u: any, i: number) => (
                    <tr key={u.id} style={{ background:i%2===0?'#fff':T.bg, borderBottom:`1px solid ${T.border}` }}>
                      <td style={{ padding:'12px 14px' }}>
                        <div style={{ fontSize:13, fontWeight:600, color:T.dark }}>{u.name}</div>
                        <div style={{ fontSize:10, color:T.gold }}>{u.position_name||u.dept_name}</div>
                      </td>
                      <td style={{ padding:'12px', textAlign:'center', fontSize:14, fontWeight:700, color:T.blue }}>{u.reqs.length}</td>
                      <td style={{ padding:'12px', textAlign:'center', fontSize:14, fontWeight:700, color:T.amber }}>{u.totalHours}h</td>
                      <td style={{ padding:'12px', fontSize:11, color:T.med }}>
                        {u.reqs.map((r: any) => (
                          <div key={r.id}>{fmtDate(r.date)}: {r.start_time}–{r.end_time} ({r.hours}h)</div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {displayList.length===0 ? (
            <Card style={{ textAlign:'center', padding:'40px', color:T.light }}>
              <div style={{ fontSize:32, marginBottom:8 }}>⏱️</div>
              <div style={{ fontSize:14 }}>{tab==='pending'?'Không có đơn chờ duyệt':'Chưa có đơn OT nào'}</div>
            </Card>
          ) : displayList.map((r: any) => {
            const req = allUsers.find((u: any) => u.id===r.user_id)
            const rev = allUsers.find((u: any) => u.id===r.reviewed_by)
            const sc  = RS[r.status] || {}
            const canReview = canApprove && r.status==='pending' && (canAll || dids.includes(r.user_id))
            const canDelete = canAll || r.user_id===user.id
            return (
              <div key={r.id} style={{ background:T.card,
                border:`1px solid ${r.status==='pending'?T.amber:T.border}`,
                borderRadius:12, padding:'16px 18px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:6, flexWrap:'wrap' }}>
                      {req && <Av u={req} size={28} showTitle/>}
                      <span style={{ fontSize:13, fontWeight:700, padding:'2px 9px', borderRadius:20, color:T.goldText, background:T.goldBg }}>
                        ⏱️ {r.hours}h OT
                      </span>
                    </div>
                    <div style={{ fontSize:12, color:T.dark, marginBottom:3 }}>📅 {fmtDate(r.date)} · {r.start_time} → {r.end_time}</div>
                    <div style={{ fontSize:12, color:T.med }}>Lý do: {r.reason}</div>
                    {r.review_notes && <div style={{ fontSize:11, color:T.blue, marginTop:4 }}>💬 {r.review_notes}</div>}
                    {rev && <div style={{ fontSize:11, color:T.light, marginTop:3 }}>Xử lý bởi {rev.name} • {r.reviewed_at}</div>}
                    <div style={{ fontSize:11, color:T.light, marginTop:3 }}>Gửi lúc: {r.created_at}</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, color:sc.color, background:sc.bg }}>{sc.label}</span>
                    {canReview && (
                      <button onClick={() => { setReviewItem(r); setReviewNotes('') }}
                        style={{ padding:'6px 13px', borderRadius:7, border:`1.5px solid ${T.gold}`,
                          background:T.goldBg, cursor:'pointer', fontSize:12, fontFamily:'inherit', color:T.goldText, fontWeight:600 }}>
                        Xem xét
                      </button>
                    )}
                    {canDelete && r.status==='pending' && (
                      <button onClick={() => remove(r.id)}
                        style={{ padding:'5px 11px', borderRadius:7, border:`1px solid ${T.redBg}`,
                          background:T.redBg, cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.red }}>
                        🗑️ Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal đăng ký OT */}
      <Modal open={show} onClose={() => setShow(false)} title="Đăng ký làm thêm giờ">
        <Inp label="Ngày làm thêm *" type="date" value={form.date}
          onChange={(v: string) => setForm(f => ({...f, date:v}))}/>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Inp label="Giờ bắt đầu *" type="time" value={form.start_time}
            onChange={(v: string) => setForm(f => ({...f, start_time:v}))}/>
          <Inp label="Giờ kết thúc *" type="time" value={form.end_time}
            onChange={(v: string) => setForm(f => ({...f, end_time:v}))}/>
        </div>
        {form.start_time && form.end_time && calcHours(form.start_time, form.end_time) > 0 && (
          <div style={{ padding:'8px 12px', background:T.goldBg, borderRadius:8, fontSize:12, color:T.goldText, marginBottom:13, fontWeight:600 }}>
            ⏱️ Tổng: {calcHours(form.start_time, form.end_time)} giờ OT
          </div>
        )}
        <Inp label="Lý do làm thêm *" value={form.reason}
          onChange={(v: string) => setForm(f => ({...f, reason:v}))}
          placeholder="Nhập lý do..."/>
        <div style={{ fontSize:11, color:T.light, marginBottom:14 }}>Đơn sẽ gửi tới quản lý để phê duyệt.</div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
          <GoldBtn outline small onClick={() => setShow(false)}>Hủy</GoldBtn>
          <GoldBtn small onClick={submit} disabled={!form.date||!form.start_time||!form.end_time||!form.reason}>Gửi đơn</GoldBtn>
        </div>
      </Modal>

      {/* Modal duyệt OT */}
      <Modal open={!!reviewItem} onClose={() => setReviewItem(null)} title="Xét duyệt đơn OT">
        {reviewItem && (<>
          <div style={{ padding:'12px 14px', background:T.bg, borderRadius:8, marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:600, color:T.dark, marginBottom:6 }}>
              {allUsers.find((u: any) => u.id===reviewItem.user_id)?.name}
            </div>
            <div style={{ fontSize:12, color:T.med }}>📅 {fmtDate(reviewItem.date)}</div>
            <div style={{ fontSize:12, color:T.med }}>{reviewItem.start_time} → {reviewItem.end_time} ({reviewItem.hours}h)</div>
            <div style={{ fontSize:12, color:T.dark, marginTop:6 }}>Lý do: {reviewItem.reason}</div>
          </div>
          <Inp label="Ghi chú phản hồi" value={reviewNotes} onChange={setReviewNotes} placeholder="Nhập ghi chú (tùy chọn)..."/>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
            <GoldBtn outline small onClick={() => setReviewItem(null)}>Hủy</GoldBtn>
            <GoldBtn danger small onClick={() => review(reviewItem.id, 'rejected')}>❌ Từ chối</GoldBtn>
            <GoldBtn small onClick={() => review(reviewItem.id, 'approved')}>✅ Duyệt</GoldBtn>
          </div>
        </>)}
      </Modal>
    </div>
  )
}

// ══ KẾT THÚC PHẦN 4B — Paste tiếp Phần 5 bên dưới ══
// ═══════════════════════════════════════════════
// PHẦN 5/6 — Paste nối tiếp bên dưới Phần 4
// ═══════════════════════════════════════════════

// ── LEAVE ─────────────────────────────────────────
function Leave({ user, allUsers, leaveRequests, setLeaveRequests, mobile }: any) {
  const [show, setShow]             = useState(false)
  const [reviewItem, setReviewItem] = useState<any>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [form, setForm]             = useState({ start_date:'', end_date:'', type:'annual', reason:'', half_day:'', half_day_session:'' })
  const [tab, setTab]               = useState('mine')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const p = mobile ? '16px' : '24px'

  // Refresh data mỗi khi mở tab Nghỉ phép
  const fetchingRef = useRef(true)
  useEffect(() => {
    fetchingRef.current = true
    db.from('leave_requests').select('*').order('created_at', { ascending:false })
      .then(({ data }) => {
        // Chỉ ghi đè nếu fetch vẫn hợp lệ VÀ DB trả về data có nội dung
        // Nếu data = [] hoặc null (có thể do Supabase RLS chặn), giữ nguyên state hiện tại
        if (data && data.length > 0 && fetchingRef.current) setLeaveRequests(data)
      })
    return () => { fetchingRef.current = false }
  }, [])

  const canApprove = getPerm(user).approveLeave
  const canAll     = getPerm(user).viewAllDashboard
  const dids = allUsers.filter((u: any) => u.dept_id === user.dept_id).map((u: any) => u.id)

  // Xác định level duyệt
  const getApproverLevel = (requestUserId: string, days: number) => {
    const reqUser = allUsers.find((u: any) => u.id === requestUserId)
    const reqPerm = getPerm(reqUser)
    if (reqPerm.approveLeave || reqPerm.viewAllDashboard) return 'admin_only'
    if (days <= 3) return 'mgr_only'   // 0.5 ngày cũng vào đây
    return 'mgr_then_admin'
  }
  const currentStep = (r: any) => r.status || 'pending_mgr'
  const canReviewReq = (r: any) => {
    if (['approved','rejected'].includes(r.status)) return false
    if (r.user_id === user.id) return false
    const level = r.approver_level || getApproverLevel(r.user_id, r.days||1)
    const step  = currentStep(r)
    if (canAll) return true
    if (!canApprove) return false
    if (!dids.includes(r.user_id)) return false
    if (level === 'admin_only') return false
    return step === 'pending_mgr'
  }
  const myReqs  = leaveRequests.filter((r: any) => r.user_id === user.id)
  const pending = leaveRequests.filter((r: any) => canReviewReq(r))
  const allV    = canAll
    ? leaveRequests
    : leaveRequests.filter((r: any) => dids.includes(r.user_id) || r.user_id === user.id)
  const tabList: Array<[string,string]> = [['mine', `📋 Đơn của tôi (${myReqs.length})`]]
  if (canAll || canApprove) {
    tabList.push(['pending', `⏳ Chờ duyệt (${pending.length})`])
    tabList.push(['all', `📊 Tất cả (${allV.length})`])
  }

  const displayList = tab==='mine' ? myReqs : tab==='pending' ? pending : allV

  const submit = async () => {
    if (!form.start_date || !form.end_date || !form.reason) return
    setSubmitting(true); setSubmitError('')
    const isHalf = form.half_day === 'yes'
    const days = isHalf ? 0.5 : daysBetween(form.start_date, form.end_date)
    const approver = getApproverLevel(user.id, days)
    const initStatus = approver === 'admin_only' ? 'pending_admin' : 'pending_mgr'
    const now = new Date().toISOString()
    const tempId = 'lr' + Date.now()
    const req = { id:tempId, ...form, user_id:user.id, dept_id:user.dept_id,
      days, approver_level:approver, status:initStatus, mgr_reviewed_by:'', mgr_reviewed_at:'',
      reviewed_by:'', reviewed_at:'', review_notes:'', created_at:now }

    // Chặn useEffect fetch đang pending đè lên optimistic update
    fetchingRef.current = false
    // Optimistic update: thêm đơn vào list ngay lập tức
    setLeaveRequests((prev: any) => [req, ...prev])

    const { error } = await db.from('leave_requests').insert(req)
    if (error) {
      // Insert thất bại → rollback + hiện lỗi rõ ràng
      setLeaveRequests((prev: any) => prev.filter((r: any) => r.id !== tempId))
      const errMsg = '❌ Gửi đơn thất bại: ' + (error.message || 'Lỗi kết nối Supabase')
      setSubmitError(errMsg)
      alert(errMsg + '\n\nVui lòng kiểm tra kết nối và thử lại.')
      console.error('Leave insert error:', error)
      setSubmitting(false)
      return
    }

    // Insert thành công → lưu backup vào localStorage để tránh mất khi reload
    try {
      const stored = JSON.parse(localStorage.getItem('la_leave_backup') || '[]')
      localStorage.setItem('la_leave_backup', JSON.stringify([req, ...stored]))
    } catch {}

    setSubmitting(false)
    setShow(false)
    setForm({ start_date:'', end_date:'', type:'annual', reason:'', half_day:'', half_day_session:'' })
  }

  const review = async (id: string, action: string) => {
    const req = leaveRequests.find((r: any) => r.id === id); if (!req) return
    const days  = req.days || 1
    const level = req.approver_level || getApproverLevel(req.user_id, days)
    const step  = currentStep(req)

    let newStatus = action  // 'approved' or 'rejected'
    // Quản lý duyệt bước 1 của đơn 4+ ngày → chuyển sang bước 2 (admin)
    if (action === 'approved' && !canAll && level === 'mgr_then_admin' && step === 'pending_mgr') {
      newStatus = 'pending_admin'
    }

    const updated = {...req, status:newStatus,
      ...(canAll ? { reviewed_by:user.id, reviewed_at:fmtNow(), review_notes:reviewNotes }
                 : { mgr_reviewed_by:user.id, mgr_reviewed_at:fmtNow(), review_notes:reviewNotes }),
    }
    setLeaveRequests((prev: any) => prev.map((r: any) => r.id === id ? updated : r))
    await db.from('leave_requests').upsert(updated)
    try {
      const stored = JSON.parse(localStorage.getItem('la_leave_backup') || '[]')
      localStorage.setItem('la_leave_backup', JSON.stringify(stored.map((r: any) => r.id === id ? updated : r)))
    } catch {}
    setReviewItem(null); setReviewNotes('')
  }

  const remove = async (id: string) => {
    if (!confirm('Xóa đơn nghỉ phép này?')) return
    setLeaveRequests((prev: any) => prev.filter((r: any) => r.id !== id))
    await db.from('leave_requests').delete().eq('id', id)
    // Xóa khỏi localStorage backup
    try {
      const stored = JSON.parse(localStorage.getItem('la_leave_backup') || '[]')
      localStorage.setItem('la_leave_backup', JSON.stringify(stored.filter((r: any) => r.id !== id)))
    } catch {}
  }

  const LS: any = {
    pending_mgr:   { label:'⏳ Chờ QM duyệt',  color:T.amber,  bg:T.amberBg  },
    pending_admin: { label:'⏳ Chờ GĐ duyệt',  color:T.purple, bg:T.purpleBg },
    pending:       { label:'⏳ Chờ duyệt',      color:T.amber,  bg:T.amberBg  },
    approved:      { label:'✅ Đã duyệt',        color:T.green,  bg:T.greenBg  },
    rejected:      { label:'❌ Từ chối',         color:T.red,    bg:T.redBg    },
  }

  const approverLabel = (r: any) => {
    const lvl = r.approver_level || getApproverLevel(r.user_id, r.days||1)
    if (lvl === 'admin_only')     return '👤 GĐ/Admin duyệt'
    if (lvl === 'mgr_then_admin') return '👥 QM → GĐ/Admin (2 bước)'
    return '👤 Quản lý duyệt'
  }

  return (
    <div style={{ padding:`0 ${p} ${mobile?'80px':p}` }}>
      <Topbar mobile={mobile} title="Nghỉ phép"
        subtitle={canApprove && pending.length > 0 ? `${pending.length} đơn chờ duyệt` : 'Quản lý nghỉ phép'}
        action={<GoldBtn small onClick={() => setShow(true)}>+ Xin nghỉ phép</GoldBtn>}/>

      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
        {tabList.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ padding:'6px 13px', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontSize:12,
              border:`1.5px solid ${tab===id?T.gold:T.border}`,
              background:tab===id?T.goldBg:'transparent',
              color:tab===id?T.goldText:T.med,
              fontWeight:tab===id?600:400 }}>
            {label}
          </button>
        ))}
      </div>

      {displayList.length === 0 ? (
        <Card style={{ textAlign:'center', padding:'40px', color:T.light }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🏖️</div>
          <div style={{ fontSize:14, fontWeight:500 }}>
            {tab==='pending' ? 'Không có đơn chờ duyệt' : 'Chưa có đơn nghỉ phép nào'}
          </div>
        </Card>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {displayList.map((r: any) => {
            const req = allUsers.find((u: any) => u.id === r.user_id)
            const rev = allUsers.find((u: any) => u.id === r.reviewed_by)
            const sc = LS[r.status] || {}
            const days = r.days || daysBetween(r.start_date, r.end_date)
            const canRev = canReviewReq(r)
            const canDel = (canAll || r.user_id === user.id || (canApprove && dids.includes(r.user_id)))
            return (
              <div key={r.id} style={{ background:T.card,
                border:`1px solid ${r.status==='pending'?T.amber:T.border}`,
                borderRadius:12, padding:'16px 18px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:6, flexWrap:'wrap' }}>
                      {req && <Av u={req} size={28} showTitle/>}
                      <span style={{ fontSize:13, fontWeight:700, padding:'2px 9px', borderRadius:20, color:T.goldText, background:T.goldBg }}>
                        {LEAVE_TYPE[r.type]||r.type}
                      </span>
                      <span style={{ fontSize:11, color:T.light }}>
                        {r.half_day==='yes'
                          ? `🌓 Nửa ngày${r.half_day_session==='morning'?' (sáng)':r.half_day_session==='afternoon'?' (chiều)':''}`
                          : `${days} ngày`}
                      </span>
                      <span style={{ fontSize:10, padding:'2px 7px', borderRadius:20, background:T.grayBg, color:T.gray }}>
                        {approverLabel(r)}
                      </span>
                    </div>
                    <div style={{ fontSize:12, color:T.dark, marginBottom:3 }}>
                      {r.half_day==='yes'
                        ? <>🌓 {fmtDate(r.start_date)} — {r.half_day_session==='morning'?'Buổi sáng':'Buổi chiều'}</>
                        : <>📅 {fmtDate(r.start_date)} → {fmtDate(r.end_date)}</>
                      }
                    </div>
                    <div style={{ fontSize:12, color:T.med }}>Lý do: {r.reason}</div>
                    {r.review_notes && <div style={{ fontSize:11, color:T.blue, marginTop:4 }}>💬 {r.review_notes}</div>}
                    {rev && r.reviewed_at && <div style={{ fontSize:11, color:T.light, marginTop:3 }}>Xử lý bởi {rev.name} • {r.reviewed_at}</div>}
                    <div style={{ fontSize:11, color:T.light, marginTop:3 }}>Gửi lúc: {r.created_at}</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, color:sc.color, background:sc.bg }}>{sc.label}</span>
                    {canRev && (
                      <button onClick={() => { setReviewItem(r); setReviewNotes('') }}
                        style={{ padding:'6px 13px', borderRadius:7, border:`1.5px solid ${T.gold}`,
                          background:T.goldBg, cursor:'pointer', fontSize:12, fontFamily:'inherit', color:T.goldText, fontWeight:600 }}>
                        Xem xét
                      </button>
                    )}
                    {canDel && (
                      <button onClick={() => remove(r.id)}
                        style={{ padding:'5px 11px', borderRadius:7, border:`1px solid ${T.redBg}`,
                          background:T.redBg, cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.red }}>
                        🗑️ Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={show} onClose={() => setShow(false)} title="Xin nghỉ phép">
        <Sel label="Loại nghỉ phép" value={form.type}
          onChange={(v: string) => setForm((f: any) => ({
            ...f, type:v,
            half_day: v === 'half' ? 'yes' : '',
            start_date: v === 'half' ? f.start_date : f.start_date,
            end_date:   v === 'half' ? f.start_date : f.end_date,
          }))}
          options={Object.entries(LEAVE_TYPE).map(([v, l]) => ({ value:v, label:l }))}/>

        {/* Chế độ nửa ngày */}
        {form.half_day === 'yes' ? (
          <div>
            <Inp label="Ngày nghỉ *" type="date" value={form.start_date}
              onChange={(v: string) => setForm((f: any) => ({...f, start_date:v, end_date:v}))}/>
            <div style={{ marginBottom:13 }}>
              <div style={{ fontSize:12, fontWeight:500, color:T.med, marginBottom:6 }}>Chọn buổi *</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[['morning','🌅 Buổi sáng'],['afternoon','🌆 Buổi chiều']].map(([val, lbl]) => (
                  <button key={val} onClick={() => setForm((f: any) => ({...f, half_day_session:val}))}
                    style={{ padding:'12px', borderRadius:9,
                      border:`2px solid ${form.half_day_session===val?T.gold:T.border}`,
                      background:form.half_day_session===val?T.goldBg:T.bg,
                      cursor:'pointer', fontFamily:'inherit',
                      fontWeight:form.half_day_session===val?700:400,
                      color:form.half_day_session===val?T.goldText:T.med,
                      fontSize:13 }}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Inp label="Từ ngày *" type="date" value={form.start_date}
              onChange={(v: string) => setForm((f: any) => ({...f, start_date:v}))}/>
            <Inp label="Đến ngày *" type="date" value={form.end_date}
              onChange={(v: string) => setForm((f: any) => ({...f, end_date:v, start_date:f.start_date||v}))}/>
          </div>
        )}

        {/* Summary */}
        {form.start_date && (form.half_day === 'yes' || form.end_date) && (
          <div style={{ padding:'8px 12px', background:T.goldBg, borderRadius:8, fontSize:12, color:T.goldText, marginBottom:13, fontWeight:600 }}>
            {form.half_day === 'yes' ? (
              <>🌓 Nửa ngày {form.half_day_session==='morning'?'(Buổi sáng)':form.half_day_session==='afternoon'?'(Buổi chiều)':''} — {fmtDate(form.start_date)} — 📌 Quản lý phòng duyệt</>
            ) : (
              <>📅 Tổng {daysBetween(form.start_date, form.end_date)} ngày — {
                getApproverLevel(user.id, daysBetween(form.start_date, form.end_date)) === 'admin_only'
                  ? '📌 GĐ/Admin duyệt'
                  : getApproverLevel(user.id, daysBetween(form.start_date, form.end_date)) === 'mgr_then_admin'
                  ? '📌 Quản lý duyệt → GĐ/Admin duyệt (2 bước)'
                  : '📌 Quản lý phòng duyệt'
              }</>
            )}
          </div>
        )}
        <Inp label="Lý do *" value={form.reason} onChange={(v: string) => setForm((f: any) => ({...f, reason:v}))} placeholder="Nhập lý do xin nghỉ..."/>
        {submitError && <div style={{ fontSize:12, color:T.red, marginBottom:10 }}>{submitError}</div>}
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
          <GoldBtn outline small onClick={() => { setShow(false); setSubmitError('') }}>Hủy</GoldBtn>
          <GoldBtn small onClick={submit}
            disabled={submitting || !form.start_date || !form.reason ||
              (form.half_day==='yes' ? !form.half_day_session : !form.end_date)}>
            {submitting ? '⏳ Đang gửi...' : 'Gửi đơn'}
          </GoldBtn>
        </div>
      </Modal>

      <Modal open={!!reviewItem} onClose={() => setReviewItem(null)} title="Xét duyệt đơn nghỉ phép">
        {reviewItem && (<>
          <div style={{ padding:'12px 14px', background:T.bg, borderRadius:8, marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:600, color:T.dark, marginBottom:6 }}>
              {allUsers.find((u: any) => u.id === reviewItem.user_id)?.name}
            </div>
            <div style={{ fontSize:12, color:T.med }}>
              {LEAVE_TYPE[reviewItem.type]} —{' '}
              {reviewItem.half_day==='yes'
                ? `🌓 Nửa ngày ${reviewItem.half_day_session==='morning'?'(sáng)':reviewItem.half_day_session==='afternoon'?'(chiều)':''}`
                : `${reviewItem.days} ngày`}
            </div>
            <div style={{ fontSize:12, color:T.med }}>
              {reviewItem.half_day==='yes'
                ? <>🌓 {fmtDate(reviewItem.start_date)} — {reviewItem.half_day_session==='morning'?'Buổi sáng':'Buổi chiều'}</>
                : <>📅 {fmtDate(reviewItem.start_date)} → {fmtDate(reviewItem.end_date)}</>
              }
            </div>
            <div style={{ fontSize:12, color:T.dark, marginTop:6 }}>Lý do: {reviewItem.reason}</div>
          </div>
          <Inp label="Ghi chú phản hồi" value={reviewNotes} onChange={setReviewNotes} placeholder="Nhập ghi chú (tùy chọn)..."/>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
            <GoldBtn outline small onClick={() => setReviewItem(null)}>Hủy</GoldBtn>
            <GoldBtn danger small onClick={() => review(reviewItem.id, 'rejected')}>❌ Từ chối</GoldBtn>
            <GoldBtn small onClick={() => review(reviewItem.id, 'approved')}>✅ Duyệt</GoldBtn>
          </div>
        </>)}
      </Modal>
    </div>
  )
}

// ── ANNOUNCEMENTS ─────────────────────────────────
function Announcements({ user, allUsers, mobile }: any) {
  const [items, setItems]       = useState<any[]>([])
  const [reads, setReads]       = useState<any[]>([])
  const [show, setShow]         = useState(false)
  const [form, setForm]         = useState({ title:'', content:'', target_dept:'all', priority:'normal' })
  const [expanded, setExpanded] = useState<string[]>([])
  const p = mobile ? '16px' : '24px'
  const canCreate = getPerm(user).announceAll || getPerm(user).createTask

  useEffect(() => {
    Promise.all([
      db.from('announcements').select('*').order('created_at', { ascending:false }),
      db.from('announcement_reads').select('*').eq('user_id', user.id),
    ]).then(([ann, rd]) => { setItems(ann.data||[]); setReads(rd.data||[]) })
  }, [user.id])

  const myItems = items
    .filter(a => a.target_dept==='all' || a.target_dept===user.dept_id)
    .sort((a, b) => {
      if (a.priority==='urgent' && b.priority!=='urgent') return -1
      if (b.priority==='urgent' && a.priority!=='urgent') return 1
      return b.created_at.localeCompare(a.created_at)
    })

  const isRead = (id: string) => reads.some(r => r.announcement_id===id)
  const unread = myItems.filter(a => !isRead(a.id)).length

  const markRead = async (id: string) => {
    if (isRead(id)) return
    const rec = { id:`rd_${id}_${user.id}`, announcement_id:id, user_id:user.id, read_at:fmtNow() }
    setReads(prev => [...prev, rec])
    await db.from('announcement_reads').upsert(rec)
  }

  const toggle = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x!==id) : [...prev, id])
    markRead(id)
  }

  const create = async () => {
    if (!form.title || !form.content) return
    const newAnn = { id:'ann'+Date.now(), ...form, author_id:user.id, created_at:fmtNow() }
    setItems(prev => [newAnn, ...prev])
    await db.from('announcements').insert(newAnn)
    setShow(false)
    setForm({ title:'', content:'', target_dept:'all', priority:'normal' })
  }

  const remove = async (id: string) => {
    if (!confirm('Xóa thông báo này?')) return
    setItems(prev => prev.filter(a => a.id!==id))
    await db.from('announcements').delete().eq('id', id)
  }

  return (
    <div style={{ padding:`0 ${p} ${mobile?'80px':p}` }}>
      <Topbar mobile={mobile} title="Thông báo nội bộ"
        subtitle={unread>0?`${unread} thông báo chưa đọc`:'Đã đọc hết'}
        action={canCreate && <GoldBtn small onClick={() => setShow(true)}>+ Tạo thông báo</GoldBtn>}/>

      {myItems.length===0 ? (
        <Card style={{ textAlign:'center', padding:'48px', color:T.light }}>
          <div style={{ fontSize:36, marginBottom:10 }}>📣</div>
          <div style={{ fontSize:14, fontWeight:500 }}>Chưa có thông báo nào</div>
        </Card>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {myItems.map(a => {
            const read = isRead(a.id), exp = expanded.includes(a.id)
            const urgent = a.priority==='urgent'
            const auth = allUsers.find((u: any) => u.id===a.author_id)
            const targetLabel = a.target_dept==='all'?'Toàn công ty':DEPT_NAME[a.target_dept]||a.target_dept
            return (
              <div key={a.id} style={{ background:T.card,
                border:`2px solid ${urgent?T.red:read?T.border:T.gold}`,
                borderRadius:12, overflow:'hidden' }}>
                {urgent && <div style={{ background:T.red, padding:'5px 14px', fontSize:11, fontWeight:700, color:'#fff' }}>🔴 THÔNG BÁO KHẨN</div>}
                <div style={{ padding:'14px 16px', cursor:'pointer' }} onClick={() => toggle(a.id)}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                        {!read && <div style={{ width:8, height:8, borderRadius:'50%', background:T.gold, flexShrink:0 }}/>}
                        <div style={{ fontSize:14, fontWeight:read?500:700, color:T.dark }}>{a.title}</div>
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                        <span style={{ fontSize:10, padding:'2px 7px', borderRadius:20, fontWeight:600, background:T.grayBg, color:T.gray }}>📢 {targetLabel}</span>
                        {auth && <span style={{ fontSize:11, color:T.light }}>bởi {auth.name}</span>}
                        <span style={{ fontSize:11, color:T.light }}>{a.created_at}</span>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      {(getPerm(user).announceAll || a.author_id===user.id) && (
                        <button onClick={e => { e.stopPropagation(); remove(a.id) }}
                          style={{ padding:'4px 8px', borderRadius:6, border:`1px solid ${T.redBg}`, background:T.redBg, cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.red }}>🗑️</button>
                      )}
                      <span style={{ color:T.light, fontSize:14 }}>{exp?'▲':'▼'}</span>
                    </div>
                  </div>
                </div>
                {exp && (
                  <div style={{ padding:'0 16px 16px', borderTop:`1px solid ${T.border}` }}>
                    <div style={{ fontSize:13, color:T.dark, lineHeight:1.7, marginTop:12, whiteSpace:'pre-wrap' }}>{a.content}</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal open={show} onClose={() => setShow(false)} title="Tạo thông báo mới" wide>
        <Inp label="Tiêu đề *" value={form.title} onChange={(v: string) => setForm(f => ({...f, title:v}))} placeholder="Tiêu đề thông báo..."/>
        <div style={{ marginBottom:13 }}>
          <div style={{ fontSize:12, fontWeight:500, color:T.med, marginBottom:5 }}>Nội dung *</div>
          <textarea value={form.content} onChange={e => setForm(f => ({...f, content:e.target.value}))}
            placeholder="Nhập nội dung thông báo..."
            style={{ width:'100%', padding:'8px 11px', border:`1px solid ${T.border}`, borderRadius:8,
              fontSize:13, fontFamily:'inherit', color:T.dark, background:T.bg,
              boxSizing:'border-box', outline:'none', minHeight:120, resize:'vertical' }}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Sel label="Gửi tới" value={form.target_dept} onChange={(v: string) => setForm(f => ({...f, target_dept:v}))}
            options={[{value:'all',label:'📢 Toàn công ty'},{value:'kho',label:'🏭 Phòng Kho'},{value:'sale',label:'💼 Phòng Sale'},{value:'vp',label:'🏢 Văn phòng'}]}/>
          <Sel label="Mức độ" value={form.priority} onChange={(v: string) => setForm(f => ({...f, priority:v}))}
            options={[{value:'normal',label:'📋 Bình thường'},{value:'urgent',label:'🔴 Khẩn cấp'}]}/>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
          <GoldBtn outline small onClick={() => setShow(false)}>Hủy</GoldBtn>
          <GoldBtn small onClick={create} disabled={!form.title||!form.content}>Đăng thông báo</GoldBtn>
        </div>
      </Modal>
    </div>
  )
}

// ── SHORTAGE ITEMS ───────────────────────────────
function ShortageItems({ user, allUsers, mobile }: any) {
  const [items,        setItems]       = useState<any[]>([])
  const [products,     setProducts]    = useState<any[]>([])
  const [showAdd,      setShowAdd]     = useState(false)
  const [showProdMgmt, setShowProdMgmt] = useState(false)
  const [search,       setSearch]      = useState('')
  const [selectedProd, setSelectedProd] = useState<any>(null)
  const [note,         setNote]        = useState('')
  const [dupWarning,   setDupWarning]  = useState<any>(null)
  const [mgrTab,       setMgrTab]      = useState('pending')
  const [sortBy,       setSortBy]      = useState<'hot'|'date'>('hot')
  const [prodForm,     setProdForm]    = useState({ name:'', code:'', unit:'', stock:'' })
  const p    = mobile ? '16px' : '24px'
  const perm = getPerm(user)
  const isManager = perm.viewAllDashboard || perm.approveLeave
  const isSale    = user.dept_id === 'sale'

  useEffect(() => {
    Promise.all([
      db.from('shortage_items').select('*').order('created_at', { ascending:false }),
      db.from('products').select('*').eq('active', true).order('name'),
    ]).then(([si, pr]) => { setItems(si.data||[]); setProducts(pr.data||[]) })
  }, [])

  // Auto-filter: ẩn hàng đã về > 3 ngày
  const visibleItems = useMemo(() => items.filter(item => {
    if (item.status !== 'arrived') return true
    if (!item.arrived_at) return true
    return (Date.now() - new Date(item.arrived_at).getTime()) / 86400000 <= 3
  }), [items])

  // ── Fuzzy search: chuẩn hóa + match từng token ──
  const norm = (s: string) => (s||'').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/đ/g,'d')
  const fuzzy = (prod: any, q: string) => {
    if (!q.trim()) return true
    const hay = norm(prod.name+' '+(prod.code||'')+' '+(prod.unit||''))
    return norm(q).split(/\s+/).filter(Boolean).every(t => hay.includes(t))
  }
  const searchResults = useMemo(() => products.filter(p => fuzzy(p, search)).slice(0,15), [products, search])

  const daysRemaining = (item: any) => {
    if (!item.arrival_date) return null
    const today = new Date(); today.setHours(0,0,0,0)
    return Math.ceil((new Date(item.arrival_date).getTime() - today.getTime()) / 86400000)
  }

  // ── Report hàng thiếu ──
  const report = async () => {
    if (!selectedProd) return
    const existing = visibleItems.find(i =>
      norm(i.product_name) === norm(selectedProd.name) &&
      !['arrived','burned'].includes(i.status)
    )
    if (existing) {
      const alreadyMe = existing.reporters?.some((r: any) => r.user_id === user.id)
      setDupWarning({ type: alreadyMe ? 'self' : 'other', item: existing })
      return
    }
    const newItem = {
      id:'si'+Date.now(), product_name:selectedProd.name, product_code:selectedProd.code||'',
      kiot_stock:'',
      reporters:[{ user_id:user.id, name:user.name, reported_at:new Date().toISOString(), note }],
      status:'pending', arrival_date:'', arrival_qty:0, manager_note:'',
      arrived_at:'', archived_at:'', created_at:new Date().toISOString(), updated_at:new Date().toISOString(),
    }
    setItems(prev => [newItem, ...prev])
    const { error } = await db.from('shortage_items').insert(newItem)
    if (error) { setItems(prev => prev.filter(i => i.id !== newItem.id)); alert('❌ Lỗi: '+error.message); return }
    closeAdd()
  }

  const addReporter = async (itemId: string) => {
    const item = items.find(i => i.id === itemId); if (!item) return
    const newReporters = [...(item.reporters||[]), { user_id:user.id, name:user.name, reported_at:new Date().toISOString(), note }]
    const updated = { ...item, reporters:newReporters, updated_at:new Date().toISOString() }
    setItems(prev => prev.map(i => i.id === itemId ? updated : i))
    await db.from('shortage_items').update({ reporters:newReporters, updated_at:updated.updated_at }).eq('id', itemId)
    closeAdd()
  }

  const updateItem = async (id: string, changes: any) => {
    const upd = { ...items.find(i => i.id === id), ...changes, updated_at:new Date().toISOString() }
    setItems(prev => prev.map(i => i.id === id ? upd : i))
    await db.from('shortage_items').update({ ...changes, updated_at:upd.updated_at }).eq('id', id)
  }

  const closeAdd = () => { setShowAdd(false); setSearch(''); setSelectedProd(null); setNote(''); setDupWarning(null) }

  // ── Manager view data ──
  const pendingList  = visibleItems.filter(i => i.status==='pending').sort((a,b) => (b.reporters?.length||0)-(a.reporters?.length||0))
  const incomingList = visibleItems.filter(i => i.status==='incoming').sort((a,b) =>
    sortBy==='hot' ? (b.reporters?.length||0)-(a.reporters?.length||0)
    : (a.arrival_date||'zzz').localeCompare(b.arrival_date||'zzz')
  )
  const burnedList   = visibleItems.filter(i => i.status==='burned')
  const arrivedList  = visibleItems.filter(i => i.status==='arrived')

  // ── Sale view data ──
  const myItems    = visibleItems.filter(i => i.reporters?.some((r: any) => r.user_id===user.id))
  const otherItems = visibleItems.filter(i => !i.reporters?.some((r: any) => r.user_id===user.id) && i.status!=='arrived')

  // ── Item Card ──
  const ItemCard = ({ item, canManage }: any) => {
    const [editMode, setEditMode] = useState(false)
    const [arrDate,  setArrDate]  = useState(item.arrival_date||'')
    const [arrQty,   setArrQty]   = useState(String(item.arrival_qty||''))
    const [mgrNote,  setMgrNote]  = useState(item.manager_note||'')
    const days     = daysRemaining(item)
    const reporters = item.reporters || []
    const hot      = reporters.length

    const save = async () => {
      if (!arrDate) return
      await updateItem(item.id, { status:'incoming', arrival_date:arrDate, arrival_qty:Number(arrQty)||0, manager_note:mgrNote })
      setEditMode(false)
    }
    const setBurned = async () => {
      await updateItem(item.id, { status:'burned', arrival_date:'', manager_note:mgrNote })
      setEditMode(false)
    }
    const markArrived = async () => {
      await updateItem(item.id, { status:'arrived', arrived_at:new Date().toISOString() })
    }

    const borderColor = item.status==='arrived' ? T.green
      : item.status==='burned' ? T.red
      : hot>=3 ? '#E65100' : hot===2 ? T.amber : T.border

    return (
      <div style={{ background:T.card, borderRadius:12, border:`1.5px solid ${borderColor}`,
        padding:'14px 16px', marginBottom:10 }}>
        {/* ── Header ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, marginBottom:8 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap', marginBottom:6 }}>
              {hot>=3 && <span style={{ fontSize:11, fontWeight:700, color:'#BF360C', background:'#FBE9E7', padding:'2px 8px', borderRadius:20 }}>🔥 {hot} sale hỏi</span>}
              {hot===2 && <span style={{ fontSize:11, fontWeight:700, color:T.amber, background:T.amberBg, padding:'2px 8px', borderRadius:20 }}>⚡ {hot} sale hỏi</span>}
              <span style={{ fontSize:14, fontWeight:700, color:T.dark }}>{item.product_name}</span>
              {item.product_code && <span style={{ fontSize:11, color:T.light }}>#{item.product_code}</span>}
            </div>
            {/* Reporters pills */}
            <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
              {reporters.map((r: any, i: number) => {
                const u = allUsers.find((u: any) => u.id===r.user_id)
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:4, padding:'2px 8px',
                    background:T.goldBg, borderRadius:20, border:`1px solid ${T.goldBorder}` }}>
                    <div style={{ width:18, height:18, borderRadius:'50%', background:T.gold,
                      display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:8, fontWeight:700 }}>
                      {u?.ini||'?'}
                    </div>
                    <span style={{ fontSize:11, fontWeight:600, color:T.goldText }}>{r.name}</span>
                    {r.note && <span style={{ fontSize:10, color:T.med }}>· {r.note}</span>}
                  </div>
                )
              })}
            </div>
          </div>
          {/* Status + KiotViet placeholder */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5, flexShrink:0 }}>
            {(() => {
              const prod = products.find((p: any) =>
                p.code === item.product_code || norm(p.name) === norm(item.product_name)
              )
              if (!prod || (prod.stock === null && prod.stock === undefined)) {
                return <div style={{ fontSize:10, color:T.light, padding:'2px 8px', borderRadius:20,
                  border:`1px solid ${T.border}`, background:T.bg }}>🔗 KV: —</div>
              }
              const stock    = prod.stock ?? 0
              const ordered  = prod.ordered_qty ?? 0
              const shortage = prod.shortage_qty ?? Math.max(0, ordered - stock)
              const hasOrder = ordered > 0
              return (
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                  <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20,
                    color:stock===0?T.red:stock<=5?T.amber:T.green,
                    background:stock===0?T.redBg:stock<=5?T.amberBg:T.greenBg }}>
                    📦 Tồn: {stock}
                  </span>
                  {hasOrder && <>
                    <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20,
                      color:T.blue, background:T.blueBg }}>
                      🛒 KH đặt: {ordered}
                    </span>
                    {shortage > 0 && (
                      <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20,
                        color:'#fff', background:T.red }}>
                        ⚠️ Thiếu: {shortage}
                      </span>
                    )}
                    {shortage === 0 && (
                      <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20,
                        color:T.green, background:T.greenBg }}>
                        ✅ Đủ hàng
                      </span>
                    )}
                  </>}
                </div>
              )
            })()}
            {item.status==='arrived'  && <span style={{ fontSize:11, fontWeight:700, color:T.green,  background:T.greenBg,  padding:'3px 10px', borderRadius:20 }}>✅ Đã về</span>}
            {item.status==='burned'   && <span style={{ fontSize:11, fontWeight:700, color:T.red,    background:T.redBg,    padding:'3px 10px', borderRadius:20 }}>🔥 Hàng cháy</span>}
            {item.status==='pending'  && <span style={{ fontSize:11, fontWeight:600, color:T.amber,  background:T.amberBg,  padding:'3px 10px', borderRadius:20 }}>⏳ Chờ xử lý</span>}
            {item.status==='incoming' && days !== null && (
              days > 0  ? <span style={{ fontSize:11, fontWeight:700, color:T.blue,  background:T.blueBg,  padding:'3px 10px', borderRadius:20 }}>📅 Còn {days} ngày</span>
            : days===0  ? <span style={{ fontSize:11, fontWeight:700, color:T.amber, background:T.amberBg, padding:'3px 10px', borderRadius:20 }}>⏰ Hôm nay về!</span>
            : <span style={{ fontSize:11, fontWeight:700, color:T.red, background:T.redBg, padding:'3px 10px', borderRadius:20 }}>⚠️ Quá {Math.abs(days)} ngày</span>
            )}
          </div>
        </div>

        {/* Manager note reply (visible to sale) */}
        {item.manager_note && !editMode && (
          <div style={{ padding:'7px 10px', background:T.blueBg, borderRadius:8, fontSize:12, color:T.blue, marginBottom:8 }}>
            💬 QM: {item.manager_note}
            {item.arrival_date && <b> · Ngày về: {fmtDate(item.arrival_date)}{item.arrival_qty ? ` · ${item.arrival_qty} sản phẩm` : ''}</b>}
          </div>
        )}

        {/* Arrived button for sale when deadline passed */}
        {!canManage && item.status==='incoming' && days!==null && days<=0 && (
          <button onClick={markArrived}
            style={{ padding:'5px 13px', borderRadius:7, border:`1.5px solid ${T.green}`,
              background:T.greenBg, cursor:'pointer', fontSize:12, fontFamily:'inherit', color:T.green, fontWeight:600, marginBottom:8 }}>
            ✅ Xác nhận hàng đã về
          </button>
        )}

        {/* Manager actions */}
        {canManage && item.status!=='arrived' && !editMode && (
          <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:4 }}>
            <button onClick={() => setEditMode(true)}
              style={{ padding:'5px 12px', borderRadius:7, border:`1.5px solid ${T.gold}`,
                background:T.goldBg, cursor:'pointer', fontSize:12, fontFamily:'inherit', color:T.goldText, fontWeight:600 }}>
              ✏️ Cập nhật
            </button>
            {item.status==='incoming' && days!==null && days<=0 && (
              <button onClick={markArrived}
                style={{ padding:'5px 12px', borderRadius:7, border:`1.5px solid ${T.green}`,
                  background:T.greenBg, cursor:'pointer', fontSize:12, fontFamily:'inherit', color:T.green, fontWeight:600 }}>
                ✅ Xác nhận đã về
              </button>
            )}
          </div>
        )}

        {/* Manager edit form */}
        {canManage && editMode && (
          <div style={{ padding:'12px', background:T.bg, borderRadius:8, border:`1px solid ${T.border}`, marginTop:8 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div>
                <div style={{ fontSize:11, color:T.med, marginBottom:4 }}>📅 Ngày về dự kiến</div>
                <input type="date" value={arrDate} onChange={e => setArrDate(e.target.value)}
                  style={{ width:'100%', padding:'7px 9px', border:`1px solid ${T.border}`, borderRadius:7,
                    fontSize:12, fontFamily:'inherit', color:T.dark, background:'#fff', boxSizing:'border-box' as any }}/>
              </div>
              <div>
                <div style={{ fontSize:11, color:T.med, marginBottom:4 }}>📦 Số lượng về</div>
                <input type="number" value={arrQty} onChange={e => setArrQty(e.target.value)} placeholder="0"
                  style={{ width:'100%', padding:'7px 9px', border:`1px solid ${T.border}`, borderRadius:7,
                    fontSize:12, fontFamily:'inherit', color:T.dark, background:'#fff', boxSizing:'border-box' as any }}/>
              </div>
            </div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, color:T.med, marginBottom:4 }}>💬 Phản hồi cho sale</div>
              <input value={mgrNote} onChange={e => setMgrNote(e.target.value)}
                placeholder="VD: Đã liên hệ NCC, dự kiến về 15/4..."
                style={{ width:'100%', padding:'7px 9px', border:`1px solid ${T.border}`, borderRadius:7,
                  fontSize:12, fontFamily:'inherit', color:T.dark, background:'#fff', boxSizing:'border-box' as any }}/>
            </div>
            <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
              <button onClick={save} disabled={!arrDate}
                style={{ padding:'6px 14px', borderRadius:7, border:'none',
                  background:arrDate?T.gold:T.border, color:'#fff', cursor:arrDate?'pointer':'not-allowed',
                  fontSize:12, fontFamily:'inherit', fontWeight:600 }}>💾 Lưu ngày về</button>
              <button onClick={setBurned}
                style={{ padding:'6px 14px', borderRadius:7, border:`1px solid ${T.red}`,
                  background:T.redBg, color:T.red, cursor:'pointer', fontSize:12, fontFamily:'inherit', fontWeight:600 }}>🔥 Hàng cháy</button>
              <button onClick={() => setEditMode(false)}
                style={{ padding:'6px 12px', borderRadius:7, border:`1px solid ${T.border}`,
                  background:'transparent', color:T.med, cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>Hủy</button>
            </div>
          </div>
        )}

        <div style={{ marginTop:7, fontSize:10, color:T.light }}>
          Báo lúc: {reporters[0]?.reported_at ? new Date(reporters[0].reported_at).toLocaleString('vi-VN') : '—'}
        </div>
      </div>
    )
  }

  const tabData: any = { pending:pendingList, incoming:incomingList, burned:burnedList, arrived:arrivedList }
  const TAB_CFG = [
    ['pending',  `⏳ Chờ xử lý`,   pendingList.length],
    ['incoming', `📅 Sắp về`,       incomingList.length],
    ['burned',   `🔥 Hàng cháy`,    burnedList.length],
    ['arrived',  `✅ Đã về`,        arrivedList.length],
  ]

  return (
    <div style={{ padding:`0 ${p} ${mobile?'80px':p}` }}>
      <Topbar mobile={mobile} title="📦 Hàng thiếu" subtitle="Theo dõi tình trạng hàng hóa phòng Sale"
        action={
          <div style={{ display:'flex', gap:8 }}>
            {perm.manageUsers && <GoldBtn outline small onClick={() => setShowProdMgmt(true)}>📋 DS Sản phẩm</GoldBtn>}
            {isSale && <GoldBtn small onClick={() => { setShowAdd(true); setSearch(''); setSelectedProd(null); setNote('') }}>+ Báo thiếu</GoldBtn>}
          </div>
        }/>

      {/* ══ MANAGER VIEW ══ */}
      {isManager ? (
        <div>
          <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
            {TAB_CFG.map(([id, label, count]) => (
              <button key={id} onClick={() => setMgrTab(id as string)}
                style={{ padding:'6px 13px', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontSize:12,
                  border:`1.5px solid ${mgrTab===id?T.gold:T.border}`,
                  background:mgrTab===id?T.goldBg:'transparent',
                  color:mgrTab===id?T.goldText:T.med, fontWeight:mgrTab===id?600:400 }}>
                {label} <span style={{ fontSize:11, opacity:.8 }}>({count})</span>
              </button>
            ))}
            {mgrTab==='incoming' && (
              <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                style={{ marginLeft:'auto', padding:'6px 10px', borderRadius:8, border:`1px solid ${T.border}`,
                  fontSize:12, fontFamily:'inherit', color:T.dark, background:T.bg, cursor:'pointer', outline:'none' }}>
                <option value="hot">🔥 Nóng nhất</option>
                <option value="date">📅 Ngày về gần nhất</option>
              </select>
            )}
          </div>
          {tabData[mgrTab]?.length === 0 ? (
            <Card style={{ textAlign:'center', padding:'40px', color:T.light }}>
              <div style={{ fontSize:32, marginBottom:8 }}>📦</div>
              <div>Không có mục nào</div>
            </Card>
          ) : tabData[mgrTab].map((item: any) => <ItemCard key={item.id} item={item} canManage={true}/>)}
        </div>
      ) : (
        /* ══ SALE VIEW — compact list ══ */
        <div style={{ display:'grid', gridTemplateColumns:mobile?'1fr':'1fr 1fr', gap:16 }}>
          {/* ── Helper: compact row ── */}
          {(() => {
            const CompactRow = ({ item }: any) => {
              const [expanded, setExpanded] = useState(false)
              const days = daysRemaining(item)
              const prod = products.find((p: any) =>
                p.code === item.product_code || norm(p.name) === norm(item.product_name)
              )
              const stock = prod?.stock

              // Status badge
              const statusBadge = () => {
                if (item.status==='arrived')  return { label:'✅ Đã về',       color:T.green,  bg:T.greenBg  }
                if (item.status==='burned')   return { label:'🔥 Hàng cháy',  color:T.red,    bg:T.redBg    }
                if (item.status==='pending')  return { label:'⏳ Chờ xử lý',  color:T.amber,  bg:T.amberBg  }
                if (item.status==='incoming' && days!==null) {
                  if (days>0)  return { label:`📅 Còn ${days} ngày`, color:T.blue,  bg:T.blueBg  }
                  if (days===0) return { label:'⏰ Hôm nay về!',      color:T.amber, bg:T.amberBg }
                  return { label:`⚠️ Quá ${Math.abs(days)} ngày`,   color:T.red,   bg:T.redBg   }
                }
                return { label:'⏳ Chờ xử lý', color:T.amber, bg:T.amberBg }
              }
              const sb = statusBadge()
              const stockColor = stock===undefined||stock===null||stock===''?T.light
                : Number(stock)===0?T.red:Number(stock)<=5?T.amber:T.green
              const stockBg = stock===undefined||stock===null||stock===''?'transparent'
                : Number(stock)===0?T.redBg:Number(stock)<=5?T.amberBg:T.greenBg

              return (
                <div style={{ borderBottom:`1px solid ${T.border}` }}>
                  {/* ── Main row ── */}
                  <div onClick={() => setExpanded(v => !v)}
                    style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px',
                      cursor:'pointer', background:expanded?T.goldBg:'transparent',
                      transition:'background .15s' }}
                    onMouseEnter={e => { if(!expanded) (e.currentTarget as any).style.background=T.bg }}
                    onMouseLeave={e => { if(!expanded) (e.currentTarget as any).style.background='transparent' }}>
                    {/* Tên SP — tối đa 2 dòng */}
                    <div style={{ flex:1, fontSize:12, fontWeight:500, color:T.dark,
                      display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
                      overflow:'hidden', lineHeight:1.4 }}>
                      {item.product_name}
                    </div>
                    {/* Tồn kho + đặt hàng compact */}
                    {stock!==undefined && stock!==null && stock!=='' && (
                      <div style={{ display:'flex', gap:4, alignItems:'center', flexShrink:0 }}>
                        <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:20,
                          color:stockColor, background:stockBg, whiteSpace:'nowrap' }}>
                          {stock}
                        </span>
                        {prod?.ordered_qty>0 && (
                          <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:20,
                            color:T.blue, background:T.blueBg, whiteSpace:'nowrap' }}>
                            🛒{prod.ordered_qty}
                          </span>
                        )}
                        {prod?.shortage_qty>0 && (
                          <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:20,
                            color:'#fff', background:T.red, whiteSpace:'nowrap' }}>
                            -{prod.shortage_qty}
                          </span>
                        )}
                      </div>
                    )}
                    {/* Trạng thái */}
                    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20,
                      color:sb.color, background:sb.bg, flexShrink:0, whiteSpace:'nowrap' }}>
                      {sb.label}
                    </span>
                    {/* Expand arrow */}
                    <span style={{ fontSize:10, color:T.light, flexShrink:0 }}>{expanded?'▲':'▼'}</span>
                  </div>
                  {/* ── Expanded detail ── */}
                  {expanded && (
                    <div style={{ padding:'8px 12px 12px', background:T.bg, borderTop:`1px solid ${T.border}` }}>
                      {item.product_code && <div style={{ fontSize:11, color:T.light, marginBottom:5 }}>#{item.product_code}</div>}
                      <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:6 }}>
                        {(item.reporters||[]).map((r: any, i: number) => (
                          <span key={i} style={{ fontSize:11, padding:'2px 8px', borderRadius:20,
                            background:T.goldBg, color:T.goldText, fontWeight:600 }}>
                            {r.name}{r.note ? ` · ${r.note}` : ''}
                          </span>
                        ))}
                      </div>
                      {item.manager_note && (
                        <div style={{ fontSize:11, color:T.blue, padding:'5px 9px', background:T.blueBg,
                          borderRadius:7, marginBottom:6 }}>
                          💬 QM: {item.manager_note}
                          {item.arrival_date && <b> · Ngày về: {fmtDate(item.arrival_date)}</b>}
                          {item.arrival_qty ? <b> · SL: {item.arrival_qty}</b> : ''}
                        </div>
                      )}
                      {/* Xác nhận đã về */}
                      {item.status==='incoming' && days!==null && days<=0 && (
                        <button onClick={async e => { e.stopPropagation(); await updateItem(item.id, { status:'arrived', arrived_at:new Date().toISOString() }) }}
                          style={{ padding:'4px 12px', borderRadius:7, border:`1.5px solid ${T.green}`,
                            background:T.greenBg, cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.green, fontWeight:600 }}>
                          ✅ Xác nhận hàng đã về
                        </button>
                      )}
                      {/* Nút xóa — chỉ người báo hoặc admin */}
                      {(() => {
                        const isMine = (item.reporters||[]).some((r: any) => r.user_id === user.id)
                        const canDel = isMine || getPerm(user).viewAllDashboard
                        if (!canDel) return null
                        return (
                          <button onClick={async e => {
                            e.stopPropagation()
                            if (!confirm('Xóa mã này khỏi danh sách?')) return
                            // Nếu chỉ mình báo → xóa item. Nếu nhiều người → chỉ xóa tên mình
                            const reporters = (item.reporters||[]).filter((r: any) => r.user_id !== user.id)
                            if (reporters.length === 0 || getPerm(user).viewAllDashboard) {
                              setItems(prev => prev.filter(i => i.id !== item.id))
                              await db.from('shortage_items').delete().eq('id', item.id)
                            } else {
                              await updateItem(item.id, { reporters })
                            }
                          }}
                          style={{ padding:'4px 10px', borderRadius:7, border:`1px solid ${T.redBg}`,
                            background:T.redBg, cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.red }}>
                            🗑️ Xóa
                          </button>
                        )
                      })()}
                      <div style={{ fontSize:10, color:T.light, marginTop:5 }}>
                        Báo lúc: {(item.reporters||[])[0]?.reported_at ? new Date((item.reporters||[])[0].reported_at).toLocaleString('vi-VN') : '—'}
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            const ListPanel = ({ items, emptyIcon, emptyText, headerLabel, headerCount, headerBg, headerColor }: any) => (
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:T.dark }}>{headerLabel}</div>
                  <span style={{ fontSize:11, background:headerBg, color:headerColor,
                    padding:'2px 8px', borderRadius:20, fontWeight:600 }}>{headerCount}</span>
                </div>
                {items.length===0
                  ? <div style={{ padding:'24px', textAlign:'center', color:T.light,
                      background:T.card, borderRadius:12, border:`1px solid ${T.border}` }}>
                      <div style={{ fontSize:24, marginBottom:6 }}>{emptyIcon}</div>
                      <div style={{ fontSize:12 }}>{emptyText}</div>
                    </div>
                  : <div style={{ background:T.card, borderRadius:12, border:`1px solid ${T.border}`, overflow:'hidden' }}>
                      {/* Sort: pending → incoming → burned → arrived */}
                      {[...items].sort((a: any, b: any) => {
                        const order: any = { pending:0, incoming:1, burned:2, arrived:3 }
                        return (order[a.status]??1)-(order[b.status]??1)
                      }).map((item: any) => <CompactRow key={item.id} item={item}/>)}
                    </div>
                }
              </div>
            )

            return (
              <>
                <ListPanel
                  items={myItems} emptyIcon="📦" emptyText="Chưa báo mã nào"
                  headerLabel="📋 Mã tôi báo" headerCount={myItems.length}
                  headerBg={T.goldBg} headerColor={T.goldText}/>
                <ListPanel
                  items={otherItems} emptyIcon="👥" emptyText="Không có mã nào"
                  headerLabel="👥 Mã sale khác báo" headerCount={otherItems.length}
                  headerBg={T.grayBg} headerColor={T.gray}/>
              </>
            )
          })()}
        </div>
      )}

      {/* ══ Modal: Báo thiếu ══ */}
      <Modal open={showAdd} onClose={closeAdd} title="Báo hàng thiếu">
        {dupWarning ? (
          dupWarning.type==='self' ? (
            <div style={{ padding:'14px', background:T.amberBg, borderRadius:10, fontSize:13, color:T.amber, textAlign:'center' }}>
              ⚠️ Bạn đã báo <b>{dupWarning.item.product_name}</b> rồi!
              <div style={{ marginTop:12 }}><GoldBtn small onClick={closeAdd}>Đóng</GoldBtn></div>
            </div>
          ) : (
            <div>
              <div style={{ padding:'12px', background:T.goldBg, borderRadius:8, fontSize:13, color:T.goldText, marginBottom:14 }}>
                📢 <b>{dupWarning.item.product_name}</b> đã có trong list, báo bởi: <b>{dupWarning.item.reporters?.map((r: any) => r.name).join(', ')}</b>
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:12, color:T.med, marginBottom:5 }}>Ghi chú thêm (tùy chọn)</div>
                <input value={note} onChange={e => setNote(e.target.value)} placeholder="Ghi chú..."
                  style={{ width:'100%', padding:'8px 11px', border:`1px solid ${T.border}`, borderRadius:8,
                    fontSize:13, fontFamily:'inherit', color:T.dark, background:'#fff', boxSizing:'border-box' as any, outline:'none' }}/>
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <GoldBtn outline small onClick={closeAdd}>Hủy</GoldBtn>
                <GoldBtn small onClick={() => addReporter(dupWarning.item.id)}>Thêm tên tôi vào list</GoldBtn>
              </div>
            </div>
          )
        ) : (
          <div>
            <div style={{ marginBottom:8 }}>
              <div style={{ fontSize:12, fontWeight:500, color:T.med, marginBottom:5 }}>🔍 Tìm sản phẩm *</div>
              <input value={search} onChange={e => { setSearch(e.target.value); setSelectedProd(null) }}
                placeholder="Gõ tên hoặc mã... VD: 'nạ ủ ahoh 20'"
                style={{ width:'100%', padding:'9px 12px', border:`1.5px solid ${selectedProd?T.green:T.border}`, borderRadius:8,
                  fontSize:13, fontFamily:'inherit', color:T.dark, background:'#fff', boxSizing:'border-box' as any, outline:'none' }}/>
            </div>
            {search && !selectedProd && (
              <div style={{ maxHeight:200, overflowY:'auto', border:`1px solid ${T.border}`, borderRadius:8, marginBottom:10 }}>
                {searchResults.length===0
                  ? <div style={{ padding:'16px', textAlign:'center', color:T.light, fontSize:12 }}>Không tìm thấy sản phẩm</div>
                  : searchResults.map(pr => (
                    <div key={pr.id} onClick={() => { setSelectedProd(pr); setSearch(pr.name) }}
                      style={{ padding:'9px 12px', cursor:'pointer', borderBottom:`1px solid ${T.border}`, fontSize:13, color:T.dark }}
                      onMouseEnter={e => (e.currentTarget.style.background=T.goldBg)}
                      onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                        <div>
                          <span style={{ fontWeight:500 }}>{pr.name}</span>
                          {pr.code && <span style={{ fontSize:11, color:T.light, marginLeft:8 }}>#{pr.code}</span>}
                        </div>
                        {pr.stock !== undefined && pr.stock !== null && pr.stock !== '' && (
                          <span style={{ fontSize:11, fontWeight:700, flexShrink:0,
                            color:Number(pr.stock)===0?T.red:Number(pr.stock)<=5?T.amber:T.green,
                            background:Number(pr.stock)===0?T.redBg:Number(pr.stock)<=5?T.amberBg:T.greenBg,
                            padding:'2px 8px', borderRadius:20 }}>
                            Tồn: {pr.stock}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
            {selectedProd && (
              <div style={{ padding:'8px 12px', background:T.greenBg, borderRadius:8, marginBottom:10, fontSize:12, color:T.green, fontWeight:600,
                display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span>✅ {selectedProd.name}{selectedProd.code ? ` (${selectedProd.code})` : ''}</span>
                {selectedProd.stock !== undefined && selectedProd.stock !== null && selectedProd.stock !== '' && (
                  <span style={{ fontSize:12, fontWeight:700,
                    color:Number(selectedProd.stock)===0?T.red:Number(selectedProd.stock)<=5?T.amber:'#1B5E20',
                    background:'rgba(255,255,255,0.6)', padding:'2px 8px', borderRadius:20, marginLeft:8 }}>
                    📦 Tồn kho: {selectedProd.stock}
                  </span>
                )}
              </div>
            )}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:500, color:T.med, marginBottom:5 }}>💬 Ghi chú cho quản lý (tùy chọn)</div>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="VD: Khách hỏi nhiều, cần gấp..."
                style={{ width:'100%', padding:'8px 11px', border:`1px solid ${T.border}`, borderRadius:8,
                  fontSize:13, fontFamily:'inherit', color:T.dark, background:'#fff', boxSizing:'border-box' as any, outline:'none' }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <GoldBtn outline small onClick={closeAdd}>Hủy</GoldBtn>
              <GoldBtn small onClick={report} disabled={!selectedProd}>Báo thiếu</GoldBtn>
            </div>
          </div>
        )}
      </Modal>

      {/* ══ Modal: Quản lý sản phẩm (Admin) ══ */}
      <Modal open={showProdMgmt} onClose={() => setShowProdMgmt(false)} title="📋 Danh sách sản phẩm" wide>
        {/* KiotViet Sync button */}
        {(() => {
          const [syncing, setSyncing] = useState(false)
          const [syncMsg, setSyncMsg] = useState('')
          const syncKV = async () => {
            setSyncing(true); setSyncMsg('')
            try {
              const res = await fetch('https://uzloxzrqtzuucxlokqfm.supabase.co/functions/v1/kiotviet-sync', {
                method:'POST',
                headers:{ 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bG94enJxdHp1dWN4bG9rcWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODAwOTYsImV4cCI6MjA5MTA1NjA5Nn0.INA68j0bmDb7kFtn4H3TiQmPzEqs67sKMsBhc--mvvo' }
              })
              const data = await res.json()
              if (data.success) {
                setSyncMsg(`✅ Sync ${data.synced} SP${data.shortage>0?' — ⚠️ '+data.shortage+' mã thiếu hàng':''}`)
                // Reload products
                const { data: pr } = await db.from('products').select('*').eq('active', true).order('name')
                if (pr) setProducts(pr)
              } else {
                setSyncMsg('❌ Lỗi: ' + (data.error || 'Không xác định'))
              }
            } catch(e: any) {
              setSyncMsg('❌ Lỗi kết nối: ' + e.message)
            }
            setSyncing(false)
          }
          return (
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14,
              padding:'10px 14px', background:T.goldBg, borderRadius:10, border:`1px solid ${T.goldBorder}` }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:600, color:T.goldText }}>🔗 Đồng bộ từ KiotViet</div>
                {syncMsg && <div style={{ fontSize:11, marginTop:3, color:syncMsg.startsWith('✅')?T.green:T.red }}>{syncMsg}</div>}
                {!syncMsg && <div style={{ fontSize:11, color:T.med, marginTop:2 }}>Cập nhật tên SP + tồn kho mới nhất</div>}
              </div>
              <button onClick={syncKV} disabled={syncing}
                style={{ padding:'8px 16px', borderRadius:8, border:'none',
                  background:syncing?T.border:T.gold, color:'#fff',
                  cursor:syncing?'not-allowed':'pointer', fontFamily:'inherit',
                  fontWeight:600, fontSize:13, flexShrink:0 }}>
                {syncing ? '⏳ Đang sync...' : '🔄 Sync KiotViet'}
              </button>
            </div>
          )
        })()}
        <div style={{ display:'flex', gap:8, marginBottom:14 }}>
          <input value={prodForm.name} onChange={e => setProdForm(f => ({...f, name:e.target.value}))}
            placeholder="Tên sản phẩm *" style={{ flex:3, padding:'8px 11px', border:`1px solid ${T.border}`, borderRadius:8, fontSize:13, fontFamily:'inherit', outline:'none' }}/>
          <input value={prodForm.code} onChange={e => setProdForm(f => ({...f, code:e.target.value}))}
            placeholder="Mã SP" style={{ flex:1, padding:'8px 11px', border:`1px solid ${T.border}`, borderRadius:8, fontSize:13, fontFamily:'inherit', outline:'none' }}/>
          <input value={prodForm.unit} onChange={e => setProdForm(f => ({...f, unit:e.target.value}))}
            placeholder="ĐVT" style={{ flex:1, padding:'8px 11px', border:`1px solid ${T.border}`, borderRadius:8, fontSize:13, fontFamily:'inherit', outline:'none' }}/>
          <input type="number" value={prodForm.stock} onChange={e => setProdForm(f => ({...f, stock:e.target.value}))}
            placeholder="Tồn kho" style={{ flex:1, padding:'8px 11px', border:`1px solid ${T.border}`, borderRadius:8, fontSize:13, fontFamily:'inherit', outline:'none' }}/>
          <button onClick={async () => {
            if (!prodForm.name) return
            const np = { id:'pr'+Date.now(), ...prodForm, stock:prodForm.stock!==''?Number(prodForm.stock):null, active:true }
            setProducts(prev => [...prev, np])
            await db.from('products').insert(np)
            setProdForm({ name:'', code:'', unit:'', stock:'' })
          }} style={{ padding:'8px 16px', borderRadius:8, border:'none', background:T.gold, color:'#fff', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:13, flexShrink:0 }}>+ Thêm</button>
        </div>
        <div style={{ fontSize:11, color:T.light, marginBottom:8 }}>{products.length} sản phẩm · 🔍 Fuzzy search theo tên/mã</div>
        <div style={{ maxHeight:360, overflowY:'auto', border:`1px solid ${T.border}`, borderRadius:8 }}>
          {products.map((pr, i) => (
            <div key={pr.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px',
              borderBottom:i<products.length-1?`1px solid ${T.border}`:'none', background:i%2===0?'#fff':T.bg }}>
              <div style={{ flex:1, fontSize:13, color:T.dark, fontWeight:500 }}>{pr.name}</div>
              {pr.code && <div style={{ fontSize:11, color:T.light }}>#{pr.code}</div>}
              {pr.unit && <div style={{ fontSize:11, color:T.med }}>{pr.unit}</div>}
              {pr.stock !== null && pr.stock !== undefined && pr.stock !== '' && (
                <div style={{ fontSize:11, fontWeight:700,
                  color:Number(pr.stock)===0?T.red:Number(pr.stock)<=5?T.amber:T.green }}>
                  Tồn: {pr.stock}
                </div>
              )}
              <button onClick={async () => {
                setProducts(prev => prev.filter(p => p.id!==pr.id))
                await db.from('products').delete().eq('id', pr.id)
              }} style={{ padding:'3px 8px', borderRadius:6, border:`1px solid ${T.redBg}`, background:T.redBg, cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.red }}>✕</button>
            </div>
          ))}
          {products.length===0 && <div style={{ padding:'24px', textAlign:'center', color:T.light, fontSize:13 }}>Chưa có sản phẩm nào. Thêm ở trên.</div>}
        </div>
      </Modal>
    </div>
  )
}

// ── ORG CHART ─────────────────────────────────────
function OrgChart({ user, allUsers, positions, mobile }: any) {
  const p = mobile ? '16px' : '24px'
  const canEdit = getPerm(user).managePositions || getPerm(user).manageUsers

  // Build tree từ positions
  const buildTree = (parentId: string): any[] =>
    positions
      .filter((pos: any) => pos.reports_to === parentId)
      .map((pos: any) => ({
        ...pos,
        users: allUsers.filter((u: any) => u.position_id === pos.id),
        children: buildTree(pos.id),
      }))

  const roots = positions.filter((pos: any) => !pos.reports_to || pos.reports_to === '')
  const tree = roots.map((pos: any) => ({
    ...pos,
    users: allUsers.filter((u: any) => u.position_id === pos.id),
    children: buildTree(pos.id),
  }))

  // ── CSS tree node ──────────────────────────────
  const NodeCard = ({ node }: any) => {
    const [collapsed, setCollapsed] = useState(false)
    const deptColor = DEPT_COLOR[node.dept_id] || T.gold
    const hasChildren = node.children && node.children.length > 0

    return (
      <li style={{ listStyle:'none', display:'flex', flexDirection:'column', alignItems:'center', position:'relative' }}>
        {/* ─ Node box ─ */}
        <div
          onClick={() => hasChildren && setCollapsed(c => !c)}
          style={{
            background: T.card,
            border: `2px solid ${deptColor}`,
            borderRadius: 12,
            padding: '10px 16px',
            minWidth: 150,
            maxWidth: 190,
            textAlign: 'center',
            cursor: hasChildren ? 'pointer' : 'default',
            position: 'relative',
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            transition: 'box-shadow .2s',
            userSelect: 'none',
          }}
        >
          {/* Màu top accent */}
          <div style={{ position:'absolute', top:0, left:16, right:16, height:3, background:deptColor, borderRadius:'0 0 4px 4px' }}/>
          <div style={{ fontSize:10, fontWeight:700, color:deptColor, textTransform:'uppercase', letterSpacing:.8, marginBottom:6, marginTop:4 }}>
            {node.name}
          </div>
          {node.users.length > 0 ? node.users.map((u: any) => (
            <div key={u.id} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, marginBottom:4 }}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:deptColor, flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'#fff', fontSize:10, fontWeight:700, border:`2px solid #fff`,
                boxShadow:`0 0 0 2px ${deptColor}40` }}>
                {u.ini}
              </div>
              <div style={{ fontSize:12, fontWeight:600, color:T.dark, textAlign:'left' }}>{u.name}</div>
            </div>
          )) : (
            <div style={{ fontSize:10, color:T.light, fontStyle:'italic', padding:'4px 0' }}>Chưa có nhân viên</div>
          )}
          {hasChildren && (
            <div style={{ marginTop:6, fontSize:10, color:deptColor, fontWeight:700 }}>
              {collapsed ? `▶ ${node.children.length} cấp dưới` : '▼ Thu gọn'}
            </div>
          )}
        </div>

        {/* ─ Children với CSS tree lines ─ */}
        {hasChildren && !collapsed && (
          <ul style={{
            display: 'flex',
            gap: 0,
            padding: 0,
            margin: 0,
            paddingTop: 32,
            position: 'relative',
          }}>
            {/* Đường dọc từ parent xuống */}
            <li style={{
              position: 'absolute', top: 0, left: '50%',
              width: 2, height: 32,
              background: deptColor + '80',
              transform: 'translateX(-50%)',
              listStyle: 'none',
            }}/>
            {node.children.map((child: any, ci: number) => {
              const isOnly = node.children.length === 1
              const isFirst = ci === 0
              const isLast = ci === node.children.length - 1
              const childColor = DEPT_COLOR[child.dept_id] || T.gold
              return (
                <li key={child.id} style={{
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0 12px',
                  position: 'relative',
                }}>
                  {/* Đường ngang nối các anh em */}
                  {!isOnly && (
                    <div style={{
                      position: 'absolute', top: 0, height: 2,
                      background: deptColor + '60',
                      left: isFirst ? '50%' : 0,
                      right: isLast ? '50%' : 0,
                    }}/>
                  )}
                  {/* Đường dọc từ đường ngang xuống node con */}
                  <div style={{
                    width: 2, height: 22,
                    background: childColor + '80',
                    flexShrink: 0,
                  }}/>
                  <NodeCard node={child}/>
                </li>
              )
            })}
          </ul>
        )}
      </li>
    )
  }

  return (
    <div style={{ padding:`0 ${p} ${mobile?'80px':p}` }}>
      <Topbar mobile={mobile} title="Sơ đồ tổ chức" subtitle="LA Global Beauty"
        action={canEdit && (
          <div style={{ fontSize:11, color:T.light, padding:'6px 12px', background:T.bg, borderRadius:8, border:`1px solid ${T.border}` }}>
            ⚙️ Chỉnh sửa trong mục Vị trí
          </div>
        )}/>

      {positions.length === 0 ? (
        <Card style={{ textAlign:'center', padding:'48px', color:T.light }}>
          <div style={{ fontSize:36, marginBottom:10 }}>🏢</div>
          <div style={{ fontSize:14, fontWeight:500 }}>Chưa có sơ đồ tổ chức</div>
          <div style={{ fontSize:12, marginTop:6 }}>Vào mục Vị trí để tạo cấu trúc công ty</div>
        </Card>
      ) : (
        <div style={{ overflowX:'auto', overflowY:'visible', paddingBottom:32, paddingTop:8 }}>
          <ul style={{ display:'flex', gap:0, padding:0, margin:0, justifyContent:'center', minWidth:'max-content' }}>
            {tree.map(node => <NodeCard key={node.id} node={node}/>)}
          </ul>
        </div>
      )}

      {/* Legend */}
      <div style={{ display:'flex', gap:16, marginTop:16, flexWrap:'wrap', justifyContent:'center',
        padding:'12px 16px', background:T.bg, borderRadius:10, border:`1px solid ${T.border}` }}>
        {['kho','sale','vp','all'].map(d => (
          <div key={d} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:T.med }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:DEPT_COLOR[d] }}/>
            <span style={{ fontWeight:500 }}>{DEPT_NAME[d]}</span>
          </div>
        ))}
        <div style={{ fontSize:11, color:T.light, marginLeft:'auto' }}>Click node để thu/mở cấp dưới</div>
      </div>
    </div>
  )
}

// ══ KẾT THÚC PHẦN 5 — Paste tiếp Phần 6 bên dưới ══
// ═══════════════════════════════════════════════
// PHẦN 6/6 — Paste nối tiếp bên dưới Phần 5
// ═══════════════════════════════════════════════

// ── HISTORY ───────────────────────────────────────
function History({ user, history, allUsers, mobile }: any) {
  const [mode, setMode]           = useState<'date'|'person'>('date')
  const [dateFilter, setDateFilter] = useState('')
  const p = mobile ? '16px' : '24px'
  const perm = getPerm(user)
  const dids = allUsers.filter((u: any) => u.dept_id === user.dept_id).map((u: any) => u.id)
  const myH = perm.viewAllDashboard ? history
    : perm.viewDeptChecklist ? history.filter((h: any) => dids.includes(h.assignee_id))
    : history.filter((h: any) => h.assignee_id === user.id)
  const dates = [...new Set(myH.map((h: any) => h.date))].sort().reverse() as string[]
  const filtered = dateFilter ? myH.filter((h: any) => h.date === dateFilter) : myH
  const groupBy = (key: string) => {
    const g: any = {}
    filtered.forEach((h: any) => { if (!g[h[key]]) g[h[key]] = []; g[h[key]].push(h) })
    return g
  }

  return (
    <div style={{ padding:`0 ${p} ${mobile?'80px':p}` }}>
      <Topbar mobile={mobile} title="Lịch sử công việc" subtitle="Kết quả các kỳ đã qua"/>
      {myH.length === 0 ? (
        <Card style={{ textAlign:'center', padding:'48px', color:T.light }}>
          <div style={{ fontSize:36, marginBottom:10 }}>🗂️</div>
          <div style={{ fontSize:14, fontWeight:500 }}>Chưa có lịch sử</div>
        </Card>
      ) : (<>
        <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
          {([['date','📅 Theo ngày'],['person','👤 Theo người']] as [string,string][]).map(([m, l]) => (
            <button key={m} onClick={() => setMode(m as any)}
              style={{ padding:'6px 14px', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontSize:12,
                border:`1.5px solid ${mode===m?T.gold:T.border}`,
                background:mode===m?T.goldBg:'transparent',
                color:mode===m?T.goldText:T.med, fontWeight:mode===m?600:400 }}>{l}</button>
          ))}
          <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            style={{ padding:'6px 11px', borderRadius:8, border:`1px solid ${T.border}`, fontSize:12, fontFamily:'inherit', color:T.dark, background:T.bg, cursor:'pointer' }}>
            <option value="">Tất cả ngày</option>
            {dates.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        {Object.entries(mode==='date'?groupBy('date'):groupBy('assignee_id'))
          .sort(([a],[b]) => b.localeCompare(a))
          .map(([key, items]: any) => {
            const done = items.filter((h: any) => h.status==='done').length
            const label = mode==='date' ? `📅 ${key}` : `👤 ${allUsers.find((u: any) => u.id===key)?.name||key}`
            return (
              <Card key={key} style={{ padding:0, overflow:'hidden', marginBottom:14 }}>
                <div style={{ padding:'11px 16px', background:'#F8F6F2', borderBottom:`1px solid ${T.border}`,
                  display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                  <div style={{ fontWeight:700, color:T.dark, fontSize:13 }}>{label}</div>
                  <div style={{ display:'flex', gap:10, fontSize:11 }}>
                    <span style={{ color:T.green, fontWeight:600 }}>✅ {done}</span>
                    <span style={{ color:T.red, fontWeight:600 }}>❌ {items.length-done}</span>
                    <span style={{ color:T.light }}>Tỷ lệ: {Math.round(done/items.length*100)}%</span>
                  </div>
                </div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <TH cols={['Công việc','Nhân viên','Tần suất','Kết quả','Xong lúc']}/>
                  <tbody>
                    {items.map((h: any, i: number) => {
                      const assignee = allUsers.find((u: any) => u.id===h.assignee_id)
                      return (
                        <tr key={h.id||i} style={{ background:i%2===0?'#fff':T.bg, borderBottom:`1px solid ${T.border}` }}>
                          <td style={{ padding:'9px 13px', fontSize:13, fontWeight:500, color:T.dark }}>{h.title}</td>
                          <td style={{ padding:'9px 13px' }}>{assignee && <Av u={assignee} size={22} showTitle/>}</td>
                          <td style={{ padding:'9px 13px' }}>
                            <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:20,
                              color:FREQ_COLOR[h.freq]?.color, background:FREQ_COLOR[h.freq]?.bg }}>{h.freq}</span>
                          </td>
                          <td style={{ padding:'9px 13px' }}>
                            <span style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:20,
                              color:h.status==='done'?T.green:T.red, background:h.status==='done'?T.greenBg:T.redBg }}>
                              {h.status==='done'?'✅ Hoàn thành':'❌ Chưa xong'}
                            </span>
                          </td>
                          <td style={{ padding:'9px 13px', fontSize:11, color:h.done_at?T.green:T.light }}>{h.done_at||'—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </Card>
            )
          })}
      </>)}
    </div>
  )
}

// ── USER MANAGEMENT ───────────────────────────────
function UserManagement({ user, allUsers, setAllUsers, departments, positions, mobile }: any) {
  const isAdmin = getPerm(user).viewAllDashboard  // admin: được sửa ini
  const [show, setShow]   = useState(false)
  const [edit, setEdit]   = useState<any>(null)
  const [form, setForm]   = useState({ name:'', dept_id:'kho', position_id:'', ini:'', pin:'1234', active:true })
  const [deptF, setDeptF] = useState('all')
  const [showPwModal, setShowPwModal] = useState<any>(null)
  const [newPw, setNewPw] = useState('')
  const p = mobile ? '16px' : '24px'

  const autoIni = (name: string) => {
    const w = name.trim().split(' ')
    return (w.length >= 2 ? w[0][0]+w[w.length-1][0] : name.slice(0,2)).toUpperCase()
  }

  const openCreate = () => {
    setEdit(null)
    setForm({ name:'', dept_id:'kho', position_id:'', ini:'', pin:'1234', active:true })
    setShow(true)
  }
  const openEdit = (u: any) => {
    setEdit(u)
    setForm({ name:u.name, dept_id:u.dept_id, position_id:u.position_id||'', ini:u.ini, pin:u.pin, active:u.active })
    setShow(true)
  }

  const save = async () => {
    if (!form.name) return
    const pos = positions.find((p: any) => p.id===form.position_id)
    const posName = pos?.name||''
    // Vị trí 'all' (GĐ/Admin) → dept_id = 'all'
    const finalDeptId = (pos?.dept_id === 'all' || pos?.perm_view_all_dashboard) ? 'all' : form.dept_id
    const deptName = departments.find((d: any) => d.id===finalDeptId)?.name || (finalDeptId==='all'?'Toàn công ty':'')
    const role = pos?.perm_view_all_dashboard ? 'admin' : pos?.perm_manage_users ? 'mgr' : pos?.perm_mark_attendance ? 'mgr' : 'staff'

    if (edit) {
      const updated = {...edit, ...form, dept_id:finalDeptId, dept_name:deptName, position_name:posName, role}
      setAllUsers((prev: any) => prev.map((u: any) => u.id===edit.id ? updated : u))
      await db.from('users').update({ name:form.name, dept_id:finalDeptId, position_id:form.position_id, ini:form.ini, active:form.active, role }).eq('id', edit.id)
    } else {
      const newId = form.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s/g,'_')+'_'+Date.now().toString().slice(-4)
      const newUser = { id:newId, ...form, dept_id:finalDeptId, dept_name:deptName, position_name:posName, role, must_change_password:true }
      setAllUsers((prev: any) => [...prev, newUser])
      await db.from('users').insert({ id:newId, ...form, dept_id:finalDeptId, role, must_change_password:true })
    }
    setShow(false)
  }

  const resetPassword = async () => {
    if (!newPw || newPw.length < 4) return
    await db.from('users').update({ pin:newPw, must_change_password:true }).eq('id', showPwModal.id)
    setAllUsers((prev: any) => prev.map((u: any) => u.id===showPwModal.id ? {...u, pin:newPw, must_change_password:true} : u))
    setShowPwModal(null); setNewPw('')
  }

  const filtered = deptF==='all' ? allUsers : allUsers.filter((u: any) => u.dept_id===deptF)
  const deptGroups = ['kho','sale','vp'].map(d => ({
    id:d, name:DEPT_NAME[d], users:filtered.filter((u: any) => u.dept_id===d)
  }))

  return (
    <div style={{ padding:`0 ${p} ${mobile?'80px':p}` }}>
      <Topbar mobile={mobile} title="Quản lý nhân viên"
        subtitle={`${allUsers.filter((u: any) => u.active).length} nhân viên đang hoạt động`}
        action={<GoldBtn small onClick={openCreate}>+ Thêm nhân viên</GoldBtn>}/>

      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
        {[{value:'all',label:'Tất cả'},...departments.filter((d: any) => d.id!=='all').map((d: any) => ({value:d.id,label:d.name}))].map((f: any) => (
          <button key={f.value} onClick={() => setDeptF(f.value)}
            style={{ padding:'5px 12px', borderRadius:7, cursor:'pointer', fontFamily:'inherit', fontSize:12,
              border:`1.5px solid ${deptF===f.value?T.gold:T.border}`,
              background:deptF===f.value?T.goldBg:'transparent',
              color:deptF===f.value?T.goldText:T.med,
              fontWeight:deptF===f.value?600:400 }}>{f.label}</button>
        ))}
      </div>

      {deptGroups.map(group => group.users.length===0 ? null : (
        <Card key={group.id} style={{ padding:0, overflow:'hidden', marginBottom:14 }}>
          <div style={{ background:DEPT_COLOR[group.id], padding:'11px 16px' }}>
            <span style={{ color:'#fff', fontWeight:700, fontSize:14 }}>{group.name} — {group.users.length} người</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:mobile?'1fr':'repeat(auto-fill,minmax(280px,1fr))' }}>
            {group.users.map((u: any) => (
              <div key={u.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
                borderBottom:`1px solid ${T.border}`, opacity:u.active?1:0.5 }}>
                <div style={{ width:42, height:42, borderRadius:'50%', background:DEPT_COLOR[u.dept_id]||T.gold,
                  flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                  color:'#fff', fontSize:13, fontWeight:700 }}>{u.ini}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:T.dark }}>{u.name}</div>
                  <div style={{ fontSize:11, color:T.gold, fontWeight:500 }}>{u.position_name||'Chưa có vị trí'}</div>
                  <div style={{ display:'flex', gap:6, marginTop:3 }}>
                    {!u.active && <span style={{ fontSize:10, color:T.red }}>Đã khóa</span>}
                    {u.must_change_password && <span style={{ fontSize:10, color:T.amber }}>⚠️ Chưa đổi mật khẩu</span>}
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  <button onClick={() => openEdit(u)}
                    style={{ padding:'4px 10px', borderRadius:6, border:`1px solid ${T.border}`,
                      background:'transparent', cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.med }}>Sửa</button>
                  <button onClick={() => { setShowPwModal(u); setNewPw('') }}
                    style={{ padding:'4px 10px', borderRadius:6, border:`1px solid ${T.amberBg}`,
                      background:T.amberBg, cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.amber }}>🔑 Mật khẩu</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Modal thêm/sửa */}
      <Modal open={show} onClose={() => setShow(false)} title={edit?'Sửa tài khoản':'Thêm nhân viên mới'}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Inp label="Họ tên *" value={form.name}
            onChange={(v: string) => setForm(f => ({...f, name:v, ini:autoIni(v)}))} placeholder="Nguyễn Văn A"/>
          {isAdmin ? (
            <Inp label="Tên đăng nhập (ini) 🔐 Admin" value={form.ini}
              onChange={(v: string) => setForm(f => ({...f, ini:v.toUpperCase().slice(0,4)}))} placeholder="VA"/>
          ) : (
            <div style={{ marginBottom:13 }}>
              <div style={{ fontSize:12, fontWeight:500, color:T.med, marginBottom:5 }}>Tên đăng nhập (ini)</div>
              <div style={{ padding:'8px 11px', border:`1px solid ${T.border}`, borderRadius:8, fontSize:13, color:T.light, background:T.bg }}>{form.ini} <span style={{ fontSize:11, color:T.amber }}>(Chỉ Admin được sửa)</span></div>
            </div>
          )}
        </div>
        {/* Vị trí — chọn trước để auto-fill phòng ban */}
        <Sel label="Vị trí *" value={form.position_id} onChange={(v: string) => {
          const pos = positions.find((p: any) => p.id === v)
          const autoDept = pos?.dept_id || ''
          setForm(f => ({...f, position_id:v, dept_id: autoDept || f.dept_id}))
        }} options={[{value:'',label:'— Chọn vị trí —'},...positions.map((pos: any) => ({value:pos.id,label:`${pos.name}${pos.dept_id&&pos.dept_id!=='all'?' — '+DEPT_NAME[pos.dept_id]:' — Toàn cty'}`}))]}/>
        {/* Phòng ban — ẩn nếu vị trí là "all" (GĐ/Admin) */}
        {(() => {
          const selPos = positions.find((p: any) => p.id === form.position_id)
          const isAllDept = selPos?.dept_id === 'all' || selPos?.perm_view_all_dashboard
          if (isAllDept) return (
            <div style={{ padding:'8px 12px', background:T.goldBg, borderRadius:8, marginBottom:13, fontSize:12, color:T.goldText }}>
              🏢 Vị trí này có quyền toàn công ty — không cần chọn phòng ban
            </div>
          )
          return (
            <Sel label="Phòng ban" value={form.dept_id} onChange={(v: string) => setForm(f => ({...f, dept_id:v}))}
              options={departments.filter((d: any) => d.id!=='all').map((d: any) => ({value:d.id,label:d.name}))}/>
          )
        })()}
        <div style={{ padding:'10px 12px', background:T.goldBg, borderRadius:8, marginBottom:13, fontSize:12, color:T.goldText }}>
          💡 Mật khẩu mặc định khi tạo mới: <b>1234</b> — nhân viên sẽ được yêu cầu đổi khi đăng nhập lần đầu.
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <input type="checkbox" id="uact" checked={form.active} onChange={e => setForm(f => ({...f, active:e.target.checked}))}/>
          <label htmlFor="uact" style={{ fontSize:13, color:T.dark, cursor:'pointer' }}>Tài khoản đang hoạt động</label>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
          <GoldBtn outline small onClick={() => setShow(false)}>Hủy</GoldBtn>
          <GoldBtn small onClick={save} disabled={!form.name||!form.position_id}>Lưu</GoldBtn>
        </div>
      </Modal>

      {/* Modal đổi mật khẩu */}
      <Modal open={!!showPwModal} onClose={() => setShowPwModal(null)} title={`Đổi mật khẩu: ${showPwModal?.name}`}>
        <div style={{ padding:'10px 12px', background:T.bg, borderRadius:8, marginBottom:14, fontSize:12, color:T.med }}>
          Sau khi admin đặt lại, nhân viên sẽ được yêu cầu đổi mật khẩu khi đăng nhập lần tiếp theo.
        </div>
        <Inp label="Mật khẩu mới *" type="password" value={newPw} onChange={setNewPw} placeholder="Tối thiểu 4 ký tự"/>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
          <GoldBtn outline small onClick={() => setShowPwModal(null)}>Hủy</GoldBtn>
          <GoldBtn small onClick={resetPassword} disabled={!newPw||newPw.length<4}>Đặt lại mật khẩu</GoldBtn>
        </div>
      </Modal>
    </div>
  )
}

// ── POSITIONS MANAGEMENT ──────────────────────────
function PositionsManagement({ positions, setPositions, mobile }: any) {
  const [show, setShow] = useState(false)
  const [edit, setEdit] = useState<any>(null)
  const [form, setForm] = useState<any>({
    name:'', dept_id:'all', reports_to:'',
    ...Object.fromEntries(ALL_PERMS.map(p => [p.key, false]))
  })
  const p = mobile ? '16px' : '24px'

  const openCreate = () => {
    setEdit(null)
    setForm({ name:'', dept_id:'all', reports_to:'', ...Object.fromEntries(ALL_PERMS.map(p => [p.key, false])) })
    setShow(true)
  }
  const openEdit = (pos: any) => {
    setEdit(pos)
    setForm({ name:pos.name, dept_id:pos.dept_id||'all', reports_to:pos.reports_to||'',
      ...Object.fromEntries(ALL_PERMS.map(p => [p.key, !!pos[p.key]])) })
    setShow(true)
  }

  const save = async () => {
    if (!form.name) return
    const data = { ...form, created_at:fmtNow() }
    if (edit) {
      const updated = {...edit, ...data}
      setPositions((prev: any) => prev.map((p: any) => p.id===edit.id ? updated : p))
      await db.from('positions').update(data).eq('id', edit.id)
    } else {
      const newPos = { id:'pos_'+Date.now(), ...data }
      setPositions((prev: any) => [...prev, newPos])
      await db.from('positions').insert(newPos)
    }
    setShow(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Xóa vị trí này?')) return
    setPositions((prev: any) => prev.filter((p: any) => p.id!==id))
    await db.from('positions').delete().eq('id', id)
  }

  const groups = ALL_PERMS.reduce((acc: any, p) => {
    if (!acc[p.group]) acc[p.group] = []
    acc[p.group].push(p)
    return acc
  }, {})

  return (
    <div style={{ padding:`0 ${p} ${mobile?'80px':p}` }}>
      <Topbar mobile={mobile} title="Quản lý vị trí & quyền"
        subtitle="Thiết lập quyền hạn cho từng vị trí trong công ty"
        action={<GoldBtn small onClick={openCreate}>+ Thêm vị trí</GoldBtn>}/>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {positions.map((pos: any) => {
          const parentPos = positions.find((p: any) => p.id===pos.reports_to)
          const activePerms = ALL_PERMS.filter(p => pos[p.key]).length
          return (
            <Card key={pos.id} style={{ padding:'14px 18px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
                    <div style={{ fontSize:14, fontWeight:700, color:T.dark }}>{pos.name}</div>
                    <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, fontWeight:600,
                      color:DEPT_COLOR[pos.dept_id]||T.gold, background:T.goldBg }}>
                      {DEPT_NAME[pos.dept_id]||pos.dept_id}
                    </span>
                    {parentPos && (
                      <span style={{ fontSize:11, color:T.light }}>Báo cáo cho: {parentPos.name}</span>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                    {ALL_PERMS.filter(p => pos[p.key]).slice(0,5).map(p => (
                      <span key={p.key} style={{ fontSize:10, padding:'2px 7px', borderRadius:20,
                        background:T.greenBg, color:T.green, fontWeight:600 }}>{p.label}</span>
                    ))}
                    {activePerms > 5 && (
                      <span style={{ fontSize:10, padding:'2px 7px', borderRadius:20, background:T.grayBg, color:T.gray }}>
                        +{activePerms-5} quyền nữa
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={() => openEdit(pos)}
                    style={{ padding:'6px 13px', borderRadius:7, border:`1px solid ${T.border}`,
                      background:'transparent', cursor:'pointer', fontSize:12, fontFamily:'inherit', color:T.med }}>Sửa</button>
                  <button onClick={() => remove(pos.id)}
                    style={{ padding:'6px 13px', borderRadius:7, border:`1px solid ${T.redBg}`,
                      background:T.redBg, cursor:'pointer', fontSize:12, fontFamily:'inherit', color:T.red }}>Xóa</button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Modal open={show} onClose={() => setShow(false)} title={edit?'Sửa vị trí':'Thêm vị trí mới'} wide>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Inp label="Tên vị trí *" value={form.name} onChange={(v: string) => setForm((f: any) => ({...f, name:v}))} placeholder="VD: Kế toán, Phó kho..."/>
          <Sel label="Phòng ban" value={form.dept_id} onChange={(v: string) => setForm((f: any) => ({...f, dept_id:v}))}
            options={[{value:'all',label:'Tất cả'},{value:'kho',label:'Kho'},{value:'sale',label:'Sale'},{value:'vp',label:'Văn phòng'}]}/>
        </div>
        <Sel label="Báo cáo cho vị trí" value={form.reports_to} onChange={(v: string) => setForm((f: any) => ({...f, reports_to:v}))}
          options={[{value:'',label:'— Không (cấp cao nhất) —'},...positions.filter((p: any) => p.id!==edit?.id).map((pos: any) => ({value:pos.id,label:pos.name}))]}/>

        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:12, fontWeight:600, color:T.dark, marginBottom:10 }}>Phân quyền</div>
          {Object.entries(groups).map(([groupName, perms]: any) => (
            <div key={groupName} style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:T.gold, textTransform:'uppercase', letterSpacing:.5, marginBottom:8 }}>
                {groupName}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                {perms.map((perm: any) => (
                  <label key={perm.key} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer',
                    padding:'7px 10px', borderRadius:8, background:form[perm.key]?T.greenBg:T.bg,
                    border:`1px solid ${form[perm.key]?T.green:T.border}` }}>
                    <input type="checkbox" checked={!!form[perm.key]}
                      onChange={e => setForm((f: any) => ({...f, [perm.key]:e.target.checked}))}/>
                    <span style={{ fontSize:12, color:form[perm.key]?T.green:T.med, fontWeight:form[perm.key]?600:400 }}>
                      {perm.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
          <GoldBtn outline small onClick={() => setShow(false)}>Hủy</GoldBtn>
          <GoldBtn small onClick={save} disabled={!form.name}>Lưu vị trí</GoldBtn>
        </div>
      </Modal>
    </div>
  )
}

// ── SETTINGS ──────────────────────────────────────
function Settings({ user, setUser, settings, setSettings, onManualReset, mobile }: any) {
  const [oldPw, setOldPw]     = useState('')
  const [newPw, setNewPw]     = useState('')
  const [confPw, setConfPw]   = useState('')
  const [pwMsg, setPwMsg]     = useState('')
  const [monthDay, setMonthDay] = useState(String(settings?.monthly_reset_day||1))
  const [weekInt, setWeekInt]   = useState(String(settings?.weekly_reset_interval||7))
  const [saved, setSaved]       = useState(false)
  const [resetting, setResetting] = useState(false)
  const p = mobile ? '16px' : '24px'

  const changePassword = async () => {
    if (oldPw !== user.pin) { setPwMsg('❌ Mật khẩu hiện tại không đúng!'); return }
    if (newPw.length < 4) { setPwMsg('❌ Mật khẩu mới phải từ 4 ký tự!'); return }
    if (newPw !== confPw) { setPwMsg('❌ Mật khẩu xác nhận không khớp!'); return }
    await db.from('users').update({ pin:newPw, must_change_password:false }).eq('id', user.id)
    setUser((prev: any) => ({...prev, pin:newPw}))
    setOldPw(''); setNewPw(''); setConfPw('')
    setPwMsg('✅ Đổi mật khẩu thành công!')
    setTimeout(() => setPwMsg(''), 3000)
  }

  const saveSettings = async () => {
    const updated = {...settings, id:'main', monthly_reset_day:Number(monthDay), weekly_reset_interval:Number(weekInt)}
    await db.from('settings').upsert(updated)
    setSettings(updated); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ padding:`0 ${p} ${mobile?'80px':p}` }}>
      <Topbar mobile={mobile} title="Cài đặt"/>
      <div style={{ maxWidth:560, display:'flex', flexDirection:'column', gap:14 }}>
        <Card>
          <div style={{ fontSize:13, fontWeight:700, color:T.dark, marginBottom:14 }}>Tài khoản của tôi</div>
          <div style={{ display:'flex', alignItems:'center', gap:14, padding:14, background:T.bg, borderRadius:10, marginBottom:16 }}>
            <div style={{ width:50, height:50, borderRadius:'50%', background:DEPT_COLOR[user.dept_id]||T.gold,
              display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:16, fontWeight:700 }}>{user.ini}</div>
            <div>
              <div style={{ fontSize:16, fontWeight:700, color:T.dark }}>{user.name}</div>
              <div style={{ fontSize:12, color:T.gold, marginTop:2, fontWeight:600 }}>{user.position_name||'Chưa có vị trí'}</div>
              <div style={{ fontSize:11, color:T.light, marginTop:2 }}>{user.dept_name}</div>
            </div>
          </div>
          <div style={{ fontSize:13, fontWeight:600, color:T.dark, marginBottom:12 }}>🔐 Đổi mật khẩu</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            <Inp label="Mật khẩu hiện tại" type="password" value={oldPw} onChange={setOldPw} placeholder="••••"/>
            <Inp label="Mật khẩu mới" type="password" value={newPw} onChange={setNewPw} placeholder="••••"/>
            <Inp label="Xác nhận" type="password" value={confPw} onChange={setConfPw} placeholder="••••"/>
          </div>
          {pwMsg && <div style={{ fontSize:12, color:pwMsg.includes('✅')?T.green:T.red, marginBottom:10 }}>{pwMsg}</div>}
          <GoldBtn small onClick={changePassword}>Đổi mật khẩu</GoldBtn>
        </Card>

        {getPerm(user).resetChecklist && (
          <Card>
            <div style={{ fontSize:13, fontWeight:700, color:T.dark, marginBottom:14 }}>⚙️ Lịch reset tự động</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              <Inp label="Reset hàng tháng vào ngày (1-28)" type="number" min="1" max="28" value={monthDay} onChange={setMonthDay}/>
              <Inp label="Chu kỳ reset hàng tuần (số ngày)" type="number" min="1" max="30" value={weekInt} onChange={setWeekInt}/>
            </div>
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              <GoldBtn small onClick={saveSettings}>Lưu cài đặt</GoldBtn>
              {saved && <span style={{ color:T.green, fontSize:12 }}>✅ Đã lưu!</span>}
              <div style={{ flex:1 }}/>
              <GoldBtn outline small disabled={resetting}
                onClick={async () => { if (!confirm('Reset checklist ngay?')) return; setResetting(true); await onManualReset(); setResetting(false) }}>
                {resetting ? 'Đang reset...' : '🔄 Reset ngay'}
              </GoldBtn>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

// ── MAIN APP ──────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<any>(() => {
  try {
    const saved = localStorage.getItem('la_user')
    return saved ? JSON.parse(saved) : null
  } catch { return null }
})
  const [page, setPage]             = useState('checklist')
  const [allUsers, setAllUsers]     = useState<any[]>([])
  const [departments, setDepts]     = useState<any[]>([])
  const [checklist, setChecklist]   = useState<any[]>([])
  const [tasks, setTasks]           = useState<any[]>([])
  const [history, setHistory]       = useState<any[]>([])
  const [settings, setSettings]     = useState<any>(null)
  const [templates, setTemplates]   = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [leaveRequests, setLeaveReqs] = useState<any[]>([])
  const [positions, setPositions]   = useState<any[]>([])
  const [loading, setLoading]       = useState(false)
  const width   = useWindowWidth()
  const mobile  = width < 768

  const performReset = useCallback(async (curCl: any[], tmpl: any[], st: any, manual = false) => {
    const today = todayStr(); const s = st || {}
    const r_daily  = manual || s.last_daily_reset !== today
    const wDiff = s.last_weekly_reset ? (() => { try { const p=s.last_weekly_reset.split('/'); return Math.floor((Date.now()-new Date(`${p[2]}-${p[1]}-${p[0]}`).getTime())/86400000) } catch { return 999 } })() : 999
    const r_weekly = manual || wDiff >= (s.weekly_reset_interval || 7)
    const dom = new Date().getDate()
    const thisMonth = `${new Date().getMonth()}-${new Date().getFullYear()}`
    const lastMM = s.last_monthly_reset ? (() => { try { const d=s.last_monthly_reset.split('/'); return `${Number(d[1])-1}-${d[2]}` } catch { return '' } })() : ''
    const r_monthly = manual || (dom === (s.monthly_reset_day || 1) && lastMM !== thisMonth)
    if (!r_daily && !r_weekly && !r_monthly) return false

    const freqs: string[] = []
    if (r_daily)   freqs.push('Hàng ngày')
    if (r_weekly)  freqs.push('Hàng tuần')
    if (r_monthly) freqs.push('Hàng tháng')

    if (curCl.length > 0) {
      const archDate = s.last_daily_reset || today
      const hist = curCl.filter(c => freqs.includes(c.freq)).map(c => ({
        id:`hist_${c.id}_${Date.now()}_${Math.random().toString(36).slice(2,5)}`,
        date:archDate, assignee_id:c.assignee_id, title:c.title,
        freq:c.freq, status:c.status, done_at:c.done_at, dept_id:c.dept_id||''
      }))
      if (hist.length > 0) { await db.from('history').insert(hist); setHistory(prev => [...prev, ...hist]) }
    }

    for (const freq of freqs) await db.from('checklist').delete().eq('freq', freq)
    const newItems = tmpl.filter(t => t.active && freqs.includes(t.freq)).map(t => ({
      id:`cl_${t.id}_${Date.now()}_${Math.random().toString(36).slice(2,5)}`,
      template_id:t.id, title:t.title, description:t.description||`~${t.mins} phút`,
      assignee_id:t.assignee_id, priority:t.priority, freq:t.freq,
      deadline:t.deadline_suggest, status:'notyet', done_at:'', date:today
    }))
    if (newItems.length > 0) await db.from('checklist').insert(newItems)
    setChecklist(prev => [...prev.filter(c => !freqs.includes(c.freq)), ...newItems])

    const newSt = { ...s, id:'main',
      last_daily_reset:  r_daily   ? today : s.last_daily_reset||'',
      last_weekly_reset: r_weekly  ? today : s.last_weekly_reset||'',
      last_monthly_reset:r_monthly ? today : s.last_monthly_reset||'',
    }
    await db.from('settings').upsert(newSt); setSettings(newSt)
    return true
  }, [])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([
      db.from('departments').select('*'),
    db.from('users').select('*').eq('active', true),
      db.from('checklist_templates').select('*').eq('active', true),
      db.from('checklist').select('*'),
      db.from('tasks').select('*'),
      db.from('history').select('*').order('date'),
      db.from('settings').select('*').eq('id','main').single(),
      db.from('attendance').select('*').gte('date', new Date(Date.now()-30*86400000).toISOString().split('T')[0]),
      db.from('leave_requests').select('*').order('created_at', { ascending:false }),
      db.from('positions').select('*'),
    ]).then(async ([depts, users, tmpl, cl, tk, hist, st, att, lr, pos]) => {
      const deptsData = depts.data || []
      const posData   = pos.data   || []
      const usersData = (users.data || []).map((u: any) => {
  const pos = posData.find((p: any) => p.id === u.position_id)
  return {
    ...u,
    dept_name: deptsData.find((d: any) => d.id===u.dept_id)?.name || '',
    position: pos || null,
    position_name: pos?.name || '',
    position_id: u.position_id || '',
    reports_to: pos?.reports_to || '',
  }
})
      const tmplData = tmpl.data || []
      const clData   = cl.data   || []
      const stData   = st.data

      setDepts(deptsData); setAllUsers(usersData); setTemplates(tmplData)
      setTasks(tk.data||[]); setHistory(hist.data||[])
      setSettings(stData); setAttendance(att.data||[])
      setPositions(posData)

      // Merge DB data với localStorage backup để tránh mất đơn khi Supabase RLS chặn SELECT
      const dbLeave = lr.data || []
      const dbLeaveIds = new Set(dbLeave.map((r: any) => r.id))
      try {
        const localLeave = JSON.parse(localStorage.getItem('la_leave_backup') || '[]')
        // Chỉ giữ local items chưa có trong DB (chưa sync được)
        const localOnly = localLeave.filter((r: any) => !dbLeaveIds.has(r.id))
        const merged = [...dbLeave, ...localOnly]
        setLeaveReqs(merged)
        // Xóa local items đã sync thành công với DB
        const stillLocal = localLeave.filter((r: any) => !dbLeaveIds.has(r.id))
        localStorage.setItem('la_leave_backup', JSON.stringify(stillLocal))
      } catch {
        setLeaveReqs(dbLeave)
      }

      // Cập nhật user hiện tại với data mới nhất
      const freshUser = usersData.find((u: any) => u.id === user.id)
      if (freshUser) setUser(freshUser)

      const wasReset = await performReset(clData, tmplData, stData)
      if (!wasReset) {
        if (clData.length > 0) {
          setChecklist(clData)
        } else if (tmplData.length > 0) {
          const newItems = tmplData.filter((t: any) => t.active).map((t: any) => ({
            id:`cl_${t.id}_${Date.now()}_${Math.random().toString(36).slice(2,5)}`,
            template_id:t.id, title:t.title, description:t.description||`~${t.mins} phút`,
            assignee_id:t.assignee_id, priority:t.priority, freq:t.freq,
            deadline:t.deadline_suggest, status:'notyet', done_at:'', date:todayStr()
          }))
          await db.from('checklist').insert(newItems)
          setChecklist(newItems)
        }
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user?.id])

  const addLog = useCallback(async (_: any) => {}, [])

  const manualReset = useCallback(async () => {
    const { data:cl } = await db.from('checklist').select('*')
    await performReset(cl||[], templates, settings, true)
  }, [settings, templates, performReset])

  // Login
  if (!user) return <LoginScreen onLogin={(u: any) => {
    setUser(u)
    setPage(getPerm(u).viewAllDashboard || getPerm(u).viewDeptChecklist ? 'dashboard' : 'checklist')
  }}/>

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#16120E', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <LALogo size={60}/>
      <div style={{ color:T.gold, fontSize:14 }}>Đang tải dữ liệu...</div>
    </div>
  )

  const nav = getNav(getPerm(user), user?.dept_id||'')
  const validPage = nav.find(n => n.id===page) ? page : nav[0].id
  const pp = { user, allUsers, mobile }

  const dids = allUsers.filter((u: any) => u.dept_id===user.dept_id).map((u: any) => u.id)
  const pendingLeave = leaveRequests.filter((r: any) => {
    if (r.status !== 'pending') return false
    const step = r.status || 'pending_mgr'
    if (getPerm(user).viewAllDashboard) return ['pending_mgr','pending_admin'].includes(step)
    return getPerm(user).approveLeave && dids.includes(r.user_id) && step === 'pending_mgr'
  }).length
  const pendingOT = 0 // will be updated from Overtime component

  return (
       <div style={{ display:'flex', minHeight:'100vh', fontFamily:"'Segoe UI',system-ui,sans-serif", background:T.bg }}>
        {!mobile && (
          <Sidebar user={user} page={validPage} setPage={setPage}
            pendingLeave={pendingLeave} pendingOT={pendingOT}
            onLogout={() => { localStorage.removeItem('la_user'); setUser(null); setAllUsers([]); setChecklist([]) }}/>
        )}
        <main style={{ flex:1, overflowY:'auto', paddingTop:4 }}>
          {validPage==='dashboard' && <Dashboard {...pp} checklist={checklist} tasks={tasks} attendance={attendance} leaveRequests={leaveRequests} otRequests={[]}/>}
          {validPage==='checklist'  && <Checklist {...pp} checklist={checklist} setChecklist={setChecklist} addLog={addLog}/>}
          {validPage==='tasks'      && <Tasks {...pp} tasks={tasks} setTasks={setTasks} addLog={addLog}/>}
          {validPage==='templates'  && <Templates {...pp} templates={templates} setTemplates={setTemplates}/>}
          {validPage==='attendance' && <Attendance {...pp} leaveRequests={leaveRequests} attendance={attendance} setAttendance={setAttendance}/>}
          {validPage==='overtime'   && <Overtime {...pp}/>}
          {validPage==='announce'   && <Announcements {...pp}/>}
          {validPage==='leave'      && <Leave {...pp} leaveRequests={leaveRequests} setLeaveRequests={setLeaveReqs}/>}
          {validPage==='orgchart'   && <OrgChart {...pp} positions={positions}/>}
          {validPage==='history'    && <History {...pp} history={history}/>}
          {validPage==='users'      && <UserManagement {...pp} setAllUsers={setAllUsers} departments={departments} positions={positions}/>}
          {validPage==='positions'  && <PositionsManagement positions={positions} setPositions={setPositions} mobile={mobile}/>}
          {validPage==='shortage'   && <ShortageItems {...pp}/>}
          {validPage==='settings'   && <Settings {...pp} setUser={setUser} settings={settings} setSettings={setSettings} onManualReset={manualReset}/>}
        </main>
        {mobile && <BottomNav user={user} page={validPage} setPage={setPage} pendingLeave={pendingLeave} pendingOT={pendingOT} onLogout={() => { localStorage.removeItem('la_user'); setUser(null); setAllUsers([]); setChecklist([]) }}/>}
      </div>
     )
}

// ══ KẾT THÚC PHẦN 6 — HOÀN THÀNH! ══
