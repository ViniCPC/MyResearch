-- AlterTable
ALTER TABLE "Milestone"
ADD COLUMN "onChainIndex" INTEGER,
ADD COLUMN "releaseTxHash" TEXT,
ADD COLUMN "releasedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Milestone_releaseTxHash_key" ON "Milestone"("releaseTxHash");
