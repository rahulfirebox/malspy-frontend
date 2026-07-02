import { SkeletonTable } from '@/components/ui/Skeleton';
export default function Loading() {
  return <div role="status" aria-busy="true"><SkeletonTable rows={4} /></div>;
}
