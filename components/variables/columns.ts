import type { ColumnDef } from '@tanstack/vue-table'
import type { VariableWithRelations } from '~/server/schemas/variables.schema'
import { Button } from '~/components/ui/button'
import { h } from 'vue'
import { format } from 'date-fns'

export const columns: ColumnDef<VariableWithRelations>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => format(new Date(row.original.createdAt), 'MMM dd, yyyy'),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    cell: ({ row }) => format(new Date(row.original.updatedAt), 'MMM dd, yyyy'),
  },
  {
    id: 'actions',
      cell: ({ row }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          asChild: true,
        },
        [
          h('NuxtLink', { to: `/variables/${row.original.id}` }, () => 'View'),
        ]
      )
    },
  },
]
