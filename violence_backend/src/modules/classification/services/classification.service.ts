import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  IncidentCategory,
  SeverityLevel,
  CaseType,
} from '@prisma/client';
import * as crypto from 'crypto';

export interface ClassificationResult {
  category: IncidentCategory;
  severity: SeverityLevel;
  suggestedCaseType: CaseType;
  confidence: number;
  keywordMatches: string[];
  riskIndicators?: string[];
  detectedLanguage?: string;
  translatedText?: string;
  supportTrack?: 'MEDICAL' | 'LEGAL' | 'BOTH';
}

export interface RiskScoreResult {
  riskScore: number;
  isRepetitive: boolean;
  isDuplicate: boolean;
  flagged: boolean;
  reasons: string[];
}

interface LanguageVariant {
  keywords: string[];
  severity: SeverityLevel;
}

@Injectable()
export class ClassificationService {
  private readonly logger = new Logger(ClassificationService.name);
  private readonly confidenceThreshold: number;
  private readonly keywordTranslationDictionary: Record<string, string> = {
    // Amharic keywords and common romanized forms
    'ድብደባ': 'beating',
    'ጥቃት': 'assault',
    'ሃይል': 'violence',
    'ግድያ': 'killing',
    'ወሲብ': 'sexual',
    'አስገድዶ': 'forced',
    'ትንኮሳ': 'harassment',
    'ማስፈራራት': 'threat',
    'ልጅ': 'child',
    'ሽማግሌ': 'elder',
    'ገበሬ': 'worker',
    'tiru aydelem': 'abuse',
    'medeb': 'violence',
    // Oromo/Tigrinya common terms seen in user reports
    'miidhaa': 'abuse',
    'saalaa': 'sexual',
    'rukutame': 'beaten',
    'miidhame': 'injured',
    'seeraa': 'legal',
    'hammeenyaa': 'violence',
    'ዓመጽ': 'violence',
    'ምድብዳብ': 'beating',
    'ግፍዒ': 'abuse',
  };

