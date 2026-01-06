/**
 * Chat API Client
 *
 * Wraps the /api/llm-judge endpoint for chat integration.
 * Returns ONLY customer_response (Indonesian text) - hides ML/LLM technical details.
 */

interface ApiResponse {
  customer_response: string;
  // Other fields exist but are hidden from chat UI
}

interface ApiError {
  error: string;
  error_stage?: string;
  details?: string;
}

/**
 * Send chat message to LLM judge endpoint
 *
 * @param text - Customer message text (Indonesian)
 * @returns Indonesian customer response text
 * @throws Error with user-friendly Indonesian message
 */
export async function sendChatMessage(text: string): Promise<string> {
  try {
    const response = await fetch('/api/llm-judge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        ticket_id: crypto.randomUUID(),
      }),
    });

    const data: ApiResponse | ApiError = await response.json();

    // Check for API errors
    if (!response.ok || 'error' in data) {
      throw new Error(getUserFriendlyError(data as ApiError));
    }

    // Return ONLY customer_response (Indonesian)
    return (data as ApiResponse).customer_response;
  } catch (error) {
    // Network or parsing errors
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Terjadi kesalahan jaringan. Silakan periksa koneksi Anda.');
  }
}

/**
 * Convert API error to user-friendly Indonesian message
 */
function getUserFriendlyError(error: ApiError): string {
  const errorMessages: Record<string, string> = {
    validation: 'Pesan Anda tidak valid. Silakan coba lagi.',
    translation: 'Gagal memproses pesan. Silakan coba lagi.',
    ml_service: 'Layanan sedang sibuk. Mohon tunggu sebentar.',
    gemini: 'Gagal menghasilkan respons. Silakan coba lagi.',
    processing: 'Terjadi kesalahan saat memproses. Silakan coba lagi.',
  };

  // If error_stage is provided, use specific message
  if (error.error_stage && error.error_stage in errorMessages) {
    return errorMessages[error.error_stage];
  }

  // Fallback to generic error message
  return error.error || 'Terjadi kesalahan. Silakan coba lagi.';
}
