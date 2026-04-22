export const sessionKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: (params: { page: number; pageSize: number }) =>
    [...sessionKeys.all, 'list', params] as const,
  detail: (id: string) => [...sessionKeys.all, 'detail', id] as const,
}

export const categoryKeys = {
  all: ['categories'] as const,
}
