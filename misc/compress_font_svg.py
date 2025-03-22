from argparse import ArgumentParser
import io
import base64

import fontTools
import fontTools.subset
import fontTools.ttLib
import fontTools.otlLib

parser = ArgumentParser()
parser.add_argument("svg")
parser.add_argument("text")

args = parser.parse_args()

old = f"../logoscopy/{args.svg}"
new = f"../logos/{args.svg}"


with open(old) as f:
    svg = f.read()

lines: list[str] = list(svg.splitlines())

output = []

for line in lines:
    if not line.strip().startswith("src: url"):
        output.append(line)
        continue

    origin = line

    start = line.find(",") + 1
    fontdata = line[start:]

    end = fontdata.find("'")
    ending = fontdata[end:]
    fontdata = fontdata[:end]

    print(f"found: size: {len(fontdata) / 1024}KB")

    entirefile = base64.decodebytes(fontdata.encode())
    font = fontTools.ttLib.TTFont(io.BytesIO(entirefile))

    subsetter = fontTools.subset.Subsetter(fontTools.subset.Options())
    subsetter.populate(text=args.text)
    subsetter.subset(font)

    b = io.BytesIO(bytes())
    font.save(b)
    result = base64.b64encode(b.getvalue()).decode()

    print(f"after: {len(result) / 1024}KB")

    output.append(f"{origin[:start]}{result}{ending}")

with open(new, "w") as f:
    f.write("\n".join(output))
