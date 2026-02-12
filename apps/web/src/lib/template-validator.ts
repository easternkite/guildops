/**
 * Template Validator
 * 템플릿 적용 전 기본 규칙 유효성 체크
 */

export type GuildTemplateType = 'raid' | 'esports' | 'community' | 'custom';

export interface CustomTemplate {
  id: string;
  name: string;
  type: GuildTemplateType;
  roles: string[];
  eventCadence: string;
  attendancePolicy: string;
  announcementStyle: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error';
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'warning';
}

/**
 * 템플릿 필수 필드 검증
 */
function validateRequiredFields(template: CustomTemplate): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!template.id || template.id.trim() === '') {
    errors.push({
      field: 'id',
      message: 'Template ID is required',
      severity: 'error',
    });
  }

  if (!template.name || template.name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'Template name is required',
      severity: 'error',
    });
  }

  if (!template.type) {
    errors.push({
      field: 'type',
      message: 'Template type is required',
      severity: 'error',
    });
  }

  return errors;
}

/**
 * 템플릿 타입 유효성 검증
 */
function validateType(template: CustomTemplate): ValidationError[] {
  const errors: ValidationError[] = [];
  const validTypes: GuildTemplateType[] = ['raid', 'esports', 'community', 'custom'];

  if (template.type && !validTypes.includes(template.type)) {
    errors.push({
      field: 'type',
      message: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
      severity: 'error',
    });
  }

  return errors;
}

/**
 * 역할 목록 검증
 */
function validateRoles(template: CustomTemplate): (ValidationError | ValidationWarning)[] {
  const issues: (ValidationError | ValidationWarning)[] = [];

  if (!template.roles || !Array.isArray(template.roles)) {
    issues.push({
      field: 'roles',
      message: 'Roles must be an array',
      severity: 'error',
    });
    return issues;
  }

  if (template.roles.length === 0) {
    issues.push({
      field: 'roles',
      message: 'At least one role is recommended',
      severity: 'warning',
    });
  }

  // 역할명 중복 검증
  const uniqueRoles = new Set(template.roles);
  if (uniqueRoles.size !== template.roles.length) {
    issues.push({
      field: 'roles',
      message: 'Duplicate role names found',
      severity: 'error',
    });
  }

  // 빈 역할명 검증
  const emptyRoles = template.roles.filter(role => !role || role.trim() === '');
  if (emptyRoles.length > 0) {
    issues.push({
      field: 'roles',
      message: 'Empty role names are not allowed',
      severity: 'error',
    });
  }

  return issues;
}

/**
 * 이벤트 주기 검증
 */
function validateEventCadence(template: CustomTemplate): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (!template.eventCadence || template.eventCadence.trim() === '') {
    warnings.push({
      field: 'eventCadence',
      message: 'Event cadence is not defined',
      severity: 'warning',
    });
  }

  return warnings;
}

/**
 * 출석 정책 검증
 */
function validateAttendancePolicy(template: CustomTemplate): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (!template.attendancePolicy || template.attendancePolicy.trim() === '') {
    warnings.push({
      field: 'attendancePolicy',
      message: 'Attendance policy is not defined',
      severity: 'warning',
    });
  }

  return warnings;
}

/**
 * 공지 스타일 검증
 */
function validateAnnouncementStyle(template: CustomTemplate): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (!template.announcementStyle || template.announcementStyle.trim() === '') {
    warnings.push({
      field: 'announcementStyle',
      message: 'Announcement style is not defined',
      severity: 'warning',
    });
  }

  return warnings;
}

/**
 * 템플릿 전체 검증
 */
export function validateTemplate(template: CustomTemplate): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 필수 필드 검증
  errors.push(...validateRequiredFields(template));

  // 타입 검증
  errors.push(...validateType(template));

  // 역할 검증
  const roleIssues = validateRoles(template);
  roleIssues.forEach(issue => {
    if (issue.severity === 'error') {
      errors.push(issue as ValidationError);
    } else {
      warnings.push(issue as ValidationWarning);
    }
  });

  // 선택 필드 검증 (경고)
  warnings.push(...validateEventCadence(template));
  warnings.push(...validateAttendancePolicy(template));
  warnings.push(...validateAnnouncementStyle(template));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 배치 검증 (여러 템플릿)
 */
export function validateTemplates(templates: CustomTemplate[]): Map<string, ValidationResult> {
  const results = new Map<string, ValidationResult>();

  templates.forEach(template => {
    results.set(template.id, validateTemplate(template));
  });

  return results;
}