  // Multi-language knowledge base for classification
  private readonly categoryKeywords: Record<IncidentCategory, Record<string, LanguageVariant>> = {
    [IncidentCategory.PHYSICAL_VIOLENCE]: {
      en: {
        keywords: [
          'hit',
          'beat',
          'punch',
          'kick',
          'slap',
          'strike',
          'violence',
          'injury',
          'hurt',
          'assault',
          'attack',
          'wound',
          'bruise',
          'fracture',
          'bleed',
          'bleeding',
          'throw',
          'throws',
          'throwing',
          'threw',
          'objects',
          'thrown',
          'choked',
          'strangled',
          'grabbed',
          'grabbing',
          'restrained',
          'restraining',
          'pushed',
          'pushing',
          'shoved',
          'dragging',
          'dragged',
        ],
        severity: SeverityLevel.HIGH,
      },
      am: {
        keywords: [
          'ምግት',
          'መውጣት',
          'መምታት',
          'ግድያ',
          'ጉዳት',
          'ስቃይ',
          'ሙስሙስ',
          'ደም',
          'ስንጣ',
        ],
        severity: SeverityLevel.HIGH,
      },
    },
    [IncidentCategory.SEXUAL_ASSAULT]: {
      en: {
        keywords: [
          'rape',
          'sexual assault',
          'molestation',
          'groping',
          'unwanted touch',
          'coercion',
          'forced sex',
          'non-consensual',
          'sexual violence',
          'sexual abuse',
          'inappropriate touching',
          'sexual harassment',
        ],
        severity: SeverityLevel.CRITICAL,
      },
      am: {
        keywords: [
          'የወሲብ ጥቅስ',
          'የወሲብ ግጭት',
          'ህገ-ወጥ ግብረ-ስጋ',
          'ስጋ',
          'ያልተስማማ ግብረ-ስጋ',
        ],
        severity: SeverityLevel.CRITICAL,
      },
    },
    [IncidentCategory.EMOTIONAL_ABUSE]: {
      en: {
        keywords: [
          'humiliation',
          'shame',
          'degradation',
          'insults',
          'emotional abuse',
          'psychological abuse',
          'belittle',
          'control',
          'manipulation',
          'criticism',
          'disrespect',
          'put down',
          'verbally',
          'verbal',
          'verbal abuse',
          'yelling',
          'screaming',
          'shouting',
          'name calling',
          'mocking',
          'teasing',
          'berating',
        ],
        severity: SeverityLevel.MEDIUM,
      },
      am: {
        keywords: [
          'ገምጣ',
          'ስሕተት',
          'ግልበጣ',
          'ማሳደድ',
          'መስዋዕት',
          'ስነ-ምግባር',
        ],
        severity: SeverityLevel.MEDIUM,
      },
    },
    [IncidentCategory.PSYCHOLOGICAL_ABUSE]: {
      en: {
        keywords: [
          'trauma',
          'intimidation',
          'threats',
          'fear',
          'mental abuse',
          'mind games',
          'gaslighting',
          'isolation',
          'psychological manipulation',
          'emotional torture',
        ],
        severity: SeverityLevel.HIGH,
      },
      am: {
        keywords: [
          'ስርወ-ሕሊና',
          'ፍራ',
          'ማስፈራራት',
          'ማጣልበጥ',
          'አወቃቀር ማርማት',
        ],
        severity: SeverityLevel.HIGH,
      },
    },
    [IncidentCategory.NEGLECT]: {
      en: {
        keywords: [
          'abandoned',
          'ignored',
          'neglect',
          'uncared',
          'denial',
          'deprivation',
          'withhold',
          'neglectful',
          'lack of care',
          'abandonment',
        ],
        severity: SeverityLevel.MEDIUM,
      },
      am: {
        keywords: [
          'ተተወ',
          'አደር',
          'ተላለየ',
          'ቢ',
          'ግድየለሸ',
          'ተደበቀ',
        ],
        severity: SeverityLevel.MEDIUM,
      },
    },
    [IncidentCategory.CYBERBULLYING]: {
      en: {
        keywords: [
          'online',
          'cyberbully',
          'social media',
          'harassment online',
          'hate comments',
          'doxxing',
          'revenge porn',
          'blackmail',
          'trolling',
          'online abuse',
          'digital harassment',
        ],
        severity: SeverityLevel.MEDIUM,
      },
      am: {
        keywords: [
          'ቢ',
          'ወደ ሙያ',
          'ተሳሪ',
          'ተወካይ',
        ],
        severity: SeverityLevel.MEDIUM,
      },
    },
    [IncidentCategory.HARASSMENT]: {
      en: {
        keywords: [
          'harass',
          'stalk',
          'unwanted contact',
          'threatening',
          'persistent',
          'intimidate',
          'harassment',
          'stalking',
          'repeated contact',
          'threatening behavior',
        ],
        severity: SeverityLevel.MEDIUM,
      },
      am: {
        keywords: [
          'ስሩአት',
          'ሕገወጥ ምርመራ',
          'ተደጋጋሚ ቅርበት',
        ],
        severity: SeverityLevel.MEDIUM,
      },
    },
    [IncidentCategory.DISCRIMINATION]: {
      en: {
        keywords: [
          'discrimination',
          'racist',
          'sexist',
          'homophobic',
          'prejudice',
          'bias',
          'hate',
          'stereotype',
          'discriminatory',
          'racial abuse',
          'ethnic abuse',
        ],
        severity: SeverityLevel.MEDIUM,
      },
      am: {
        keywords: [
          'ልዩነት',
          'ማዝ',
          'ጠዋት',
          'ደዛፍ',
        ],
        severity: SeverityLevel.MEDIUM,
      },
    },
    [IncidentCategory.WORKPLACE_ABUSE]: {
      en: {
        keywords: [
          'work',
          'job',
          'boss',
          'supervisor',
          'colleague',
          'workplace',
          'office',
          'unfair treatment',
          'workplace harassment',
          'occupational abuse',
          'manager',
          'employer',
          'employee',
          'coworker',
          'toxic work',
          'bullying at work',
          'workplace bullying',
          'hostile work',
          'abusive boss',
          'threatened at work',
          'unsafe work',
        ],
        severity: SeverityLevel.MEDIUM,
      },
      am: {
        keywords: [
          'ስራ',
          'ሥራ ቤት',
          'መስሪያ',
          'ሬሳ',
          'ስራ አመራር',
        ],
        severity: SeverityLevel.MEDIUM,
      },
    },
    [IncidentCategory.DOMESTIC_VIOLENCE]: {
      en: {
        keywords: [
          'partner',
          'spouse',
          'husband',
          'wife',
          'domestic',
          'home',
          'family',
          'household',
          'intimate partner',
          'domestic abuse',
          'family violence',
        ],
        severity: SeverityLevel.HIGH,
      },
      am: {
        keywords: [
          'ወገን',
          'ሚስት',
          'ባል',
          'ቤት',
          'ቤተሰብ',
          'ሣፋሪ',
          'የቤት ሕይወት ግጭት',
        ],
        severity: SeverityLevel.HIGH,
      },
    },
    [IncidentCategory.CHILD_ABUSE]: {
      en: {
        keywords: [
          'child',
          'kid',
          'minor',
          'baby',
          'infant',
          'juvenile',
          'children',
          'toddler',
          'young',
          'underage',
          'child abuse',
          'child exploitation',
        ],
        severity: SeverityLevel.CRITICAL,
      },
      am: {
        keywords: [
          'ልጅ',
          'ሕፃናት',
          'አነስተኛ',
          'ወጣት',
          'ዘረጋ',
        ],
        severity: SeverityLevel.CRITICAL,
      },
    },
    [IncidentCategory.ELDER_ABUSE]: {
      en: {
        keywords: [
          'elderly',
          'elder',
          'senior',
          'old',
          'aged',
          'grandparent',
          'retired',
          'pensioner',
          'senior abuse',
          'elder neglect',
        ],
        severity: SeverityLevel.HIGH,
      },
      am: {
        keywords: [
          'ሽማግሌ',
          'ጋር',
          'ወቅታዊ',
          'አዛማ',
          'አስፈሪ',
        ],
        severity: SeverityLevel.HIGH,
      },
    },
    [IncidentCategory.OTHER]: {
      en: {
        keywords: [],
        severity: SeverityLevel.MEDIUM,
      },
      am: {
        keywords: [],
        severity: SeverityLevel.MEDIUM,
      },
    },
  };

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.confidenceThreshold =
      parseFloat(
        this.configService.get<string>(
          'CLASSIFICATION_CONFIDENCE_THRESHOLD',
        ) ?? '0.7',
      ) || 0.7;
  }

  /**
   * Detect language with lightweight NLP heuristics.
   */
  private detectLanguage(text: string): string {
    if (!text) return 'en';

    const normalized = text.toLowerCase();
    const geezRegex = /[\u1200-\u137F]/g;
    const geezMatches = text.match(geezRegex);
    if (geezMatches && geezMatches.length > Math.max(3, text.length * 0.05)) {
      return 'am';
    }

    // Basic Oromo signal words (Latin script)
    if (/\b(na|irratti|miidhaa|saalaa|rukut|seeraa|hammeenyaa)\b/i.test(normalized)) {
      return 'om';
    }

    return 'en';
  }

  /**
   * Translate key non-English words to English for consistent matching.
   * This keeps processing local and deterministic without external APIs.
   */
  private translateKeywordsToEnglish(text: string): string {
    if (!text) return text;

    let translated = text;
    for (const [source, target] of Object.entries(this.keywordTranslationDictionary)) {
      const escapedSource = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      translated = translated.replace(new RegExp(escapedSource, 'gi'), target);
    }
    return translated;
  }
  /**
   * Classify incident report text into category and severity with multi-language support
   */
  async classifyReport(
    text: string,
    language?: string,
  ): Promise<ClassificationResult> {
    const detectedLanguage = language || this.detectLanguage(text);
    const translatedText = this.translateKeywordsToEnglish(text);
    const searchableTexts = [text.toLowerCase(), translatedText.toLowerCase()];

    // Calculate keyword matches for each category
    const categoryScores: Record<string, number> = {};
    const matchedKeywords: Record<string, string[]> = {};
    const riskIndicators: string[] = [];

    for (const [category, langVariants] of Object.entries(
      this.categoryKeywords,
    )) {
      const variant =
        langVariants[detectedLanguage] || langVariants['en'];
      let matches = 0;
      const foundKeywords: string[] = [];

      for (const keyword of variant.keywords) {
        const keywordLower = keyword.toLowerCase();
        const hasMatch = searchableTexts.some((candidate) =>
          candidate.includes(keywordLower),
        );
        if (hasMatch) {
          matches += 1;
          foundKeywords.push(keyword);
        }
      }

      if (matches > 0) {
        const maxPossible = Math.max(1, variant.keywords.length);
        categoryScores[category] = matches / maxPossible;
        matchedKeywords[category] = foundKeywords;
      }
    }

    // Find best matching category
    const sortedCategories = Object.entries(categoryScores).sort(
      ([, a], [, b]) => b - a,
    );
    const [bestCategory, score] =
      sortedCategories[0] || [IncidentCategory.OTHER, 0];

    const confidence = Math.min(score, 1.0);
    const category = bestCategory as IncidentCategory;
    const severity =
      this.categoryKeywords[category]?.[detectedLanguage]?.severity ||
      SeverityLevel.MEDIUM;

    // Detect risk indicators
    this.detectRiskIndicators(searchableTexts.join(' '), riskIndicators);

    // Determine suggested case type based on category
    const suggestedCaseType = this.determineCaseType(category, riskIndicators);
    const supportTrack = this.mapCaseTypeToSupportTrack(suggestedCaseType);

    this.logger.log(
      `Classification: ${category} (confidence: ${confidence.toFixed(2)}, language: ${detectedLanguage})`,
    );

    return {
      category,
      severity,
      suggestedCaseType,
      confidence,
      keywordMatches: matchedKeywords[category] || [],
      riskIndicators,
      detectedLanguage,
      translatedText: detectedLanguage === 'en' ? undefined : translatedText,
      supportTrack,
    };
  }

  /**
   * Detect risk indicators in text
   */
  private detectRiskIndicators(
    text: string,
    indicators: string[],
  ): void {
    const riskPatterns = {
      'immediate_harm': /\b(now|immediately|urgent|emergency|right now|asap)\b/i,
      'weapons': /\b(gun|knife|weapon|bomb|explosive|poison|drug)\b/i,
      'suicidal': /\b(suicide|kill myself|end my life|want to die|no point)\b/i,
      'trafficking': /\b(trafficking|exploitation|forced labor|sold|trafficking network)\b/i,
      'organized_crime': /\b(gang|cartel|mafia|organized|criminal network)\b/i,
    };

    for (const [indicator, pattern] of Object.entries(riskPatterns)) {
      if (pattern.test(text)) {
        indicators.push(indicator);
      }
    }
  }

  /**
   * Calculate risk score for duplicate/falsified reports
   */
  async calculateRiskScore(
    text: string,
    ipAddress: string | null,
    deviceFingerprint: string | null,
    behavioralData?: {
      sessionDuration?: number;
      stepDurations?: Record<string, number>;
      avgKeystrokeInterval?: number;
      mouseMovementCount?: number;
      copyPasteCount?: number;
      behavioralRiskScore?: number;
    },
  ): Promise<RiskScoreResult> {
    let riskScore = 0;
    const reasons: string[] = [];

    // 1. Check for similar reports from same IP
    if (ipAddress) {
      const recentReportsCount = await this.prisma.report.count({
        where: {
          ipHash: this.hashIP(ipAddress),
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      if (recentReportsCount > 3) {
        riskScore += 30;
        reasons.push('Multiple reports from same IP in 24h');
      }
    }

    // 2. Check for text similarity with recent reports
    const similarReports = await this.findSimilarReports(text);
    if (similarReports.length > 0) {
      riskScore += 40;
      reasons.push('Similar report text found recently');
    }

    // 3. Check device fingerprint for repetitive patterns
    if (deviceFingerprint) {
      const deviceReportsCount = await this.prisma.report.count({
        where: {
          deviceFingerprint,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      });

      if (deviceReportsCount > 5) {
        riskScore += 25;
        reasons.push('Device used for multiple reports');
      }
    }

    // 4. Check text characteristics (extremely short or generic)
    if (text.length < 20) {
      riskScore += 10;
      reasons.push('Report text too short');
    }

    // 5. Check for spam patterns
    const spamPatterns = /(test|spam|fake|joke|prank|lol)/gi;
    if (spamPatterns.test(text)) {
      riskScore += 20;
      reasons.push('Potential spam indicators detected');
    }

    // 6. Behavioral pattern analysis
    if (behavioralData) {
      const behavioralRiskScore = Number(behavioralData.behavioralRiskScore ?? 0);
      const sessionDuration = Number(behavioralData.sessionDuration ?? 0);
      const mouseMovementCount = Number(behavioralData.mouseMovementCount ?? 0);
      const copyPasteCount = Number(behavioralData.copyPasteCount ?? 0);

      // Add the behavioral risk score directly
      if (Number.isFinite(behavioralRiskScore) && behavioralRiskScore > 0) {
        riskScore += behavioralRiskScore;
        reasons.push(`Behavioral risk score: ${behavioralRiskScore}`);
      }

      // Additional behavioral checks
      if (Number.isFinite(sessionDuration) && sessionDuration > 0 && sessionDuration < 10000) {
        riskScore += 10;
        reasons.push('Form completed suspiciously fast');
      }

      if (Number.isFinite(mouseMovementCount) && mouseMovementCount === 0) {
        riskScore += 15;
        reasons.push('No mouse movement detected');
      }

      if (Number.isFinite(copyPasteCount) && copyPasteCount > 3) {
        riskScore += 10;
        reasons.push('Excessive copy-paste activity');
      }

      // Check for unrealistic step completion times
      const fastSteps = behavioralData.stepDurations 
        ? Object.values(behavioralData.stepDurations).filter(duration => duration < 2000)
        : [];
      if (fastSteps.length > 2) {
        riskScore += 15;
        reasons.push('Multiple steps completed too quickly');
      }
    }

    const isRepetitive = riskScore >= 50;
    const isDuplicate = similarReports.length > 0 && riskScore >= 70;

    return {
      riskScore: Math.min(riskScore, 100),
      isRepetitive,
      isDuplicate,
      flagged: riskScore >= 50,
      reasons,
    };
  }

  /**
   * Find semantically similar reports using simple text similarity
   */
  private async findSimilarReports(
    text: string,
    limit: number = 5,
  ): Promise<any[]> {
    // Get recent reports
    const recentReports = await this.prisma.report.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      select: {
        id: true,
        description: true,
      },
      take: 50,
    });

    // Calculate similarity using simple word overlap
    const textWords = new Set(
      text.toLowerCase().split(/\s+/).filter((w) => w.length > 3),
    );

    const similar = recentReports
      .map((report) => {
        const reportWords = new Set(
          report.description.toLowerCase().split(/\s+/).filter((w) => w.length > 3),
        );
        const intersection = Array.from(textWords).filter((w) =>
          reportWords.has(w),
        );
        const similarity =
          intersection.length /
          Math.max(textWords.size, reportWords.size);
        return { ...report, similarity };
      })
      .filter((r) => r.similarity > 0.6)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return similar;
  }

  /**
   * Determine appropriate case type based on incident category
   */
  private determineCaseType(
    category: IncidentCategory,
    riskIndicators: string[] = [],
  ): CaseType {
    const highUrgencyIndicators = new Set(['weapons', 'trafficking', 'organized_crime']);
    const needsCombinedByRisk = riskIndicators.some((indicator) =>
      highUrgencyIndicators.has(indicator),
    );

    if (needsCombinedByRisk) {
      return CaseType.COMBINED_SUPPORT;
    }

    const categoryToCaseType: Record<IncidentCategory, CaseType> = {
      [IncidentCategory.PHYSICAL_VIOLENCE]: CaseType.MEDICAL_SUPPORT,
      [IncidentCategory.SEXUAL_ASSAULT]: CaseType.LEGAL_ASSISTANCE,
      [IncidentCategory.EMOTIONAL_ABUSE]: CaseType.MEDICAL_SUPPORT,
      [IncidentCategory.PSYCHOLOGICAL_ABUSE]: CaseType.MEDICAL_SUPPORT,
      [IncidentCategory.NEGLECT]: CaseType.MEDICAL_SUPPORT,
      [IncidentCategory.CYBERBULLYING]: CaseType.LEGAL_ASSISTANCE,
      [IncidentCategory.HARASSMENT]: CaseType.LEGAL_ASSISTANCE,
      [IncidentCategory.DISCRIMINATION]: CaseType.LEGAL_ASSISTANCE,
      [IncidentCategory.WORKPLACE_ABUSE]: CaseType.LEGAL_ASSISTANCE,
      [IncidentCategory.DOMESTIC_VIOLENCE]: CaseType.COMBINED_SUPPORT,
      [IncidentCategory.CHILD_ABUSE]: CaseType.COMBINED_SUPPORT,
      [IncidentCategory.ELDER_ABUSE]: CaseType.COMBINED_SUPPORT,
      [IncidentCategory.OTHER]: CaseType.LEGAL_ASSISTANCE,
    };

    return categoryToCaseType[category] || CaseType.LEGAL_ASSISTANCE;
  }

  private mapCaseTypeToSupportTrack(caseType: CaseType): 'MEDICAL' | 'LEGAL' | 'BOTH' {
    if (caseType === CaseType.MEDICAL_SUPPORT) return 'MEDICAL';
    if (caseType === CaseType.COMBINED_SUPPORT) return 'BOTH';
    return 'LEGAL';
  }

  /**
   * Hash IP address for privacy using SHA-256
   */
  private hashIP(ipAddress: string): string {
    return crypto
      .createHash('sha256')
      .update(ipAddress)
      .digest('hex')
      .substring(0, 32);
  }

  /**
   * Get classification statistics
   */
  async getClassificationStats() {
    const stats = await this.prisma.report.groupBy({
      by: ['category', 'severity'],
      _count: true,
    });

    return stats;
  }
}
