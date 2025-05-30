import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-vue-next'
import type { DataSource } from '@prisma/client'

export const columns: ColumnDef<DataSource>[] = [
  {
    accessorKey: 'code',
    header: ({ column }) => {
      return h(Button, {
        variant: 'ghost',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }, () => ['Code', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })])
    },
    cell: ({ row }) => h('div', { class: 'lowercase' }, row.getValue('code')),
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => h('div', row.getValue('name')),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => h('div', row.getValue('description')),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return h('div', date.toLocaleDateString())
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    cell: ({ row }) => {
      const date = new Date(row.getValue('updatedAt'))
      return h('div', date.toLocaleDateString())
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const dataSource = row.original
      return h('div', { class: 'flex gap-2' }, [
        h(Button, {
          variant: 'outline',
          onClick: () => navigateTo(`/data-sources/${dataSource.id}`),
        }, 'View'),
        h(Button, {
          variant: 'destructive',
          onClick: () => console.log('Delete', dataSource.id),
        }, 'Delete')
      ])
    },
  },
]
