-- CreateTable
CREATE TABLE "GroupEndorsement" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupEndorsement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupEndorsement_questionId_groupId_key" ON "GroupEndorsement"("questionId", "groupId");

-- AddForeignKey
ALTER TABLE "GroupEndorsement" ADD CONSTRAINT "GroupEndorsement_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupEndorsement" ADD CONSTRAINT "GroupEndorsement_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
