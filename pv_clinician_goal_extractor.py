#!/usr/bin/env python3
"""
PracticeVital Clinician Goal Extractor

Extracts clinician data from a saved PracticeVital HTML page (Settings > Clinicians).
Outputs a CSV with: ID, Name, Start Date, Current Goal, Count Overdue Notes,
Location, Supervisor, Type, and full Goal History.

Usage:
    python3 pv_clinician_goal_extractor.py <input_html_file> [output_csv_file]

Example:
    python3 pv_clinician_goal_extractor.py ~/Downloads/clinicians.html
    python3 pv_clinician_goal_extractor.py ~/Downloads/clinicians.html ~/Desktop/output.csv
"""

import re
import csv
import sys
from datetime import datetime
from pathlib import Path


def parse_date(date_str: str) -> str:
    """Normalize date to YYYY-MM-DD format."""
    date_str = date_str.strip()
    # Normalize Sept. to Sep.
    date_str = date_str.replace("Sept.", "Sep.")

    formats = [
        "%B %d, %Y",      # March 7, 2024
        "%b. %d, %Y",     # Dec. 16, 2024
        "%b %d, %Y",      # Dec 16, 2024
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return date_str  # Return as-is if parsing fails


def get_goal_history(clinician_id: str, content: str) -> str:
    """Extract goal history from popover for a given clinician."""
    pattern = rf'hx-get="/settings/clinicians/{clinician_id}/edit/".*?<template x-teleport="#tooltips-container">(.*?)</template>'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        popover = match.group(1)
        periods = re.findall(
            r"font-semibold text-\[10px\]'>\s*([^<]+?)\s*</div>.*?text-\[10px\] pl-2\">\s*(\d+)\s*</div>",
            popover, re.DOTALL
        )
        history = []
        for date_range, goal in periods:
            dr = date_range.strip().replace('&ndash;', '-')
            history.append(f"{dr} {goal}")
        return " | ".join(history)
    return ""


def extract_clinicians(html_content: str) -> list[dict]:
    """Extract all clinician data from HTML content."""
    clinician_pattern = re.findall(
        r'<tr class="(?:even|odd)"[^>]*>.*?hx-get="/settings/clinicians/(\d+)/edit/"[^>]*>([^<]+)</span>.*?'
        r'<td[^>]*>\s*([A-Za-z]{3,4}\.\s*\d+,\s*\d{4}|\w+\s+\d+,\s+\d{4})\s*</td>.*?'
        r"font-normal'>\s*(\d+).*?"
        r'<td[^>]*>\s*(Yes|No|—)\s*</td>.*?'
        r'<td[^>]*>\s*([^<]*?)\s*</td>.*?'
        r'<td[^>]*>\s*([^<]+?)\s*</td>.*?'
        r'<td[^>]*>\s*([A-Z\-]+)\s*</td>',
        html_content, re.DOTALL
    )

    clinicians = []
    seen = set()

    for match in clinician_pattern:
        id_ = match[0]
        if id_ in seen:
            continue
        seen.add(id_)

        # Clean location - replace em dash with empty string
        location = match[5].strip()
        if location in ['—', '–', '-', '\u2014', '\u2013']:
            location = ""

        clinicians.append({
            'ID': id_,
            'Name': match[1].strip(),
            'Start Date': parse_date(match[2].strip()),
            'Current Goal': match[3].strip(),
            'Count Overdue Notes': match[4].strip(),
            'Location': location,
            'Supervisor': match[6].strip(),
            'Type': match[7].strip(),
            'Goal History': get_goal_history(id_, html_content)
        })

    return clinicians


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    input_file = Path(sys.argv[1])

    if not input_file.exists():
        print(f"Error: File not found: {input_file}")
        sys.exit(1)

    # Default output file
    if len(sys.argv) >= 3:
        output_file = Path(sys.argv[2])
    else:
        output_file = input_file.parent / "clinicians_data.csv"

    # Read HTML content
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract clinicians
    clinicians = extract_clinicians(content)

    if not clinicians:
        print("No clinicians found in the HTML file.")
        print("Make sure you saved the full page from Settings > Clinicians in PracticeVital.")
        sys.exit(1)

    # Write CSV with UTF-8 BOM for Excel compatibility
    fieldnames = ['ID', 'Name', 'Start Date', 'Current Goal', 'Count Overdue Notes',
                  'Location', 'Supervisor', 'Type', 'Goal History']

    with open(output_file, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(clinicians)

    print(f"Extracted {len(clinicians)} clinicians")
    print(f"Saved to: {output_file}")

    # Print summary
    print("\nClinicians:")
    for c in clinicians:
        print(f"  {c['Name']} - Goal: {c['Current Goal']}, Type: {c['Type']}, Supervisor: {c['Supervisor']}")


if __name__ == "__main__":
    main()
