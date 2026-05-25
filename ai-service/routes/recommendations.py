from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from engine.ranking_engine import recomendar

router = APIRouter()

# =========================================================
# 📦 MODELO DE INPUT (lo que viene del frontend)
# =========================================================
class UserFilters(BaseModel):
    tipo_viaje: str
    presupuesto: str
    compania: str
    clima: str
    duracion: str


# =========================================================
# 🧠 ENDPOINT PRINCIPAL DE RECOMENDACIONES
# =========================================================
@router.post("/recommendations")
def get_recommendations(filters: UserFilters):

    try:
        user = filters.dict()

        results = recomendar(user, top_n=3)

        # convertir dataframe a JSON limpio
        response = results.to_dict(orient="records")

        return {
            "bestMatch": response[0] if len(response) > 0 else None,
            "recommendations": response
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error en motor de recomendaciones: {str(e)}"
        )