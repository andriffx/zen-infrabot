const DESTRUCTIVE_PATTERNS = [
  /\brm\b[^;&|]*\s(-[a-zA-Z]*r[a-zA-Z]*|--recursive)\b/i,
  /\bmkfs(\.[a-z0-9]+)?\b/i,
  /\bdd\s+if=/i,
  /\bwipefs\b/i,
  /\biptables\s+(-F|--flush)\b/i,
  /\bufw\s+reset\b/i,
  /\bdocker\s+system\s+prune\b[^;&|]*\s(-[a-zA-Z]*a[a-zA-Z]*|--all)\b/i
];

export function isDestructiveCommand(command: string): boolean {
  if (!command) return false;
  return DESTRUCTIVE_PATTERNS.some((pattern) => pattern.test(command));
}
