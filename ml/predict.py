import sys, json, os
import joblib
import pandas as pd

# Load model
MODEL_PATH = os.path.abspath('models/recommendation_model.joblib')
model = joblib.load(MODEL_PATH)

# Load training columns for feature alignment (same as evaluate_test.py)
TRAIN_CSV = os.path.abspath('data/recommendation_training.csv')

def load_train_columns(csv_path):
    df = pd.read_csv(csv_path)
    X = df.drop(columns=['student_id', 'opportunity_id', 'label'], errors='ignore')
    # numeric fill
    for col in X.columns:
        if pd.api.types.is_numeric_dtype(X[col]):
            X[col] = X[col].fillna(X[col].median())
        else:
            X[col] = X[col].fillna('')
    X = pd.get_dummies(X, drop_first=True)
    return X.columns

TRAIN_COLS = load_train_columns(TRAIN_CSV)

def compute_derived(student, opp):
    # replicate generateTrainingData.computeDerived logic
    # skill gap analyzer is used in original JS; we approximate using skill match percentage
    # For simplicity, calculate skill_match_percentage as proportion of requiredSkills present in student_skills
    required = set(opp['requiredSkills'])
    student_skills = set(student['student_skills'].split(';'))
    matched = required.intersection(student_skills)
    skill_match_percentage = int(round(100 * len(matched) / len(required))) if required else 0
    interest_match = 1 if any(i in student['student_interests'].split(';') for i in opp['interests']) else 0
    career_goal_match = 1 if student['career_goal'].lower() == (opp.get('careerField') or '').lower() else 0
    eligibility_match = 1 if opp['eligibility'] == 'Open' or opp['eligibility'].lower() == student['eligibility'].lower() else 0
    # location logic same as JS
    if student['location_preference'] == 'Remote' and opp['location'] == 'Remote':
        location_match = 1
    elif student['location_preference'] != 'Remote' and opp['location'] != 'Remote' and student['location_preference'] == opp['location']:
        location_match = 1
    else:
        location_match = 0
    experience_match = 1 if int(student['experience']) >= int(opp['experienceRequired']) else 0
    return {
        'skill_match_percentage': skill_match_percentage,
        'interest_match': interest_match,
        'career_goal_match': career_goal_match,
        'eligibility_match': eligibility_match,
        'location_match': location_match,
        'experience_match': experience_match,
    }

def label_from_features(f):
    if f['eligibility_match'] == 0:
        return 0
    exp_ok = f['experience_match'] == 1
    if f['skill_match_percentage'] >= 80 and f['interest_match'] and f['career_goal_match'] and exp_ok:
        return 4
    if f['skill_match_percentage'] >= 60 and (f['interest_match'] + f['career_goal_match'] + int(exp_ok)) >= 2:
        return 3
    if f['skill_match_percentage'] >= 40:
        return 2
    if f['skill_match_percentage'] >= 20:
        return 1
    return 0

def prepare_features(row_dict):
    # row_dict should have same columns as training after one‑hot encoding
    df = pd.DataFrame([row_dict])
    # numeric fill already handled in row_dict
    df = pd.get_dummies(df, drop_first=True)
    df = df.reindex(columns=TRAIN_COLS, fill_value=0)
    return df

def main():
    # Expect JSON on stdin: {"student": {...}, "opportunity": {...}}
    input_data = json.load(sys.stdin)
    student = input_data['student']
    opp = input_data['opportunity']
    derived = compute_derived(student, opp)
    # Build feature dict matching training columns (excluding label columns)
    # Use same columns as training CSV after dropping IDs and label
    # We'll construct a dict with all original raw columns needed for model
    # The training data used raw fields plus derived ones; here we include derived fields directly
    # For simplicity, we reuse the same columns present in the test CSV (excluding label)
    # Load one test row to get column names
    sample_test = pd.read_csv(os.path.abspath('data/recommendation_test.csv')).iloc[0]
    cols = [c for c in sample_test.index if c not in ['student_id','opportunity_id','label']]
    row = {}
    for c in cols:
        if c in derived:
            row[c] = derived[c]
        else:
            # raw columns come directly from student / opp (they are already present in the CSV)
            # Map known column names
            if c.startswith('student_'):
                row[c] = student.get(c)
            elif c.startswith('opportunity_'):
                # opp keys are camelCase in JS but CSV uses snake_case; map manually
                mapping = {
                    'opportunity_id': opp['id'],
                    'required_skills': ';'.join(opp['requiredSkills']),
                    'opportunity_interests': ';'.join(opp['interests']),
                    'career_field': opp['careerField'],
                    'opportunity_type': opp['category'],
                    'opportunity_location': opp['location'],
                    'experience_required': opp['experienceRequired'],
                    'opportunity_eligibility': opp['eligibility']
                }
                # find matching key
                for k,v in mapping.items():
                    if k == c:
                        row[c] = v
            else:
                row[c] = None
    X = prepare_features(row)
    pred = model.predict(X)[0]
    # output JSON with prediction and human readable label
    label_map = {0:'Poor Match',1:'Weak Match',2:'Moderate Match',3:'Good Match',4:'Excellent Match'}
    output = {'prediction': int(pred), 'recommendation': label_map[int(pred)]}
    json.dump(output, sys.stdout)

if __name__ == '__main__':
    main()
