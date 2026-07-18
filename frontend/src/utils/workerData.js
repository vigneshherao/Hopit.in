export const professionalRoles = [
  'farm-manager',
  'farm-supervisor',
  'general-farm-worker',
  'seasonal-worker',
  'tractor-driver',
  'harvester-operator',
  'irrigation-specialist',
  'soil-specialist',
  'organic-farming-expert',
  'crop-consultant',
  'horticulture-expert',
  'dairy-worker',
  'poultry-worker',
  'fish-farming-worker',
  'drone-operator',
  'other',
];

export const workerSkills = [
  'land-preparation',
  'sowing',
  'transplanting',
  'weeding',
  'fertilizer-application',
  'pesticide-spraying',
  'irrigation',
  'harvesting',
  'tractor-operation',
  'machine-operation',
  'organic-farming',
  'farm-accounting',
  'worker-management',
  'crop-planning',
  'farm-security',
  'livestock-care',
  'drone-monitoring',
  'reporting',
];

export const workerAvailabilityStatuses = ['available', 'busy', 'partially-available', 'unavailable'];
export const farmJobWorkTypes = ['one-time', 'daily', 'weekly', 'seasonal', 'monthly', 'long-term', 'farm-management', 'contract'];
export const farmJobHiringTypes = ['individual', 'multiple-workers', 'team', 'farm-manager', 'service-provider'];
export const farmJobPaymentTypes = ['daily', 'weekly', 'monthly', 'fixed-contract', 'negotiable'];

export const workerRoleLabels = Object.fromEntries(professionalRoles.map((role) => [role, labelize(role)]));
export const workerSkillLabels = Object.fromEntries(workerSkills.map((skill) => [skill, labelize(skill)]));
export const availabilityLabels = Object.fromEntries(workerAvailabilityStatuses.map((status) => [status, labelize(status)]));
export const jobWorkTypeLabels = Object.fromEntries(farmJobWorkTypes.map((type) => [type, labelize(type)]));
export const hiringTypeLabels = Object.fromEntries(farmJobHiringTypes.map((type) => [type, labelize(type)]));

export function labelize(value) {
  return value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function displayWorkerPrice(worker) {
  if (worker?.pricing?.dailyWage) return `₹${worker.pricing.dailyWage.toLocaleString('en-IN')}/day`;
  if (worker?.pricing?.monthlySalary) return `₹${worker.pricing.monthlySalary.toLocaleString('en-IN')}/month`;
  if (worker?.pricing?.weeklyRate) return `₹${worker.pricing.weeklyRate.toLocaleString('en-IN')}/week`;
  return worker?.pricing?.negotiable ? 'Negotiable' : 'Rate not set';
}

export function displayJobPay(job) {
  const amount = job?.compensation?.amount ?? job?.compensation?.minimumAmount;
  if (!amount) return 'Negotiable';
  return `₹${amount.toLocaleString('en-IN')} ${job.compensation.paymentType}`;
}
