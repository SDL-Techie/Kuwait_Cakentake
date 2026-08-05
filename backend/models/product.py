from extensions import db
from datetime import datetime
from models.currency_rate import CurrencyRate

class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text, nullable=True)

    category_id = db.Column(
        db.Integer,
        db.ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True
    )

    category = db.relationship(
        "Category",
        back_populates="products"
    )

    subcategory_id = db.Column(
    db.Integer,
    db.ForeignKey("subcategories.id"),
    nullable=True
    )

    subcategory = db.relationship(
    "SubCategory",
    back_populates="products"
   )

    variants = db.relationship(
       "Variant",
        back_populates="product",
        lazy="selectin",
        cascade="all, delete-orphan"
      )
    
    promotions = db.relationship(
    "Promotion",
    back_populates="product",
    lazy="selectin"
)

    price = db.Column(db.Numeric(10, 2), nullable=False)
    original_price = db.Column(db.Numeric(10, 2), nullable=True)

    stock = db.Column(db.Integer, default=0, nullable=False)
    unit = db.Column(db.String(20), nullable=False)

    image_url = db.Column(db.String(500), nullable=True)
    ingredients = db.Column(db.Text, nullable=True)

    is_active = db.Column(db.Boolean, nullable=False, default=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # INSIDE THE CLASS
    # def to_dict(self, currency="INR"):
    def to_dict(self, currency="KWD"):

        # rates = {
        #     "INR": 1,
        #     "AED": 0.043,
        #     "SAR": 0.044,
        #     "USD": 0.012,
        #     "KWD": 0.0037
        # }


        # rate = CurrencyRate.query.filter_by(
        #   currency_code=currency
        # ).first()

        # conversion_rate = float(rate.rate) if rate else 1


        rate = CurrencyRate.query.filter_by(
         currency_code=currency
        ).first()

        print("=" * 50)
        print("Currency Requested:", currency)
        print("Rate Object:", rate)
        print("Rate Value:", float(rate.rate) if rate else "NOT FOUND")
        print("Original Price:", self.price)

        conversion_rate = float(rate.rate) if rate else 1

        print("Conversion Rate:", conversion_rate)
        print("Converted Price:", float(self.price) * conversion_rate)
        print("=" * 50)



        # price = (
        #     float(self.price) * rates[currency]
        #     if self.price
        #     else None
        # )

        price = (
         float(self.price) * conversion_rate
         if self.price
         else None
         )

        # original_price = (
        #     float(self.original_price) * rates[currency]
        #     if self.original_price
        #     else None
        # )

        original_price = (
        float(self.original_price) * conversion_rate
        if self.original_price
        else None
        )

        

#         active_promotion = next(
#     (p for p in self.promotions),
#     None
# )

        active_promotion = next(
        (
            p for p in self.promotions
            if p.is_active
            and (p.start_date is None or p.start_date <= datetime.utcnow())
            and (p.end_date is None or p.end_date >= datetime.utcnow())
        ),
        None
    )

        discounted_price = price
        if active_promotion and discounted_price is not None:
             if active_promotion.discount_type == "PERCENT":
                discounted_price = discounted_price - (
                  discounted_price * float(active_promotion.discount_value) / 100
                )
             elif active_promotion.discount_type == "FIXED":
                   discounted_price = max(
                    discounted_price - float(active_promotion.discount_value),
                     0
               )
    
        discounted_price = round(discounted_price, 2) if discounted_price is not None else None 




        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            # "category_id": self.category_id,
            # "category_name": self.category.name if self.category else None,

            "category": self.category.to_dict() if self.category else None,
            "subcategory": (self.subcategory.to_dict() if self.subcategory  else None),
            "variants": [
                     variant.to_dict()
                     for variant in self.variants
                        ],

            "promotion": active_promotion.to_dict() if active_promotion else None,
            # "price": round(price, 2) if price else None,
            # "original_price": round(original_price, 2) if original_price else None,
            "price": discounted_price,
"original_price": round(price, 2) if price is not None else None,
            "currency": currency,

            "stock": self.stock,
            "unit": self.unit,

            "image_url": self.image_url,
            "ingredients": self.ingredients,

            "is_active": self.is_active,

            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }