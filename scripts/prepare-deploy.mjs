import { spawnSync } from "node:child_process";

if(!process.env.DATABASE_MIGRATION_URL&&!process.env.DATABASE_URL){
  process.stdout.write("No database URL is configured; skipping database release. Bundled fallback content remains available.\n");
  process.exit(0);
}
for(const script of ["scripts/migrate-postgres.mjs","scripts/seed-birthday-growth-release.mjs","scripts/seed-vertical-content.mjs","scripts/seed-vertical-seo.mjs"]){
  const result=spawnSync(process.execPath,[script],{stdio:"inherit",env:process.env});
  if(result.status!==0) process.exit(result.status??1);
}
