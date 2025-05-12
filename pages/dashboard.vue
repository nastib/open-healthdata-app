<template>
  <div class="min-h-svh p-6">
    <div class="grid gap-6">
      <!-- Header Section -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Dashboard</h1>
          <p class="text-muted-foreground">Welcome back, {{ profileStore.profile?.user?.email || 'User' }}</p>
        </div>
        <div class="flex space-x-2">
          <Button variant="outline" @click="refreshData">
            <Icon name="lucide:refresh-cw" class="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button v-if="hasRole('ADMIN')">
            <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
            New Report
          </Button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card v-for="stat in stats" :key="stat.title">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">
              {{ stat.title }}
            </CardTitle>
            <Icon :name="stat.icon" class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stat.value }}</div>
            <p class="text-xs text-muted-foreground">{{ stat.change }} from last month</p>
          </CardContent>
        </Card>
      </div>

      <!-- Main Content Area -->
      <div class="grid grid-cols-2 lg:grid-cols-2 gap-4">
        <!-- Data Visualization -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>Patient Statistics</CardTitle>
              <div class="flex space-x-2">
                <Button variant="outline" size="sm" @click="setTimeRange('day')" :class="{ 'bg-accent': timeRange === 'day' }">
                  Day
                </Button>
                <Button variant="outline" size="sm" @click="setTimeRange('week')" :class="{ 'bg-accent': timeRange === 'week' }">
                  Week
                </Button>
                <Button variant="outline" size="sm" @click="setTimeRange('month')" :class="{ 'bg-accent': timeRange === 'month' }">
                  Month
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Bar :data="chartData" :options="chartOptions" class="h-[300px]" />
          </CardContent>
        </Card>

        <!-- Recent Activity -->
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Last 5 events</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div v-for="event in recentEvents" :key="event.id" class="flex items-center">
                <Avatar class="h-9 w-9">
                  <AvatarImage :src="event.avatar" />
                  <AvatarFallback>{{ event.initials }}</AvatarFallback>
                </Avatar>
                <div class="ml-4 space-y-1">
                  <p class="text-sm font-medium leading-none">{{ event.user }}</p>
                  <p class="text-sm text-muted-foreground">{{ event.action }}</p>
                </div>
                <div class="ml-auto font-medium">{{ event.time }}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { useWindowSize } from '@vueuse/core';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';

const authStore = useAuthStore();
const profileStore = useProfileStore();
const { hasRole } = useRoles();

const roles = ['ADMIN', 'USER'];
definePageMeta({
  layout: 'default',
  title: 'Dashboard',
  auth: true,
  roles: roles,
});

// Register ChartJS components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Mock data for stats
const stats = [
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
];

// Mock data for recent activity
const recentEvents = [
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
];

/**
 * Refreshes the user's profile data
 * @async
 */
const refreshData = async () => {
  if (authStore.user?.id) {
    await profileStore.fetchProfile(authStore.user.id);
  }
};

onMounted(async () => {
  console.log('Dashboard mounted - auth state:', {
    isAuthenticated: authStore.isAuthenticated(),
    user: authStore.user,
    session: authStore.session,
  });

  console.log('Profile state:', {
    profile: profileStore.profile,
    loading: profileStore.loading,
  });

  if (authStore.user?.id && !profileStore.profile) {
    console.log('Fetching profile...');
    await profileStore.fetchProfile(authStore.user.id);
  }
});

const { width } = useWindowSize();
const timeRange = ref<'day' | 'week' | 'month'>('week');

// Mock data for chart
const chartData = computed(() => {
  const labels =
    timeRange.value === 'day'
      ? ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
      : timeRange.value === 'week'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

  const data =
    timeRange.value === 'day' ? [12, 19, 3, 5, 2, 3] : timeRange.value === 'week' ? [30, 45, 25, 50, 35, 20, 15] : [120, 190, 90, 150];

  return {
    labels,
    datasets: [
      {
        label: 'Patient Visits',
        data,
        backgroundColor: '#3b82f6',
        borderColor: '#1d4ed8',
        borderWidth: 1,
      },
    ],
  };
});

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Patient Visits Trend',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Number of Visits',
      },
    },
    x: {
      title: {
        display: true,
        text: timeRange.value === 'day' ? 'Time of Day' : timeRange.value === 'week' ? 'Day of Week' : 'Week of Month',
      },
    },
  },
};

/**
 * Sets the time range for the chart
 * @param {('day' | 'week' | 'month')} range - The time range to set
 */
const setTimeRange = (range: 'day' | 'week' | 'month') => {
  timeRange.value = range;
};
</script>
