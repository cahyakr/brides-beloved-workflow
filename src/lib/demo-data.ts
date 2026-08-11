export const projects = [
  { name: "Sarah & Daniel", date: "24 Des 2026", venue: "The Apurva Bali", progress: 68, status: "Preparation" },
  { name: "Alya & Reza", date: "07 Nov 2026", venue: "Plataran Cilandak", progress: 82, status: "Ready" },
  { name: "Nadia & Raka", date: "17 Jan 2027", venue: "InterContinental Jakarta", progress: 41, status: "Planning" },
  { name: "Clarissa & Evan", date: "14 Feb 2027", venue: "The Langham Jakarta", progress: 29, status: "Planning" },
];

export const clients = projects.map((p, i) => ({
  ...p,
  package: i % 2 ? "Signature" : "Full Planning",
  pm: ["Maya Putri", "Rani Aulia", "Dimas A.", "Maya Putri"][i],
  initials: p.name.split(" & ").map((n) => n[0]).join(""),
}));

export const team = [
  { name: "Maya Putri", role: "Project Manager", initials: "MP", active: 4 },
  { name: "Rani Aulia", role: "Wedding Planner", initials: "RA", active: 3 },
  { name: "Dimas Ardi", role: "Event Coordinator", initials: "DA", active: 3 },
  { name: "Naya Sari", role: "Creative Lead", initials: "NS", active: 2 },
];

export const timelineTasks = [
  { id: 1, title: "F1: Meeting Brainstorming", start: 0, span: 2, row: 0, priority: "Medium", status: "Complete", people: ["MP", "RA", "DA"] },
  { id: 2, title: "F2: Vendor Selection & Visit", start: 1, span: 3, row: 1, priority: "High", status: "Complete", people: ["RA", "DA"] },
  { id: 3, title: "F2: Attire & Decoration", start: 2, span: 3, row: 2, priority: "Medium", status: "In Progress", people: ["NS", "MP"] },
  { id: 4, title: "F3: Meeting Rundown Acara", start: 4, span: 2, row: 0, priority: "High", status: "In Progress", people: ["MP", "DA"] },
  { id: 5, title: "F3: Fiting Attire & Food Test", start: 5, span: 3, row: 1, priority: "Medium", status: "Not Started", people: ["RA", "NS"] },
  { id: 6, title: "F4: Final Technical Meeting", start: 7, span: 2, row: 0, priority: "High", status: "Not Started", people: ["MP", "RA", "DA"] },
  { id: 7, title: "F4: Brief Vendor & Produksi", start: 8, span: 1, row: 1, priority: "High", status: "Not Started", people: ["DA", "NS"] },
  { id: 8, title: "F5: Wedding Day Execution", start: 9, span: 1, row: 0, priority: "High", status: "Not Started", people: ["MP", "RA", "DA", "NS"] },
];

export const milestones = [
  { title: "Fase 1: Wedding Direction", done: true, date: "H-6 Bulan" },
  { title: "Fase 2: Vendor Selection", done: true, date: "H-5 Bulan" },
  { title: "Fase 3: Detail Planning", done: false, current: true, date: "H-3 Bulan" },
  { title: "Fase 4: Finalization", done: false, date: "H-1 Bulan" },
  { title: "Fase 5: Wedding Day", done: false, date: "Hari H" },
];
