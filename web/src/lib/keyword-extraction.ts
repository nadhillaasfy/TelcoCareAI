/**
 * Indonesian Keyword Extraction Utility
 *
 * Extracts meaningful keywords from Indonesian customer support tickets
 * for theme analysis and trending issues identification.
 */

/**
 * Common Indonesian stopwords (words to exclude)
 * Based on common Indonesian grammar and telco context
 */
const INDONESIAN_STOPWORDS = new Set([
  // Articles and pronouns
  'yang', 'untuk', 'pada', 'ke', 'dari', 'di', 'dan', 'atau', 'dengan', 'oleh',
  'ini', 'itu', 'tersebut', 'adalah', 'akan', 'ada', 'jika', 'jadi', 'sebagai',
  'saya', 'anda', 'kamu', 'dia', 'mereka', 'kami', 'kita',

  // Common verbs
  'sudah', 'telah', 'sedang', 'dapat', 'bisa', 'harus', 'mau', 'ingin',
  'mohon', 'tolong', 'biar', 'agar', 'supaya',

  // Question words
  'apa', 'kapan', 'dimana', 'kemana', 'bagaimana', 'kenapa', 'mengapa',

  // Numbers and time
  'satu', 'dua', 'tiga', 'hari', 'minggu', 'bulan', 'tahun', 'jam',

  // Common phrases in tickets
  'terima', 'kasih', 'pak', 'bu', 'bapak', 'ibu', 'mas', 'mbak',
  'mohon', 'bantu', 'bantuan', 'tolong',

  // Conjunctions
  'tapi', 'tetapi', 'namun', 'karena', 'sebab', 'maka', 'lalu', 'kemudian',

  // Others
  'sangat', 'sekali', 'juga', 'lagi', 'masih', 'baru', 'belum', 'tidak', 'tak',
  'ya', 'iya', 'ok', 'oke', 'baik'
]);

/**
 * Words that should always be kept as keywords (domain-specific)
 * Telco and customer service related terms
 */
const IMPORTANT_KEYWORDS = new Set([
  // Network issues
  'internet', 'sinyal', 'jaringan', 'wifi', 'koneksi', 'lemot', 'lambat', 'putus',
  'mati', 'error', 'gangguan', 'trouble', 'down', 'lag', 'buffering',

  // Billing
  'tagihan', 'bayar', 'pembayaran', 'pulsa', 'kuota', 'paket', 'saldo', 'biaya',
  'charge', 'invoice', 'mahal', 'salah', 'lebih', 'kurang', 'refund',

  // Technical
  'aplikasi', 'app', 'modem', 'router', 'device', 'hp', 'handphone', 'laptop',
  'password', 'login', 'upgrade', 'install', 'update', 'setup', 'konfigurasi',

  // Account/Service
  'akun', 'account', 'registrasi', 'daftar', 'upgrade', 'downgrade', 'aktivasi',
  'blokir', 'block', 'suspend', 'cancel', 'ganti', 'ubah', 'pindah',

  // Urgency indicators
  'urgent', 'mendesak', 'cepat', 'segera', 'darurat', 'emergency', 'penting',
  'rugi', 'kerugian', 'kecewa', 'komplain', 'lapor',

  // Service quality
  'pelayanan', 'service', 'customer', 'support', 'bantuan', 'respons', 'lambat',
  'buruk', 'jelek', 'bagus', 'puas', 'kecewa'
]);

/**
 * Extract keywords from Indonesian text
 *
 * @param text - Indonesian text to extract keywords from
 * @param minLength - Minimum keyword length (default: 3)
 * @param maxKeywords - Maximum number of keywords to return (default: 10)
 * @returns Array of keywords with frequency
 */
export function extractKeywords(
  text: string,
  minLength: number = 3,
  maxKeywords: number = 10
): Array<{ keyword: string; frequency: number }> {
  // Normalize text
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ')      // Normalize whitespace
    .trim();

  // Tokenize
  const words = normalized.split(' ');

  // Count word frequency
  const wordFreq: Map<string, number> = new Map();

  for (const word of words) {
    // Skip if:
    // - Too short
    // - Is a stopword (unless it's important)
    // - Is a number
    if (
      word.length < minLength ||
      (!IMPORTANT_KEYWORDS.has(word) && INDONESIAN_STOPWORDS.has(word)) ||
      /^\d+$/.test(word)
    ) {
      continue;
    }

    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  }

  // Convert to array and sort by frequency (and importance)
  const keywords = Array.from(wordFreq.entries())
    .map(([keyword, frequency]) => ({
      keyword,
      frequency,
      // Boost important keywords in sorting
      score: frequency * (IMPORTANT_KEYWORDS.has(keyword) ? 2 : 1),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxKeywords)
    .map(({ keyword, frequency }) => ({ keyword, frequency }));

  return keywords;
}

/**
 * Extract bigrams (2-word phrases) from Indonesian text
 * Useful for capturing phrases like "internet mati", "tagihan salah"
 *
 * @param text - Indonesian text
 * @param maxBigrams - Maximum bigrams to return (default: 5)
 * @returns Array of bigrams with frequency
 */
export function extractBigrams(
  text: string,
  maxBigrams: number = 5
): Array<{ keyword: string; frequency: number }> {
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = normalized.split(' ').filter(w => w.length >= 3);
  const bigramFreq: Map<string, number> = new Map();

  for (let i = 0; i < words.length - 1; i++) {
    const word1 = words[i];
    const word2 = words[i + 1];

    // Skip if both words are stopwords
    if (INDONESIAN_STOPWORDS.has(word1) && INDONESIAN_STOPWORDS.has(word2)) {
      continue;
    }

    const bigram = `${word1} ${word2}`;
    bigramFreq.set(bigram, (bigramFreq.get(bigram) || 0) + 1);
  }

  const bigrams = Array.from(bigramFreq.entries())
    .map(([keyword, frequency]) => ({ keyword, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, maxBigrams);

  return bigrams;
}

/**
 * Extract both keywords and bigrams (combined approach)
 *
 * @param text - Indonesian text
 * @param options - Extraction options
 * @returns Combined array of keywords and phrases
 */
export function extractKeywordsAndPhrases(
  text: string,
  options: {
    maxKeywords?: number;
    maxBigrams?: number;
    minLength?: number;
  } = {}
): Array<{ keyword: string; frequency: number }> {
  const {
    maxKeywords = 7,
    maxBigrams = 3,
    minLength = 3,
  } = options;

  const keywords = extractKeywords(text, minLength, maxKeywords);
  const bigrams = extractBigrams(text, maxBigrams);

  // Combine and deduplicate
  const combined = [...keywords, ...bigrams];

  // Remove duplicates and return top results
  const uniqueMap = new Map<string, number>();
  for (const { keyword, frequency } of combined) {
    uniqueMap.set(keyword, (uniqueMap.get(keyword) || 0) + frequency);
  }

  return Array.from(uniqueMap.entries())
    .map(([keyword, frequency]) => ({ keyword, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, maxKeywords + maxBigrams);
}
