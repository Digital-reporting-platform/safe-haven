import { UserRole } from '@prisma/client';

export class MessageResponseDto {
  id!: string;
  reportId!: string;
  content!: string;
  senderRole!: UserRole;
  isSystemMessage!: boolean;
  isPublic!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  author?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    role: UserRole;
  } | null;
}
