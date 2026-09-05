# Baseline vs ML Model Comparison

## Objective
Compare the rule‑based baseline (interpreted via the documented `labelFromFeatures` rules) with the trained RandomForest ML model on the untouched test set (200 examples).

## Baseline scoring
The baseline engine produces a continuous `matchScore` (0‑100) with no inherent 0‑4 mapping. For this comparison we use the project‑provided `labelFromFeatures` function (see `js/data/generateTrainingData.js`) to convert the derived features into the discrete classes 0‑4.

## ML model
The ML model (`models/recommendation_model.joblib`) was trained on the synthetic training data and predicts the same 0‑4 classes.

## Test data
Exactly 200 rows from `data/recommendation_test.csv` are used for both systems. The ground‑truth column is `label`.

## Metrics
Metrics computed: Accuracy, per‑class Precision/Recall/F1, Macro‑average, Weighted‑average, and Confusion Matrix.

### Baseline results
* Accuracy: `0.9900`

Per‑class results:
- Class 0: precision=1.000, recall=1.000, f1=1.000, support=119
- Class 1: precision=1.000, recall=1.000, f1=1.000, support=43
- Class 2: precision=1.000, recall=1.000, f1=1.000, support=19
- Class 3: precision=0.750, recall=1.000, f1=0.857, support=6
- Class 4: precision=1.000, recall=0.846, f1=0.917, support=13

Macro avg: precision=0.950, recall=0.969, f1=0.955
Weighted avg: precision=0.993, recall=0.990, f1=0.990

Confusion Matrix:
```
119, 0, 0, 0, 0
0, 43, 0, 0, 0
0, 0, 19, 0, 0
0, 0, 0, 6, 0
0, 0, 0, 2, 11
```

### ML model results
* Accuracy: `0.9950`

Per‑class results:
- Class 0: precision=1.000, recall=1.000, f1=1.000, support=119
- Class 1: precision=1.000, recall=1.000, f1=1.000, support=43
- Class 2: precision=1.000, recall=1.000, f1=1.000, support=19
- Class 3: precision=0.857, recall=1.000, f1=0.923, support=6
- Class 4: precision=1.000, recall=0.923, f1=0.960, support=13

Macro avg: precision=0.971, recall=0.985, f1=0.977
Weighted avg: precision=0.996, recall=0.995, f1=0.995

Confusion Matrix:
```
119, 0, 0, 0, 0
0, 43, 0, 0, 0
0, 0, 19, 0, 0
0, 0, 0, 6, 0
0, 0, 0, 1, 12
```

## Comparison
* Accuracy improvement: `0.0050`

The ML model shows higher (or equal) macro/weighted scores across the board, indicating overall better classification performance on the synthetic test set.

## Limitations
- Both systems are evaluated on synthetic data generated with the same labeling rules, which may not reflect real‑world distributions.
- The baseline’s original `matchScore` is not directly comparable to the ML classes; we rely on the documented rule‑based conversion.

## Conclusion
The ML model outperforms the rule‑based baseline on the test set.