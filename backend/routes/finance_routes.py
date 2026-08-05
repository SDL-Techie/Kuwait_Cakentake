# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from datetime import datetime, timedelta
# from sqlalchemy import func
# from extensions import db
# from models.misc import Expense, CashDrawerTransaction, BankTransaction
# from models.bank_charge import BankCharge
# from services.cash_service import get_current_balance, add_transaction
# from middleware.role import role_required

# finance_bp = Blueprint("finance", __name__)


# # ─── EXPENSES ────────────────────────────────────────────────────────────────

# @finance_bp.route("/expenses", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_expenses():
#     expenses = Expense.query.order_by(Expense.expense_date.desc()).all()
#     return jsonify({"expenses": [e.to_dict() for e in expenses]}), 200


# @finance_bp.route("/expenses", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def create_expense():
#     data = request.get_json()
#     expense = Expense(
#         category=data["category"],
#         description=data.get("description"),
#         amount=data["amount"],
#         paid_by=int(get_jwt_identity())
#     )
#     db.session.add(expense)
#     db.session.commit()
#     return jsonify({"message": "Expense recorded", "expense": expense.to_dict()}), 201


# @finance_bp.route("/expenses/<int:expense_id>", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_expense(expense_id):
#     expense = Expense.query.get_or_404(expense_id)
#     return jsonify({"expense": expense.to_dict()}), 200


# @finance_bp.route("/expenses/report", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def expense_report():
#     from sqlalchemy import func
#     total = db.session.query(func.sum(Expense.amount)).scalar() or 0
#     by_category = db.session.query(
#         Expense.category,
#         func.sum(Expense.amount).label("total")
#     ).group_by(Expense.category).all()
#     return jsonify({
#         "total": float(total),
#         "by_category": [{"category": r[0], "total": float(r[1])} for r in by_category]
#     }), 200


# @finance_bp.route("/expenses/dashboard", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def expenses_dashboard():
#     today = datetime.utcnow().date()
#     month_start = today.replace(day=1)
#     since_30 = datetime.utcnow() - timedelta(days=30)

#     total_amount = db.session.query(func.sum(Expense.amount)).scalar() or 0
#     total_count = Expense.query.count()

#     today_total = db.session.query(func.sum(Expense.amount)).filter(
#         func.date(Expense.expense_date) == today
#     ).scalar() or 0

#     month_total = db.session.query(func.sum(Expense.amount)).filter(
#         Expense.expense_date >= month_start
#     ).scalar() or 0

#     by_category = db.session.query(
#         Expense.category,
#         func.count(Expense.id).label("count"),
#         func.sum(Expense.amount).label("total")
#     ).group_by(Expense.category).order_by(func.sum(Expense.amount).desc()).all()

#     chart_rows = db.session.query(
#         func.date(Expense.expense_date).label("date"),
#         func.sum(Expense.amount).label("total")
#     ).filter(Expense.expense_date >= since_30).group_by(
#         func.date(Expense.expense_date)
#     ).order_by(func.date(Expense.expense_date)).all()

#     recent = Expense.query.order_by(Expense.expense_date.desc()).limit(5).all()

#     return jsonify({
#         "total_amount": float(total_amount),
#         "total_count": total_count,
#         "today_total": float(today_total),
#         "month_total": float(month_total),
#         "by_category": [
#             {"category": r[0], "count": r[1], "total": float(r[2] or 0)}
#             for r in by_category
#         ],
#         "chart": [{"date": str(r[0]), "total": float(r[1] or 0)} for r in chart_rows],
#         "recent_expenses": [e.to_dict() for e in recent]
#     }), 200


# # ─── CASH DRAWER ─────────────────────────────────────────────────────────────

# @finance_bp.route("/cash-drawer", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_cash_drawer():
#     balance = get_current_balance()
#     return jsonify({"balance": balance}), 200


# @finance_bp.route("/cash-drawer/add-cash", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def add_cash():
#     data = request.get_json()
#     result = add_transaction("ADD", data["amount"], data.get("notes"), performed_by=int(get_jwt_identity()))
#     return jsonify(result), 200


# @finance_bp.route("/cash-drawer/deposit", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def cash_deposit():
#     data = request.get_json()
#     result = add_transaction("DEPOSIT", data["amount"], data.get("notes"), performed_by=int(get_jwt_identity()))
#     return jsonify(result), 200


