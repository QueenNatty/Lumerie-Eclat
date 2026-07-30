"""
Seeds a handful of sample products across both categories, so the shop
isn't empty on first run. Safe to re-run — skips products that already
exist by name.

Usage: python manage.py seed_products
"""

from django.core.management.base import BaseCommand

from apps.products.models import Product

SAMPLE_PRODUCTS = [
    dict(
        name="Aurelia Gold Hoop Earrings",
        description="Hand-finished 18k gold-plated hoops with a brushed texture. Lightweight enough for everyday wear.",
        main_category="jewelry",
        sub_category="earrings",
        price=18500,
        stock=12,
        image_url="https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800",
        material="Gold-plated brass",
        colors_available=["Gold"],
    ),
    dict(
        name="Noor Statement Ring",
        description="A bold cocktail ring set with a hand-cut amber stone, framed in an antique gold setting.",
        main_category="jewelry",
        sub_category="rings",
        price=24000,
        stock=8,
        image_url="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
        material="Brass, glass stone",
        colors_available=["Gold", "Amber"],
    ),
    dict(
        name="Adaeze Layered Necklace",
        description="Three delicate chains layered to different lengths, finished with a small crown charm.",
        main_category="jewelry",
        sub_category="necklaces",
        price=21500,
        stock=10,
        image_url="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
        material="Gold-plated stainless steel",
        colors_available=["Gold"],
    ),
    dict(
        name="Heritage Chain Bracelet",
        description="A substantial chain-link bracelet with a toggle clasp — pairs well with the Layered Necklace.",
        main_category="jewelry",
        sub_category="bracelets",
        price=15000,
        stock=15,
        image_url="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
        material="Gold-plated brass",
        colors_available=["Gold", "Silver"],
    ),
    dict(
        name="Midnight Crochet Beanie",
        description="Hand-crocheted in a soft merino blend, ribbed for a snug fit. One size.",
        main_category="crochet",
        sub_category="beanies",
        price=9500,
        stock=20,
        image_url="https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800",
        material="Merino wool blend",
        colors_available=["Charcoal", "Cream", "Terracotta"],
    ),
    dict(
        name="Amara Crochet Vest",
        description="An open-weave crochet vest, hand-made with a relaxed fit — layers beautifully over any base.",
        main_category="crochet",
        sub_category="vests",
        price=28000,
        stock=6,
        image_url="https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800",
        material="Cotton yarn",
        colors_available=["Cream", "Terracotta"],
    ),
    dict(
        name="Sade Crochet Tote Bag",
        description="A roomy, hand-crocheted tote lined in cotton — sturdy enough for daily use.",
        main_category="crochet",
        sub_category="bags",
        price=17500,
        stock=9,
        image_url="https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800",
        material="Cotton yarn, cotton lining",
        colors_available=["Cream", "Charcoal"],
    ),
    dict(
        name="Little Bloom Baby Set",
        description="A hand-crocheted baby blanket and bonnet set, made with hypoallergenic cotton yarn.",
        main_category="crochet",
        sub_category="baby_items",
        price=13000,
        stock=11,
        image_url="https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800",
        material="Hypoallergenic cotton",
        colors_available=["Cream", "Blush"],
    ),
]


class Command(BaseCommand):
    help = "Seeds sample products so the shop isn't empty on first run."

    def handle(self, *args, **options):
        created_count = 0
        for data in SAMPLE_PRODUCTS:
            _, created = Product.objects.get_or_create(name=data["name"], defaults=data)
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Created {created_count} new product(s); "
                f"{len(SAMPLE_PRODUCTS) - created_count} already existed."
            )
        )
