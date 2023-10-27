/*
  Warnings:

  - You are about to drop the column `version` on the `AvroSchemaVersion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[createdById,baseId,number]` on the table `AvroSchemaVersion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `number` to the `AvroSchemaVersion` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AvroSchemaVersion_createdById_baseId_version_key";

-- AlterTable
ALTER TABLE "AvroSchemaVersion" DROP COLUMN "version",
ADD COLUMN     "number" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AvroSchemaVersion_createdById_baseId_number_key" ON "AvroSchemaVersion"("createdById", "baseId", "number");
