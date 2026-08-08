import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmptyObject,
  IsObject,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export const SYSTEM_SETTINGS_CATEGORIES = [
  'general',
  'security',
  'notifications',
  'maintenance',
] as const;

export type SystemSettingsCategory =
  (typeof SYSTEM_SETTINGS_CATEGORIES)[number];

export class GeneralSettingsDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  siteName!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  siteDescription!: string;

  @IsEmail()
  contactEmail!: string;

  @IsIn(['UTC', 'EST', 'PST', 'GMT'])
  timezone!: string;

  @IsIn(['en', 'es', 'fr', 'am'])
  language!: string;
}

export class SecuritySettingsDto {
  @IsBoolean()
  enableTwoFactor!: boolean;

  @IsInt()
  @Min(5)
  @Max(240)
  sessionTimeout!: number;

  @IsInt()
  @Min(8)
  @Max(64)
  passwordMinLength!: number;

  @IsBoolean()
  enableAuditLogs!: boolean;

  @IsInt()
  @Min(3)
  @Max(20)
  maxLoginAttempts!: number;
}

export class NotificationSettingsDto {
  @IsBoolean()
  emailNotifications!: boolean;

  @IsBoolean()
  smsNotifications!: boolean;

  @IsBoolean()
  pushNotifications!: boolean;

  @IsBoolean()
  weeklyReports!: boolean;

  @IsBoolean()
  incidentAlerts!: boolean;
}

export class MaintenanceSettingsDto {
  @IsBoolean()
  maintenanceMode!: boolean;

  @IsIn(['hourly', 'daily', 'weekly', 'monthly'])
  backupFrequency!: string;

  @IsInt()
  @Min(7)
  @Max(3650)
  logRetentionDays!: number;

  @IsBoolean()
  autoUpdates!: boolean;
}

export class UpdateSystemSettingDto {
  @IsObject()
  @IsNotEmptyObject()
  data!: Record<string, unknown>;
}
