import { defineStore } from 'pinia'

interface NavLink {
  path: string;
  label: string;
  icon: string;
  roles: string[];
}

interface RecentActivity {
  id: number;
  user: string;
  initials: string;
  action: string;
  time: string;
  avatar: string;
}

interface Stat {
    title: string;
    value: string;
    change: string;
    icon: string;
}

export const useCoreStore = defineStore('core-store',() => {

  // Core States
  // Side menu links and roles guards
  const menuLinks= ref<NavLink[]>([
    { path: '/dashboard', label: 'Dashboard', icon: 'lucide:layout-dashboard', roles: ['ADMIN', 'USER'] },
    { path: '/categories', label: 'Categories', icon: 'lucide:folder', roles: ['ADMIN'] },
    { path: '/organizations', label: 'Organisations', icon: 'lucide:building', roles: ['ADMIN', 'USER'] },
    { path: '/sources', label: 'Source de données', icon: 'lucide:clipboard-type', roles: ['ADMIN', 'USER'] },
    { path: '/variables', label: 'Variables', icon: 'lucide:variable', roles: ['ADMIN', 'USER'] },
    { path: '/indicators', label: 'Indicateurs', icon: 'lucide:area-chart', roles: ['ADMIN', 'USER'] },
    { path: '/entries', label: 'Saisie des données', icon: 'lucide:database', roles: ['ADMIN', 'USER'] },
  ]);

  // Mock data for stats
  const stats = ref<Stat[]>([
    {
      title: 'Total Patients',
      value: '1,234',
      change: '+12.1%',
      icon: 'lucide:users',
    },
    {
      title: 'Appointments',
      value: '256',
      change: '+19%',
      icon: 'lucide:calendar',
    },
    {
      title: 'Revenue',
      value: '$12,345',
      change: '+2.6%',
      icon: 'lucide:dollar-sign',
    },
    {
      title: 'Active Studies',
      value: '24',
      change: '+4.3%',
      icon: 'lucide:activity',
    },
  ])

  const recentEvents = ref<RecentActivity[]>([
  {
    id: 1,
    user: 'Dr. Smith',
    initials: 'DS',
    action: 'Added new patient record',
    time: '10 min ago',
    avatar: '',
  },
  {
    id: 2,
    user: 'Nurse Johnson',
    initials: 'NJ',
    action: 'Updated medication',
    time: '25 min ago',
    avatar: '',
  },
  {
    id: 3,
    user: 'Admin',
    initials: 'AD',
    action: 'Scheduled appointment',
    time: '1 hour ago',
    avatar: '',
  },
  {
    id: 4,
    user: 'Dr. Lee',
    initials: 'DL',
    action: 'Completed study review',
    time: '2 hours ago',
    avatar: '',
  },
  {
    id: 5,
    user: 'System',
    initials: 'SY',
    action: 'Automated backup',
    time: '4 hours ago',
    avatar: '',
  },
  ])

  // Computed properties
  // Side menu links and roles guards
  const getAllMenuLinks = computed<NavLink[]>(() => menuLinks.value);

  // Mock data for stats
  const getAllStats = computed(() => stats.value);

  // Mock data for recent activity
  const getAllEvents = computed(() => recentEvents.value);


  return {
    stats,
    recentEvents,
    menuLinks,
    getAllMenuLinks,
    getAllStats,
    getAllEvents
  }
})


// make sure to pass the right store definition, `useCoreStore` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCoreStore, import.meta.hot))
}
