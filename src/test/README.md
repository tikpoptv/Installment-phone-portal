# Test Directory

โฟลเดอร์นี้เก็บไฟล์ที่เกี่ยวข้องกับการทดสอบทั้งหมด

## ไฟล์ในโฟลเดอร์นี้

### `setup.ts`
ไฟล์ตั้งค่า environment สำหรับการทดสอบ ประกอบด้วย:

- **Environment Variables Mocking**: ตั้งค่า environment variables สำหรับการทดสอบ
- **LocalStorage Mocking**: Mock localStorage API
- **Window Location Mocking**: Mock window.location
- **Console Mocking**: ลด noise ใน console ระหว่างการทดสอบ

## การใช้งาน

ไฟล์ `setup.ts` จะถูกเรียกใช้โดยอัตโนมัติเมื่อรันเทสผ่าน vitest config:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    setupFiles: ['./src/test/setup.ts'],
    // ...
  },
});
```

## การเพิ่ม Mock ใหม่

หากต้องการเพิ่ม mock ใหม่ ให้เพิ่มในไฟล์ `setup.ts`:

```typescript
// ตัวอย่างการเพิ่ม mock ใหม่
Object.defineProperty(window, 'newAPI', {
  value: {
    method: vi.fn(),
  },
  writable: true,
});
```

## Best Practices

1. **Mock ตามความจำเป็น**: Mock เฉพาะสิ่งที่จำเป็นสำหรับการทดสอบ
2. **Reset Mocks**: ใช้ `vi.clearAllMocks()` ใน `beforeEach` เพื่อ reset mocks
3. **Type Safety**: ใช้ TypeScript types ที่ถูกต้องสำหรับ mocks
4. **Documentation**: อธิบาย mock ที่ซับซ้อนด้วย comments 