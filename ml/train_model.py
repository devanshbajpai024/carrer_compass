import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
import joblib

# Paths to dataset CSV files
TRAIN_CSV = os.path.abspath('data/recommendation_training.csv')
VAL_CSV = os.path.abspath('data/recommendation_validation.csv')
TEST_CSV = os.path.abspath('data/recommendation_test.csv')

def load_data(csv_path):
    """Load CSV and split into features and label."""
    df = pd.read_csv(csv_path)
    # Target column
    y = df['label']
    # Drop identifiers and target
    X = df.drop(columns=['student_id', 'opportunity_id', 'label'])
    # Simple preprocessing: fill missing numeric values with median, categorical with empty string
    for col in X.columns:
        if pd.api.types.is_numeric_dtype(X[col]):
            X[col] = X[col].fillna(X[col].median())
        else:
            X[col] = X[col].fillna('')
    # Encode categorical columns using one‑hot encoding (pandas get_dummies)
    X = pd.get_dummies(X, drop_first=True)
    return X, y

def main():
    # Load training data
    X_train, y_train = load_data(TRAIN_CSV)
    # Load validation data
    X_val, y_val = load_data(VAL_CSV)
    # Align columns between train and validation (in case of missing dummy columns)
    X_val = X_val.reindex(columns=X_train.columns, fill_value=0)

    # Train a RandomForest classifier (quick, non‑deep‑learning baseline)
    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    # Validation predictions
    val_pred = clf.predict(X_val)
    acc = accuracy_score(y_val, val_pred)
    print(f"Validation Accuracy: {acc:.4f}")
    print("Classification Report:\n", classification_report(y_val, val_pred))
    print("Confusion Matrix:\n", confusion_matrix(y_val, val_pred))

    # Save the trained model for later use
    os.makedirs('models', exist_ok=True)
    model_path = os.path.abspath('models/recommendation_model.joblib')
    joblib.dump(clf, model_path)
    print(f"Model saved to {model_path}")

if __name__ == '__main__':
    main()
