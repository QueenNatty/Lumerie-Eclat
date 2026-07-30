"""
Single source of truth for category/sub-category pairing.

Keeping this as one dict (rather than a database table) is a deliberate
simplification for this project's scope — it means zero extra queries to
resolve categories, at the cost of needing a code change (not an admin
edit) if you ever add a new sub-category. If categories become
admin-editable later, this dict is the only place that logic needs to move
out of.
"""

CATEGORY_MAP = {
    "jewelry": {
        "watches": "Watches",
        "rings": "Rings",
        "necklaces": "Necklaces",
        "bracelets": "Bracelets",
        "earrings": "Earrings",
        "anklets": "Anklets",
        "brooches_pins": "Brooches / Pins",
    },
    "crochet": {
        "beanies": "Beanies",
        "hats": "Hats",
        "vests": "Vests",
        "scarves": "Scarves",
        "gloves_mittens": "Gloves / Mittens",
        "headbands": "Headbands",
        "bags": "Bags",
        "shawls_wraps": "Shawls / Wraps",
        "home_decor": "Home Decor",
        "stuffed_toys": "Stuffed Toys",
        "baby_items": "Baby Items",
    },
}

MAIN_CATEGORY_CHOICES = [(key, key.title()) for key in CATEGORY_MAP]


def get_sub_category_choices():
    """Flat (value, label) list of every sub-category, for the model field's `choices`."""
    choices = []
    for sub_map in CATEGORY_MAP.values():
        choices.extend(sub_map.items())
    return choices
