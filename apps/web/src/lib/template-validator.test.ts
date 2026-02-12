import { describe, it, expect } from 'vitest';
import {
  validateTemplate,
  validateTemplates,
  type CustomTemplate,
  type GuildTemplateType,
} from '@/lib/template-validator';

describe('Template Validator', () => {
  const validTemplate: CustomTemplate = {
    id: 'test-001',
    name: 'Test Template',
    type: 'raid' as GuildTemplateType,
    roles: ['Tank', 'Healer', 'DPS'],
    eventCadence: 'Weekly raid on Saturday 20:00 KST',
    attendancePolicy: 'Mandatory for core members',
    announcementStyle: 'Formal with event details',
  };

  describe('validateTemplate', () => {
    it('should pass for valid template', () => {
      const result = validateTemplate(validTemplate);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when ID is missing', () => {
      const invalid = { ...validTemplate, id: '' };
      const result = validateTemplate(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'id')).toBe(true);
    });

    it('should fail when name is missing', () => {
      const invalid = { ...validTemplate, name: '' };
      const result = validateTemplate(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'name')).toBe(true);
    });

    it('should fail when type is invalid', () => {
      const invalid = { ...validTemplate, type: 'invalid' as GuildTemplateType };
      const result = validateTemplate(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'type')).toBe(true);
    });

    it('should fail when roles contain duplicates', () => {
      const invalid = { ...validTemplate, roles: ['Tank', 'Tank', 'Healer'] };
      const result = validateTemplate(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'roles' && e.message.includes('Duplicate'))).toBe(
        true
      );
    });

    it('should fail when roles contain empty strings', () => {
      const invalid = { ...validTemplate, roles: ['Tank', '', 'Healer'] };
      const result = validateTemplate(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'roles' && e.message.includes('Empty'))).toBe(
        true
      );
    });

    it('should warn when roles array is empty', () => {
      const template = { ...validTemplate, roles: [] };
      const result = validateTemplate(template);
      expect(result.valid).toBe(true); // 경고만 있으므로 valid는 true
      expect(result.warnings.some(w => w.field === 'roles')).toBe(true);
    });

    it('should warn when eventCadence is missing', () => {
      const template = { ...validTemplate, eventCadence: '' };
      const result = validateTemplate(template);
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'eventCadence')).toBe(true);
    });

    it('should warn when attendancePolicy is missing', () => {
      const template = { ...validTemplate, attendancePolicy: '' };
      const result = validateTemplate(template);
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'attendancePolicy')).toBe(true);
    });

    it('should warn when announcementStyle is missing', () => {
      const template = { ...validTemplate, announcementStyle: '' };
      const result = validateTemplate(template);
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'announcementStyle')).toBe(true);
    });
  });

  describe('validateTemplates (batch)', () => {
    it('should validate multiple templates', () => {
      const templates: CustomTemplate[] = [
        validTemplate,
        { ...validTemplate, id: 'test-002', name: 'Another Template' },
      ];

      const results = validateTemplates(templates);
      expect(results.size).toBe(2);
      expect(results.get('test-001')?.valid).toBe(true);
      expect(results.get('test-002')?.valid).toBe(true);
    });

    it('should detect errors in batch validation', () => {
      const templates: CustomTemplate[] = [
        validTemplate,
        { ...validTemplate, id: 'test-002', name: '' }, // invalid
      ];

      const results = validateTemplates(templates);
      expect(results.get('test-001')?.valid).toBe(true);
      expect(results.get('test-002')?.valid).toBe(false);
      expect(results.get('test-002')?.errors.length).toBeGreaterThan(0);
    });
  });
});
