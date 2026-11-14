-- Country code for each contact number (existing numbers are Indian).
ALTER TABLE "Lead" ADD COLUMN "countryCode" TEXT NOT NULL DEFAULT '+91';

-- A lead can now have several reasons for not joining.
CREATE TABLE "_LeadToReasonNotJoining" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_LeadToReasonNotJoining_AB_pkey" PRIMARY KEY ("A","B")
);

CREATE INDEX "_LeadToReasonNotJoining_B_index" ON "_LeadToReasonNotJoining"("B");

ALTER TABLE "_LeadToReasonNotJoining" ADD CONSTRAINT "_LeadToReasonNotJoining_A_fkey" FOREIGN KEY ("A") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_LeadToReasonNotJoining" ADD CONSTRAINT "_LeadToReasonNotJoining_B_fkey" FOREIGN KEY ("B") REFERENCES "ReasonNotJoining"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Carry every existing single reason over before the old column is dropped.
INSERT INTO "_LeadToReasonNotJoining" ("A", "B")
SELECT "id", "reasonNotJoiningId" FROM "Lead" WHERE "reasonNotJoiningId" IS NOT NULL;

ALTER TABLE "Lead" DROP CONSTRAINT "Lead_reasonNotJoiningId_fkey";
ALTER TABLE "Lead" DROP COLUMN "reasonNotJoiningId";

-- Speeds up the "does this mobile number already exist?" check.
CREATE INDEX "Lead_contactNumber_idx" ON "Lead"("contactNumber");
