import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ClassificationService } from '../classification/services/classification.service';

@Injectable()
export class JobSyncService {
  private readonly logger = new Logger(JobSyncService.name);

  constructor(
    private http: HttpService,
    private prisma: PrismaService,
    private classifier: ClassificationService // Reuse your existing ML service!
  ) {}

  // This runs every 6 hours
  @Cron(CronExpression.EVERY_6_HOURS)
  async syncExternalJobs() {
    this.logger.log('Starting job sync from external sources...');
    
    try {
      const hahuJobs = await this.fetchFromHaHu();
      const ngoJobs = await this.fetchFromNGOJobs();
      
      const allFetched = [...hahuJobs, ...ngoJobs];
      this.logger.log(`Fetched ${allFetched.length} jobs from external sources`);

      for (const job of allFetched) {
        // Re-use your platform's ML to see if the job is "Trauma-Informed"
        const analysis = await this.classifier.classifyReport(job.description);
        
        const tags: string[] = [];
        if (job.description.toLowerCase().includes('remote')) tags.push('REMOTE');
        if (job.description.toLowerCase().includes('part-time')) tags.push('LOW_STRESS');
        if (job.description.toLowerCase().includes('flexible')) tags.push('FLEXIBLE');
        
        // If the job is in an NGO or Social sector, mark it higher for survivors
        const recoveryLevel = (job.source === 'NGOJOBS') ? 1 : 3;

        await this.prisma.jobOpportunity.upsert({
          where: { externalId: job.externalId },
          update: {
            title: job.title,
            company: job.company,
            description: job.description,
            category: job.category,
            tags: tags,
            sourceUrl: job.sourceUrl,
          },
          create: {
            externalId: job.externalId,
            source: job.source,
            sourceUrl: job.sourceUrl,
            title: job.title,
            company: job.company,
            description: job.description,
            category: job.category,
            tags: tags,
            minRecoveryLevel: recoveryLevel,
            isVerified: true, // Mark sample jobs as verified for public access
          }
        });
      }

      this.logger.log(`Successfully synced ${allFetched.length} jobs`);
    } catch (error) {
      this.logger.error('Error syncing jobs:', error);
    }
  }

  private async fetchFromHaHu() {
    // Example HaHuJobs API call
    // TODO: Replace with actual API integration
    // const response = await this.http.get('https://api.hahujobs.africa/v1/jobs').toPromise();
    // return response.data.map(job => ({ ...job, source: 'HAHU' }));
    
    return [{ 
        externalId: 'hahu-1', 
        title: 'Data Entry Specialist', 
        company: 'Ethio Tech Solutions', 
        description: 'Work from home data entry position. Flexible hours, part-time available. Perfect for those seeking remote work opportunities.',
        source: 'HAHU',
        sourceUrl: 'https://hahujobs.africa/jobs/1',
        category: 'Technology'
    },
    { 
        externalId: 'hahu-2', 
        title: 'Customer Service Representative', 
        company: 'Ethiopian Airlines', 
        description: 'Remote customer service role with flexible scheduling. Training provided.',
        source: 'HAHU',
        sourceUrl: 'https://hahujobs.africa/jobs/2',
        category: 'Customer Service'
    }];
  }

  private async fetchFromNGOJobs() {
    // Logic for NGOJobsEthiopia.com
    // TODO: Replace with actual API integration
    // const response = await this.http.get('https://api.ngojobsethiopia.com/jobs').toPromise();
    // return response.data.map(job => ({ ...job, source: 'NGOJOBS' }));
    
    return [{
        externalId: 'ngo-1',
        title: 'Social Worker',
        company: 'UNICEF Ethiopia',
        description: 'Supporting vulnerable communities in Addis Ababa. Experience with trauma-informed care preferred.',
        source: 'NGOJOBS',
        sourceUrl: 'https://ngojobsethiopia.com/job/social-worker-1',
        category: 'Social Work'
    },
    {
        externalId: 'ngo-2',
        title: 'Community Health Educator',
        company: 'Save the Children Ethiopia',
        description: 'Part-time position educating communities about health and wellness. Flexible schedule.',
        source: 'NGOJOBS',
        sourceUrl: 'https://ngojobsethiopia.com/job/health-educator-2',
        category: 'Healthcare'
    }];
  }

  // Manual trigger for testing
  async manualSync() {
    this.logger.log('Manual job sync triggered');
    return this.syncExternalJobs();
  }
}