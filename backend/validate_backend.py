"""Static backend validation that does not require a running database."""
from __future__ import annotations

import ast
import collections
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SKIP_PARTS = {"venv", ".venv", "__pycache__"}


def python_files():
    return [p for p in ROOT.rglob("*.py") if not SKIP_PARTS.intersection(p.parts)]


def check_syntax(files):
    errors = []
    trees = {}
    for path in files:
        try:
            trees[path] = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
        except Exception as exc:
            errors.append(f"{path.relative_to(ROOT)}: {exc}")
    return trees, errors


def check_local_imports(trees):
    modules = set()
    for path in trees:
        rel = path.relative_to(ROOT).with_suffix("")
        if rel.name == "__init__":
            rel = rel.parent
        modules.add(".".join(rel.parts))

    local_roots = {"models", "routes", "services", "middleware", "constants", "seeders", "tasks", "utils"}
    errors = []
    for path, tree in trees.items():
        for node in ast.walk(tree):
            if not isinstance(node, ast.ImportFrom) or node.level or not node.module:
                continue
            if node.module.split(".")[0] not in local_roots:
                continue
            if node.module not in modules and not any(m.startswith(node.module + ".") for m in modules):
                errors.append(f"{path.relative_to(ROOT)}:{node.lineno}: missing {node.module}")
    return errors


def check_duplicate_routes(trees):
    errors = []
    for path, tree in trees.items():
        if "routes" not in path.parts:
            continue
        routes = collections.defaultdict(list)
        for node in ast.walk(tree):
            if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                continue
            for decorator in node.decorator_list:
                if not (isinstance(decorator, ast.Call) and isinstance(decorator.func, ast.Attribute)):
                    continue
                if decorator.func.attr != "route" or not decorator.args:
                    continue
                route_arg = decorator.args[0]
                if not isinstance(route_arg, ast.Constant) or not isinstance(route_arg.value, str):
                    continue
                methods = ["GET"]
                for keyword in decorator.keywords:
                    if keyword.arg == "methods" and isinstance(keyword.value, (ast.List, ast.Tuple)):
                        methods = [item.value for item in keyword.value.elts if isinstance(item, ast.Constant)]
                for method in methods:
                    routes[(method, route_arg.value)].append((node.name, node.lineno))
        for key, declarations in routes.items():
            if len(declarations) > 1:
                errors.append(f"{path.relative_to(ROOT)}: duplicate {key}: {declarations}")
    return errors


def main():
    files = python_files()
    trees, syntax_errors = check_syntax(files)
    errors = syntax_errors + check_local_imports(trees) + check_duplicate_routes(trees)
    print(f"Python files checked: {len(files)}")
    if errors:
        print("VALIDATION FAILED")
        for error in errors:
            print("-", error)
        raise SystemExit(1)
    print("VALIDATION PASSED")


if __name__ == "__main__":
    main()
