-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_debts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" DATETIME,
    "categoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "debts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "debts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_debts" ("amountCents", "createdAt", "description", "dueDate", "id", "isPaid", "personName", "type", "updatedAt", "userId") SELECT "amountCents", "createdAt", "description", "dueDate", "id", "isPaid", "personName", "type", "updatedAt", "userId" FROM "debts";
DROP TABLE "debts";
ALTER TABLE "new_debts" RENAME TO "debts";
CREATE INDEX "debts_userId_idx" ON "debts"("userId");
CREATE INDEX "debts_isPaid_idx" ON "debts"("isPaid");
CREATE INDEX "debts_categoryId_idx" ON "debts"("categoryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
