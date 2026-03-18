import { darken, lighten } from "../utils/theme.js";
import { Calculator2, Calendar, Pill, X } from "../icons.jsx";
import { getCatLabel, haptic, today } from "../utils/helpers.js";
import { CatIcon } from "./ui.jsx";

export default function ModalAddTransaction({ ctx }) {
  const {
    T, dark, lang, L,
    themeAccent, themePrimary,
    categories, transactions,
    form, setForm,
    editItem, setEditItem,
    showForm, setShowForm,
    setShowCalc,
    submitForm,
    kbHeight
  } = ctx;

  return (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)", zIndex:300, display:"flex", alignItems:"flex-end", justifyContent:"center", boxSizing:"border-box" }}
            onClick={e => { if (e.target===e.currentTarget) { setShowForm(false); setEditItem(null); } }}>
            <div className="modal-float" style={{ background:T.modalBg, borderRadius:"24px 24px 0 0", width:"100%", maxWidth:400, boxShadow: dark ? "0 24px 60px rgba(0,0,0,0.8)" : "0 12px 40px rgba(0,0,0,0.2)", overflow:"hidden", maxHeight: kbHeight > 0 ? `calc(100dvh - ${kbHeight}px - env(safe-area-inset-top))` : "88dvh", display:"flex", flexDirection:"column", marginBottom: kbHeight > 0 ? kbHeight : 0, transition:"margin-bottom 0.25s ease, max-height 0.25s ease" }}>

              {/* Header strip */}
              <div style={{ background:`linear-gradient(135deg,${themePrimary},${darken(themePrimary,0.25)})`, padding:"14px 16px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <p style={{ fontSize:14, fontWeight:900, color:"white" }}>{editItem ? L.editTx : L.newTx}</p>
                <button onClick={() => { setShowForm(false); setEditItem(null); }}
                  style={{ width:26, height:26, borderRadius:50, background:"rgba(0,0,0,0.2)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                  <X size={12} color="white" strokeWidth={2.5}/>
                </button>
              </div>

              {/* Body */}
              <div style={{ padding:"14px 16px 16px", display:"flex", flexDirection:"column", gap:10, overflowY:"auto", flex:1 }}>

                {/* Amount row */}
                <div style={{ display:"flex", gap:8, alignItems:"stretch" }}>
                  <div style={{ flex:1, position:"relative", display:"flex", alignItems:"center" }}>
                    <span style={{ position:"absolute", left:14, fontSize:14, fontWeight:800, color:T.textSub, pointerEvents:"none", zIndex:2, userSelect:"none" }}>Rp.</span>
                    <input
                      type="text" inputMode="numeric" placeholder="0"
                      value={form.amountDisplay || ""}
                      onChange={e => {
                        const raw = e.target.value.replace(/\./g,"").replace(/[^0-9]/g,"");
                        const formatted = raw ? Number(raw).toLocaleString("id-ID") : "";
                        setForm(f => ({ ...f, amount: raw ? Number(raw) : "", amountDisplay: formatted }));
                      }}
                      autoFocus
                      style={{ width:"100%", background:T.inp, border:`1.5px solid ${T.inpBorder}`, borderRadius:12, padding:"10px 14px 10px 44px", fontSize:22, fontWeight:900, color:T.text, outline:"none", fontFamily:"inherit", letterSpacing:-0.5, minWidth:0 }}
                    />
                  </div>
                  <button onClick={() => setShowCalc(true)} style={{ width:42, height:42, borderRadius:12, background:T.catBg, border:`1.5px solid ${T.cardBorder}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Calculator2 size={16} color={T.textSub} strokeWidth={2}/>
                  </button>
                </div>

                {/* Date row - full width */}
                <div style={{ position:"relative" }}>
                  <Calendar size={14} color={T.accentText} strokeWidth={2} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", zIndex:2 }}/>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    style={{ width:"100%", boxSizing:"border-box", background:T.inp, border:`1.5px solid ${T.inpBorder}`, borderRadius:12, padding:"10px 12px 10px 32px", fontSize:13, color:T.text, outline:"none", fontFamily:"inherit", colorScheme: dark?"dark":"light" }}/>
                </div>

                {/* Kategori chips — scrollable, touch-isolated */}
                <div
                  style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:2, scrollbarWidth:"none", WebkitOverflowScrolling:"touch", touchAction:"pan-x" }}
                  onTouchStart={e => e.stopPropagation()}
                  onTouchMove={e => e.stopPropagation()}
                >
                  {Object.entries(categories).map(([k, v]) => {
                    const isSel = form.category === k;
                    return (
                      <button key={k} onMouseDown={e => e.preventDefault()} onClick={() => setForm(f => ({ ...f, category: k }))}
                        style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 11px", borderRadius:20, flexShrink:0,
                          background: isSel ? v.color+"22" : T.catBg,
                          border: isSel ? `2px solid ${v.color}` : `1.5px solid ${T.cardBorder}`,
                          cursor:"pointer", transition:"all 0.15s" }}>
                        <CatIcon iconKey={v.icon} size={11} color={isSel ? v.color : T.textSub}/>
                        <span style={{ fontSize:11, fontWeight: isSel ? 700 : 500, color: isSel ? v.color : T.textSub, whiteSpace:"nowrap" }}>{getCatLabel(v, lang)}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Keterangan */}
                <input className="inp" placeholder={L.descPlaceholder} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ background:T.inp, border:`1.5px solid ${T.inpBorder}`, color:T.text }} />

                {/* Lokasi & Catatan — satu baris */}
                <div style={{ display:"flex", gap:8 }}>
                  <input className="inp" placeholder={L.locPlaceholder} value={form.location||""}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    style={{ flex:1, background:T.inp, border:`1.5px solid ${T.inpBorder}`, color:T.text }} />
                  <input className="inp" placeholder={L.notePlaceholder} value={form.note||""}
                    onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    style={{ flex:1, background:T.inp, border:`1.5px solid ${T.inpBorder}`, color:T.text }} />
                </div>

                {/* Actions */}
                <div style={{ display:"flex", gap:8, marginTop:2 }}>
                  <button className="btn-p" style={{ flex:1, fontSize:13, padding:"12px 0",
                    background:`linear-gradient(135deg,${themeAccent},${themePrimary})`,
                    boxShadow:`0 4px 14px ${themeAccent}44` }} onClick={submitForm}>
                    {editItem ? L.save : `+ ${L.add}`}
                  </button>
                  <button className="btn-g" style={{ flex:0.4, background:T.btnG, color:T.btnGText, border:`1.5px solid ${T.btnGBorder}`, fontSize:13, padding:"12px 0" }}
                    onClick={() => { setShowForm(false); setEditItem(null); }}>{L.cancel}</button>
                </div>
              </div>
            </div>
          </div>

        {/* Bottom Nav */}
        {(() => {
          const NI = ({ id, size=22, color }) => {
            const s = { fill:"none", stroke:color, strokeWidth:1.5, strokeLinecap:"round", strokeLinejoin:"round" };
            if (id==="dashboard") return <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M3 12L12 4L21 12"/><path d="M5 10V20C5 20.55 5.45 21 6 21H9V16H15V21H18C18.55 21 19 20.55 19 20V10"/></svg>;
            if (id==="transactions") return <svg width={size} height={size} viewBox="0 0 24 24" {...s}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="17" y2="12"/><line x1="3" y1="18" x2="13" y2="18"/></svg>;
            if (id==="report") return <svg width={size} height={size} viewBox="0 0 24 24" {...s}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
            if (id==="date") return <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M12 21C12 21 3 15 3 8.5C3 5.46 5.46 3 8.5 3C10.2 3 11.72 3.88 12 5C12.28 3.88 13.8 3 15.5 3C18.54 3 21 5.46 21 8.5C21 15 12 21 12 21Z"/></svg>;
            return null;
          };
          const navItems = [
            { id:"dashboard",    label: L.dashboard },
            { id:"transactions", label: L.transactions },
            { id:"report",       label: L.report },
            { id:"date",         label: L.date },
          ];
          const iconActive  = dark ? lighten(themeAccent, 0.15) : themePrimary;
          const iconInactive = dark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.28)";
          const NAV_BTN = 54;

          return (
            <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:100, display:"flex", flexDirection:"column", alignItems:"center", pointerEvents:"none", visibility: (editingGoal !== null || editIncome || quickAddGoalId !== null) ? "hidden" : "visible" }}>
              {/* Pill row */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, paddingTop:4, paddingBottom:20, width:"100%" }}>
              {/* FAB "+" */}
              <button
                onClick={() => { haptic(); setShowForm(true); setEditItem(null); setForm({ date: today(), amount:"", category: Object.keys(categories)[0]||"food", description:"", location:"", note:"" }); }}
                style={{ width:NAV_BTN, height:NAV_BTN, borderRadius:"50%", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, alignSelf:"center", background:`linear-gradient(135deg,${themeAccent},${themePrimary})`, boxShadow:`0 4px 16px ${themeAccent}55`, padding:0, transition:"transform 0.18s cubic-bezier(0.34,1.56,0.64,1)", pointerEvents:"auto" }}
                onTouchStart={e => e.currentTarget.style.transform="scale(0.88)"}
                onTouchEnd={e => e.currentTarget.style.transform="scale(1)"}
              >
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>

              {/* Pill navbar */}
              <div style={{ background: dark ? "rgba(10,10,10,0.72)" : "rgba(255,255,255,0.72)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderRadius:28, padding:"5px 5px", display:"flex", alignItems:"center", gap:0, border:`1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`, boxShadow: dark ? "0 4px 24px rgba(0,0,0,0.45)" : "0 2px 20px rgba(0,0,0,0.1)", pointerEvents:"auto" }}>
                {navItems.map(({ id, label }) => {
                  const isActive = tab === id && !showForm;
                  const isDate = id === "date";
                  const datePink = "#be185d";
                  const datePinkBg = dark ? "rgba(190,24,93,0.15)" : "rgba(190,24,93,0.08)";
                  const activeColor = isDate ? datePink : iconActive;
                  const activeBg = isDate ? datePinkBg : (dark ? `${themeAccent}1c` : `${themePrimary}10`);
                  return (
                    <button key={id}
                      onClick={() => { haptic(); setShowForm(false); changeTab(id); }}
                      style={{ width: isActive ? "auto" : NAV_BTN, minWidth: NAV_BTN, height:NAV_BTN, borderRadius:20, border:"none",
                        background: isActive ? activeBg : "transparent",
                        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                        gap:6, padding: isActive ? "0 14px" : "0",
                        flexShrink:0, transition:"width 0.5s cubic-bezier(0.4,0,0.2,1), min-width 0.5s cubic-bezier(0.4,0,0.2,1), padding 0.5s cubic-bezier(0.4,0,0.2,1), background 0.2s" }}
                    >
                      <NI id={id} size={isActive ? 18 : 22} color={isActive ? activeColor : (isDate ? "#f9a8d4" : iconInactive)}/>
                      {isActive && (
                        <span style={{ fontSize:12, fontWeight:800, color:activeColor, whiteSpace:"nowrap", overflow:"hidden", animation:"nav-label-in 0.55s cubic-bezier(0.4,0,0.2,1) forwards", letterSpacing:0.1 }}>
                          {label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              </div>

            </div>
          );
        })()}
      </div>
    </div>
  );
}

  );
}
