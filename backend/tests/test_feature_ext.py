#!/usr/bin/env python3
"""
URL Feature Extraction Test Suite
Tests the feature extraction pipeline that preprocesses URLs
before deep learning model inference
"""

import sys
import os

# Proper path handling - go up two levels to backend, then import
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, backend_path)

from app.dl_inference.url_feature_extractor import URLFeatureExtractor

def test_feature_extraction():
    """Test URL feature extraction pipeline"""
    
    test_cases = [
        # (url, expected_is_phishing, description)
        ("https://www.paypal.com", False, "Legitimate PayPal - in domain trust database"),
        ("https://www.paypaI.com", True, "Phishing PayPal typo - pattern recognition"),
        ("https://www.google.com", False, "Legitimate Google - in domain trust database"),
        ("https://goog1e.com", True, "Phishing Google typo - pattern recognition"),
        ("https://www.youtube.com", False, "Legitimate YouTube - in domain trust database"),
        ("https://192.168.1.1", True, "Suspicious IP address - structure anomaly"),
        ("https://example.com?redirect=https://paypal.com", True, "Suspicious redirect param - structure anomaly"),
        ("https://bank.com/login?password=", True, "Suspicious login param - structure anomaly"),
        ("https://github.com", False, "Legitimate GitHub - in domain trust database"),
        ("https://example.com", None, "Unknown domain - routes to DL model"),
    ]
    
    print("\n" + "="*70)
    print("🧪 URL FEATURE EXTRACTION TEST SUITE")
    print("="*70 + "\n")
    
    passed = 0
    failed = 0
    
    for url, expected_phishing, description in test_cases:
        result = URLFeatureExtractor.extract_features(url)
        
        is_phishing = result['is_phishing']
        bypass = result['bypass_model']
        confidence = result['confidence']
        reason = result['reason']
        detection_type = result['detection_type']
        
        # Determine if test passed
        if expected_phishing is None:
            # Should route to DL model
            test_passed = not bypass
            status = "✅ PASS" if test_passed else "❌ FAIL"
        else:
            # Should make a decision via heuristics
            test_passed = bypass and (is_phishing == expected_phishing)
            status = "✅ PASS" if test_passed else "❌ FAIL"
        
        if test_passed:
            passed += 1
        else:
            failed += 1
        
        print(f"{status} | {description}")
        print(f"     URL: {url}")
        print(f"     Expected: {'Phishing' if expected_phishing else 'Legitimate' if expected_phishing is False else 'Routes to DL'} | " +
              f"Got: {'Phishing' if is_phishing else 'Legitimate' if is_phishing is not None else 'Requires DL Model'}")
        if confidence is not None:
            print(f"     Confidence: {confidence:.2f}")
        print(f"     Detection: {detection_type} | Bypass: {bypass}")
        print(f"     Reason: {reason}\n")
    
    print("="*70)
    print(f"RESULTS: {passed} passed, {failed} failed out of {len(test_cases)}")
    print("="*70 + "\n")
    
    return failed == 0


def show_feature_database():
    """Display current feature database (domain trust database)"""
    print("\n" + "="*70)
    print("📊 DOMAIN TRUST DATABASE")
    print("="*70 + "\n")
    
    domains = sorted(URLFeatureExtractor.known_safe_domains)
    for i, domain in enumerate(domains, 1):
        print(f"{i:2d}. {domain}")
    
    print(f"\nTotal: {len(domains)} trusted domains")
    print("\n" + "="*70 + "\n")


def show_phishing_patterns():
    """Display known phishing patterns (from training data analysis)"""
    print("\n" + "="*70)
    print("⚠️  HIGH-CONFIDENCE PHISHING PATTERNS")
    print("="*70 + "\n")
    
    for i, pattern in enumerate(URLFeatureExtractor.high_confidence_phishing_indicators, 1):
        print(f"{i}. {pattern}")
    
    print(f"\nTotal: {len(URLFeatureExtractor.high_confidence_phishing_indicators)} patterns")
    print("\n" + "="*70 + "\n")


if __name__ == "__main__":
    print("\n")
    print("   ╔════════════════════════════════════════════════════════════════╗")
    print("   ║  URL FEATURE EXTRACTION - VALIDATION TEST                    ║")
    print("   ║  Pipeline validation before inference 🚀                      ║")
    print("   ╚════════════════════════════════════════════════════════════════╝")
    print()
    
    try:
        # Show configuration
        show_feature_database()
        show_phishing_patterns()
        
        # Run tests
        success = test_feature_extraction()
        
        if success:
            print("\n✅ All feature extraction tests PASSED! Ready for demo.\n")
            sys.exit(0)
        else:
            print("\n⚠️  Some tests FAILED. Please review the feature extractor configuration.\n")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n❌ ERROR: {e}\n")
        import traceback
        traceback.print_exc()
        sys.exit(1)
