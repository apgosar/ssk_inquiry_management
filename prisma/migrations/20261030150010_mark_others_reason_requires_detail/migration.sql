-- The "Others" reason asks the coordinator to type the actual reason.
UPDATE "ReasonNotJoining" SET "requiresDetail" = true WHERE "label" = 'Others - unspecified reason';
