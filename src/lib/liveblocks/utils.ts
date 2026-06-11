export const CURSOR_COLORS = [
    '#e74c3c',
    '#3498db',
    '#2ecc71',
    '#f39c12',
    '#9b59b6',
    '#1abc9c',
];

export function colorForUser(userId: string): string {
    let hash = 0;
    for (const c of userId) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
    return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}
