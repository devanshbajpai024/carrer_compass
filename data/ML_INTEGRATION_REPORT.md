# ML + AI Integration Report

## Architecture

Frontend
↓
Express Backend
↓
Rule-Based Engine
+
Random Forest ML
+
Groq AI
↓
Combined Recommendation

## Components

- **Rule-based recommender**: Existing engine in `recommendationEngine.js` untouched. Computes weighted scores based on matching schemas.
- **Random Forest model**: Served securely by the python app.
- **Python prediction service**: Runs on `http://127.0.0.1:5000/predict` and parses flat JSON to serve predictions from `recommendation_model.joblib`.
- **Express backend**: Hosts the integration endpoint orchestrating the combination of all 3 distinct services.
- **Existing Groq integration**: Extracted cleanly into `backend/src/services/aiService.js` to ensure the existing `aiController` and the new endpoint share one unified Groq client securely.
- **Production frontend**: Can seamlessly consume the augmented endpoint payload.

## Endpoint

**POST /api/recommendations/evaluate**

**Request Structure:**
```json
{
  "student": {
    "name": "Jane Doe",
    "skills": [{ "name": "Python", "level": 85 }],
    "interests": ["Machine Learning"],
    "careerGoals": ["AI Engineer"],
    "education": { "degree": "B.Tech" }
  },
  "opportunity": {
    "_id": "opp_test_123",
    "skills": [{ "skill": "Python" }, { "skill": "Machine Learning" }],
    "type": "INTERNSHIP"
  }
}
```

**Response Structure (Example Result):**
```json
{
  "success": true,
  "data": {
    "matchScore": 83,
    "mlPrediction": 0,
    "mlLabel": "Poor Match",
    "explanation": "You have a partial fit: your Python expertise meets the core requirement, but the lack of any Machine-Learning experience leaves a critical gap for this role. While your SQL skills are valuable, they don’t offset the missing ML knowledge. Consequently, the “poor match” rating is accurate.",
    "reasons": [
      "1 of 2 required skills match your profile",
      "Matches your indicated interests"
    ],
    "missingSkills": [
      "Machine Learning"
    ]
  }
}
```

## Error Handling

Graceful degradation is fully implemented:
- **ML Service Unavailable**: If the Python service goes offline, `mlPrediction` and `mlLabel` degrade safely to `null` and `"ML Unavailable"`. The request does not crash, and the rule-based engine continues to function.
- **Groq Unavailable / Rate-Limited**: If the Groq LLM API is unavailable, the backend safely catches the error on the server side and sets `explanation` to a safe fallback string containing the error (in dev) or `"AI explanation unavailable"`. The backend does not crash.

## Security

- `GROQ_API_KEY` (and `AI_API_KEY`) is kept **strictly server-side**.
- The `.env` file is safely ignored via `.gitignore`.
- No API keys or secrets are ever exposed to the frontend browser context.
- The `aiService.js` securely handles the injection from `process.env.AI_API_KEY`.

## Final Status

STEP 6 — COMPLETE
