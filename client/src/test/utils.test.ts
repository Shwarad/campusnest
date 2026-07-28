import { describe, it, expect } from 'vitest';

// Front-end utility: expense calculator logic
function calculateExpenses(params: {
  rent: number;
  electricity: number;
  water: number;
  wifi: number;
  food: number;
  maid: number;
  transport: number;
  other: number;
  roommates: number;
}): { total: number; perStudent: number } {
  const total = params.rent + params.electricity + params.water + params.wifi + params.food + params.maid + params.transport + params.other;
  const perStudent = Math.round(total / Math.max(1, params.roommates));
  return { total, perStudent };
}

describe('Expense Calculator', () => {
  it('should compute total correctly', () => {
    const result = calculateExpenses({ rent: 8000, electricity: 500, water: 100, wifi: 400, food: 3000, maid: 500, transport: 600, other: 200, roommates: 1 });
    expect(result.total).toBe(13300);
    expect(result.perStudent).toBe(13300);
  });

  it('should split costs correctly for 3 roommates', () => {
    const result = calculateExpenses({ rent: 9000, electricity: 600, water: 150, wifi: 450, food: 0, maid: 600, transport: 0, other: 0, roommates: 3 });
    expect(result.perStudent).toBe(Math.round(10800 / 3));
  });

  it('should handle 0 roommates by defaulting to 1', () => {
    const result = calculateExpenses({ rent: 5000, electricity: 0, water: 0, wifi: 0, food: 0, maid: 0, transport: 0, other: 0, roommates: 0 });
    expect(result.perStudent).toBe(5000);
  });
});

// Input validation tests for property form
describe('Property Form Validation', () => {
  const validate = (data: { rent: number; title: string; pincode: string }) => {
    const errors: Record<string, string> = {};
    if (!data.title || data.title.length < 5) errors.title = 'Title too short';
    if (data.rent < 100) errors.rent = 'Rent too low';
    if (!/^\d{6}$/.test(data.pincode)) errors.pincode = 'Invalid pincode';
    return errors;
  };

  it('should pass for valid data', () => {
    const errors = validate({ rent: 5000, title: 'Nice PG in Guwahati', pincode: '781014' });
    expect(Object.keys(errors).length).toBe(0);
  });

  it('should fail for short title', () => {
    const errors = validate({ rent: 5000, title: 'PG', pincode: '781014' });
    expect(errors.title).toBeDefined();
  });

  it('should fail for invalid rent', () => {
    const errors = validate({ rent: 0, title: 'Nice PG near campus', pincode: '781014' });
    expect(errors.rent).toBeDefined();
  });

  it('should fail for invalid pincode', () => {
    const errors = validate({ rent: 5000, title: 'Nice PG near campus', pincode: '1234' });
    expect(errors.pincode).toBeDefined();
  });
});
