from pathlib import Path
import os

current_directory = Path(".")

files = [f for f in current_directory.iterdir() if f.is_file()]

for f in files:
    if not str(f).endswith(".jpeg"):
        continue

    os.system(
        f"ffmpeg -y -hide_banner -i {f} -vf 'scale=1280:-1' -c:v libwebp {f.stem}.webp"
    )
