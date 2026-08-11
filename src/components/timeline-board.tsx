"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Clock3, Filter, MoreHorizontal, Plus, Search, X } from "lucide-react";

export type Task = {
  id: string | number;
  title: string;
  start_date: string;
  due_date: string;
  row: number;
  priority: string;
  status: string;
  people: string[];
};

const statusColor:Record<string,string>={"Complete":"bg-[#eaf8ef] text-[#5ca36f]","In Progress":"bg-[#fff4dc] text-[#c2872f]","Not Started":"bg-[#edf2f8] text-[#8292a8]","In Review":"bg-[#f1edff] text-[#826ac8]","Revision":"bg-[#fff0f3] text-[#e46a80]"};
const priorityColor:Record<string,string>={"Low":"bg-[#e8f3ff] text-[#4b87db]","Medium":"bg-[#fff3d9] text-[#c58a2b]","High":"bg-[#ffe8ed] text-[#e35d78]"};

export function TimelineBoard({ initialTasks }: { initialTasks: Task[] }){
  const [selected,setSelected]=useState<Task|null>(null);
  const [query,setQuery]=useState("");
  const [startDate, setStartDate] = useState(new Date(2026, 7, 5)); // 5 Aug 2026 default
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeTab, setActiveTab] = useState("Timeline");
  
  const filtered=useMemo(()=>initialTasks.filter(t=>t.title.toLowerCase().includes(query.toLowerCase())),[query, initialTasks]);
  
  // Generate 10 days starting from startDate
  const days = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 10; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      arr.push([
        d.toLocaleDateString('en-US', { weekday: 'short' }),
        d.getDate().toString().padStart(2, '0')
      ]);
    }
    return arr;
  }, [startDate]);

  const monthName = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  function shiftDays(days: number) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + days);
    setStartDate(d);
  }

  const getTaskSpan = (t: Task) => {
    if (!t.start_date) return 1;
    const startMs = new Date(t.start_date).getTime();
    const endMs = t.due_date ? new Date(t.due_date).getTime() : startMs;
    return Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1);
  };

  const getTaskPosition = (t: Task) => {
    if (!t.start_date) return { left: 0, width: 10 };
    // reset to midnight for precise day calculation
    const viewStartDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
    const startDay = new Date(new Date(t.start_date).getFullYear(), new Date(t.start_date).getMonth(), new Date(t.start_date).getDate()).getTime();
    
    const leftPercent = ((startDay - viewStartDay) / (1000 * 60 * 60 * 24)) * 10;
    const widthPercent = getTaskSpan(t) * 10;
    return { left: leftPercent, width: widthPercent };
  };

  // Group by status for Board View
  const groupedByStatus = useMemo(() => {
    const groups: Record<string, Task[]> = {
      "Not Started": [],
      "In Progress": [],
      "In Review": [],
      "Revision": [],
      "Complete": []
    };
    filtered.forEach(t => {
      if (!groups[t.status]) groups[t.status] = [];
      groups[t.status].push(t);
    });
    return groups;
  }, [filtered]);

  return <div className="relative min-h-[calc(100vh-70px)] overflow-hidden bg-white">
    <div className="px-5 pt-7 lg:px-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div><p className="text-[10px] text-[#95a3b8]">Workspace <span className="mx-2">›</span> Brides Beloved</p><h1 className="mt-3 text-[25px] font-semibold tracking-[-.03em] sm:text-[29px]">Wedding Projects Timeline</h1></div>
        <div className="flex -space-x-2">{["MP","RA","DA","NS"].map(x=><span key={x} className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#e5eaf0] text-[9px] font-bold text-[#66788e]">{x}</span>)}<button className="ml-3 grid h-8 w-8 place-items-center rounded-full bg-[#2f80ed] text-white"><Plus size={15}/></button></div>
      </div>
      
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#e6ecf3]">
        <div className="flex gap-7 text-xs text-[#8d9ab0]">
          {["Board", "Timeline", "Table", "List"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 ${activeTab === tab ? "border-b-2 border-[#2f80ed] font-semibold text-[#18385d]" : ""}`}>{tab}</button>
          ))}
        </div>
        
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <label className="flex h-9 items-center gap-2 border-b border-[#dce4ee] px-2 text-[#8798b0]"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search here..." className="w-28 bg-transparent text-[11px] outline-none"/></label>
          <button className="grid h-9 w-9 place-items-center text-[#8091aa]"><Filter size={15}/></button>
          
          <div className="relative">
            <button onClick={() => setShowCalendar(!showCalendar)} className="flex h-9 items-center gap-2 rounded-md border border-[#dde5ef] px-3 text-[11px] text-[#536b89] hover:bg-[#f7f9fc]"><CalendarDays size={14}/> {monthName} <ChevronDown size={12}/></button>
            {showCalendar && (
              <div className="absolute right-0 top-11 z-50 w-48 rounded-md border border-[#e8edf4] bg-white p-2 shadow-lg">
                <button onClick={() => { shiftDays(-10); setShowCalendar(false); }} className="w-full rounded px-3 py-2 text-left text-xs hover:bg-[#f4f7fa]">&larr; Previous 10 Days</button>
                <button onClick={() => { shiftDays(10); setShowCalendar(false); }} className="w-full rounded px-3 py-2 text-left text-xs hover:bg-[#f4f7fa]">Next 10 Days &rarr;</button>
                <button onClick={() => { setStartDate(new Date()); setShowCalendar(false); }} className="w-full rounded px-3 py-2 text-left text-xs font-semibold text-[#2f80ed] hover:bg-[#edf5ff]">Today</button>
              </div>
            )}
          </div>
          <button className="flex h-9 items-center gap-2 px-2 text-[11px] text-[#8292aa]"><MoreHorizontal size={15}/> Menu</button>
        </div>
      </div>
    </div>

    <div className="px-5 py-6 lg:px-8 overflow-y-auto" style={{ height: "calc(100vh - 200px)" }}>
      
      {/* TIMELINE VIEW */}
      {activeTab === "Timeline" && (
        <div className="-mx-5 lg:-mx-8 overflow-x-auto scrollbar-none pb-10"><div className="relative min-w-[1000px] px-8" style={{height: 610}}>
          <div className="grid grid-cols-10 border-b border-[#e8edf4] pl-[0px]">{days.map(([day,num],i)=><div key={i} className="h-[60px] border-r border-[#eef2f6] px-3 pt-2 text-left"><p className={`text-[9px] ${i===0?"text-[#2f80ed]":"text-[#8ea0ba]"}`}>{day}</p><p className={`mt-0.5 text-base ${i===0?"font-semibold text-[#2f80ed]":"text-[#7589aa]"}`}>{num}</p>{i===0&&<span className="absolute top-[55px] ml-0.5 h-2 w-2 rounded-full bg-[#2f80ed]"/>}</div>)}</div>
          <div className="absolute bottom-0 left-8 right-8 top-[60px] grid grid-cols-10">{days.map((_,i)=><div key={i} className="border-r border-[#edf1f5]"/>)}</div>
          <div className="absolute left-8 right-8 top-[78px] z-20" style={{height:480}}>
            {filtered.map(t=>{
              const pos = getTaskPosition(t);
              // hide if completely out of view (left > 100% or left+width < 0%)
              if (pos.left > 100 || pos.left + pos.width < 0) return null;
              
              return <button key={t.id} onClick={()=>setSelected(t)} className="absolute min-w-0 overflow-hidden rounded-md border border-[#e3e9f1] bg-white p-3 text-left shadow-[0_2px_8px_rgba(40,67,100,.03)] transition hover:-translate-y-0.5 hover:shadow-md" style={{left:`calc(${pos.left}% + 8px)`,width:`calc(${pos.width}% - 16px)`,top:t.row*124,height:88}}><span className={`absolute bottom-3 left-2 top-3 w-[3px] rounded-full ${t.priority==="High"?"bg-[#ff5975]":t.priority==="Medium"?"bg-[#edb342]":"bg-[#3b8df2]"}`}/><div className="pl-3"><p className="truncate text-[11px] font-semibold text-[#18385b]">{t.title}</p><div className="mt-2 flex items-center justify-between"><div className="flex gap-1"><span className={`rounded-full px-2 py-1 text-[7px] font-semibold ${priorityColor[t.priority]}`}>{t.priority}</span><span className={`rounded-full px-2 py-1 text-[7px] font-semibold ${statusColor[t.status]}`}>{t.status}</span></div><div className="flex -space-x-1">{t.people.slice(0,3).map(p=><span key={p} className="grid h-5 w-5 place-items-center rounded-full border border-white bg-[#d8dde3] text-[6px] font-bold text-[#778598]">{p}</span>)}</div></div></div></button>
            })}
          </div>
        </div></div>
      )}

      {/* BOARD VIEW */}
      {activeTab === "Board" && (
        <div className="flex gap-5 overflow-x-auto pb-10">
          {Object.entries(groupedByStatus).map(([status, tasks]) => (
            <div key={status} className="w-72 shrink-0 rounded-lg bg-[#f4f7fa] p-3">
              <div className="mb-4 flex items-center justify-between px-1">
                <h3 className="text-xs font-semibold text-[#536b89]">{status}</h3>
                <span className="grid h-5 w-5 place-items-center rounded bg-[#e8edf4] text-[9px] font-bold text-[#7185a0]">{tasks.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {tasks.map(t => (
                  <div key={t.id} onClick={()=>setSelected(t)} className="cursor-pointer rounded-md border border-[#e3e9f1] bg-white p-3 shadow-sm hover:border-[#b8d3f5]">
                    <div className="flex gap-1 mb-2">
                      <span className={`rounded-full px-2 py-0.5 text-[8px] font-semibold ${priorityColor[t.priority]}`}>{t.priority}</span>
                    </div>
                    <p className="text-xs font-semibold text-[#18385b]">{t.title}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="flex items-center gap-1 text-[9px] text-[#8c9bb0]"><Clock3 size={10}/> {getTaskSpan(t)} days</p>
                      <div className="flex -space-x-1">{t.people.slice(0,3).map(p=><span key={p} className="grid h-5 w-5 place-items-center rounded-full border border-white bg-[#d8dde3] text-[6px] font-bold text-[#778598]">{p}</span>)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TABLE VIEW */}
      {activeTab === "Table" && (
        <div className="overflow-hidden rounded-xl border border-[#e5ebf3] bg-white">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e5ebf3] bg-[#f8fafd] text-[#8d9ab0]">
              <tr>
                <th className="px-5 py-3 font-semibold">Task Name</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Priority</th>
                <th className="px-5 py-3 font-semibold">Assignees</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5ebf3]">
              {filtered.map(t => (
                <tr key={t.id} onClick={()=>setSelected(t)} className="cursor-pointer transition hover:bg-[#fcfdfd]">
                  <td className="px-5 py-4 font-semibold text-[#18385b]">{t.title}</td>
                  <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold ${statusColor[t.status]}`}>{t.status}</span></td>
                  <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold ${priorityColor[t.priority]}`}>{t.priority}</span></td>
                  <td className="px-5 py-4">
                    <div className="flex -space-x-1">{t.people.map(p=><span key={p} className="grid h-6 w-6 place-items-center rounded-full border border-white bg-[#d8dde3] text-[8px] font-bold text-[#778598]">{p}</span>)}</div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-[#8d9ab0]">No tasks found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* LIST VIEW */}
      {activeTab === "List" && (
        <div className="max-w-4xl mx-auto space-y-2">
          {filtered.map(t => (
            <div key={t.id} onClick={()=>setSelected(t)} className="flex cursor-pointer items-center justify-between rounded-lg border border-[#e5ebf3] bg-white p-4 hover:border-[#b8d3f5] hover:shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${t.status === 'Complete' ? 'bg-[#5ca36f] border-[#5ca36f] text-white' : 'border-[#dce4ee]'}`}>
                  {t.status === 'Complete' && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3"><path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <p className={`text-sm font-semibold ${t.status === 'Complete' ? 'text-[#8d9ab0] line-through' : 'text-[#18385b]'}`}>{t.title}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${statusColor[t.status]}`}>{t.status}</span>
                <span className="flex items-center gap-1 text-[10px] text-[#8c9bb0] w-16"><Clock3 size={11}/> {getTaskSpan(t)}d</span>
                <div className="flex w-12 -space-x-1 justify-end">{t.people.slice(0,2).map(p=><span key={p} className="grid h-6 w-6 place-items-center rounded-full border border-white bg-[#d8dde3] text-[8px] font-bold text-[#778598]">{p}</span>)}</div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="py-10 text-center text-sm text-[#8d9ab0]">No tasks found.</div>}
        </div>
      )}

    </div>

    {selected&&<><button aria-label="Close task" onClick={()=>setSelected(null)} className="fixed inset-0 z-40 bg-[#102a49]/10"/><aside className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-[430px] overflow-y-auto bg-white p-7 shadow-[-12px_0_35px_rgba(19,43,78,.12)]"><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#8d9bb1]">Task details</p><button onClick={()=>setSelected(null)} className="grid h-8 w-8 place-items-center rounded-full bg-[#f4f6f9]"><X size={15}/></button></div><h2 className="mt-6 text-2xl font-semibold tracking-[-.03em]">{selected.title}</h2><p className="mt-3 text-sm leading-6 text-[#7b8ca4]">Koordinasikan detail pekerjaan ini dengan team dan pastikan seluruh kebutuhan client terkonfirmasi sebelum deadline.</p>
    
    <form action={async (fd) => {
      const { updateTask } = await import('@/lib/actions');
      const res = await updateTask(fd);
      if(res?.success) setSelected(null);
      else alert(res?.error || "Gagal memperbarui task");
    }}>
      <input type="hidden" name="id" value={selected.id} />
      <div className="mt-8 grid grid-cols-2 gap-y-6 text-xs">
        <div><p className="mb-2 text-[9px] uppercase tracking-wider text-[#9aa7b9]">Status</p>
          <select name="status" defaultValue={selected.status} className="w-full rounded-md border border-[#dce4ee] p-1.5 text-xs outline-none">
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Revision">Revision</option>
            <option value="Complete">Complete</option>
          </select>
        </div>
        <div><p className="mb-2 text-[9px] uppercase tracking-wider text-[#9aa7b9]">Priority</p>
          <select name="priority" defaultValue={selected.priority} className="w-full rounded-md border border-[#dce4ee] p-1.5 text-xs outline-none">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>
      <div className="mt-8 border-t border-[#e8edf3] pt-6"><p className="text-[10px] font-bold uppercase tracking-wider text-[#8d9bb0]">Assigned team</p><div className="mt-4 flex gap-2">{selected.people.map(p=><span key={p} className="grid h-9 w-9 place-items-center rounded-full bg-[#e8f1fc] text-[9px] font-bold text-[#3972b9]">{p}</span>)}</div></div>
      <button type="submit" className="mt-10 h-11 w-full rounded-md bg-[#2f80ed] text-xs font-semibold text-white hover:bg-[#256bc8]">Update Task</button>
    </form>
    
    </aside></>}
  </div>
}
