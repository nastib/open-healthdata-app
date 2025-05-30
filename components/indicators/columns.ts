import type { ColumnDef } from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-vue-next'
import type { Indicator } from '~/server/schemas/indicators.schema'

export const columns: ColumnDef<Indicator>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return h(Button, {
        variant: 'ghost',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }, () => ['Name', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })])
    },
  },
  {
    accessorKey: 'code',
    header: 'Code',
  },
  {
    accessorKey: 'dataSource.name',
    header: 'Data Source',
  },
  {
    accessorKey: 'organizationElement.name',
    header: 'Organization Element',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      return new Date(row.getValue('createdAt')).toLocaleDateString()
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated At',
    cell: ({ row }) => {
      return new Date(row.getValue('updatedAt')).toLocaleDateString()
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const indicator = row.original
      return h('div', { class: 'flex gap-2' }, [
        h(Button, {
          variant: 'outline',
          size: 'sm',
          onClick: () => navigateTo(`/indicators/${indicator.id}`),
        }, 'View'),
        h(Button, {
          variant: 'outline',
          size: 'sm',
          onClick: () => navigateTo(`/indicators/${indicator.id}/edit`),
        }, 'Edit'),
      ])
    },
  },
]
