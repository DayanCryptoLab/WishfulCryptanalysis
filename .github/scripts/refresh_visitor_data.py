import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen


REPORT_URL = "https://s05.flagcounter.com/gmap/wgFU/"
MAX_REPORT_BYTES = 1_000_000
MARKER_BLOCK = re.compile(r"\bvar\s+flagicon\s*=\s*L\.icon\(")
MAP_MARKER = re.compile(r"\bL\.marker\(")
COUNTRY_CODE = re.compile(r"\biconUrl:\s*'https://cdn\.boardhost\.com/flags/([a-z]{2})\.png'")
VISITOR_COUNT = re.compile(r"<br>Visitors:\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)\s*</font>")


def fetch_report():
    request = Request(REPORT_URL, headers={"User-Agent": "WishfulCryptanalysis visitor statistics"})
    with urlopen(request, timeout=20) as response:
        if response.geturl() != REPORT_URL or response.headers.get_content_type() != "text/html":
            raise ValueError("Flag Counter returned an unexpected report response")
        report = response.read(MAX_REPORT_BYTES + 1)

    if len(report) > MAX_REPORT_BYTES:
        raise ValueError("Flag Counter report exceeded the expected size")
    return report.decode("utf-8", errors="replace")


def parse_report(report):
    blocks = MARKER_BLOCK.split(report)[1:]
    if not blocks or not report.rstrip().endswith("</html>"):
        raise ValueError("Flag Counter returned an empty or incomplete map report")
    if len(MAP_MARKER.findall(report)) != len(blocks):
        raise ValueError("Flag Counter map marker format changed")

    countries = {}
    for block in blocks:
        codes = COUNTRY_CODE.findall(block)
        counts = VISITOR_COUNT.findall(block)
        if len(codes) != 1 or len(counts) != 1 or len(MAP_MARKER.findall(block)) != 1:
            raise ValueError("Flag Counter map contains a malformed country marker")

        code = codes[0].upper()
        visitors = int(counts[0].replace(",", ""))
        if not 0 < visitors < 2**53:
            raise ValueError(f"Flag Counter returned an invalid visitor count for {code}")
        if code in countries and countries[code] != visitors:
            raise ValueError(f"Flag Counter returned conflicting visitor counts for {code}")
        countries[code] = visitors

    return countries


def main():
    parser = argparse.ArgumentParser(description="Refresh the site's Flag Counter country totals")
    parser.add_argument("output", type=Path, help="Path for the new JSON snapshot, if changed")
    parser.add_argument("--previous", type=Path, help="Path to the last successful JSON snapshot")
    args = parser.parse_args()

    try:
        countries = parse_report(fetch_report())
        if args.previous:
            previous = json.loads(args.previous.read_text(encoding="utf-8"))["countries"]
            previous_counts = {country["code"]: country["visitors"] for country in previous}
            if previous_counts.keys() - countries.keys():
                raise ValueError("The map report is missing countries from the last successful snapshot")
            if previous_counts == countries:
                print("Visitor country counts are unchanged")
                return

        snapshot = {
            "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "countries": [
                {"code": code, "visitors": visitors}
                for code, visitors in sorted(countries.items())
            ],
        }
        args.output.write_text(json.dumps(snapshot, indent=2) + "\n", encoding="utf-8")
        print(f"Refreshed visitor counts for {len(countries)} countries and regions")
    except (OSError, ValueError, KeyError, TypeError) as error:
        raise SystemExit(f"Visitor data refresh failed: {error}") from error


if __name__ == "__main__":
    main()