# @finance_bp.route("/cash-drawer/withdraw", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def cash_withdraw():
#     data = request.get_json()
#     result = add_transaction("WITHDRAW", data["amount"], data.get("notes"), performed_by=int(get_jwt_identity()))
#     if "error" in result:
#         return jsonify(result), 400
#     return jsonify(result), 200


# @finance_bp.route("/cash-drawer/statement", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def cash_statement():
#     txns = CashDrawerTransaction.query.order_by(CashDrawerTransaction.created_at.desc()).all()
#     return jsonify({"transactions": [t.to_dict() for t in txns]}), 200


# @finance_bp.route("/cash-drawer/transactions", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def cash_transactions():
#     txns = CashDrawerTransaction.query.order_by(CashDrawerTransaction.created_at.desc()).limit(100).all()
#     return jsonify({"transactions": [t.to_dict() for t in txns]}), 200


# @finance_bp.route("/cash-drawer/audit", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN"])
# def cash_audit():
#     txns = CashDrawerTransaction.query.order_by(CashDrawerTransaction.created_at).all()
#     return jsonify({"audit": [t.to_dict() for t in txns]}), 200


# @finance_bp.route("/cash-drawer/daily-summary", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def cash_daily_summary():
#     from datetime import date, datetime
#     from sqlalchemy import func, cast, Date
#     today = date.today()
#     txns = CashDrawerTransaction.query.filter(
#         func.date(CashDrawerTransaction.created_at) == today
#     ).all()
#     total_in = sum(float(t.amount) for t in txns if t.transaction_type in ["ADD", "DEPOSIT"])
#     total_out = sum(float(t.amount) for t in txns if t.transaction_type == "WITHDRAW")
#     return jsonify({
#         "date": str(today),
#         "total_in": total_in,
#         "total_out": total_out,
#         "net": total_in - total_out,
#         "closing_balance": get_current_balance()
#     }), 200


# @finance_bp.route("/cash-drawer/dashboard", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def cash_drawer_dashboard():
#     today = datetime.utcnow().date()
#     since_7 = datetime.utcnow() - timedelta(days=7)

#     today_txns = CashDrawerTransaction.query.filter(
#         func.date(CashDrawerTransaction.created_at) == today
#     ).all()
#     today_in = sum(float(t.amount) for t in today_txns if t.transaction_type in ["ADD", "DEPOSIT"])
#     today_out = sum(float(t.amount) for t in today_txns if t.transaction_type == "WITHDRAW")

#     week_txns = CashDrawerTransaction.query.filter(
#         CashDrawerTransaction.created_at >= since_7
#     ).all()
#     week_in = sum(float(t.amount) for t in week_txns if t.transaction_type in ["ADD", "DEPOSIT"])
#     week_out = sum(float(t.amount) for t in week_txns if t.transaction_type == "WITHDRAW")

#     chart_rows = db.session.query(
#         func.date(CashDrawerTransaction.created_at).label("date"),
#         func.sum(
#             db.case((CashDrawerTransaction.transaction_type.in_(["ADD", "DEPOSIT"]), CashDrawerTransaction.amount), else_=0)
#         ).label("in_amount"),
#         func.sum(
#             db.case((CashDrawerTransaction.transaction_type == "WITHDRAW", CashDrawerTransaction.amount), else_=0)
#         ).label("out_amount")
#     ).filter(CashDrawerTransaction.created_at >= since_7).group_by(
#         func.date(CashDrawerTransaction.created_at)
#     ).order_by(func.date(CashDrawerTransaction.created_at)).all()

#     recent = CashDrawerTransaction.query.order_by(CashDrawerTransaction.created_at.desc()).limit(5).all()

#     return jsonify({
#         "current_balance": get_current_balance(),
#         "today": {"in": today_in, "out": today_out, "net": today_in - today_out},
#         "this_week": {"in": week_in, "out": week_out, "net": week_in - week_out},
#         "total_transactions": CashDrawerTransaction.query.count(),
#         "chart": [
#             {"date": str(r[0]), "in": float(r[1] or 0), "out": float(r[2] or 0)}
#             for r in chart_rows
#         ],
#         "recent_transactions": [t.to_dict() for t in recent]
#     }), 200


