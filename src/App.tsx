// ═══════════════════════════════════════════════
// PHẦN 1/4 — Paste đầu tiên vào App.tsx (xóa hết file cũ trước)
// ═══════════════════════════════════════════════

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { createClient } from '@supabase/supabase-js'
class ErrorBoundary extends React.Component<any, {err: string}> {
  constructor(props: any) {
    super(props)
    this.state = { err: '' }
  }
  componentDidCatch(error: any) {
    this.setState({ err: error?.message + '\n' + error?.stack })
  }
  render() {
    if (this.state.err) return (
      <div style={{padding:20,color:'red',background:'#fff',fontSize:12,wordBreak:'break-all',whiteSpace:'pre-wrap'}}>
        <b>RENDER LỖI:</b>{'\n\n'}{this.state.err}
      </div>
    )
    return this.props.children
  }
}
window.onerror = (msg, src, line, col, err) => {
  document.body.innerHTML = `<div style="padding:20px;color:red;background:#fff;font-size:12px;word-break:break-all">
    <b>LỖI:</b><br/>${msg}<br/><br/>
    File: ${src}<br/>
    Dòng: ${line}:${col}<br/><br/>
    ${err?.stack||''}
  </div>`
}
window.addEventListener('unhandledrejection', e => {
  document.body.innerHTML = `<div style="padding:20px;color:red;background:#fff;font-size:12px;word-break:break-all">
    <b>PROMISE LỖI:</b><br/>${e.reason?.message||e.reason}<br/><br/>
    ${e.reason?.stack||''}
  </div>`
})
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
  done:     { label:'✅ Hoàn thành', color:T.green,  bg:T.greenBg },
  doing:    { label:'⏳ Đang làm',   color:T.amber,  bg:T.amberBg },
  notyet:   { label:'❌ Chưa làm',  color:T.gray,   bg:T.grayBg  },
  blocked:  { label:'⚠️ Bị block',  color:T.red,    bg:T.redBg   },
  transfer: { label:'🔄 Chuyển',    color:T.blue,   bg:T.blueBg  },
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
  annual:'Nghỉ phép năm', sick:'Nghỉ bệnh', personal:'Việc cá nhân', unpaid:'Nghỉ không lương'
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
const useWindowWidth = () => {
  const [w, setW] = useState(window.innerWidth)
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
  return (
    <span style={{ display:'inline-block', fontSize:small?10:11, fontWeight:600,
      padding:small?'2px 7px':'3px 9px', borderRadius:20,
      color:c.color, background:c.bg, whiteSpace:'nowrap' }}>
      {c.label}
    </span>
  )
}

const Av = ({ u, size = 32, showDept = false }: any) => (
  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
    <div style={{ width:size, height:size, borderRadius:'50%',
      background:DEPT_COLOR[u?.dept_id] || T.gold, flexShrink:0,
      display:'flex', alignItems:'center', justifyContent:'center',
      color:'#fff', fontSize:size > 36 ? 13 : 10, fontWeight:700 }}>
      {u?.ini || '?'}
    </div>
    {showDept && (
      <div>
        <div style={{ fontSize:13, fontWeight:500, color:T.dark }}>{u?.name}</div>
        <div style={{ fontSize:11, color:T.light }}>{u?.dept_name || ''}</div>
      </div>
    )}
  </div>
)

const Card = ({ children, style }: any) => (
  <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:'18px 22px', ...style }}>
    {children}
  </div>
)

const GoldBtn = ({ onClick, children, small, outline, danger, disabled }: any) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: danger ? T.red : outline ? 'transparent' : T.gold,
    color: (danger || !outline) ? '#fff' : T.gold,
    border: `1.5px solid ${danger ? T.red : T.gold}`,
    borderRadius:8, padding:small ? '6px 13px' : '8px 18px',
    fontSize:small ? 12 : 13, fontWeight:600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily:'inherit', opacity:disabled ? 0.5 : 1,
  }}>{children}</button>
)

const Modal = ({ open, onClose, title, children, wide }: any) => {
  if (!open) return null
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:16, padding:'24px 28px',
        width:'100%', maxWidth:wide ? 640 : 480, maxHeight:'88vh', overflowY:'auto' }}
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

const Inp = ({ label, value, onChange, type = 'text', placeholder, min, max }: any) => (
  <div style={{ marginBottom:13 }}>
    {label && <div style={{ fontSize:12, fontWeight:500, color:T.med, marginBottom:5 }}>{label}</div>}
    <input type={type} value={value} min={min} max={max}
      onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width:'100%', padding:'8px 11px', border:`1px solid ${T.border}`, borderRadius:8,
        fontSize:13, fontFamily:'inherit', color:T.dark, background:T.bg,
        boxSizing:'border-box', outline:'none' }}/>
  </div>
)

const Sel = ({ label, value, onChange, options }: any) => (
  <div style={{ marginBottom:13 }}>
    {label && <div style={{ fontSize:12, fontWeight:500, color:T.med, marginBottom:5 }}>{label}</div>}
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width:'100%', padding:'8px 11px', border:`1px solid ${T.border}`, borderRadius:8,
        fontSize:13, fontFamily:'inherit', color:T.dark, background:T.bg, outline:'none', cursor:'pointer' }}>
      {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
)

const TH = ({ cols }: any) => (
  <thead>
    <tr style={{ background:T.bg }}>
      {cols.map((h: string, i: number) => (
        <th key={i} style={{ padding:'10px 13px', textAlign:'left', fontSize:10, fontWeight:600,
          color:T.light, textTransform:'uppercase', letterSpacing:.5,
          borderBottom:`1px solid ${T.border}` }}>{h}</th>
      ))}
    </tr>
  </thead>
)

const Topbar = ({ title, subtitle, action, mobile }: any) => (
  <div style={{ padding:mobile ? '16px 16px 0' : '20px 24px 0',
    display:'flex', alignItems:'flex-start', justifyContent:'space-between',
    marginBottom:18, flexWrap:'wrap', gap:10 }}>
    <div>
      <h1 style={{ margin:0, fontSize:mobile ? 18 : 20, fontWeight:700, color:T.dark }}>{title}</h1>
      {subtitle && <div style={{ color:T.light, fontSize:12, marginTop:3 }}>{subtitle}</div>}
    </div>
    {action}
  </div>
)

