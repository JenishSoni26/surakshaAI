import sys
import os
import re
import html
import json
import joblib
import unicodedata
import numpy as np
from scipy.sparse import hstack

# Helper Regex Patterns for Special Tokens matching training
URL_REGEX = re.compile(r'https?://[^\s]+|\b[a-zA-Z0-9-]+\.(xyz|tk|ml|ga|cf|gq|buzz|top|click|link|work|date|racing|review|online|site|info)\b', re.IGNORECASE)
PHONE_REGEX = re.compile(r'\b(\+91[\s-]?)?[6-9]\d{9}\b|\b\d{5}[\s-]?\d{5}\b')
EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
UPI_HANDLE_REGEX = re.compile(r'\b[a-zA-Z0-9.\-_]+@(ybl|paytm|axl|upi|sbi|okhdfcbank|okicici|oksbi|apl|fbl|ibl|kbl|barodampay|idfcbank)\b', re.IGNORECASE)
CURRENCY_REGEX = re.compile(r'Rs\.?|INR|₹|\$|£|€')
HTML_TAG_REGEX = re.compile(r'<[^>]+>')

def preprocess_text(text):
    if not isinstance(text, str):
        return ""
    text = html.unescape(text)
    text = HTML_TAG_REGEX.sub(' ', text)
    text = unicodedata.normalize('NFKC', text)
    text = URL_REGEX.sub(' URL_TOKEN ', text)
    text = PHONE_REGEX.sub(' PHONE_TOKEN ', text)
    text = EMAIL_REGEX.sub(' EMAIL_TOKEN ', text)
    text = UPI_HANDLE_REGEX.sub(' UPI_TOKEN ', text)
    text = CURRENCY_REGEX.sub(' CURRENCY_TOKEN ', text)
    return re.sub(r'\s+', ' ', text).strip()

def sigmoid(x):
    return 1.0 / (1.0 + np.exp(-x))

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, "baseline_model.pkl")
    word_vec_path = os.path.join(script_dir, "word_vectorizer.pkl")
    char_vec_path = os.path.join(script_dir, "char_vectorizer.pkl")

    try:
        model = joblib.load(model_path)
        word_vec = joblib.load(word_vec_path)
        char_vec = joblib.load(char_vec_path)
        # Notify parent daemon is ready
        sys.stdout.write(json.dumps({"status": "READY"}) + "\n")
        sys.stdout.flush()
    except Exception as e:
        sys.stdout.write(json.dumps({"status": "ERROR", "message": str(e)}) + "\n")
        sys.stdout.flush()
        sys.exit(1)

    while True:
        line = sys.stdin.readline()
        if not line:
            break
        try:
            req = json.loads(line.strip())
            req_id = req.get("id", "req")
            text = req.get("text", "")
            
            clean_t = preprocess_text(text)
            X_word = word_vec.transform([clean_t])
            X_char = char_vec.transform([clean_t])
            X_hybrid = hstack([X_word, X_char]).tocsr()
            
            margin = float(model.decision_function(X_hybrid)[0])
            pred_class = "SCAM" if margin > 0 else "SAFE"
            
            # Sigmoid calibration: probability of SCAM class
            prob_scam = float(sigmoid(margin))
            
            # Confidence score (0.50 to 1.00 for the predicted class)
            confidence = prob_scam if pred_class == "SCAM" else (1.0 - prob_scam)
            
            res = {
                "id": req_id,
                "prediction": pred_class,
                "confidence": round(confidence, 4),
                "prob_scam": round(prob_scam, 4),
                "raw_score": round(margin, 4),
                "model_version": "LinearSVC-Hybrid-v1.0"
            }
            sys.stdout.write(json.dumps(res) + "\n")
            sys.stdout.flush()
        except Exception as err:
            sys.stdout.write(json.dumps({"id": req.get("id", "req"), "error": str(err), "prediction": "SAFE", "confidence": 0.5, "raw_score": 0.0}) + "\n")
            sys.stdout.flush()

if __name__ == "__main__":
    main()
