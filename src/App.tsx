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
  gold:'#C4973A', goldBg:'#FFF8E8', goldText:'#7A5A10', goldBorder:'#E5CFA0',
  sidebar:'#FDF6E9', sidebarBorder:'#E8D5A3', sidebarText:'#5A4010', sidebarMuted:'#A08040',
  bg:'#F4F2EE', card:'#FFFFFF', rowAlt:'#FAFAF8', divider:'#E4DFD7',
  dark:'#1A1614', med:'#6B5F50', light:'#A09080', border:'#DDD8CF',
  green:'#15803D', greenBg:'#DCFCE7',
  amber:'#B45309', amberBg:'#FEF3C7',
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
  present:    { label:'✅ Có mặt',    color:T.green,  bg:T.greenBg  },
  late:       { label:'⏰ Đi muộn',   color:T.amber,  bg:T.amberBg  },
  early_out:  { label:'🏃 Về sớm',    color:'#7C3AED', bg:'#EDE9FE'  },
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
    viewBirthday:       isAdmin || (pos.perm_approve_leave ?? false) || (pos.perm_view_birthday ?? false),
    enterKiot:          isAdmin || (pos.perm_enter_kiot ?? false),
    manageInventory:    isAdmin || (pos.perm_approve_leave ?? false) || (pos.perm_manage_inventory ?? false),
    resolveWrongOrder:  isAdmin || (pos.perm_approve_leave ?? false) || (pos.perm_resolve_wrong_order ?? false),
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
  { key:'perm_view_birthday',        label:'Xem ngày sinh nhật nhân viên',    group:'Nhân sự'   },
  { key:'perm_enter_kiot',           label:'Tích đã nhập KiotViet (hàng hoàn)', group:'Kho'      },
  { key:'perm_resolve_wrong_order',  label:'Xác nhận đã xử lý đơn sai',        group:'Kho'      },
  { key:'perm_manage_inventory',     label:'Xử lý kiểm kê (QM Kho)',            group:'Kho'      },
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
const LA_LOGO_SRC = 'data:image/png;base64,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'
const LALogo = ({ size = 38 }: any) => (
  <img src={LA_LOGO_SRC} alt="LA Global Beauty"
    style={{ width:size, height:size, objectFit:'contain', flexShrink:0 }}/>
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
  <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:'18px 22px',
    boxShadow:'0 1px 4px rgba(0,0,0,0.06)', ...style }}>
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
      <h1 style={{ margin:0, fontSize:mobile?18:21, fontWeight:700, color:T.dark,
        letterSpacing:.3, lineHeight:1.2 }}>{title}</h1>
      {subtitle && <div style={{ color:T.light, fontSize:12, marginTop:4, letterSpacing:.1 }}>{subtitle}</div>}
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
    <div style={{ minHeight:'100vh', background:T.sidebar, display:'flex',
      flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ textAlign:'center', marginBottom:40 }}>
        <LALogo size={72}/>
        <div style={{ color:T.gold, fontSize:22, fontFamily:'Georgia,serif', marginTop:14, letterSpacing:2 }}>LA Global Beauty</div>
        <div style={{ color:T.sidebarMuted, fontSize:12, marginTop:6 }}>Hệ thống quản lý nội bộ</div>
      </div>

      <div style={{ width:'100%', maxWidth:360, background:T.card,
        border:`1px solid ${T.sidebarBorder}`, borderRadius:16, padding:'28px 28px',
        boxShadow:'0 4px 24px rgba(196,151,58,0.12)' }}>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:500, color:T.med, marginBottom:6 }}>Tên đăng nhập</div>
          <input value={username} onChange={e => setUsername(e.target.value)}
            placeholder="Nhập username..."
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width:'100%', padding:'10px 13px', borderRadius:8, border:`1px solid ${T.border}`,
              background:T.bg, color:T.dark, fontSize:14, fontFamily:'inherit',
              outline:'none', boxSizing:'border-box' }}/>
        </div>

        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:12, fontWeight:500, color:T.med, marginBottom:6 }}>Mật khẩu</div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu..."
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width:'100%', padding:'10px 13px', borderRadius:8, border:`1px solid ${T.border}`,
              background:T.bg, color:T.dark, fontSize:14, fontFamily:'inherit',
              outline:'none', boxSizing:'border-box' }}/>
        </div>

        {error && <div style={{ color:'#F87171', fontSize:12, marginBottom:14, textAlign:'center' }}>{error}</div>}

        <button onClick={handleLogin} disabled={loading}
          style={{ width:'100%', padding:'11px', borderRadius:8, border:'none',
            background:T.gold, color:'#fff', fontSize:14, fontWeight:700,
            cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', opacity:loading?0.7:1 }}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <div style={{ textAlign:'center', marginTop:14, fontSize:11, color:T.sidebarMuted }}>
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
    <div style={{ minHeight:'100vh', background:T.sidebar, display:'flex',
      flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ textAlign:'center', marginBottom:32 }}>
        <LALogo size={56}/>
        <div style={{ color:T.gold, fontSize:18, fontFamily:'Georgia,serif', marginTop:12 }}>LA Global Beauty</div>
      </div>
      <div style={{ width:'100%', maxWidth:360, background:T.card,
        boxShadow:'0 4px 24px rgba(196,151,58,0.12)',
        border:`1px solid ${T.gold}55`, borderRadius:16, padding:'28px' }}>
        <div style={{ color:T.gold, fontSize:15, fontWeight:700, marginBottom:6 }}>🔐 Đổi mật khẩu lần đầu</div>
        <div style={{ color:T.med, fontSize:12, marginBottom:20, lineHeight:1.6 }}>
          Xin chào <span style={{ color:'#fff', fontWeight:600 }}>{user.name}</span>!<br/>
          Vui lòng đổi mật khẩu trước khi sử dụng.
        </div>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:12, color:T.med, marginBottom:6 }}>Mật khẩu mới (tối thiểu 6 ký tự)</div>
          <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
            placeholder="Nhập mật khẩu mới..."
            style={{ width:'100%', padding:'10px 13px', borderRadius:8, border:`1px solid ${T.border}`,
              background:T.bg, color:T.dark, fontSize:14, fontFamily:'inherit',
              outline:'none', boxSizing:'border-box' }}/>
        </div>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:12, color:T.med, marginBottom:6 }}>Xác nhận mật khẩu</div>
          <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
            placeholder="Nhập lại mật khẩu..."
            onKeyDown={e => e.key === 'Enter' && handleChange()}
            style={{ width:'100%', padding:'10px 13px', borderRadius:8, border:`1px solid ${T.border}`,
              background:T.bg, color:T.dark, fontSize:14, fontFamily:'inherit',
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
        (deptId==='kho'||perm.viewAllDashboard) && { id:'inventory', icon:'📦', label:'Kiểm kê kho' },
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

    {
      id:'reports', icon:'📋', label:'Báo cáo',
      pages:[
        { id:'shortage', icon:'📦', label:'Hàng thiếu'  },
        { id:'returns',  icon:'🔄', label:'Hàng hoàn'   },
        { id:'wrongord', icon:'⚠️', label:'Đơn sai'     },
      ].filter(p => p.id!=='shortage' || deptId==='sale' || perm.viewAllDashboard)
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
    <div style={{ width:230, background:T.sidebar, display:'flex', flexDirection:'column',
      flexShrink:0, height:'100vh', position:'sticky', top:0,
      borderRight:`1px solid ${T.sidebarBorder}` }}>

      {/* ── Logo ── */}
      <div style={{ padding:'16px 14px 12px', borderBottom:`1px solid ${T.sidebarBorder}` }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
          <LALogo size={160}/>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex:1, padding:'4px 10px 8px', overflowY:'auto' }}>
        {groups.map((group: any) => {
          const isActiveGroup = activeGroup?.id === group.id
          const groupBadge = group.id==='hr' ? pendingLeave+pendingOT : 0
          return (
            <div key={group.id} style={{ marginBottom:6 }}>
              {/* Section label */}
              <div style={{ display:'flex', alignItems:'center', gap:6,
                padding:'6px 8px 3px',
                fontSize:9, fontWeight:800, letterSpacing:1.4,
                textTransform:'uppercase',
                color:isActiveGroup ? T.gold : T.sidebarMuted }}>
                <span style={{ fontSize:10 }}>{group.icon}</span>
                <span style={{ flex:1 }}>{group.label}</span>
                {groupBadge>0 && (
                  <span style={{ background:T.red, color:'#fff', borderRadius:20,
                    fontSize:9, fontWeight:700, padding:'1px 6px', lineHeight:'16px' }}>
                    {groupBadge}
                  </span>
                )}
              </div>

              {/* Items */}
              {group.pages.map((item: any) => {
                const active = page === item.id
                const badge  = item.id==='leave' ? pendingLeave : item.id==='overtime' ? pendingOT : 0
                return (
                  <button key={item.id} onClick={() => setPage(item.id)}
                    style={{
                      width:'100%', display:'flex', alignItems:'center', gap:9,
                      padding:'8px 12px', marginBottom:1, border:'none',
                      borderRadius:10, cursor:'pointer', fontFamily:'inherit',
                      fontSize:12.5, textAlign:'left', transition:'all .12s',
                      // Active: solid gold background with shadow
                      background: active
                        ? 'linear-gradient(135deg, #C4973A 0%, #A07828 100%)'
                        : 'transparent',
                      color: active ? '#fff' : T.sidebarText,
                      fontWeight: active ? 700 : 400,
                      boxShadow: active
                        ? '0 2px 8px rgba(196,151,58,0.35)'
                        : 'none',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as any).style.background = 'rgba(196,151,58,0.1)'
                        ;(e.currentTarget as any).style.color = T.goldText
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as any).style.background = 'transparent'
                        ;(e.currentTarget as any).style.color = T.sidebarText
                      }
                    }}>
                    <span style={{ fontSize:14, width:18, textAlign:'center', flexShrink:0 }}>
                      {item.icon}
                    </span>
                    <span style={{ flex:1, letterSpacing:.1 }}>{item.label}</span>
                    {badge>0 && (
                      <span style={{
                        background: active ? 'rgba(255,255,255,0.3)' : T.red,
                        color:'#fff', borderRadius:20,
                        fontSize:9, fontWeight:700, padding:'1px 6px', lineHeight:'16px',
                        flexShrink:0
                      }}>{badge}</span>
                    )}
                  </button>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* ── User card ── */}
      <div style={{ padding:'10px 12px 14px', borderTop:`1px solid ${T.sidebarBorder}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px',
          background:'rgba(196,151,58,0.08)', borderRadius:10, marginBottom:8 }}>
          <div style={{ width:32, height:32, borderRadius:'50%',
            background:`linear-gradient(135deg, ${DEPT_COLOR[user.dept_id]||T.gold} 0%, ${DEPT_COLOR[user.dept_id]||'#9A7010'} 100%)`,
            flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontSize:10, fontWeight:700,
            boxShadow:'0 2px 6px rgba(0,0,0,0.12)' }}>
            {user.ini}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ color:T.dark, fontSize:12, fontWeight:700,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
            <div style={{ color:T.gold, fontSize:10, fontWeight:500 }}>
              {user.position_name||user.dept_name}
            </div>
          </div>
        </div>
        <button onClick={onLogout}
          style={{ width:'100%', padding:'7px', borderRadius:8,
            border:`1px solid ${T.sidebarBorder}`, background:'transparent',
            color:T.sidebarMuted, fontSize:11, cursor:'pointer', fontFamily:'inherit',
            display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          <span>🚪</span> Đăng xuất
        </button>
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
          borderTop:`1px solid ${T.sidebarBorder}`, zIndex:99 }}>
          {/* User info */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'8px 14px', borderBottom:`1px solid ${T.sidebarBorder}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:DEPT_COLOR[user.dept_id]||T.gold,
                display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:8, fontWeight:700 }}>{user.ini}</div>
              <div>
                <div style={{ color:T.dark, fontSize:11, fontWeight:600 }}>{user.name}</div>
                <div style={{ color:T.gold, fontSize:9 }}>{user.position_name||user.dept_name}</div>
              </div>
            </div>
            <button onClick={() => { if(confirm('Đăng xuất?')) onLogout() }}
              style={{ padding:'4px 10px', borderRadius:6, border:`1px solid ${T.redBg}`,
                background:T.redBg, color:T.red, fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>
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
                    background:active?T.goldBg:'rgba(0,0,0,0.03)',
                    color:active?T.goldText:T.sidebarText,
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
        display:'flex', borderTop:`1px solid ${T.sidebarBorder}`, zIndex:100,
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
                color:isActive?T.gold:T.sidebarMuted }}>
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
          onChange={(v) => setAddForm(f => ({...f, title:v}))} placeholder="VD: Gọi điện khách hàng X..."/>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Inp label="🕐 Giờ bắt đầu" type="time" value={addForm.time_start}
            onChange={(v) => setAddForm(f => ({...f, time_start:v}))}/>
          <Inp label="🏁 Giờ kết thúc" type="time" value={addForm.time_end}
            onChange={(v) => setAddForm(f => ({...f, time_end:v}))}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Sel label="Tần suất" value={addForm.freq}
            onChange={(v) => setAddForm(f => ({...f, freq:v}))}
            options={['Hàng ngày','Hàng tuần','Hàng tháng'].map(v => ({value:v, label:v}))}/>
          <Sel label="Ưu tiên" value={addForm.priority}
            onChange={(v) => setAddForm(f => ({...f, priority:v}))}
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
        <Inp label="Tiêu đề *" value={form.title} onChange={(v) => setForm(f => ({...f, title:v}))} placeholder="Nhập tiêu đề..."/>
        <Inp label="Mô tả" value={form.description} onChange={(v) => setForm(f => ({...f, description:v}))} placeholder="Mô tả yêu cầu..."/>
        <Sel label="Giao cho *" value={form.assignee_id} onChange={(v) => setForm(f => ({...f, assignee_id:v}))}
          options={[{value:'',label:'— Chọn nhân viên —'},...assignable.map((u: any) => ({value:u.id,label:`${u.name} — ${u.position_name||u.dept_name||''}`}))]}/>
        <Sel label="Mức ưu tiên" value={form.priority} onChange={(v) => setForm(f => ({...f, priority:v}))}
          options={[{value:'high',label:'🔴 Cao'},{value:'mid',label:'🟡 Trung bình'},{value:'low',label:'🟢 Thấp'}]}/>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Inp label="Ngày deadline *" type="date" value={form.deadline} onChange={(v) => setForm(f => ({...f, deadline:v}))}/>
          <Inp label="Giờ kết thúc *" type="time" value={form.deadline_time} onChange={(v) => setForm(f => ({...f, deadline_time:v}))}/>
        </div>
        <div style={{ padding:'8px 12px', background:T.goldBg, borderRadius:8, fontSize:12, color:T.goldText, marginBottom:13 }}>
          ⏰ Giờ bắt đầu sẽ tự động ghi nhận thời điểm tạo task
        </div>
        <Inp label="Ghi chú" value={form.notes} onChange={(v) => setForm(f => ({...f, notes:v}))} placeholder="Ghi chú thêm..."/>
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
                        <div style={{ fontSize:10, color:T.light, marginTop:2 }}>
                          {Number(tp.day_of_month)===99 ? '📅 Cuối tháng' : `📅 Ngày ${tp.day_of_month}`}
                        </div>
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
            <Inp label="Tiêu đề *" value={form.title} onChange={(v) => setForm((f: any) => ({...f, title:v}))} placeholder="Nhập tiêu đề..."/>
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <Inp label="Mô tả" value={form.description} onChange={(v) => setForm((f: any) => ({...f, description:v}))} placeholder="Mô tả ngắn..."/>
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <Sel label="Giao cho *" value={form.assignee_id} onChange={(v) => setForm((f: any) => ({...f, assignee_id:v}))}
              options={[{value:'',label:'— Chọn nhân viên —'},...staff.map((u: any) => ({value:u.id,label:`${u.name} — ${u.position_name||u.dept_name||''}`}))]}/>
          </div>
          <Sel label="Tần suất" value={form.freq} onChange={(v) => setForm((f: any) => ({...f, freq:v}))}
            options={['Hàng ngày','Hàng tuần','Hàng tháng'].map(v => ({value:v,label:v}))}/>
          <Sel label="Ưu tiên" value={form.priority} onChange={(v) => setForm((f: any) => ({...f, priority:v}))}
            options={[{value:'high',label:'🔴 Cao'},{value:'mid',label:'🟡 Trung bình'},{value:'low',label:'🟢 Thấp'}]}/>
          <Inp label="🕐 Giờ bắt đầu" type="time" value={form.time_start} onChange={(v) => setForm((f: any) => ({...f, time_start:v}))}/>
          <Inp label="🏁 Giờ kết thúc" type="time" value={form.time_end} onChange={(v) => setForm((f: any) => ({...f, time_end:v}))}/>
          {form.freq === 'Hàng tháng' && (
            <div style={{ marginBottom:13 }}>
              <div style={{ fontSize:12, fontWeight:500, color:T.med, marginBottom:6 }}>📅 Ngày thực hiện hàng tháng</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {[
                  {val:'1',  label:'Ngày 1'},  {val:'3',  label:'Ngày 3'},
                  {val:'5',  label:'Ngày 5'},  {val:'10', label:'Ngày 10'},
                  {val:'15', label:'Ngày 15'}, {val:'20', label:'Ngày 20'},
                  {val:'25', label:'Ngày 25'}, {val:'99', label:'Cuối tháng'},
                ].map(opt => (
                  <button key={opt.val} type="button"
                    onClick={() => setForm((f: any) => ({...f, day_of_month:opt.val}))}
                    style={{ padding:'6px 12px', borderRadius:8, cursor:'pointer',
                      fontFamily:'inherit', fontSize:12, border:'none',
                      background: form.day_of_month===opt.val ? T.gold : T.bg,
                      color: form.day_of_month===opt.val ? '#fff' : T.dark,
                      fontWeight: form.day_of_month===opt.val ? 700 : 400,
                      border: `1.5px solid ${form.day_of_month===opt.val ? T.gold : T.border}` }}>
                    {opt.label}
                  </button>
                ))}
                <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:4 }}>
                  <span style={{ fontSize:12, color:T.med }}>Ngày khác:</span>
                  <input type="number" min="1" max="28"
                    value={['1','3','5','10','15','20','25','99'].includes(form.day_of_month)?'':form.day_of_month}
                    onChange={e => setForm((f: any) => ({...f, day_of_month:e.target.value}))}
                    placeholder="1-28"
                    style={{ width:60, padding:'5px 8px', border:`1.5px solid ${T.border}`, borderRadius:8,
                      fontSize:12, fontFamily:'inherit', color:T.dark, background:T.bg, outline:'none' }}/>
                </div>
              </div>
              <div style={{ fontSize:11, color:T.light, marginTop:5 }}>
                {form.day_of_month==='99'
                  ? '⚡ Sẽ tạo vào ngày cuối cùng của mỗi tháng (28/29/30/31)'
                  : `⚡ Sẽ tạo vào ngày ${form.day_of_month} mỗi tháng`}
              </div>
            </div>
          )}
          <Inp label="Thời lượng (phút)" type="number" value={form.mins} onChange={(v) => setForm((f: any) => ({...f, mins:v}))}/>
        </div>
        {form.time_start && form.time_end && (
          <div style={{ padding:'8px 12px', background:T.goldBg, borderRadius:8, fontSize:12, color:T.goldText, margin:'8px 0 13px', fontWeight:600 }}>
            🕐 Khung giờ: <b>{form.time_start} → {form.time_end}</b>
            {form.freq==='Hàng tháng' && ` — ${Number(form.day_of_month)===99?'Cuối tháng':`Ngày ${form.day_of_month}`} hàng tháng`}
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
      else if (s==='late')       { present++; late++ }
      else if (s==='early_out') { present++ }
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
          onChange={(v) => setEditForm((f: any) => ({...f, status:v}))}
          options={Object.entries(ATT_STATUS).map(([v, s]: any) => ({ value:v, label:s.label }))}/>
        {editForm.status==='late' && (
          <Inp label="Số phút đi muộn" type="number"
            value={String(editForm.late_mins)}
            onChange={(v) => setEditForm((f: any) => ({...f, late_mins:Number(v)}))}
            placeholder="VD: 15"/>
        )}
        {['absent','sick','half'].includes(editForm.status) && (
          <Inp label="Lý do" value={editForm.reason}
            onChange={(v) => setEditForm((f: any) => ({...f, reason:v}))}
            placeholder="Nhập lý do..."/>
        )}
        <Inp label="Ghi chú" value={editForm.notes}
          onChange={(v) => setEditForm(f => ({...f, notes:v}))}
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
          onChange={(v) => setForm(f => ({...f, date:v}))}/>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Inp label="Giờ bắt đầu *" type="time" value={form.start_time}
            onChange={(v) => setForm(f => ({...f, start_time:v}))}/>
          <Inp label="Giờ kết thúc *" type="time" value={form.end_time}
            onChange={(v) => setForm(f => ({...f, end_time:v}))}/>
        </div>
        {form.start_time && form.end_time && calcHours(form.start_time, form.end_time) > 0 && (
          <div style={{ padding:'8px 12px', background:T.goldBg, borderRadius:8, fontSize:12, color:T.goldText, marginBottom:13, fontWeight:600 }}>
            ⏱️ Tổng: {calcHours(form.start_time, form.end_time)} giờ OT
          </div>
        )}
        <Inp label="Lý do làm thêm *" value={form.reason}
          onChange={(v) => setForm(f => ({...f, reason:v}))}
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
    // Lưu days=1 cho nửa ngày để tránh lỗi integer DB, dùng half_day='yes' để phân biệt
    const days = isHalf ? 1 : daysBetween(form.start_date, form.end_date)
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
          onChange={(v) => setForm((f: any) => ({
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
              onChange={(v) => setForm((f: any) => ({...f, start_date:v, end_date:v}))}/>
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
              onChange={(v) => setForm((f: any) => ({...f, start_date:v}))}/>
            <Inp label="Đến ngày *" type="date" value={form.end_date}
              onChange={(v) => setForm((f: any) => ({...f, end_date:v, start_date:f.start_date||v}))}/>
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
        <Inp label="Lý do *" value={form.reason} onChange={(v) => setForm((f: any) => ({...f, reason:v}))} placeholder="Nhập lý do xin nghỉ..."/>
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
        <Inp label="Tiêu đề *" value={form.title} onChange={(v) => setForm(f => ({...f, title:v}))} placeholder="Tiêu đề thông báo..."/>
        <div style={{ marginBottom:13 }}>
          <div style={{ fontSize:12, fontWeight:500, color:T.med, marginBottom:5 }}>Nội dung *</div>
          <textarea value={form.content} onChange={e => setForm(f => ({...f, content:e.target.value}))}
            placeholder="Nhập nội dung thông báo..."
            style={{ width:'100%', padding:'8px 11px', border:`1px solid ${T.border}`, borderRadius:8,
              fontSize:13, fontFamily:'inherit', color:T.dark, background:T.bg,
              boxSizing:'border-box', outline:'none', minHeight:120, resize:'vertical' }}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Sel label="Gửi tới" value={form.target_dept} onChange={(v) => setForm(f => ({...f, target_dept:v}))}
            options={[{value:'all',label:'📢 Toàn công ty'},{value:'kho',label:'🏭 Phòng Kho'},{value:'sale',label:'💼 Phòng Sale'},{value:'vp',label:'🏢 Văn phòng'}]}/>
          <Sel label="Mức độ" value={form.priority} onChange={(v) => setForm(f => ({...f, priority:v}))}
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
// ── MANAGER SHORTAGE ROW ─────────────────────────────
function MgrShortageRow({ item, idx, total, products, norm, setItems }: any) {
  const [open, setOpen]       = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [arrDate, setArrDate]  = useState(item.arrival_date||'')
  const [arrQty,  setArrQty]   = useState(String(item.arrival_qty||''))
  const [mgrNote, setMgrNote]  = useState(item.manager_note||'')
  const [selStatus, setSelStatus] = useState(item.status||'pending')

  const hot = (item.reporters||[]).length
  const days = (() => {
    if (!item.arrival_date) return null
    const today = new Date(); today.setHours(0,0,0,0)
    return Math.ceil((new Date(item.arrival_date).getTime()-today.getTime())/86400000)
  })()
  const arrivedMs = item.arrived_at ? Date.now()-new Date(item.arrived_at).getTime() : 0
  const daysLeft  = Math.max(0, 3-Math.floor(arrivedMs/86400000))
  const prod  = (products||[]).find((p: any) => p.code===item.product_code || norm(p.name)===norm(item.product_name))
  const stock = prod?.stock

  const sb = (() => {
    if (item.status==='arrived')  return { label:'✅ Đã về',       color:T.green, bg:T.greenBg }
    if (item.status==='burned')   return { label:'🔥 Cháy hàng',  color:T.red,   bg:T.redBg   }
    if (item.status==='pending')  return { label:'⏳ Chờ xử lý',  color:T.amber, bg:T.amberBg }
    if (item.status==='incoming') {
      if (days===null) return { label:'📅 Sắp về',                  color:T.blue,  bg:T.blueBg }
      if (days>0)      return { label:`📅 Còn ${days} ngày`,       color:T.blue,  bg:T.blueBg }
      if (days===0)    return { label:'⏰ Hôm nay về!',             color:T.amber, bg:T.amberBg }
      return           { label:`⚠️ Trễ ${Math.abs(days)} ngày`,   color:T.red,   bg:T.redBg }
    }
    return { label:'⏳ Chờ xử lý', color:T.amber, bg:T.amberBg }
  })()

  const saveEdit = async () => {
    let newStatus = selStatus
    let upd: any = { manager_note:mgrNote, arrival_date:arrDate, arrival_qty:Number(arrQty)||0, status:newStatus }
    if (newStatus === 'arrived' && !item.arrived_at) upd.arrived_at = new Date().toISOString()
    setItems((prev: any) => prev.map((i: any) => i.id===item.id ? {...i,...upd} : i))
    await db.from('shortage_items').update(upd).eq('id', item.id)
    setEditMode(false)
  }
  const markArrived = async () => {
    const upd = { status:'arrived', arrived_at:new Date().toISOString() }
    setItems((prev: any) => prev.map((i: any) => i.id===item.id ? {...i,...upd} : i))
    await db.from('shortage_items').update(upd).eq('id', item.id)
  }
  const remove = async () => {
    if (!confirm('Xóa mã này?')) return
    setItems((prev: any) => prev.filter((i: any) => i.id!==item.id))
    await db.from('shortage_items').delete().eq('id', item.id)
  }

  return (
    <div style={{ borderBottom: idx<total-1?`1px solid ${T.border}`:'none' }}>
      <div onClick={() => setOpen(v => !v)}
        style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px',
          cursor:'pointer', background:open?T.goldBg:'transparent', transition:'background .12s' }}
        onMouseEnter={e => { if(!open)(e.currentTarget as any).style.background=T.bg }}
        onMouseLeave={e => { if(!open)(e.currentTarget as any).style.background='transparent' }}>
        {hot>=3 && <span style={{ fontSize:9, fontWeight:700, color:'#BF360C', background:'#FBE9E7', padding:'1px 5px', borderRadius:10, flexShrink:0 }}>🔥{hot}</span>}
        {hot===2 && <span style={{ fontSize:9, fontWeight:700, color:T.amber, background:T.amberBg, padding:'1px 5px', borderRadius:10, flexShrink:0 }}>⚡{hot}</span>}
        <div style={{ flex:1, fontSize:12, fontWeight:500, color:T.dark,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', lineHeight:1.4 }}>
          {item.product_name}
          {item.product_code && <span style={{ fontSize:10, color:T.light, marginLeft:6 }}>#{item.product_code}</span>}
        </div>
        {stock!=null && (
          <span style={{ fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:20, flexShrink:0,
            color:stock===0?T.red:stock<=5?T.amber:T.green,
            background:stock===0?T.redBg:stock<=5?T.amberBg:T.greenBg }}>{stock}</span>
        )}
        <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:20, flexShrink:0,
          color:sb.color, background:sb.bg, whiteSpace:'nowrap' }}>{sb.label}</span>
        {item.status==='arrived' && <span style={{ fontSize:9, color:T.light, flexShrink:0 }}>{daysLeft}N</span>}
        <span style={{ fontSize:9, color:T.light, flexShrink:0 }}>{open?'▲':'▼'}</span>
      </div>

      {open && (
        <div style={{ padding:'10px 14px 14px', background:T.bg, borderTop:`1px solid ${T.border}` }}>
          {/* Reporters */}
          <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8 }}>
            {(item.reporters||[]).map((r: any, i: number) => (
              <span key={i} style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:T.goldBg, color:T.goldText, fontWeight:600 }}>
                {r.name}{r.note?` · ${r.note}`:''}
              </span>
            ))}
          </div>

          {!editMode ? (
            <>
              {/* Summary view */}
              {(item.manager_note || item.arrival_date) && (
                <div style={{ fontSize:11, color:T.blue, padding:'6px 10px', background:T.blueBg, borderRadius:7, marginBottom:8 }}>
                  {item.arrival_date && <span>📅 Ngày về dự kiến: <b>{fmtDate(item.arrival_date)}</b>
                    {item.arrival_qty>0 && ` · SL: ${item.arrival_qty}`}</span>}
                  {item.manager_note && <div style={{marginTop:2}}>💬 {item.manager_note}</div>}
                </div>
              )}
              {item.status==='arrived' && (
                <div style={{ fontSize:11, color:T.green, marginBottom:8, fontStyle:'italic' }}>🕐 Tự xóa sau {daysLeft} ngày</div>
              )}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {item.status!=='arrived' && item.status!=='burned' && (
                  <button onClick={() => { setEditMode(true); setSelStatus(item.status) }}
                    style={{ padding:'4px 11px', borderRadius:7, border:`1.5px solid ${T.gold}`,
                      background:T.goldBg, cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.goldText, fontWeight:600 }}>
                    ✏️ Cập nhật
                  </button>
                )}
                {item.status!=='arrived' && item.status!=='burned' && (
                  <button onClick={markArrived}
                    style={{ padding:'4px 11px', borderRadius:7, border:`1.5px solid ${T.green}`,
                      background:T.greenBg, cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.green, fontWeight:600 }}>
                    ✅ Xác nhận đã về
                  </button>
                )}
                <button onClick={remove}
                  style={{ padding:'4px 10px', borderRadius:7, border:`1px solid ${T.redBg}`,
                    background:T.redBg, cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.red }}>
                  🗑️ Xóa
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Edit form */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:11, color:T.med, marginBottom:4 }}>📅 Trạng thái</div>
                  <select value={selStatus} onChange={e => setSelStatus(e.target.value)}
                    style={{ width:'100%', padding:'7px 9px', border:`1px solid ${T.border}`, borderRadius:7,
                      fontSize:12, fontFamily:'inherit', color:T.dark, background:'#fff', outline:'none' }}>
                    <option value="pending">⏳ Chờ xử lý</option>
                    <option value="incoming">📅 Sắp về</option>
                    <option value="burned">🔥 Hàng cháy</option>
                    <option value="arrived">✅ Đã về</option>
                  </select>
                </div>
                {selStatus==='incoming' && (
                  <div>
                    <div style={{ fontSize:11, color:T.med, marginBottom:4 }}>📅 Ngày về dự kiến</div>
                    <input type="date" value={arrDate} onChange={e => setArrDate(e.target.value)}
                      style={{ width:'100%', padding:'7px 9px', border:`1px solid ${T.border}`, borderRadius:7,
                        fontSize:12, fontFamily:'inherit', color:T.dark, background:'#fff' }}/>
                  </div>
                )}
                {selStatus==='incoming' && (
                  <div>
                    <div style={{ fontSize:11, color:T.med, marginBottom:4 }}>📦 Số lượng về</div>
                    <input type="number" value={arrQty} onChange={e => setArrQty(e.target.value)}
                      style={{ width:'100%', padding:'7px 9px', border:`1px solid ${T.border}`, borderRadius:7,
                        fontSize:12, fontFamily:'inherit', color:T.dark, background:'#fff' }}/>
                  </div>
                )}
              </div>
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:11, color:T.med, marginBottom:4 }}>💬 Ghi chú QM</div>
                <input value={mgrNote} onChange={e => setMgrNote(e.target.value)} placeholder="Ghi chú..."
                  style={{ width:'100%', padding:'7px 9px', border:`1px solid ${T.border}`, borderRadius:7,
                    fontSize:12, fontFamily:'inherit', color:T.dark, background:'#fff', boxSizing:'border-box' as any }}/>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={saveEdit}
                  style={{ padding:'5px 14px', borderRadius:7, border:'none', background:T.gold,
                    color:'#fff', cursor:'pointer', fontSize:12, fontFamily:'inherit', fontWeight:600 }}>Lưu</button>
                <button onClick={() => setEditMode(false)}
                  style={{ padding:'5px 12px', borderRadius:7, border:`1px solid ${T.border}`,
                    background:'transparent', cursor:'pointer', fontSize:12, fontFamily:'inherit', color:T.med }}>Hủy</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function ShortageItems({ user, allUsers, mobile, products, setProducts }: any) {
  const [items,        setItems]       = useState<any[]>([])
  // products from App props
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
    db.from('shortage_items').select('*').order('created_at', { ascending:false })
      .then(({ data }) => { if (data) setItems(data) })
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
                  <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20,
                    color:ordered>0?T.blue:T.light, background:ordered>0?T.blueBg:T.bg }}>
                    🛒 KH đặt: {ordered}
                  </span>
                  {hasOrder && <>
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
        {/* Sale có thể tự đánh "Đã về" bất kỳ lúc nào */}
        {!canManage && item.status!=='arrived' && item.status!=='burned' && (
          <button onClick={() => { if(confirm('Xác nhận hàng đã về kho?')) markArrived() }}
            style={{ padding:'5px 13px', borderRadius:7, border:`1.5px solid ${T.green}`,
              background:T.greenBg, cursor:'pointer', fontSize:12, fontFamily:'inherit', color:T.green, fontWeight:600, marginBottom:8 }}>
            ✅ Hàng đã về
          </button>
        )}
        {/* Đã về: đếm ngược tự xóa */}
        {item.status==='arrived' && !canManage && (() => {
          const arrivedMs = item.arrived_at ? Date.now() - new Date(item.arrived_at).getTime() : 0
          const daysLeft  = Math.max(0, 3 - Math.floor(arrivedMs / 86400000))
          return (
            <div style={{ fontSize:11, color:T.green, fontStyle:'italic', marginBottom:8 }}>
              🕐 Mã này sẽ tự ẩn sau {daysLeft} ngày nữa
            </div>
          )
        })()}

        {/* Manager actions */}
        {canManage && item.status!=='arrived' && !editMode && (
          <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:4 }}>
            <button onClick={() => setEditMode(true)}
              style={{ padding:'5px 12px', borderRadius:7, border:`1.5px solid ${T.gold}`,
                background:T.goldBg, cursor:'pointer', fontSize:12, fontFamily:'inherit', color:T.goldText, fontWeight:600 }}>
              ✏️ Cập nhật
            </button>
            {item.status==='incoming' && (
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
            {(perm.manageUsers || isManager) && <GoldBtn outline small onClick={() => setShowProdMgmt(true)}>📋 DS Sản phẩm</GoldBtn>}
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
          ) : (
            <div style={{ background:T.card, borderRadius:12, border:`1px solid ${T.border}`, overflow:'hidden' }}>
              {tabData[mgrTab].map((item: any, idx: number) => (
                <MgrShortageRow key={item.id} item={item} idx={idx}
                  total={tabData[mgrTab].length} products={products}
                  norm={norm} setItems={setItems}/>
              ))}
            </div>
          )}
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
                      {/* Xác nhận đã về — sale tự đánh bất kỳ lúc nào (không cần đợi QM) */}
                      {item.status !== 'arrived' && item.status !== 'burned' && (
                        <button onClick={async e => {
                          e.stopPropagation()
                          if (!confirm('Xác nhận hàng đã về kho?')) return
                          await updateItem(item.id, { status:'arrived', arrived_at:new Date().toISOString() })
                        }}
                          style={{ padding:'4px 12px', borderRadius:7, border:`1.5px solid ${T.green}`,
                            background:T.greenBg, cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.green, fontWeight:600 }}>
                          ✅ Hàng đã về
                        </button>
                      )}
                      {/* Đã về: hiện thời gian tự clear + nút xóa thủ công */}
                      {item.status === 'arrived' && (() => {
                        const arrivedMs = item.arrived_at ? Date.now() - new Date(item.arrived_at).getTime() : 0
                        const daysLeft  = Math.max(0, 3 - Math.floor(arrivedMs / 86400000))
                        return (
                          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                            <span style={{ fontSize:10, color:T.green, fontStyle:'italic' }}>
                              🕐 Tự xóa sau {daysLeft} ngày nữa
                            </span>
                            <button onClick={async e => {
                              e.stopPropagation()
                              if (!confirm('Xóa mã này khỏi danh sách?')) return
                              setItems(prev => prev.filter(i => i.id !== item.id))
                              await db.from('shortage_items').delete().eq('id', item.id)
                            }}
                              style={{ padding:'3px 9px', borderRadius:6, border:`1px solid ${T.redBg}`,
                                background:T.redBg, cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.red }}>
                              🗑️ Xóa ngay
                            </button>
                          </div>
                        )
                      })()}
                      {/* Nút xóa thông thường — chỉ người báo hoặc admin, chưa arrived */}
                      {item.status !== 'arrived' && (() => {
                        const isMine = (item.reporters||[]).some((r: any) => r.user_id === user.id)
                        const canDel = isMine || getPerm(user).viewAllDashboard
                        if (!canDel) return null
                        return (
                          <button onClick={async e => {
                            e.stopPropagation()
                            if (!confirm('Xóa mã này khỏi danh sách?')) return
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
                // Reload ALL products after sync
                const allPr: any[] = []
                let fromIdx = 0
                while (true) {
                  const { data: prPage } = await db.from('products').select('*').eq('active', true)
                    .order('name').range(fromIdx, fromIdx + 999)
                  if (!prPage || prPage.length === 0) break
                  allPr.push(...prPage)
                  if (prPage.length < 1000) break
                  fromIdx += 1000
                }
                if (allPr.length > 0) setProducts(allPr)
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
        <div style={{ fontSize:11, color:T.light, marginBottom:8 }}>{products.length.toLocaleString('vi-VN')} sản phẩm · 🔍 Fuzzy search theo tên/mã</div>
        <div style={{ maxHeight:360, overflowY:'auto', border:`1px solid ${T.border}`, borderRadius:8 }}>
          {products.map((pr, i) => (
            <div key={pr.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px',
              borderBottom:i<products.length-1?`1px solid ${T.border}`:'none', background:i%2===0?'#fff':T.rowAlt }}>
              <div style={{ flex:1, fontSize:13, color:T.dark, fontWeight:500 }}>{pr.name}</div>
              {pr.code && <div style={{ fontSize:11, color:T.light }}>#{pr.code}</div>}
              {pr.unit && <div style={{ fontSize:11, color:T.med }}>{pr.unit}</div>}
              {pr.stock !== null && pr.stock !== undefined && pr.stock !== '' && (
                <div style={{ fontSize:11, fontWeight:700,
                  color:Number(pr.stock)===0?T.red:Number(pr.stock)<=5?T.amber:T.green }}>
                  Tồn: {pr.stock}
                </div>
              )}

            </div>
          ))}
          {products.length===0 && <div style={{ padding:'24px', textAlign:'center', color:T.light, fontSize:13 }}>Chưa có sản phẩm nào. Thêm ở trên.</div>}
        </div>
      </Modal>
    </div>
  )
}

// ── STICKY NOTE ──────────────────────────────────────
function StickyNote({ user }: any) {
  const key      = `la_note_${user.id}`
  const settKey  = `la_note_popup_${user.id}`
  const [text,    setText]    = React.useState(() => { try { return localStorage.getItem(key)||'' } catch { return '' } })
  const [open,    setOpen]    = React.useState(false)
  const [saving,  setSaving]  = React.useState(false)
  const [popupOn, setPopupOn] = React.useState(() => { try { return localStorage.getItem(settKey) !== 'off' } catch { return true } })
  const ref = React.useRef<any>(null)

  useEffect(() => {
    // Load note từ Supabase khi mount
    db.from('user_notes').select('content,popup_enabled').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) {
          setText(data.content || '')
          const pop = data.popup_enabled !== false
          setPopupOn(pop)
          if (pop && data.content?.trim()) setOpen(true)
        }
      })
  }, [user.id])

  const save = async (newText: string, newPopup?: boolean) => {
    const popup = newPopup ?? popupOn
    setSaving(true)
    try { localStorage.setItem(key, newText) } catch {}
    try { localStorage.setItem(settKey, popup ? 'on' : 'off') } catch {}
    await db.from('user_notes').upsert({ user_id:user.id, content:newText, popup_enabled:popup, updated_at:new Date().toISOString() })
    setSaving(false)
  }

  const togglePopup = async () => {
    const next = !popupOn
    setPopupOn(next)
    await save(text, next)
  }

  const mobile_ = window.innerWidth < 768

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        style={{ position:'fixed', bottom:mobile_?140:20, right:mobile_?12:20, zIndex:998,
          width:40, height:40, borderRadius:'50%', background:T.gold, border:'none',
          boxShadow:'0 4px 12px rgba(196,151,58,0.4)', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
        📝
      </button>
    )
  }
  return (
    <div style={{ position:'fixed', bottom:mobile_?140:20, right:mobile_?8:20, zIndex:999,
      width: mobile_?'calc(100vw - 16px)':340, background:T.card,
      border:`2px solid ${T.gold}`, borderRadius:16,
      boxShadow:'0 8px 32px rgba(0,0,0,0.18)', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'10px 14px', borderBottom:`1px solid ${T.border}`,
        background:T.goldBg, borderRadius:'14px 14px 0 0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:16 }}>📝</span>
          <span style={{ fontSize:13, fontWeight:700, color:T.goldText }}>Ghi chú của tôi</span>
          {saving && <span style={{ fontSize:10, color:T.light }}>Đang lưu...</span>}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {/* Toggle popup */}
          <button onClick={togglePopup}
            style={{ fontSize:10, padding:'2px 8px', borderRadius:20, border:`1px solid ${T.goldBorder}`,
              background:popupOn?T.gold:'transparent', color:popupOn?'#fff':T.goldText,
              cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
            {popupOn ? '🔔 Tự bật' : '🔕 Tắt'}
          </button>
          <button onClick={() => setOpen(false)}
            style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:T.light, padding:0 }}>✕</button>
        </div>
      </div>
      {/* Textarea */}
      <textarea ref={ref} value={text}
        onChange={e => { setText(e.target.value) }}
        onBlur={e => save(e.target.value)}
        placeholder="Ghi chú nhanh cho bản thân... (tự lưu)"
        style={{ flex:1, minHeight:160, padding:'12px 14px', border:'none', outline:'none',
          fontSize:13, fontFamily:'inherit', color:T.dark, background:'#fff',
          resize:'vertical', lineHeight:1.6 }}/>
      <div style={{ padding:'8px 14px', borderTop:`1px solid ${T.border}`,
        display:'flex', justifyContent:'space-between', alignItems:'center',
        background:T.bg, borderRadius:'0 0 14px 14px' }}>
        <span style={{ fontSize:10, color:T.light }}>{text.length} ký tự</span>
        <button onClick={() => { if(confirm('Xóa hết ghi chú?')) { setText(''); save('') } }}
          style={{ fontSize:11, color:T.red, background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
          🗑️ Xóa hết
        </button>
      </div>
    </div>
  )
}

// ── RETURN SALE FORM (sub-component để tránh hooks violation) ────
function ReturnSaleForm({ item, allUsers, saleUsers, onSave, onClose }: any) {
  const [ef, setEf] = useState({
    customer_name:       item.customer_name       || '',
    original_order_code: item.original_order_code || '',
    sale_id:             item.sale_id             || '',
    violator_id:         item.violator_id         || '',
    reason:              item.reason              || '',
    sale_note:           item.sale_note           || '',
  })
  const [userSearch, setUserSearch] = useState('')
  const userResults = allUsers.filter((u: any) => {
    const q = userSearch.toLowerCase()
    return !q || u.name.toLowerCase().includes(q) || (u.ini||'').toLowerCase().includes(q)
  }).slice(0,8)

  // Chỉ lấy nhân viên phòng sale
  const saleOnlyUsers = allUsers.filter((u: any) => u.dept_id === 'sale')
  // Nhân viên vi phạm: kho + sale
  const violatorUsers = allUsers.filter((u: any) => u.dept_id === 'kho' || u.dept_id === 'sale')
  const violatorResults = violatorUsers.filter((u: any) => {
    const q = userSearch.toLowerCase()
    return !q || u.name.toLowerCase().includes(q) || (u.ini||'').toLowerCase().includes(q)
  }).slice(0,8)

  return (
    <div>
      <div style={{ padding:'8px 12px', background:T.goldBg, borderRadius:8, marginBottom:14, fontSize:12, color:T.goldText }}>
        📦 {item.product_name} · {item.quantity} cái · {item.condition}
        {item.ship_fee>0 && ` · Ship: ${item.ship_fee.toLocaleString()}đ`}
      </div>
      <Inp label="Tên khách hàng" value={ef.customer_name}
        onChange={(v) => setEf(f => ({...f,customer_name:v}))} placeholder="Tên KH..."/>
      <Inp label="Mã đơn gốc bị sai" value={ef.original_order_code}
        onChange={(v) => setEf(f => ({...f,original_order_code:v}))} placeholder="VD: DH000842"/>
      <Sel label="Sale phụ trách" value={ef.sale_id}
        onChange={(v) => setEf(f => ({...f,sale_id:v}))}
        options={[{value:'',label:'— Chọn sale —'},...saleOnlyUsers.map((u: any) => ({value:u.id,label:u.name}))]}/>
      <div style={{ marginBottom:13 }}>
        <div style={{ fontSize:12, fontWeight:500, color:T.med, marginBottom:5 }}>Nhân viên vi phạm (Kho/Sale)</div>
        <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Tìm tên NV..."
          style={{ width:'100%', padding:'8px 11px', border:`1px solid ${T.border}`, borderRadius:8,
            fontSize:13, fontFamily:'inherit', color:T.dark, background:'#fff', boxSizing:'border-box' as any, outline:'none', marginBottom:6 }}/>
        {userSearch && (
          <div style={{ border:`1px solid ${T.border}`, borderRadius:8, overflow:'hidden', maxHeight:160, overflowY:'auto' }}>
            {violatorResults.map((u: any) => (
              <div key={u.id} onClick={() => { setEf(f => ({...f,violator_id:u.id})); setUserSearch(u.name) }}
                style={{ padding:'8px 12px', cursor:'pointer', fontSize:13, borderBottom:`1px solid ${T.border}`,
                  background:ef.violator_id===u.id?T.goldBg:'#fff',
                  color:ef.violator_id===u.id?T.goldText:T.dark }}>
                {u.name} <span style={{ fontSize:11, color:T.light }}>· {u.dept_name||u.dept_id}</span>
              </div>
            ))}
          </div>
        )}
        {ef.violator_id && !userSearch && (
          <div style={{ fontSize:12, color:T.red }}>
            ⚠️ {allUsers.find((u: any) => u.id===ef.violator_id)?.name}
            <button onClick={() => setEf(f => ({...f,violator_id:''}))}
              style={{ marginLeft:8, fontSize:11, color:T.light, background:'none', border:'none', cursor:'pointer' }}>✕</button>
          </div>
        )}
      </div>
      <Inp label="Lý do hoàn" value={ef.reason}
        onChange={(v) => setEf(f => ({...f,reason:v}))} placeholder="Lý do..."/>
      <Inp label="Ghi chú sale" value={ef.sale_note}
        onChange={(v) => setEf(f => ({...f,sale_note:v}))} placeholder="Ghi chú thêm..."/>

      <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
        <GoldBtn outline small onClick={onClose}>Hủy</GoldBtn>
        <GoldBtn small onClick={() => onSave(ef)}>Lưu</GoldBtn>
      </div>
    </div>
  )
}

// ── RETURN ITEMS (Báo cáo hàng hoàn) ─────────────────
function ReturnItems({ user, allUsers, products, mobile }: any) {
  const [items,       setItems]     = React.useState<any[]>([])
  const [showAdd,     setShowAdd]   = React.useState(false)
  const [showEdit,    setShowEdit]  = React.useState<any>(null)
  const [expandedSlip, setExpandedSlip] = React.useState<string|null>(null)
  const [tab,         setTab]       = React.useState<'list'|'stats'>('list')
  const [monthFilter, setMonthFilter] = React.useState(() => {
    const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`
  })
  const [searchQ, setSearchQ] = React.useState('')
  const p = mobile ? '16px' : '24px'
  const perm  = getPerm(user)
  const isKho  = user.dept_id === 'kho'
  const isSale = user.dept_id === 'sale'
  const canAdd  = isKho || perm.viewAllDashboard
  const canKiot = perm.viewAllDashboard || perm.enterKiot

  const norm = (s: string) => (s||'')    .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d')

  useEffect(() => {
    db.from('return_items').select('*').order('date', { ascending:true })
      .then(({ data }) => setItems(data||[]))
  }, [])

  // ── Group items by slip_id ──────────────────────
  const [fy, fm] = monthFilter.split('-').map(Number)
  const filteredItems = items.filter((r: any) => {
    if (!r.date) return true
    const d = new Date(r.date)
    return d.getFullYear()===fy && d.getMonth()+1===fm
  })

  // Group by slip_id (fallback: each item is its own slip)
  const slipMap = new Map<string, any[]>()
  filteredItems.forEach((r: any) => {
    const sid = r.slip_id || r.id
    if (!slipMap.has(sid)) slipMap.set(sid, [])
    slipMap.get(sid)!.push(r)
  })
  // Convert to slip array, sorted by date asc
  const slips = Array.from(slipMap.entries()).map(([sid, rows]) => ({
    slip_id: sid,
    date:      rows[0].date,
    return_order_code: rows[0].return_order_code,
    customer_name:     rows[0].customer_name,
    original_order_code: rows[0].original_order_code,
    sale_id:     rows[0].sale_id,
    violator_id: rows[0].violator_id,
    reason:      rows[0].reason,
    sale_note:   rows[0].sale_note,
    created_by:  rows[0].created_by,
    entered_kiot:    rows.every((r: any) => r.entered_kiot),
    entered_kiot_by: rows[0].entered_kiot_by,
    entered_kiot_at: rows[0].entered_kiot_at,
    total_qty:   rows.reduce((s: number, r: any) => s+(r.quantity||0), 0),
    total_ship:  Number(slipForm.ship_fee)||0,
    lines: rows,
  })).filter((slip: any) => {
    if (!searchQ.trim()) return true
    const q = norm(searchQ)
    return q.split(/\s+/).every((t: string) =>
      norm([slip.customer_name,slip.return_order_code,slip.reason,
        ...slip.lines.map((r: any) => r.product_name)].join(' ')).includes(t)
    )
  }).sort((a: any, b: any) => (a.date||'')    .localeCompare(b.date||'')); // cũ → mới

  // ── Stats (based on raw items) ──────────────────
  const CONDITIONS = ['Bình thường', 'Móp', 'Rách', 'Hỏng', 'Khác']
  const saleUsers = allUsers.filter((u: any) => u.dept_id === 'sale')
  const stats = {
    totalSlips: slips.length,
    totalItems: filteredItems.length,
    totalQty:   filteredItems.reduce((s: number, r: any) => s+(r.quantity||0), 0),
    totalShip:  filteredItems.reduce((s: number, r: any) => s+(r.ship_fee||0), 0),
    byCondition: CONDITIONS.map(c => ({
      label:c, count:filteredItems.filter((r: any) => r.condition===c).length
    })).filter(x=>x.count>0),
    bySale: allUsers.filter((u: any) =>
      filteredItems.some((r: any) => r.sale_id===u.id || r.violator_id===u.id)
    ).map((u: any) => ({
      id:u.id, name:u.name,
      count:      filteredItems.filter((r: any) => r.sale_id===u.id).length,
      violations: filteredItems.filter((r: any) => r.violator_id===u.id).length,
      ship:       filteredItems.filter((r: any) => r.sale_id===u.id)
                    .reduce((s: number, r: any) => s+(r.ship_fee||0), 0),
      byCondition: CONDITIONS.map(c => ({
        label:c, count:filteredItems.filter((r: any) => r.sale_id===u.id&&r.condition===c).length
      })).filter(x=>x.count>0),
    })).sort((a: any, b: any) => b.count-a.count),
    byViolator: allUsers.filter((u: any) =>
      filteredItems.some((r: any) => r.violator_id===u.id)
    ).map((u: any) => ({
      id:u.id, name:u.name,
      count: filteredItems.filter((r: any) => r.violator_id===u.id).length,
      ship:  filteredItems.filter((r: any) => r.violator_id===u.id)
               .reduce((s: number, r: any) => s+(r.ship_fee||0), 0),
    })).sort((a: any, b: any) => b.ship-a.ship),
  }

  // ── Multi-product add form ───────────────────────
  const emptyLine = () => ({ _id:'line_'+Date.now()+'_'+Math.random().toString(36).slice(2,5),
    product_name:'', quantity:1, condition:'Bình thường', ship_fee:0, _search:'' })
  const [slipForm, setSlipForm] = React.useState<any>({
    date: new Date().toISOString().split('T')[0], return_order_code:'', ship_fee:'0'
  })
  const [lines, setLines] = React.useState<any[]>([emptyLine()])
  const [searchStates, setSearchStates] = React.useState<Record<string,any[]>>({})

  const openAdd = () => {
    setSlipForm({ date: new Date().toISOString().split('T')[0], return_order_code:'', ship_fee:'0' })
    setLines([emptyLine()])
    setSearchStates({})
    setShowAdd(true)
  }

  const updateLine = (lid: string, field: string, val: any) =>
    setLines(prev => prev.map(l => l._id===lid ? {...l,[field]:val} : l))

  const searchProducts = (lid: string, q: string) => {
    updateLine(lid, '_search', q)
    updateLine(lid, 'product_name', q)
    if (!q.trim() || !products) { setSearchStates(s => ({...s,[lid]:[]})); return }
    const n = (s: string) => (s||'').toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d')
    const results = products.filter((p: any) =>
      n(q).split(/\s+/).every((t: string) => n((p.name||'')+' '+(p.code||'')).includes(t))
    ).slice(0,7)
    setSearchStates(s => ({...s,[lid]:results}))
  }

  const submitSlip = async () => {
    const validLines = lines.filter(l => l.product_name.trim())
    if (!slipForm.date || validLines.length===0) return
    const slip_id = 'slip_'+Date.now()
    const now = new Date().toISOString()
    const newItems = validLines.map((l: any, i: number) => ({
      id: 'ret'+Date.now()+'_'+i,
      slip_id, date: slipForm.date,
      return_order_code: slipForm.return_order_code,
      product_name: l.product_name, quantity: Number(l.quantity)||1,
      condition: l.condition, ship_fee: Number(l.ship_fee)||0,
      entered_kiot:false, entered_kiot_by:'', entered_kiot_at:'',
      customer_name:'', original_order_code:'', sale_id:'',
      violator_id:'', reason:'', sale_note:'',
      created_by:user.id, created_at:now,
    }))
    setItems(prev => [...prev, ...newItems])
    const { error } = await db.from('return_items').insert(newItems)
    if (error) {
      setItems(prev => prev.filter(i => !newItems.find((n: any) => n.id===i.id)))
      alert('❌ '+error.message); return
    }
    // Notify sale dept
    await db.from('announcements').insert({
      id:'ann_ret_'+Date.now(),
      title:'🔄 Phiếu hoàn mới cần điền thông tin (' + slipForm.date + ')',
      content:'Kho vừa tạo phiếu hoàn ' + (slipForm.return_order_code||'') + ' với ' + validLines.length + ' sản phẩm. Sale cần vào điền thông tin KH.',
      dept_id:'sale', created_by:user.id, created_at:now, priority:'normal'
    })
    setShowAdd(false)
  }

  // ── Sale fill / update all lines in a slip ───────
  const updateSlipSale = async (slip_id: string, saleData: any) => {
    const slipLineIds = items.filter((i: any) => (i.slip_id||i.id)===slip_id).map((i: any) => i.id)
    setItems(prev => prev.map(i => slipLineIds.includes(i.id) ? {...i,...saleData} : i))
    for (const id of slipLineIds) {
      await db.from('return_items').update(saleData).eq('id', id)
    }
    setShowEdit(null)
  }

  const delSlip = async (slip_id: string) => {
    if (!confirm('Xóa toàn bộ phiếu hoàn này?')) return
    const ids = items.filter((i: any) => (i.slip_id||i.id)===slip_id).map((i: any) => i.id)
    setItems(prev => prev.filter(i => !ids.includes(i.id)))
    for (const id of ids) await db.from('return_items').delete().eq('id', id)
  }

  const toggleKiot = async (slip: any) => {
    const newVal = !slip.entered_kiot
    const now = newVal ? new Date().toISOString() : ''
    const upd = { entered_kiot:newVal, entered_kiot_by:newVal?user.id:'', entered_kiot_at:now }
    const ids = slip.lines.map((l: any) => l.id)
    setItems(prev => prev.map(i => ids.includes(i.id) ? {...i,...upd} : i))
    for (const id of ids) await db.from('return_items').update(upd).eq('id', id)
  }

  return (
    <div style={{ padding:`0 ${p} ${mobile?'80px':p}` }}>
      <Topbar mobile={mobile} title="🔄 Báo cáo hàng hoàn"
        subtitle={`Tháng ${fm}/${fy} — ${slips.length} phiếu · ${filteredItems.length} sản phẩm`}
        action={
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
              style={{ padding:'6px 10px', border:`1px solid ${T.border}`, borderRadius:8,
                fontSize:12, fontFamily:'inherit', color:T.dark, background:T.bg, cursor:'pointer' }}/>
            {canAdd && <GoldBtn small onClick={openAdd}>+ Nhập phiếu hoàn</GoldBtn>}
          </div>
        }/>

      {/* Tabs + Search */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        {([['list','📋 Danh sách'],['stats','📊 Thống kê']] as [string,string][]).map(([id,label]) => (
          <button key={id} onClick={() => setTab(id as any)}
            style={{ padding:'6px 14px', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontSize:12,
              border:`1.5px solid ${tab===id?T.gold:T.border}`,
              background:tab===id?T.goldBg:'transparent',
              color:tab===id?T.goldText:T.med, fontWeight:tab===id?700:400 }}>{label}</button>
        ))}
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
          placeholder="🔍 Tìm sản phẩm, KH, sale..."
          style={{ flex:1, minWidth:160, padding:'6px 10px', border:`1px solid ${T.border}`, borderRadius:8,
            fontSize:12, fontFamily:'inherit', color:T.dark, background:T.bg, outline:'none' }}/>
      </div>

      {tab==='stats' ? (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:mobile?'1fr':'1fr 1fr', gap:14 }}>
            <Card>
              <div style={{ fontSize:13, fontWeight:700, color:T.dark, marginBottom:12 }}>📊 Tổng quan tháng {fm}/{fy}</div>
              {[
                ['📋 Tổng phiếu hoàn', stats.totalSlips, T.dark],
                ['📦 Tổng sản phẩm', stats.totalItems, T.blue],
                ['🔢 Tổng số lượng', stats.totalQty, T.blue],
                ['💸 Tổng phí ship', stats.totalShip.toLocaleString('vi-VN')+'đ', T.amber],
              ].map(([label,val,color]) => (
                <div key={label as string} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0',
                  borderBottom:`1px solid ${T.border}`, fontSize:13 }}>
                  <span style={{ color:T.med }}>{label}</span>
                  <span style={{ fontWeight:700, color:color as string }}>{val}</span>
                </div>
              ))}
            </Card>
            <Card>
              <div style={{ fontSize:13, fontWeight:700, color:T.dark, marginBottom:12 }}>🏷️ Theo tình trạng hàng</div>
              {stats.byCondition.length===0
                ? <div style={{ color:T.light, fontSize:12 }}>Chưa có dữ liệu</div>
                : stats.byCondition.map((c: any) => (
                  <div key={c.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'8px 0', borderBottom:`1px solid ${T.border}`, fontSize:12 }}>
                    <span style={{ color:T.med }}>{c.label}</span>
                    <span style={{ fontWeight:700, color:T.dark, background:T.bg,
                      padding:'2px 10px', borderRadius:20 }}>{c.count} SP</span>
                  </div>
                ))
              }
            </Card>
          </div>
          <Card style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', background:T.goldBg, borderBottom:`1px solid ${T.goldBorder}`,
              fontSize:13, fontWeight:700, color:T.goldText }}>👤 Thống kê theo Sale phụ trách</div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead>
                  <tr style={{ background:T.bg }}>
                    {['Sale','Số đơn','Tình trạng','Ship phải trả','Vi phạm'].map(h => (
                      <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontWeight:700,
                        color:T.light, fontSize:10, textTransform:'uppercase', letterSpacing:.5,
                        borderBottom:`1px solid ${T.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.bySale.length===0
                    ? <tr><td colSpan={5} style={{ padding:'20px', textAlign:'center', color:T.light }}>Chưa có dữ liệu</td></tr>
                    : stats.bySale.map((s: any, i: number) => (
                      <tr key={s.id} style={{ background:i%2===0?'#fff':T.bg, borderBottom:`1px solid ${T.border}` }}>
                        <td style={{ padding:'9px 12px', fontWeight:600, color:T.dark }}>{s.name}</td>
                        <td style={{ padding:'9px 12px', color:T.blue, fontWeight:700 }}>{s.count}</td>
                        <td style={{ padding:'9px 12px' }}>
                          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                            {s.byCondition.map((c: any) => (
                              <span key={c.label} style={{ fontSize:10, padding:'1px 7px', borderRadius:20,
                                background:c.label==='Bình thường'?T.greenBg:c.label==='Hỏng'?T.redBg:T.amberBg,
                                color:c.label==='Bình thường'?T.green:c.label==='Hỏng'?T.red:T.amber }}>
                                {c.label}: {c.count}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding:'9px 12px', color:s.ship>0?T.amber:T.light, fontWeight:s.ship>0?700:400 }}>
                          {s.ship>0?s.ship.toLocaleString('vi-VN')+'đ':'—'}
                        </td>
                        <td style={{ padding:'9px 12px', color:s.violations>0?T.red:T.light, fontWeight:s.violations>0?700:400 }}>
                          {s.violations>0?`⚠️ ${s.violations}`:'—'}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </Card>
          <Card style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', background:T.redBg, borderBottom:`1px solid #fca5a5`,
              fontSize:13, fontWeight:700, color:T.red }}>💸 Phí ship theo nhân viên vi phạm</div>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ background:T.bg }}>
                  {['Nhân viên vi phạm','Số SP','Tổng phí ship'].map(h => (
                    <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontWeight:700,
                      color:T.light, fontSize:10, textTransform:'uppercase', letterSpacing:.5,
                      borderBottom:`1px solid ${T.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.byViolator.length===0
                  ? <tr><td colSpan={3} style={{ padding:'20px', textAlign:'center', color:T.light }}>Không có vi phạm</td></tr>
                  : stats.byViolator.map((v: any, i: number) => (
                    <tr key={v.id} style={{ background:i%2===0?'#fff':T.bg, borderBottom:`1px solid ${T.border}` }}>
                      <td style={{ padding:'9px 12px', fontWeight:600, color:T.dark }}>{v.name}</td>
                      <td style={{ padding:'9px 12px', color:T.red, fontWeight:700 }}>{v.count}</td>
                      <td style={{ padding:'9px 12px', color:T.amber, fontWeight:700 }}>
                        {v.ship>0?v.ship.toLocaleString('vi-VN')+'đ':'—'}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </Card>
        </div>
      ) : (
        /* ── LIST — desktop table with fixed headers ── */
        <div style={{ background:T.card, borderRadius:12, border:`1px solid ${T.border}`,
          boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
          {/* ── Sticky table header ── */}
          {!mobile && (
            <div style={{ display:'grid',
              gridTemplateColumns:'44px 72px 90px 1fr 48px 80px 95px 95px 150px 110px',
              padding:'8px 12px', background:T.bg, borderBottom:`2px solid ${T.border}`,
              fontSize:10, fontWeight:700, color:T.light, textTransform:'uppercase',
              letterSpacing:.6, gap:8, alignItems:'center', position:'sticky', top:0, zIndex:2 }}>
              <span style={{ textAlign:'center', color:T.green }}>KV</span>
              <span>Ngày</span>
              <span>Mã hoàn</span>
              <span>Sản phẩm</span>
              <span style={{ textAlign:'center' }}>SL</span>
              <span style={{ textAlign:'right' }}>Ship</span>
              <span>Sale PT</span>
              <span>Vi phạm</span>
              <span>Lý do hoàn</span>
              <span style={{ textAlign:'right' }}>Thao tác</span>
            </div>
          )}

          {slips.length===0 ? (
            <div style={{ padding:'40px', textAlign:'center', color:T.light }}>
              <div style={{ fontSize:28, marginBottom:8 }}>🔄</div>
              <div style={{ fontSize:13 }}>Không có phiếu hoàn nào trong tháng này</div>
            </div>
          ) : slips.map((slip: any, si: number) => {
            const saleUser     = allUsers.find((u: any) => u.id===slip.sale_id)
            const violatorUser = allUsers.find((u: any) => u.id===slip.violator_id)
            const canEdit      = perm.viewAllDashboard || (isKho && slip.created_by===user.id)
            const canFillSale  = isSale || perm.viewAllDashboard
            const hasSaleInfo  = slip.customer_name || slip.original_order_code
            const isOpen       = expandedSlip === slip.slip_id
            const kvUser       = allUsers.find((u: any) => u.id===slip.entered_kiot_by)
            const rowBg        = si%2===0 ? '#fff' : T.rowAlt

            return (
              <div key={slip.slip_id}
                style={{ borderBottom:`1px solid ${T.border}`,
                  background: isOpen ? T.goldBg : rowBg }}>

                {/* ── Main table row ── */}
                {mobile ? (
                  /* Mobile: card style */
                  <div style={{ padding:'10px 14px', cursor:'pointer' }}
                    onClick={() => setExpandedSlip(isOpen?null:slip.slip_id)}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div onClick={e => e.stopPropagation()}>
                        {slip.entered_kiot ? (
                          <button onClick={() => toggleKiot(slip)}
                            style={{ width:28,height:28,borderRadius:'50%',border:'none',
                              background:T.green,color:'#fff',cursor:canKiot?'pointer':'default',fontSize:14,
                              display:'flex',alignItems:'center',justifyContent:'center' }}>✓</button>
                        ) : (
                          <button onClick={() => canKiot&&toggleKiot(slip)}
                            style={{ width:28,height:28,borderRadius:'50%',
                              border:`2px dashed ${T.border}`,background:'transparent',
                              cursor:canKiot?'pointer':'default',color:T.light,fontSize:12,
                              display:'flex',alignItems:'center',justifyContent:'center' }}>○</button>
                        )}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12,fontWeight:700,color:T.dark }}>
                          {slip.date?new Date(slip.date).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit'}):'—'}
                          {slip.return_order_code&&<span style={{ fontSize:10,color:T.gold,marginLeft:8 }}>#{slip.return_order_code}</span>}
                          <span style={{ fontSize:11,color:T.blue,marginLeft:8 }}>SL: {slip.total_qty}</span>
                        </div>
                        <div style={{ fontSize:11,color:T.med,marginTop:2 }}>
                          {slip.lines.slice(0,1).map((l: any) => l.product_name).join('')}
                          {slip.lines.length>1&&<span style={{ color:T.light }}> +{slip.lines.length-1} SP</span>}
                        </div>
                      </div>
                      <span style={{ color:T.light }}>{isOpen?'▲':'▼'}</span>
                    </div>
                  </div>
                ) : (
                  /* Desktop: full table row */
                  <div style={{ display:'grid',
                    gridTemplateColumns:'44px 72px 90px 1fr 48px 80px 95px 95px 150px 110px',
                    padding:'9px 12px', gap:8, alignItems:'start',
                    cursor:'pointer' }}
                    onClick={() => setExpandedSlip(isOpen?null:slip.slip_id)}>

                    {/* KV */}
                    <div style={{ display:'flex', justifyContent:'center' }}
                      onClick={e => e.stopPropagation()}>
                      {slip.entered_kiot ? (
                        <button
                          title={`${kvUser?.name||'?'} · ${slip.entered_kiot_at?new Date(slip.entered_kiot_at).toLocaleString('vi-VN'):''}`}
                          onClick={() => canKiot&&toggleKiot(slip)}
                          style={{ width:26,height:26,borderRadius:'50%',border:'none',
                            background:T.green,color:'#fff',cursor:canKiot?'pointer':'default',
                            fontSize:13,display:'flex',alignItems:'center',justifyContent:'center' }}>✓</button>
                      ) : (
                        <button onClick={() => canKiot&&toggleKiot(slip)}
                          style={{ width:26,height:26,borderRadius:'50%',
                            border:`2px dashed ${T.border}`,background:'transparent',
                            cursor:canKiot?'pointer':'default',color:T.light,
                            fontSize:12,display:'flex',alignItems:'center',justifyContent:'center' }}>○</button>
                      )}
                    </div>

                    {/* Ngày */}
                    <span style={{ fontSize:12,fontWeight:600,color:T.dark }}>
                      {slip.date?new Date(slip.date).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit'}):'—'}
                    </span>

                    {/* Mã hoàn */}
                    <span style={{ fontSize:11,color:T.gold,
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                      {slip.return_order_code?'#'+slip.return_order_code:'—'}
                    </span>

                    {/* Sản phẩm */}
                    <div style={{ lineHeight:1.4 }}>
                      {slip.lines.slice(0,2).map((l: any, li: number) => (
                        <div key={li} style={{ fontSize:11, color:T.dark, fontWeight:li===0?500:400 }}>
                          {l.product_name}
                        </div>
                      ))}
                      {slip.lines.length>2 && (
                        <span style={{ fontSize:10, color:T.light }}>+{slip.lines.length-2} SP nữa</span>
                      )}
                    </div>

                    {/* SL */}
                    <div style={{ textAlign:'center' }}>
                      <span style={{ fontSize:12,fontWeight:700,color:T.blue }}>{slip.total_qty}</span>
                      {slip.lines.length>1&&<div style={{ fontSize:9,color:T.light }}>{slip.lines.length} SP</div>}
                    </div>

                    {/* Ship */}
                    <span style={{ fontSize:11,textAlign:'right',
                      color:slip.total_ship>0?T.amber:T.light,fontWeight:slip.total_ship>0?700:400 }}>
                      {slip.total_ship>0?slip.total_ship.toLocaleString()+'đ':'—'}
                    </span>

                    {/* Sale PT */}
                    <span style={{ fontSize:11,color:saleUser?T.gold:T.light,
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                      {saleUser?.name||'—'}
                    </span>

                    {/* Vi phạm */}
                    <span style={{ fontSize:11,color:violatorUser?T.red:T.light,
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                      {violatorUser?'⚠️ '+violatorUser.name:'—'}
                    </span>

                    {/* Lý do hoàn */}
                    <span style={{ fontSize:11,color:slip.reason?T.dark:T.light,
                      lineHeight:1.4 }}>
                      {slip.reason||'—'}
                    </span>

                    {/* Thao tác */}
                    <div style={{ display:'flex',gap:5,justifyContent:'flex-end',alignItems:'center' }}
                      onClick={e => e.stopPropagation()}>
                      {!hasSaleInfo && canFillSale && (
                        <button onClick={() => setShowEdit(slip)}
                          style={{ padding:'3px 9px',borderRadius:20,border:`1.5px solid ${T.gold}`,
                            background:T.goldBg,cursor:'pointer',fontSize:10,fontFamily:'inherit',
                            color:T.goldText,fontWeight:700,whiteSpace:'nowrap' }}>Sale điền</button>
                      )}
                      {hasSaleInfo && (canFillSale||canEdit) && (
                        <button onClick={() => setShowEdit(slip)}
                          style={{ padding:'3px 9px',borderRadius:20,border:`1px solid ${T.border}`,
                            background:'transparent',cursor:'pointer',fontSize:10,fontFamily:'inherit',color:T.med }}>Sửa</button>
                      )}
                      {canEdit && (
                        <button onClick={() => delSlip(slip.slip_id)}
                          style={{ padding:'3px 7px',borderRadius:20,border:`1px solid ${T.redBg}`,
                            background:T.redBg,cursor:'pointer',fontSize:10,fontFamily:'inherit',color:T.red }}>✕</button>
                      )}
                      <span style={{ fontSize:10,color:T.light }}>{isOpen?'▲':'▼'}</span>
                    </div>
                  </div>
                )}

                {/* ── Expanded: product lines sub-table ── */}
                {isOpen && (
                  <div style={{ borderTop:`1px dashed ${T.border}`,
                    background:'rgba(196,151,58,0.04)', padding:'0 0 8px 0' }}>
                    {/* Sub-header */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 50px 110px 70px',
                      padding:'6px 12px 6px 56px', fontSize:9, fontWeight:700, color:T.light,
                      textTransform:'uppercase', letterSpacing:.5, borderBottom:`1px solid ${T.border}` }}>
                      <span>Tên sản phẩm</span>
                      <span style={{ textAlign:'center' }}>SL</span>
                      <span>Tình trạng</span>
                      <span style={{ textAlign:'right' }}>Ship</span>
                    </div>
                    {slip.lines.map((line: any, li: number) => (
                      <div key={line.id} style={{ display:'grid',
                        gridTemplateColumns:'1fr 50px 110px 70px',
                        padding:'7px 12px 7px 56px', fontSize:12, alignItems:'start', gap:8,
                        borderBottom:li<slip.lines.length-1?`1px solid ${T.border}`:'none' }}>
                        {/* Wrap text for long product names */}
                        <span style={{ color:T.dark, fontWeight:500, lineHeight:1.4 }}>
                          {line.product_name}
                        </span>
                        <span style={{ textAlign:'center',color:T.dark,fontWeight:700 }}>{line.quantity}</span>
                        <span style={{ color:line.condition==='Bình thường'?T.green:line.condition==='Hỏng'?T.red:T.amber }}>
                          {line.condition}
                        </span>
                        <span style={{ textAlign:'right',color:line.ship_fee>0?T.amber:T.light }}>
                          {line.ship_fee>0?line.ship_fee.toLocaleString()+'đ':'—'}
                        </span>
                      </div>
                    ))}
                    {/* KH + Sale note */}
                    {(slip.customer_name||slip.original_order_code||slip.sale_note) && (
                      <div style={{ padding:'7px 12px 4px 56px', display:'flex', gap:16, flexWrap:'wrap',
                        borderTop:`1px solid ${T.border}`, marginTop:2 }}>
                        {slip.customer_name && <span style={{ fontSize:11,color:T.blue }}>👤 {slip.customer_name}</span>}
                        {slip.original_order_code && <span style={{ fontSize:11,color:T.light }}>#ĐH gốc: {slip.original_order_code}</span>}
                        {slip.sale_note && <span style={{ fontSize:11,color:T.med,fontStyle:'italic' }}>💬 {slip.sale_note}</span>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal nhập phiếu hoàn mới (multi-product) ── */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="📦 Nhập phiếu hàng hoàn" wide>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
          <Inp label="Ngày hoàn *" type="date" value={slipForm.date}
            onChange={(v) => setSlipForm((f: any) => ({...f,date:v}))}/>
          <Inp label="Mã đơn hoàn" value={slipForm.return_order_code}
            onChange={(v) => setSlipForm((f: any) => ({...f,return_order_code:v}))} placeholder="VD: HV001234"/>
        </div>

        {/* Product lines */}
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:12, fontWeight:600, color:T.dark, marginBottom:8 }}>Danh sách sản phẩm hoàn</div>
          {lines.map((line: any, li: number) => (
            <div key={line._id} style={{ background:T.bg, borderRadius:10, padding:'10px 12px',
              marginBottom:8, border:`1px solid ${T.border}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <span style={{ fontSize:12, fontWeight:700, color:T.light }}>#{li+1}</span>
                <div style={{ flex:1 }}>
                  <input value={line._search} onChange={e => searchProducts(line._id, e.target.value)}
                    placeholder="Tìm tên hoặc mã sản phẩm..."
                    style={{ width:'100%', padding:'7px 10px', border:`1px solid ${T.border}`, borderRadius:8,
                      fontSize:12, fontFamily:'inherit', color:T.dark, background:'#fff',
                      boxSizing:'border-box' as any, outline:'none' }}/>
                  {(searchStates[line._id]||[]).length>0 && (
                    <div style={{ border:`1px solid ${T.border}`, borderRadius:8, overflow:'hidden',
                      maxHeight:160, overflowY:'auto', marginTop:3, background:'#fff' }}>
                      {(searchStates[line._id]||[]).map((p: any) => (
                        <div key={p.id}
                          onClick={() => {
                            updateLine(line._id, 'product_name', p.name)
                            updateLine(line._id, '_search', p.name)
                            setSearchStates(s => ({...s,[line._id]:[]}))
                          }}
                          style={{ padding:'7px 12px', cursor:'pointer', fontSize:12,
                            borderBottom:`1px solid ${T.border}`,
                            display:'flex', justifyContent:'space-between', alignItems:'center' }}
                          onMouseEnter={e => (e.currentTarget as any).style.background=T.goldBg}
                          onMouseLeave={e => (e.currentTarget as any).style.background='#fff'}>
                          <span>{p.name}{p.code&&<span style={{ fontSize:10, color:T.light, marginLeft:6 }}>#{p.code}</span>}</span>
                          {p.stock!=null && <span style={{ fontSize:11, fontWeight:700,
                            color:p.stock===0?T.red:p.stock<=5?T.amber:T.green }}>Tồn: {p.stock}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {lines.length>1 && (
                  <button onClick={() => setLines(prev => prev.filter(l => l._id!==line._id))}
                    style={{ padding:'4px 8px', borderRadius:6, border:`1px solid ${T.redBg}`,
                      background:T.redBg, color:T.red, cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>✕</button>
                )}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'80px 1fr', gap:8 }}>
                <Inp label="SL" type="number" value={String(line.quantity)}
                  onChange={(v) => updateLine(line._id, 'quantity', v)}/>
                <Sel label="Tình trạng" value={line.condition}
                  onChange={(v) => updateLine(line._id, 'condition', v)}
                  options={['Bình thường','Móp','Rách','Hỏng','Khác'].map(c=>({value:c,label:c}))}/>
              </div>
            </div>
          ))}
          <button onClick={() => setLines(prev => [...prev, emptyLine()])}
            style={{ width:'100%', padding:'8px', borderRadius:10,
              border:`2px dashed ${T.border}`, background:'transparent',
              cursor:'pointer', fontSize:12, fontFamily:'inherit', color:T.med }}>
            + Thêm sản phẩm
          </button>
        </div>

        {/* Ship fee — 1 lần cho cả phiếu */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 160px', gap:12, marginBottom:12 }}>
          <Inp label="Lý do hoàn" value={slipForm.reason||''}
            onChange={(v) => setSlipForm((f: any) => ({...f,reason:v}))}
            placeholder="VD: Khách đổi ý, giao sai, hỏng hàng..."/>
          <div>
            <div style={{ fontSize:12, fontWeight:500, color:T.med, marginBottom:5 }}>Phí ship (đ)</div>
            <input type="number" value={slipForm.ship_fee||'0'}
              onChange={e => setSlipForm((f: any) => ({...f,ship_fee:e.target.value}))}
              style={{ width:'100%', padding:'8px 11px', border:`1px solid ${T.border}`, borderRadius:8,
                fontSize:13, fontFamily:'inherit', color:T.dark, background:'#fff',
                boxSizing:'border-box' as any, outline:'none' }}/>
            <div style={{ fontSize:10, color:T.light, marginTop:3 }}>1 phiếu = 1 lần ship</div>
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:11, color:T.light }}>{lines.filter(l=>l.product_name).length} SP đã nhập</span>
          <div style={{ display:'flex', gap:10 }}>
            <GoldBtn outline small onClick={() => setShowAdd(false)}>Hủy</GoldBtn>
            <GoldBtn small onClick={submitSlip}
              disabled={!slipForm.date||lines.filter(l=>l.product_name.trim()).length===0}>
              Lưu phiếu
            </GoldBtn>
          </div>
        </div>
      </Modal>

      {/* Modal sale điền */}
      <Modal open={!!showEdit} onClose={() => setShowEdit(null)}
        title={showEdit?.customer_name?'Sửa thông tin sale':'💼 Sale điền thông tin'}>
        {showEdit && <ReturnSaleForm
          item={showEdit} allUsers={allUsers} saleUsers={saleUsers}
          onSave={(data: any) => updateSlipSale(showEdit.slip_id, data)}
          onClose={() => setShowEdit(null)}/>}
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
  const [form, setForm]   = useState({ name:'', dept_id:'kho', position_id:'', ini:'', pin:'1234', active:true, birthday:'' })
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
    setForm({ name:'', dept_id:'kho', position_id:'', ini:'', pin:'1234', active:true, birthday:'' })
    setShow(true)
  }
  const openEdit = (u: any) => {
    setEdit(u)
    setForm({ name:u.name, dept_id:u.dept_id, position_id:u.position_id||'', ini:u.ini, pin:u.pin, active:u.active, birthday:u.birthday||'' })
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
      await db.from('users').update({ name:form.name, dept_id:finalDeptId, position_id:form.position_id, ini:form.ini, active:form.active, role, birthday:form.birthday||'' }).eq('id', edit.id)
    } else {
      const newId = form.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s/g,'_')+'_'+Date.now().toString().slice(-4)
      const newUser = { id:newId, ...form, dept_id:finalDeptId, dept_name:deptName, position_name:posName, role, must_change_password:true }
      setAllUsers((prev: any) => [...prev, newUser])
      await db.from('users').insert({ id:newId, ...form, dept_id:finalDeptId, role, birthday:form.birthday||'', must_change_password:true })
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
                  <div style={{ display:'flex', gap:6, marginTop:3, flexWrap:'wrap' }}>
                    {!u.active && <span style={{ fontSize:10, color:T.red }}>Đã khóa</span>}
                    {u.must_change_password && <span style={{ fontSize:10, color:T.amber }}>⚠️ Chưa đổi mật khẩu</span>}
                    {getPerm(user).viewBirthday && u.birthday && (
                      <span style={{ fontSize:10, color:T.blue }}>🎂 {u.birthday}</span>
                    )}
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
            onChange={(v) => setForm(f => ({...f, name:v, ini:autoIni(v)}))} placeholder="Nguyễn Văn A"/>
          {isAdmin ? (
            <Inp label="Tên đăng nhập (ini) 🔐 Admin" value={form.ini}
              onChange={(v) => setForm(f => ({...f, ini:v.toUpperCase().slice(0,4)}))} placeholder="VA"/>
          ) : (
            <div style={{ marginBottom:13 }}>
              <div style={{ fontSize:12, fontWeight:500, color:T.med, marginBottom:5 }}>Tên đăng nhập (ini)</div>
              <div style={{ padding:'8px 11px', border:`1px solid ${T.border}`, borderRadius:8, fontSize:13, color:T.light, background:T.bg }}>{form.ini} <span style={{ fontSize:11, color:T.amber }}>(Chỉ Admin được sửa)</span></div>
            </div>
          )}
        </div>
        {/* Vị trí — chọn trước để auto-fill phòng ban */}
        <Sel label="Vị trí *" value={form.position_id} onChange={(v) => {
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
            <Sel label="Phòng ban" value={form.dept_id} onChange={(v) => setForm(f => ({...f, dept_id:v}))}
              options={departments.filter((d: any) => d.id!=='all').map((d: any) => ({value:d.id,label:d.name}))}/>
          )
        })()}
        <div style={{ padding:'10px 12px', background:T.goldBg, borderRadius:8, marginBottom:13, fontSize:12, color:T.goldText }}>
          💡 Mật khẩu mặc định khi tạo mới: <b>1234</b> — nhân viên sẽ được yêu cầu đổi khi đăng nhập lần đầu.
        </div>
        <Inp label="🎂 Ngày sinh (DD/MM/YYYY)" value={form.birthday}
          onChange={(v) => setForm(f => ({...f, birthday:v}))} placeholder="VD: 15/08/1995"/>
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

      {/* Hierarchical view — group by dept, sort by level */}
      {['all','kho','sale','vp'].map(dept => {
        const deptPos = positions.filter((p: any) => p.dept_id === dept)
        if (deptPos.length === 0) return null

        // Sort by hierarchy: no reports_to first (top), then children
        const sorted: any[] = []
        const addLevel = (parentId: string, level: number) => {
          const children = deptPos.filter((p: any) => (p.reports_to||'') === parentId)
          children.sort((a: any, b: any) => a.name.localeCompare(b.name))
          children.forEach((p: any) => { sorted.push({...p, _level:level}); addLevel(p.id, level+1) })
        }
        // Top-level: no reports_to or reports_to is outside this dept
        deptPos.filter((p: any) => !p.reports_to || !deptPos.find((x: any) => x.id===p.reports_to))
          .sort((a: any, b: any) => a.name.localeCompare(b.name))
          .forEach((p: any) => { sorted.push({...p, _level:0}); addLevel(p.id, 1) })

        return (
          <Card key={dept} style={{ padding:0, overflow:'hidden', marginBottom:14 }}>
            {/* Dept header */}
            <div style={{ padding:'10px 16px', background:DEPT_COLOR[dept]||T.gold,
              display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ color:'#fff', fontWeight:700, fontSize:13 }}>
                {dept==='all'?'🏢 Toàn công ty':dept==='kho'?'📦 Kho':dept==='sale'?'💰 Sale':'🖥️ Văn phòng'}
                <span style={{ fontSize:11, fontWeight:400, marginLeft:8, opacity:.8 }}>{deptPos.length} vị trí</span>
              </div>
            </div>
            {/* Positions rows */}
            {sorted.map((pos: any, idx: number) => {
              const activePerms = ALL_PERMS.filter(p => pos[p.key]).length
              const isAdmin = pos.perm_view_all_dashboard
              return (
                <div key={pos.id} style={{ display:'flex', alignItems:'center', gap:12,
                  padding:'10px 16px', borderBottom:idx<sorted.length-1?`1px solid ${T.border}`:'none',
                  paddingLeft: `${16 + pos._level*24}px`,
                  background:idx%2===0?'#fff':T.bg }}>
                  {/* Level indicator */}
                  {pos._level>0 && (
                    <span style={{ color:T.border, fontSize:14, marginLeft:-12, flexShrink:0 }}>└</span>
                  )}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:T.dark }}>{pos.name}</span>
                      {isAdmin && <span style={{ fontSize:10, fontWeight:700, color:'#fff', background:T.gold, padding:'1px 7px', borderRadius:20 }}>Admin</span>}
                      {activePerms>0 && !isAdmin && (
                        <span style={{ fontSize:10, color:T.green, background:T.greenBg, padding:'1px 7px', borderRadius:20, fontWeight:600 }}>
                          {activePerms} quyền
                        </span>
                      )}
                    </div>
                    <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                      {ALL_PERMS.filter(p => pos[p.key] && !pos.perm_view_all_dashboard).slice(0,4).map(p => (
                        <span key={p.key} style={{ fontSize:10, padding:'1px 6px', borderRadius:20,
                          background:T.greenBg, color:T.green }}>{p.label}</span>
                      ))}
                      {activePerms>4 && !isAdmin && (
                        <span style={{ fontSize:10, color:T.light }}>+{activePerms-4}...</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                    <button onClick={() => openEdit(pos)}
                      style={{ padding:'5px 11px', borderRadius:7, border:`1px solid ${T.border}`,
                        background:'transparent', cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.med }}>Sửa</button>
                    <button onClick={() => remove(pos.id)}
                      style={{ padding:'5px 10px', borderRadius:7, border:`1px solid ${T.redBg}`,
                        background:T.redBg, cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.red }}>✕</button>
                  </div>
                </div>
              )
            })}
          </Card>
        )
      })}

      <Modal open={show} onClose={() => setShow(false)} title={edit?'Sửa vị trí':'Thêm vị trí mới'} wide>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Inp label="Tên vị trí *" value={form.name} onChange={(v) => setForm((f: any) => ({...f, name:v}))} placeholder="VD: Kế toán, Phó kho..."/>
          <Sel label="Phòng ban" value={form.dept_id} onChange={(v) => setForm((f: any) => ({...f, dept_id:v}))}
            options={[{value:'all',label:'Tất cả'},{value:'kho',label:'Kho'},{value:'sale',label:'Sale'},{value:'vp',label:'Văn phòng'}]}/>
        </div>
        <Sel label="Báo cáo cho vị trí" value={form.reports_to} onChange={(v) => setForm((f: any) => ({...f, reports_to:v}))}
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
// ── NOTIFICATION BANNER ─────────────────────────────
function NotifBanner({ user, wrongOrders, returnSlips, setPage }: any) {
  const [dismissed, setDismissed] = useState(false)
  const perm    = getPerm(user)
  const isSale  = user.dept_id === 'sale'
  const isAdmin = perm.viewAllDashboard

  // Chỉ hiện cho sale — không hiện cho admin/giám đốc
  const pendingWO  = (isSale && !isAdmin) ? wrongOrders.filter((r: any) =>
    r.status==='pending' && (r.sale_id===user.id || !r.sale_id)
  ) : []
  const pendingRet = (isSale && !isAdmin) ? (returnSlips||[]).filter((r: any) => !r.sale_id) : []
  const totalPending = pendingWO.length + pendingRet.length

  if (dismissed || totalPending === 0) return null

  const hasWO = pendingWO.length > 0
  const hasRet = pendingRet.length > 0
  const accent = hasWO ? T.red : T.amber

  return (
    <div style={{ position:'fixed', top:16, left:'50%', transform:'translateX(-50%)',
      zIndex:9999, background:'#fff', border:`2px solid ${accent}`,
      borderRadius:14, boxShadow:`0 8px 32px rgba(0,0,0,0.14)`,
      padding:'14px 18px', maxWidth:440, width:'calc(100vw - 32px)' }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
        <span style={{ fontSize:22, flexShrink:0 }}>{hasWO?'⚠️':'🔄'}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:accent, marginBottom:8 }}>
            {totalPending} việc cần xử lý
          </div>
          {hasWO && (
            <div style={{ marginBottom:hasRet?10:0 }}>
              <div style={{ fontSize:11, fontWeight:700, color:T.red, marginBottom:4 }}>
                ⚠️ {pendingWO.length} đơn sai chờ bạn điền
              </div>
              {pendingWO.slice(0,2).map((r: any) => (
                <div key={r.id} style={{ fontSize:11, color:T.med }}>• {r.order_code} — {r.customer_name||'?'}</div>
              ))}
              {pendingWO.length>2 && <div style={{ fontSize:11, color:T.light }}>...+{pendingWO.length-2} đơn nữa</div>}
            </div>
          )}
          {hasRet && (
            <div style={{ paddingTop:hasWO?8:0, borderTop:hasWO?`1px solid ${T.border}`:'' }}>
              <div style={{ fontSize:11, fontWeight:700, color:T.amber, marginBottom:3 }}>
                🔄 {pendingRet.length} phiếu hoàn chờ điền thông tin
              </div>
              <div style={{ fontSize:11, color:T.light, fontStyle:'italic' }}>
                Vào Báo cáo → Hàng hoàn để điền KH và lý do
              </div>
            </div>
          )}
          <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
            {hasWO && (
              <button onClick={() => { setPage('wrongord'); setDismissed(true) }}
                style={{ padding:'5px 13px', borderRadius:20, border:'none', background:T.red,
                  color:'#fff', cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700 }}>
                Xem đơn sai →
              </button>
            )}
            {hasRet && (
              <button onClick={() => { setPage('returns'); setDismissed(true) }}
                style={{ padding:'5px 13px', borderRadius:20, border:'none', background:T.amber,
                  color:'#fff', cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700 }}>
                Xem phiếu hoàn →
              </button>
            )}
            <button onClick={() => setDismissed(true)}
              style={{ padding:'5px 12px', borderRadius:20, border:`1px solid ${T.border}`,
                background:'transparent', color:T.light, cursor:'pointer', fontFamily:'inherit', fontSize:11 }}>
              Bỏ qua
            </button>
          </div>
        </div>
        <button onClick={() => setDismissed(true)}
          style={{ background:'none', border:'none', cursor:'pointer', color:T.light,
            fontSize:18, padding:0, lineHeight:1, flexShrink:0 }}>✕</button>
      </div>
    </div>
  )
}

export default function App() {
  // Inject global CSS để đảm bảo full màn hình
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'la-global'
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #F7F5F2; }
      #root { width: 100%; height: 100%; display: flex; flex-direction: column; }
    `
    if (!document.getElementById('la-global')) document.head.appendChild(style)
    return () => { const el = document.getElementById('la-global'); if (el) el.remove() }
  }, [])

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
  const [products, setProducts]     = useState<any[]>([])
  const [wrongOrders, setWrongOrders] = useState<any[]>([])
  const [returnSlips, setReturnSlips] = useState<any[]>([])
  const [invSessions, setInvSessions] = useState<any[]>([])
  const [loading, setLoading]       = useState(false)
  const width   = useWindowWidth()
  const mobile  = width < 768

  const performReset = useCallback(async (curCl: any[], tmpl: any[], st: any, manual = false) => {
    const today = todayStr(); const s = st || {}
    const now   = new Date()
    const dom   = now.getDate()
    // Số ngày cuối tháng (28/29/30/31 tùy tháng)
    const lastDomOfMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate()

    // ── Daily reset ───────────────────────────────────────
    const r_daily = manual || s.last_daily_reset !== today

    // ── Weekly reset ──────────────────────────────────────
    const wDiff = s.last_weekly_reset ? (() => {
      try { const p=s.last_weekly_reset.split('/'); return Math.floor((Date.now()-new Date(`${p[2]}-${p[1]}-${p[0]}`).getTime())/86400000) }
      catch { return 999 }
    })() : 999
    const r_weekly = manual || wDiff >= (s.weekly_reset_interval || 7)

    // ── Monthly reset — per-template day_of_month ─────────
    // Mỗi template hàng tháng có ngày riêng (day_of_month)
    // Hỗ trợ: ngày cụ thể (1-28) hoặc "cuối tháng" (99 = ngày cuối tháng)
    const monthKey = `${now.getMonth()}-${now.getFullYear()}`
    const monthlyDone: Record<string, boolean> = (() => {
      try { return JSON.parse(s.monthly_done || '{}') } catch { return {} }
    })()

    // Tìm các template hàng tháng chưa được tạo tháng này
    const monthlyTmplDue = tmpl.filter(t => {
      if (t.freq !== 'Hàng tháng' || !t.active) return false
      const tmplKey  = `${t.id}_${monthKey}`
      if (monthlyDone[tmplKey]) return false  // đã tạo tháng này rồi
      const targetDay = Number(t.day_of_month) || 1
      const actualDay = targetDay >= 99 ? lastDomOfMonth : targetDay  // 99 = cuối tháng
      return manual || dom >= actualDay  // đến ngày hoặc qua ngày rồi thì tạo
    })

    const r_monthly = monthlyTmplDue.length > 0

    if (!r_daily && !r_weekly && !r_monthly) return false

    // ── Archive history ───────────────────────────────────
    if (curCl.length > 0) {
      const archDate = s.last_daily_reset || today
      const freqsToArch = ['Hàng ngày', 'Hàng tuần', ...(r_monthly ? ['Hàng tháng'] : [])]
      const hist = curCl.filter(c => freqsToArch.includes(c.freq)).map(c => ({
        id:`hist_${c.id}_${Date.now()}_${Math.random().toString(36).slice(2,5)}`,
        date:archDate, assignee_id:c.assignee_id, title:c.title,
        freq:c.freq, status:c.status, done_at:c.done_at, dept_id:c.dept_id||''
      }))
      if (hist.length > 0) { await db.from('history').insert(hist); setHistory(prev => [...prev, ...hist]) }
    }

    // ── Xóa checklist cũ ─────────────────────────────────
    const freqs: string[] = []
    if (r_daily)   freqs.push('Hàng ngày')
    if (r_weekly)  freqs.push('Hàng tuần')
    // Monthly: chỉ xóa item cũ của các template sắp tạo lại
    if (r_monthly) {
      const dueIds = monthlyTmplDue.map(t => t.id)
      const oldMonthly = curCl.filter(c => c.freq==='Hàng tháng' && dueIds.includes(c.template_id))
      for (const old of oldMonthly) await db.from('checklist').delete().eq('id', old.id)
    }
    for (const freq of freqs) await db.from('checklist').delete().eq('freq', freq)

    // ── Tạo checklist mới ─────────────────────────────────
    const dailyWeeklyTmpl = tmpl.filter(t => t.active && freqs.includes(t.freq))
    const allNewTmpl = [...dailyWeeklyTmpl, ...monthlyTmplDue]

    const newItems = allNewTmpl.map(t => ({
      id:`cl_${t.id}_${Date.now()}_${Math.random().toString(36).slice(2,5)}`,
      template_id:t.id, title:t.title, description:t.description||`~${t.mins} phút`,
      assignee_id:t.assignee_id, priority:t.priority, freq:t.freq,
      time_start:t.time_start||'', time_end:t.time_end||'',
      deadline:t.time_end||t.deadline_suggest||'', status:'notyet', done_at:'', date:today,
      dept_id: ''
    }))
    if (newItems.length > 0) await db.from('checklist').insert(newItems)
    setChecklist(prev => {
      const removeFreqs = new Set(freqs)
      const removeTmplIds = new Set(monthlyTmplDue.map(t => t.id))
      return [
        ...prev.filter(c => !removeFreqs.has(c.freq) && !(c.freq==='Hàng tháng' && removeTmplIds.has(c.template_id))),
        ...newItems
      ]
    })

    // ── Ghi nhận monthly templates đã tạo ────────────────
    const updatedMonthlyDone = { ...monthlyDone }
    for (const t of monthlyTmplDue) {
      updatedMonthlyDone[`${t.id}_${monthKey}`] = true
    }
    // Dọn key cũ (> 2 tháng) để tránh phình to
    const cutoff = `${new Date(now.getFullYear(), now.getMonth()-1, 1).getMonth()}-${new Date(now.getFullYear(), now.getMonth()-1, 1).getFullYear()}`
    Object.keys(updatedMonthlyDone).forEach(k => { if (k.endsWith(cutoff)) delete updatedMonthlyDone[k] })

    const newSt = { ...s, id:'main',
      last_daily_reset:  r_daily  ? today : s.last_daily_reset||'',
      last_weekly_reset: r_weekly ? today : s.last_weekly_reset||'',
      monthly_done: JSON.stringify(updatedMonthlyDone),
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
      ;(async () => {
        const all: any[] = []; let from = 0
        while (true) {
          const { data } = await db.from('products').select('*').eq('active',true).order('name').range(from,from+999)
          if (!data||data.length===0) break
          all.push(...data); if (data.length<1000) break; from+=1000
        }
        setProducts(all)
      })()
      db.from('wrong_orders').select('*').order('created_at',{ascending:false})
        .then(({data}) => { if (data) setWrongOrders(data) })
      // Fetch return slips for notifications (last 30 days)
      const thirtyAgo = new Date(Date.now()-30*86400000).toISOString().split('T')[0]
      db.from('return_items').select('id,slip_id,sale_id,created_at,created_by,date')
        .gte('date', thirtyAgo).order('created_at',{ascending:false})
        .then(({data}) => {
          if (!data) return
          const seen = new Set<string>()
          const slips = data.filter((r: any) => {
            const sid = r.slip_id||r.id; if (seen.has(sid)) return false; seen.add(sid); return true
          }).map((r: any) => ({ slip_id:r.slip_id||r.id, sale_id:r.sale_id, created_at:r.created_at, created_by:r.created_by }))
          setReturnSlips(slips)
        })

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
    // Reset monthly_done để force tạo lại tất cả template hàng tháng
    const clearedSettings = { ...settings, monthly_done: '{}' }
    await performReset(cl||[], templates, clearedSettings, true)
  }, [settings, templates, performReset])

  // Login
  if (!user) return <LoginScreen onLogin={(u: any) => {
    setUser(u)
    setPage(getPerm(u).viewAllDashboard || getPerm(u).viewDeptChecklist ? 'dashboard' : 'checklist')
  }}/>

  if (loading) return (
    <div style={{ minHeight:'100vh', background:T.sidebar, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
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
    <div style={{ display:'flex', minHeight:'100vh',
      fontFamily:"'Segoe UI',system-ui,sans-serif", background:T.bg }}>
        {!mobile && (
          <Sidebar user={user} page={validPage} setPage={setPage}
            pendingLeave={pendingLeave} pendingOT={pendingOT}
            onLogout={() => { localStorage.removeItem('la_user'); setUser(null); setAllUsers([]); setChecklist([]) }}/>
        )}
        <main style={{ flex:1, overflowY:'auto', paddingTop:4, minWidth:0 }}>
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
          {validPage==='shortage'   && <ShortageItems {...pp} products={products} setProducts={setProducts}/>}
          {validPage==='inventory'  && <InventoryModule {...pp} products={products} invSessions={invSessions} setInvSessions={setInvSessions}/>}
          {validPage==='returns'    && <ReturnItems {...pp} products={products}/>}
          {validPage==='wrongord'   && <WrongOrders {...pp} wrongOrders={wrongOrders} setWrongOrders={setWrongOrders} allUsers={allUsers}/>}
          {validPage==='settings'   && <Settings {...pp} setUser={setUser} settings={settings} setSettings={setSettings} onManualReset={manualReset}/>}
        </main>
        {mobile && <BottomNav user={user} page={validPage} setPage={setPage} pendingLeave={pendingLeave} pendingOT={pendingOT} onLogout={() => { localStorage.removeItem('la_user'); setUser(null); setAllUsers([]); setChecklist([]) }}/>}
        {/* Sticky Note — floating for all users */}
        {user && <StickyNote user={user}/>}
        {/* Notification Banner — wrong orders pending */}
        {user && <NotifBanner user={user} wrongOrders={wrongOrders} returnSlips={returnSlips} setPage={setPage}/>}
        {user && <SaturdayBanner user={user}/>}
      </div>
     )
}

// ══ KẾT THÚC PHẦN 6 — HOÀN THÀNH! ══
// ══ WRONG ORDERS (Đơn sai) ════════════════════════════
function WrongOrders({ user, allUsers, wrongOrders, setWrongOrders, mobile }: any) {
  const [showAdd,  setShowAdd]  = useState(false)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [tab,      setTab]      = useState<'list'|'stats'>('list')
  const [sortBy,   setSortBy]   = useState<'created_at'|'date'>('created_at')
  const [monthFilter, setMonthFilter] = useState(() => {
    const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`
  })
  const [searchQ, setSearchQ] = useState('')
  const [expandedSlip, setExpandedSlip] = useState<any>(null)
  const p = mobile ? '16px' : '24px'
  const perm = getPerm(user)
  const isKho   = user.dept_id === 'kho'
  const isSale  = user.dept_id === 'sale'
  const canAdd  = isKho || perm.viewAllDashboard
  const canResolve = perm.resolveWrongOrder

  const norm = (s: string) => (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d')
  const fuzzy = (r: any, q: string) => !q.trim() || norm(q).split(/\s+/).every((t: string) =>
    norm([r.order_code,r.customer_name,r.detail,r.sale_name,r.violator_name].join(' ')).includes(t)
  )

  const emptyForm = { date:'', order_code:'', customer_name:'', sale_id:'', violator_id:'', detail:'' }
  const [form, setForm] = useState<any>(emptyForm)

  const [fy, fm] = monthFilter.split('-').map(Number)
  const filtered = wrongOrders.filter((r: any) => {
    if (!fuzzy(r, searchQ)) return false
    // Filter by created_at month primarily
    const ref = r.created_at || r.date || ''
    if (!ref) return true
    const d = new Date(ref)
    return d.getFullYear()===fy && d.getMonth()+1===fm
  }).sort((a: any, b: any) => {
    const aVal = sortBy==='date' ? (a.date||'') : (a.created_at||'')
    const bVal = sortBy==='date' ? (b.date||'') : (b.created_at||'')
    return bVal.localeCompare(aVal)  // mới nhất trước
  })

  // Stats
  const woStats = {
    total: filtered.length,
    pending:     filtered.filter((r: any) => r.status==='pending').length,
    sale_filled: filtered.filter((r: any) => r.status==='sale_filled').length,
    resolved:    filtered.filter((r: any) => r.status==='resolved').length,
    bySale: allUsers.filter((u: any) => filtered.some((r: any) => r.sale_id===u.id || r.violator_id===u.id)).map((u: any) => ({
      id:u.id, name:u.name,
      asResponsible: filtered.filter((r: any) => r.sale_id===u.id).length,
      asViolator:    filtered.filter((r: any) => r.violator_id===u.id).length,
    })).sort((a: any, b: any) => (b.asResponsible+b.asViolator)-(a.asResponsible+a.asViolator))
  }

  const STATUS_CFG_WO: any = {
    pending:     { label:'⏳ Chưa xử lý',    color:T.red,   bg:T.redBg   },
    sale_filled: { label:'📝 Chờ QM xác nhận', color:T.amber, bg:T.amberBg },
    resolved:    { label:'✅ Đã xử lý',       color:T.green, bg:T.greenBg  },
  }

  const submit = async () => {
    if (!form.order_code || !form.date) return
    const now = new Date().toISOString()
    const newItem = { id:'wo'+Date.now(), ...form, status:'pending',
      resolution_note:'', resolved_by:'', resolved_at:'',
      sale_filled_at:'', created_by:user.id, created_at:now }
    setWrongOrders((prev: any) => [newItem, ...prev])
    const { error } = await db.from('wrong_orders').insert(newItem)
    if (error) { setWrongOrders((prev: any) => prev.filter((i: any) => i.id!==newItem.id)); alert('❌ '+error.message); return }
    setShowAdd(false); setForm(emptyForm)
    // Auto-notify: create announcement for sale dept
    const saleUser = allUsers.find((u: any) => u.id===form.sale_id)
    if (saleUser) {
      await db.from('announcements').insert({
        id:'ann_wo_'+Date.now(), title:`⚠️ Đơn sai mới: ${form.order_code}`,
        content:`Đơn ${form.order_code} - KH: ${form.customer_name||'?'} có sai sót. Sale ${saleUser.name} cần vào điền thông tin xử lý.`,
        dept_id:'sale', created_by:user.id, created_at:now, priority:'high'
      })
    }
  }

  const saleFill = async (id: string, note: string) => {
    const upd = { status:'sale_filled', resolution_note:note, sale_filled_at:new Date().toISOString() }
    setWrongOrders((prev: any) => prev.map((r: any) => r.id===id ? {...r,...upd} : r))
    await db.from('wrong_orders').update(upd).eq('id', id)
    setShowEdit(null)
  }

  const resolve = async (id: string) => {
    if (!confirm('Xác nhận đơn này đã được xử lý xong?')) return
    const upd = { status:'resolved', resolved_by:user.id, resolved_at:new Date().toISOString() }
    setWrongOrders((prev: any) => prev.map((r: any) => r.id===id ? {...r,...upd} : r))
    await db.from('wrong_orders').update(upd).eq('id', id)
  }

  const del = async (id: string) => {
    if (!confirm('Xóa đơn sai này?')) return
    setWrongOrders((prev: any) => prev.filter((r: any) => r.id!==id))
    await db.from('wrong_orders').delete().eq('id', id)
  }

  const pendingMine = wrongOrders.filter((r: any) =>
    r.status==='pending' && (r.sale_id===user.id || isSale || perm.viewAllDashboard)
  ).length

  return (
    <div style={{ padding:`0 ${p} ${mobile?'80px':p}` }}>
      <Topbar mobile={mobile} title="⚠️ Báo cáo đơn sai"
        subtitle={`Tháng ${fm}/${fy} — ${filtered.length} đơn`}
        action={
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {pendingMine>0 && (
              <span style={{ fontSize:12, fontWeight:700, color:T.red, background:T.redBg,
                padding:'4px 10px', borderRadius:20 }}>⚠️ {pendingMine} chờ xử lý</span>
            )}
            <input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
              style={{ padding:'6px 10px', border:`1px solid ${T.border}`, borderRadius:8,
                fontSize:12, fontFamily:'inherit', color:T.dark, background:T.bg }}/>
            {canAdd && <GoldBtn small onClick={() => { setForm({...emptyForm, date:new Date().toISOString().split('T')[0]}); setShowAdd(true) }}>+ Tạo đơn sai</GoldBtn>}
          </div>
        }/>

      {/* Tabs + Sort + Search */}
      <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap', alignItems:'center' }}>
        {([['list','📋 Danh sách'],['stats','📊 Thống kê']] as [string,string][]).map(([id,label]) => (
          <button key={id} onClick={() => setTab(id as any)}
            style={{ padding:'6px 14px', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontSize:12,
              border:`1.5px solid ${tab===id?T.gold:T.border}`,
              background:tab===id?T.goldBg:'transparent',
              color:tab===id?T.goldText:T.med, fontWeight:tab===id?700:400 }}>{label}</button>
        ))}
        {tab==='list' && (
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
            style={{ padding:'6px 10px', borderRadius:8, border:`1px solid ${T.border}`,
              fontSize:12, fontFamily:'inherit', color:T.dark, background:T.bg, cursor:'pointer' }}>
            <option value="created_at">📅 Sắp xếp: Ngày tạo phiếu</option>
            <option value="date">⚠️ Sắp xếp: Ngày sai</option>
          </select>
        )}
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
          placeholder="🔍 Tìm mã đơn, khách hàng, chi tiết..."
          style={{ flex:1, minWidth:160, padding:'6px 10px', border:`1px solid ${T.border}`,
            borderRadius:8, fontSize:12, fontFamily:'inherit', color:T.dark, background:T.bg,
            outline:'none' }}/>
      </div>

      {tab==='stats' ? (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:mobile?'1fr':'repeat(4,1fr)', gap:12 }}>
            {[
              ['📋 Tổng đơn sai', woStats.total, T.dark],
              ['⏳ Chờ xử lý', woStats.pending, T.red],
              ['📝 Chờ QM xác nhận', woStats.sale_filled, T.amber],
              ['✅ Đã xử lý', woStats.resolved, T.green],
            ].map(([label,val,color]) => (
              <Card key={label as string} style={{ textAlign:'center', padding:'14px 12px' }}>
                <div style={{ fontSize:22, fontWeight:800, color:color as string }}>{val}</div>
                <div style={{ fontSize:11, color:T.light, marginTop:4 }}>{label}</div>
              </Card>
            ))}
          </div>
          <Card style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', background:T.amberBg, borderBottom:`1px solid #fcd34d`,
              fontSize:13, fontWeight:700, color:T.amber }}>👤 Thống kê theo nhân viên</div>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ background:T.bg }}>
                  {['Nhân viên','Sale phụ trách','Vi phạm'].map(h => (
                    <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontWeight:700,
                      color:T.light, fontSize:10, textTransform:'uppercase', letterSpacing:.5,
                      borderBottom:`1px solid ${T.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {woStats.bySale.length===0
                  ? <tr><td colSpan={3} style={{ padding:'20px', textAlign:'center', color:T.light }}>Chưa có dữ liệu</td></tr>
                  : woStats.bySale.map((s: any, i: number) => (
                    <tr key={s.id} style={{ background:i%2===0?'#fff':T.bg, borderBottom:`1px solid ${T.border}` }}>
                      <td style={{ padding:'9px 12px', fontWeight:600, color:T.dark }}>{s.name}</td>
                      <td style={{ padding:'9px 12px', color:T.blue, fontWeight:s.asResponsible>0?700:400 }}>
                        {s.asResponsible>0?s.asResponsible:'—'}
                      </td>
                      <td style={{ padding:'9px 12px', color:T.red, fontWeight:s.asViolator>0?700:400 }}>
                        {s.asViolator>0?`⚠️ ${s.asViolator}`:'—'}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </Card>
        </div>
      ) : (
      <>{filtered.length===0
        ? <Card style={{ textAlign:'center', padding:'40px', color:T.light }}>
            <div style={{ fontSize:32, marginBottom:8 }}>⚠️</div>
            <div style={{ fontSize:13 }}>Không có đơn sai nào trong tháng này</div>
          </Card>
        : <div style={{ background:T.card, borderRadius:12, border:`1px solid ${T.border}`,
            boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>

            {/* ── Header ── */}
            {!mobile && (
              <div style={{ display:'grid',
                gridTemplateColumns:'68px 68px 95px 120px 1fr 160px 90px 90px 110px 95px',
                padding:'8px 12px', background:T.bg, borderBottom:`2px solid ${T.border}`,
                fontSize:10, fontWeight:700, color:T.light, textTransform:'uppercase',
                letterSpacing:.6, gap:8, alignItems:'center', position:'sticky', top:0, zIndex:2 }}>
                <span>Ngày tạo</span>
                <span>Ngày sai</span>
                <span>Mã đơn</span>
                <span>Khách hàng</span>
                <span>Chi tiết đơn sai</span>
                <span>Ghi chú xử lý</span>
                <span>Sale PT</span>
                <span>Vi phạm</span>
                <span>Tình trạng</span>
                <span style={{ textAlign:'right' }}>Thao tác</span>
              </div>
            )}

            {filtered.map((r: any, i: number) => {
              const sc          = STATUS_CFG_WO[r.status]||STATUS_CFG_WO.pending
              const saleUser    = allUsers.find((u: any) => u.id===r.sale_id)
              const violUser    = allUsers.find((u: any) => u.id===r.violator_id)
              const resolvedUser = allUsers.find((u: any) => u.id===r.resolved_by)
              const canSaleFill = (isSale || perm.viewAllDashboard) && (r.status==='pending' || perm.viewAllDashboard)
              const canRes      = canResolve && r.status==='sale_filled'
              const canDel      = (canAdd && r.status==='pending') || perm.viewAllDashboard
              const detailLong  = (r.detail||'').length > 100
              const isOpen      = expandedSlip === r.id
              const rowBg       = i%2===0 ? '#fff' : T.rowAlt

              return (
                <div key={r.id} style={{ borderBottom:`1px solid ${T.border}`,
                  background: isOpen ? T.goldBg : rowBg }}>

                  {mobile ? (
                    /* ── Mobile card ── */
                    <div style={{ padding:'10px 14px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, fontWeight:700, color:T.gold }}>
                            {r.order_code||'—'}
                            <span style={{ fontSize:10, color:T.light, marginLeft:8, fontWeight:400 }}>
                              {r.date?new Date(r.date).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit'}):''} 
                            </span>
                          </div>
                          {r.customer_name && <div style={{ fontSize:11, color:T.dark, marginTop:2 }}>{r.customer_name}</div>}
                          {r.detail && <div style={{ fontSize:11, color:T.med, marginTop:3, lineHeight:1.4 }}>{r.detail}</div>}
                          {r.resolution_note && <div style={{ fontSize:11, color:T.blue, marginTop:3 }}>📝 {r.resolution_note}</div>}
                        </div>
                        <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:20,
                          color:sc.color, background:sc.bg, whiteSpace:'nowrap', flexShrink:0 }}>{sc.label}</span>
                      </div>
                      <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
                        {canSaleFill && <button onClick={() => setShowEdit(r)}
                          style={{ padding:'4px 10px', borderRadius:20, border:`1.5px solid ${T.gold}`,
                            background:T.goldBg, cursor:'pointer', fontSize:10, fontFamily:'inherit', color:T.goldText, fontWeight:700 }}>Điền xử lý</button>}
                        {canRes && <button onClick={() => resolve(r.id)}
                          style={{ padding:'4px 10px', borderRadius:20, border:`1.5px solid ${T.green}`,
                            background:T.greenBg, cursor:'pointer', fontSize:10, fontFamily:'inherit', color:T.green, fontWeight:700 }}>✅ Xác nhận</button>}
                      </div>
                    </div>
                  ) : (
                    /* ── Desktop table row ── */
                    <div style={{ display:'grid',
                      gridTemplateColumns:'68px 68px 95px 120px 1fr 160px 90px 90px 110px 95px',
                      padding:'9px 12px', gap:8, alignItems:'start' }}
                      onClick={() => detailLong && setExpandedSlip((prev: any) => prev===r.id?null:r.id)}>

                      {/* Ngày tạo */}
                      <span style={{ fontSize:11, color:T.light }}>
                        {r.created_at?new Date(r.created_at).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit'}):'—'}
                      </span>

                      {/* Ngày sai */}
                      <span style={{ fontSize:11, color:T.med, fontWeight:500 }}>
                        {r.date?new Date(r.date).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit'}):'—'}
                      </span>

                      {/* Mã đơn */}
                      <span style={{ fontSize:12, fontWeight:700, color:T.gold,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {r.order_code||'—'}
                      </span>

                      {/* Khách hàng */}
                      <span style={{ fontSize:11, color:T.dark, lineHeight:1.4 }}>
                        {r.customer_name||'—'}
                      </span>

                      {/* Chi tiết — wrap, truncate nếu dài */}
                      <div style={{ fontSize:11, color:T.med, lineHeight:1.4 }}>
                        {detailLong && !isOpen
                          ? <>{r.detail.slice(0,100)}<span style={{ color:T.light, cursor:'pointer' }}
                              onClick={e => { e.stopPropagation(); setExpandedSlip((p: any) => p===r.id?null:r.id) }}>
                              ... <span style={{ color:T.blue, textDecoration:'underline' }}>xem thêm</span>
                            </span></>
                          : r.detail||'—'
                        }
                        {isOpen && detailLong && (
                          <span style={{ color:T.blue, cursor:'pointer', marginLeft:6, fontSize:10 }}
                            onClick={e => { e.stopPropagation(); setExpandedSlip(null) }}>thu gọn ▲</span>
                        )}
                      </div>

                      {/* Ghi chú xử lý */}
                      <div style={{ fontSize:11, lineHeight:1.4 }}>
                        {r.resolution_note
                          ? <><span style={{ color:T.blue }}>{r.resolution_note}</span>
                              {resolvedUser && <div style={{ fontSize:10, color:T.green, marginTop:2 }}>✅ {resolvedUser.name}</div>}</>
                          : <span style={{ color:T.light, fontStyle:'italic' }}>Chưa có</span>
                        }
                      </div>

                      {/* Sale PT */}
                      <span style={{ fontSize:11, color:saleUser?T.gold:T.light,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {saleUser?.name||'—'}
                      </span>

                      {/* Vi phạm */}
                      <span style={{ fontSize:11, color:violUser?T.red:T.light,
                        lineHeight:1.4 }}>
                        {violUser?'⚠️ '+violUser.name:'—'}
                      </span>

                      {/* Tình trạng */}
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20,
                        color:sc.color, background:sc.bg, whiteSpace:'nowrap',
                        display:'inline-block', textAlign:'center' }}>{sc.label}</span>

                      {/* Thao tác */}
                      <div style={{ display:'flex', gap:5, justifyContent:'flex-end', flexWrap:'wrap' }}
                        onClick={e => e.stopPropagation()}>
                        {canSaleFill && (
                          <button onClick={() => setShowEdit(r)}
                            style={{ padding:'3px 9px', borderRadius:20, border:`1.5px solid ${T.gold}`,
                              background:T.goldBg, cursor:'pointer', fontSize:10, fontFamily:'inherit',
                              color:T.goldText, fontWeight:700, whiteSpace:'nowrap' }}>Điền</button>
                        )}
                        {canRes && (
                          <button onClick={() => resolve(r.id)}
                            style={{ padding:'3px 9px', borderRadius:20, border:`1.5px solid ${T.green}`,
                              background:T.greenBg, cursor:'pointer', fontSize:10, fontFamily:'inherit',
                              color:T.green, fontWeight:700 }}>✅</button>
                        )}
                        {canDel && (
                          <button onClick={() => del(r.id)}
                            style={{ padding:'3px 7px', borderRadius:20, border:`1px solid ${T.redBg}`,
                              background:T.redBg, cursor:'pointer', fontSize:10, fontFamily:'inherit', color:T.red }}>✕</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
      }</> )}

      {/* Modal tạo đơn sai */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="⚠️ Tạo đơn sai mới" wide>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Inp label="Ngày sai *" type="date" value={form.date} onChange={(v) => setForm((f: any) => ({...f,date:v}))}/>
          <Inp label="Mã đơn hàng *" value={form.order_code} onChange={(v) => setForm((f: any) => ({...f,order_code:v}))} placeholder="VD: DH006994"/>
        </div>
        <Inp label="Tên khách hàng" value={form.customer_name} onChange={(v) => setForm((f: any) => ({...f,customer_name:v}))} placeholder="Tên KH..."/>
        <Sel label="Sale phụ trách" value={form.sale_id} onChange={(v) => setForm((f: any) => ({...f,sale_id:v}))}
          options={[{value:'',label:'— Chọn sale —'},...allUsers.filter((u: any)=>u.dept_id==='sale').map((u: any)=>({value:u.id,label:u.name}))]}/>
        <Sel label="Nhân viên vi phạm (Kho/Sale)" value={form.violator_id} onChange={(v) => setForm((f: any) => ({...f,violator_id:v}))}
          options={[{value:'',label:'— Chọn NV —'},...allUsers.filter((u: any)=>u.dept_id==='kho'||u.dept_id==='sale').map((u: any)=>({value:u.id,label:`${u.name} (${u.dept_name||u.dept_id})`}))]}/>
        <div style={{ marginBottom:13 }}>
          <div style={{ fontSize:12, fontWeight:500, color:T.med, marginBottom:5 }}>Chi tiết đơn sai *</div>
          <textarea value={form.detail} onChange={e => setForm((f: any) => ({...f,detail:e.target.value}))}
            placeholder="VD: Đóng 2 JA serum folic acid b9 55ml => 2 serum vicderma folic acid b9..."
            rows={3} style={{ width:'100%', padding:'8px 11px', border:`1px solid ${T.border}`, borderRadius:8,
              fontSize:13, fontFamily:'inherit', color:T.dark, background:'#fff',
              resize:'vertical', boxSizing:'border-box' as any, outline:'none' }}/>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
          <GoldBtn outline small onClick={() => setShowAdd(false)}>Hủy</GoldBtn>
          <GoldBtn small onClick={submit} disabled={!form.order_code||!form.date||!form.detail}>Tạo đơn sai</GoldBtn>
        </div>
      </Modal>

      {/* Modal sale điền tình trạng */}
      {showEdit && <SaleFillModal item={showEdit} onSave={saleFill} onClose={() => setShowEdit(null)}/>}
    </div>
  )
}

function SaleFillModal({ item, onSave, onClose }: any) {
  const [note, setNote] = useState(item.resolution_note||'')
  return (
    <Modal open={true} onClose={onClose} title="📝 Điền ghi chú tình trạng xử lý">
      <div style={{ padding:'8px 12px', background:T.amberBg, borderRadius:8, marginBottom:14, fontSize:12, color:T.amber }}>
        ⚠️ Đơn {item.order_code} — {item.customer_name||'?'}<br/>
        <span style={{ fontSize:11, marginTop:4, display:'block' }}>{item.detail}</span>
      </div>
      <div style={{ marginBottom:13 }}>
        <div style={{ fontSize:12, fontWeight:500, color:T.med, marginBottom:5 }}>Ghi chú tình trạng xử lý *</div>
        <textarea value={note} onChange={e => setNote(e.target.value)}
          placeholder="VD: Đã liên hệ KH đổi hàng, dự kiến xử lý ngày 15/04..."
          rows={4} style={{ width:'100%', padding:'8px 11px', border:`1px solid ${T.border}`, borderRadius:8,
            fontSize:13, fontFamily:'inherit', color:T.dark, background:'#fff',
            resize:'vertical', boxSizing:'border-box' as any, outline:'none' }}/>
      </div>
      <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
        <GoldBtn outline small onClick={onClose}>Hủy</GoldBtn>
        <GoldBtn small onClick={() => onSave(item.id, note)} disabled={!note.trim()}>Gửi lên QM xác nhận</GoldBtn>
      </div>
    </Modal>
  )
}

// ════════════════════════════════════════════════════════
// 📦 MODULE KIỂM KÊ KHO
// ════════════════════════════════════════════════════════

// ── Saturday Banner ─────────────────────────────────────
function SaturdayBanner({ user }: any) {
  const [dismissed, setDismissed] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const perm = getPerm(user)
  const isSale = user.dept_id === 'sale'
  const isManager = perm.approveLeave || perm.viewAllDashboard
  const now = new Date()
  const isSat = now.getDay() === 6
  const hour = now.getHours()
  const todayStr = now.toISOString().split('T')[0]
  const showBanner = isSale && !isManager && isSat && hour >= 12

  useEffect(() => {
    if (!showBanner) { setLoaded(true); return }
    db.from('saturday_checkins').select('id').eq('user_id', user.id).eq('date', todayStr)
      .maybeSingle().then(({ data }) => { if (data) setConfirmed(true); setLoaded(true) })
  }, [])

  const handleConfirm = async () => {
    await db.from('saturday_checkins').upsert({ id:`sat_${user.id}_${todayStr}`, user_id:user.id, date:todayStr, confirmed_at:now.toISOString() })
    setConfirmed(true)
  }

  if (!loaded || !showBanner || confirmed || dismissed) return null

  return (
    <div style={{ position:'fixed', top:16, left:'50%', transform:'translateX(-50%)',
      zIndex:10000, background:'#fff', border:`2px solid ${T.amber}`,
      borderRadius:14, boxShadow:'0 8px 32px rgba(180,83,9,0.2)',
      padding:'14px 18px', maxWidth:400, width:'calc(100vw - 32px)' }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
        <span style={{ fontSize:22, flexShrink:0 }}>⚠️</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:800, color:T.amber, marginBottom:4, letterSpacing:.3 }}>
            HOÀN THÀNH HÓA ĐƠN ĐỂ KIỂM KÊ KHO
          </div>
          <div style={{ fontSize:11, color:T.med, marginBottom:10, lineHeight:1.5 }}>
            Kho sẽ kiểm kê vào sáng Chủ Nhật. Sale vui lòng hoàn thành tất cả đơn hàng hôm nay.
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {hour >= 18 && (
              <button onClick={handleConfirm}
                style={{ padding:'6px 14px', borderRadius:20, border:'none', background:T.green,
                  color:'#fff', cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700 }}>
                ✅ Đã hoàn thành
              </button>
            )}
            <button onClick={() => setDismissed(true)}
              style={{ padding:'6px 12px', borderRadius:20, border:`1px solid ${T.border}`,
                background:'transparent', color:T.light, cursor:'pointer', fontFamily:'inherit', fontSize:11 }}>
              Nhắc lại sau
            </button>
          </div>
        </div>
        <button onClick={() => setDismissed(true)}
          style={{ background:'none', border:'none', cursor:'pointer', color:T.light, fontSize:18, padding:0 }}>✕</button>
      </div>
    </div>
  )
}

// ── Inventory Check Row subcomponent (avoid hooks in .map) ─
function InvCheckRow({ check, products, allUsers, canEdit, onUpdate, idx, total }: any) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(check.actual_qty != null ? String(check.actual_qty) : '')
  const prod = products.find((p: any) => p.code === check.product_code)
  const checker = allUsers.find((u: any) => u.id === check.assigned_to)
  const diff = check.diff
  const hasDiff = diff != null && diff !== 0

  const save = async () => {
    const actual = Number(val)
    const newDiff = actual - (check.system_qty || 0)
    const upd = { actual_qty: actual, diff: newDiff,
      status: newDiff !== 0 ? 'discrepancy' : 'checked', checked_at: new Date().toISOString() }
    await db.from('inventory_checks').update(upd).eq('id', check.id)
    onUpdate(check.id, upd)
    setEditing(false)
  }

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 70px 70px 80px 100px 80px',
      padding:'8px 12px', gap:8, alignItems:'center',
      borderBottom: idx < total-1 ? `1px solid ${T.border}` : 'none',
      background: hasDiff ? '#FFF5F5' : idx%2===0 ? '#fff' : T.rowAlt }}>
      <div>
        <div style={{ fontSize:12, fontWeight:500, color:T.dark }}>{check.product_name}</div>
        <div style={{ fontSize:10, color:T.light }}>{check.product_code}
          {checker && <span style={{ marginLeft:6, color:T.blue }}>· {checker.name}</span>}
        </div>
      </div>
      <span style={{ fontSize:12, textAlign:'center', color:T.med }}>{check.system_qty ?? '—'}</span>
      {editing ? (
        <input type="number" value={val} onChange={e => setVal(e.target.value)}
          autoFocus style={{ width:'100%', padding:'4px 6px', border:`1.5px solid ${T.gold}`,
            borderRadius:6, fontSize:12, fontFamily:'inherit', textAlign:'center' }}
          onKeyDown={e => e.key==='Enter' && save()}/>
      ) : (
        <span style={{ fontSize:12, textAlign:'center', fontWeight:check.actual_qty!=null?700:400,
          color:check.actual_qty!=null?T.dark:T.light }}>
          {check.actual_qty ?? '—'}
        </span>
      )}
      <span style={{ fontSize:12, textAlign:'center', fontWeight:700,
        color:!hasDiff?T.green:diff>0?T.blue:T.red }}>
        {diff==null?'—':diff>0?'+'+diff:diff}
      </span>
      <span style={{ fontSize:10, padding:'2px 7px', borderRadius:20, textAlign:'center',
        background:check.status==='checked'||check.status==='confirmed'?T.greenBg:check.status==='discrepancy'?T.redBg:T.bg,
        color:check.status==='checked'||check.status==='confirmed'?T.green:check.status==='discrepancy'?T.red:T.light }}>
        {check.status==='checked'?'✓ OK':check.status==='discrepancy'?'⚠️ Lệch':check.status==='confirmed'?'✅':check.status==='pending'?'Chờ':'—'}
      </span>
      <div style={{ display:'flex', gap:4, justifyContent:'flex-end' }}>
        {canEdit && !editing && (
          <button onClick={() => setEditing(true)}
            style={{ padding:'3px 9px', borderRadius:20, border:`1px solid ${T.border}`,
              background:'transparent', cursor:'pointer', fontSize:10, fontFamily:'inherit', color:T.med }}>
            {check.actual_qty!=null?'Sửa':'Nhập'}
          </button>
        )}
        {editing && <>
          <button onClick={save}
            style={{ padding:'3px 9px', borderRadius:20, border:'none', background:T.green,
              cursor:'pointer', fontSize:10, fontFamily:'inherit', color:'#fff', fontWeight:700 }}>✓</button>
          <button onClick={() => { setEditing(false); setVal(check.actual_qty!=null?String(check.actual_qty):'') }}
            style={{ padding:'3px 8px', borderRadius:20, border:`1px solid ${T.border}`,
              background:'transparent', cursor:'pointer', fontSize:10, fontFamily:'inherit', color:T.light }}>✕</button>
        </>}
      </div>
    </div>
  )
}

// ── Mobile Check Input (NV dùng điện thoại) ──────────────
// ── CheckListRow — 1 dòng trong list KK của NV ─────────────
function CheckListRow({ check, isActive, onSelect, onConfirm, onSkip, idx, total }: any) {
  const [val, setVal] = useState(check.actual_qty != null ? String(check.actual_qty) : '')
  const inputRef = React.useRef<HTMLInputElement>(null)
  const done = check.actual_qty != null
  const diff = val !== '' ? Number(val) - (check.system_qty || 0) : null

  // Auto-focus input when row becomes active
  useEffect(() => {
    if (isActive && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isActive])

  const handleConfirm = async () => {
    if (val === '') return
    const actual = Number(val)
    const newDiff = actual - (check.system_qty || 0)
    const upd = { actual_qty: actual, diff: newDiff,
      status: newDiff !== 0 ? 'discrepancy' : 'checked',
      checked_at: new Date().toISOString() }
    await db.from('inventory_checks').update(upd).eq('id', check.id)
    onConfirm(check.id, upd)
  }

  const statusIcon = done
    ? (check.diff !== 0 ? '⚠️' : '✅')
    : (isActive ? '▶' : '○')
  const statusColor = done
    ? (check.diff !== 0 ? T.red : T.green)
    : (isActive ? T.gold : T.border)

  return (
    <div style={{
      borderBottom: idx < total - 1 ? `1px solid ${T.border}` : 'none',
      background: isActive ? '#FFFDF5' : done ? (check.diff !== 0 ? '#FFF5F5' : '#F5FFF5') : (idx%2===0?'#fff':T.rowAlt),
      transition: 'all .15s',
    }}>
      {/* Compact row — always visible */}
      <div onClick={() => !done && onSelect(check.id)}
        style={{ display:'grid', gridTemplateColumns:'36px 1fr 60px 36px',
          padding: isActive ? '12px 14px 0' : '10px 14px',
          gap:10, alignItems:'center',
          cursor: done ? 'default' : 'pointer' }}>
        {/* Status icon */}
        <span style={{ fontSize:18, textAlign:'center', color:statusColor,
          transition:'all .2s' }}>{statusIcon}</span>
        {/* Product info */}
        <div>
          <div style={{ fontSize:12, fontWeight:isActive?700:500, color:T.dark,
            lineHeight:1.3 }}>{check.product_name}</div>
          <div style={{ fontSize:10, color:T.light }}>{check.product_code}</div>
        </div>
        {/* System qty */}
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:10, color:T.light }}>Tồn HT</div>
          <div style={{ fontSize:14, fontWeight:700, color:T.blue }}>{check.system_qty ?? '—'}</div>
        </div>
        {/* Done badge */}
        {done && (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:12, fontWeight:800,
              color:check.diff===0?T.green:check.diff>0?T.blue:T.red }}>
              {check.diff===0?'✓':check.diff>0?`+${check.diff}`:check.diff}
            </div>
          </div>
        )}
        {!done && !isActive && (
          <div style={{ width:24, height:24, borderRadius:'50%',
            border:`1.5px solid ${T.border}`, flexShrink:0 }}/>
        )}
      </div>

      {/* Expanded input — only when active */}
      {isActive && (
        <div style={{ padding:'12px 14px 16px' }}>
          {/* 3-number display */}
          <div style={{ display:'flex', justifyContent:'space-around',
            background:'#fff', borderRadius:12, padding:'12px',
            border:`1.5px solid ${T.gold}`, marginBottom:12 }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:10, color:T.light, marginBottom:2 }}>Tồn hệ thống</div>
              <div style={{ fontSize:24, fontWeight:800, color:T.blue }}>{check.system_qty ?? '—'}</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', color:T.border, fontSize:18 }}>→</div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:10, color:T.light, marginBottom:2 }}>Tồn thực tế</div>
              <div style={{ fontSize:24, fontWeight:800,
                color:diff==null?T.light:diff===0?T.green:diff>0?T.blue:T.red }}>
                {val||'—'}
              </div>
            </div>
            {diff != null && (
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:10, color:T.light, marginBottom:2 }}>Chênh lệch</div>
                <div style={{ fontSize:24, fontWeight:800,
                  color:diff===0?T.green:diff>0?T.blue:T.red }}>
                  {diff>0?'+':''}{diff}
                </div>
              </div>
            )}
          </div>
          {/* Input */}
          <input ref={inputRef} type="number" value={val}
            onChange={e => setVal(e.target.value)}
            placeholder="Nhập tồn thực tế..."
            onKeyDown={e => e.key==='Enter' && handleConfirm()}
            style={{ width:'100%', padding:'13px', border:`2px solid ${val?T.gold:T.border}`,
              borderRadius:12, fontSize:20, fontFamily:'inherit', textAlign:'center',
              fontWeight:700, color:T.dark, background:'#fff',
              boxSizing:'border-box' as any, outline:'none', marginBottom:10 }}/>
          {/* Buttons */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:8 }}>
            <button onClick={() => onSkip(check.id)}
              style={{ padding:'12px', borderRadius:12, border:`1.5px solid ${T.border}`,
                background:'transparent', cursor:'pointer', fontFamily:'inherit',
                fontSize:13, color:T.med, fontWeight:600 }}>Bỏ qua</button>
            <button onClick={handleConfirm} disabled={val===''}
              style={{ padding:'12px', borderRadius:12, border:'none',
                background:val?T.green:'#ccc', cursor:val?'pointer':'default',
                fontFamily:'inherit', fontSize:14, color:'#fff', fontWeight:700 }}>
              ✓ Xác nhận
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MobileCheckInput({ session, myChecks, user, allUsers, products, onUpdate, onBack }: any) {
  const [activeId, setActiveId] = useState<string|null>(null)
  const [sortBy, setSortBy] = useState<'alpha'|'stock'>('alpha')
  const done = myChecks.filter((c: any) => c.actual_qty != null).length
  const pending = myChecks.filter((c: any) => c.actual_qty == null).length

  const sorted = [...myChecks].sort((a: any, b: any) => {
    if (sortBy === 'stock') return (b.system_qty||0) - (a.system_qty||0)
    return (a.product_name||'').localeCompare(b.product_name||'')
  })

  const handleConfirm = (id: string, upd: any) => {
    onUpdate(id, upd)
    // Auto-advance to next pending
    const nextPending = sorted.find((c: any) => c.id !== id && c.actual_qty == null && c.id !== activeId)
    setActiveId(nextPending?.id || null)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:T.bg }}>
      {/* Fixed header */}
      <div style={{ padding:'10px 14px', background:'#fff', borderBottom:`1px solid ${T.border}`,
        flexShrink:0, position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
          <button onClick={onBack}
            style={{ padding:'5px 12px', borderRadius:20, border:`1px solid ${T.border}`,
              background:'transparent', cursor:'pointer', fontSize:12, fontFamily:'inherit', color:T.med }}>
            ← Về
          </button>
          <div style={{ flex:1 }}>
            <div style={{ height:6, background:T.border, borderRadius:3 }}>
              <div style={{ height:'100%', borderRadius:3, background:T.green,
                width:`${myChecks.length>0?done*100/myChecks.length:0}%`, transition:'width .4s' }}/>
            </div>
          </div>
          <span style={{ fontSize:12, fontWeight:700, color:T.dark, flexShrink:0 }}>
            {done}/{myChecks.length}
          </span>
        </div>
        {/* Sort options */}
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <span style={{ fontSize:11, color:T.light }}>Sắp xếp:</span>
          {([['alpha','A → Z'],['stock','Tồn kho']] as [string,string][]).map(([val,label]) => (
            <button key={val} onClick={() => setSortBy(val as any)}
              style={{ padding:'4px 12px', borderRadius:20, cursor:'pointer',
                fontFamily:'inherit', fontSize:11,
                border:`1.5px solid ${sortBy===val?T.gold:T.border}`,
                background:sortBy===val?T.goldBg:'transparent',
                color:sortBy===val?T.goldText:T.med, fontWeight:sortBy===val?700:400 }}>
              {label}
            </button>
          ))}
          {pending > 0 && (
            <span style={{ marginLeft:'auto', fontSize:11, color:T.amber }}>
              ⏳ {pending} chưa KK
            </span>
          )}
        </div>
      </div>

      {/* Scrollable list */}
      <div style={{ flex:1, overflowY:'auto', background:'#fff' }}>
        {done === myChecks.length && (
          <div style={{ padding:'40px 24px', textAlign:'center' }}>
            <div style={{ fontSize:44, marginBottom:12 }}>🎉</div>
            <div style={{ fontSize:16, fontWeight:700, color:T.green, marginBottom:6 }}>Hoàn thành!</div>
            <div style={{ fontSize:13, color:T.med, marginBottom:20 }}>Đã kiểm kê {done} mã hàng</div>
            <button onClick={onBack}
              style={{ padding:'10px 24px', borderRadius:20, border:'none', background:T.gold,
                color:'#fff', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:700 }}>
              ← Quay lại danh sách
            </button>
          </div>
        )}
        {sorted.map((c: any, i: number) => (
          <CheckListRow key={c.id} check={c} idx={i} total={sorted.length}
            isActive={activeId === c.id}
            onSelect={(id: string) => setActiveId(prev => prev===id ? null : id)}
            onConfirm={handleConfirm}
            onSkip={(id: string) => {
              const next = sorted.find((x: any) => x.id !== id && x.actual_qty == null && x.id !== activeId)
              setActiveId(next?.id || null)
            }}/>
        ))}
      </div>
    </div>
  )
}

// ── Main InventoryModule ─────────────────────────────────
function InventoryModule({ user, allUsers, products, invSessions, setInvSessions, mobile }: any) {
  const [tab, setTab] = useState<'overview'|'sessions'|'check'|'discrepancy'>('overview')
  const [checks, setChecks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const [showExcluded, setShowExcluded] = useState(false)
  const [mobileCheck, setMobileCheck] = useState(false)
  const [excludedCodes, setExcludedCodes] = useState<Set<string>>(new Set())
  const [lastKvSync, setLastKvSync] = useState<string>('')
  const [kvSyncing, setKvSyncing] = useState(false)
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [newNote, setNewNote] = useState('')
  const [importing, setImporting] = useState(false)
  const [diffFilter, setDiffFilter] = useState<'all'|'neg'|'pos'>('all')
  const [monthFilter, setMonthFilter] = useState(() => {
    const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`
  })
  const p = mobile ? '16px' : '24px'
  const perm = getPerm(user)
  const canManage = perm.viewAllDashboard || (perm as any).manageInventory
  const isKhoNV   = user.dept_id === 'kho' && !canManage  // NV kho thường
  const canCheck  = user.dept_id === 'kho' || canManage

  const openSession = invSessions.find((s: any) => s.status === 'open')

  const [lastSync, setLastSync] = useState<Date|null>(null)
  const [syncing, setSyncing] = useState(false)

  const fetchData = async (quiet=false) => {
    if (!quiet) setSyncing(true)
    const [{data:s},{data:c}] = await Promise.all([
      db.from('inventory_sessions').select('*').order('date',{ascending:false}).limit(100),
      db.from('inventory_checks').select('*').order('created_at',{ascending:false}).limit(5000)
    ])
    setInvSessions(s||[])
    setChecks(c||[])
    setLastSync(new Date())
    // Load excluded + last sync
    db.from('kk_excluded_products').select('product_code')
      .then(({data:ex}) => { if(ex) setExcludedCodes(new Set(ex.map((x: any) => x.product_code))) })
    db.from('settings').select('last_kv_sync').eq('id','main').maybeSingle()
      .then(({data:st}) => { if(st?.last_kv_sync) setLastKvSync(st.last_kv_sync) })
    if (!quiet) { setSyncing(false); setLoading(false) }
    else setLoading(false)
  }

  useEffect(() => {
    fetchData()
    // Poll mỗi 10 giây khi có phiên đang mở
    const interval = setInterval(() => {
      const hasOpen = invSessions.some((s: any) => s.status==='open')
      if (hasOpen || tab==='check') fetchData(true)
    }, 10000)
    return () => clearInterval(interval)
  }, [invSessions.length, tab])

  const updateCheck = (id: string, upd: any) =>
    setChecks(prev => prev.map((c: any) => c.id===id ? {...c,...upd} : c))

  const syncKiotViet = async () => {
    setKvSyncing(true)
    try {
      const res = await fetch('https://uzloxzrqtzuucxlokqfm.supabase.co/functions/v1/kiotviet-sync', {
        method:'POST', headers:{'Authorization':'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bG94enJxdHp1dWN4bG9rcWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODAwOTYsImV4cCI6MjA5MTA1NjA5Nn0.INA68j0bmDb7kFtn4H3TiQmPzEqs67sKMsBhc--mvvo'}
      })
      const now = new Date().toISOString()
      await db.from('settings').update({last_kv_sync:now}).eq('id','main')
      setLastKvSync(now)
      // Reload products
      fetchData(true)
    } catch(e: any) { alert('Sync lỗi: ' + e.message) }
    setKvSyncing(false)
  }

  const createSession = async () => {
    if (!newDate) return
    const newS = { id:'sess_'+Date.now(), date:newDate, note:newNote, status:'open',
      total_assigned:0, total_checked:0, created_by:user.id, created_at:new Date().toISOString() }
    setInvSessions(prev => [newS, ...prev])
    await db.from('inventory_sessions').insert(newS)
    setShowCreate(false); setNewNote('')
  }

  const closeSession = async (sid: string) => {
    if (!confirm('Chốt phiên kiểm kê này? Sau khi chốt sẽ không thể nhập liệu thêm.')) return
    const upd = { status:'closed', closed_by:user.id, closed_at:new Date().toISOString() }
    setInvSessions(prev => prev.map((s: any) => s.id===sid ? {...s,...upd} : s))
    await db.from('inventory_sessions').update(upd).eq('id', sid)
  }

  // Import Excel (LichSu_KK format)
  const importExcel = async (file: File) => {
    setImporting(true)
    try {
      const xlsx = await import('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm' as any)
      const buf  = await file.arrayBuffer()
      const wb   = xlsx.read(buf, {type:'array'})
      const ws   = wb.Sheets['LichSu_KK'] || wb.Sheets[wb.SheetNames[0]]
      const rows: any[] = xlsx.utils.sheet_to_json(ws, {header:1, defval:''})
      // Find header row
      const hIdx = rows.findIndex((r: any[]) => r.some((c: any) => String(c).includes('Ngày KK')))
      if (hIdx<0) { alert('Không tìm thấy sheet LichSu_KK đúng format'); setImporting(false); return }
      const headers = rows[hIdx].map((h: any) => String(h).trim())
      const colNgay  = headers.findIndex((h: string) => h.includes('Ngày KK'))
      const colMa    = headers.findIndex((h: string) => h.includes('Mã SP'))
      const colTen   = headers.findIndex((h: string) => h.includes('Tên SP'))
      const colHT    = headers.findIndex((h: string) => h.includes('Hệ Thống'))
      const colTT    = headers.findIndex((h: string) => h.includes('Thực Tế'))
      const colCL    = headers.findIndex((h: string) => h.includes('Chênh'))
      const colNV    = headers.findIndex((h: string) => h.includes('Người'))
      // Group by date
      const byDate: Record<string, any[]> = {}
      rows.slice(hIdx+1).forEach((r: any[]) => {
        const ma = String(r[colMa]||'').trim()
        if (!ma) return
        const rawDate = r[colNgay]
        let dateStr = ''
        if (rawDate instanceof Date) dateStr = rawDate.toISOString().split('T')[0]
        else if (typeof rawDate === 'number') {
          const d = new Date(Math.round((rawDate - 25569) * 86400 * 1000))
          dateStr = d.toISOString().split('T')[0]
        } else dateStr = String(rawDate).split('T')[0] || String(rawDate).split(' ')[0]
        if (!byDate[dateStr]) byDate[dateStr] = []
        byDate[dateStr].push({
          product_code: ma, product_name: String(r[colTen]||'').trim(),
          system_qty:   Number(r[colHT])||0, actual_qty: Number(r[colTT])||0,
          diff:         Number(r[colCL])||0,
          checked_by_name: String(r[colNV]||'Admin').trim()
        })
      })
      // Create sessions + checks
      let created = 0
      for (const [dateStr, items] of Object.entries(byDate)) {
        const existing = invSessions.find((s: any) => s.date===dateStr)
        let sessId = existing?.id
        if (!sessId) {
          sessId = 'sess_import_'+dateStr.replace(/-/g,'')
          const newS = { id:sessId, date:dateStr, note:'Import từ Excel', status:'closed',
            total_assigned:items.length, total_checked:items.length,
            created_by:user.id, created_at:new Date().toISOString(),
            closed_at:new Date().toISOString() }
          await db.from('inventory_sessions').upsert(newS)
          setInvSessions(prev => [...prev.filter((s: any) => s.id!==sessId), newS])
        }
        const newChecks = items.map((item: any, i: number) => ({
          id: `chk_${sessId}_${i}_${Date.now()}`,
          session_id: sessId, product_code: item.product_code,
          product_name: item.product_name, system_qty: item.system_qty,
          actual_qty: item.actual_qty, diff: item.diff,
          base_price: products.find((p: any) => p.code===item.product_code)?.base_price || 0,
          assigned_to: user.id, status: item.diff!==0?'discrepancy':'checked',
          diff_status: '', diff_note: '', checked_at: dateStr, created_at: new Date().toISOString()
        }))
        await db.from('inventory_checks').upsert(newChecks)
        setChecks(prev => [...prev.filter((c: any) => c.session_id!==sessId), ...newChecks])
        created += items.length
      }
      alert(`✅ Import thành công ${created} bản ghi từ ${Object.keys(byDate).length} đợt kiểm kê`)
    } catch(e: any) { alert('❌ Lỗi import: ' + e.message) }
    setImporting(false)
  }

  // Stats
  const totalProducts = products.length
  const checkedCodes  = new Set(checks.map((c: any) => c.product_code)).size
  const discrepancies = checks.filter((c: any) => c.status==='discrepancy' && c.diff_status==='')
  const myChecks      = openSession ? checks.filter((c: any) => c.session_id===openSession.id && c.assigned_to===user.id) : []

  const [fy, fm] = monthFilter.split('-').map(Number)
  const monthChecks = checks.filter((c: any) => {
    const sid = invSessions.find((s: any) => s.id===c.session_id)
    if (!sid) return false
    const d = new Date(sid.date)
    return d.getFullYear()===fy && d.getMonth()+1===fm
  })

  const exportKKForm = async (items: any[]) => {
    try {
      const xlsx = await import('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm' as any)
      const wb = xlsx.utils.book_new()
      const rows = [
        ['STT','Mã SP','Tên Sản Phẩm','ĐVT','Tồn Hệ Thống','Tồn Thực Tế','Chênh Lệch','Người Kiểm Kê','Ghi Chú'],
        ...items.map((p: any, i: number) => [i+1, p.code, p.name, p.unit||'', p.stock, '', '', '', ''])
      ]
      const ws = xlsx.utils.aoa_to_sheet(rows)
      ws['!cols'] = [{wch:5},{wch:14},{wch:50},{wch:8},{wch:14},{wch:14},{wch:12},{wch:16},{wch:20}]
      xlsx.utils.book_append_sheet(wb, ws, 'Phieu_KiemKe')
      xlsx.writeFile(wb, `PhieuKiemKe_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch(e: any) { alert('❌ Lỗi export: ' + e.message) }
  }

  // NV kho mặc định vào tab Nhập liệu
  useEffect(() => {
    if (!canManage && tab === 'overview') setTab('check')
  }, [canManage])

  if (loading) return <div style={{padding:p,textAlign:'center',color:T.light,paddingTop:40}}>⏳ Đang tải dữ liệu...</div>

  // Mobile check mode
  if (mobileCheck && openSession && myChecks.length > 0) return (
    <MobileCheckInput session={openSession} myChecks={myChecks} user={user}
      allUsers={allUsers} products={products}
      onUpdate={updateCheck} onBack={() => setMobileCheck(false)}/>
  )

  const TABS = [
    ...(canManage ? [
      {id:'overview',    label:'📊 Tổng quan'},
      {id:'sessions',    label:'📋 Phiên KK'},
    ] : []),
    {id:'check',         label:`✅ Nhập liệu${openSession?` (${myChecks.filter((c: any)=>c.actual_qty==null).length})`:''}`},
    {id:'discrepancy',   label:`⚠️ Lệch kho${discrepancies.length?` (${discrepancies.length})`:''}`},
    {id:'monthly',       label:'📈 Cuối tháng'},
  ]

  return (
    <div style={{padding:`0 ${p} ${mobile?'80px':p}`}}>
      <Topbar mobile={mobile} title="📦 Kiểm kê kho"
        subtitle={openSession ? `📂 Phiên ${openSession.date} đang mở` : 'Quản lý kiểm kê hàng hóa'}
        action={
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            {lastSync && (
              <span style={{fontSize:10,color:T.light}}>
                {syncing?'🔄 Đang sync...':'✓ '+lastSync.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
              </span>
            )}
            <button onClick={() => fetchData()}
              style={{padding:'5px 12px',borderRadius:20,border:`1px solid ${T.border}`,
                background:'transparent',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:T.med}}>
              🔄 Refresh
            </button>
            {canManage && (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1}}>
                <button onClick={syncKiotViet} disabled={kvSyncing}
                  style={{padding:'5px 12px',borderRadius:20,border:`1.5px solid ${T.green}`,
                    background:T.greenBg,cursor:'pointer',fontSize:11,fontFamily:'inherit',
                    color:T.green,fontWeight:600}}>
                  {kvSyncing?'⏳ Syncing...':'🔄 Sync KiotViet'}
                </button>
                {lastKvSync && <span style={{fontSize:9,color:T.light}}>
                  {new Date(lastKvSync).toLocaleString('vi-VN',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'})}
                </span>}
              </div>
            )}
            {canManage && <GoldBtn small onClick={() => setShowWizard(true)}>+ Tạo phiên KK</GoldBtn>}
          </div>
        }/>

      {/* Tabs */}
      <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{padding:'6px 14px',borderRadius:8,cursor:'pointer',fontFamily:'inherit',fontSize:12,
              border:`1.5px solid ${tab===t.id?T.gold:T.border}`,
              background:tab===t.id?T.goldBg:'transparent',
              color:tab===t.id?T.goldText:T.med,fontWeight:tab===t.id?700:400}}>{t.label}</button>
        ))}
      </div>

      {/* ── TAB: TỔNG QUAN ── */}
      {tab==='overview' && (
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {/* 4 cards */}
          <div style={{display:'grid',gridTemplateColumns:mobile?'1fr 1fr':'repeat(4,1fr)',gap:12}}>
            {[
              ['📦 Tổng SP',        totalProducts,                    T.dark],
              ['✅ Đã kiểm kê',     checkedCodes,                     T.green],
              ['❌ Chưa kiểm kê',   totalProducts-checkedCodes,       T.amber],
              ['⚠️ Đang lệch',      discrepancies.length,             T.red],
            ].map(([label,val,color]) => (
              <Card key={label as string} style={{textAlign:'center',padding:'14px 12px'}}>
                <div style={{fontSize:26,fontWeight:800,color:color as string}}>{val as number}</div>
                <div style={{fontSize:11,color:T.light,marginTop:4}}>{label}</div>
              </Card>
            ))}
          </div>
          {/* Progress */}
          <Card>
            <div style={{fontSize:13,fontWeight:700,color:T.dark,marginBottom:10}}>
              Tiến độ kiểm kê tổng thể
            </div>
            <div style={{height:10,background:T.border,borderRadius:5,marginBottom:8}}>
              <div style={{height:'100%',borderRadius:5,background:`linear-gradient(90deg,${T.green},${T.teal})`,
                width:`${totalProducts>0?checkedCodes*100/totalProducts:0}%`,transition:'width .5s'}}/>
            </div>
            <div style={{fontSize:12,color:T.light}}>
              {checkedCodes}/{totalProducts} mã ({totalProducts>0?Math.round(checkedCodes*100/totalProducts):0}%)
            </div>
          </Card>
          {/* Recent sessions */}
          <Card>
            <div style={{fontSize:13,fontWeight:700,color:T.dark,marginBottom:12}}>Các đợt KK gần đây</div>
            {invSessions.slice(0,5).map((s: any, i: number) => {
              const sChecks = checks.filter((c: any) => c.session_id===s.id)
              const sLech   = sChecks.filter((c: any) => c.diff!=null && c.diff!==0).length
              return (
                <div key={s.id} style={{display:'flex',alignItems:'center',gap:12,
                  padding:'8px 0',borderBottom:i<4?`1px solid ${T.border}`:'none'}}>
                  <div style={{flex:1}}>
                    <span style={{fontSize:12,fontWeight:600,color:T.dark}}>{s.date}</span>
                    {s.note && <span style={{fontSize:11,color:T.light,marginLeft:8}}>{s.note}</span>}
                  </div>
                  <span style={{fontSize:11,color:T.blue}}>{sChecks.length} SP</span>
                  {sLech>0 && <span style={{fontSize:11,color:T.red}}>⚠️ {sLech} lệch</span>}
                  <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,
                    background:s.status==='open'?T.greenBg:T.grayBg,
                    color:s.status==='open'?T.green:T.gray}}>{s.status==='open'?'Đang mở':'Đã chốt'}</span>
                </div>
              )
            })}
          </Card>
          {/* Top discrepancies */}
          {discrepancies.length>0 && (
            <Card>
              <div style={{fontSize:13,fontWeight:700,color:T.red,marginBottom:12}}>
                ⚠️ Mã lệch kho chưa xử lý (top {Math.min(10,discrepancies.length)})
              </div>
              {discrepancies.slice(0,10).sort((a: any,b: any)=>Math.abs(b.diff)-Math.abs(a.diff)).map((c: any,i: number) => (
                <div key={c.id} style={{display:'flex',alignItems:'center',gap:12,
                  padding:'7px 0',borderBottom:i<9?`1px solid ${T.border}`:'none'}}>
                  <div style={{flex:1,fontSize:12,color:T.dark}}>{c.product_name}</div>
                  <span style={{fontSize:11,color:T.light}}>{c.product_code}</span>
                  <span style={{fontSize:13,fontWeight:700,color:c.diff>0?T.blue:T.red}}>
                    {c.diff>0?'+':''}{c.diff}
                  </span>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* ── TAB: PHIÊN KK ── */}
      {tab==='sessions' && (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {/* Gợi ý + Export + Assign */}
          {canManage && openSession && (
            <Card style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:T.dark}}>Phiên đang mở: {openSession.date}</div>
                <div style={{fontSize:11,color:T.light}}>
                  {checks.filter((c: any)=>c.session_id===openSession.id).length} mã đã được phân · Bấm để phân chia thêm
                </div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={async () => {
                  const toExport = products.filter((p: any) => p.stock>0).slice(0,150)
                  exportKKForm(toExport)
                }}
                  style={{padding:'7px 14px',borderRadius:20,border:`1.5px solid ${T.border}`,
                    background:'transparent',cursor:'pointer',fontSize:12,fontFamily:'inherit',color:T.med}}>
                  📄 Xuất phiếu KK
                </button>
                <GoldBtn small onClick={() => setShowAssign(true)}>👥 Phân chia mã</GoldBtn>
              </div>
            </Card>
          )}

          {/* Import Excel */}
          <Card>
            <div style={{fontSize:13,fontWeight:700,color:T.dark,marginBottom:8}}>📥 Import từ Excel</div>
            <div style={{fontSize:11,color:T.med,marginBottom:10}}>
              Chọn file Excel (sheet LichSu_KK) để import lịch sử kiểm kê. Hệ thống sẽ tự tạo phiên theo ngày.
            </div>
            <label style={{display:'inline-block',padding:'8px 16px',borderRadius:20,
              border:`2px dashed ${T.border}`,cursor:'pointer',fontSize:12,color:T.med,
              background:T.bg,transition:'all .2s'}}
              onMouseEnter={e => (e.currentTarget as any).style.borderColor=T.gold}
              onMouseLeave={e => (e.currentTarget as any).style.borderColor=T.border}>
              {importing ? '⏳ Đang import...' : '📂 Chọn file Excel (.xlsx)'}
              <input type="file" accept=".xlsx,.xls" style={{display:'none'}}
                onChange={e => e.target.files?.[0] && importExcel(e.target.files[0])}
                disabled={importing}/>
            </label>
          </Card>

          {/* Session list */}
          <div style={{background:T.card,borderRadius:12,border:`1px solid ${T.border}`,overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
            {!mobile && (
              <div style={{display:'grid',gridTemplateColumns:'100px 1fr 70px 70px 80px 110px 120px',
                padding:'8px 12px',background:T.bg,borderBottom:`2px solid ${T.border}`,
                fontSize:10,fontWeight:700,color:T.light,textTransform:'uppercase',letterSpacing:.5,gap:8}}>
                <span>Ngày KK</span><span>Ghi chú</span>
                <span style={{textAlign:'center'}}>SP KK</span>
                <span style={{textAlign:'center'}}>SP lệch</span>
                <span>Trạng thái</span>
                <span>Người tạo</span>
                <span style={{textAlign:'right'}}>Thao tác</span>
              </div>
            )}
            {invSessions.length===0
              ? <div style={{padding:'32px',textAlign:'center',color:T.light}}>Chưa có phiên kiểm kê nào</div>
              : invSessions.map((s: any, i: number) => {
                  const sChecks = checks.filter((c: any) => c.session_id===s.id)
                  const sLech   = sChecks.filter((c: any) => c.diff!=null && c.diff!==0).length
                  const creator = allUsers.find((u: any) => u.id===s.created_by)
                  return (
                    <div key={s.id} style={{display:mobile?'block':'grid',
                      gridTemplateColumns:'100px 1fr 70px 70px 80px 110px 120px',
                      padding:'10px 12px',gap:8,alignItems:'center',
                      borderBottom:i<invSessions.length-1?`1px solid ${T.border}`:'none',
                      background:i%2===0?'#fff':T.rowAlt}}>
                      <span style={{fontSize:12,fontWeight:700,color:T.dark}}>{s.date}</span>
                      <span style={{fontSize:11,color:T.med}}>{s.note||'—'}</span>
                      <span style={{fontSize:12,textAlign:'center',color:T.blue}}>{sChecks.length}</span>
                      <span style={{fontSize:12,textAlign:'center',color:sLech>0?T.red:T.green,fontWeight:sLech>0?700:400}}>
                        {sLech>0?sLech:'✓'}
                      </span>
                      <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,
                        background:s.status==='open'?T.greenBg:T.grayBg,
                        color:s.status==='open'?T.green:T.gray}}>
                        {s.status==='open'?'🟢 Đang mở':'⚫ Đã chốt'}
                      </span>
                      <span style={{fontSize:11,color:T.med}}>{creator?.name||'Admin'}</span>
                      <div style={{display:'flex',gap:5,justifyContent:'flex-end'}}>
                        {s.status==='open' && canManage && (
                          <button onClick={() => closeSession(s.id)}
                            style={{padding:'3px 10px',borderRadius:20,border:`1.5px solid ${T.amber}`,
                              background:T.amberBg,cursor:'pointer',fontSize:10,fontFamily:'inherit',
                              color:T.amber,fontWeight:700}}>Chốt phiên</button>
                        )}
                        {perm.viewAllDashboard && (
                          <button onClick={async () => {
                            if (!confirm('Xóa phiên này và toàn bộ dữ liệu KK?')) return
                            await db.from('inventory_checks').delete().eq('session_id',s.id)
                            await db.from('inventory_sessions').delete().eq('id',s.id)
                            setInvSessions(prev => prev.filter((x: any) => x.id!==s.id))
                            setChecks(prev => prev.filter((c: any) => c.session_id!==s.id))
                          }}
                            style={{padding:'3px 8px',borderRadius:20,border:`1px solid ${T.redBg}`,
                              background:T.redBg,cursor:'pointer',fontSize:10,fontFamily:'inherit',color:T.red}}>✕</button>
                        )}
                      </div>
                    </div>
                  )
              })
            }
          </div>
        </div>
      )}

      {/* ── TAB: NHẬP LIỆU ── */}
      {tab==='check' && (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {!openSession ? (
            <Card style={{textAlign:'center',padding:'40px'}}>
              <div style={{fontSize:32,marginBottom:8}}>📋</div>
              <div style={{fontSize:13,color:T.light,marginBottom:16}}>Không có phiên kiểm kê nào đang mở</div>
              {canManage && <GoldBtn small onClick={() => setShowCreate(true)}>+ Tạo phiên KK mới</GoldBtn>}
            </Card>
          ) : (
            <>
              {/* QM Monitor View OR NV own list */}
              {canManage ? (
                <InvMonitorView session={openSession} checks={checks}
                  allUsers={allUsers} user={user} products={products}
                  onStartMobile={() => setMobileCheck(true)} myChecks={myChecks}/>
              ) : (
                <Card style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:T.dark}}>Phiên {openSession.date}</div>
                    <div style={{fontSize:11,color:T.light}}>
                      {myChecks.length} mã · {myChecks.filter((c: any)=>c.actual_qty!=null).length} đã KK
                    </div>
                  </div>
                  {myChecks.filter((c: any)=>c.actual_qty==null).length > 0 && (
                    <GoldBtn small onClick={() => setMobileCheck(true)}>
                      📱 Bắt đầu KK ({myChecks.filter((c: any)=>c.actual_qty==null).length} mã)
                    </GoldBtn>
                  )}
                </Card>
              )}

              {/* Check table */}
              {myChecks.length === 0 ? (
                <Card style={{textAlign:'center',padding:'32px',color:T.light}}>
                  Chưa có mã nào được phân cho bạn trong phiên này
                </Card>
              ) : (
                <div style={{background:T.card,borderRadius:12,border:`1px solid ${T.border}`,overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
                  {!mobile && (
                    <div style={{display:'grid',gridTemplateColumns:'1fr 70px 70px 80px 100px 80px',
                      padding:'8px 12px',background:T.bg,borderBottom:`2px solid ${T.border}`,
                      fontSize:10,fontWeight:700,color:T.light,textTransform:'uppercase',letterSpacing:.5,gap:8}}>
                      <span>Sản phẩm</span>
                      <span style={{textAlign:'center'}}>Tồn HT</span>
                      <span style={{textAlign:'center'}}>Tồn TT</span>
                      <span style={{textAlign:'center'}}>Chênh lệch</span>
                      <span style={{textAlign:'center'}}>Trạng thái</span>
                      <span style={{textAlign:'right'}}>Thao tác</span>
                    </div>
                  )}
                  {myChecks.map((c: any, i: number) => (
                    <InvCheckRow key={c.id} check={c} products={products} allUsers={allUsers}
                      canEdit={canCheck} onUpdate={updateCheck} idx={i} total={myChecks.length}/>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── TAB: LỆCH KHO ── */}
      {tab==='discrepancy' && (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {/* Filter bar */}
          {/* Time range filter */}
          {(() => {
            const now = new Date()
            const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
            const lastMonthDate = new Date(now.getFullYear(), now.getMonth()-1, 1)
            const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth()+1).padStart(2,'0')}`
            return (
              <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                {[
                  {label:'Tháng này', val:thisMonth},
                  {label:'Tháng trước', val:lastMonth},
                ].map(opt => (
                  <button key={opt.val} onClick={() => setMonthFilter(opt.val)}
                    style={{padding:'6px 14px',borderRadius:20,cursor:'pointer',fontFamily:'inherit',fontSize:12,
                      border:`1.5px solid ${monthFilter===opt.val?T.gold:T.border}`,
                      background:monthFilter===opt.val?T.goldBg:'transparent',
                      color:monthFilter===opt.val?T.goldText:T.med,fontWeight:monthFilter===opt.val?700:400}}>
                    {opt.label}
                  </button>
                ))}
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontSize:11,color:T.light}}>Tùy chọn:</span>
                  <input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
                    style={{padding:'5px 9px',border:`1px solid ${T.border}`,borderRadius:8,
                      fontSize:12,fontFamily:'inherit',color:T.dark,background:T.bg}}/>
                </div>
                <div style={{marginLeft:'auto',display:'flex',gap:6}}>
                  {(['all','neg','pos'] as const).map(f => (
                    <button key={f} onClick={() => setDiffFilter(f)}
                      style={{padding:'5px 12px',borderRadius:20,cursor:'pointer',fontFamily:'inherit',fontSize:11,
                        border:`1.5px solid ${diffFilter===f?T.gold:T.border}`,
                        background:diffFilter===f?T.goldBg:'transparent',
                        color:diffFilter===f?T.goldText:T.med}}>
                      {f==='all'?'Tất cả':f==='neg'?'Lệch âm':'Lệch dương'}
                    </button>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Discrepancy table */}
          <div style={{background:T.card,borderRadius:12,border:`1px solid ${T.border}`,overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
            {!mobile && (
              <div style={{display:'grid',gridTemplateColumns:'100px 1fr 90px 70px 70px 70px 150px 100px',
                padding:'8px 12px',background:T.bg,borderBottom:`2px solid ${T.border}`,
                fontSize:10,fontWeight:700,color:T.light,textTransform:'uppercase',letterSpacing:.5,gap:8}}>
                <span>Ngày KK</span><span>Sản phẩm</span><span>Mã SP</span>
                <span style={{textAlign:'center'}}>Tồn HT</span>
                <span style={{textAlign:'center'}}>Tồn TT</span>
                <span style={{textAlign:'center'}}>Chênh lệch</span>
                <span>Trạng thái xử lý</span>
                <span style={{textAlign:'right'}}>Thao tác</span>
              </div>
            )}
            {(() => {
              const filtered = monthChecks.filter((c: any) => {
                if (c.diff==null || c.diff===0) return false
                if (diffFilter==='neg' && c.diff>=0) return false
                if (diffFilter==='pos' && c.diff<=0) return false
                return true
              }).sort((a: any,b: any) => Math.abs(b.diff)-Math.abs(a.diff))

              if (filtered.length===0) return (
                <div style={{padding:'32px',textAlign:'center',color:T.light}}>
                  <div style={{fontSize:28,marginBottom:8}}>✅</div>
                  <div style={{fontSize:13}}>Không có mã nào lệch trong tháng này</div>
                </div>
              )

              return filtered.map((c: any, i: number) => {
                const sess = invSessions.find((s: any) => s.id===c.session_id)
                const DIFF_STATUS_CFG: any = {
                  '':            {label:'⏳ Chưa xử lý',     color:T.red,    bg:T.redBg   },
                  'found':       {label:'✅ Tìm được hàng',   color:T.green,  bg:T.greenBg },
                  'reason':      {label:'🔍 Tìm được NN',     color:T.blue,   bg:T.blueBg  },
                  'no_reason':   {label:'❌ Không tìm được',  color:T.red,    bg:T.redBg   },
                  'resolved':    {label:'✔️ Đã xử lý',         color:'#7C3AED', bg:'#EDE9FE' },
                }
                const dsc = DIFF_STATUS_CFG[c.diff_status||''] || DIFF_STATUS_CFG['']
                return (
                  <div key={c.id} style={{display:mobile?'block':'grid',
                    gridTemplateColumns:'100px 1fr 90px 70px 70px 70px 150px 100px',
                    padding:'9px 12px',gap:8,alignItems:'center',
                    borderBottom:i<filtered.length-1?`1px solid ${T.border}`:'none',
                    background:c.diff_status===''?(i%2===0?'#FFF5F5':'#FFF0F0'):(i%2===0?'#fff':T.rowAlt)}}>
                    <span style={{fontSize:11,color:T.light}}>{sess?.date||'—'}</span>
                    <div>
                      <div style={{fontSize:12,fontWeight:500,color:T.dark}}>{c.product_name}</div>
                    </div>
                    <span style={{fontSize:10,color:T.light}}>{c.product_code}</span>
                    <span style={{fontSize:12,textAlign:'center',color:T.med}}>{c.system_qty}</span>
                    <span style={{fontSize:12,textAlign:'center',color:T.dark,fontWeight:600}}>{c.actual_qty}</span>
                    <span style={{fontSize:13,textAlign:'center',fontWeight:800,
                      color:c.diff>0?T.blue:T.red}}>{c.diff>0?'+':''}{c.diff}</span>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontSize:10,padding:'2px 7px',borderRadius:20,
                        color:dsc.color,background:dsc.bg,whiteSpace:'nowrap'}}>{dsc.label}</span>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:3,alignItems:'flex-end'}}>
                      {canManage ? (
                        <select value={c.diff_status||''} onChange={async e => {
                          const val = e.target.value
                          const now = new Date().toISOString()
                          const upd: any = {diff_status:val}
                          if (val) { upd.resolved_by = user.id; upd.resolved_at = now }
                          await db.from('inventory_checks').update(upd).eq('id',c.id)
                          updateCheck(c.id, upd)
                        }}
                          style={{padding:'3px 6px',borderRadius:8,border:`1px solid ${T.border}`,
                            fontSize:10,fontFamily:'inherit',color:T.dark,background:T.bg,cursor:'pointer'}}>
                          <option value="">⏳ Chưa XL</option>
                          <option value="found">✅ Tìm được hàng</option>
                          <option value="reason">🔍 Tìm được NN</option>
                          <option value="no_reason">❌ Không tìm được</option>
                          <option value="resolved">✔️ Đã xử lý</option>
                        </select>
                      ) : (
                        <span style={{fontSize:10,padding:'2px 7px',borderRadius:20,
                          color:dsc.color,background:dsc.bg,whiteSpace:'nowrap'}}>{dsc.label}</span>
                      )}
                      {c.diff_status && c.resolved_by && (
                        <div style={{fontSize:9,color:T.light,textAlign:'right',lineHeight:1.3}}>
                          {allUsers.find((u: any)=>u.id===c.resolved_by)?.name||'?'}
                          {c.resolved_at&&<> · {new Date(c.resolved_at).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit'})}</>}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      )}

      {/* ── TAB: CUỐI THÁNG ── */}
      {tab==='monthly' && (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:4}}>
            <input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
              style={{padding:'6px 10px',border:`1px solid ${T.border}`,borderRadius:8,
                fontSize:12,fontFamily:'inherit',color:T.dark,background:T.bg}}/>
            <span style={{fontSize:12,color:T.light}}>Chỉ tính mã có trạng thái "Không tìm được nguyên nhân"</span>
          </div>
          {(() => {
            const noReason = monthChecks.filter((c: any) => c.diff_status==='no_reason' && c.diff!=null && c.diff!==0)
            const totalCost = noReason.reduce((s: number, c: any) => {
              const price = c.price_override ?? c.base_price ?? 0
              return s + Math.abs(c.diff||0) * price
            }, 0)
            return (
              <>
                {/* Summary cards */}
                <div style={{display:'grid',gridTemplateColumns:mobile?'1fr 1fr':'repeat(3,1fr)',gap:12}}>
                  {[
                    ['📦 SP không tìm được NN', noReason.length, T.red],
                    ['💰 Tổng tiền mất ước tính', totalCost.toLocaleString('vi-VN')+'đ', T.amber],
                    ['👥 Số NV phòng Kho', allUsers.filter((u: any)=>u.dept_id==='kho').length, T.blue],
                  ].map(([label,val,color]) => (
                    <Card key={label as string} style={{textAlign:'center',padding:'14px 12px'}}>
                      <div style={{fontSize:20,fontWeight:800,color:color as string}}>{val}</div>
                      <div style={{fontSize:11,color:T.light,marginTop:4}}>{label}</div>
                    </Card>
                  ))}
                </div>
                {/* Per-person cost */}
                {noReason.length>0 && (
                  <Card style={{padding:'12px 16px'}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.dark,marginBottom:6}}>
                      💸 Mỗi NV Kho chịu trách nhiệm (chia đều):
                    </div>
                    <div style={{fontSize:22,fontWeight:800,color:T.red}}>
                      {allUsers.filter((u: any)=>u.dept_id==='kho').length>0
                        ? Math.round(totalCost/allUsers.filter((u: any)=>u.dept_id==='kho').length).toLocaleString('vi-VN')+'đ'
                        : '—'}
                    </div>
                  </Card>
                )}
                {/* Detail table */}
                <div style={{background:T.card,borderRadius:12,border:`1px solid ${T.border}`,overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
                  {!mobile && (
                    <div style={{display:'grid',gridTemplateColumns:'100px 1fr 90px 60px 60px 80px 110px 120px',
                      padding:'8px 12px',background:T.bg,borderBottom:`2px solid ${T.border}`,
                      fontSize:10,fontWeight:700,color:T.light,textTransform:'uppercase',letterSpacing:.5,gap:8}}>
                      <span>Ngày KK</span><span>Sản phẩm</span><span>Mã SP</span>
                      <span style={{textAlign:'center'}}>Lệch</span>
                      <span style={{textAlign:'center'}}>Giá vốn</span>
                      <span style={{textAlign:'right'}}>Tiền mất</span>
                      <span>Override giá</span>
                      <span style={{textAlign:'center'}}>Người KK</span>
                    </div>
                  )}
                  {noReason.length===0
                    ? <div style={{padding:'32px',textAlign:'center',color:T.green,fontSize:13}}>
                        ✅ Không có mã nào ở trạng thái "Không tìm được nguyên nhân"
                      </div>
                    : noReason.map((c: any, i: number) => {
                        const sess     = invSessions.find((s: any) => s.id===c.session_id)
                        const price    = c.price_override ?? c.base_price ?? 0
                        const lostVal  = Math.abs(c.diff||0) * price
                        const checker  = allUsers.find((u: any) => u.id===c.assigned_to)
                        return (
                          <div key={c.id} style={{display:mobile?'block':'grid',
                            gridTemplateColumns:'100px 1fr 90px 60px 60px 80px 110px 120px',
                            padding:'9px 12px',gap:8,alignItems:'center',
                            borderBottom:i<noReason.length-1?`1px solid ${T.border}`:'none',
                            background:i%2===0?'#fff':T.rowAlt}}>
                            <span style={{fontSize:11,color:T.light}}>{sess?.date||'—'}</span>
                            <span style={{fontSize:12,fontWeight:500,color:T.dark}}>{c.product_name}</span>
                            <span style={{fontSize:10,color:T.light}}>{c.product_code}</span>
                            <span style={{fontSize:13,fontWeight:800,textAlign:'center',
                              color:c.diff>0?T.blue:T.red}}>{c.diff>0?'+':''}{c.diff}</span>
                            <span style={{fontSize:11,textAlign:'center',color:T.med}}>
                              {(c.base_price||0).toLocaleString()}đ
                            </span>
                            <span style={{fontSize:12,fontWeight:700,textAlign:'right',color:T.red}}>
                              {lostVal>0?lostVal.toLocaleString('vi-VN')+'đ':'—'}
                            </span>
                            {/* Override giá — admin only */}
                            <div>
                              {perm.viewAllDashboard ? (
                                <input type="number" defaultValue={c.price_override||''}
                                  placeholder={String(c.base_price||0)}
                                  onBlur={async e => {
                                    const v = e.target.value ? Number(e.target.value) : null
                                    await db.from('inventory_checks').update({price_override:v}).eq('id',c.id)
                                    updateCheck(c.id, {price_override:v})
                                  }}
                                  style={{width:'100%',padding:'4px 7px',border:`1px solid ${T.border}`,
                                    borderRadius:7,fontSize:11,fontFamily:'inherit',color:T.dark,background:'#fff'}}/>
                              ) : (
                                <span style={{fontSize:11,color:c.price_override?T.blue:T.light}}>
                                  {c.price_override?c.price_override.toLocaleString()+'đ':'—'}
                                </span>
                              )}
                            </div>
                            <span style={{fontSize:11,textAlign:'center',color:T.med}}>{checker?.name||'—'}</span>
                          </div>
                        )
                      })
                  }
                  {noReason.length>0 && (
                    <div style={{padding:'10px 12px',background:T.redBg,borderTop:`2px solid ${T.red}`,
                      display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:13,fontWeight:700,color:T.red}}>TỔNG TIỀN MẤT THÁNG {fm}/{fy}</span>
                      <span style={{fontSize:16,fontWeight:800,color:T.red}}>
                        {totalCost.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  )}
                </div>
              </>
            )
          })()}
        </div>
      )}

      {/* ── Modal phân chia mã ── */}
      {showAssign && openSession && (
        <AssignModal session={openSession} products={products} allUsers={allUsers}
          user={user} checks={checks} onAssigned={(newChecks: any[]) => {
            setChecks(prev => [...prev, ...newChecks])
            setInvSessions(prev => prev.map((s: any) => s.id===openSession.id
              ? {...s, total_assigned:(s.total_assigned||0)+newChecks.length} : s))
          }} onClose={() => setShowAssign(false)}/>
      )}

      {/* ── Wizard tạo phiên ── */}
      {showWizard && (
        <SessionCreateWizard products={products} checks={checks} allUsers={allUsers}
          user={user} excludedCodes={excludedCodes}
          onCreated={(newS: any, newChecks: any[]) => {
            setInvSessions(prev => [newS, ...prev])
            setChecks(prev => [...prev, ...newChecks])
            setShowWizard(false)
          }}
          onClose={() => setShowWizard(false)}/>
      )}
    </div>
  )
}

// ── AssignModal — phân chia mã KK cho NV ────────────────
function AssignModal({ session, products, allUsers, user, checks, onAssigned, onClose }: any) {
  const khoUsers = allUsers.filter((u: any) => u.dept_id==='kho')
  const [selectedNVs, setSelectedNVs] = useState<string[]>([])
  const [targetCount, setTargetCount] = useState(150)
  const [step, setStep] = useState<'select_nv'|'preview'>('select_nv')

  const existingCodes = new Set(
    checks.filter((c: any) => c.session_id===session.id).map((c: any) => c.product_code)
  )
  const checkedHistory = new Set(checks.map((c: any) => c.product_code))

  // Generate suggested product list: ưu tiên chưa KK, chia 3 nhóm tồn
  const available = products.filter((p: any) =>
    p.stock > 0 && p.active && !existingCodes.has(p.code)
  ).sort((a: any, b: any) => {
    const aNew = !checkedHistory.has(a.code)
    const bNew = !checkedHistory.has(b.code)
    if (aNew && !bNew) return -1
    if (!aNew && bNew) return 1
    return 0
  })

  const highStock = available.filter((p: any) => p.stock >= 100)
  const midStock  = available.filter((p: any) => p.stock >= 20 && p.stock < 100)
  const lowStock  = available.filter((p: any) => p.stock > 0 && p.stock < 20)

  const each = Math.floor(targetCount / 3)
  const selected3 = [
    ...highStock.slice(0, each).map((p: any) => ({...p, _group:'Tồn nhiều (≥100)'})),
    ...midStock.slice(0,  each).map((p: any) => ({...p, _group:'Tồn vừa (20-99)'})),
    ...lowStock.slice(0, targetCount - each*2).map((p: any) => ({...p, _group:'Tồn ít (<20)'})),
  ]

  // Assign algorithm: interleave across NVs
  const buildAssignment = () => {
    if (selectedNVs.length === 0) return []
    const shuffled = [...selected3]
    // Distribute round-robin across NVs
    return shuffled.map((prod, idx) => {
      const nvId = selectedNVs[idx % selectedNVs.length]
      return {
        id: `chk_${session.id}_${prod.code}_${Date.now()}_${idx}`,
        session_id: session.id, product_code: prod.code,
        product_name: prod.name, system_qty: prod.stock,
        actual_qty: null, diff: null,
        base_price: prod.base_price || 0,
        assigned_to: nvId, status:'pending',
        diff_status:'', diff_note:'',
        checked_at:'', created_at: new Date().toISOString()
      }
    })
  }

  const preview = step==='preview' ? buildAssignment() : []
  const perNV   = selectedNVs.map(id => ({
    nv: allUsers.find((u: any) => u.id===id),
    count: preview.filter((c: any) => c.assigned_to===id).length,
    high: preview.filter((c: any) => c.assigned_to===id && (products.find((p: any)=>p.code===c.product_code)?.stock||0)>=100).length,
    mid:  preview.filter((c: any) => c.assigned_to===id && (products.find((p: any)=>p.code===c.product_code)?.stock||0)>=20 && (products.find((p: any)=>p.code===c.product_code)?.stock||0)<100).length,
    low:  preview.filter((c: any) => c.assigned_to===id && (products.find((p: any)=>p.code===c.product_code)?.stock||0)<20).length,
  }))

  const doAssign = async () => {
    const newChecks = buildAssignment()
    await db.from('inventory_checks').insert(newChecks)
    onAssigned(newChecks)
    onClose()
  }

  return (
    <Modal open={true} onClose={onClose} title="👥 Phân chia mã kiểm kê" wide>
      {step==='select_nv' ? (
        <>
          {/* Target count */}
          <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:12,alignItems:'end',marginBottom:16}}>
            <Inp label="Số mã kiểm kê (chia theo 3 nhóm tồn)"
              type="number" value={String(targetCount)}
              onChange={(v) => setTargetCount(Math.min(Number(v)||150, available.length))}/>
            <div style={{fontSize:11,color:T.light,paddingBottom:12}}>
              Còn: {available.length} SP hợp lệ
            </div>
          </div>

          {/* Preview 3 groups */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
            {[
              {label:'🔴 Tồn nhiều (≥100)',   count:Math.min(each, highStock.length),   total:highStock.length,  color:T.red},
              {label:'🟡 Tồn vừa (20-99)',    count:Math.min(each, midStock.length),    total:midStock.length,   color:T.amber},
              {label:'🟢 Tồn ít (<20)',       count:Math.min(targetCount-each*2, lowStock.length), total:lowStock.length, color:T.green},
            ].map(g => (
              <div key={g.label} style={{padding:'10px',background:T.bg,borderRadius:10,
                border:`1px solid ${T.border}`,textAlign:'center'}}>
                <div style={{fontSize:11,color:T.med,marginBottom:4}}>{g.label}</div>
                <div style={{fontSize:18,fontWeight:800,color:g.color}}>{g.count}</div>
                <div style={{fontSize:10,color:T.light}}>/ {g.total} có thể</div>
              </div>
            ))}
          </div>

          {/* Select NVs */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:600,color:T.dark,marginBottom:8}}>Chọn nhân viên kiểm kê:</div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {khoUsers.map((u: any) => {
                const sel = selectedNVs.includes(u.id)
                return (
                  <label key={u.id} style={{display:'flex',alignItems:'center',gap:10,
                    padding:'8px 12px',borderRadius:10,cursor:'pointer',
                    background:sel?T.goldBg:T.bg,border:`1px solid ${sel?T.gold:T.border}`}}>
                    <input type="checkbox" checked={sel}
                      onChange={() => setSelectedNVs(prev =>
                        sel ? prev.filter(id => id!==u.id) : [...prev,u.id]
                      )}/>
                    <span style={{fontSize:13,fontWeight:sel?700:400,color:sel?T.goldText:T.dark}}>
                      {u.name}
                    </span>
                    <span style={{fontSize:11,color:T.light}}>{u.position_name||''}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {selectedNVs.length>0 && (
            <div style={{padding:'8px 12px',background:T.blueBg,borderRadius:8,
              fontSize:12,color:T.blue,marginBottom:14}}>
              💡 {selected3.length} mã sẽ chia cho {selectedNVs.length} NV — mỗi người ~{Math.ceil(selected3.length/selectedNVs.length)} mã (mix đều 3 nhóm)
            </div>
          )}

          <div style={{display:'flex',justifyContent:'flex-end',gap:10}}>
            <GoldBtn outline small onClick={onClose}>Hủy</GoldBtn>
            <GoldBtn small disabled={selectedNVs.length===0||selected3.length===0}
              onClick={() => setStep('preview')}>Xem trước →</GoldBtn>
          </div>
        </>
      ) : (
        <>
          {/* Preview assignment */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:T.dark,marginBottom:10}}>
              Phân chia {selected3.length} mã cho {selectedNVs.length} nhân viên:
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {perNV.map(({nv,count,high,mid,low}) => (
                <div key={nv?.id} style={{display:'flex',alignItems:'center',gap:12,
                  padding:'10px 14px',background:T.bg,borderRadius:10,border:`1px solid ${T.border}`}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:T.gold,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    color:'#fff',fontSize:11,fontWeight:700,flexShrink:0}}>{nv?.ini||'?'}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.dark}}>{nv?.name||'?'}</div>
                    <div style={{fontSize:11,color:T.light}}>
                      🔴 {high} mã tồn nhiều · 🟡 {mid} mã tồn vừa · 🟢 {low} mã tồn ít
                    </div>
                  </div>
                  <div style={{fontSize:18,fontWeight:800,color:T.blue}}>{count}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:'flex',justifyContent:'space-between',gap:10}}>
            <GoldBtn outline small onClick={() => setStep('select_nv')}>← Quay lại</GoldBtn>
            <GoldBtn small onClick={doAssign}>✅ Xác nhận phân chia</GoldBtn>
          </div>
        </>
      )}
    </Modal>
  )
}

// ── DoubleCheckBanner — hiện trong MobileCheckInput khi có mã cần double-check ──
function DoubleCheckNotice({ checks, sessionId, userId }: any) {
  const mine = checks.filter((c: any) =>
    c.session_id===sessionId && c.double_check_by===userId && c.double_actual_qty==null
  )
  if (mine.length===0) return null
  return (
    <div style={{padding:'10px 14px',background:T.amberBg,borderRadius:10,
      border:`1.5px solid ${T.amber}`,marginBottom:12}}>
      <div style={{fontSize:12,fontWeight:700,color:T.amber,marginBottom:4}}>
        ⚡ Bạn có {mine.length} mã cần kiểm kê lại (double-check)
      </div>
      <div style={{fontSize:11,color:T.med}}>
        Các mã này đã được người khác kiểm kê nhưng phát hiện lệch — cần bạn xác nhận lại.
      </div>
    </div>
  )
}

// ── InvMonitorView — QM xem tiến độ real-time ─────────────
function InvMonitorView({ session, checks, allUsers, user, products, onStartMobile, myChecks }: any) {
  const sessChecks = checks.filter((c: any) => c.session_id === session.id)
  const total      = sessChecks.length
  const done       = sessChecks.filter((c: any) => c.actual_qty != null).length
  const lech       = sessChecks.filter((c: any) => c.diff != null && c.diff !== 0).length

  // Per-NV stats
  const nvIds = [...new Set(sessChecks.map((c: any) => c.assigned_to))].filter(Boolean)
  const perNV = nvIds.map((id: any) => {
    const nvChecks = sessChecks.filter((c: any) => c.assigned_to === id)
    const nv = allUsers.find((u: any) => u.id === id)
    return {
      nv, id,
      total:  nvChecks.length,
      done:   nvChecks.filter((c: any) => c.actual_qty != null).length,
      lech:   nvChecks.filter((c: any) => c.diff != null && c.diff !== 0).length,
    }
  }).sort((a: any, b: any) => b.done/Math.max(b.total,1) - a.done/Math.max(a.total,1))

  // My checks (if manager is also a checker)
  const myPending = myChecks.filter((c: any) => c.actual_qty == null).length

  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {/* Overall progress */}
      <Card>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,flexWrap:'wrap',gap:8}}>
          <div style={{fontSize:13,fontWeight:700,color:T.dark}}>
            📋 Phiên {session.date} {session.note&&`· ${session.note}`}
          </div>
          <div style={{display:'flex',gap:12}}>
            <span style={{fontSize:12,color:T.blue}}>✅ {done}/{total} mã</span>
            {lech>0 && <span style={{fontSize:12,color:T.red,fontWeight:700}}>⚠️ {lech} lệch</span>}
          </div>
        </div>
        <div style={{height:10,background:T.border,borderRadius:5,marginBottom:6}}>
          <div style={{height:'100%',borderRadius:5,
            background:`linear-gradient(90deg,${T.green},${T.teal})`,
            width:`${total>0?done*100/total:0}%`,transition:'width .5s'}}/>
        </div>
        <div style={{fontSize:11,color:T.light}}>{total>0?Math.round(done*100/total):0}% hoàn thành</div>
      </Card>

      {/* Per-NV table */}
      <Card style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'10px 14px',background:T.goldBg,borderBottom:`1px solid ${T.goldBorder}`,
          fontSize:12,fontWeight:700,color:T.goldText}}>👥 Tiến độ từng nhân viên</div>
        {perNV.length===0
          ? <div style={{padding:'20px',textAlign:'center',color:T.light,fontSize:12}}>
              Chưa phân chia mã cho nhân viên
            </div>
          : perNV.map(({nv,id,total:t,done:d,lech:l}: any) => {
              const pct = t>0?Math.round(d*100/t):0
              const statusColor = pct===100?T.green:pct>50?T.amber:T.red
              return (
                <div key={id} style={{padding:'10px 14px',borderBottom:`1px solid ${T.border}`,
                  display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:32,height:32,borderRadius:'50%',
                    background:DEPT_COLOR['kho'],flexShrink:0,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    color:'#fff',fontSize:10,fontWeight:700}}>{nv?.ini||'?'}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600,color:T.dark,marginBottom:4}}>
                      {nv?.name||'NV không xác định'}
                    </div>
                    <div style={{height:6,background:T.border,borderRadius:3}}>
                      <div style={{height:'100%',borderRadius:3,background:statusColor,
                        width:`${pct}%`,transition:'width .3s'}}/>
                    </div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:statusColor}}>{d}/{t}</div>
                    {l>0 && <div style={{fontSize:10,color:T.red}}>⚠️ {l} lệch</div>}
                  </div>
                </div>
              )
            })
        }
      </Card>

      {/* Recent checks live feed */}
      <Card style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'10px 14px',background:T.bg,borderBottom:`1px solid ${T.border}`,
          fontSize:12,fontWeight:700,color:T.dark}}>🔴 Live — Mã vừa kiểm kê</div>
        {sessChecks.filter((c: any)=>c.actual_qty!=null)
          .sort((a: any,b: any)=>(b.checked_at||'').localeCompare(a.checked_at||''))
          .slice(0,15)
          .map((c: any, i: number) => {
            const nv = allUsers.find((u: any) => u.id===c.assigned_to)
            const hasDiff = c.diff!=null && c.diff!==0
            return (
              <div key={c.id} style={{display:'flex',alignItems:'center',gap:10,
                padding:'8px 14px',borderBottom:i<14?`1px solid ${T.border}`:'none',
                background:hasDiff?'#FFF5F5':i%2===0?'#fff':T.rowAlt}}>
                <span style={{fontSize:10,color:T.light,flexShrink:0,width:45}}>
                  {c.checked_at?new Date(c.checked_at).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}):'—'}
                </span>
                <span style={{fontSize:11,color:T.light,flexShrink:0,width:80,
                  overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {nv?.name||'?'}
                </span>
                <span style={{flex:1,fontSize:11,color:T.dark,
                  overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {c.product_name}
                </span>
                <span style={{fontSize:12,fontWeight:700,flexShrink:0,
                  color:!hasDiff?T.green:c.diff>0?T.blue:T.red}}>
                  {!hasDiff?'✓ OK':c.diff>0?`+${c.diff}`:c.diff}
                </span>
              </div>
            )
          })
        }
        {sessChecks.filter((c: any)=>c.actual_qty!=null).length===0 && (
          <div style={{padding:'24px',textAlign:'center',color:T.light,fontSize:12}}>
            Chưa có mã nào được kiểm kê
          </div>
        )}
      </Card>

      {/* If manager also has checks */}
      {myPending > 0 && (
        <button onClick={onStartMobile}
          style={{padding:'12px',borderRadius:12,border:'none',
            background:`linear-gradient(135deg,${T.green},${T.teal})`,
            color:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:13,fontWeight:700}}>
          📱 Bắt đầu KK phần của bạn ({myPending} mã)
        </button>
      )}
    </div>
  )
}

// ── SessionCreateWizard — 3-step wizard ──────────────────
function SessionCreateWizard({ products, checks, allUsers, user, excludedCodes, onCreated, onClose }: any) {
  const [step, setStep] = useState(1)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'priority'|'stock_desc'|'stock_asc'|'alpha'>('priority')
  const [showFilter, setShowFilter] = useState<'all'|'selected'|'unselected'>('all')
  const [searchQ, setSearchQ] = useState('')
  const [selectedNVs, setSelectedNVs] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 80

  const khoUsers = allUsers.filter((u: any) => u.dept_id==='kho')
  const norm = (s: string) => (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d')
  const checkedHistory = new Set(checks.map((c: any) => c.product_code))
  const lastChecked: Record<string,string> = {}
  checks.forEach((c: any) => {
    if (!lastChecked[c.product_code] || c.checked_at > lastChecked[c.product_code])
      lastChecked[c.product_code] = c.checked_at
  })
  const checkCount: Record<string,number> = {}
  checks.forEach((c: any) => { checkCount[c.product_code] = (checkCount[c.product_code]||0)+1 })

  // Generate initial suggestions on step change to 2
  useEffect(() => {
    if (step !== 2 || selected.size > 0) return
    const avail = products.filter((p: any) => p.stock > 0 && p.active && !excludedCodes.has(p.code))
    const highS = avail.filter((p: any) => p.stock >= 100 && !checkedHistory.has(p.code)).slice(0,50)
    const midS  = avail.filter((p: any) => p.stock >= 20 && p.stock < 100 && !checkedHistory.has(p.code)).slice(0,50)
    const lowS  = avail.filter((p: any) => p.stock > 0 && p.stock < 20 && !checkedHistory.has(p.code)).slice(0,50)
    const extras = avail.filter((p: any) => checkedHistory.has(p.code))
      .sort((a: any,b: any) => (lastChecked[a.code]||'').localeCompare(lastChecked[b.code]||''))
    const total150 = [...highS, ...midS, ...lowS]
    const remaining = 150 - total150.length
    if (remaining > 0) total150.push(...extras.slice(0, remaining))
    setSelected(new Set(total150.map((p: any) => p.code).slice(0,150)))
  }, [step])

  // Import Excel for product selection
  const importExcelCodes = async (file: File) => {
    const xlsx = await import('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm' as any)
    const buf  = await file.arrayBuffer()
    const wb   = xlsx.read(buf, {type:'array'})
    const ws   = wb.Sheets[wb.SheetNames[0]]
    const rows: any[] = xlsx.utils.sheet_to_json(ws, {header:1, defval:''})
    const codes = new Set<string>()
    rows.forEach((r: any[]) => r.forEach((cell: any) => {
      const s = String(cell).trim()
      if (s.match(/^[A-Za-z]{2,4}\d{4,}/i) || s.match(/^VT\d+/i) || s.match(/^SP\d+/i))
        codes.add(s.toUpperCase())
    }))
    setSelected(prev => new Set([...prev, ...codes]))
  }

  // Filtered + sorted product list
  const filteredProds = products.filter((p: any) => {
    if (excludedCodes.has(p.code)) return showFilter === 'all' ? false : false
    if (showFilter === 'selected' && !selected.has(p.code)) return false
    if (showFilter === 'unselected' && selected.has(p.code)) return false
    if (searchQ) {
      const q = norm(searchQ)
      return norm(p.name+' '+p.code).includes(q)
    }
    return p.stock >= 0
  }).sort((a: any, b: any) => {
    if (sortBy === 'stock_desc') return (b.stock||0) - (a.stock||0)
    if (sortBy === 'stock_asc')  return (a.stock||0) - (b.stock||0)
    if (sortBy === 'alpha')      return (a.name||'').localeCompare(b.name||'')
    // priority: never checked first, then least recently checked, then by stock
    const aNew = !checkedHistory.has(a.code), bNew = !checkedHistory.has(b.code)
    if (aNew && !bNew) return -1
    if (!aNew && bNew) return 1
    return (lastChecked[a.code]||'').localeCompare(lastChecked[b.code]||'')
  })
  const pagedProds = filteredProds.slice(page*PAGE_SIZE, (page+1)*PAGE_SIZE)
  const totalPages = Math.ceil(filteredProds.length / PAGE_SIZE)

  // Build assignment for preview
  const selectedArr = products.filter((p: any) => selected.has(p.code))
  const each = Math.floor(selectedArr.length / Math.max(selectedNVs.length,1))
  const perNVPreview = selectedNVs.map((id, idx) => {
    const nv = allUsers.find((u: any) => u.id===id)
    return { nv, count: idx < selectedArr.length % selectedNVs.length ? each+1 : each }
  })

  const doCreate = async () => {
    const sid = 'sess_'+Date.now()
    const now = new Date().toISOString()
    const newS = { id:sid, date, note, status:'open',
      total_assigned:selectedArr.length, total_checked:0,
      created_by:user.id, created_at:now }
    await db.from('inventory_sessions').insert(newS)
    // Build checks with assignment
    const newChecks: any[] = []
    selectedArr.forEach((prod: any, idx: number) => {
      const nvId = selectedNVs.length > 0 ? selectedNVs[idx % selectedNVs.length] : user.id
      newChecks.push({
        id:`chk_${sid}_${prod.code}_${idx}`,
        session_id:sid, product_code:prod.code, product_name:prod.name,
        system_qty:prod.stock, actual_qty:null, diff:null,
        base_price:prod.base_price||0, assigned_to:nvId,
        status:'pending', diff_status:'', diff_note:'',
        checked_at:'', created_at:now
      })
    })
    if (newChecks.length > 0) await db.from('inventory_checks').insert(newChecks)
    onCreated(newS, newChecks)
  }

  // Full screen overlay
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:2000,
      display:'flex',alignItems:'stretch',justifyContent:'center',padding:'20px'}}>
      <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:900,
        display:'flex',flexDirection:'column',maxHeight:'100%',overflow:'hidden'}}>

        {/* Header */}
        <div style={{padding:'16px 20px',borderBottom:`1px solid ${T.border}`,
          display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:T.dark}}>
              {step===1?'📋 Tạo phiên kiểm kê mới':step===2?`📦 Chọn sản phẩm (${selected.size} đã chọn)`:'👥 Phân chia & Xác nhận'}
            </div>
            <div style={{display:'flex',gap:8,marginTop:6}}>
              {[1,2,3].map(s => (
                <span key={s} style={{width:24,height:24,borderRadius:'50%',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:11,fontWeight:700,
                  background:step===s?T.gold:step>s?T.green:T.border,
                  color:step>=s?'#fff':T.light}}>{step>s?'✓':s}</span>
              ))}
            </div>
          </div>
          <button onClick={onClose}
            style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:T.light}}>✕</button>
        </div>

        {/* Body */}
        <div style={{flex:1,overflowY:'auto',padding:'16px 20px'}}>

          {/* Step 1 */}
          {step===1 && (
            <div style={{maxWidth:480}}>
              <Inp label="Ngày kiểm kê *" type="date" value={date} onChange={(v) => setDate(v)}/>
              <Inp label="Ghi chú (tùy chọn)" value={note} onChange={(v) => setNote(v)}
                placeholder="VD: Kiểm kê tuần 15 — nhóm A"/>
              <div style={{padding:'12px',background:T.goldBg,borderRadius:10,fontSize:12,color:T.goldText,marginTop:8}}>
                💡 Bước tiếp theo hệ thống sẽ gợi ý 150 SP ưu tiên. Bạn có thể thêm/bớt trước khi xác nhận.
              </div>
            </div>
          )}

          {/* Step 2 — Product selection */}
          {step===2 && (
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {/* Controls */}
              <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                <input value={searchQ} onChange={e => {setSearchQ(e.target.value); setPage(0)}}
                  placeholder="🔍 Tìm mã SP hoặc tên..."
                  style={{flex:1,minWidth:200,padding:'7px 11px',border:`1px solid ${T.border}`,
                    borderRadius:20,fontSize:12,fontFamily:'inherit',color:T.dark,background:'#fff',outline:'none'}}/>
                <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                  style={{padding:'7px 11px',border:`1px solid ${T.border}`,borderRadius:20,
                    fontSize:12,fontFamily:'inherit',color:T.dark,background:'#fff',cursor:'pointer'}}>
                  <option value="priority">⭐ Ưu tiên</option>
                  <option value="stock_desc">📦 Tồn nhiều → ít</option>
                  <option value="stock_asc">📦 Tồn ít → nhiều</option>
                  <option value="alpha">🔤 A → Z</option>
                </select>
                {(['all','selected','unselected'] as const).map(f => (
                  <button key={f} onClick={() => {setShowFilter(f);setPage(0)}}
                    style={{padding:'5px 12px',borderRadius:20,cursor:'pointer',fontFamily:'inherit',fontSize:11,
                      border:`1.5px solid ${showFilter===f?T.gold:T.border}`,
                      background:showFilter===f?T.goldBg:'transparent',
                      color:showFilter===f?T.goldText:T.med}}>
                    {f==='all'?`Tất cả (${products.filter((p: any)=>!excludedCodes.has(p.code)).length})`:f==='selected'?`Đã chọn (${selected.size})`:`Chưa chọn`}
                  </button>
                ))}
                <label style={{padding:'5px 12px',borderRadius:20,border:`1px solid ${T.border}`,
                  cursor:'pointer',fontSize:11,color:T.med,background:T.bg,whiteSpace:'nowrap'}}>
                  📥 Import Excel
                  <input type="file" accept=".xlsx,.xls" style={{display:'none'}}
                    onChange={e => e.target.files?.[0] && importExcelCodes(e.target.files[0])}/>
                </label>
              </div>

              {/* Quick actions */}
              <div style={{display:'flex',gap:8,alignItems:'center',fontSize:11}}>
                <button onClick={() => setSelected(new Set(filteredProds.map((p: any)=>p.code)))}
                  style={{padding:'3px 10px',borderRadius:20,border:`1px solid ${T.border}`,
                    background:'transparent',cursor:'pointer',fontFamily:'inherit',color:T.blue}}>
                  Chọn tất cả trang này
                </button>
                <button onClick={() => setSelected(new Set())}
                  style={{padding:'3px 10px',borderRadius:20,border:`1px solid ${T.border}`,
                    background:'transparent',cursor:'pointer',fontFamily:'inherit',color:T.red}}>
                  Bỏ chọn tất cả
                </button>
                <span style={{color:T.light,marginLeft:'auto'}}>
                  Hiện {filteredProds.length} SP · Trang {page+1}/{totalPages}
                </span>
              </div>

              {/* Table */}
              <div style={{border:`1px solid ${T.border}`,borderRadius:10,overflow:'hidden'}}>
                <div style={{display:'grid',
                  gridTemplateColumns:'36px 90px 1fr 70px 70px 70px 110px',
                  padding:'7px 12px',background:T.bg,borderBottom:`2px solid ${T.border}`,
                  fontSize:10,fontWeight:700,color:T.light,textTransform:'uppercase',letterSpacing:.5,gap:8}}>
                  <span>✓</span><span>Mã SP</span><span>Tên SP</span>
                  <span style={{textAlign:'right'}}>Tồn</span>
                  <span style={{textAlign:'right'}}>KH đặt</span>
                  <span style={{textAlign:'center'}}>Lần KK</span>
                  <span>KK cuối</span>
                </div>
                {pagedProds.map((p: any, i: number) => {
                  const isSel = selected.has(p.code)
                  const nKK   = checkCount[p.code]||0
                  const lastKK = lastChecked[p.code]
                  return (
                    <div key={p.code} onClick={() => setSelected(prev => {
                      const n = new Set(prev)
                      isSel ? n.delete(p.code) : n.add(p.code)
                      return n
                    })}
                      style={{display:'grid',
                        gridTemplateColumns:'36px 90px 1fr 70px 70px 70px 110px',
                        padding:'8px 12px',gap:8,alignItems:'center',cursor:'pointer',
                        borderBottom:i<pagedProds.length-1?`1px solid ${T.border}`:'none',
                        background:isSel?T.goldBg:i%2===0?'#fff':T.rowAlt}}
                      onMouseEnter={e => { if(!isSel)(e.currentTarget as any).style.background=T.bg }}
                      onMouseLeave={e => { if(!isSel)(e.currentTarget as any).style.background=i%2===0?'#fff':T.rowAlt }}>
                      <span style={{fontSize:16,color:isSel?T.green:T.border,textAlign:'center'}}>
                        {isSel?'✓':'○'}
                      </span>
                      <span style={{fontSize:10,color:T.light,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.code}</span>
                      <span style={{fontSize:12,color:T.dark,fontWeight:isSel?500:400,lineHeight:1.3}}>{p.name}</span>
                      <span style={{fontSize:12,textAlign:'right',fontWeight:700,
                        color:p.stock===0?T.light:p.stock<10?T.red:p.stock<50?T.amber:T.green}}>
                        {p.stock??'—'}
                      </span>
                      <span style={{fontSize:12,textAlign:'right',
                        color:(p.ordered_qty||p.reserved||0)>0?T.blue:T.light}}>
                        {p.ordered_qty||p.reserved||0||'—'}
                      </span>
                      <span style={{fontSize:11,textAlign:'center',color:nKK>0?T.green:T.red}}>
                        {nKK>0?nKK:'Chưa KK'}
                      </span>
                      <span style={{fontSize:10,color:T.light}}>
                        {lastKK?new Date(lastKK).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit'}):'—'}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{display:'flex',gap:6,justifyContent:'center',flexWrap:'wrap'}}>
                  {Array.from({length:Math.min(totalPages,10)},(_,i)=>(
                    <button key={i} onClick={()=>setPage(i)}
                      style={{width:28,height:28,borderRadius:'50%',border:`1px solid ${T.border}`,
                        cursor:'pointer',fontFamily:'inherit',fontSize:11,
                        background:page===i?T.gold:'transparent',
                        color:page===i?'#fff':T.med}}>
                      {i+1}
                    </button>
                  ))}
                  {totalPages>10 && <span style={{padding:'4px 8px',color:T.light}}>...{totalPages} trang</span>}
                </div>
              )}
            </div>
          )}

          {/* Step 3 — NV + preview */}
          {step===3 && (
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div style={{padding:'10px 14px',background:T.goldBg,borderRadius:10,
                fontSize:12,color:T.goldText,fontWeight:600}}>
                📦 {selected.size} mã sẽ được kiểm kê trong phiên {date}
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:T.dark,marginBottom:8}}>Chọn nhân viên kiểm kê:</div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {khoUsers.map((u: any) => {
                    const sel = selectedNVs.includes(u.id)
                    return (
                      <label key={u.id} style={{display:'flex',alignItems:'center',gap:10,
                        padding:'9px 14px',borderRadius:10,cursor:'pointer',
                        background:sel?T.goldBg:T.bg,border:`1px solid ${sel?T.gold:T.border}`}}>
                        <input type="checkbox" checked={sel}
                          onChange={() => setSelectedNVs(prev =>
                            sel ? prev.filter(id=>id!==u.id) : [...prev,u.id]
                          )}/>
                        <span style={{fontSize:13,fontWeight:sel?700:400,color:sel?T.goldText:T.dark}}>
                          {u.name}
                        </span>
                        <span style={{fontSize:11,color:T.light}}>{u.position_name||''}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
              {selectedNVs.length > 0 && (
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:T.dark,marginBottom:8}}>Preview phân chia:</div>
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {perNVPreview.map(({nv,count}: any) => (
                      <div key={nv?.id} style={{display:'flex',alignItems:'center',gap:10,
                        padding:'10px 14px',background:T.bg,borderRadius:10,border:`1px solid ${T.border}`}}>
                        <div style={{width:32,height:32,borderRadius:'50%',background:T.gold,
                          display:'flex',alignItems:'center',justifyContent:'center',
                          color:'#fff',fontSize:11,fontWeight:700}}>{nv?.ini||'?'}</div>
                        <span style={{flex:1,fontSize:13,fontWeight:600,color:T.dark}}>{nv?.name||'?'}</span>
                        <span style={{fontSize:18,fontWeight:800,color:T.blue}}>{count} mã</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedNVs.length===0 && (
                <div style={{padding:'12px',background:T.amberBg,borderRadius:8,fontSize:12,color:T.amber}}>
                  ⚠️ Chưa chọn nhân viên. Tất cả mã sẽ được assign cho bạn.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding:'14px 20px',borderTop:`1px solid ${T.border}`,flexShrink:0,
          display:'flex',justifyContent:'space-between',alignItems:'center',background:T.bg}}>
          <div>
            {step===2 && <span style={{fontSize:12,color:T.med}}>Đã chọn: <b>{selected.size}</b> mã</span>}
          </div>
          <div style={{display:'flex',gap:10}}>
            {step>1 && (
              <button onClick={() => setStep(s => s-1)}
                style={{padding:'8px 18px',borderRadius:20,border:`1.5px solid ${T.border}`,
                  background:'transparent',cursor:'pointer',fontFamily:'inherit',fontSize:12,color:T.med}}>
                ← Quay lại
              </button>
            )}
            <button onClick={() => onClose()}
              style={{padding:'8px 18px',borderRadius:20,border:`1px solid ${T.border}`,
                background:'transparent',cursor:'pointer',fontFamily:'inherit',fontSize:12,color:T.light}}>
              Hủy
            </button>
            {step < 3 ? (
              <GoldBtn small onClick={() => setStep(s => s+1)}
                disabled={step===1?!date:step===2?selected.size===0:false}>
                Tiếp theo →
              </GoldBtn>
            ) : (
              <GoldBtn small onClick={doCreate}>
                ✅ Xác nhận tạo phiên
              </GoldBtn>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
