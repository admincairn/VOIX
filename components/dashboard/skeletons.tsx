// ============================================================
// VOIX — Skeleton Loading Components
// ============================================================

export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-[14px] border border-gray-100 p-4 h-[96px]">
          <div className="skeleton h-2.5 w-20 mb-3 rounded" />
          <div className="skeleton h-8 w-14 mb-2 rounded" />
          <div className="skeleton h-2.5 w-28 rounded" />
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="skeleton h-4 w-32 rounded" />
      </div>
      <div className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3.5 flex items-center gap-4">
            <div className="skeleton w-7 h-7 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <div className="skeleton h-3 w-32 mb-1.5 rounded" />
              <div className="skeleton h-2.5 w-20 rounded" />
            </div>
            <div className="skeleton h-5 w-14 rounded-md" />
            <div className="skeleton h-5 w-16 rounded-md" />
            <div className="skeleton h-5 w-12 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-[14px] border border-gray-100 p-5 ${className}`}>
      <div className="skeleton h-4 w-24 mb-4 rounded" />
      <div className="space-y-2">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-4/5 rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="skeleton h-6 w-36 mb-2 rounded" />
          <div className="skeleton h-3.5 w-48 rounded" />
        </div>
        <div className="skeleton h-9 w-32 rounded-lg" />
      </div>
      <MetricsSkeleton />
      <TableSkeleton />
    </div>
  )
}
