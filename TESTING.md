# การทดสอบระบบ (Testing Guide)

## ภาพรวม

โปรเจคนี้ใช้ **Vitest** เป็น testing framework หลัก ร่วมกับ **@testing-library/react** สำหรับการทดสอบ React components และ **@testing-library/jest-dom** สำหรับ custom matchers

## การติดตั้งและรันเทส

### คำสั่งหลัก

```bash
# รันเทสทั้งหมดในโหมด watch
npm run test

# รันเทสทั้งหมดครั้งเดียว
npm run test:run

# รันเทสพร้อม UI interface
npm run test:ui

# รันเทสพร้อม coverage report
npm run test:coverage
```

## โครงสร้างไฟล์เทส

```
src/
├── test/
│   └── setup.ts                 # Test environment setup
├── utils/
│   └── __tests__/
│       └── date.test.ts         # Date utility tests
├── components/
│   └── __tests__/
│       ├── LoadingSpinner.test.tsx
│       └── ErrorPage.test.tsx
│   └── contract/
│       └── __tests__/
│           └── ContractFileTypeSelector.test.tsx
└── services/
    └── __tests__/
        ├── api.test.ts
        ├── health.service.test.ts
        └── phone-model.service.test.ts
```

## ประเภทการทดสอบ

### 1. Unit Tests สำหรับ Utilities

ทดสอบฟังก์ชัน utility ที่ไม่ขึ้นกับ React เช่น:

- **Date utilities** (`src/utils/date.ts`)
  - `formatDateThai()` - แปลงวันที่เป็นรูปแบบไทย
  - `formatDateShort()` - แปลงวันที่แบบสั้น
  - `formatDateISO()` - แปลงวันที่เป็น ISO format

### 2. Component Tests

ทดสอบ React components โดยใช้ `@testing-library/react`:

- **LoadingSpinner** - ตรวจสอบการแสดงผลและ props
- **ErrorPage** - ตรวจสอบข้อความและ UI elements
- **ContractFileTypeSelector** - ตรวจสอบ user interactions

### 3. Service Tests

ทดสอบ API services โดยใช้ mocks:

- **API Client** - ตรวจสอบ HTTP requests และ error handling
- **Health Service** - ตรวจสอบ health check endpoint
- **Phone Model Service** - ตรวจสอบ CRUD operations

## การเขียนเทส

### ตัวอย่างการเขียนเทสสำหรับ Utility Function

```typescript
import { describe, it, expect } from 'vitest';
import { formatDateThai } from '../date';

describe('Date Utils', () => {
  describe('formatDateThai', () => {
    it('ควรแปลงวันที่ ISO string เป็นรูปแบบ dd/MM/yyyy HH:mm', () => {
      const testDate = '2024-01-15T10:30:00.000Z';
      const result = formatDateThai(testDate);
      expect(result).toBe('15/01/2024 10:30');
    });

    it('ควรคืนค่า "-" เมื่อได้รับ null', () => {
      const result = formatDateThai(null);
      expect(result).toBe('-');
    });
  });
});
```

### ตัวอย่างการเขียนเทสสำหรับ React Component

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('ควรแสดงข้อความที่ถูกต้อง', () => {
    render(<MyComponent text="Hello World" />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('ควรเรียก callback เมื่อคลิกปุ่ม', () => {
    const mockCallback = vi.fn();
    render(<MyComponent onButtonClick={mockCallback} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockCallback).toHaveBeenCalled();
  });
});
```

### ตัวอย่างการเขียนเทสสำหรับ Service

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getData } from '../myService';

// Mock API client
vi.mock('../api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('MyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ควรเรียก API และคืนค่าข้อมูล', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockResponse = { data: mockData, status: 200 };

    const { apiClient } = await import('../api');
    vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

    const result = await getData();
    expect(result).toEqual(mockData);
  });
});
```

## Best Practices

### 1. การตั้งชื่อเทส
- ใช้ภาษาไทยเพื่อความชัดเจน
- เริ่มต้นด้วย "ควร" เพื่อระบุพฤติกรรมที่คาดหวัง
- อธิบาย input และ expected output

### 2. การจัดกลุ่มเทส
- ใช้ `describe` เพื่อจัดกลุ่มเทสที่เกี่ยวข้องกัน
- แยกเทสตามฟังก์ชันหรือ component

### 3. การ Mock
- Mock external dependencies (API, localStorage, etc.)
- ใช้ `vi.fn()` สำหรับ mock functions
- ใช้ `vi.mock()` สำหรับ mock modules

### 4. การ Cleanup
- ใช้ `beforeEach` เพื่อ reset mocks
- ใช้ `afterEach` เพื่อ cleanup ถ้าจำเป็น

## Coverage

การทดสอบครอบคลุม:

- ✅ **Utils/Helpers** - 100%
- ✅ **Components** - UI rendering และ user interactions
- ✅ **Services** - API calls และ error handling
- ⏳ **Integration Tests** - ระหว่าง components
- ⏳ **E2E Tests** - User workflows

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **Module not found**
   ```bash
   # ตรวจสอบ path และ import statements
   # ใช้ relative paths ที่ถูกต้อง
   ```

2. **Mock not working**
   ```typescript
   // ตรวจสอบว่า mock ถูกตั้งค่าก่อน import
   vi.mock('./myModule');
   ```

3. **Async test failing**
   ```typescript
   // ใช้ async/await หรือ return promise
   it('should work', async () => {
     const result = await myAsyncFunction();
     expect(result).toBe(expected);
   });
   ```

## การเพิ่มเทสใหม่

1. สร้างไฟล์ `.test.ts` หรือ `.test.tsx` ในโฟลเดอร์ `__tests__`
2. Import dependencies และ functions ที่ต้องการเทส
3. เขียน test cases ตาม pattern ที่มีอยู่
4. รันเทสเพื่อตรวจสอบว่า pass
5. Commit และ push โค้ด

## การอัปเดตเทส

เมื่อมีการเปลี่ยนแปลงโค้ด:

1. รันเทสทั้งหมดเพื่อดูว่าเทสไหน fail
2. อัปเดตเทสให้สอดคล้องกับการเปลี่ยนแปลง
3. ตรวจสอบว่าเทสใหม่ครอบคลุมฟีเจอร์ใหม่
4. รันเทสอีกครั้งเพื่อยืนยัน

---

**หมายเหตุ**: เทสเหล่านี้ช่วยให้มั่นใจได้ว่าโค้ดทำงานได้ถูกต้องและป้องกัน regression bugs เมื่อมีการเปลี่ยนแปลงในอนาคต 