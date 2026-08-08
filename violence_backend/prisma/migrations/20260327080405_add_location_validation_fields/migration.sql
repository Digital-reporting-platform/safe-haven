-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "detectedCity" TEXT,
ADD COLUMN     "detectedCountry" TEXT,
ADD COLUMN     "detectedRegion" TEXT,
ADD COLUMN     "locationMismatchConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "locationMismatchWarning" BOOLEAN NOT NULL DEFAULT false;
