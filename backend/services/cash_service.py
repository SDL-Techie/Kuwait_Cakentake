from extensions import db
from models.misc import CashDrawerTransaction


def get_current_balance():
    last = CashDrawerTransaction.query.order_by(
        CashDrawerTransaction.id.desc()
    ).first()
    return float(last.balance_after) if last else 0.0


def add_transaction(transaction_type, amount, notes=None, reference=None, performed_by=None):
    balance = get_current_balance()

    if transaction_type == "WITHDRAW" or transaction_type == "DEPOSIT_TO_BANK":
        if amount > balance:
            return {"error": "Insufficient balance in cash drawer"}
        new_balance = balance - amount
    else:
        new_balance = balance + amount

    tx = CashDrawerTransaction(
        transaction_type=transaction_type,
        amount=amount,
        balance_after=new_balance,
        reference=reference,
        notes=notes,
        performed_by=performed_by
    )
    db.session.add(tx)
    db.session.commit()
    return {"success": True, "balance": new_balance, "transaction": tx.to_dict()}
