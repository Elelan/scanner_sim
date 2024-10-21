-- CreateTable
CREATE TABLE "Barcodes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "Barcodes_data_key" ON "Barcodes"("data");
