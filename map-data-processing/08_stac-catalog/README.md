# Generate STAC catalog

## Required CLI tools

Install Python:

`brew install python`

Verify:

`python3 --version`

## Setup

Create Python virtual environment:

`python3 -m venv .venv`

Activate it:

`source .venv/bin/activat`

Install dependencies:

`pip install -r requirements.txt`

## Commands

Generate STAC catalog to `./stac` folder:

`python3 create-stack-catalog.py`

Verify it:

`stac-validator validate stac/catalog.json --recursive`

Verify final result in web server:

`stac-validator validate https://maannousu.info/stac/catalog.json --recursive`