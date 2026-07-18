export function ChatSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-5">
      {Array.from({ length: 7 }).map((_, index) => <div key={index} className={`h-14 animate-pulse rounded-3xl bg-emerald-50 ${index % 2 ? 'ml-auto w-2/3' : 'w-1/2'}`} />)}
    </div>
  );
}