# # ─── BANK ────────────────────────────────────────────────────────────────────

# def _bank_balance():
#     last = BankTransaction.query.order_by(BankTransaction.id.desc()).first()
#     return float(last.balance_after) if last else 0.0


# @finance_bp.route("/bank/balance", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def bank_balance():
#     return jsonify({"balance": _bank_balance()}), 200


# @finance_bp.route("/bank/statement", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def bank_statement():
#     txns = BankTransaction.query.order_by(BankTransaction.created_at.desc()).all()
#     return jsonify({"transactions": [t.to_dict() for t in txns]}), 200


# @finance_bp.route("/bank/deposit", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def bank_deposit():
#     data = request.get_json()
#     balance = _bank_balance() + float(data["amount"])
#     txn = BankTransaction(
#         transaction_type="DEPOSIT",
#         amount=data["amount"],
#         balance_after=balance,
#         reference=data.get("reference"),
#         notes=data.get("notes"),
#         performed_by=int(get_jwt_identity())
#     )
#     db.session.add(txn)
#     db.session.commit()
#     return jsonify({"message": "Bank deposit recorded", "balance": balance}), 200


# @finance_bp.route("/bank/withdraw", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def bank_withdraw():
#     data = request.get_json()
#     current = _bank_balance()
#     amount = float(data["amount"])
#     if amount > current:
#         return jsonify({"error": "Insufficient bank balance"}), 400
#     balance = current - amount
#     txn = BankTransaction(
#         transaction_type="WITHDRAW",
#         amount=amount,
#         balance_after=balance,
#         reference=data.get("reference"),
#         notes=data.get("notes"),
#         performed_by=int(get_jwt_identity())
#     )
#     db.session.add(txn)
#     db.session.commit()
#     return jsonify({"message": "Bank withdrawal recorded", "balance": balance}), 200


# @finance_bp.route("/bank/transfers", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def bank_transfers():
#     txns = BankTransaction.query.order_by(BankTransaction.created_at.desc()).all()
#     return jsonify({"transfers": [t.to_dict() for t in txns]}), 200


# @finance_bp.route("/bank/reconciliation", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN"])
# def bank_reconciliation():
#     unreconciled = BankTransaction.query.filter_by(is_reconciled=False).all()
#     return jsonify({"unreconciled": [t.to_dict() for t in unreconciled]}), 200


# @finance_bp.route("/bank/reconciliation/verify", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN"])
# def verify_reconciliation():
#     data = request.get_json()
#     txn_ids = data.get("transaction_ids", [])
#     BankTransaction.query.filter(BankTransaction.id.in_(txn_ids)).update(
#         {"is_reconciled": True}, synchronize_session=False
#     )
#     db.session.commit()
#     return jsonify({"message": f"{len(txn_ids)} transactions reconciled"}), 200


# @finance_bp.route("/bank/dashboard", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def bank_dashboard():
#     today = datetime.utcnow().date()
#     month_start = today.replace(day=1)
#     since_30 = datetime.utcnow() - timedelta(days=30)

#     today_txns = BankTransaction.query.filter(
#         func.date(BankTransaction.created_at) == today
#     ).all()
#     today_deposits = sum(float(t.amount) for t in today_txns if t.transaction_type == "DEPOSIT")
#     today_withdrawals = sum(float(t.amount) for t in today_txns if t.transaction_type == "WITHDRAW")

#     month_txns = BankTransaction.query.filter(
#         BankTransaction.created_at >= month_start
#     ).all()
#     month_deposits = sum(float(t.amount) for t in month_txns if t.transaction_type == "DEPOSIT")
#     month_withdrawals = sum(float(t.amount) for t in month_txns if t.transaction_type == "WITHDRAW")

#     total_charges = db.session.query(func.sum(BankCharge.amount)).scalar() or 0

#     chart_rows = db.session.query(
#         func.date(BankTransaction.created_at).label("date"),
#         func.sum(
#             db.case((BankTransaction.transaction_type == "DEPOSIT", BankTransaction.amount), else_=0)
#         ).label("deposits"),
#         func.sum(
#             db.case((BankTransaction.transaction_type == "WITHDRAW", BankTransaction.amount), else_=0)
#         ).label("withdrawals")
#     ).filter(BankTransaction.created_at >= since_30).group_by(
#         func.date(BankTransaction.created_at)
#     ).order_by(func.date(BankTransaction.created_at)).all()

