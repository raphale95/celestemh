
export const TIME_SLOTS: string[] = [];
for (let i = 7; i <= 22; i++) {
    const hour = i.toString().padStart(2, '0');
    TIME_SLOTS.push(`${hour}:00`);
    TIME_SLOTS.push(`${hour}:30`);
}
