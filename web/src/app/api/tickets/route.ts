/**
 * Tickets API Endpoint
 *
 * Provides ticket list data for the ticket listing page
 * - Supports search, urgency filter, and category filter
 * - Returns tickets grouped by urgency level
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import type { GroupedTickets } from '@/types/ticket';

/**
 * GET /api/tickets
 *
 * Query Parameters:
 * - search: Text search across ticket content
 * - urgency: Filter by urgency level (High|Medium|Low)
 * - category: Filter by issue category
 * - limit: Maximum number of tickets to return (default: 100)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const urgency = searchParams.get('urgency');
    const category = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500);

    logger.info('Tickets request received', { search, urgency, category, limit });

    // Build query
    let query = supabase
      .from('ticket_results')
      .select('id, ticket_id, ticket_text, ml_urgency, ml_priority, llm_issue_category, ml_confidence, llm_ml_valid, customer_response, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (urgency && ['High', 'Medium', 'Low'].includes(urgency)) {
      query = query.eq('ml_urgency', urgency);
    }

    if (category) {
      query = query.eq('llm_issue_category', category);
    }

    if (search.trim()) {
      query = query.ilike('ticket_text', `%${search.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Database query failed', { error: error.message });
      throw error;
    }

    // Group tickets by urgency
    const grouped: GroupedTickets = {
      High: [],
      Medium: [],
      Low: [],
    };

    if (data) {
      for (const ticket of data) {
        const level = ticket.ml_urgency as keyof GroupedTickets;
        if (grouped[level]) {
          grouped[level].push(ticket);
        }
      }
    }

    const elapsed = Date.now() - startTime;
    logger.info('Tickets request completed', {
      total: data?.length || 0,
      high: grouped.High.length,
      medium: grouped.Medium.length,
      low: grouped.Low.length,
      elapsed_ms: elapsed,
    });

    return NextResponse.json({
      tickets: grouped,
      total: data?.length || 0,
      filters: {
        search,
        urgency: urgency || null,
        category: category || null,
      },
      timestamp: new Date().toISOString(),
      processing_time_ms: elapsed,
    });

  } catch (error) {
    logger.error('Tickets request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        error: 'Gagal memuat daftar tiket',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
