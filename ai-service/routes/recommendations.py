from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from engine.ranking_engine import recomendar

router = APIRouter()

# =========================================================
# 📦 INPUT CONTRACT (NODE ↔ PYTHON)
# =========================================================
class UserFilters(BaseModel):
    tipo_viaje: str
    presupuesto: str

    # 🔥 FIXED: unified naming (NO "clima/duracion" legacy)
    companions: str
    climate: str
    duration: str

    interestsText: str | None = None


# =========================================================
# 🧠 ENDPOINT PRINCIPAL
# =========================================================
@router.post("/recommendations")
def get_recommendations(filters: UserFilters):

    try:
        # Pydantic v2
        user = filters.model_dump()

        results = recomendar(user, top_n=3)

        response = results.to_dict(orient="records")

        return {
            "bestMatch": response[0] if response else None,
            "recommendations": response
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error en motor de recomendaciones: {str(e)}"
        )