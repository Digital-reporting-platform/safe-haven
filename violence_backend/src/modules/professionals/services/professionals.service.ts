import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { Prisma, ServiceProviderType, UserRole } from '@prisma/client';
import { CreateServiceProviderDto } from '../dto/create-service-provider.dto';

@Injectable()
export class ProfessionalsService {
  private readonly logger = new Logger(ProfessionalsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create or update service provider (counselor, doctor, lawyer, etc.)
   */
  async createServiceProvider(dto: CreateServiceProviderDto) {
    this.logger.log(`Creating service provider: ${dto.name}`);

    const serviceProvider = await this.prisma.serviceProvider.create({
      data: {
        name: dto.name,
        type: dto.type,
        email: dto.email || null,
        phone: dto.phone || null,
        address: dto.address || null,
        city: dto.city || null,
        country: dto.country || null,
        description: dto.description || null,
        website: dto.website || null,
        isVerified: false, // Must be verified by admin
        languages: dto.languages || ['en'],
        specializations: dto.specializations || [],
        availability: dto.availability || 'available',
      },
    });

    this.logger.log(`Service provider created: ${serviceProvider.id}`);
    return serviceProvider;
  }

  /**
   * Get all service providers with filtering
   * Includes both ServiceProvider entries and User entries with professional roles
   */
  async getServiceProviders(
    page: number = 1,
    limit: number = 20,
    filters?: {
      type?: ServiceProviderType;
      verified?: boolean;
      city?: string;
      search?: string;
    },
  ) {
    const skip = (page - 1) * limit;

    // Map ServiceProviderType to User roles
    const roleMap: Record<string, UserRole[]> = {
      MEDICAL_PROFESSIONAL: [UserRole.MEDICAL_PROFESSIONAL],
      LEGAL_ADVISOR: [UserRole.LEGAL_ADVISOR],
      COUNSELOR: [UserRole.COUNSELOR],
    };

    const targetRoles = filters?.type ? roleMap[filters.type] || [] : [UserRole.MEDICAL_PROFESSIONAL, UserRole.LEGAL_ADVISOR, UserRole.COUNSELOR];

    // Fetch from ServiceProvider table
    const serviceProviderWhere: Prisma.ServiceProviderWhereInput = {
      ...(filters?.type && { type: filters.type }),
      ...(filters?.verified !== undefined && { isVerified: filters.verified }),
      ...(filters?.city && { city: filters.city }),
      ...(filters?.search && {
        OR: [
          {
            name: {
              contains: filters.search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            description: {
              contains: filters.search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
    };

    // Fetch from User table (internal staff)
    const userWhere: Prisma.UserWhereInput = {
      role: {
        in: targetRoles as any,
      },
      ...(filters?.search && {
        OR: [
          {
            firstName: {
              contains: filters.search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            lastName: {
              contains: filters.search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            email: {
              contains: filters.search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
    };

    const [serviceProviders, users] = await Promise.all([
      this.prisma.serviceProvider.findMany({
        where: serviceProviderWhere,
        include: {
          reviews: true,
        },
        orderBy: {
          rating: 'desc',
        },
      }),
      this.prisma.user.findMany({
        where: userWhere,
      }),
    ]);

    // Combine and format results
    const combinedProviders = [
      ...serviceProviders.map((sp) => ({
        id: sp.id,
        firstName: sp.name.split(' ')[0] || '',
        lastName: sp.name.split(' ').slice(1).join(' ') || '',
        name: sp.name,
        email: sp.email,
        phone: sp.phone,
        role: sp.type,
        type: sp.type,
        specialization: sp.specializations?.join(', ') || '',
        city: sp.city,
        isVerified: sp.isVerified,
        rating: sp.rating,
        source: 'service_provider',
      })),
      ...users.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        role: user.role,
        type: user.role === 'MEDICAL_PROFESSIONAL' ? 'MEDICAL_PROFESSIONAL' : 'LEGAL_ADVISOR',
        specialization: '',
        city: null,
        isVerified: true,
        rating: 0,
        source: 'internal_staff',
      })),
    ];

    const total = combinedProviders.length;
    const paginatedData = combinedProviders.slice(skip, skip + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get service provider by ID
   */
  async getServiceProvider(id: string) {
    const provider = await this.prisma.serviceProvider.findUnique({
      where: { id },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
        },
        assignedCases: true,
        supportCases: true,
      },
    });

    if (!provider) {
      throw new BadRequestException('Service provider not found');
    }

    return provider;
  }

  /**
   * Update service provider
   */
  async updateServiceProvider(id: string, dto: Partial<CreateServiceProviderDto>) {
    const provider = await this.prisma.serviceProvider.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.email && { email: dto.email }),
        ...(dto.phone && { phone: dto.phone }),
        ...(dto.city && { city: dto.city }),
        ...(dto.country && { country: dto.country }),
        ...(dto.description && { description: dto.description }),
        ...(dto.website && { website: dto.website }),
        ...(dto.languages && { languages: dto.languages }),
        ...(dto.specializations && {
          specializations: dto.specializations,
        }),
        ...(dto.availability && { availability: dto.availability }),
      },
    });

    return provider;
  }

  /**
   * Verify service provider (admin only)
   */
  async verifyServiceProvider(id: string) {
    this.logger.log(`Verifying service provider: ${id}`);

    const provider = await this.prisma.serviceProvider.update({
      where: { id },
      data: { isVerified: true },
    });

    return provider;
  }

  /**
   * Add review to service provider
   */
  async addReview(
    providerId: string,
    rating: number,
    feedback?: string,
  ) {
    const review = await this.prisma.serviceProviderReview.create({
      data: {
        serviceProviderId: providerId,
        rating: Math.min(Math.max(rating, 1), 5),
        feedback: feedback || null,
      },
    });

    // Update provider's average rating
    const reviews = await this.prisma.serviceProviderReview.findMany({
      where: { serviceProviderId: providerId },
    });

    const averageRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await this.prisma.serviceProvider.update({
      where: { id: providerId },
      data: { rating: averageRating },
    });

    this.logger.log(
      `Review added for provider ${providerId}, new rating: ${averageRating}`,
    );

    return review;
  }

  /**
   * Find specialists by category and location
   */
  async findSpecialists(
    category: string,
    location?: string,
    language?: string,
  ) {
    const where: any = {
      isVerified: true,
      specializations: {
        hasSome: [category],
      },
    };

    if (location) {
      where.city = location;
    }

    if (language) {
      where.languages = { hasSome: [language] };
    }

    return this.prisma.serviceProvider.findMany({
      where,
      include: {
        reviews: true,
      },
      orderBy: [{ rating: 'desc' }, { name: 'asc' }],
    });
  }

  /**
   * Get recommended professionals for case type
   */
  async getRecommendedProfessionals(
    caseType: string,
    severity: string,
    location?: string,
  ) {
    // Map case type to required professional types
    const typeMapping: Record<string, ServiceProviderType[]> = {
      COUNSELING: [ServiceProviderType.COUNSELOR],
      MEDICAL_SUPPORT: [ServiceProviderType.MEDICAL_PROFESSIONAL],
      LEGAL_ASSISTANCE: [ServiceProviderType.LEGAL_ADVISOR],
      EMERGENCY_SUPPORT: [
        ServiceProviderType.NGO,
        ServiceProviderType.GOVERNMENT_AGENCY,
      ],
      COMBINED_SUPPORT: [
        ServiceProviderType.COUNSELOR,
        ServiceProviderType.MEDICAL_PROFESSIONAL,
        ServiceProviderType.LEGAL_ADVISOR,
      ],
    };

    const requiredTypes = typeMapping[caseType] || [];

    const professionals = await this.prisma.serviceProvider.findMany({
      where: {
        type: { in: requiredTypes as any },
        isVerified: true,
        ...(location && { city: location }),
      },
      include: {
        reviews: true,
      },
      orderBy: [{ rating: 'desc' }],
      take: 5,
    });

    // Prioritize based on severity
    if (severity === 'CRITICAL') {
      return professionals.filter((p) => p.rating && p.rating >= 4);
    }

    return professionals;
  }

  /**
   * Get service directory by type
   */
  async getServiceDirectory(type?: ServiceProviderType) {
    const where = type ? { type } : {};

    const services = await this.prisma.serviceProvider.findMany({
      where: {
        ...where,
        isVerified: true,
      },
      include: {
        reviews: true,
      },
      orderBy: {
        rating: 'desc',
      },
    });

    // Group by type
    const grouped: Partial<Record<ServiceProviderType, typeof services>> = {};
    services.forEach((service) => {
      if (!grouped[service.type]) {
        grouped[service.type] = [];
      }
      grouped[service.type]!.push(service);
    });

    return grouped;
  }

  /**
   * Search service directory
   */
  async searchServiceDirectory(
    query: string,
    filters?: {
      type?: ServiceProviderType;
      city?: string;
      language?: string;
    },
  ) {
    const where: Prisma.ServiceProviderWhereInput = {
      isVerified: true,
      ...(filters?.type && { type: filters.type }),
      ...(filters?.city && { city: filters.city }),
      ...(filters?.language && { languages: { hasSome: [filters.language] } }),
      OR: [
        {
          name: {
            contains: query,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          description: {
            contains: query,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          specializations: {
            hasSome: [query],
          },
        },
      ],
    };

    return this.prisma.serviceProvider.findMany({
      where,
      include: {
        reviews: true,
      },
      take: 20,
    });
  }

  /**
   * Get professionals statistics
   */
  async getProfessionalsStats() {
    const stats = await this.prisma.serviceProvider.groupBy({
      by: ['type'],
      _count: true,
    });

    const verified = await this.prisma.serviceProvider.count({
      where: { isVerified: true },
    });

    const totalCount = await this.prisma.serviceProvider.count();

    return {
      byType: stats,
      verified,
      total: totalCount,
      unverified: totalCount - verified,
    };
  }
}
