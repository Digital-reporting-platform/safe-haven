import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { validateSync } from 'class-validator';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  GeneralSettingsDto,
  MaintenanceSettingsDto,
  NotificationSettingsDto,
  SecuritySettingsDto,
  SYSTEM_SETTINGS_CATEGORIES,
  SystemSettingsCategory,
} from '../dto/system-settings.dto';

export type SystemSettings = {
  general: GeneralSettingsDto;
  security: SecuritySettingsDto;
  notifications: NotificationSettingsDto;
  maintenance: MaintenanceSettingsDto;
};

@Injectable()
export class SystemSettingsService {
  private readonly defaults: SystemSettings = {
    general: {
      siteName: 'SafeHaven',
      siteDescription: 'A platform for survivor support and resources',
      contactEmail: 'admin@safehaven.org',
      timezone: 'UTC',
      language: 'en',
    },
    security: {
      enableTwoFactor: true,
      sessionTimeout: 30,
      passwordMinLength: 8,
      enableAuditLogs: true,
      maxLoginAttempts: 5,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      weeklyReports: true,
      incidentAlerts: true,
    },
    maintenance: {
      maintenanceMode: false,
      backupFrequency: 'daily',
      logRetentionDays: 90,
      autoUpdates: true,
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  async getAllSettings(): Promise<SystemSettings> {
    const settings: SystemSettings = {
      ...this.defaults,
      general: { ...this.defaults.general },
      security: { ...this.defaults.security },
      notifications: { ...this.defaults.notifications },
      maintenance: { ...this.defaults.maintenance },
    };
    let rows: { category: string; data: Prisma.JsonValue }[] = [];

    try {
      rows = await this.prisma.$queryRaw<
        { category: string; data: Prisma.JsonValue }[]
      >`SELECT "category", "data" FROM "SystemSetting"`;
    } catch (error) {
      if (this.isMissingSystemSettingsTableError(error)) {
        return settings;
      }
      throw error;
    }

    for (const row of rows) {
      if (!this.isValidCategory(row.category)) {
        continue;
      }

      const category = row.category as SystemSettingsCategory;
      const merged = {
        ...settings[category],
        ...(this.toPlainObject(row.data) as Record<string, unknown>),
      };

      settings[category] = this.validateCategory(category, merged) as any;
    }

    return settings;
  }

  async updateCategory(
    category: string,
    data: Record<string, unknown>,
    userId?: string,
  ) {
    if (!this.isValidCategory(category)) {
      throw new BadRequestException('Invalid settings category');
    }

    const typedCategory = category as SystemSettingsCategory;
    const allSettings = await this.getAllSettings();
    const merged = {
      ...allSettings[typedCategory],
      ...data,
    };
    const validated = this.validateCategory(typedCategory, merged);

    try {
      await this.prisma.$executeRaw`
        INSERT INTO "SystemSetting" (
          "id",
          "category",
          "data",
          "updatedById",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          ${this.createSettingId()},
          ${typedCategory},
          ${validated as unknown as Prisma.InputJsonValue},
          ${userId || null},
          NOW(),
          NOW()
        )
        ON CONFLICT ("category")
        DO UPDATE SET
          "data" = EXCLUDED."data",
          "updatedById" = EXCLUDED."updatedById",
          "updatedAt" = NOW()
      `;
    } catch (error) {
      if (this.isMissingSystemSettingsTableError(error)) {
        throw new BadRequestException(
          'System settings storage is not initialized. Run database migrations first.',
        );
      }
      throw error;
    }

    return {
      category: typedCategory,
      data: validated,
    };
  }

  ensureAdmin(role?: string) {
    if (role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
  }

  private isValidCategory(value: string): value is SystemSettingsCategory {
    return (SYSTEM_SETTINGS_CATEGORIES as readonly string[]).includes(value);
  }

  private createSettingId() {
    const random = Math.random().toString(36).slice(2, 10);
    return `settings_${Date.now()}_${random}`;
  }

  private isMissingSystemSettingsTableError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2010' &&
      typeof (error as any).message === 'string' &&
      (error as any).message.includes('SystemSetting')
    );
  }

  private toPlainObject(value: Prisma.JsonValue): Record<string, unknown> {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }

    return {};
  }

  private validateCategory(
    category: SystemSettingsCategory,
    payload: Record<string, unknown>,
  ) {
    const DtoClass = this.getCategoryDto(category);
    const instance = Object.assign(new DtoClass(), payload);
    const errors = validateSync(instance as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const messages = errors
        .map((error) => Object.values(error.constraints || {}).join(', '))
        .filter(Boolean)
        .join(', ');

      throw new BadRequestException(
        messages || 'Invalid settings payload provided',
      );
    }

    return JSON.parse(JSON.stringify(instance)) as Record<string, unknown>;
  }

  private getCategoryDto(category: SystemSettingsCategory) {
    switch (category) {
      case 'general':
        return GeneralSettingsDto;
      case 'security':
        return SecuritySettingsDto;
      case 'notifications':
        return NotificationSettingsDto;
      case 'maintenance':
        return MaintenanceSettingsDto;
      default:
        return GeneralSettingsDto;
    }
  }
}
