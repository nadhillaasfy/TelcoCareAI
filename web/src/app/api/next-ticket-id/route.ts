/**
 * Next Ticket ID API Endpoint
 *
 * Returns the next available ticket ID in TKT-XXX format
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    // Get all ticket IDs that match TKT-XXX format
    const { data, error } = await supabase
      .from('ticket_results')
      .select('ticket_id')
      .like('ticket_id', 'TKT-%');

    if (error) {
      logger.error('Failed to fetch ticket IDs', { error: error.message });
      return NextResponse.json(
        { error: 'Failed to generate ticket ID' },
        { status: 500 }
      );
    }

    // Find the highest ticket number
    let maxNumber = 0;

    if (data && data.length > 0) {
      data.forEach((row) => {
        const match = row.ticket_id.match(/TKT-(\d+)/);
        if (match) {
          const ticketNumber = parseInt(match[1], 10);
          if (ticketNumber > maxNumber) {
            maxNumber = ticketNumber;
          }
        }
      });
    }

    // Next ticket number
    const nextNumber = maxNumber + 1;

    // Format as TKT-XXX (zero-padded to 3 digits)
    const nextTicketId = `TKT-${String(nextNumber).padStart(3, '0')}`;

    logger.info('Generated next ticket ID', { ticket_id: nextTicketId, max_number: maxNumber });

    return NextResponse.json({ ticket_id: nextTicketId });
  } catch (error) {
    logger.error('Error generating ticket ID', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
