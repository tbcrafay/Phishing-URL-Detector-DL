# test_inference.py
import sys
import os
import pytest
from typing import Dict, Any

# Ensure the backend app directory is visible to Python path execution
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.dl_inference.predictor import url_predictor


class TestEnsemblePredictor:
    """Comprehensive test suite for the ensemble predictor (CNN + BiLSTM)."""

    def test_model_initialization(self):
        """Verify that CNN and BiLSTM models and tokenizers are loaded."""
        assert url_predictor.cnn is not None, "CNN inference engine not initialized"
        assert url_predictor.lstm is not None, "BiLSTM inference engine not initialized"
        assert url_predictor.cnn_tokenizer is not None, "CNN tokenizer not initialized"
        assert url_predictor.lstm_tokenizer is not None, "BiLSTM tokenizer not initialized"

    def test_ensemble_response_structure(self):
        """Verify that analyze_textual_url returns all required keys."""
        result = url_predictor.analyze_textual_url("https://www.google.com")
        
        required_keys = ["is_phishing", "confidence_score", "cnn_score", "lstm_score", "attention_weights"]
        for key in required_keys:
            assert key in result, f"Missing key: {key}"

    def test_ensemble_score_types(self):
        """Verify that all scores are floats and within valid range (0.0 to 1.0)."""
        result = url_predictor.analyze_textual_url("https://www.example.com")
        
        assert isinstance(result["cnn_score"], float), "cnn_score must be float"
        assert isinstance(result["lstm_score"], float), "lstm_score must be float"
        assert isinstance(result["confidence_score"], float), "confidence_score must be float"
        
        assert 0.0 <= result["cnn_score"] <= 1.0, f"cnn_score out of range: {result['cnn_score']}"
        assert 0.0 <= result["lstm_score"] <= 1.0, f"lstm_score out of range: {result['lstm_score']}"
        assert 0.0 <= result["confidence_score"] <= 1.0, f"confidence_score out of range: {result['confidence_score']}"

    def test_ensemble_calculation(self):
        """Verify that confidence_score is the average of CNN and LSTM scores."""
        result = url_predictor.analyze_textual_url("https://www.test.com")
        
        expected_confidence = round((result["cnn_score"] + result["lstm_score"]) / 2.0, 4)
        assert result["confidence_score"] == expected_confidence, \
            f"Confidence {result['confidence_score']} != expected {expected_confidence}"

    def test_phishing_threshold(self):
        """Verify that is_phishing is True when confidence >= 0.5, False otherwise."""
        # Test legitimate domain (should score low)
        result_safe = url_predictor.analyze_textual_url("https://www.google.com")
        assert result_safe["is_phishing"] == (result_safe["confidence_score"] >= 0.5)
        
        # Test suspicious domain (may score high)
        result_phish = url_predictor.analyze_textual_url("http://g00gle-security.com/confirm")
        assert result_phish["is_phishing"] == (result_phish["confidence_score"] >= 0.5)

    def test_attention_weights_structure(self):
        """Verify attention_weights maps char indices to valid weights."""
        result = url_predictor.analyze_textual_url("https://test.com")
        
        assert isinstance(result["attention_weights"], dict), "attention_weights must be a dict"
        assert len(result["attention_weights"]) == len("https://test.com"), \
            "attention_weights should have one entry per character"
        
        # Verify each weight is in valid range
        for key, weight in result["attention_weights"].items():
            assert isinstance(weight, float), f"Attention weight {key} is not float"
            assert 0.0 <= weight <= 1.0, f"Attention weight {key} out of range: {weight}"
            # Verify key format: char_index_char
            assert key.startswith("char_"), f"Invalid attention key format: {key}"

    def test_diverse_url_set(self):
        """Test predictor on a diverse mix of URLs (legitimate, phishing, edge cases)."""
        test_cases = [
            ("https://www.google.com", "legitimate"),
            ("https://www.github.com/login", "legitimate"),
            ("http://paypa1.com/signin", "likely_phishing"),
            ("http://g00gle-security.com/account", "likely_phishing"),
            ("https://example.com:8080/path?query=1&other=2", "edge_case_params"),
            ("http://test.co.uk/page", "edge_case_subdomain"),
        ]
        
        for url, category in test_cases:
            result = url_predictor.analyze_textual_url(url)
            print(f"✓ {category:<20} | {url:<45} | Phishing: {result['is_phishing']:<5} | Confidence: {result['confidence_score']:.4f}")
            
            # Verify all required fields are present
            assert all(k in result for k in ["is_phishing", "confidence_score", "cnn_score", "lstm_score", "attention_weights"])

    def test_url_preprocessing_consistency(self):
        """Verify that URL preprocessing (lowercasing, stripping) is consistent."""
        url1 = "https://EXAMPLE.COM"
        url2 = "https://example.com"
        url3 = "  https://example.com  "
        
        result1 = url_predictor.analyze_textual_url(url1)
        result2 = url_predictor.analyze_textual_url(url2)
        result3 = url_predictor.analyze_textual_url(url3)
        
        # CNN/LSTM should produce identical scores for preprocessed variants
        assert result1["cnn_score"] == result2["cnn_score"], "Case sensitivity not handled"
        assert result1["lstm_score"] == result2["lstm_score"], "Case sensitivity not handled"
        assert result2["cnn_score"] == result3["cnn_score"], "Whitespace stripping not handled"

    def test_long_url_handling(self):
        """Verify predictor handles long URLs gracefully (beyond max_len)."""
        long_url = "https://example.com/" + ("a" * 200)
        result = url_predictor.analyze_textual_url(long_url)
        
        # Should not crash and should return valid scores
        assert isinstance(result["confidence_score"], float)
        assert 0.0 <= result["confidence_score"] <= 1.0
        print(f"✓ Long URL (len={len(long_url)}) handled: confidence={result['confidence_score']:.4f}")

    def test_special_characters_handling(self):
        """Verify predictor handles special characters in URLs."""
        special_urls = [
            "https://test.com/?param=value&other=123",
            "https://test.com/#anchor",
            "https://user:pass@test.com/",
            "https://test.com/path/with/multiple/slashes",
        ]
        
        for url in special_urls:
            result = url_predictor.analyze_textual_url(url)
            assert isinstance(result["confidence_score"], float)
            assert 0.0 <= result["confidence_score"] <= 1.0
            print(f"✓ Special chars: {url:<50} | Confidence: {result['confidence_score']:.4f}")

    def test_cnn_lstm_independence(self):
        """Verify that CNN and LSTM produce different scores (they shouldn't always be identical)."""
        # Test multiple URLs to check that models produce varying outputs
        urls = [
            "https://www.google.com",
            "http://suspicious-login.net/verify",
            "https://github.com",
        ]
        
        different_scores = False
        for url in urls:
            result = url_predictor.analyze_textual_url(url)
            if result["cnn_score"] != result["lstm_score"]:
                different_scores = True
                break
        
        # At least one URL should show different CNN and LSTM scores (models are independent)
        assert different_scores, "CNN and LSTM should produce different scores (are they identical?)"
        print("✓ CNN and LSTM produce independent predictions")