// ── LOGIN SCREEN ─────────────────────────────────
function LoginScreen({ onLogin, allUsers }: any) {
  const [step, setStep] = useState<'select'|'pin'>('select')
  const [sel, setSel]   = useState<any>(null)
  const [pin, setPin]   = useState('')
  const [err, setErr]   = useState('')
  const [shake, setShake] = useState(false)

  const depts = [
    { id:'all', name:'Admin' }, { id:'kho', name:'Kho' },
    { id:'sale', name:'Sale' }, { id:'vp', name:'Văn phòng' },
  ]

  const handleDigit = (d: string) => {
    if (pin.length >= 6) return
    const np = pin + d
    setPin(np)
    if (np.length === sel.pin.length) {
      setTimeout(() => {
        if (np === sel.pin) { onLogin(sel) }
        else {
          setErr('Sai PIN, thử lại!')
          setShake(true)
          setTimeout(() => { setPin(''); setErr(''); setShake(false) }, 700)
        }
      }, 150)
    }
  }

  const pads = [1,2,3,4,5,6,7,8,9,'',0,'⌫']

  return (
    <div style={{ minHeight:'100vh', background:'#16120E', display:'flex',
      flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ textAlign:'center', marginBottom:36 }}>
        <LALogo size={68}/>
        <div style={{ color:T.gold, fontSize:20, fontFamily:'Georgia,serif', marginTop:12, letterSpacing:2 }}>LA Global Beauty</div>
        <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12, marginTop:5 }}>Hệ thống quản lý công việc nội bộ</div>
      </div>

      {step === 'select' ? (
        <div style={{ width:'100%', maxWidth:460 }}>
          <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12, textAlign:'center', marginBottom:16 }}>Chọn tài khoản</div>
          {depts.map(dept => {
            const users = allUsers.filter((u: any) =>
              dept.id === 'all' ? u.role === 'admin' : u.dept_id === dept.id && u.active)
            if (!users.length) return null
            return (
              <div key={dept.id} style={{ marginBottom:16 }}>
                <div style={{ color:'rgba(255,255,255,0.3)', fontSize:11, fontWeight:600,
                  textTransform:'uppercase', letterSpacing:1, marginBottom:8, paddingLeft:4 }}>
                  {dept.name}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))', gap:8 }}>
                  {users.map((u: any) => (
                    <button key={u.id}
                      onClick={() => { setSel(u); setStep('pin'); setPin('') }}
                      style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(196,151,58,0.25)',
                        borderRadius:12, padding:'14px 12px', cursor:'pointer', textAlign:'center' }}
                      onMouseEnter={e => { (e.currentTarget as any).style.background = 'rgba(196,151,58,0.12)' }}
                      onMouseLeave={e => { (e.currentTarget as any).style.background = 'rgba(255,255,255,0.05)' }}>
                      <div style={{ width:38, height:38, borderRadius:'50%',
                        background:DEPT_COLOR[u.dept_id] || T.gold,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        color:'#fff', fontSize:13, fontWeight:700, margin:'0 auto 8px' }}>{u.ini}</div>
                      <div style={{ color:'#fff', fontSize:13, fontWeight:600 }}>{u.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ width:'100%', maxWidth:290, textAlign:'center' }}>
          <button onClick={() => { setStep('select'); setPin(''); setErr('') }}
            style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:12, marginBottom:20 }}>
            ← Quay lại
          </button>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginBottom:24 }}>
            <div style={{ width:46, height:46, borderRadius:'50%',
              background:DEPT_COLOR[sel?.dept_id] || T.gold,
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'#fff', fontSize:15, fontWeight:700 }}>{sel?.ini}</div>
            <div style={{ textAlign:'left' }}>
              <div style={{ color:'#fff', fontSize:16, fontWeight:600 }}>{sel?.name}</div>
              <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>{sel?.dept_name}</div>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'center', gap:12, marginBottom:8,
            animation: shake ? 'shake 0.4s ease' : 'none' }}>
            {Array.from({ length: Math.max(4, sel?.pin?.length || 4) }).map((_, i) => (
              <div key={i} style={{ width:14, height:14, borderRadius:'50%',
                background: i < pin.length ? T.gold : 'rgba(255,255,255,0.2)',
                transition:'background 0.1s' }}/>
            ))}
          </div>
          {err && <div style={{ color:'#F87171', fontSize:12, marginBottom:8 }}>{err}</div>}
          <div style={{ color:'rgba(255,255,255,0.3)', fontSize:12, marginBottom:20 }}>Nhập mã PIN</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            {pads.map((d, i) => (
              <button key={i}
                onClick={() => {
                  if (d === '⌫') setPin(p => p.slice(0, -1))
                  else if (d !== '') handleDigit(String(d))
                }}
                style={{ background: d === '' ? 'transparent' : 'rgba(255,255,255,0.08)',
                  border:`1px solid ${d === '' ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius:12, padding:'16px', fontSize:20, fontWeight:500,
                  color:'#fff', cursor: d === '' ? 'default' : 'pointer', fontFamily:'inherit' }}
                onMouseEnter={e => { if (d !== '') (e.currentTarget as any).style.background = 'rgba(196,151,58,0.2)' }}
                onMouseLeave={e => { if (d !== '') (e.currentTarget as any).style.background = 'rgba(255,255,255,0.08)' }}>
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
    </div>
  )
}

// ── NAVIGATION ───────────────────────────────────
const getNav = (role: string) => {
  const all = [
    { id:'dashboard',  icon:'📊', label:'Dashboard'  },
    { id:'checklist',  icon:'✅', label:'Checklist'  },
    { id:'tasks',      icon:'📌', label:'Giao việc'  },
    { id:'templates',  icon:'📋', label:'Template'   },
    { id:'attendance', icon:'🕐', label:'Chấm công'  },
    { id:'announce',   icon:'📣', label:'Thông báo'  },
    { id:'leave',      icon:'🏖️', label:'Nghỉ phép'  },
    { id:'history',    icon:'🗂️', label:'Lịch sử'   },
    { id:'users',      icon:'👥', label:'Nhân viên'  },
    { id:'settings',   icon:'⚙️', label:'Cài đặt'   },
  ]
  const mgr = ['dashboard','checklist','tasks','attendance','announce','leave','history','settings']
  const stf = ['checklist','tasks','announce','leave','settings']
  if (role === 'admin') return all
  if (role === 'mgr')   return all.filter(n => mgr.includes(n.id))
  return all.filter(n => stf.includes(n.id))
}

function Sidebar({ user, page, setPage, onLogout, pendingLeave }: any) {
  const nav = getNav(user.role)
  return (
    <div style={{ width:210, background:T.sidebar, display:'flex', flexDirection:'column',
      flexShrink:0, height:'100vh', position:'sticky', top:0 }}>
      <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <LALogo size={34}/>
          <div style={{ color:T.gold, fontSize:12, fontFamily:'Georgia,serif', lineHeight:1.4, letterSpacing:.5 }}>
            LA Global<br/>Beauty
          </div>
        </div>
      </div>
      <nav style={{ flex:1, padding:'10px 8px', overflowY:'auto' }}>
        {nav.map(item => {
          const active = page === item.id
          const badge = item.id === 'leave' && pendingLeave > 0 ? pendingLeave : 0
          return (
            <button key={item.id} onClick={() => setPage(item.id)}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:9,
                padding:'9px 10px', borderRadius:8, marginBottom:2, border:'none',
                cursor:'pointer', fontFamily:'inherit', fontSize:13, textAlign:'left',
                background: active ? 'rgba(196,151,58,0.18)' : 'transparent',
                color: active ? T.gold : 'rgba(255,255,255,0.55)',
                fontWeight: active ? 600 : 400 }}
              onMouseEnter={e => { if (!active) (e.currentTarget as any).style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as any).style.background = 'transparent' }}>
              <span style={{ fontSize:14 }}>{item.icon}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {badge > 0 && (
                <span style={{ background:T.red, color:'#fff', borderRadius:10,
                  fontSize:9, fontWeight:700, padding:'1px 5px' }}>{badge}</span>
              )}
            </button>
          )
        })}
      </nav>
      <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:10 }}>
          <div style={{ width:30, height:30, borderRadius:'50%',
            background:DEPT_COLOR[user.dept_id] || T.gold, flexShrink:0,
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontSize:10, fontWeight:700 }}>{user.ini}</div>
          <div>
            <div style={{ color:'rgba(255,255,255,0.85)', fontSize:12, fontWeight:600 }}>{user.name}</div>
            <div style={{ color:'rgba(255,255,255,0.35)', fontSize:10 }}>{user.dept_name}</div>
          </div>
        </div>
        <button onClick={onLogout}
          style={{ width:'100%', padding:'7px', borderRadius:7,
            border:'1px solid rgba(255,255,255,0.1)', background:'transparent',
            color:'rgba(255,255,255,0.4)', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
          Đăng xuất
        </button>
      </div>
    </div>
  )
}

function BottomNav({ page, setPage, user, pendingLeave }: any) {
  const nav = getNav(user.role).slice(0, 5)
  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, background:T.sidebar,
      display:'flex', borderTop:'1px solid rgba(255,255,255,0.1)', zIndex:100,
      paddingBottom:'env(safe-area-inset-bottom,8px)' }}>
      {nav.map(item => {
        const active = page === item.id
        const badge = item.id === 'leave' && pendingLeave > 0 ? pendingLeave : 0
        return (
          <button key={item.id} onClick={() => setPage(item.id)}
            style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center',
              justifyContent:'center', padding:'10px 4px', border:'none',
              background:'transparent', cursor:'pointer',
              color: active ? T.gold : 'rgba(255,255,255,0.45)',
              position:'relative' }}>
            <span style={{ fontSize:18, marginBottom:3 }}>{item.icon}</span>
            <span style={{ fontSize:9, fontWeight:active ? 600 : 400, fontFamily:'inherit' }}>{item.label}</span>
            {badge > 0 && (
              <span style={{ position:'absolute', top:6, right:'calc(50% - 14px)',
                background:T.red, color:'#fff', borderRadius:10, fontSize:8, fontWeight:700, padding:'1px 4px' }}>
                {badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ══ KẾT THÚC PHẦN 1 — Paste tiếp Phần 2 bên dưới ══
// ═══════════════════════════════════════════════
// PHẦN 2/4 — Paste nối tiếp bên dưới Phần 1
// ═══════════════════════════════════════════════

// ── DASHBOARD ────────────────────────────────────
function Dashboard({ user, checklist, tasks, allUsers, attendance, mobile }: any) {
  const p = mobile ? '16px' : '24px'
  const canAll = user.role === 'admin', canDept = user.role === 'mgr'
  const rIds = (canAll ? allUsers : canDept
    ? allUsers.filter((u: any) => u.dept_id === user.dept_id)
    : [user]).map((u: any) => u.id)

  const myCl = checklist.filter((c: any) => rIds.includes(c.assignee_id))
  const myTk = tasks.filter((t: any) => rIds.includes(t.assignee_id))
  const todayAtt = attendance.filter((a: any) => a.date === todayISO() && rIds.includes(a.user_id))
  const clDone = myCl.filter((c: any) => c.status === 'done').length
  const staffCount = allUsers.filter((u: any) => rIds.includes(u.id) && u.role !== 'admin').length
  const absentCount = todayAtt.filter((a: any) => ['absent','sick'].includes(a.status)).length

  const deptStats = ['kho','sale','vp'].map(d => {
    const du = allUsers.filter((u: any) => u.dept_id === d).map((u: any) => u.id)
    const dc = checklist.filter((c: any) => du.includes(c.assignee_id))
    const done = dc.filter((c: any) => c.status === 'done').length
    return { name:DEPT_NAME[d], done, total:dc.length, pct:dc.length > 0 ? Math.round(done/dc.length*100) : 0 }
  })

  const staffStats = allUsers
    .filter((u: any) => rIds.includes(u.id) && u.id !== 'admin')
    .map((u: any) => {
      const uCl = checklist.filter((c: any) => c.assignee_id === u.id)
      const done = uCl.filter((c: any) => c.status === 'done').length
      return { name:u.name, done, total:uCl.length, pct:uCl.length > 0 ? Math.round(done/uCl.length*100) : 0 }
    })
    .sort((a: any, b: any) => b.pct - a.pct)

  const weekData = Array.from({ length:7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i)
    return { day:['CN','T2','T3','T4','T5','T6','T7'][d.getDay()], done: Math.floor(Math.random()*8)+2 }
  })

  return (
    <div style={{ padding:`0 ${p} ${p}` }}>
      <Topbar mobile={mobile}
        title={canAll ? 'Dashboard' : canDept ? `Dashboard — ${user.dept_name}` : 'Tổng quan'}
        subtitle={new Date().toLocaleDateString('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'})}/>

      <div style={{ display:'grid', gridTemplateColumns:mobile?'1fr 1fr':'repeat(4,1fr)', gap:10, marginBottom:16 }}>
        {[
          { label:'Checklist xong', val:`${clDone}/${myCl.length}`,                  icon:'✅', color:T.green },
          { label:'Checklist trễ',  val:myCl.filter(isOverdue).length,               icon:'🔴', color:T.red   },
          { label:'Vắng hôm nay',   val:`${absentCount}/${staffCount}`,              icon:'🏠', color:T.amber },
          { label:'Task quá hạn',   val:myTk.filter(isOverdue).length,               icon:'⚠️', color:T.red   },
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

      <div style={{ display:'grid', gridTemplateColumns:mobile?'1fr':'1fr 1fr', gap:14 }}>
        <Card>
          <div style={{ fontSize:13, fontWeight:600, color:T.dark, marginBottom:12 }}>Tiến độ trong tuần</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={weekData} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false}/>
              <XAxis dataKey="day" tick={{ fontSize:10, fill:T.light }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:T.light }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ borderRadius:8, fontSize:12 }}/>
              <Bar dataKey="done" name="Hoàn thành" fill={T.gold} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {canAll ? (
          <Card>
            <div style={{ fontSize:13, fontWeight:600, color:T.dark, marginBottom:12 }}>Tiến độ theo phòng ban</div>
            {deptStats.map(d => (
              <div key={d.name} style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                  <span style={{ fontWeight:500, color:T.dark }}>{d.name}</span>
                  <span style={{ color:T.light }}>{d.done}/{d.total} — {d.pct}%</span>
                </div>
                <div style={{ height:6, background:T.border, borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${d.pct}%`, background:T.gold, borderRadius:3 }}/>
                </div>
              </div>
            ))}
          </Card>
        ) : (
          <Card>
            <div style={{ fontSize:13, fontWeight:600, color:T.dark, marginBottom:12 }}>Tiến độ nhân viên</div>
            {staffStats.map((s: any, i: number) => (
              <div key={i} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                  <span style={{ fontWeight:500, color:T.dark }}>{s.name}</span>
                  <span style={{ color:T.light }}>{s.done}/{s.total} — {s.pct}%</span>
                </div>
                <div style={{ height:6, background:T.border, borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${s.pct}%`, background:T.gold, borderRadius:3 }}/>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      {canAll && staffStats.length > 0 && (
        <Card style={{ marginTop:14 }}>
          <div style={{ fontSize:13, fontWeight:600, color:T.dark, marginBottom:14 }}>🏆 Bảng xếp hạng hôm nay</div>
          <div style={{ display:'grid', gridTemplateColumns:mobile?'1fr':'repeat(3,1fr)', gap:10 }}>
            {staffStats.slice(0, 9).map((s: any, i: number) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px',
                background:i === 0 ? T.goldBg : T.bg,
                borderRadius:8, border:`1px solid ${i === 0 ? T.goldBorder : T.border}` }}>
                <div style={{ fontSize:16, width:24, textAlign:'center' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i+1}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:T.dark }}>{s.name}</div>
                  <div style={{ fontSize:10, color:T.light }}>{s.done}/{s.total} việc</div>
                </div>
                <div style={{ fontSize:13, fontWeight:700,
                  color:s.pct >= 80 ? T.green : s.pct >= 50 ? T.amber : T.red }}>{s.pct}%</div>
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
  const [personFilter, setPersonFilter] = useState('all')
  const [freqFilter, setFreqFilter]     = useState('all')
  const p = mobile ? '16px' : '24px'
  const canAll  = user.role === 'admin'
  const canDept = user.role === 'mgr'
  const dids = allUsers.filter((u: any) => u.dept_id === user.dept_id).map((u: any) => u.id)
  const sopts = Object.entries(STATUS_CFG).map(([v, s]: any) => ({ value:v, label:s.label }))

  const items = useMemo(() => {
    let list = canAll ? checklist
      : canDept ? checklist.filter((c: any) => dids.includes(c.assignee_id))
      : checklist.filter((c: any) => c.assignee_id === user.id)
    if (personFilter !== 'all') list = list.filter((c: any) => c.assignee_id === personFilter)
    if (freqFilter !== 'all')   list = list.filter((c: any) => c.freq === freqFilter)
    return list
  }, [checklist, personFilter, freqFilter, user, canAll, canDept, dids])

  const updateStatus = async (id: string, newStatus: string) => {
    const item = checklist.find((c: any) => c.id === id); if (!item) return
    const done_at = newStatus === 'done' ? fmtNow() : ''
    setChecklist((prev: any) => prev.map((c: any) => c.id === id ? {...c, status:newStatus, done_at} : c))
    await db.from('checklist').upsert({...item, status:newStatus, done_at})
    addLog({ sheet:'Checklist', task:item.title,
      person:allUsers.find((u: any) => u.id === item.assignee_id)?.name || '',
      from:STATUS_CFG[item.status]?.label, to:STATUS_CFG[newStatus]?.label })
  }

  const done = items.filter((c: any) => c.status === 'done').length
  const filterUsers = canAll
    ? allUsers.filter((u: any) => u.role !== 'admin')
    : allUsers.filter((u: any) => u.dept_id === user.dept_id)

  return (
    <div style={{ padding:`0 ${p} ${mobile?'80px':p}` }}>
      <Topbar mobile={mobile} title="Checklist hàng ngày"
        subtitle={`${todayStr()} — ${done}/${items.length} hoàn thành`}/>

      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
        {(canAll || canDept) && [
          { value:'all', label:'Tất cả' },
          ...filterUsers.map((u: any) => ({ value:u.id, label:u.name }))
        ].map(f => (
          <button key={f.value} onClick={() => setPersonFilter(f.value)}
            style={{ padding:'5px 11px', borderRadius:7, cursor:'pointer', fontFamily:'inherit', fontSize:12,
              border:`1.5px solid ${personFilter === f.value ? T.gold : T.border}`,
              background:personFilter === f.value ? T.goldBg : 'transparent',
              color:personFilter === f.value ? T.goldText : T.med,
              fontWeight:personFilter === f.value ? 600 : 400 }}>{f.label}</button>
        ))}
        {['all','Hàng ngày','Hàng tuần','Hàng tháng'].map(f => (
          <button key={f} onClick={() => setFreqFilter(f)}
            style={{ padding:'5px 11px', borderRadius:7, cursor:'pointer', fontFamily:'inherit', fontSize:12,
              border:`1.5px solid ${freqFilter === f ? T.purple : T.border}`,
              background:freqFilter === f ? T.purpleBg : 'transparent',
              color:freqFilter === f ? T.purple : T.med,
              fontWeight:freqFilter === f ? 600 : 400 }}>
            {f === 'all' ? 'Tất cả' : f}
          </button>
        ))}
      </div>

      {mobile ? (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {items.map((item: any) => {
            const late = isOverdue(item)
            const canEdit = canAll || item.assignee_id === user.id || (canDept && dids.includes(item.assignee_id))
            const sc = STATUS_CFG[item.status] || {}
            const assignee = allUsers.find((u: any) => u.id === item.assignee_id)
            return (
              <div key={item.id} style={{ background:late&&item.status!=='done'?'#FFF5F5':T.card,
                border:`1px solid ${late&&item.status!=='done'?T.red:T.border}`, borderRadius:10, padding:'12px 14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <div style={{ flex:1, marginRight:8 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:late&&item.status!=='done'?T.red:T.dark }}>{item.title}</div>
                    {item.description && <div style={{ fontSize:11, color:T.light, marginTop:2 }}>{item.description}</div>}
                  </div>
                  <Badge cfg={PRI_CFG[item.priority]} small/>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:6 }}>
                  <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                    {assignee && <Av u={assignee} size={22}/>}
                    <span style={{ fontSize:11, color:T.light }}>{item.deadline || ''}</span>
                    <span style={{ fontSize:10, fontWeight:600, padding:'2px 6px', borderRadius:20,
                      color:FREQ_COLOR[item.freq]?.color, background:FREQ_COLOR[item.freq]?.bg }}>{item.freq}</span>
                  </div>
                  {canEdit && (
                    <select value={item.status} onChange={e => updateStatus(item.id, e.target.value)}
                      style={{ padding:'4px 7px', borderRadius:7, border:`1.5px solid ${sc.color||T.border}`,
                        background:sc.bg||'#fff', color:sc.color||T.dark, fontSize:11, fontWeight:600,
                        cursor:'pointer', fontFamily:'inherit', outline:'none' }}>
                      {sopts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Card style={{ padding:0, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <TH cols={['#','Công việc','Nhân viên','Tần suất','Ưu tiên','Deadline','Trạng thái','Xong lúc']}/>
            <tbody>
              {items.map((item: any, i: number) => {
                const late = isOverdue(item)
                const canEdit = canAll || item.assignee_id === user.id || (canDept && dids.includes(item.assignee_id))
                const sc = STATUS_CFG[item.status] || {}
                const assignee = allUsers.find((u: any) => u.id === item.assignee_id)
                return (
                  <tr key={item.id} style={{ background:late&&item.status!=='done'?'#FFF5F5':i%2===0?'#fff':T.bg,
                    borderBottom:`1px solid ${T.border}` }}>
                    <td style={{ padding:'10px 13px', color:T.light, fontSize:12, width:30 }}>{i+1}</td>
                    <td style={{ padding:'10px 13px' }}>
                      <div style={{ fontSize:13, fontWeight:500, color:late&&item.status!=='done'?T.red:T.dark }}>{item.title}</div>
                      {item.description && <div style={{ fontSize:11, color:T.light, marginTop:1 }}>{item.description}</div>}
                    </td>
                    <td style={{ padding:'10px 13px' }}>{assignee && <Av u={assignee} size={26} showDept/>}</td>
                    <td style={{ padding:'10px 13px' }}>
                      <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:20,
                        color:FREQ_COLOR[item.freq]?.color, background:FREQ_COLOR[item.freq]?.bg }}>{item.freq}</span>
                    </td>
                    <td style={{ padding:'10px 13px' }}><Badge cfg={PRI_CFG[item.priority]} small/></td>
                    <td style={{ padding:'10px 13px', fontSize:12, fontWeight:500,
                      color:late&&item.status!=='done'?T.red:T.dark }}>
                      {late&&item.status!=='done'?'⚠️ ':''}{item.deadline||'—'}
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
                    <td style={{ padding:'10px 13px', fontSize:11, color:item.done_at?T.green:T.light }}>{item.done_at||'—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

// ── TASKS ────────────────────────────────────────
function Tasks({ user, tasks, setTasks, addLog, allUsers, mobile }: any) {
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ title:'', description:'', assignee_id:'', priority:'high', deadline:'', notes:'' })
  const p = mobile ? '16px' : '24px'
  const canAll  = user.role === 'admin'
  const canDept = user.role === 'mgr'
  const dids = allUsers.filter((u: any) => u.dept_id === user.dept_id).map((u: any) => u.id)
  const sopts = Object.entries(STATUS_CFG).map(([v, s]: any) => ({ value:v, label:s.label }))

  const mine = canAll ? tasks
    : canDept ? tasks.filter((t: any) => dids.includes(t.assignee_id) || t.created_by === user.id)
    : tasks.filter((t: any) => t.assignee_id === user.id)

  const assignable = canAll
    ? allUsers.filter((u: any) => u.role !== 'admin')
    : allUsers.filter((u: any) => u.dept_id === user.dept_id && u.id !== user.id)

  const upd = async (id: string, newStatus: string) => {
    const task = tasks.find((t: any) => t.id === id); if (!task) return
    const done_at = newStatus === 'done' ? fmtNow() : ''
    setTasks((prev: any) => prev.map((t: any) => t.id === id ? {...t, status:newStatus, done_at} : t))
    await db.from('tasks').upsert({...task, status:newStatus, done_at})
    addLog({ sheet:'Giao việc', task:task.title,
      person:allUsers.find((u: any) => u.id === task.assignee_id)?.name || '',
      from:STATUS_CFG[task.status]?.label, to:STATUS_CFG[newStatus]?.label })
  }

  const create = async () => {
    if (!form.title || !form.deadline || !form.assignee_id) return
    const newTask = { id:'t'+Date.now(), ...form, created_by:user.id, assigned:todayStr(),
      status:'notyet', done_at:'',
      dept_id:allUsers.find((u: any) => u.id === form.assignee_id)?.dept_id || '' }
    setTasks((prev: any) => [newTask, ...prev])
    await db.from('tasks').insert(newTask)
    setShow(false)
    setForm({ title:'', description:'', assignee_id:'', priority:'high', deadline:'', notes:'' })
  }

  return (
    <div style={{ padding:`0 ${p} ${mobile?'80px':p}` }}>
      <Topbar mobile={mobile}
        title={canAll ? 'Giao việc' : canDept ? 'Việc phòng tôi' : 'Việc của tôi'}
        subtitle={`${mine.filter((t: any) => t.status === 'done').length}/${mine.length} hoàn thành`}
        action={(canAll || canDept) && <GoldBtn small onClick={() => setShow(true)}>+ Tạo task</GoldBtn>}/>

      {mobile ? (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {mine.map((t: any) => {
            const late = isOverdue(t), sc = STATUS_CFG[t.status] || {}
            const av = allUsers.find((u: any) => u.id === t.assignee_id)
            const cr = allUsers.find((u: any) => u.id === t.created_by)
            const ce = canAll || t.assignee_id === user.id || (canDept && dids.includes(t.assignee_id))
            return (
              <div key={t.id} style={{ background:late&&t.status!=='done'?'#FFF5F5':T.card,
                border:`1px solid ${late&&t.status!=='done'?T.red:T.border}`, borderRadius:10, padding:'12px 14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <div style={{ flex:1, marginRight:8 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:late&&t.status!=='done'?T.red:T.dark }}>{t.title}</div>
                    {t.description && <div style={{ fontSize:11, color:T.light, marginTop:2 }}>{t.description}</div>}
                    {t.notes && <div style={{ fontSize:11, color:T.blue, marginTop:2 }}>📝 {t.notes}</div>}
                  </div>
                  <Badge cfg={PRI_CFG[t.priority]} small/>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:6 }}>
                  <div style={{ display:'flex', gap:6, alignItems:'center', fontSize:11, color:T.light }}>
                    {av && <Av u={av} size={20}/>}
                    <span>{fmtDate(t.deadline)}</span>
                    {cr && <span>· {cr.name}</span>}
                  </div>
                  {ce && (
                    <select value={t.status} onChange={e => upd(t.id, e.target.value)}
                      style={{ padding:'4px 7px', borderRadius:7, border:`1.5px solid ${sc.color||T.border}`,
                        background:sc.bg||'#fff', color:sc.color||T.dark, fontSize:11, fontWeight:600,
                        cursor:'pointer', fontFamily:'inherit', outline:'none' }}>
                      {sopts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Card style={{ padding:0, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <TH cols={['Tiêu đề','Giao cho','Người tạo','Ưu tiên','Deadline','Trạng thái','Xong lúc']}/>
            <tbody>
              {mine.map((t: any, i: number) => {
                const late = isOverdue(t), sc = STATUS_CFG[t.status] || {}
                const av = allUsers.find((u: any) => u.id === t.assignee_id)
                const cr = allUsers.find((u: any) => u.id === t.created_by)
                const ce = canAll || t.assignee_id === user.id || (canDept && dids.includes(t.assignee_id))
                return (
                  <tr key={t.id} style={{ background:late&&t.status!=='done'?'#FFF5F5':i%2===0?'#fff':T.bg,
                    borderBottom:`1px solid ${T.border}` }}>
                    <td style={{ padding:'10px 13px' }}>
                      <div style={{ fontSize:13, fontWeight:500, color:late&&t.status!=='done'?T.red:T.dark }}>{t.title}</div>
                      {t.notes && <div style={{ fontSize:11, color:T.blue, marginTop:1 }}>📝 {t.notes}</div>}
                    </td>
                    <td style={{ padding:'10px 13px' }}>{av && <Av u={av} size={24} showDept/>}</td>
                    <td style={{ padding:'10px 13px', fontSize:12, color:T.med }}>{cr?.name||'—'}</td>
                    <td style={{ padding:'10px 13px' }}><Badge cfg={PRI_CFG[t.priority]} small/></td>
                    <td style={{ padding:'10px 13px', fontSize:12, fontWeight:500,
                      color:late&&t.status!=='done'?T.red:T.dark }}>
                      {late&&t.status!=='done'?'⚠️ ':''}{fmtDate(t.deadline)}
                    </td>
                    <td style={{ padding:'10px 13px' }}>
                      {ce ? (
                        <select value={t.status} onChange={e => upd(t.id, e.target.value)}
                          style={{ padding:'4px 8px', borderRadius:7, border:`1.5px solid ${sc.color||T.border}`,
                            background:sc.bg||'#fff', color:sc.color||T.dark, fontSize:11, fontWeight:600,
                            cursor:'pointer', fontFamily:'inherit', outline:'none' }}>
                          {sopts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : <Badge type={t.status} small/>}
                    </td>
                    <td style={{ padding:'10px 13px', fontSize:11, color:t.done_at?T.green:T.light }}>{t.done_at||'—'}</td>
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
          options={[{value:'',label:'— Chọn nhân viên —'},...assignable.map((u: any) => ({value:u.id,label:`${u.name} — ${u.dept_name||''}`}))]}/>
        <Sel label="Mức ưu tiên" value={form.priority} onChange={(v: string) => setForm(f => ({...f, priority:v}))}
          options={[{value:'high',label:'🔴 Cao'},{value:'mid',label:'🟡 Trung bình'},{value:'low',label:'🟢 Thấp'}]}/>
        <Inp label="Deadline *" type="date" value={form.deadline} onChange={(v: string) => setForm(f => ({...f, deadline:v}))}/>
        <Inp label="Ghi chú" value={form.notes} onChange={(v: string) => setForm(f => ({...f, notes:v}))} placeholder="Ghi chú thêm..."/>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:8 }}>
          <GoldBtn outline small onClick={() => setShow(false)}>Hủy</GoldBtn>
          <GoldBtn small onClick={create} disabled={!form.title||!form.deadline||!form.assignee_id}>Tạo task</GoldBtn>
        </div>
      </Modal>
    </div>
  )
}

// ══ KẾT THÚC PHẦN 2 — Paste tiếp Phần 3 bên dưới ══
// ═══════════════════════════════════════════════
// PHẦN 3/4 — Paste nối tiếp bên dưới Phần 2
// ═══════════════════════════════════════════════

// ── TEMPLATES ────────────────────────────────────
function Templates({ templates, setTemplates, allUsers, mobile }: any) {
  const [show, setShow]     = useState(false)
  const [edit, setEdit]     = useState<any>(null)
  const [form, setForm]     = useState({ title:'', description:'', assignee_id:'', priority:'mid', freq:'Hàng ngày', deadline_suggest:'', mins:'30', active:true })
  const p = mobile ? '16px' : '24px'
  const staff = allUsers.filter((u: any) => u.role !== 'admin')

  const openCreate = () => { setEdit(null); setForm({ title:'', description:'', assignee_id:'', priority:'mid', freq:'Hàng ngày', deadline_suggest:'', mins:'30', active:true }); setShow(true) }
  const openEdit = (t: any) => { setEdit(t); setForm({ title:t.title, description:t.description||'', assignee_id:t.assignee_id||'', priority:t.priority, freq:t.freq, deadline_suggest:t.deadline_suggest||'', mins:String(t.mins), active:t.active }); setShow(true) }

  const save = async () => {
    if (!form.title || !form.assignee_id) return
    if (edit) {
      const updated = {...edit, ...form, mins:Number(form.mins)}
      setTemplates((prev: any) => prev.map((t: any) => t.id === edit.id ? updated : t))
      await db.from('checklist_templates').upsert(updated)
    } else {
      const newT = { id:'tp'+Date.now(), ...form, mins:Number(form.mins) }
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

  return (
    <div style={{ padding:`0 ${p} ${mobile?'80px':p}` }}>
      <Topbar mobile={mobile} title="Template checklist" subtitle="Admin quản lý — tự sinh checklist hàng ngày"
        action={<GoldBtn small onClick={openCreate}>+ Thêm template</GoldBtn>}/>

      {deptGroups.map(group => (
        <Card key={group.dept} style={{ padding:0, overflow:'hidden', marginBottom:16 }}>
          <div style={{ background:DEPT_COLOR[group.dept], padding:'11px 16px' }}>
            <span style={{ color:'#fff', fontWeight:700, fontSize:14 }}>{group.name} — {group.items.length} template</span>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <TH cols={['Công việc','Giao cho','Tần suất','Ưu tiên','Phút','Deadline gợi ý','Trạng thái','']}/>
            <tbody>
              {group.items.map((tp: any, i: number) => {
                const assignee = allUsers.find((u: any) => u.id === tp.assignee_id)
                return (
                  <tr key={tp.id} style={{ background:i%2===0?'#fff':T.bg, borderBottom:`1px solid ${T.border}`, opacity:tp.active?1:0.5 }}>
                    <td style={{ padding:'9px 13px', fontSize:13, fontWeight:500, color:T.dark }}>{tp.title}</td>
                    <td style={{ padding:'9px 13px' }}>{assignee && <Av u={assignee} size={22} showDept/>}</td>
                    <td style={{ padding:'9px 13px' }}>
                      <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:20,
                        color:FREQ_COLOR[tp.freq]?.color, background:FREQ_COLOR[tp.freq]?.bg }}>{tp.freq}</span>
                    </td>
                    <td style={{ padding:'9px 13px' }}><Badge cfg={PRI_CFG[tp.priority]} small/></td>
                    <td style={{ padding:'9px 13px', fontSize:12, color:T.med }}>{tp.mins}'</td>
                    <td style={{ padding:'9px 13px', fontSize:12, color:T.med }}>{tp.deadline_suggest||'—'}</td>
                    <td style={{ padding:'9px 13px' }}>
                      <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:20,
                        color:tp.active?T.green:T.gray, background:tp.active?T.greenBg:T.grayBg }}>
                        {tp.active ? 'Đang dùng' : 'Tắt'}
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

      <Modal open={show} onClose={() => setShow(false)} title={edit ? 'Sửa template' : 'Thêm template mới'}>
        <Inp label="Tiêu đề *" value={form.title} onChange={(v: string) => setForm(f => ({...f, title:v}))} placeholder="Nhập tiêu đề..."/>
        <Inp label="Mô tả" value={form.description} onChange={(v: string) => setForm(f => ({...f, description:v}))} placeholder="Mô tả ngắn..."/>
        <Sel label="Giao cho *" value={form.assignee_id} onChange={(v: string) => setForm(f => ({...f, assignee_id:v}))}
          options={[{value:'',label:'— Chọn nhân viên —'},...staff.map((u: any) => ({value:u.id,label:`${u.name} — ${u.dept_name||''}`}))]}/>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Sel label="Tần suất" value={form.freq} onChange={(v: string) => setForm(f => ({...f, freq:v}))}
            options={['Hàng ngày','Hàng tuần','Hàng tháng'].map(v => ({value:v, label:v}))}/>
          <Sel label="Ưu tiên" value={form.priority} onChange={(v: string) => setForm(f => ({...f, priority:v}))}
            options={[{value:'high',label:'🔴 Cao'},{value:'mid',label:'🟡 Trung bình'},{value:'low',label:'🟢 Thấp'}]}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Inp label="Thời gian (phút)" type="number" value={form.mins} onChange={(v: string) => setForm(f => ({...f, mins:v}))}/>
          <Inp label="Deadline gợi ý" value={form.deadline_suggest} onChange={(v: string) => setForm(f => ({...f, deadline_suggest:v}))} placeholder="vd: 09:00"/>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <input type="checkbox" id="tpactive" checked={form.active} onChange={e => setForm(f => ({...f, active:e.target.checked}))}/>
          <label htmlFor="tpactive" style={{ fontSize:13, color:T.dark, cursor:'pointer' }}>Đang hoạt động</label>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
          <GoldBtn outline small onClick={() => setShow(false)}>Hủy</GoldBtn>
          <GoldBtn small onClick={save} disabled={!form.title||!form.assignee_id}>Lưu</GoldBtn>
        </div>
      </Modal>
    </div>
  )
}

// ── ATTENDANCE ────────────────────────────────────
function Attendance({ user, allUsers, leaveRequests, mobile }: any) {
  const [date, setDate]       = useState(todayISO())
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editRow, setEditRow] = useState<any>(null)
  const [editForm, setEditForm] = useState({ status:'present', late_mins:0, reason:'', notes:'' })
  const p = mobile ? '16px' : '24px'
  const canAll  = user.role === 'admin'
  const canMark = user.role === 'admin' || user.role === 'mgr'

  const staffList = canAll
    ? allUsers.filter((u: any) => u.role !== 'admin')
    : allUsers.filter((u: any) => u.dept_id === user.dept_id && u.role !== 'admin' && u.id !== user.id)

  const deptGroups = canAll
    ? ['kho','sale','vp'].map(d => ({ dept:d, name:DEPT_NAME[d], users:staffList.filter((u: any) => u.dept_id === d) }))
    : [{ dept:user.dept_id, name:user.dept_name, users:staffList }]

  const hasLeave = (uid: string) =>
    leaveRequests.some((r: any) => r.user_id === uid && r.status === 'approved' && r.start_date <= date && r.end_date >= date)

  useEffect(() => { loadRecords() }, [date])

  const loadRecords = async () => {
    setLoading(true)
    const { data } = await db.from('attendance').select('*').eq('date', date)
    setRecords(data || [])
    setLoading(false)
  }

  const getRec = (uid: string) => records.find(r => r.user_id === uid)

  const getStatus = (uid: string) => {
    const rec = getRec(uid)
    if (rec) return rec.status
    if (hasLeave(uid)) return 'leave'
    return 'present'
  }

  const quickMark = async (u: any, status: string) => {
    const ex = getRec(u.id)
    const rec = { id:ex?.id||`att_${u.id}_${date.replace(/-/g,'')}`, date, user_id:u.id, dept_id:u.dept_id,
      status, late_mins:0, reason:'', notes:'', marked_by:user.id, created_at:fmtNow() }
    setRecords(prev => ex ? prev.map(r => r.user_id === u.id ? rec : r) : [...prev, rec])
    await db.from('attendance').upsert(rec)
  }

  const openEdit = (u: any) => {
    const rec = getRec(u.id)
    setEditRow(u)
    setEditForm({ status:rec?.status||(hasLeave(u.id)?'leave':'present'), late_mins:rec?.late_mins||0, reason:rec?.reason||'', notes:rec?.notes||'' })
  }

  const saveEdit = async () => {
    if (!editRow) return
    const ex = getRec(editRow.id)
    const rec = { id:ex?.id||`att_${editRow.id}_${date.replace(/-/g,'')}`, date, user_id:editRow.id,
      dept_id:editRow.dept_id, ...editForm, late_mins:Number(editForm.late_mins), marked_by:user.id, created_at:fmtNow() }
    setRecords(prev => ex ? prev.map(r => r.user_id === editRow.id ? rec : r) : [...prev, rec])
    await db.from('attendance').upsert(rec)
    setEditRow(null)
  }

  const scheduleLabel = (deptId: string) => {
    const s = SCHEDULE[deptId] || SCHEDULE['sale']
    return `Vào: ${s.in} | Nghỉ trưa: ${s.breakStart}–${s.breakEnd} | Tan: ${s.out}`
  }

  const summary = (users: any[]) => {
    const c: any = { present:0, late:0, absent:0, sick:0, leave:0, half:0 }
    users.forEach(u => { const s = getStatus(u.id); if (s in c) c[s]++ })
    return c
  }

  return (
    <div style={{ padding:`0 ${p} ${mobile?'80px':p}` }}>
      <Topbar mobile={mobile} title="Chấm công" subtitle="Quản lý điểm danh nhân viên"
        action={
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ padding:'7px 11px', border:`1px solid ${T.border}`, borderRadius:8,
              fontSize:13, fontFamily:'inherit', color:T.dark, background:T.bg, cursor:'pointer' }}/>
        }/>

      {loading ? (
        <div style={{ textAlign:'center', padding:40, color:T.light }}>Đang tải...</div>
      ) : deptGroups.map(group => {
        const sum = summary(group.users)
        return (
          <div key={group.dept} style={{ marginBottom:20 }}>
            <div style={{ background:DEPT_COLOR[group.dept], borderRadius:'10px 10px 0 0', padding:'12px 16px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                <div>
                  <span style={{ color:'#fff', fontWeight:700, fontSize:14 }}>🏢 {group.name}</span>
                  <span style={{ color:'rgba(255,255,255,0.6)', fontSize:11, marginLeft:10 }}>{scheduleLabel(group.dept)}</span>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  {Object.entries(sum).map(([st, cnt]: any) => cnt > 0 && (
                    <span key={st} style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20,
                      color:ATT_STATUS[st]?.color || T.gray, background:'rgba(255,255,255,0.9)' }}>
                      {ATT_STATUS[st]?.label.split(' ')[0]} {cnt}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:'0 0 10px 10px', overflow:'hidden' }}>
              {group.users.map((u: any, i: number) => {
                const status = getStatus(u.id)
                const rec = getRec(u.id)
                const sc = ATT_STATUS[status] || ATT_STATUS.present
                return (
                  <div key={u.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 16px',
                    borderBottom:i < group.users.length-1 ? `1px solid ${T.border}` : 'none',
                    background:['absent','sick'].includes(status)?'#FFF5F5':status==='late'?'#FFFBEB':'#fff' }}>
                    <Av u={u} size={36}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:T.dark }}>{u.name}</div>
                      {rec?.late_mins > 0 && <div style={{ fontSize:11, color:T.amber }}>Muộn {rec.late_mins} phút</div>}
                      {rec?.reason && <div style={{ fontSize:11, color:T.light }}>Lý do: {rec.reason}</div>}
                      {rec?.notes && <div style={{ fontSize:11, color:T.blue }}>📝 {rec.notes}</div>}
                      {hasLeave(u.id) && status !== 'absent' && <div style={{ fontSize:10, color:T.blue }}>📅 Có nghỉ phép đã duyệt</div>}
                    </div>
                    {canMark && !mobile && (
                      <div style={{ display:'flex', gap:5 }}>
                        {Object.entries(ATT_STATUS).map(([st, cfg]: any) => (
                          <button key={st} onClick={() => quickMark(u, st)}
                            style={{ padding:'5px 9px', borderRadius:7, cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:600,
                              border:`1.5px solid ${status === st ? cfg.color : T.border}`,
                              background:status === st ? cfg.bg : 'transparent',
                              color:status === st ? cfg.color : T.light }}>
                            {cfg.label.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    )}
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20,
                        color:sc.color, background:sc.bg, whiteSpace:'nowrap' }}>{sc.label}</span>
                      {canMark && (
                        <button onClick={() => openEdit(u)}
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
        )
      })}

      <Modal open={!!editRow} onClose={() => setEditRow(null)} title={`Chấm công: ${editRow?.name}`}>
        <div style={{ padding:'10px 12px', background:T.bg, borderRadius:8, marginBottom:14 }}>
          <div style={{ fontSize:12, color:T.med }}>{scheduleLabel(editRow?.dept_id)}</div>
        </div>
        <Sel label="Trạng thái" value={editForm.status} onChange={(v: string) => setEditForm(f => ({...f, status:v}))}
          options={Object.entries(ATT_STATUS).map(([v, s]: any) => ({ value:v, label:s.label }))}/>
        {editForm.status === 'late' && (
          <Inp label="Số phút đi muộn" type="number" value={String(editForm.late_mins)} onChange={(v: string) => setEditForm(f => ({...f, late_mins:Number(v)}))} placeholder="VD: 15"/>
        )}
        {['absent','sick','half'].includes(editForm.status) && (
          <Inp label="Lý do" value={editForm.reason} onChange={(v: string) => setEditForm(f => ({...f, reason:v}))} placeholder="Nhập lý do..."/>
        )}
        <Inp label="Ghi chú thêm" value={editForm.notes} onChange={(v: string) => setEditForm(f => ({...f, notes:v}))} placeholder="Ghi chú..."/>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
          <GoldBtn outline small onClick={() => setEditRow(null)}>Hủy</GoldBtn>
          <GoldBtn small onClick={saveEdit}>Lưu</GoldBtn>
        </div>
      </Modal>
    </div>
  )
}

// ── ANNOUNCEMENTS ─────────────────────────────────
function Announcements({ user, allUsers, mobile }: any) {
  const [items, setItems]     = useState<any[]>([])
  const [reads, setReads]     = useState<any[]>([])
  const [show, setShow]       = useState(false)
  const [form, setForm]       = useState({ title:'', content:'', target_dept:'all', priority:'normal' })
  const [expanded, setExpanded] = useState<string[]>([])
  const p = mobile ? '16px' : '24px'
  const canCreate = user.role === 'admin' || user.role === 'mgr'

  useEffect(() => {
    Promise.all([
      db.from('announcements').select('*').order('created_at', { ascending:false }),
      db.from('announcement_reads').select('*').eq('user_id', user.id),
    ]).then(([ann, rd]) => { setItems(ann.data || []); setReads(rd.data || []) })
  }, [user.id])

  const myItems = items
    .filter(a => a.target_dept === 'all' || a.target_dept === user.dept_id)
    .sort((a, b) => {
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1
      if (b.priority === 'urgent' && a.priority !== 'urgent') return 1
      return b.created_at.localeCompare(a.created_at)
    })

  const isRead = (id: string) => reads.some(r => r.announcement_id === id)
  const unread = myItems.filter(a => !isRead(a.id)).length

  const markRead = async (id: string) => {
    if (isRead(id)) return
    const rec = { id:`rd_${id}_${user.id}`, announcement_id:id, user_id:user.id, read_at:fmtNow() }
    setReads(prev => [...prev, rec])
    await db.from('announcement_reads').upsert(rec)
  }

  const toggle = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
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
    setItems(prev => prev.filter(a => a.id !== id))
    await db.from('announcements').delete().eq('id', id)
  }

  return (
    <div style={{ padding:`0 ${p} ${mobile?'80px':p}` }}>
      <Topbar mobile={mobile} title="Thông báo nội bộ"
        subtitle={unread > 0 ? `${unread} thông báo chưa đọc` : 'Đã đọc hết'}
        action={canCreate && <GoldBtn small onClick={() => setShow(true)}>+ Tạo thông báo</GoldBtn>}/>

      {myItems.length === 0 ? (
        <Card style={{ textAlign:'center', padding:'48px', color:T.light }}>
          <div style={{ fontSize:36, marginBottom:10 }}>📣</div>
          <div style={{ fontSize:14, fontWeight:500 }}>Chưa có thông báo nào</div>
        </Card>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {myItems.map(a => {
            const read = isRead(a.id)
            const exp  = expanded.includes(a.id)
            const urgent = a.priority === 'urgent'
            const auth = allUsers.find((u: any) => u.id === a.author_id)
            const targetLabel = a.target_dept === 'all' ? 'Toàn công ty' : DEPT_NAME[a.target_dept] || a.target_dept
            return (
              <div key={a.id} style={{ background:T.card,
                border:`2px solid ${urgent ? T.red : read ? T.border : T.gold}`,
                borderRadius:12, overflow:'hidden' }}>
                {urgent && <div style={{ background:T.red, padding:'5px 14px', fontSize:11, fontWeight:700, color:'#fff' }}>🔴 THÔNG BÁO KHẨN</div>}
                <div style={{ padding:'14px 16px', cursor:'pointer' }} onClick={() => toggle(a.id)}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                        {!read && <div style={{ width:8, height:8, borderRadius:'50%', background:T.gold, flexShrink:0 }}/>}
                        <div style={{ fontSize:14, fontWeight:read ? 500 : 700, color:T.dark }}>{a.title}</div>
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                        <span style={{ fontSize:10, padding:'2px 7px', borderRadius:20, fontWeight:600, background:T.grayBg, color:T.gray }}>📢 {targetLabel}</span>
                        {auth && <span style={{ fontSize:11, color:T.light }}>bởi {auth.name}</span>}
                        <span style={{ fontSize:11, color:T.light }}>{a.created_at}</span>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      {(user.role === 'admin' || a.author_id === user.id) && (
                        <button onClick={e => { e.stopPropagation(); remove(a.id) }}
                          style={{ padding:'4px 8px', borderRadius:6, border:`1px solid ${T.redBg}`, background:T.redBg, cursor:'pointer', fontSize:11, fontFamily:'inherit', color:T.red }}>🗑️</button>
                      )}
                      <span style={{ color:T.light, fontSize:14 }}>{exp ? '▲' : '▼'}</span>
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

// ══ KẾT THÚC PHẦN 3 — Paste tiếp Phần 4 bên dưới ══
// ═══════════════════════════════════════════════
// PHẦN 4/4 — Paste nối tiếp bên dưới Phần 3
// ═══════════════════════════════════════════════

// ── LEAVE ─────────────────────────────────────────
function Leave({ user, allUsers, leaveRequests, setLeaveRequests, mobile }: any) {
  const [show, setShow]           = useState(false)
  const [reviewItem, setReviewItem] = useState<any>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [form, setForm]           = useState({ start_date:'', end_date:'', type:'annual', reason:'' })
  const [tab, setTab]             = useState('mine')
  const p = mobile ? '16px' : '24px'
  const canApprove = user.role === 'admin' || user.role === 'mgr'
  const dids = allUsers.filter((u: any) => u.dept_id === user.dept_id).map((u: any) => u.id)

  const myReqs   = leaveRequests.filter((r: any) => r.user_id === user.id)
  const pending  = leaveRequests.filter((r: any) => r.status === 'pending' && (user.role === 'admin' || dids.includes(r.user_id)))
  const allV     = user.role === 'admin' ? leaveRequests : leaveRequests.filter((r: any) => dids.includes(r.user_id) || r.user_id === user.id)

  // Danh sách hiển thị — KHÔNG dùng as casting trong JSX để tránh parse error
  const tabList: Array<[string, string]> = [['mine', `📋 Đơn của tôi (${myReqs.length})`]]
  if (canApprove) {
    tabList.push(['pending', `⏳ Chờ duyệt (${pending.length})`])
    tabList.push(['all', `📊 Tất cả (${allV.length})`])
  }
  const displayList = tab === 'mine' ? myReqs : tab === 'pending' ? pending : allV

  const submit = async () => {
    if (!form.start_date || !form.end_date || !form.reason) return
    const days = daysBetween(form.start_date, form.end_date)
    const req = { id:'lr'+Date.now(), ...form, user_id:user.id, dept_id:user.dept_id,
      status:'pending', reviewed_by:'', reviewed_at:'', review_notes:'', created_at:fmtNow(), days }
    setLeaveRequests((prev: any) => [req, ...prev])
    await db.from('leave_requests').insert(req)
    setShow(false)
    setForm({ start_date:'', end_date:'', type:'annual', reason:'' })
  }

  const review = async (id: string, status: string) => {
    const req = leaveRequests.find((r: any) => r.id === id); if (!req) return
    const updated = { ...req, status, reviewed_by:user.id, reviewed_at:fmtNow(), review_notes:reviewNotes }
    setLeaveRequests((prev: any) => prev.map((r: any) => r.id === id ? updated : r))
    await db.from('leave_requests').upsert(updated)
    setReviewItem(null); setReviewNotes('')
  }

  const LS: any = {
    pending:  { label:'⏳ Chờ duyệt', color:T.amber, bg:T.amberBg },
    approved: { label:'✅ Đã duyệt',  color:T.green, bg:T.greenBg },
    rejected: { label:'❌ Từ chối',   color:T.red,   bg:T.redBg   },
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
              border:`1.5px solid ${tab === id ? T.gold : T.border}`,
              background:tab === id ? T.goldBg : 'transparent',
              color:tab === id ? T.goldText : T.med,
              fontWeight:tab === id ? 600 : 400 }}>
            {label}
          </button>
        ))}
      </div>

      {displayList.length === 0 ? (
        <Card style={{ textAlign:'center', padding:'40px', color:T.light }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🏖️</div>
          <div style={{ fontSize:14, fontWeight:500 }}>
            {tab === 'pending' ? 'Không có đơn chờ duyệt' : 'Chưa có đơn nghỉ phép nào'}
          </div>
        </Card>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {displayList.map((r: any) => {
            const req = allUsers.find((u: any) => u.id === r.user_id)
            const rev = allUsers.find((u: any) => u.id === r.reviewed_by)
            const sc = LS[r.status] || {}
            const days = r.days || daysBetween(r.start_date, r.end_date)
            const canReview = canApprove && r.status === 'pending' && (user.role === 'admin' || dids.includes(r.user_id))
            return (
              <div key={r.id} style={{ background:T.card,
                border:`1px solid ${r.status === 'pending' ? T.amber : T.border}`,
                borderRadius:12, padding:'16px 18px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10, marginBottom:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:6, flexWrap:'wrap' }}>
                      {req && <Av u={req} size={28} showDept/>}
                      <span style={{ fontSize:13, fontWeight:700, padding:'2px 9px', borderRadius:20, color:T.goldText, background:T.goldBg }}>
                        {LEAVE_TYPE[r.type] || r.type}
                      </span>
                      <span style={{ fontSize:11, color:T.light }}>{days} ngày</span>
                    </div>
                    <div style={{ fontSize:12, color:T.dark, marginBottom:3 }}>
                      📅 {fmtDate(r.start_date)} → {fmtDate(r.end_date)}
                    </div>
                    <div style={{ fontSize:12, color:T.med }}>Lý do: {r.reason}</div>
                    {r.review_notes && <div style={{ fontSize:11, color:T.blue, marginTop:4 }}>💬 Phản hồi: {r.review_notes}</div>}
                    {rev && r.reviewed_at && <div style={{ fontSize:11, color:T.light, marginTop:3 }}>Xử lý bởi {rev.name} • {r.reviewed_at}</div>}
                    <div style={{ fontSize:11, color:T.light, marginTop:3 }}>Gửi lúc: {r.created_at}</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, color:sc.color, background:sc.bg }}>{sc.label}</span>
                    {canReview && (
                      <button onClick={() => { setReviewItem(r); setReviewNotes('') }}
                        style={{ padding:'6px 13px', borderRadius:7, border:`1.5px solid ${T.gold}`,
                          background:T.goldBg, cursor:'pointer', fontSize:12, fontFamily:'inherit',
                          color:T.goldText, fontWeight:600 }}>
                        Xem xét
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal xin nghỉ */}
      <Modal open={show} onClose={() => setShow(false)} title="Xin nghỉ phép">
        <Sel label="Loại nghỉ phép" value={form.type} onChange={(v: string) => setForm(f => ({...f, type:v}))}
          options={Object.entries(LEAVE_TYPE).map(([v, l]) => ({ value:v, label:l }))}/>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Inp label="Từ ngày *" type="date" value={form.start_date} onChange={(v: string) => setForm(f => ({...f, start_date:v}))}/>
          <Inp label="Đến ngày *" type="date" value={form.end_date} onChange={(v: string) => setForm(f => ({...f, end_date:v, start_date:f.start_date||v}))}/>
        </div>
        {form.start_date && form.end_date && (
          <div style={{ padding:'8px 12px', background:T.goldBg, borderRadius:8, fontSize:12, color:T.goldText, marginBottom:13, fontWeight:600 }}>
            📅 Tổng {daysBetween(form.start_date, form.end_date)} ngày nghỉ
          </div>
        )}
        <Inp label="Lý do *" value={form.reason} onChange={(v: string) => setForm(f => ({...f, reason:v}))} placeholder="Nhập lý do xin nghỉ..."/>
        <div style={{ fontSize:11, color:T.light, marginBottom:14 }}>Đơn sẽ được gửi tới quản lý để phê duyệt.</div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
          <GoldBtn outline small onClick={() => setShow(false)}>Hủy</GoldBtn>
          <GoldBtn small onClick={submit} disabled={!form.start_date||!form.end_date||!form.reason}>Gửi đơn</GoldBtn>
        </div>
      </Modal>

      {/* Modal duyệt */}
      <Modal open={!!reviewItem} onClose={() => setReviewItem(null)} title="Xét duyệt đơn nghỉ phép">
        {reviewItem && (
          <>
            <div style={{ padding:'12px 14px', background:T.bg, borderRadius:8, marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:600, color:T.dark, marginBottom:6 }}>
                {allUsers.find((u: any) => u.id === reviewItem.user_id)?.name}
              </div>
              <div style={{ fontSize:12, color:T.med }}>{LEAVE_TYPE[reviewItem.type]} — {daysBetween(reviewItem.start_date, reviewItem.end_date)} ngày</div>
              <div style={{ fontSize:12, color:T.med }}>📅 {fmtDate(reviewItem.start_date)} → {fmtDate(reviewItem.end_date)}</div>
              <div style={{ fontSize:12, color:T.dark, marginTop:6 }}>Lý do: {reviewItem.reason}</div>
            </div>
            <Inp label="Ghi chú phản hồi" value={reviewNotes} onChange={setReviewNotes} placeholder="Nhập ghi chú (tùy chọn)..."/>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
              <GoldBtn outline small onClick={() => setReviewItem(null)}>Hủy</GoldBtn>
              <GoldBtn danger small onClick={() => review(reviewItem.id, 'rejected')}>❌ Từ chối</GoldBtn>
              <GoldBtn small onClick={() => review(reviewItem.id, 'approved')}>✅ Duyệt</GoldBtn>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}

// ── USER MANAGEMENT ───────────────────────────────
function UserManagement({ allUsers, setAllUsers, departments, mobile }: any) {
  const [show, setShow]     = useState(false)
  const [edit, setEdit]     = useState<any>(null)
  const [form, setForm]     = useState({ name:'', dept_id:'kho', role:'staff', ini:'', pin:'0000', active:true })
  const [deptF, setDeptF]   = useState('all')
  const p = mobile ? '16px' : '24px'
  const autoIni = (name: string) => { const w = name.trim().split(' '); return (w.length >= 2 ? w[0][0]+w[w.length-1][0] : name.slice(0,2)).toUpperCase() }

  const openCreate = () => { setEdit(null); setForm({ name:'', dept_id:'kho', role:'staff', ini:'', pin:'0000', active:true }); setShow(true) }
  const openEdit   = (u: any) => { setEdit(u); setForm({ name:u.name, dept_id:u.dept_id, role:u.role, ini:u.ini, pin:u.pin, active:u.active }); setShow(true) }

  const save = async () => {
    if (!form.name || !form.pin) return
    const deptName = departments.find((d: any) => d.id === form.dept_id)?.name || ''
    if (edit) {
      const updated = {...edit, ...form, dept_name:deptName}
      setAllUsers((prev: any) => prev.map((u: any) => u.id === edit.id ? updated : u))
      await db.from('users').upsert({id:edit.id, ...form})
    } else {
      const newId = form.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s/g,'_')+'_'+Date.now().toString().slice(-4)
      setAllUsers((prev: any) => [...prev, {id:newId, ...form, dept_name:deptName}])
      await db.from('users').insert({id:newId, ...form})
    }
    setShow(false)
  }

  const filtered = deptF === 'all' ? allUsers : allUsers.filter((u: any) => u.dept_id === deptF)
  const deptGroups = ['kho','sale','vp'].map(d => ({ id:d, name:DEPT_NAME[d], users:filtered.filter((u: any) => u.dept_id === d) }))

  return (
    <div style={{ padding:`0 ${p} ${mobile?'80px':p}` }}>
      <Topbar mobile={mobile} title="Quản lý nhân viên"
        subtitle={`${allUsers.filter((u: any) => u.active && u.role !== 'admin').length} nhân viên đang hoạt động`}
        action={<GoldBtn small onClick={openCreate}>+ Thêm nhân viên</GoldBtn>}/>

      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
        {[{value:'all',label:'Tất cả'},...departments.filter((d: any) => d.id !== 'all').map((d: any) => ({value:d.id,label:d.name}))].map((f: any) => (
          <button key={f.value} onClick={() => setDeptF(f.value)}
            style={{ padding:'5px 12px', borderRadius:7, cursor:'pointer', fontFamily:'inherit', fontSize:12,
              border:`1.5px solid ${deptF === f.value ? T.gold : T.border}`,
              background:deptF === f.value ? T.goldBg : 'transparent',
              color:deptF === f.value ? T.goldText : T.med,
              fontWeight:deptF === f.value ? 600 : 400 }}>{f.label}</button>
        ))}
      </div>

      {deptGroups.map(group => group.users.length === 0 ? null : (
        <Card key={group.id} style={{ padding:0, overflow:'hidden', marginBottom:14 }}>
          <div style={{ background:DEPT_COLOR[group.id], padding:'11px 16px' }}>
            <span style={{ color:'#fff', fontWeight:700, fontSize:14 }}>{group.name} — {group.users.length} người</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:mobile?'1fr':'repeat(auto-fill,minmax(260px,1fr))' }}>
            {group.users.map((u: any) => (
              <div key={u.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
                borderBottom:`1px solid ${T.border}`, opacity:u.active ? 1 : 0.5 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:DEPT_COLOR[u.dept_id]||T.gold,
                  flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                  color:'#fff', fontSize:13, fontWeight:700 }}>{u.ini}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:T.dark }}>{u.name}</div>
                  <div style={{ display:'flex', gap:6, marginTop:3 }}>
                    <span style={{ fontSize:10, padding:'1px 6px', borderRadius:10, fontWeight:600,
                      color:u.role==='mgr'?T.blue:T.gray, background:u.role==='mgr'?T.blueBg:T.grayBg }}>
                      {u.role === 'mgr' ? 'Quản lý' : 'Nhân viên'}
                    </span>
                    {!u.active && <span style={{ fontSize:10, color:T.red }}>Đã khóa</span>}
                  </div>
                </div>
                <button onClick={() => openEdit(u)}
                  style={{ padding:'5px 12px', borderRadius:7, border:`1px solid ${T.border}`,
                    background:'transparent', cursor:'pointer', fontSize:12, fontFamily:'inherit', color:T.med }}>Sửa</button>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Modal open={show} onClose={() => setShow(false)} title={edit ? 'Sửa tài khoản' : 'Thêm nhân viên mới'}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Inp label="Họ tên *" value={form.name} onChange={(v: string) => setForm(f => ({...f, name:v, ini:autoIni(v)}))} placeholder="Nguyễn Văn A"/>
          <Inp label="Viết tắt" value={form.ini} onChange={(v: string) => setForm(f => ({...f, ini:v.toUpperCase().slice(0,3)}))} placeholder="VA"/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Sel label="Phòng ban" value={form.dept_id} onChange={(v: string) => setForm(f => ({...f, dept_id:v}))}
            options={departments.filter((d: any) => d.id !== 'all').map((d: any) => ({value:d.id,label:d.name}))}/>
          <Sel label="Vai trò" value={form.role} onChange={(v: string) => setForm(f => ({...f, role:v}))}
            options={[{value:'staff',label:'Nhân viên'},{value:'mgr',label:'Quản lý'}]}/>
        </div>
        <Inp label="Mã PIN *" type="password" value={form.pin} onChange={(v: string) => setForm(f => ({...f, pin:v}))} placeholder="Tối thiểu 4 ký tự"/>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <input type="checkbox" id="uact" checked={form.active} onChange={e => setForm(f => ({...f, active:e.target.checked}))}/>
          <label htmlFor="uact" style={{ fontSize:13, color:T.dark, cursor:'pointer' }}>Tài khoản đang hoạt động</label>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
          <GoldBtn outline small onClick={() => setShow(false)}>Hủy</GoldBtn>
          <GoldBtn small onClick={save} disabled={!form.name||!form.pin}>Lưu</GoldBtn>
        </div>
      </Modal>
    </div>
  )
}

// ── HISTORY ───────────────────────────────────────
function History({ user, history, allUsers, mobile }: any) {
  const [mode, setMode]       = useState<'date'|'person'>('date')
  const [dateFilter, setDateFilter] = useState('')
  const p = mobile ? '16px' : '24px'
  const canAll = user.role === 'admin'
  const dids = allUsers.filter((u: any) => u.dept_id === user.dept_id).map((u: any) => u.id)
  const myH = canAll ? history : user.role === 'mgr' ? history.filter((h: any) => dids.includes(h.assignee_id)) : history.filter((h: any) => h.assignee_id === user.id)
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
          <div style={{ fontSize:12, marginTop:6 }}>Sẽ xuất hiện sau kỳ reset đầu tiên</div>
        </Card>
      ) : (
        <>
          <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
            {([['date','📅 Theo ngày'],['person','👤 Theo người']] as [string,string][]).map(([m, l]) => (
              <button key={m} onClick={() => setMode(m as any)}
                style={{ padding:'6px 14px', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontSize:12,
                  border:`1.5px solid ${mode === m ? T.gold : T.border}`,
                  background:mode === m ? T.goldBg : 'transparent',
                  color:mode === m ? T.goldText : T.med, fontWeight:mode === m ? 600 : 400 }}>{l}</button>
            ))}
            <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}
              style={{ padding:'6px 11px', borderRadius:8, border:`1px solid ${T.border}`, fontSize:12, fontFamily:'inherit', color:T.dark, background:T.bg, cursor:'pointer' }}>
              <option value="">Tất cả ngày</option>
              {dates.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {Object.entries(mode === 'date' ? groupBy('date') : groupBy('assignee_id'))
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([key, items]: any) => {
              const done = items.filter((h: any) => h.status === 'done').length
              const label = mode === 'date' ? `📅 ${key}` : `👤 ${allUsers.find((u: any) => u.id === key)?.name || key}`
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
                        const assignee = allUsers.find((u: any) => u.id === h.assignee_id)
                        return (
                          <tr key={h.id||i} style={{ background:i%2===0?'#fff':T.bg, borderBottom:`1px solid ${T.border}` }}>
                            <td style={{ padding:'9px 13px', fontSize:13, fontWeight:500, color:T.dark }}>{h.title}</td>
                            <td style={{ padding:'9px 13px' }}>{assignee && <Av u={assignee} size={22} showDept/>}</td>
                            <td style={{ padding:'9px 13px' }}>
                              <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:20,
                                color:FREQ_COLOR[h.freq]?.color, background:FREQ_COLOR[h.freq]?.bg }}>{h.freq}</span>
                            </td>
                            <td style={{ padding:'9px 13px' }}>
                              <span style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:20,
                                color:h.status==='done'?T.green:T.red, background:h.status==='done'?T.greenBg:T.redBg }}>
                                {h.status === 'done' ? '✅ Hoàn thành' : '❌ Chưa xong'}
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
        </>
      )}
    </div>
  )
}

// ── SETTINGS ──────────────────────────────────────
function Settings({ user, settings, setSettings, onManualReset, mobile }: any) {
  const [notif, setNotif]             = useState(typeof Notification !== 'undefined' && Notification.permission === 'granted')
  const [monthDay, setMonthDay]       = useState(String(settings?.monthly_reset_day || 1))
  const [weekInt, setWeekInt]         = useState(String(settings?.weekly_reset_interval || 7))
  const [oldPin, setOldPin]           = useState('')
  const [newPin, setNewPin]           = useState('')
  const [confirmPin, setConfirmPin]   = useState('')
  const [pinMsg, setPinMsg]           = useState('')
  const [saved, setSaved]             = useState(false)
  const [resetting, setResetting]     = useState(false)
  const p = mobile ? '16px' : '24px'

  const saveSettings = async () => {
    const updated = {...settings, id:'main', monthly_reset_day:Number(monthDay), weekly_reset_interval:Number(weekInt)}
    await db.from('settings').upsert(updated)
    setSettings(updated); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const changePin = async () => {
    const { data } = await db.from('users').select('pin').eq('id', user.id).single()
    if (data?.pin !== oldPin) { setPinMsg('❌ PIN cũ không đúng!'); return }
    if (newPin.length < 4)    { setPinMsg('❌ PIN mới phải từ 4 ký tự!'); return }
    if (newPin !== confirmPin) { setPinMsg('❌ PIN xác nhận không khớp!'); return }
    await db.from('users').update({ pin:newPin }).eq('id', user.id)
    setOldPin(''); setNewPin(''); setConfirmPin('')
    setPinMsg('✅ Đổi PIN thành công!'); setTimeout(() => setPinMsg(''), 3000)
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
              <div style={{ fontSize:12, color:T.light, marginTop:2 }}>{user.dept_name}</div>
              <div style={{ fontSize:11, color:T.gold, marginTop:2, fontWeight:600 }}>
                {user.role === 'admin' ? 'Quản trị viên' : user.role === 'mgr' ? 'Quản lý' : 'Nhân viên'}
              </div>
            </div>
          </div>
          <div style={{ fontSize:13, fontWeight:600, color:T.dark, marginBottom:12 }}>🔐 Đổi mã PIN</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            <Inp label="PIN hiện tại" type="password" value={oldPin} onChange={setOldPin} placeholder="••••"/>
            <Inp label="PIN mới" type="password" value={newPin} onChange={setNewPin} placeholder="••••"/>
            <Inp label="Xác nhận PIN" type="password" value={confirmPin} onChange={setConfirmPin} placeholder="••••"/>
          </div>
          {pinMsg && <div style={{ fontSize:12, color:pinMsg.includes('✅')?T.green:T.red, marginBottom:10 }}>{pinMsg}</div>}
          <GoldBtn small onClick={changePin}>Đổi PIN</GoldBtn>
        </Card>

        <Card>
          <div style={{ fontSize:13, fontWeight:700, color:T.dark, marginBottom:12 }}>🔔 Thông báo nhắc việc</div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:T.dark }}>Thông báo qua trình duyệt</div>
              <div style={{ fontSize:11, color:T.light, marginTop:2 }}>Nhắc 30 phút trước deadline, cảnh báo khi trễ</div>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ fontSize:11, padding:'3px 9px', borderRadius:20, fontWeight:600,
                background:notif?T.greenBg:T.redBg, color:notif?T.green:T.red }}>
                {notif ? 'Đã bật' : 'Chưa bật'}
              </span>
              {!notif && (
                <GoldBtn small onClick={async () => {
                  const perm = await Notification.requestPermission()
                  setNotif(perm === 'granted')
                  if (perm === 'granted') new Notification('🎉 Thông báo đã bật!', { body:`Xin chào ${user.name}!` })
                }}>Bật ngay</GoldBtn>
              )}
            </div>
          </div>
        </Card>

        {user.role === 'admin' && (
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
  const [user, setUser]             = useState<any>(null)
  const [page, setPage]             = useState('checklist')
  const [allUsers, setAllUsers]     = useState<any[]>([])
  const [departments, setDepts]     = useState<any[]>([])
  const [checklist, setChecklist]   = useState<any[]>([])
  const [tasks, setTasks]           = useState<any[]>([])
  const [history, setHistory]       = useState<any[]>([])
  const [settings, setSettings]     = useState<any>(null)
  const [templates, setTemplates]   = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [loading, setLoading]       = useState(false)
  const notifSent                   = useRef(false)
  const width                       = useWindowWidth()
  const mobile                      = width < 768

  // Notifications
  useEffect(() => {
    if (!user || typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    if (!notifSent.current) {
      notifSent.current = true
      const myItems = checklist.filter(c => c.assignee_id === user.id && c.status !== 'done')
      if (myItems.length > 0)
        new Notification(`Chào ${user.name}! 👋`, { body:`Hôm nay có ${myItems.length} việc cần làm.` })
    }
    const interval = setInterval(() => {
      const now = new Date()
      checklist.filter(c => c.assignee_id === user.id && c.status !== 'done' && c.deadline?.includes(':')).forEach(item => {
        const [h, m] = item.deadline.split(':').map(Number)
        const due = new Date(now); due.setHours(h, m, 0)
        const diff = (due.getTime() - now.getTime()) / 60000
        if (diff > 29 && diff <= 30) new Notification('⏰ Sắp đến deadline!', { body:`${item.title} — còn 30 phút!` })
        if (diff < 0 && Math.floor(Math.abs(diff)) % 60 === 0 && Math.floor(Math.abs(diff)) > 0)
          new Notification('🔴 Trễ!', { body:`${item.title} quá hạn ${Math.floor(Math.abs(diff))} phút!` })
      })
      if (now.getHours() === 17 && now.getMinutes() === 0) {
        const left = checklist.filter(c => c.assignee_id === user.id && c.status !== 'done').length
        if (left > 0) new Notification('🌅 Tóm tắt 17:00', { body:`Còn ${left} việc chưa hoàn thành.` })
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [user, checklist])

  // Reset logic
  const performReset = useCallback(async (curCl: any[], tmpl: any[], st: any, manual = false) => {
    const today = todayStr(); const s = st || {}
    const r_daily   = manual || s.last_daily_reset !== today
    const wDiff = s.last_weekly_reset ? (() => { try { const p=s.last_weekly_reset.split('/'); return Math.floor((Date.now()-new Date(`${p[2]}-${p[1]}-${p[0]}`).getTime())/86400000) } catch { return 999 } })() : 999
    const r_weekly  = manual || wDiff >= (s.weekly_reset_interval || 7)
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
      last_daily_reset:   r_daily   ? today : s.last_daily_reset||'',
      last_weekly_reset:  r_weekly  ? today : s.last_weekly_reset||'',
      last_monthly_reset: r_monthly ? today : s.last_monthly_reset||'',
    }
    await db.from('settings').upsert(newSt); setSettings(newSt)
    return true
  }, [])

  // Load data
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
    ]).then(async ([depts, users, tmpl, cl, tk, hist, st, att, lr]) => {
      const deptsData = depts.data || []
      const usersData = (users.data || []).map((u: any) => ({
        ...u, dept_name:deptsData.find((d: any) => d.id === u.dept_id)?.name || ''
      }))
      const tmplData = tmpl.data || []
      const clData   = cl.data   || []
      const stData   = st.data

      setDepts(deptsData); setAllUsers(usersData); setTemplates(tmplData)
      setTasks(tk.data||[]); setHistory(hist.data||[])
      setSettings(stData); setAttendance(att.data||[]); setLeaveRequests(lr.data||[])

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
    }).catch((err: any) => {
      setLoading(false)
      document.body.style.background = '#fff'
      document.body.innerHTML = `<div style="padding:20px;font-size:13px;color:red;word-break:break-all">
        <b>LỖI SAU LOGIN:</b><br/><br/>
        ${err?.message || JSON.stringify(err)}<br/><br/>
        ${err?.stack || ''}
      </div>`
    })
  }, [user])

  const addLog = useCallback(async (_: any) => {}, [])

  const manualReset = useCallback(async () => {
    const { data:cl } = await db.from('checklist').select('*')
    await performReset(cl || [], templates, settings, true)
  }, [settings, templates, performReset])

  // Login screen
  if (!user) {
    if (allUsers.length === 0) {
      db.from('users').select('*').eq('active', true).then(({ data, error }) => {
  if (error) { document.body.innerHTML = `<div style="padding:20px;color:red;background:#fff">${JSON.stringify(error)}</div>`; return }
        if (data) db.from('departments').select('*').then(({ data:depts }) => {
          setAllUsers(data.map((u: any) => ({...u, dept_name:depts?.find((d: any) => d.id === u.dept_id)?.name||''})))
        })
      })
      return (
        <div style={{ minHeight:'100vh', background:'#16120E', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
          <LALogo size={60}/>
          <div style={{ color:T.gold, fontSize:14 }}>Đang tải...</div>
        </div>
      )
    }
    return (
      <LoginScreen allUsers={allUsers} onLogin={(u: any) => {
        setUser(u)
        setPage(u.role === 'admin' || u.role === 'mgr' ? 'dashboard' : 'checklist')
      }}/>
    )
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#16120E', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <LALogo size={60}/>
      <div style={{ color:T.gold, fontSize:14 }}>Đang cập nhật dữ liệu...</div>
    </div>
  )

  const nav = getNav(user.role)
  const validPage = nav.find(n => n.id === page) ? page : nav[0].id
  // DEBUG - xóa sau khi tìm được lỗi
  if (typeof window !== 'undefined') {
    (window as any)._debug = { user: user?.name, loading, page: validPage, mobile, width }
  }
  const pp = { user, allUsers, mobile }

  const dids = allUsers.filter((u: any) => u.dept_id === user.dept_id).map((u: any) => u.id)
  const pendingLeave = leaveRequests.filter((r: any) =>
    r.status === 'pending' && (user.role === 'admin' || dids.includes(r.user_id))).length

  return (
    <ErrorBoundary>
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:"'Segoe UI',system-ui,sans-serif", background:'red' }}>
      {!mobile && (
        <Sidebar user={user} page={validPage} setPage={setPage} pendingLeave={pendingLeave}
          onLogout={() => { setUser(null); setAllUsers([]); setChecklist([]) }}/>
      )}
      <main style={{ flex:1, overflowY:'auto', paddingTop:4 }}>
        {validPage === 'dashboard'  && <Dashboard {...pp} checklist={checklist} tasks={tasks} attendance={attendance}/>}
        {validPage === 'checklist'  && <Checklist {...pp} checklist={checklist} setChecklist={setChecklist} addLog={addLog}/>}
        {validPage === 'tasks'      && <Tasks {...pp} tasks={tasks} setTasks={setTasks} addLog={addLog}/>}
        {validPage === 'templates'  && <Templates {...pp} templates={templates} setTemplates={setTemplates}/>}
        {validPage === 'attendance' && <Attendance {...pp} leaveRequests={leaveRequests} attendance={attendance} setAttendance={setAttendance}/>}
        {validPage === 'announce'   && <Announcements {...pp}/>}
        {validPage === 'leave'      && <Leave {...pp} leaveRequests={leaveRequests} setLeaveRequests={setLeaveRequests}/>}
        {validPage === 'history'    && <History {...pp} history={history}/>}
        {validPage === 'users'      && <UserManagement {...pp} setAllUsers={setAllUsers} departments={departments}/>}
        {validPage === 'settings'   && <Settings {...pp} settings={settings} setSettings={setSettings} onManualReset={manualReset}/>}
      </main>
      {mobile && <BottomNav user={user} page={validPage} setPage={setPage} pendingLeave={pendingLeave}/>}
    </div>
      </ErrorBoundary>
  )
}

// ══ KẾT THÚC PHẦN 4 — Xong! ══
