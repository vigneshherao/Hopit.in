export const taskStatuses = ['Pending', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'];
export const taskCategories = ['Land Preparation', 'Ploughing', 'Rotavator', 'Seed Purchase', 'Seed Treatment', 'Sowing', 'Transplanting', 'Irrigation', 'Fertilizer', 'Pesticide Spray', 'Disease Monitoring', 'Weeding', 'Harvesting', 'Packing', 'Transportation', 'Sales', 'Inspection', 'Custom'];
export const taskPriorities = ['Low', 'Medium', 'High', 'Critical'];

export function priorityTone(priority) {
  if (priority === 'Critical') return 'bg-rose-100 text-rose-700';
  if (priority === 'High') return 'bg-amber-100 text-amber-700';
  if (priority === 'Medium') return 'bg-purple-100 text-purple-700';
  return 'bg-emerald-100 text-emerald-700';
}

export function statusTone(status) {
  if (status === 'Completed') return 'bg-emerald-100 text-emerald-700';
  if (status === 'In Progress') return 'bg-purple-100 text-purple-700';
  if (['Cancelled', 'Delayed'].includes(status)) return 'bg-rose-100 text-rose-700';
  return 'bg-slate-100 text-slate-700';
}

export function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Not set';
}
