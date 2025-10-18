"""
Generate per-friend QR codes pointing to card.html?name=friendKey
Usage:
  pip install qrcode[pil]
  python qr_gen.py --base https://yourname.github.io/graduation_card/card.html
"""
import json, argparse, qrcode, os

p = argparse.ArgumentParser()
p.add_argument("--base", required=True, help="Base URL to card.html (without ?name=)")
p.add_argument("--out", default="qrcodes", help="Output folder for PNGs")
p.add_argument("--friends", default="friends.json")
args = p.parse_args()

os.makedirs(args.out, exist_ok=True)

friends = json.load(open(args.friends, encoding="utf-8"))
for f in friends:
    key = f["name"]
    url = f"{args.base}?name={key}"
    img = qrcode.make(url)
    fp = os.path.join(args.out, f"{key}.png")
    img.save(fp)
    print("Saved", fp, "->", url)

print("Done.")
