from extensions import db
from datetime import datetime

class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(
        db.String(100),
        nullable=True
    )


    image = db.Column(
        db.String(255)
    )

    status = db.Column(
        db.String(20),
        default="active"
    )
    created_at = db.Column(
    db.DateTime,
    default=datetime.utcnow
)

    products = db.relationship(
    "Product",
    back_populates="category",
    passive_deletes=True
)


    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "image": self.image,
            "status": self.status
        }