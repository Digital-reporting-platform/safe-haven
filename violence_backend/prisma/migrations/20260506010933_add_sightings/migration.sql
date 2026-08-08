-- CreateTable
CREATE TABLE "Sighting" (
    "id" TEXT NOT NULL,
    "missingPersonId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "sightingDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sighting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sighting_missingPersonId_idx" ON "Sighting"("missingPersonId");

-- CreateIndex
CREATE INDEX "Sighting_sightingDate_idx" ON "Sighting"("sightingDate");

-- CreateIndex
CREATE INDEX "Sighting_isVerified_idx" ON "Sighting"("isVerified");

-- AddForeignKey
ALTER TABLE "Sighting" ADD CONSTRAINT "Sighting_missingPersonId_fkey" FOREIGN KEY ("missingPersonId") REFERENCES "MissingPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
