import { SkeletonTable } from '@/components/ui/Skeleton';
export default function Loading() {
  return <div role="status" aria-busy="true"><SkeletonTable rows={6} /></div>;
}
