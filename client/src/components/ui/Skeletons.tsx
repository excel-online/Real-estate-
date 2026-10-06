export function PropertyCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-3 ring-1 ring-slate-900/5 shadow-sm">
      <div className="h-48 w-full rounded-xl bg-slate-200" />
      <div className="mt-4 space-y-2 px-1">
        <div className="h-5 w-3/4 rounded bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-200" />
        <div className="mt-4 flex items-center justify-between pt-2">
          <div className="h-6 w-1/3 rounded bg-slate-200" />
          <div className="h-4 w-1/4 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-16 rounded-lg bg-slate-200" />
          <div className="space-y-1">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-3 w-16 rounded bg-slate-200" />
          </div>
        </div>
      </td>
      <td className="px-5 py-4"><div className="h-4 w-16 rounded bg-slate-200" /></td>
      <td className="px-5 py-4"><div className="h-4 w-20 rounded bg-slate-200" /></td>
      <td className="px-5 py-4"><div className="h-5 w-16 rounded-full bg-slate-200" /></td>
      <td className="px-5 py-4"><div className="h-4 w-20 rounded bg-slate-200" /></td>
      <td className="px-5 py-4"><div className="ml-auto h-8 w-16 rounded-lg bg-slate-200" /></td>
    </tr>
  );
}

export function PropertyDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-96 w-full rounded-2xl bg-slate-200" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="h-8 w-2/3 rounded bg-slate-200" />
          <div className="h-4 w-1/3 rounded bg-slate-200" />
          <div className="h-24 w-full rounded-xl bg-slate-200" />
        </div>
        <div className="h-64 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
