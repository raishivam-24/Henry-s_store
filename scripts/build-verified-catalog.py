
import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPTS = ROOT / "scripts"
SOURCE_FILE = SCRIPTS / "client-review-source.tsv"
CATALOG_FILE = SCRIPTS / "product-catalog-verified.json"


def text(value):
    return str(value or "").strip()


def number_values(value):
    """Extract numeric prices, including values such as '1245 / 1305'."""
    cleaned = text(value).replace(",", "")
    return [
        float(item)
        for item in re.findall(r"\d+(?:\.\d+)?", cleaned)
    ]


def parse_single(value):
    values = number_values(value)
    return values[0] if values else None


def display_number(value):
    if value is None:
        return None
    return int(value) if value.is_integer() else value


def main():
    if not SOURCE_FILE.exists():
        raise FileNotFoundError(f"Source TSV not found: {SOURCE_FILE}")

    if not CATALOG_FILE.exists():
        raise FileNotFoundError(f"Catalog not found: {CATALOG_FILE}")

    with CATALOG_FILE.open("r", encoding="utf-8-sig") as file:
        catalog = json.load(file)

    with SOURCE_FILE.open(
        "r", encoding="utf-8-sig", newline=""
    ) as file:
        rows = list(csv.DictReader(file, delimiter="\t"))

    products = catalog["products"] if isinstance(catalog, dict) else catalog

    if len(rows) != 90 or len(products) != 90:
        raise ValueError(
            f"Expected 90 rows/products; found {len(rows)} TSV rows "
            f"and {len(products)} catalog products. Nothing changed."
        )

    missing_prices = []
    active_count = 0
    excluded_count = 0

    for index, (row, product) in enumerate(zip(rows, products), start=1):
        filename_prices = number_values(
            row.get("Price from Image Filename (₹) — Verify")
        )
        selling_price = parse_single(row.get("Selling Price (₹)"))
        sheet_mrp = parse_single(row.get("Market Price / MRP (₹)"))
        status = text(row.get("Website Status"))

        # Prefer the actual selling price from the sheet.
        # If blank, use the first filename price.
        # For a pair such as 1245 / 1305, use 1245 as selling price.
        price = selling_price
        if price is None and filename_prices:
            price = min(filename_prices)

        # Prefer the MRP column; otherwise use the higher filename value.
        mrp = sheet_mrp
        if mrp is None and filename_prices:
            mrp = max(filename_prices)

        if mrp is None:
            mrp = price

        if price is None:
            missing_prices.append(
                f"Row {index}: {row.get('Product Name (Client to Fill)', 'Unknown')}"
            )

        product["price"] = display_number(price)
        product["mrp"] = display_number(mrp)

        # Never exclude HOLD products. Only DO NOT ADD is excluded.
        product["websiteStatus"] = status
        product["isActive"] = not status.upper().startswith("DO NOT ADD")

        if product["isActive"]:
            active_count += 1
        else:
            excluded_count += 1

        # Update the catalog's descriptive fields from the client sheet.
        for source_key, target_key in [
            ("Product Name (Client to Fill)", "name"),
            ("Product Description", "description"),
            ("Brand", "brand"),
            ("Category", "category"),
            ("Pack Size / Quantity", "packSize"),
        ]:
            value = text(row.get(source_key))
            if value:
                product[target_key] = value

        ingredients = text(row.get("Ingredients"))
        if ingredients:
            product["ingredients"] = ingredients

        stock = parse_single(row.get("Number of Stocks"))
        product["stock"] = display_number(stock)

    if isinstance(catalog, dict):
        catalog["totalReviewed"] = len(products)
        catalog["activeCount"] = active_count
        catalog["inactiveCount"] = excluded_count
        catalog["products"] = products

    if missing_prices:
        print("ERROR: These products have no price in either price column:")
        print("\n".join(missing_prices))
        raise ValueError(
            "Catalog was not saved because one or more prices are missing. "
            "Check the source sheet before continuing."
        )

    with CATALOG_FILE.open("w", encoding="utf-8") as file:
        json.dump(catalog, file, ensure_ascii=False, indent=2)

    print("Price mapping updated successfully.")
    print(f"Total products: {len(products)}")
    print(f"Active products: {active_count}")
    print(f"Excluded DO NOT ADD products: {excluded_count}")
    print("Selling prices and MRPs mapped from the sheet.")


if __name__ == "__main__":
    main()