#     recent = BankTransaction.query.order_by(BankTransaction.created_at.desc()).limit(5).all()

#     return jsonify({
#         "current_balance": _bank_balance(),
#         "today": {
#             "deposits": today_deposits,
#             "withdrawals": today_withdrawals,
#             "net": today_deposits - today_withdrawals
#         },
#         "this_month": {
#             "deposits": month_deposits,
#             "withdrawals": month_withdrawals,
#             "net": month_deposits - month_withdrawals
#         },
#         "total_transactions": BankTransaction.query.count(),
#         "pending_reconciliation": BankTransaction.query.filter_by(is_reconciled=False).count(),
#         "total_bank_charges": float(total_charges),
#         "chart": [
#             {"date": str(r[0]), "deposits": float(r[1] or 0), "withdrawals": float(r[2] or 0)}
#             for r in chart_rows
#         ],
#         "recent_transactions": [t.to_dict() for t in recent]
#     }), 200


# # PUT /expenses/:id
# @finance_bp.route("/expenses/<int:expense_id>", methods=["PUT"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def update_expense(expense_id):
#     expense = Expense.query.get_or_404(expense_id)
#     data = request.get_json()
#     for field in ["category", "description", "amount"]:
#         if field in data:
#             setattr(expense, field, data[field])
#     db.session.commit()
#     return jsonify({"message": "Expense updated", "expense": expense.to_dict()}), 200


# # DELETE /expenses/:id
# @finance_bp.route("/expenses/<int:expense_id>", methods=["DELETE"])
# @jwt_required()
# @role_required(["ADMIN"])
# def delete_expense(expense_id):
#     expense = Expense.query.get_or_404(expense_id)
#     db.session.delete(expense)
#     db.session.commit()
#     return jsonify({"message": "Expense deleted"}), 200



from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from sqlalchemy import func
from extensions import db
from models.misc import Expense, CashDrawerTransaction, BankTransaction
from models.bank_charge import BankCharge
from services.cash_service import get_current_balance, add_transaction
from middleware.role import role_required
from models.order import Order
from models.user import User

finance_bp = Blueprint("finance", __name__)


# ─── EXPENSES ────────────────────────────────────────────────────────────────

