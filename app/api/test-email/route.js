// Test endpoint disabled — use /api/cron/auto-run instead
export async function GET() {
  return Response.json({ message: 'Use /api/cron/auto-run to trigger agents' });
}
