
from pathlib import Path
from PIL import Image, ImageDraw
import math

image_dir = Path("public/images/products")
output_path = Path("scripts/product-contact-sheet.jpg")

files = sorted(
    p for p in image_dir.iterdir()
    if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
)

if not files:
    raise SystemExit("No product images found.")

thumb_w, thumb_h = 150, 150
label_h = 38
columns = 5
rows = math.ceil(len(files) / columns)

sheet = Image.new(
    "RGB",
    (columns * thumb_w, rows * (thumb_h + label_h)),
    "white",
)
draw = ImageDraw.Draw(sheet)

for index, path in enumerate(files):
    try:
        image = Image.open(path).convert("RGB")
        image.thumbnail((thumb_w - 12, thumb_h - 12))

        x = (index % columns) * thumb_w
        y = (index // columns) * (thumb_h + label_h)

        image_x = x + (thumb_w - image.width) // 2
        image_y = y + (thumb_h - image.height) // 2

        sheet.paste(image, (image_x, image_y))
        draw.text(
            (x + 5, y + thumb_h + 2),
            path.name[:23],
            fill="black",
        )
    except Exception as exc:
        print(f"Could not process {path.name}: {exc}")

output_path.parent.mkdir(parents=True, exist_ok=True)
sheet.save(output_path, quality=90)

print(f"Images included: {len(files)}")
print(f"Saved to: {output_path}")