def run_system_diagnostic():
    """Legacy diagnostic function for backwards compatibility."""
    print("🔬 INITIALIZING DEEP LEARNING MODEL DIAGNOSTIC CHECK...")
    print("✅ SUCCESS: Ensemble CNN + BiLSTM Model and Tokenizers successfully loaded.\n")

    test_urls = [
        "https://www.hec.gov.pk/",
        "http://paypa1.com/signin/verify?token=abc123",
        "https://portal.azure.com/#home",
        "http://g00gle-security.com/account/confirm",
        "https://colab.research.google.com/drive/1abc123",
        "http://netflix.com.account-verify.xyz/login"
    ]

    print(f"{'TARGET URL':<50} | {'CNN':<8} | {'LSTM':<8} | {'CONF':<8} | {'VERDICT':<10}")
    print("-" * 90)

    for url in test_urls:
        try:
            result = url_predictor.analyze_textual_url(url)
            verdict = "PHISHING" if result["is_phishing"] else "SAFE"
            print(f"{url:<50} | {result['cnn_score']:<8.4f} | {result['lstm_score']:<8.4f} | {result['confidence_score']:<8.4f} | {verdict:<10}")
            
        except Exception as e:
            print(f"❌ Error scanning {url}: {str(e)}")


if __name__ == "__main__":
    # Run legacy diagnostic
    run_system_diagnostic()
    print("\n" + "="*90)
    print("To run full pytest suite: pytest backend/tests/test_inference.py -v")
    print("="*90)