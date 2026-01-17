/*
  Warnings:

  - You are about to drop the `two_factor_codes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `twoFactorEmail` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorEnabled` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "two_factor_codes_userId_expiresAt_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "two_factor_codes";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "email", "id", "passwordHash", "updatedAt") SELECT "createdAt", "email", "id", "passwordHash", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
