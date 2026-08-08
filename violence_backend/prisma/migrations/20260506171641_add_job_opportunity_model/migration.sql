/*
  Warnings:

  - You are about to drop the `JobApplication` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JobPosting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrainingProgram` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `JobOpportunity` table without a default value. This is not possible if the table is not empty.
  - Made the column `externalId` on table `JobOpportunity` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "JobApplication" DROP CONSTRAINT "JobApplication_jobPostingId_fkey";

-- DropForeignKey
ALTER TABLE "JobApplication" DROP CONSTRAINT "JobApplication_trainingProgramId_fkey";

-- DropForeignKey
ALTER TABLE "JobApplication" DROP CONSTRAINT "JobApplication_userId_fkey";

-- DropIndex
DROP INDEX "JobOpportunity_category_idx";

-- AlterTable
ALTER TABLE "JobOpportunity" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "externalId" SET NOT NULL,
ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "isVerified" SET DEFAULT true;

-- DropTable
DROP TABLE "JobApplication";

-- DropTable
DROP TABLE "JobPosting";

-- DropTable
DROP TABLE "TrainingProgram";

-- DropEnum
DROP TYPE "ApplicationStatus";

-- DropEnum
DROP TYPE "ApplicationType";

-- DropEnum
DROP TYPE "JobType";

-- DropEnum
DROP TYPE "TrainingLevel";

-- DropEnum
DROP TYPE "TrainingModality";
