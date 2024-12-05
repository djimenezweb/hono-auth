-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "sessionId" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "valid" BOOLEAN NOT NULL DEFAULT true,
    "userAgent" TEXT NOT NULL,
    "userAgentName" TEXT NOT NULL,
    "userAgentOS" TEXT NOT NULL,
    "userAgentDevice" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "expires" BIGINT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("createdAt", "expires", "ip", "sessionId", "updatedAt", "userAgent", "userAgentDevice", "userAgentName", "userAgentOS", "userId", "valid") SELECT "createdAt", "expires", "ip", "sessionId", "updatedAt", "userAgent", "userAgentDevice", "userAgentName", "userAgentOS", "userId", "valid" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
