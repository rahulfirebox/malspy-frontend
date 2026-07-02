import React from 'react';
import Link from 'next/link';
import type { ScanListItem } from '@/types';
import { Table, TableHead, TableBody, Th, Td } from '@/components/ui/Table';
import { RatingBadgeSmall } from '@/components/scan/RatingBadge';
import { ScanStatusChip, MalwareStatusChip } from '@/components/scan/StatusChip';
import { formatDateShort } from '@/lib/apiUtils';

interface RecentScansTableProps {
  scans: ScanListItem[];
}

export function RecentScansTable({ scans }: RecentScansTableProps) {
  return (
    <Table>
      <TableHead>
        <tr>
          <Th scope="col">Rating</Th>
          <Th scope="col">Domain</Th>
          <Th scope="col">Status</Th>
          <Th scope="col">Malware</Th>
          <Th scope="col">Date</Th>
          <Th scope="col">{null}</Th>
        </tr>
      </TableHead>
      <TableBody>
        {scans.map(scan => (
          <tr key={scan.id} className="hover:bg-bg-page transition-colors">
            <Td>
              <RatingBadgeSmall rating={scan.rating} />
            </Td>
            <Td>
              <span className="font-mono text-sm text-text-primary">{scan.domain}</span>
            </Td>
            <Td>
              <ScanStatusChip status={scan.status} />
            </Td>
            <Td>
              <MalwareStatusChip detected={scan.malware_detected} />
            </Td>
            <Td>
              <span className="text-xs text-text-secondary">{formatDateShort(scan.created_at)}</span>
            </Td>
            <Td>
              <Link
                href={`/dashboard/scans/${scan.id}`}
                className="text-xs text-primary hover:underline font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
              >
                View
              </Link>
            </Td>
          </tr>
        ))}
      </TableBody>
    </Table>
  );
}
