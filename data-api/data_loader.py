import json
from pathlib import Path
from functools import lru_cache
from typing import Any, Dict, List

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / 'source_data'

@lru_cache(maxsize=1)
def load_speakers() -> List[Dict[str, Any]]:
    path = BASE_DIR / 'source_data' / 'speakers' / 'snt2025_speaker_profiles.json'
    if path.exists():
        return json.loads(path.read_text())
    return []

@lru_cache(maxsize=1)
def load_program() -> Dict[str, Any]:
    path = BASE_DIR / 'source_data' / 'event_info' / 'snt2025_program.json'
    if path.exists():
        return json.loads(path.read_text())
    return {} 