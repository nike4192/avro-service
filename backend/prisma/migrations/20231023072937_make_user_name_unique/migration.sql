/*
  Warnings:

  - A unique constraint covering the columns `[createdById,baseId,version]` on the table `AvroSchemaVersion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AvroSchemaVersion_createdById_baseId_version_key" ON "AvroSchemaVersion"("createdById", "baseId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
