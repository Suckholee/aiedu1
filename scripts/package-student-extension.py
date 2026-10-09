from pathlib import Path
import zipfile
root = Path(__file__).resolve().parent.parent
source = root / "scripts/student-extension"
with zipfile.ZipFile(root / "public/install/neonpeter-blog-student-v2.7.1.zip", "w", zipfile.ZIP_DEFLATED) as archive:
    for file in sorted(source.rglob("*")):
        if file.is_file():
            archive.write(file, "neonpeter-blog-student/" + str(file.relative_to(source)))
