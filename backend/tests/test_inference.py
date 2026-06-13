# test_inference.py
import sys
import os

# Ensure the backend app directory is visible to Python path execution
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.dl_inference.predictor import url_predictor

def run_system_diagnostic():
    print("🔬 INITIALIZING DEEP LEARNING MODEL DIAGNOSTIC CHECK...")
    
    # Check if assets are loaded properly
    if url_predictor.model is None or url_predictor.tokenizer is None:
        print("❌ CRITICAL: Model or Tokenizer failed to load into memory! Check file paths.")
        return

    print("✅ SUCCESS: 1D CNN Model and Character Tokenizer successfully loaded.\n")

    # Define a clean matrix of test cases (Mix of safe, phishing, and edge cases)
    test_urls = [
        "https://www.hec.gov.pk/",
        "http://paypa1.com/signin/verify?token=abc123",
        "https://portal.azure.com/#home",
        "http://g00gle-security.com/account/confirm",
        "https://colab.research.google.com/drive/1abc123",
        "http://netflix.com.account-verify.xyz/login"
    ]

    print(f"{'TARGET URL':<50} | {'CNN SCORE':<10} | {'DIAGNOSIS':<10}")
    print("-" * 76)

    for url in test_urls:
        try:
            # Execute inference pass
            result = url_predictor.analyze_textual_url(url)
            
            cnn_score = result["cnn_score"]
            verdict = "PHISHING" if result["is_phishing"] else "SAFE"
            
            print(f"{url:<50} | {cnn_score:<10.4f} | {verdict:<10}")
            
            # Print a snippet of attention mapping keys to verify UI alignment
            sample_keys = list(result["attention_weights"].keys())[:3]
            print(f"   ↳ 📋 Attention Sample: { {k: result['attention_weights'][k] for k in sample_keys} }...\n")
            
        except Exception as e:
            print(f"❌ Error scanning {url}: {str(e)}")

if __name__ == "__main__":
    run_system_diagnostic()