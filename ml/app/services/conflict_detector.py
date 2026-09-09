"""
Conflict Detection & Shadow Block Opportunity Finder
Identifies schedule clashes between train operations and departmental maintenance requests.
"""

from typing import List, Dict, Any

class ConflictDetector:
    def evaluate_conflicts(self, requests: List[Dict[str, Any]], trains: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        conflicts = []
        
        # Check passenger clash
        for req in requests:
            for train in trains:
                if train.get("priority_rank", 10) == 1:
                    # Premium train check
                    train_time = train.get("departure", "06:00")
                    req_start = req.get("start_time", "02:00")
                    req_end = req.get("end_time", "06:00")
                    
                    if req_start <= train_time <= req_end:
                        conflicts.append({
                            "conflict_type": "PREMIUM_TRAIN_CLASH",
                            "severity": "CRITICAL",
                            "request_id": req.get("id", "UNKNOWN"),
                            "train_number": train.get("train_no", "12002"),
                            "train_name": train.get("name", "Express"),
                            "message": f"Block overlaps with high priority passenger train {train.get('name')} at {train_time}",
                            "recommendation": "Advance block completion by 30 mins before train section entry."
                        })

        return conflicts

detector = ConflictDetector()
