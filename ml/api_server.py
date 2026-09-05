import os
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
import threading
import joblib
import pandas as pd

MODEL_PATH = os.path.abspath('models/recommendation_model.joblib')
TRAIN_CSV = os.path.abspath('data/recommendation_training.csv')

# Load model and training columns once at startup
model = joblib.load(MODEL_PATH)

def load_train_columns(csv_path):
    df = pd.read_csv(csv_path)
    X = df.drop(columns=['student_id','opportunity_id','label'], errors='ignore')
    for col in X.columns:
        if pd.api.types.is_numeric_dtype(X[col]):
            X[col] = X[col].fillna(X[col].median())
        else:
            X[col] = X[col].fillna('')
    X = pd.get_dummies(X, drop_first=True)
    return X.columns

TRAIN_COLS = load_train_columns(TRAIN_CSV)

# Helper functions (same as in ml/predict.py)

def compute_derived(student, opp):
    required = set(opp['requiredSkills'])
    student_skills = set(student['student_skills'].split(';'))
    matched = required.intersection(student_skills)
    skill_match_percentage = int(round(100 * len(matched) / len(required))) if required else 0
    interest_match = 1 if any(i in student['student_interests'].split(';') for i in opp['interests']) else 0
    career_goal_match = 1 if student['career_goal'].lower() == (opp.get('careerField') or '').lower() else 0
    eligibility_match = 1 if opp['eligibility'] == 'Open' or opp['eligibility'].lower() == student['eligibility'].lower() else 0
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
    df = pd.DataFrame([row_dict])
    df = pd.get_dummies(df, drop_first=True)
    df = df.reindex(columns=TRAIN_COLS, fill_value=0)
    return df

class PredictionHandler(BaseHTTPRequestHandler):
    def _set_json(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
    def do_POST(self):
        if self.path != '/predict':
            self.send_error(404, 'Not Found')
            return
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        try:
            data = json.loads(body)
            student = data['student']
            opp = data['opportunity']
            derived = compute_derived(student, opp)
            # Build feature dict matching training CSV columns (excluding label)
            sample_test = pd.read_csv(os.path.abspath('data/recommendation_test.csv')).iloc[0]
            cols = [c for c in sample_test.index if c not in ['student_id','opportunity_id','label']]
            row = {}
            for c in cols:
                if c in derived:
                    row[c] = derived[c]
                else:
                    if c.startswith('student_'):
                        row[c] = student.get(c)
                    elif c.startswith('opportunity_'):
                        # map JS camelCase keys to snake_case CSV columns
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
                        row[c] = mapping.get(c)
                    else:
                        row[c] = None
            X = prepare_features(row)
            ml_pred = int(model.predict(X)[0])
            label_map = {0:'Poor Match',1:'Weak Match',2:'Moderate Match',3:'Good Match',4:'Excellent Match'}
            response = {'prediction': ml_pred, 'recommendation': label_map[ml_pred]}
            self._set_json()
            self.wfile.write(json.dumps(response).encode('utf-8'))
        except Exception as e:
            self.send_error(500, f'Error processing request: {e}')

def run_server(host='127.0.0.1', port=5000):
    server = HTTPServer((host, port), PredictionHandler)
    print(f'ML prediction server listening on http://{host}:{port}')
    server.serve_forever()

if __name__ == '__main__':
    run_server()
