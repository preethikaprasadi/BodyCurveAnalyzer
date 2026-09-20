"""
Data validation schemas and boundary rules for BodyCurve Analyzer.
Ensures both structural integrity and biological plausibility.
"""

from typing import Dict, Any, Tuple, Optional, List

# Anthropometrically grounded validation boundaries
MEASUREMENT_BOUNDS = {
    "height": {"min": 100.0, "max": 250.0, "unit": "cm", "label": "Height"},
    "weight": {"min": 25.0, "max": 300.0, "unit": "kg", "label": "Weight"},
    "shoulder": {"min": 20.0, "max": 80.0, "unit": "cm", "label": "Shoulder width"},
    "bust": {"min": 40.0, "max": 200.0, "unit": "cm", "label": "Bust/Chest"},
    "waist": {"min": 30.0, "max": 200.0, "unit": "cm", "label": "Waist"},
    "hip": {"min": 40.0, "max": 220.0, "unit": "cm", "label": "Hip"},
}

REQUIRED_MEASUREMENT_FIELDS = list(MEASUREMENT_BOUNDS.keys())

def validate_measurements(data: Optional[Dict[str, Any]]) -> Tuple[bool, Optional[Dict[str, float]], Optional[List[str]]]:
    """
    Validate input measurement dictionary.
    
    Returns:
        (is_valid, parsed_measurements, error_messages)
    """
    if not isinstance(data, dict):
        return False, None, ["Request body must be a valid JSON object."]

    errors = []
    parsed = {}

    for field, rules in MEASUREMENT_BOUNDS.items():
        if field not in data or data[field] is None:
            errors.append(f"Missing required field: '{field}' ({rules['label']}).")
            continue

        raw_val = data[field]
        try:
            val = float(raw_val)
        except (ValueError, TypeError):
            errors.append(f"Field '{field}' must be a numeric value, got: '{raw_val}'.")
            continue

        if val < rules["min"] or val > rules["max"]:
            errors.append(
                f"Field '{field}' ({val} {rules['unit']}) is outside biologically plausible range "
                f"[{rules['min']} - {rules['max']} {rules['unit']}]."
            )
            continue

        parsed[field] = round(val, 2)

    if errors:
        return False, None, errors

    return True, parsed, None
