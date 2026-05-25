import pandas as pd
import numpy as np

# =========================================================
# 📦 CARGA DATASET (se carga una sola vez)
# =========================================================
df = pd.read_excel("data/dataset_turismo_bogota_50k_rating.xlsx")


# =========================================================
# 🧠 KEYWORDS PARA BOOST SEMÁNTICO
# =========================================================
NATURALEZA_KW = ["cerro", "senderismo", "quebrada", "humedal", "parque", "reserva"]
CULTURA_KW = ["museo", "tour", "candelaria", "botero", "oro", "histórico", "teatro"]
GASTRONOMIA_KW = ["gastron", "café", "brunch", "mercado", "postres", "cerveza", "restaurante"]
NOCTURNA_KW = ["bar", "zona t", "rooftop", "nocturna", "andrés"]
RELAX_KW = ["spa", "relaj", "hotel", "tarde", "boutique"]


# =========================================================
# 🎯 SCORING INDIVIDUAL
# =========================================================
def score_plan(row, user):

    score = 3.0

    plan = str(row["plan_turistico_bogota"]).lower()

    # -------------------------------------------------
    # MATCH DIRECTO (ALTO PESO)
    # -------------------------------------------------
    if user["tipo_viaje"] == row["tipo_viaje"]:
        score += 2.0

    if user["presupuesto"] == row["presupuesto_cop"]:
        score += 1.2

    if user["compania"] == row["compania"]:
        score += 0.8

    if user["clima"] == row["clima_preferido"]:
        score += 0.5

    if user["duracion"] == row["duracion"]:
        score += 0.7

    # -------------------------------------------------
    # 🔥 BOOST SEMÁNTICO
    # -------------------------------------------------
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

    # -------------------------------------------------
    # 🧠 BONUS DE CONTEXTO
    # -------------------------------------------------
    if user["compania"] == "familia" and "museo" in plan:
        score += 0.5

    if user["compania"] == "pareja" and "rooftop" in plan:
        score += 0.5

    if user["compania"] == "amigos" and ("bar" in plan or "zona t" in plan):
        score += 0.5

    if user["presupuesto"] == "alto":
        score += 0.3

    # -------------------------------------------------
    # 🎲 RANDOM CONTROLADO (evita empates)
    # -------------------------------------------------
    score += np.random.normal(0, 0.15)

    return round(score, 3)


# =========================================================
# 🏆 MOTOR PRINCIPAL DE RECOMENDACIÓN
# =========================================================
def recomendar(user, top_n=3):

    df_local = df.copy()

    # calcular score
    df_local["score"] = df_local.apply(
        lambda row: score_plan(row, user),
        axis=1
    )

    # -------------------------------------------------
    # 🔥 eliminar duplicados por plan
    # -------------------------------------------------
    df_best = (
        df_local
        .sort_values("score", ascending=False)
        .drop_duplicates(subset=["plan_turistico_bogota"])
    )

    # top final
    top = df_best.sort_values("score", ascending=False).head(top_n)

    return top[[
        "plan_turistico_bogota",
        "tipo_viaje",
        "presupuesto_cop",
        "compania",
        "clima_preferido",
        "duracion",
        "score"
    ]]