@finance_bp.route("/expenses", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_expenses():
    expenses = Expense.query.order_by(Expense.expense_date.desc()).all()
    return jsonify({"expenses": [e.to_dict() for e in expenses]}), 200


@finance_bp.route("/expenses", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def create_expense():
    data = request.get_json()

    expense = Expense(
        category=data["category"],
        description=data.get("description"),
        amount=data["amount"],
        payment_source=data["payment_source"],
        reference=data.get("reference"),
        paid_by=int(get_jwt_identity())
    )

    db.session.add(expense)

    amount = float(expense.amount)

    if expense.payment_source == "CASH":
        result = add_transaction(
            "WITHDRAW",
            amount,
            notes=f"Expense - {expense.category}",
            performed_by=int(get_jwt_identity())
        )

        if "error" in result:
            db.session.rollback()
            return jsonify(result), 400

    elif expense.payment_source == "BANK":
        current = _bank_balance()

        if amount > current:
            db.session.rollback()
            return jsonify({"error": "Insufficient bank balance"}), 400

        txn = BankTransaction(
            transaction_type="WITHDRAW",
            amount=amount,
            balance_after=current - amount,
            reference=expense.reference,
            notes=f"Expense - {expense.category}",
            performed_by=int(get_jwt_identity())
        )

        db.session.add(txn)

    db.session.commit()

    return jsonify({
        "message": "Expense recorded",
        "expense": expense.to_dict()
    }), 201

@finance_bp.route("/expenses/<int:expense_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_expense(expense_id):
    expense = Expense.query.get_or_404(expense_id)
    return jsonify({"expense": expense.to_dict()}), 200


@finance_bp.route("/expenses/report", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def expense_report():
    from sqlalchemy import func
    total = db.session.query(func.sum(Expense.amount)).scalar() or 0
    by_category = db.session.query(
        Expense.category,
        func.sum(Expense.amount).label("total")
    ).group_by(Expense.category).all()
    return jsonify({
        "total": float(total),
        "by_category": [{"category": r[0], "total": float(r[1])} for r in by_category]
    }), 200


@finance_bp.route("/expenses/dashboard", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def expenses_dashboard():
    today = datetime.utcnow().date()
    month_start = today.replace(day=1)
    since_30 = datetime.utcnow() - timedelta(days=30)

    total_amount = db.session.query(func.sum(Expense.amount)).scalar() or 0
    total_count = Expense.query.count()

    today_total = db.session.query(func.sum(Expense.amount)).filter(
        func.date(Expense.expense_date) == today
    ).scalar() or 0

    month_total = db.session.query(func.sum(Expense.amount)).filter(
        Expense.expense_date >= month_start
    ).scalar() or 0

    by_category = db.session.query(
        Expense.category,
        func.count(Expense.id).label("count"),
        func.sum(Expense.amount).label("total")
    ).group_by(Expense.category).order_by(func.sum(Expense.amount).desc()).all()

    chart_rows = db.session.query(
        func.date(Expense.expense_date).label("date"),
        func.sum(Expense.amount).label("total")
    ).filter(Expense.expense_date >= since_30).group_by(
        func.date(Expense.expense_date)
    ).order_by(func.date(Expense.expense_date)).all()

    recent = Expense.query.order_by(Expense.expense_date.desc()).limit(5).all()

    return jsonify({
        "total_amount": float(total_amount),
        "total_count": total_count,
        "today_total": float(today_total),
        "month_total": float(month_total),
        "by_category": [
            {"category": r[0], "count": r[1], "total": float(r[2] or 0)}
            for r in by_category
        ],
        "chart": [{"date": str(r[0]), "total": float(r[1] or 0)} for r in chart_rows],
        "recent_expenses": [e.to_dict() for e in recent]
    }), 200


# ─── CASH DRAWER ─────────────────────────────────────────────────────────────

@finance_bp.route("/cash-drawer", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_cash_drawer():
    balance = get_current_balance()
    return jsonify({"balance": balance}), 200


@finance_bp.route("/cash-drawer/add-cash", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def add_cash():
    data = request.get_json()
    result = add_transaction("ADD", data["amount"], data.get("notes"), performed_by=int(get_jwt_identity()))
    return jsonify(result), 200


@finance_bp.route("/cash-drawer/deposit", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def cash_deposit():
    data = request.get_json()
    result = add_transaction("DEPOSIT", data["amount"], data.get("notes"), performed_by=int(get_jwt_identity()))
    return jsonify(result), 200


@finance_bp.route("/cash-drawer/withdraw", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def cash_withdraw():
    data = request.get_json()
    result = add_transaction("WITHDRAW", data["amount"], data.get("notes"), performed_by=int(get_jwt_identity()))
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result), 200


@finance_bp.route("/cash-drawer/statement", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def cash_statement():
    txns = CashDrawerTransaction.query.order_by(CashDrawerTransaction.created_at.desc()).all()
    return jsonify({"transactions": [t.to_dict() for t in txns]}), 200


@finance_bp.route("/cash-drawer/transactions", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def cash_transactions():
    txns = CashDrawerTransaction.query.order_by(CashDrawerTransaction.created_at.desc()).limit(100).all()
    return jsonify({"transactions": [t.to_dict() for t in txns]}), 200


@finance_bp.route("/cash-drawer/audit", methods=["GET"])
@jwt_required()
@role_required(["ADMIN"])
def cash_audit():
    txns = CashDrawerTransaction.query.order_by(CashDrawerTransaction.created_at).all()
    return jsonify({"audit": [t.to_dict() for t in txns]}), 200


@finance_bp.route("/cash-drawer/daily-summary", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def cash_daily_summary():
    from datetime import date, datetime
    from sqlalchemy import func, cast, Date
    today = date.today()
    txns = CashDrawerTransaction.query.filter(
        func.date(CashDrawerTransaction.created_at) == today
    ).all()
    total_in = sum(float(t.amount) for t in txns if t.transaction_type in ["ADD", "DEPOSIT"])
    total_out = sum(float(t.amount) for t in txns if t.transaction_type == "WITHDRAW")
    return jsonify({
        "date": str(today),
        "total_in": total_in,
        "total_out": total_out,
        "net": total_in - total_out,
        "closing_balance": get_current_balance()
    }), 200


@finance_bp.route("/cash-drawer/dashboard", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def cash_drawer_dashboard():
    today = datetime.utcnow().date()
    since_7 = datetime.utcnow() - timedelta(days=7)

    today_txns = CashDrawerTransaction.query.filter(
        func.date(CashDrawerTransaction.created_at) == today
    ).all()
    today_in = sum(float(t.amount) for t in today_txns if t.transaction_type in ["ADD", "DEPOSIT"])
    today_out = sum(float(t.amount) for t in today_txns if t.transaction_type == "WITHDRAW")

    week_txns = CashDrawerTransaction.query.filter(
        CashDrawerTransaction.created_at >= since_7
    ).all()
    week_in = sum(float(t.amount) for t in week_txns if t.transaction_type in ["ADD", "DEPOSIT"])
    week_out = sum(float(t.amount) for t in week_txns if t.transaction_type == "WITHDRAW")

    chart_rows = db.session.query(
        func.date(CashDrawerTransaction.created_at).label("date"),
        func.sum(
            db.case((CashDrawerTransaction.transaction_type.in_(["ADD", "DEPOSIT"]), CashDrawerTransaction.amount), else_=0)
        ).label("in_amount"),
        func.sum(
            db.case((CashDrawerTransaction.transaction_type == "WITHDRAW", CashDrawerTransaction.amount), else_=0)
        ).label("out_amount")
    ).filter(CashDrawerTransaction.created_at >= since_7).group_by(
        func.date(CashDrawerTransaction.created_at)
    ).order_by(func.date(CashDrawerTransaction.created_at)).all()

    recent = CashDrawerTransaction.query.order_by(CashDrawerTransaction.created_at.desc()).limit(5).all()

    return jsonify({
        "current_balance": get_current_balance(),
        "today": {"in": today_in, "out": today_out, "net": today_in - today_out},
        "this_week": {"in": week_in, "out": week_out, "net": week_in - week_out},
        "total_transactions": CashDrawerTransaction.query.count(),
        "chart": [
            {"date": str(r[0]), "in": float(r[1] or 0), "out": float(r[2] or 0)}
            for r in chart_rows
        ],
        "recent_transactions": [t.to_dict() for t in recent]
    }), 200


# ─── BANK ────────────────────────────────────────────────────────────────────

def _bank_balance():
    last = BankTransaction.query.order_by(BankTransaction.id.desc()).first()
    return float(last.balance_after) if last else 0.0


@finance_bp.route("/bank/balance", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def bank_balance():
    return jsonify({"balance": _bank_balance()}), 200


@finance_bp.route("/bank/statement", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def bank_statement():
    txns = BankTransaction.query.order_by(BankTransaction.created_at.desc()).all()
    return jsonify({"transactions": [t.to_dict() for t in txns]}), 200


@finance_bp.route("/bank/deposit", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def bank_deposit():
    data = request.get_json()
    balance = _bank_balance() + float(data["amount"])
    txn = BankTransaction(
        transaction_type="DEPOSIT",
        amount=data["amount"],
        balance_after=balance,
        reference=data.get("reference"),
        notes=data.get("notes"),
        performed_by=int(get_jwt_identity())
    )
    db.session.add(txn)
    db.session.commit()
    return jsonify({"message": "Bank deposit recorded", "balance": balance}), 200


@finance_bp.route("/bank/withdraw", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def bank_withdraw():
    data = request.get_json()
    current = _bank_balance()
    amount = float(data["amount"])
    if amount > current:
        return jsonify({"error": "Insufficient bank balance"}), 400
    balance = current - amount
    txn = BankTransaction(
        transaction_type="WITHDRAW",
        amount=amount,
        balance_after=balance,
        reference=data.get("reference"),
        notes=data.get("notes"),
        performed_by=int(get_jwt_identity())
    )
    db.session.add(txn)
    db.session.commit()
    return jsonify({"message": "Bank withdrawal recorded", "balance": balance}), 200


@finance_bp.route("/bank/transfers", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def bank_transfers():
    txns = BankTransaction.query.order_by(BankTransaction.created_at.desc()).all()
    return jsonify({"transfers": [t.to_dict() for t in txns]}), 200


@finance_bp.route("/bank/reconciliation", methods=["GET"])
@jwt_required()
@role_required(["ADMIN"])
def bank_reconciliation():
    unreconciled = BankTransaction.query.filter_by(is_reconciled=False).all()
    return jsonify({"unreconciled": [t.to_dict() for t in unreconciled]}), 200


@finance_bp.route("/bank/reconciliation/verify", methods=["POST"])
@jwt_required()
@role_required(["ADMIN"])
def verify_reconciliation():
    data = request.get_json()
    txn_ids = data.get("transaction_ids", [])
    BankTransaction.query.filter(BankTransaction.id.in_(txn_ids)).update(
        {"is_reconciled": True}, synchronize_session=False
    )
    db.session.commit()
    return jsonify({"message": f"{len(txn_ids)} transactions reconciled"}), 200


@finance_bp.route("/bank/dashboard", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def bank_dashboard():
    today = datetime.utcnow().date()
    month_start = today.replace(day=1)
    since_30 = datetime.utcnow() - timedelta(days=30)

    today_txns = BankTransaction.query.filter(
        func.date(BankTransaction.created_at) == today
    ).all()
    today_deposits = sum(float(t.amount) for t in today_txns if t.transaction_type == "DEPOSIT")
    today_withdrawals = sum(float(t.amount) for t in today_txns if t.transaction_type == "WITHDRAW")

    month_txns = BankTransaction.query.filter(
        BankTransaction.created_at >= month_start
    ).all()
    month_deposits = sum(float(t.amount) for t in month_txns if t.transaction_type == "DEPOSIT")
    month_withdrawals = sum(float(t.amount) for t in month_txns if t.transaction_type == "WITHDRAW")

    total_charges = db.session.query(func.sum(BankCharge.amount)).scalar() or 0

    chart_rows = db.session.query(
        func.date(BankTransaction.created_at).label("date"),
        func.sum(
            db.case((BankTransaction.transaction_type == "DEPOSIT", BankTransaction.amount), else_=0)
        ).label("deposits"),
        func.sum(
            db.case((BankTransaction.transaction_type == "WITHDRAW", BankTransaction.amount), else_=0)
        ).label("withdrawals")
    ).filter(BankTransaction.created_at >= since_30).group_by(
        func.date(BankTransaction.created_at)
    ).order_by(func.date(BankTransaction.created_at)).all()

    recent = BankTransaction.query.order_by(BankTransaction.created_at.desc()).limit(5).all()

    return jsonify({
        "current_balance": _bank_balance(),
        "today": {
            "deposits": today_deposits,
            "withdrawals": today_withdrawals,
            "net": today_deposits - today_withdrawals
        },
        "this_month": {
            "deposits": month_deposits,
            "withdrawals": month_withdrawals,
            "net": month_deposits - month_withdrawals
        },
        "total_transactions": BankTransaction.query.count(),
        "pending_reconciliation": BankTransaction.query.filter_by(is_reconciled=False).count(),
        "total_bank_charges": float(total_charges),
        "chart": [
            {"date": str(r[0]), "deposits": float(r[1] or 0), "withdrawals": float(r[2] or 0)}
            for r in chart_rows
        ],
        "recent_transactions": [t.to_dict() for t in recent]
    }), 200


# PUT /expenses/:id
@finance_bp.route("/expenses/<int:expense_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_expense(expense_id):
    from flask_jwt_extended import get_jwt_identity

    expense = Expense.query.get_or_404(expense_id)
    data = request.get_json()

    old_amount = float(expense.amount)
    new_amount = float(data.get("amount", old_amount))
    difference = new_amount - old_amount

    for field in [
        "category",
        "description",
        "amount",
        "payment_source",
        "reference"
    ]:
        if field in data:
            setattr(expense, field, data[field])

    payment_source = expense.payment_source.upper()

    if difference != 0:

        if payment_source == "CASH":

            if difference > 0:
                result = add_transaction(
                    "WITHDRAW",
                    difference,
                    notes=f"Expense Update #{expense.id}",
                    performed_by=int(get_jwt_identity())
                )

                if "error" in result:
                    db.session.rollback()
                    return jsonify(result), 400

            else:
                add_transaction(
                    "DEPOSIT",
                    abs(difference),
                    notes=f"Expense Update Refund #{expense.id}",
                    performed_by=int(get_jwt_identity())
                )

        elif payment_source == "BANK":

            last = BankTransaction.query.order_by(
                BankTransaction.id.desc()
            ).first()

            balance = float(last.balance_after) if last else 0

            if difference > 0:

                if difference > balance:
                    db.session.rollback()
                    return jsonify({
                        "error": "Insufficient bank balance"
                    }), 400

                new_balance = balance - difference
                txn_type = "WITHDRAW"

            else:

                new_balance = balance + abs(difference)
                txn_type = "DEPOSIT"

            db.session.add(
                BankTransaction(
                    transaction_type=txn_type,
                    amount=abs(difference),
                    balance_after=new_balance,
                    reference=expense.reference,
                    notes=f"Expense Update #{expense.id}",
                    performed_by=int(get_jwt_identity())
                )
            )

    db.session.commit()

    return jsonify({
        "message": "Expense updated",
        "expense": expense.to_dict()
    }), 200

# DELETE /expenses/:id
@finance_bp.route("/expenses/<int:expense_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN"])
def delete_expense(expense_id):
    from flask_jwt_extended import get_jwt_identity

    expense = Expense.query.get_or_404(expense_id)

    amount = float(expense.amount)
    payment_source = expense.payment_source.upper()

    if payment_source == "CASH":

        add_transaction(
            "DEPOSIT",
            amount,
            notes=f"Expense Deleted #{expense.id}",
            performed_by=int(get_jwt_identity())
        )

    elif payment_source == "BANK":

        last = BankTransaction.query.order_by(
            BankTransaction.id.desc()
        ).first()

        balance = float(last.balance_after) if last else 0

        db.session.add(
            BankTransaction(
                transaction_type="DEPOSIT",
                amount=amount,
                balance_after=balance + amount,
                reference=expense.reference,
                notes=f"Expense Deleted #{expense.id}",
                performed_by=int(get_jwt_identity())
            )
        )

    db.session.delete(expense)
    db.session.commit()

    return jsonify({
        "message": "Expense deleted"
    }), 200


@finance_bp.route("/finance/orders", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def finance_orders():

    orders = Order.query.filter(
        Order.payment_status == "PAID",
        Order.status == "DELIVERED"
    ).order_by(Order.created_at.desc()).all()

    data = []

    for order in orders:

        amount = float(order.total or 0)

        payment = (order.payment_method or "").upper()

        if payment == "COD":

            already = CashDrawerTransaction.query.filter_by(
                reference=f"ORDER-{order.id}"
            ).first()

            if not already:

                add_transaction(
                    transaction_type="DEPOSIT",
                    amount=amount,
                    notes=f"Order #{order.id}",
                    performed_by=int(get_jwt_identity())
                )

        else:

            already = BankTransaction.query.filter_by(
                reference=f"ORDER-{order.id}"
            ).first()

            if not already:

                balance = _bank_balance() + amount

                txn = BankTransaction(
                    transaction_type="DEPOSIT",
                    amount=amount,
                    balance_after=balance,
                    reference=f"ORDER-{order.id}",
                    notes=f"Order #{order.id}",
                    performed_by=int(get_jwt_identity())
                )

                db.session.add(txn)
        customer_name = ""

        if order.customer:
            customer_name = f"{order.customer.first_name} {order.customer.last_name}"
        

        data.append({

            "order_id": order.id,
            "customer": customer_name,
            "payment_method": payment,
            "amount": amount,
            "status": order.status,
            "payment_status": order.payment_status,
            "created_at": order.created_at

        })

    db.session.commit()

    return jsonify(data), 200


@finance_bp.route("/driver-settlements", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def driver_settlements():

    orders = Order.query.filter(
        Order.status == "DELIVERED"
    ).order_by(Order.created_at.desc()).all()

    result = []

    for order in orders:

        if not order.driver:
            continue

        result.append({

            "order_id": order.id,
            "driver_id": order.driver.id,
            "driver_name": (
              f"{order.driver.first_name} {order.driver.last_name}"
              if order.driver else ""
            ),
            "customer": (
              f"{order.customer.first_name} {order.customer.last_name}"
              if order.customer else ""
             ),
            "delivery_fee": float(order.delivery_charge or 0),
            "payment_method": order.payment_method,
            "delivered_at": order.updated_at

        })

    return jsonify(result), 200