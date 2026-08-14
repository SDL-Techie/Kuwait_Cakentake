from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from extensions import db
from models.bank_charge import BankCharge
from middleware.role import role_required
from models.misc import BankTransaction

bank_charges_bp = Blueprint("bank_charges", __name__)

# GET /bank/charges
@bank_charges_bp.route("/bank/charges", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_bank_charges():
    charges = BankCharge.query.order_by(BankCharge.charged_on.desc()).all()
    return jsonify({"bank_charges": [c.to_dict() for c in charges]}), 200


# POST /bank/charges
@bank_charges_bp.route("/bank/charges", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def create_bank_charge():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    required = ["title", "charge_type", "amount"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    amount = float(data["amount"])

    # Current Bank Balance
    last_txn = BankTransaction.query.order_by(BankTransaction.id.desc()).first()
    current_balance = float(last_txn.balance_after) if last_txn else 0

    if amount > current_balance:
        return jsonify({"error": "Insufficient bank balance"}), 400

    new_balance = current_balance - amount

    # Save Bank Charge
    charge = BankCharge(
        title=data["title"],
        charge_type=data["charge_type"],
        amount=amount,
        description=data.get("description"),
        created_by=int(get_jwt_identity())
    )
    db.session.add(charge)
    db.session.flush()

    # Create Bank Transaction
    transaction = BankTransaction(
        transaction_type="BANK_CHARGE",
        amount=amount,
        balance_after=new_balance,
        reference=f"Charge #{charge.id}",
        notes=charge.title,
        performed_by=int(get_jwt_identity())
    )

    db.session.add(transaction)
    db.session.commit()

    return jsonify({
        "message": "Bank charge recorded",
        "bank_charge": charge.to_dict(),
        "bank_balance": new_balance
    }), 201

# PUT /bank/charges/:id
@bank_charges_bp.route("/bank/charges/<int:charge_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_bank_charge(charge_id):

    charge = BankCharge.query.get_or_404(charge_id)
    data = request.get_json()

    old_amount = float(charge.amount)
    new_amount = float(data.get("amount", old_amount))

    difference = new_amount - old_amount

    last_txn = BankTransaction.query.order_by(BankTransaction.id.desc()).first()
    current_balance = float(last_txn.balance_after) if last_txn else 0

    if difference > 0 and difference > current_balance:
        return jsonify({"error": "Insufficient bank balance"}), 400

    for field in ["title", "charge_type", "description"]:
        if field in data:
            setattr(charge, field, data[field])

    charge.amount = new_amount

    new_balance = current_balance - difference

    transaction = BankTransaction(
        transaction_type="BANK_CHARGE_EDIT",
        amount=difference,
        balance_after=new_balance,
        reference=f"Charge #{charge.id}",
        notes="Bank Charge Updated",
        performed_by=int(get_jwt_identity())
    )

    db.session.add(transaction)
    db.session.commit()

    return jsonify({
        "message": "Bank charge updated",
        "bank_charge": charge.to_dict(),
        "bank_balance": new_balance
    }), 200

# DELETE /bank/charges/:id
@bank_charges_bp.route("/bank/charges/<int:charge_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN"])
def delete_bank_charge(charge_id):

    charge = BankCharge.query.get_or_404(charge_id)

    last_txn = BankTransaction.query.order_by(BankTransaction.id.desc()).first()
    current_balance = float(last_txn.balance_after) if last_txn else 0

    new_balance = current_balance + float(charge.amount)

    reverse_txn = BankTransaction(
        transaction_type="BANK_CHARGE_REVERSAL",
        amount=charge.amount,
        balance_after=new_balance,
        reference=f"Charge #{charge.id}",
        notes="Bank Charge Deleted",
        performed_by=int(get_jwt_identity())
    )

    db.session.add(reverse_txn)
    db.session.delete(charge)
    db.session.commit()

    return jsonify({
        "message": "Bank charge deleted",
        "bank_balance": new_balance
    }), 200

# GET /bank/charges/report
@bank_charges_bp.route("/bank/charges/report", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def bank_charges_report():
    total = db.session.query(func.sum(BankCharge.amount)).scalar() or 0

    by_type = db.session.query(
        BankCharge.charge_type,
        func.count(BankCharge.id).label("count"),
        func.sum(BankCharge.amount).label("total")
    ).group_by(BankCharge.charge_type).all()

    return jsonify({
        "total_charges": float(total),
        "total_count":   BankCharge.query.count(),
        "by_type": [
            {
                "charge_type": r[0],
                "count":       r[1],
                "total":       float(r[2] or 0)
            }
            for r in by_type
        ]
    }), 200