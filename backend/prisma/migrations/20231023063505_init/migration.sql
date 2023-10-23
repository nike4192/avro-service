-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvroSchema" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "AvroSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvroSchemaVersion" (
    "id" TEXT NOT NULL,
    "schema" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "baseId" TEXT NOT NULL,

    CONSTRAINT "AvroSchemaVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AvroSchema_createdById_name_key" ON "AvroSchema"("createdById", "name");

-- AddForeignKey
ALTER TABLE "AvroSchema" ADD CONSTRAINT "AvroSchema_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvroSchemaVersion" ADD CONSTRAINT "AvroSchemaVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvroSchemaVersion" ADD CONSTRAINT "AvroSchemaVersion_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "AvroSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
