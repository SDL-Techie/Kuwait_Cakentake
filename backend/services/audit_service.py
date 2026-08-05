from extensions import db
from models.misc import AuditLog
from flask import request as flask_request


def log_action(user_id, action, module=None, reference_id=None, reference_type=None, details=None):
    try:
        ip = flask_request.remote_addr
    except Exception:
        ip = None

    log = AuditLog(
        user_id=user_id,
        action=action,
        module=module,
        reference_id=reference_id,
        reference_type=reference_type,
        details=details,
        ip_address=ip
    )
    db.session.add(log)
    db.session.commit()
    return log
