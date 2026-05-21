def build_default_photo_url(name: str) -> str:
    safe_name = name.strip() or "User"
    return f"https://ui-avatars.com/api/?background=random&name={safe_name.replace(' ', '+')}"

