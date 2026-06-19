from pydantic import BaseModel, Field
from typing import List, Optional

class MeasureData(BaseModel):
    username: str
    ip: str
    sensor: str
    measure: str
    timestamp: int
    date: str
    real_value: Optional[float] = None
    digital_value: Optional[int] = None
    jurisdiction: Optional[str] = 'EU'

class BaseStats(BaseModel):
    end_date: str
    end_timestamp: int
    init_date: str
    init_timestamp: int
    ip: str
    measure: str
    n_samples: int
    sensor: str
    time_span: int
    username: str
    jurisdiction: Optional[str] = 'EU'

class NumericStats(BaseStats):
    max_value: float
    min_value: float
    mean_value: float
    std_deviation: float
    real_values: List[float]

class LightStats(BaseStats):
    mean_value: float
    digital_values: List[int]
