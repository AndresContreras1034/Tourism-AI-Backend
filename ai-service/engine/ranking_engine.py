import pandas as pd
import numpy as np
import os

# =========================================================
# 📦 CARGA DATASET (robusto)
# =========================================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

df = pd.read_excel(
    os.path.join(BASE_DIR, "data", "dataset_turismo_bogota_50k_rating.xlsx")
)

# =========================================================
# 🧠 KEYWORDS
# =========================================================
NATURALEZA_KW = ["cerro", "senderismo", "quebrada", "humedal", "parque", "reserva"]
CULTURA_KW = ["museo", "tour", "candelaria", "botero", "oro", "histórico", "teatro"]
GASTRONOMIA_KW = ["gastron", "café", "brunch", "mercado", "postres", "cerveza", "restaurante"]
NOCTURNA_KW = ["bar", "zona t", "rooftop", "nocturna", "andrés"]
RELAX_KW = ["spa", "relaj", "hotel", "boutique"]

# =========================================================
# 🎯 SCORE PRINCIPAL
# =========================================================
def score_plan(row, user):

    score = 2.5

    plan = str(row["plan_turistico_bogota"]).lower()

    # =====================================================
    # 🔗 MATCH DIRECTO (CONSISTENTE CON NODE/PY)
    # =====================================================

    if user["tipo_viaje"] == row["tipo_viaje"]:
        score += 2.0

    if user["presupuesto"] == row["presupuesto_cop"]:
        score += 1.0

    # 🔥 companions (ANTES compania)
    if user["companions"] == row["compania"]:
        score += 0.8

    # 🔥 climate (ANTES clima)
    if user.get("climate") and user["climate"] == row["clima_preferido"]:
        score += 0.5

    # 🔥 duration (ANTES duracion)
    if user["duration"] == row["duracion"]:
        score += 0.7

    # =====================================================
    # 🔥 BOOST SEMÁNTICO
    # =====================================================
    def keyword_boost(keywords, weight):
        return weight if any(k in plan for k in keywords) else 0

    tipo = user["tipo_viaje"]

    if tipo == "naturaleza":
        score += keyword_boost(NATURALEZA_KW, 1.5)

    elif tipo == "cultural":
        score += keyword_boost(CULTURA_KW, 1.5)

    elif tipo == "gastronomia":
        score += keyword_boost(GASTRONOMIA_KW, 1.5)

    elif tipo == "vida_nocturna":
        score += keyword_boost(NOCTURNA_KW, 1.5)

    elif tipo == "relax":
        score += keyword_boost(RELAX_KW, 1.5)

    # =====================================================
    # 🧠 INTERESES (SAFE + FLEXIBLE)
    # =====================================================
    interests = user.get("interestsText", "").lower()

    if interests:
        if "naturaleza" in interests:
            score += keyword_boost(NATURALEZA_KW, 0.8)

        if "cultura" in interests:
            score += keyword_boost(CULTURA_KW, 0.8)

        if "gastronomía" in interests or "gastronomia" in interests:
            score += keyword_boost(GASTRONOMIA_KW, 0.8)

        if "nocturna" in interests:
            score += keyword_boost(NOCTURNA_KW, 0.8)

    # =====================================================
    # 🧠 CONTEXTO SOCIAL
    # =====================================================
    if user["companions"] == "family" and "museo" in plan:
        score += 0.5

    if user["companions"] == "couple" and "rooftop" in plan:
        score += 0.5

    if user["companions"] == "friends" and ("bar" in plan or "zona t" in plan):
        score += 0.5

    # =====================================================
    # 🎲 VARIACIÓN CONTROLADA
    # =====================================================
    score += np.random.normal(0, 0.12)

    return round(score, 3)

# =========================================================
# 🏆 MOTOR PRINCIPAL
# =========================================================
def recomendar(user, top_n=3):

    df_local = df.copy()

    df_local["score"] = df_local.apply(
        lambda row: score_plan(row, user),
        axis=1
    )

    df_best = (
        df_local
        .sort_values("score", ascending=False)
        .drop_duplicates(subset=["plan_turistico_bogota"])
    )

    top = df_best.head(top_n)

    return top[[
        "plan_turistico_bogota",
        "tipo_viaje",
        "presupuesto_cop",
        "compania",
        "clima_preferido",
        "duracion",
        "score"
    ]]