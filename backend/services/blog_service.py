import re
import math

from models.blog import Blog

WORDS_PER_MINUTE = 200
VALID_STATUSES = ("DRAFT", "PUBLISHED", "ARCHIVED")


def slugify(text: str) -> str:
    """'Chocolate Cake Recipe' -> 'chocolate-cake-recipe'"""
    text = (text or "").lower().strip()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = text.strip("-")
    return text or "post"


def generate_unique_slug(title: str, blog_id: int = None) -> str:
    """Appends -2, -3, ... until the slug is unique. Excludes `blog_id`
    itself from the collision check so updating a post without changing
    its title doesn't collide with itself."""
    base_slug = slugify(title)
    slug = base_slug
    counter = 2

    def _exists(candidate: str) -> bool:
        query = Blog.query.filter(Blog.slug == candidate)
        if blog_id:
            query = query.filter(Blog.id != blog_id)
        return query.first() is not None

    while _exists(slug):
        slug = f"{base_slug}-{counter}"
        counter += 1

    return slug


def calculate_reading_time(content: str) -> str:
    """'750 words' -> '4 min read'"""
    word_count = len((content or "").split())
    minutes = max(1, math.ceil(word_count / WORDS_PER_MINUTE))
    return f"{minutes} min read"


def validate_blog_payload(data: dict, is_update: bool = False) -> list:
    """Returns a list of human-readable error strings. Empty list == valid.

    On create, title/content are always required. On update, they're only
    checked if the caller is actually trying to change them (so a PUT that
    only touches `featured`, say, doesn't need to resend the whole post).
    """
    errors = []

    if not is_update or "title" in data:
        title = (data.get("title") or "").strip()
        if not title:
            errors.append("Title is required.")
        elif len(title) > 150:
            errors.append("Title must be 150 characters or fewer.")

    # if not is_update or "content" in data:
    #     content = (data.get("content") or "").strip()
    #     if not content:
    #         errors.append("Content is required.")
    #     elif len(content) < 100:
    #         errors.append("Content must be at least 100 characters.")
    if not is_update or "content" in data:
      content = (data.get("content") or "").strip()
      if not content:
        errors.append("Content is required.")

    short_description = (data.get("short_description") or "").strip()
    if short_description and len(short_description) > 300:
        errors.append("Short description must be 300 characters or fewer.")

    status = data.get("status")
    if status and status not in VALID_STATUSES:
        errors.append(f"Status must be one of {', '.join(VALID_STATUSES)}.")

    tags = data.get("tags")
    if tags is not None and not isinstance(tags, list):
        errors.append("Tags must be an array of strings.")

    return errors