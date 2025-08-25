from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints

app = FastAPI(
    title="Data Analizi API",
    description="Azərbaycan dilində sorğuları SQL-ə çevirən və nəticələri qaytaran API",
    version="1.0.0"
)

# CORS (Cross-Origin Resource Sharing) konfiqurasiyası
# Bu, frontend-in (fərqli portda işləyəcək) backend-ə sorğu göndərməsinə icazə verir.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Real layihədə bunu frontend-in adresi ilə əvəz edin (məsələn, "http://localhost:3000")
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API endpoint-lərini əsas tətbiqə daxil edirik
app.include_router(endpoints.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Data Analizi API-nə xoş gəlmisiniz!"}