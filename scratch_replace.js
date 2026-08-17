const fs = require("fs");
const path = require("path");

const files = [
  "components/molecules/MissedRamadanFastGoalSelection.tsx",
  "components/molecules/MondayThursdayFastGoalSelection.tsx",
  "components/molecules/ProphetDawoodFastGoalSelection.tsx",
  "components/molecules/WhiteDaysFastGoalSelection.tsx",
  "components/molecules/QuranTimeSelection.tsx"
];

for (const relPath of files) {
  const absolutePath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(absolutePath)) {
    console.log("Missing:", absolutePath);
    continue;
  }
  
  let content = fs.readFileSync(absolutePath, "utf-8");

  if (!content.includes("openOnMount")) {
    content = content.replace(/isSaving = false,/, "isSaving = false,\n  openOnMount = false,");
    content = content.replace(/isSaving\?: boolean;/g, "isSaving?: boolean;\n  openOnMount?: boolean;");
    content = content.replace(/const \[isOpen, setIsOpen\] = useState\(false\);/, "const [isOpen, setIsOpen] = useState(openOnMount);");
    
    fs.writeFileSync(absolutePath, content, "utf-8");
    console.log("Updated", relPath);
  } else {
    console.log("Already updated", relPath);
  }
}
