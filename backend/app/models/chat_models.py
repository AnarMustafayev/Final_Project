from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Union
from datetime import datetime

# Request models
class CreateChatRequest(BaseModel):
    title: Optional[str] = None

class CreateMessageRequest(BaseModel):
    message_text: str
    generated_sql: Optional[str] = None

class CreateVisualizationRequest(BaseModel):
    visualization_type: str
    data_json: Union[Dict[str, Any], List[Any]]  # Can be either dict or list
    chart_config: Optional[Dict[str, Any]] = None

class UpdateChatTitleRequest(BaseModel):
    title: str

# Response models
class ChatVisualization(BaseModel):
    viz_id: int
    message_id: int
    visualization_type: str
    data_json: Union[Dict[str, Any], List[Any]]  # Can be either dict or list
    chart_config: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True

class ChatMessage(BaseModel):
    message_id: int
    chat_id: int
    message_text: str
    generated_sql: Optional[str]
    message_order: int
    created_at: datetime
    visualizations: List[ChatVisualization] = []

    class Config:
        from_attributes = True

class Chat(BaseModel):
    chat_id: int
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = 0

    class Config:
        from_attributes = True

class ChatDetail(BaseModel):
    chat_id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessage] = []

    class Config:
        from_attributes = True

# Combined request model for creating message with visualization
class CreateMessageWithVisualizationRequest(BaseModel):
    message_text: str
    generated_sql: Optional[str] = None
    visualization: Optional[CreateVisualizationRequest] = None