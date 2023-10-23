-- DropForeignKey
ALTER TABLE "AvroSchemaVersion" DROP CONSTRAINT "AvroSchemaVersion_baseId_fkey";

-- AddForeignKey
ALTER TABLE "AvroSchemaVersion" ADD CONSTRAINT "AvroSchemaVersion_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "AvroSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;
