from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import recommendations

app = FastAPI(
    title="AI Recommendation Service",
    description="Motor de recomendaciones para planes",
    version="1.0.0"
)

# 🌐 CORS (para conectar con Node/React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # luego lo restringes en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔌 Registrar rutas
app.include_router(recommendations.router)


# 🧪 Health check
@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "ai-service",
        "message": "AI Recommendation Service running"
    }