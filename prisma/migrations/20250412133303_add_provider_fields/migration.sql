-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "providerData" JSONB,
ADD COLUMN     "providerOrderId" TEXT,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "providerTraceId" TEXT,
ADD COLUMN     "retryData" JSONB;
