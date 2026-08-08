import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ServiceProviderType } from '@prisma/client';
import { UpdateMedicalProfileDto } from '../dto/update-medical-profile.dto';

type ExtendedProfile = {
  licenseNumber?: string;
  resumeUrl?: string;
  workHistory?: Array<{ company?: string; role?: string; period?: string }>;
  certifications?: string[];
  bio?: string;
};

@Injectable()
export class MedicalProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    if (!user) throw new BadRequestException('User not found');

    const provider = await this.prisma.serviceProvider.findFirst({
      where: {
        type: ServiceProviderType.MEDICAL_PROFESSIONAL,
        OR: [{ email: user.email }, { phone: user.phone || undefined }],
      },
      orderBy: { updatedAt: 'desc' },
    });

    const extra = this.parseExtendedProfile(provider?.description);

    return {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      phone: user.phone || '',
      specialty: provider?.specializations?.[0] || '',
      licenseNumber: extra.licenseNumber || '',
      hospital: provider?.name || '',
      bio: extra.bio || '',
      resumeUrl: extra.resumeUrl || '',
      certifications: extra.certifications || [],
      workHistory: extra.workHistory || [],
    };
  }

  async updateProfile(userId: string, dto: UpdateMedicalProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, phone: true, firstName: true, lastName: true },
    });

    if (!user) throw new BadRequestException('User not found');

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
    });

    const currentProvider = await this.prisma.serviceProvider.findFirst({
      where: {
        type: ServiceProviderType.MEDICAL_PROFESSIONAL,
        OR: [{ email: user.email }, { phone: user.phone || undefined }],
      },
      orderBy: { updatedAt: 'desc' },
    });

    const existingExtra = this.parseExtendedProfile(currentProvider?.description);
    const mergedExtra: ExtendedProfile = {
      ...existingExtra,
      ...(dto.licenseNumber !== undefined && { licenseNumber: dto.licenseNumber }),
      ...(dto.resumeUrl !== undefined && { resumeUrl: dto.resumeUrl }),
      ...(dto.workHistory !== undefined && { workHistory: dto.workHistory }),
      ...(dto.certifications !== undefined && { certifications: dto.certifications }),
      ...(dto.bio !== undefined && { bio: dto.bio }),
    };

    const providerData = {
      name:
        dto.hospital ||
        currentProvider?.name ||
        `${dto.firstName ?? user.firstName ?? ''} ${dto.lastName ?? user.lastName ?? ''}`.trim() ||
        'Medical Provider',
      type: ServiceProviderType.MEDICAL_PROFESSIONAL,
      email: user.email,
      phone: dto.phone ?? user.phone ?? null,
      description: JSON.stringify(mergedExtra),
      specializations:
        dto.specialty !== undefined
          ? dto.specialty
            ? [dto.specialty]
            : []
          : currentProvider?.specializations || [],
      isVerified: currentProvider?.isVerified ?? true,
      languages: currentProvider?.languages || ['en'],
    };

    if (currentProvider) {
      await this.prisma.serviceProvider.update({
        where: { id: currentProvider.id },
        data: providerData,
      });
    } else {
      await this.prisma.serviceProvider.create({
        data: providerData,
      });
    }

    return this.getProfile(userId);
  }

  async updateResumeUrl(userId: string, resumeUrl: string) {
    return this.updateProfile(userId, { resumeUrl });
  }

  private parseExtendedProfile(description?: string | null): ExtendedProfile {
    if (!description) return {};
    try {
      const parsed = JSON.parse(description);
      if (parsed && typeof parsed === 'object') {
        return parsed as ExtendedProfile;
      }
      return {};
    } catch {
      return { bio: description };
    }
  }
}
