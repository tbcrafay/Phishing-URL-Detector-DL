import random
from typing import Dict, Any

class URLPredictor:
    def __init__(self):
        # This is where your loaded weights and character tokenizers will hang out later
        pass

    def analyze_textual_url(self, url: str) -> Dict[str, Any]:
        """
        Processes a raw URL string through the 1D CNN and BiLSTM frameworks.
        Generates classification predictions and returns architectural index weights.
        """
        # Lowercase string to run heuristic checks for mock testing
        test_url = url.lower()
        
        # Core phishing indicators
        suspicious_keywords = ["login", "verify", "secure", "update", "banking", "signin", "paypal"]
        has_suspicious_keyword = any(keyword in test_url for keyword in suspicious_keywords)
        has_ip_domain = any(char.isdigit() for char in test_url.split('/')[2]) if len(test_url.split('/')) > 2 else False
        has_excessive_subdomains = test_url.count('.') > 3

        # Heuristic rules to generate deterministic mock data for testing variations
        if has_suspicious_keyword or has_ip_domain or has_excessive_subdomains:
            # Simulate a strong positive phishing prediction match
            cnn_score = round(random.uniform(0.78, 0.96), 4)
            lstm_score = round(random.uniform(0.82, 0.99), 4)
        else:
            # Simulate a safe baseline URL environment
            cnn_score = round(random.uniform(0.01, 0.25), 4)
            lstm_score = round(random.uniform(0.02, 0.19), 4)

        # Average out the outputs for the overall system confidence score
        confidence_score = round((cnn_score + lstm_score) / 2, 4)
        is_phishing = confidence_score >= 0.50

        # Simulate dynamic XAI character-level attention tracking matrix
        # Highlights every character index score for our UI rendering step later
        attention_map = {}
        for idx, char in enumerate(url):
            # Assign higher weight scores to suspicious symbols/characters if flagged
            if char in ['-', '@', '.', '_'] or (has_suspicious_keyword and char.isalnum()):
                attention_map[f"char_{idx}_{char}"] = round(random.uniform(0.65, 0.98), 4)
            else:
                attention_map[f"char_{idx}_{char}"] = round(random.uniform(0.01, 0.35), 4)

        return {
            "is_phishing": is_phishing,
            "confidence_score": confidence_score,
            "cnn_score": cnn_score,
            "lstm_score": lstm_score,
            "attention_weights": attention_map
        }

# Instantiate a single operational singleton instance to keep memory footprints clean
url_predictor = URLPredictor()