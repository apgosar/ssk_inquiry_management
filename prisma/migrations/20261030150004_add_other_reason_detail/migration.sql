-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "otherReason" TEXT;

-- AlterTable
ALTER TABLE "ReasonNotJoining" ADD COLUMN     "requiresDetail" BOOLEAN NOT NULL DEFAULT false;
