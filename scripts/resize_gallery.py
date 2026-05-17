"""Resize gallery JPEGs into assets/web/ at <=1600px wide, quality 85."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets"
DST = ROOT / "assets" / "web"
DST.mkdir(exist_ok=True)

MAX_WIDTH = 1600
QUALITY = 85
EXTS = {".jpg", ".jpeg"}

total_in = 0
total_out = 0
for path in sorted(SRC.iterdir()):
    if path.is_dir():
        continue
    if path.suffix.lower() not in EXTS:
        continue
    out = DST / path.name
    with Image.open(path) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode != "RGB":
            im = im.convert("RGB")
        if im.width > MAX_WIDTH:
            new_h = round(im.height * MAX_WIDTH / im.width)
            im = im.resize((MAX_WIDTH, new_h), Image.LANCZOS)
        im.save(out, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    in_size = path.stat().st_size
    out_size = out.stat().st_size
    total_in += in_size
    total_out += out_size
    print(f"{path.name}: {in_size/1024:.0f} KB -> {out_size/1024:.0f} KB")

print(f"\nTotal: {total_in/1024/1024:.1f} MB -> {total_out/1024/1024:.1f} MB")
